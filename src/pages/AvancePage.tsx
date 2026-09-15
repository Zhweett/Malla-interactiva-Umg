import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  allCourses,
  courseById,
  creditsOf,
  INK,
  prereqsOf,
  semesters,
  TOTAL_CREDITS,
  YEAR_COLORS,
} from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { Link } from "@/lib/router";

const GREEN = "#1a7a3a";
const AMBER = "#d97706";
const PURPLE = "#6b1f82";

function Meter({ value, total, color = INK }: { value: number; total: number; color?: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(26,76,94,0.12)" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color, transition: "width 0.25s ease-out" }}
      />
    </div>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border rounded px-4 py-3 bg-white" style={{ borderColor: "#e0e0e0" }}>
      <div className="text-[10.5px] uppercase tracking-wider font-bold" style={{ color: "rgba(26,76,94,0.6)" }}>
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums leading-tight mt-1" style={{ color: INK }}>
        {value}
      </div>
      <div className="text-[11px] text-gray-500 mt-0.5">{hint}</div>
    </div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.4 L4.6 9 L10 3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AvancePage() {
  const { approved, loaded, toggle, setMany, reset } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const approvedCredits = creditsOf(approved);
  const percent = Math.round((approvedCredits / TOTAL_CREDITS) * 100);

  const missingPrereqs = (id: string) => prereqsOf(id).filter((p) => !approved.has(p));

  const available = allCourses.filter((c) => !approved.has(c.id) && missingPrereqs(c.id).length === 0);
  const irregular = allCourses.filter((c) => approved.has(c.id) && missingPrereqs(c.id).length > 0);
  const completeSemesters = semesters.filter((s) => s.courses.every((c) => approved.has(c.id)));

  return (
    <div className="size-full flex flex-col bg-white overflow-hidden font-sans">
      <SiteHeader
        title="Seguimiento de Avance"
        note="Ingeniería Electrónica · guardado en este navegador"
        percent={percent}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Resumen */}
          <section className="mb-6">
            <div className="flex items-end justify-between gap-4 mb-2 flex-wrap">
              <div>
                <span className="text-5xl font-bold tabular-nums leading-none" style={{ color: INK }}>
                  {percent}
                </span>
                <span className="text-xl font-bold ml-1" style={{ color: "rgba(26,76,94,0.55)" }}>
                  % del plan
                </span>
              </div>
              <span className="text-[11px] text-gray-500 tabular-nums">
                {approvedCredits} de {TOTAL_CREDITS} créditos
              </span>
            </div>
            <Meter value={approvedCredits} total={TOTAL_CREDITS} />
          </section>

          <section className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            <StatTile
              label="Materias aprobadas"
              value={`${approved.size}/${allCourses.length}`}
              hint={`${allCourses.length - approved.size} por cursar`}
            />
            <StatTile
              label="Disponibles ahora"
              value={`${available.length}`}
              hint="con prerrequisitos cumplidos"
            />
            <StatTile
              label="Semestres completos"
              value={`${completeSemesters.length}/${semesters.length}`}
              hint="todas sus materias aprobadas"
            />
            <StatTile
              label="Créditos aprobados"
              value={`${approvedCredits}`}
              hint={`faltan ${TOTAL_CREDITS - approvedCredits}`}
            />
          </section>

          {/* Estado vacío / disponibles */}
          {loaded && approved.size === 0 ? (
            <section
              className="border rounded px-5 py-6 mb-6 text-center"
              style={{ borderColor: "#e0e0e0", background: YEAR_COLORS[1].bg }}
            >
              <div className="font-bold text-sm mb-1" style={{ color: INK }}>
                Aún no has marcado materias
              </div>
              <p className="text-[12px] text-gray-600 max-w-md mx-auto">
                Marca abajo las materias que ya aprobaste. El avance se guarda sólo en este navegador y se
                actualiza al instante.
              </p>
            </section>
          ) : (
            available.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: PURPLE }}>
                  Puedes inscribir ahora
                </h2>
                <div className="flex flex-wrap gap-2">
                  {available.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => toggle(course.id)}
                      className="text-[11.5px] px-2.5 py-1.5 rounded border text-left"
                      style={{ borderColor: PURPLE, color: "#111", background: "#f9f4fd", transition: "all 0.15s" }}
                      title="Marcar como aprobada"
                    >
                      {course.name} <span className="font-bold">({course.credits})</span>
                    </button>
                  ))}
                </div>
              </section>
            )
          )}

          {/* Avisos de prerrequisitos pendientes */}
          {irregular.length > 0 && (
            <section
              className="border rounded px-4 py-3 mb-6 flex gap-2 items-start"
              style={{ borderColor: AMBER, background: "#fffaf0" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" className="mt-0.5 flex-none" aria-hidden="true">
                <path d="M7 1.5 L13 12.5 H1 Z" fill="none" stroke={AMBER} strokeWidth="1.6" />
                <path d="M7 5.5 V9" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div>
                <div className="text-[11.5px] font-bold" style={{ color: AMBER }}>
                  Prerrequisitos sin aprobar
                </div>
                <ul className="text-[11.5px] text-gray-600 mt-1 space-y-0.5">
                  {irregular.map((course) => (
                    <li key={course.id}>
                      <span className="font-bold">{course.name}</span>: falta{" "}
                      {missingPrereqs(course.id).map((p) => courseById.get(p)?.name ?? p).join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Malla por semestres */}
          <section
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
          >
            {semesters.map((sem) => {
              const ids = sem.courses.map((c) => c.id);
              const done = ids.filter((id) => approved.has(id));
              const semCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);
              const allDone = done.length === ids.length;

              return (
                <div key={sem.number} className="border rounded overflow-hidden" style={{ borderColor: "#e0e0e0" }}>
                  <div className="px-3 py-2" style={{ background: YEAR_COLORS[sem.year].bg }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg leading-none tabular-nums" style={{ color: INK }}>
                        {sem.number}
                      </span>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "rgba(26,76,94,0.65)" }}>
                        Año {sem.year}
                      </span>
                      {allDone && <CheckIcon color={GREEN} />}
                      <button
                        onClick={() => setMany(ids, !allDone)}
                        className="ml-auto text-[10px] font-bold uppercase tracking-wide underline"
                        style={{ color: "rgba(26,76,94,0.7)" }}
                      >
                        {allDone ? "Limpiar" : "Todo"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Meter value={creditsOf(done)} total={semCredits} color={allDone ? GREEN : INK} />
                      <span className="text-[10px] tabular-nums flex-none" style={{ color: "rgba(26,76,94,0.7)" }}>
                        {done.length}/{ids.length}
                      </span>
                    </div>
                  </div>

                  <ul className="divide-y" style={{ borderColor: "#f0f0f0" }}>
                    {sem.courses.map((course) => {
                      const isDone = approved.has(course.id);
                      const missing = missingPrereqs(course.id);
                      const isLocked = !isDone && missing.length > 0;

                      return (
                        <li key={course.id} style={{ borderColor: "#f0f0f0" }}>
                          <button
                            onClick={() => toggle(course.id)}
                            aria-pressed={isDone}
                            className="w-full text-left px-3 py-2 flex items-start gap-2"
                            style={{
                              background: isDone ? "#f0fff4" : "#fff",
                              transition: "background 0.15s",
                            }}
                            title={
                              isLocked
                                ? `Requiere: ${missing.map((p) => courseById.get(p)?.name ?? p).join(", ")}`
                                : undefined
                            }
                          >
                            <span
                              className="flex-none mt-0.5 flex items-center justify-center rounded-sm"
                              style={{
                                width: 14,
                                height: 14,
                                border: `1.5px solid ${isDone ? GREEN : "#bbb"}`,
                                background: isDone ? GREEN : "#fff",
                              }}
                            >
                              {isDone && <CheckIcon color="#fff" />}
                            </span>
                            <span className="flex-1">
                              <span
                                className="text-[11.5px] leading-snug block"
                                style={{ color: isLocked ? "#888" : "#111" }}
                              >
                                {course.name}{" "}
                                <span className="font-bold">({course.credits})</span>
                              </span>
                              {isLocked && (
                                <span className="text-[10px] block mt-0.5" style={{ color: "#999" }}>
                                  Requiere {missing.length} previa{missing.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>

          {/* Acciones */}
          <footer className="flex items-center gap-4 flex-wrap mt-6 pt-4 border-t" style={{ borderColor: "#e0e0e0" }}>
            <Link to="/" className="text-[11.5px] font-bold underline" style={{ color: INK }}>
              Ver la malla completa
            </Link>
            {confirmReset ? (
              <span className="flex items-center gap-2 text-[11.5px]">
                <span className="text-gray-600">¿Borrar todo el avance?</span>
                <button
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                  }}
                  className="font-bold px-2 py-1 rounded border"
                  style={{ borderColor: "#c0392b", color: "#c0392b" }}
                >
                  Sí, borrar
                </button>
                <button onClick={() => setConfirmReset(false)} className="text-gray-500 underline">
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-[11.5px] text-gray-500 underline ml-auto"
                disabled={approved.size === 0}
                style={{ opacity: approved.size === 0 ? 0.4 : 1 }}
              >
                Reiniciar avance
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
