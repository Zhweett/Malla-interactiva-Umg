import { useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  allCourses,
  courseById,
  creditsMissingFor,
  creditsOf,
  INK,
  isCourseUnlocked,
  prereqsOf,
  semesters,
  TOTAL_CREDITS,
  YEAR_COLORS,
} from "@/data/curriculum";
import { useProgress, PASSING, MAX_GRADE, MAX_ATTEMPTS } from "@/lib/progress";

const GREEN  = "#1a7a3a";
const RED    = "#c0392b";
const AMBER  = "#d97706";
const PURPLE = "#6b1f82";

const ATTEMPT_LABELS = ["1ª", "2ª Final", "3ª Final", "4ª Final"];

function Meter({ value, total, color = INK }: { value: number; total: number; color?: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(26,76,94,0.12)" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.25s ease-out" }} />
    </div>
  );
}

function StatTile({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: string }) {
  return (
    <div className="border rounded px-4 py-3 bg-white" style={{ borderColor: "#e0e0e0" }}>
      <div className="text-[10.5px] uppercase tracking-wider font-bold" style={{ color: "rgba(26,76,94,0.6)" }}>{label}</div>
      <div className="text-2xl font-bold tabular-nums leading-tight mt-1" style={{ color: accent ?? INK }}>{value}</div>
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

function AttemptInput({
  courseId, index, value, onSave, disabled,
}: {
  courseId: string; index: number; value: number | undefined;
  onSave: (id: string, index: number, nota: number | null) => void;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value !== undefined ? String(value) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const n = parseFloat(val.replace(",", "."));
    if (val.trim() === "") { onSave(courseId, index, null); setEditing(false); return; }
    if (!isNaN(n) && n >= 0 && n <= MAX_GRADE) { onSave(courseId, index, n); setEditing(false); }
    else { setVal(value !== undefined ? String(value) : ""); setEditing(false); }
  };

  const passed = value !== undefined && value >= PASSING;
  const failed = value !== undefined && value < PASSING;

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number" min={0} max={MAX_GRADE} step={1}
        value={val}
        autoFocus
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="w-16 text-center text-[11px] border rounded px-1 py-0.5 font-bold tabular-nums outline-none"
        style={{ borderColor: INK, color: INK }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] font-bold" style={{ color: "rgba(26,76,94,0.45)", minWidth: 36 }}>
        {ATTEMPT_LABELS[index]}
      </span>
      <button
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setVal(value !== undefined ? String(value) : "");
          setEditing(true);
        }}
        className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded border transition-all"
        style={{
          borderColor: passed ? GREEN + "80" : failed ? RED + "80" : "#e0e0e0",
          color: passed ? GREEN : failed ? RED : "#bbb",
          background: passed ? "#f0fff4" : failed ? "#fff5f5" : "#f9f9f9",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
        }}
        title={disabled ? "Ingresa la nota anterior primero" : `Ingresar ${ATTEMPT_LABELS[index]} (0–${MAX_GRADE})`}
      >
        {value !== undefined ? value : "—"}
      </button>
      {value !== undefined && (
        <>
          <span className="text-[9px] font-bold px-1 py-0.5 rounded"
            style={{ background: passed ? "#e6f7ec" : "#fde8e8", color: passed ? GREEN : RED }}>
            {passed ? "APR" : "REP"}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(courseId, index, null); }}
            className="text-[10px] text-gray-300 hover:text-gray-500 leading-none"
            title="Borrar esta nota"
          >✕</button>
        </>
      )}
    </div>
  );
}

export default function AvancePage() {
  const { approved, grades, loaded, toggle, setMany, setAttempt, reset } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const ENGLISH_IDS = ["eng1", "eng2", "eng3", "eng4", "eng5"] as const;
  const [excludedEnglish, setExcludedEnglish] = useState<Set<string>>(() => new Set());

  const approvedCredits = creditsOf(approved);
  const percent = Math.round((approvedCredits / TOTAL_CREDITS) * 100);

  const missingPrereqs = (id: string) => prereqsOf(id).filter((p) => !approved.has(p));
  const available = allCourses.filter((c) => !approved.has(c.id) && isCourseUnlocked(c.id, approved));
  const irregular = allCourses.filter((c) => approved.has(c.id) && missingPrereqs(c.id).length > 0);
  const completeSemesters = semesters.filter((s) => s.courses.every((c) => approved.has(c.id)));

  // Promedio ponderado: usa la ÚLTIMA nota de cada materia × créditos
  const gradedCourses = allCourses.filter((c) => grades[c.id]?.length);
  const gradedForAvg = gradedCourses.filter((c) => !excludedEnglish.has(c.id));
  // Cada intento (aprobado o reprobado) suma al ponderado con el peso de los créditos de la materia.
  const { totalGradedCredits, weightedSum } = gradedForAvg.reduce(
    (acc, c) => {
      const attempts = grades[c.id];
      return {
        totalGradedCredits: acc.totalGradedCredits + attempts.length * c.credits,
        weightedSum: acc.weightedSum + attempts.reduce((s, n) => s + n * c.credits, 0),
      };
    },
    { totalGradedCredits: 0, weightedSum: 0 }
  );
  const weightedAvg = totalGradedCredits > 0 ? weightedSum / totalGradedCredits : null;

  const failedCourses = allCourses.filter((c) => {
    const attempts = grades[c.id];
    return attempts?.length && !attempts.some((n) => n >= PASSING);
  });
  const passedGraded = gradedCourses.filter((c) => grades[c.id].some((n) => n >= PASSING));
  const hasData = approved.size > 0 || Object.keys(grades).length > 0;

  return (
    <div className="size-full flex flex-col bg-white overflow-hidden font-sans">
      <SiteHeader
        title="Seguimiento de Avance"
        note="Ingeniería Electrónica · guardado en este navegador"
        percent={percent}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">

          {/* Progreso principal */}
          <section className="mb-6">
            <div className="flex items-end justify-between gap-4 mb-2 flex-wrap">
              <div>
                <span className="text-5xl font-bold tabular-nums leading-none" style={{ color: INK }}>{percent}</span>
                <span className="text-xl font-bold ml-1" style={{ color: "rgba(26,76,94,0.55)" }}>% del plan</span>
              </div>
              <span className="text-[11px] text-gray-500 tabular-nums">{approvedCredits} de {TOTAL_CREDITS} créditos</span>
            </div>
            <Meter value={approvedCredits} total={TOTAL_CREDITS} />
          </section>

          {/* Estadísticas */}
          <section className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))" }}>
            <StatTile label="Materias aprobadas" value={`${approved.size}/${allCourses.length}`} hint={`${allCourses.length - approved.size} por cursar`} />
            <StatTile label="Disponibles ahora" value={`${available.length}`} hint="con prerrequisitos cumplidos" />
            <StatTile label="Semestres completos" value={`${completeSemesters.length}/${semesters.length}`} hint="todas sus materias aprobadas" />
            <StatTile label="Créditos aprobados" value={`${approvedCredits}`} hint={`faltan ${TOTAL_CREDITS - approvedCredits}`} />
            {weightedAvg !== null && (
              <div className="border rounded px-4 py-3 bg-white" style={{ borderColor: "#e0e0e0" }}>
                <div className="text-[10.5px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(26,76,94,0.6)" }}>Promedio ponderado</div>
                <div className="text-2xl font-bold tabular-nums leading-tight" style={{ color: weightedAvg >= PASSING ? GREEN : RED }}>
                  {Math.round(weightedAvg)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 mb-2">
                  {passedGraded.length} aprobadas · {failedCourses.length} reprobadas
                </div>
                <div className="text-[9.5px] font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(26,76,94,0.45)" }}>Incluir inglés:</div>
                <div className="flex flex-wrap gap-1">
                  {ENGLISH_IDS.map((id) => {
                    const course = allCourses.find((c) => c.id === id);
                    const included = !excludedEnglish.has(id);
                    const hasGrade = !!grades[id]?.length;
                    return (
                      <button
                        key={id}
                        onClick={() => setExcludedEnglish((prev) => {
                          const next = new Set(prev);
                          if (next.has(id)) next.delete(id); else next.add(id);
                          return next;
                        })}
                        className="text-[9.5px] font-bold px-1.5 py-0.5 rounded border transition-all"
                        style={{
                          borderColor: included ? "#4a9ebe" : "#ccc",
                          color: included ? "#4a9ebe" : "#aaa",
                          background: included ? "#f0f9ff" : "#f9f9f9",
                          opacity: hasGrade ? 1 : 0.45,
                        }}
                        title={`${included ? "Excluir" : "Incluir"} ${course?.name ?? id} del promedio`}
                      >
                        {included ? "✓" : "✗"} {course?.name?.replace("General English ", "Eng ") ?? id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Aviso reprobadas */}
          {failedCourses.length > 0 && (
            <section className="border rounded px-4 py-3 mb-6 flex gap-2 items-start" style={{ borderColor: RED, background: "#fff5f5" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" className="mt-0.5 flex-none">
                <path d="M7 1.5 L13 12.5 H1 Z" fill="none" stroke={RED} strokeWidth="1.6"/>
                <path d="M7 5.5 V9" stroke={RED} strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="text-[11.5px] font-bold mb-1" style={{ color: RED }}>
                  Materias reprobadas ({failedCourses.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {failedCourses.map((c) => {
                    const attempts = grades[c.id];
                    const last = attempts[attempts.length - 1];
                    return (
                      <span key={c.id} className="text-[11px] px-2 py-0.5 rounded font-bold"
                        style={{ background: "#fde8e8", color: RED }}>
                        {c.name} — {last}pts ({attempts.length}/{MAX_ATTEMPTS} intentos)
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Prerrequisitos irregulares */}
          {irregular.length > 0 && (
            <section className="border rounded px-4 py-3 mb-6 flex gap-2 items-start" style={{ borderColor: AMBER, background: "#fffaf0" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" className="mt-0.5 flex-none">
                <path d="M7 1.5 L13 12.5 H1 Z" fill="none" stroke={AMBER} strokeWidth="1.6"/>
                <path d="M7 5.5 V9" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="text-[11.5px] font-bold" style={{ color: AMBER }}>Prerrequisitos sin aprobar</div>
                <ul className="text-[11.5px] text-gray-600 mt-1 space-y-0.5">
                  {irregular.map((c) => (
                    <li key={c.id}><span className="font-bold">{c.name}</span>: falta {missingPrereqs(c.id).map((p) => courseById.get(p)?.name ?? p).join(", ")}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Disponibles / estado vacío */}
          {loaded && approved.size === 0 ? (
            <section className="border rounded px-5 py-6 mb-6 text-center" style={{ borderColor: "#e0e0e0", background: YEAR_COLORS[1].bg }}>
              <div className="font-bold text-sm mb-1" style={{ color: INK }}>Aún no has marcado materias</div>
              <p className="text-[12px] text-gray-600 max-w-md mx-auto">
                Marca las materias que ya cursaste e ingresa tu nota (0–{MAX_GRADE}). Se guarda sólo en este navegador.
              </p>
            </section>
          ) : available.length > 0 && (
            <section className="mb-6">
              <h2 className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: PURPLE }}>Puedes inscribir ahora</h2>
              <div className="flex flex-wrap gap-2">
                {available.map((c) => (
                  <button key={c.id} onClick={() => toggle(c.id)}
                    className="text-[11.5px] px-2.5 py-1.5 rounded border text-left"
                    style={{ borderColor: PURPLE, color: "#111", background: "#f9f4fd" }}>
                    {c.name} <span className="font-bold">({c.credits})</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Semestres con notas */}
          <section className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
            {semesters.map((sem) => {
              const ids = sem.courses.map((c) => c.id);
              const done = ids.filter((id) => approved.has(id));
              const semCredits = sem.courses.reduce((s, c) => s + c.credits, 0);
              const allDone = done.length === ids.length;

              return (
                <div key={sem.number} className="border rounded overflow-hidden" style={{ borderColor: "#e0e0e0" }}>
                  <div className="px-3 py-2" style={{ background: YEAR_COLORS[sem.year].bg }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg leading-none tabular-nums" style={{ color: INK }}>{sem.number}</span>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "rgba(26,76,94,0.65)" }}>Año {sem.year}</span>
                      {allDone && <CheckIcon color={GREEN} />}
                      <button onClick={() => setMany(ids, !allDone)}
                        className="ml-auto text-[10px] font-bold uppercase tracking-wide underline"
                        style={{ color: "rgba(26,76,94,0.7)" }}>
                        {allDone ? "Limpiar" : "Todo"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Meter value={creditsOf(done)} total={semCredits} color={allDone ? GREEN : INK} />
                      <span className="text-[10px] tabular-nums flex-none" style={{ color: "rgba(26,76,94,0.7)" }}>{done.length}/{ids.length}</span>
                    </div>
                  </div>

                  <ul className="divide-y" style={{ borderColor: "#f0f0f0" }}>
                    {sem.courses.map((course) => {
                      const isDone = approved.has(course.id);
                      const missing = missingPrereqs(course.id);
                      const creditsNeeded = creditsMissingFor(course.id, approved);
                      const isLocked = !isDone && (missing.length > 0 || creditsNeeded > 0);
                      const attempts = grades[course.id] ?? [];
                      const everPassed = attempts.some((n) => n >= PASSING);
                      const lastFailed = attempts.length > 0 && !everPassed;
                      // Always show at least 1 slot when course is marked or has attempts
                      const canAddAttempt = attempts.length < MAX_ATTEMPTS && (attempts.length === 0 || lastFailed);
                      const showSlots = isDone || attempts.length > 0;
                      const visibleSlots = showSlots
                        ? Math.min(attempts.length + (canAddAttempt ? 1 : 0), MAX_ATTEMPTS)
                        : 0;

                      return (
                        <li key={course.id} style={{ borderColor: "#f0f0f0" }}>
                          <div
                            className="w-full px-3 py-2"
                            style={{
                              background: everPassed ? "#f0fff4" : lastFailed ? "#fff5f5" : "#fff",
                              transition: "background 0.15s",
                            }}
                          >
                            {/* Fila superior: checkbox + nombre */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggle(course.id)}
                                aria-pressed={isDone}
                                className="flex-none flex items-center justify-center rounded-sm"
                                style={{
                                  width: 14, height: 14,
                                  border: `1.5px solid ${everPassed ? GREEN : lastFailed ? RED : "#bbb"}`,
                                  background: everPassed ? GREEN : lastFailed ? RED : "#fff",
                                }}
                                title={isDone ? "Desmarcar" : "Marcar como cursada"}
                              >
                                {(isDone || lastFailed) && <CheckIcon color="#fff" />}
                              </button>

                              <span className="flex-1 min-w-0">
                                <span className="text-[11.5px] leading-snug truncate block"
                                  style={{ color: isLocked && attempts.length === 0 ? "#888" : "#111", fontWeight: isDone ? 600 : 400 }}>
                                  {course.name} <span className="font-bold">({course.credits})</span>
                                </span>
                                {isLocked && attempts.length === 0 && (
                                  <span className="text-[10px]" style={{ color: "#aaa" }}>
                                    {missing.length > 0 && `${missing.length} previa${missing.length > 1 ? "s" : ""}`}
                                    {missing.length > 0 && creditsNeeded > 0 && " · "}
                                    {creditsNeeded > 0 && `${creditsNeeded} cr.`}
                                  </span>
                                )}
                              </span>

                              {/* Estado global */}
                              {attempts.length > 0 && (
                                <span className="flex-none text-[9px] font-bold px-1.5 py-0.5 rounded"
                                  style={{ background: everPassed ? "#e6f7ec" : "#fde8e8", color: everPassed ? GREEN : RED }}>
                                  {everPassed ? "APR" : `REP ×${attempts.length}`}
                                </span>
                              )}
                            </div>

                            {/* Filas de intentos */}
                            {visibleSlots > 0 && (
                              <div className="mt-2 flex flex-col gap-1 pl-5">
                                {Array.from({ length: visibleSlots }, (_, i) => (
                                  <AttemptInput
                                    key={i}
                                    courseId={course.id}
                                    index={i}
                                    value={attempts[i]}
                                    onSave={setAttempt}
                                    disabled={i > 0 && attempts[i - 1] === undefined}
                                  />
                                ))}
                                {everPassed && attempts.length < MAX_ATTEMPTS && (
                                  <span className="text-[9px] text-gray-400 italic pl-9">Materia aprobada</span>
                                )}
                                {!everPassed && attempts.length >= MAX_ATTEMPTS && (
                                  <span className="text-[9px] font-bold pl-9" style={{ color: RED }}>
                                    Máximo de intentos alcanzado ({MAX_ATTEMPTS})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>

          {/* Footer */}
          <footer className="flex items-center gap-4 flex-wrap mt-6 pt-4 border-t" style={{ borderColor: "#e0e0e0" }}>
            <div className="text-[11px] text-gray-400">
              Escala 0–{MAX_GRADE} pts · Mínimo aprobatorio: <span className="font-bold" style={{ color: INK }}>{PASSING} pts</span>
              {weightedAvg !== null && (
                <span className="ml-3">
                  Promedio ponderado:{" "}
                  <span className="font-bold" style={{ color: weightedAvg >= PASSING ? GREEN : RED }}>
                    {Math.round(weightedAvg)}
                  </span>
                </span>
              )}
            </div>
            <div className="ml-auto">
              {confirmReset ? (
                <span className="flex items-center gap-2 text-[11.5px]">
                  <span className="text-gray-600">¿Borrar todo el avance y las notas?</span>
                  <button onClick={() => { reset(); setConfirmReset(false); }}
                    className="font-bold px-3 py-1.5 rounded border" style={{ borderColor: RED, color: RED }}>
                    Sí, borrar todo
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="text-gray-500 underline">Cancelar</button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  disabled={!hasData}
                  className="flex items-center gap-2 text-[12px] font-bold px-4 py-2 rounded border transition-all"
                  style={{ borderColor: hasData ? RED : "#ddd", color: hasData ? RED : "#ccc", background: "white", opacity: hasData ? 1 : 0.5 }}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Reiniciar avance
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
