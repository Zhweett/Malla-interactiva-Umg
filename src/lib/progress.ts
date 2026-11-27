import { useCallback, useEffect, useState } from "react";
import { getCareerPlan, type CareerId, type Course } from "@/data/curriculum";

export const PASSING = 300;
export const MAX_GRADE = 500;
export const MAX_ATTEMPTS = 4;

// grades: Record<courseId, number[]> — ordered list of attempts (max 4)
interface ProgressData {
  careerId: CareerId;
  approved: Set<string>;
  grades: Record<string, number[]>;
}

const storageKeys = (prefix: string) => ({
  approvedKey: `${prefix}:aprobadas:v1`,
  gradesKey: `${prefix}:notas:v2`,
});

function readStored(approvedKey: string, courseById: Map<string, Course>): Set<string> {
  try {
    const raw = window.localStorage.getItem(approvedKey);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string" && courseById.has(id)));
  } catch {
    return new Set();
  }
}

function readGrades(gradesKey: string, courseById: Map<string, Course>): Record<string, number[]> {
  try {
    const raw = window.localStorage.getItem(gradesKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const result: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v) && courseById.has(k)) {
        const attempts = v.filter((n): n is number => typeof n === "number" && n >= 0 && n <= MAX_GRADE);
        if (attempts.length > 0) result[k] = attempts.slice(0, MAX_ATTEMPTS);
      }
    }
    return result;
  } catch {
    return {};
  }
}

function isApproved(attempts: number[]): boolean {
  return attempts.some((n) => n >= PASSING);
}

export function useProgress(careerId: CareerId) {
  const plan = getCareerPlan(careerId);
  const { approvedKey, gradesKey } = storageKeys(plan.storagePrefix);

  const [data, setData] = useState<ProgressData>(() => ({
    careerId,
    approved: new Set(),
    grades: {},
  }));
  const [loadedCareer, setLoadedCareer] = useState<CareerId | null>(null);

  useEffect(() => {
    const activePlan = getCareerPlan(careerId);
    const keys = storageKeys(activePlan.storagePrefix);
    setData({
      careerId,
      approved: readStored(keys.approvedKey, activePlan.courseById),
      grades: readGrades(keys.gradesKey, activePlan.courseById),
    });
    setLoadedCareer(careerId);
  }, [careerId]);

  useEffect(() => {
    // Evita sobrescribir el almacenamiento de la nueva carrera antes de hidratarla.
    if (loadedCareer !== careerId || data.careerId !== careerId) return;
    try { window.localStorage.setItem(approvedKey, JSON.stringify([...data.approved])); } catch { /* noop */ }
    try { window.localStorage.setItem(gradesKey, JSON.stringify(data.grades)); } catch { /* noop */ }
  }, [data, loadedCareer, careerId, approvedKey, gradesKey]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === approvedKey || e.key === gradesKey) {
        setData((prev) => ({
          careerId,
          approved: e.key === approvedKey ? readStored(approvedKey, plan.courseById) : prev.approved,
          grades: e.key === gradesKey ? readGrades(gradesKey, plan.courseById) : prev.grades,
        }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [careerId, approvedKey, gradesKey, plan]);

  const toggle = useCallback((id: string) => {
    setData((prev) => {
      const approved = new Set(prev.approved);
      if (approved.has(id)) approved.delete(id); else approved.add(id);
      return { ...prev, approved };
    });
  }, []);

  const setMany = useCallback((ids: string[], value: boolean) => {
    setData((prev) => {
      const approved = new Set(prev.approved);
      for (const id of ids) { if (value) approved.add(id); else approved.delete(id); }
      return { ...prev, approved };
    });
  }, []);

  // Añade o edita un intento. index = posición (0-based). nota = null → elimina ese intento y los siguientes.
  const setAttempt = useCallback((id: string, index: number, nota: number | null) => {
    setData((prev) => {
      const grades = { ...prev.grades };
      const approved = new Set(prev.approved);
      const current = grades[id] ? [...grades[id]] : [];

      if (nota === null) {
        current.splice(index);
      } else {
        current[index] = nota;
        current.splice(index + 1);
      }

      if (current.length === 0) {
        delete grades[id];
        approved.delete(id);
      } else {
        grades[id] = current;
        if (isApproved(current)) approved.add(id); else approved.delete(id);
      }
      return { ...prev, approved, grades };
    });
  }, []);

  const reset = useCallback(() => {
    setData({ careerId, approved: new Set(), grades: {} });
  }, [careerId]);

  const loaded = loadedCareer === careerId;
  return {
    approved: data.careerId === careerId ? data.approved : new Set<string>(),
    grades: data.careerId === careerId ? data.grades : {},
    loaded,
    toggle,
    setMany,
    setAttempt,
    reset,
  };
}
