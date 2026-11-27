import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { CareerId } from "@/data/curriculum";

// Router mínimo sobre la History API.
// `import.meta.env.BASE_URL` importa porque Vite puede servir el sitio bajo un
// prefijo (por ejemplo en la vista previa de Figma Make).

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

const listeners = new Set<() => void>();

export type PageView = "landing" | "malla" | "avance";

export interface ParsedRoute {
  page: PageView;
  careerId: CareerId;
}

/** Convierte una ruta de la app ("/sistemas/malla") en una URL real del navegador. */
export function hrefFor(route: string): string {
  return `${BASE}${route}` || "/";
}

/** Lee la ruta actual de la app, descontando el prefijo base. */
export function currentRoute(): string {
  let path = window.location.pathname;
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  path = path.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/** Resuelve qué vista y carrera corresponden a una ruta dada. */
export function parseRoute(route: string): ParsedRoute {
  if (route === "/") return { page: "landing", careerId: "electronica" };
  if (route === "/malla" || route === "/electronica" || route === "/electronica/malla") {
    return { page: "malla", careerId: "electronica" };
  }
  if (route === "/avance" || route === "/electronica/avance") {
    return { page: "avance", careerId: "electronica" };
  }
  if (route === "/sistemas" || route === "/sistemas/malla") {
    return { page: "malla", careerId: "sistemas" };
  }
  if (route === "/sistemas/avance") {
    return { page: "avance", careerId: "sistemas" };
  }
  return { page: "malla", careerId: "electronica" };
}

export function careerRoute(careerId: CareerId, view: "malla" | "avance"): string {
  return `/${careerId}/${view}`;
}

export function navigate(route: string) {
  const url = hrefFor(route);
  if (window.location.pathname !== url) {
    window.history.pushState(null, "", url);
    for (const listener of listeners) listener();
  }
  window.scrollTo(0, 0);
}

export function useRoute(): string {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const sync = () => setRoute(currentRoute());
    listeners.add(sync);
    window.addEventListener("popstate", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return route;
}

interface LinkProps {
  to: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Link({ to, className, style, children }: LinkProps) {
  return (
    <a
      href={hrefFor(to)}
      className={className}
      style={style}
      onClick={(event) => {
        // Respeta cmd/ctrl+click, click de rueda y target del navegador.
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
