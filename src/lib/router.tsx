import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Router mínimo sobre la History API: sólo hay dos rutas y añadir una
// dependencia completa de routing no se justifica.
// `import.meta.env.BASE_URL` importa porque Vite puede servir el sitio bajo un
// prefijo (por ejemplo en la vista previa de Figma Make).

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

const listeners = new Set<() => void>();

/** Convierte una ruta de la app ("/avance") en una URL real del navegador. */
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
