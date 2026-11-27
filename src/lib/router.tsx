import { useEffect, useState, type AnchorHTMLAttributes } from "react";
import { DEFAULT_CAREER, isCareerId, type CareerId } from "@/data/curriculum";

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
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) path = path.slice(BASE.length);
  path = path.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/** Resuelve qué vista y carrera corresponden a una ruta dada. */
export function parseRoute(route: string): ParsedRoute {
  if (route === "/malla" || route === "/avance") {
    return { page: route === "/malla" ? "malla" : "avance", careerId: DEFAULT_CAREER };
  }
  const [, career, view, ...rest] = route.split("/");
  if (career && isCareerId(career) && rest.length === 0) {
    if (!view || view === "malla") return { page: "malla", careerId: career };
    if (view === "avance") return { page: "avance", careerId: career };
  }
  return { page: "landing", careerId: DEFAULT_CAREER };
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

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
}

export function Link({ to, children, onClick, target, ...props }: LinkProps) {
  return (
    <a
      {...props}
      href={hrefFor(to)}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || (target && target !== "_self")) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
