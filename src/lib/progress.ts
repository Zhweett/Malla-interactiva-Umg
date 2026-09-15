import { useCallback, useEffect, useState } from "react";
import { courseById } from "@/data/curriculum";

const STORAGE_KEY = "malla-electronica:aprobadas:v1";

function readStored(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    // Descarta ids que ya no existen en el plan (por si la malla cambia).
    return new Set(parsed.filter((id): id is string => typeof id === "string" && courseById.has(id)));
  } catch {
    return new Set();
  }
}

/**
 * Materias aprobadas, guardadas sólo en este navegador.
 * No hay cuentas ni servidor: el avance es privado por dispositivo.
 */
export function useProgress() {
  const [approved, setApproved] = useState<Set<string>>(() => new Set<string>());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setApproved(readStored());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...approved]));
    } catch {
      // Almacenamiento lleno o bloqueado: el avance sigue vivo en memoria.
    }
  }, [approved, loaded]);

  // Sincroniza entre pestañas abiertas del mismo sitio.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setApproved(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setApproved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setMany = useCallback((ids: string[], value: boolean) => {
    setApproved((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (value) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => setApproved(new Set()), []);

  return { approved, loaded, toggle, setMany, reset };
}
