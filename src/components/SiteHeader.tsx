import { CAREER_LIST, INK, type CareerId } from "@/data/curriculum";
import { careerRoute, Link } from "@/lib/router";

const TABS: { view: "malla" | "avance"; label: string }[] = [
  { view: "malla", label: "Malla" },
  { view: "avance", label: "Avance" },
];

interface SiteHeaderProps {
  careerId: CareerId;
  view: "malla" | "avance";
  title: string;
  note: string;
  /** Porcentaje de créditos aprobados; se muestra sólo si ya hay avance. */
  percent?: number;
}

export default function SiteHeader({ careerId, view, title, note, percent }: SiteHeaderProps) {
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

      <div className="ml-auto flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center rounded p-0.5"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Seleccionar carrera"
        >
          {CAREER_LIST.map((career) => {
            const active = career.id === careerId;
            return (
              <Link
                key={career.id}
                to={careerRoute(career.id, view)}
                className="text-[11px] font-bold px-2.5 py-1 rounded transition-colors no-underline"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.65)",
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                }}
              >
                {career.shortName}
              </Link>
            );
          })}
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map((tab) => {
            const active = view === tab.view;
            return (
              <Link
                key={tab.view}
                to={careerRoute(careerId, tab.view)}
                className="text-xs font-bold px-3 py-1.5 rounded transition-colors no-underline"
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
      </div>
    </header>
  );
}
