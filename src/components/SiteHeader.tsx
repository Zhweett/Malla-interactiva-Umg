import { CAREER_LIST, INK, isCareerId, type CareerId } from "@/data/curriculum";
import { careerRoute, Link, navigate } from "@/lib/router";

const views = [
  { id: "malla", label: "Malla" },
  { id: "avance", label: "Avance" },
] as const;

interface SiteHeaderProps {
  careerId: CareerId;
  view: typeof views[number]["id"];
  title: string;
  note: string;
}

export default function SiteHeader({ careerId, view, title, note }: SiteHeaderProps) {
  return (
    <header className="flex flex-none flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 text-white sm:px-6" style={{ background: INK }}>
      <div className="min-w-0">
        <Link to="/" className="inline-flex min-h-8 items-center text-sm font-semibold text-white/85 hover:underline">
          Malla interactiva UMG
        </Link>
        <h1 className="text-xl font-bold leading-tight">{title}</h1>
        <p className="mt-1 text-sm text-white/80">{note}</p>
      </div>
      <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
        <label className="min-w-0 flex-1 sm:flex-none">
          <span className="sr-only">Cambiar carrera</span>
          <select
            value={careerId}
            onChange={(event) => {
              const id = event.target.value;
              if (isCareerId(id)) navigate(careerRoute(id, view));
            }}
            className="app-select w-full min-h-11 max-w-full rounded-md border border-white/35 bg-[#174354] pl-2 pr-7 text-sm text-white"
          >
            {CAREER_LIST.map((career) => (
              <option key={career.id} value={career.id}>{career.shortName}</option>
            ))}
          </select>
        </label>
        <nav aria-label="Secciones de la carrera" className="flex shrink-0 gap-1">
          {views.map((tab) => (
            <Link
              key={tab.id}
              to={careerRoute(careerId, tab.id)}
              aria-current={view === tab.id ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-md px-2.5 text-sm font-bold sm:px-3 ${view === tab.id ? "bg-white text-[#1a4c5e]" : "text-white hover:bg-white/10"}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
