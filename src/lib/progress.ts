import { useCallback, useEffect, useState } from "react";
import { courseById } from "@/data/curriculum";

const STORAGE_KEY = "malla-electronica:aprobadas:v1";
const GRADES_KEY  = "malla-electronica:notas:v2"; // v2: array of attempts

export const PASSING   = 300;
export const MAX_GRADE = 500;
export const MAX_ATTEMPTS = 4;

// grades: Record<courseId, number[]> — ordered list of attempts (max 4)
interface ProgressData {
  approved: Set<string>;
  grades: Record<string, number[]>;
}

function readStored(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string" && courseById.has(id)));
  } catch {
    return new Set();
  }
}

function readGrades(): Record<string, number[]> {
  try {
    const raw = window.localStorage.getItem(GRADES_KEY);
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

export function useProgress() {
  const [data, setData] = useState<ProgressData>(() => ({ approved: new Set(), grades: {} }));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData({ approved: readStored(), grades: readGrades() });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...data.approved])); } catch { /* noop */ }
    try { window.localStorage.setItem(GRADES_KEY, JSON.stringify(data.grades)); } catch { /* noop */ }
  }, [data, loaded]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === GRADES_KEY) {
        setData((prev) => ({
          approved: e.key === STORAGE_KEY ? readStored() : prev.approved,
          grades: e.key === GRADES_KEY ? readGrades() : prev.grades,
        }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
        // Elimina desde index en adelante
        current.splice(index);
      } else {
        current[index] = nota;
        // Elimina intentos posteriores al editado (por consistencia)
        current.splice(index + 1);
      }

      if (current.length === 0) {
        delete grades[id];
        approved.delete(id);
      } else {
        grades[id] = current;
        if (isApproved(current)) approved.add(id); else approved.delete(id);
      }
      return { approved, grades };
    });
  }, []);

  const reset = useCallback(() => {
    setData({ approved: new Set(), grades: {} });
  }, []);

  return { approved: data.approved, grades: data.grades, loaded, toggle, setMany, setAttempt, reset };
}
