import { INK } from "@/data/curriculum";
import { Link, useRoute } from "@/lib/router";

const TABS = [
  { route: "/malla", label: "Malla" },
  { route: "/avance", label: "Avance" },
];

interface SiteHeaderProps {
  title: string;
  note: string;
  /** Porcentaje de créditos aprobados; se muestra sólo si ya hay avance. */
  percent?: number;
}

export default function SiteHeader({ title, note, percent }: SiteHeaderProps) {
  const route = useRoute();

  return (
    <header
      className="flex-none px-6 py-3 flex items-center gap-x-3 gap-y-2 flex-wrap"
      style={{ background: INK }}
    >
      <Link to="/" className="text-white font-bold text-base tracking-tight leading-none no-underline">
        {title}
      </Link>
      <span className="text-white/40 text-xs font-mono">— {note}</span>

      {percent !== undefined && (
        <span className="text-[11px] font-bold text-white/85 border border-white/25 rounded-full px-2 py-0.5 leading-none">
          {percent}% aprobado
        </span>
      )}

      <nav className="ml-auto flex items-center gap-1">
        {TABS.map((tab) => {
          const active = route === tab.route;
          return (
            <Link
              key={tab.route}
              to={tab.route}
              className="text-xs font-bold px-3 py-1.5 rounded transition-colors"
              style={{
                color: active ? INK : "rgba(255,255,255,0.7)",
                background: active ? "#fff" : "transparent",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
