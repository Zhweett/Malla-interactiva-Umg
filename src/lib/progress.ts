import { useCallback, useEffect, useRef, useState } from "react";
import { getCareerPlan, type CareerId, type CareerPlan } from "@/data/curriculum";

export const PASSING = 61;
export const MAX_GRADE = 100;
const LEGACY_MAX_GRADE = 500;
export const MAX_ATTEMPTS = 4;

interface ProgressData {
  approved: Set<string>;
  grades: Record<string, number[]>;
  legacyGrades: Record<string, number[]>;
}

const storageKeys = (prefix: string) => ({
  progress: `${prefix}:avance:v1`,
  approved: `${prefix}:aprobadas:v1`,
  grades: `${prefix}:notas:v2`,
});

const emptyProgress = (): ProgressData => ({ approved: new Set(), grades: {}, legacyGrades: {} });

function parse(raw: string | null): unknown {
  try { return raw === null ? null : JSON.parse(raw); }
  catch { return null; }
}

function validGrade(value: unknown, max = MAX_GRADE): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max;
}

function normalizeGrades(raw: unknown, plan: CareerPlan, max: number): Record<string, number[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).flatMap(([id, values]) => {
    if (!plan.courseById.has(id) || !Array.isArray(values)) return [];
    const attempts = values.filter((value) => validGrade(value, max)).slice(0, MAX_ATTEMPTS);
    return attempts.length ? [[id, attempts]] : [];
  }));
}

function normalize(approved: unknown, grades: unknown, legacyGrades: unknown, plan: CareerPlan): ProgressData {
  return {
    approved: new Set(Array.isArray(approved) ? approved.filter((id) => typeof id === "string" && plan.courseById.has(id)) : []),
    grades: normalizeGrades(grades, plan, MAX_GRADE),
    legacyGrades: normalizeGrades(legacyGrades, plan, LEGACY_MAX_GRADE),
  };
}

function readProgress(plan: CareerPlan): ProgressData | null {
  const keys = storageKeys(plan.storagePrefix);
  try {
    const raw = window.localStorage.getItem(keys.progress);
    if (raw !== null) {
      const value = parse(raw) as Partial<ProgressData> | null;
      return normalize(value?.approved, value?.grades, value?.legacyGrades, plan);
    }
    return normalize(parse(window.localStorage.getItem(keys.approved)), null, parse(window.localStorage.getItem(keys.grades)), plan);
  } catch {
    return null;
  }
}

function saveProgress(plan: CareerPlan, data: ProgressData): boolean {
  const keys = storageKeys(plan.storagePrefix);
  try {
    const storage = window.localStorage;
    storage.setItem(keys.progress, JSON.stringify({ ...data, approved: [...data.approved] }));
    storage.removeItem(keys.approved);
    storage.removeItem(keys.grades);
    return true;
  } catch {
    return false;
  }
}

// Las páginas que usan este hook se montan con la carrera como key.
export function useProgress(careerId: CareerId) {
  const plan = getCareerPlan(careerId);
  const [data, setData] = useState(() => readProgress(plan) ?? emptyProgress());
  const current = useRef(data);
  const unsaved = useRef(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const keys = Object.values(storageKeys(plan.storagePrefix));
    const sync = (event: StorageEvent) => {
      if (unsaved.current || (event.key !== null && !keys.includes(event.key))) return;
      const next = readProgress(plan);
      if (next) {
        current.current = next;
        setData(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [plan]);

  const update = useCallback((change: (previous: ProgressData) => ProgressData) => {
    const previous = unsaved.current ? current.current : readProgress(plan) ?? current.current;
    const next = change(previous);
    current.current = next;
    if (next !== previous) {
      unsaved.current = !saveProgress(plan, next);
      setSaveError(unsaved.current);
    }
    setData(next);
  }, [plan]);

  const toggle = (id: string) => {
    if (!plan.courseById.has(id)) return;
    update((previous) => {
      const approved = new Set(previous.approved);
      if (approved.has(id)) approved.delete(id); else approved.add(id);
      return { ...previous, approved };
    });
  };

  const setMany = (ids: string[], value: boolean) => {
    update((previous) => {
      const approved = new Set(previous.approved);
      for (const id of ids) {
        if (!plan.courseById.has(id)) continue;
        if (value) approved.add(id); else approved.delete(id);
      }
      return { ...previous, approved };
    });
  };

  // Eliminar un intento elimina también los posteriores, para mantener la secuencia.
  const setAttempt = (id: string, index: number, grade: number | null) => {
    if (!plan.courseById.has(id) || !Number.isInteger(index) || index < 0 || index >= MAX_ATTEMPTS) return;
    if (grade !== null && !validGrade(grade)) return;
    update((previous) => {
      const attempts = [...(previous.grades[id] ?? [])];
      if (index > attempts.length || (grade === null && index === attempts.length)) return previous;
      const grades = { ...previous.grades };
      const approved = new Set(previous.approved);
      if (grade === null) attempts.splice(index);
      else attempts[index] = grade;

      if (attempts.length) grades[id] = attempts;
      else delete grades[id];
      if (attempts.some((value) => value >= PASSING)) approved.add(id);
      else approved.delete(id);
      return { ...previous, approved, grades };
    });
  };

  return { ...data, saveError, toggle, setMany, setAttempt, reset: () => update(emptyProgress) };
}
