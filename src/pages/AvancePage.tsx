import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import PlanNotice from "@/components/PlanNotice";
import ProgressReset from "@/components/ProgressReset";
import {
  getCareerPlan,
  INK,
  yearColor,
  type CareerId,
} from "@/data/curriculum";
import { useProgress, PASSING, MAX_GRADE, MAX_ATTEMPTS } from "@/lib/progress";

const GREEN  = "#1a7a3a";
const RED    = "#c0392b";
const AMBER  = "#d97706";

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
      <div className="text-sm font-semibold" style={{ color: "rgba(26,76,94,0.8)" }}>{label}</div>
      <div className="text-2xl font-bold tabular-nums leading-tight mt-1" style={{ color: accent ?? INK }}>{value}</div>
      <div className="mt-0.5 text-sm text-slate-600">{hint}</div>
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
  courseId, courseName, index, value, onSave,
}: {
  courseId: string; courseName: string; index: number; value: number | undefined;
  onSave: (id: string, index: number, nota: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value !== undefined ? String(value) : "");
  const label = `Intento ${index + 1} de ${courseName}`;

  const commit = () => {
    const text = val.trim().replace(",", ".");
    if (text === "") {
      setEditing(false);
      return;
    }
    const grade = Number(text);
    if (Number.isFinite(grade) && grade >= 0 && grade <= MAX_GRADE) onSave(courseId, index, grade);
    setEditing(false);
  };

  const passed = value !== undefined && value >= PASSING;
  const failed = value !== undefined && value < PASSING;

  if (editing) {
    return (
      <input
        type="number" min={0} max={MAX_GRADE} step="any" inputMode="decimal"
        aria-label={label}
        value={val}
        autoFocus
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="min-h-11 w-24 rounded border px-2 text-center text-base font-bold tabular-nums"
        style={{ borderColor: INK, color: INK }}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-slate-600">Intento {index + 1}</span>
      <button
        type="button"
        aria-label={`${value === undefined ? "Agregar" : "Editar"} nota. ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          setVal(value !== undefined ? String(value) : "");
          setEditing(true);
        }}
        className="min-h-11 rounded border px-3 text-sm font-bold tabular-nums"
        style={{
          borderColor: passed ? GREEN + "80" : failed ? RED + "80" : "#e0e0e0",
          color: passed ? GREEN : failed ? RED : INK,
          background: passed ? "#f0fff4" : failed ? "#fff5f5" : "#f9f9f9",
        }}
      >
        {value !== undefined ? value : "Agregar nota"}
      </button>
      {value !== undefined && (
        <>
          <span className="rounded px-2 py-0.5 text-xs font-bold"
            style={{ background: passed ? "#e6f7ec" : "#fde8e8", color: passed ? GREEN : RED }}>
            {passed ? "Aprobada" : "Reprobada"}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(courseId, index, null); }}
            className="min-h-11 rounded px-2 text-sm text-red-800 underline"
            aria-label={`Borrar este intento y los siguientes. ${label}`}
          >Borrar</button>
        </>
      )}
    </div>
  );
}

export default function AvancePage({ careerId }: { careerId: CareerId }) {
  const plan = getCareerPlan(careerId);
  const {
    allCourses,
    courseById,
    creditsMissingFor,
    creditsOf,
    englishIds,
    isCourseUnlocked,
    prereqsOf,
    semesters,
    totalCredits,
  } = plan;

  const { approved, grades, legacyGrades, saveError, toggle, setMany, setAttempt, reset } = useProgress(careerId);
  const [excludedEnglish, setExcludedEnglish] = useState<Set<string>>(() => new Set());

  const approvedCredits = creditsOf(approved);
  const percent = totalCredits ? Math.round((approvedCredits / totalCredits) * 100) : 0;

  const missingPrereqs = (id: string) => prereqsOf(id).filter((p) => !approved.has(p));
  const available = allCourses.filter((c) => !approved.has(c.id) && isCourseUnlocked(c.id, approved));
  const irregular = allCourses.filter((c) => approved.has(c.id) && missingPrereqs(c.id).length > 0);
  const completeSemesters = semesters.filter((s) => s.courses.every((c) => approved.has(c.id)));

  // Promedio ponderado: cada intento (aprobado o reprobado) suma al ponderado con el peso de los créditos.
  const gradedCourses = allCourses.filter((c) => grades[c.id]?.length);
  const gradedForAvg = gradedCourses.filter((c) => !excludedEnglish.has(c.id));
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
  const hasLegacy = Object.keys(legacyGrades).length > 0;
  const hasData = approved.size > 0 || Object.keys(grades).length > 0 || hasLegacy;

  return (
    <main className="min-h-dvh bg-white font-sans">
      <SiteHeader
        careerId={careerId}
        view="avance"
        title="Seguimiento de avance"
        note={`${plan.name} · avance en este navegador`}
      />

      <PlanNotice plan={plan} saveError={saveError} />
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">

          {/* Progreso principal */}
          <section className="mb-6">
            <div className="flex items-end justify-between gap-4 mb-2 flex-wrap">
              <div>
                <span className="text-5xl font-bold tabular-nums leading-none" style={{ color: INK }}>{percent}</span>
                <span className="text-xl font-bold ml-1" style={{ color: "rgba(26,76,94,0.55)" }}>% del plan</span>
              </div>
              <span className="text-sm text-slate-600 tabular-nums">{approvedCredits} de {totalCredits} créditos</span>
            </div>
            <Meter value={approvedCredits} total={totalCredits} />
          </section>

          {/* Estadísticas */}
          <section className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <StatTile label="Materias aprobadas" value={`${approved.size}/${allCourses.length}`} hint={`${allCourses.length - approved.size} por cursar`} />
            <StatTile label="Disponibles ahora" value={`${available.length}`} hint="con prerrequisitos cumplidos" />
            <StatTile label="Semestres completos" value={`${completeSemesters.length}/${semesters.length}`} hint="todas sus materias aprobadas" />
            <StatTile label="Créditos aprobados" value={`${approvedCredits}`} hint={`faltan ${totalCredits - approvedCredits}`} />
            {gradedCourses.length > 0 && (
              <div className="col-span-full rounded border bg-white px-4 py-3 sm:col-span-2" style={{ borderColor: "#e0e0e0" }}>
                <div className="mb-1 text-sm font-semibold" style={{ color: "rgba(26,76,94,0.6)" }}>Promedio ponderado</div>
                <div className="text-2xl font-bold tabular-nums leading-tight" style={{ color: weightedAvg === null ? INK : weightedAvg >= PASSING ? GREEN : RED }}>
                  {weightedAvg === null ? "—" : Math.round(weightedAvg)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 mb-2">
                  {passedGraded.length} aprobadas · {failedCourses.length} reprobadas
                </div>
                {englishIds.length > 0 && <div className="mb-1 text-sm font-semibold text-slate-700">Incluir inglés en el promedio</div>}
                <div className="flex flex-wrap gap-1">
                  {englishIds.map((id) => {
                    const course = courseById.get(id);
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
                        aria-pressed={included}
                        className="min-h-11 rounded border px-2 text-sm font-bold"
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
                <div className="mb-1 text-sm font-bold" style={{ color: RED }}>
                  Materias reprobadas ({failedCourses.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {failedCourses.map((c) => {
                    const attempts = grades[c.id];
                    const last = attempts[attempts.length - 1];
                    return (
                      <span key={c.id} className="rounded px-2 py-0.5 text-sm font-semibold"
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
                <div className="text-sm font-bold" style={{ color: AMBER }}>Prerrequisitos sin aprobar</div>
                <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                  {irregular.map((c) => (
                    <li key={c.id}><span className="font-bold">{c.name}</span>: falta {missingPrereqs(c.id).map((p) => courseById.get(p)?.name ?? p).join(", ")}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-slate-200 py-2 text-sm text-slate-700">
            <p>
              Notas de 0 a {MAX_GRADE} · Aprobación desde {PASSING} puntos.{" "}
              <a href="https://umg.edu.gt/pdf/normas/Normas_Academicas_UMG.pdf" target="_blank" rel="noreferrer" className="font-semibold text-[#1a4c5e] underline">Normas UMG</a>
            </p>
            {hasData && <ProgressReset reset={reset} career={plan.shortName} />}
          </div>
          {hasLegacy && (
            <p className="mb-4 rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">
              Las notas guardadas con la escala anterior (0–500) se muestran en sus materias como historial. El promedio se calcula con las notas de 0 a 100.
            </p>
          )}

          {/* Semestres con notas */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {semesters.map((sem) => {
              const ids = sem.courses.map((c) => c.id);
              const done = ids.filter((id) => approved.has(id));
              const semCredits = sem.courses.reduce((s, c) => s + c.credits, 0);
              const allDone = done.length === ids.length;

              return (
                <div key={sem.number} className="border rounded overflow-hidden" style={{ borderColor: "#e0e0e0" }}>
                  <div className="px-3 py-2" style={{ background: yearColor(sem.year) }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg leading-none tabular-nums" style={{ color: INK }}>{sem.number}</span>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "rgba(26,76,94,0.65)" }}>Año {sem.year}</span>
                      {allDone && <CheckIcon color={GREEN} />}
                      <button onClick={() => setMany(ids, !allDone)}
                        className="ml-auto min-h-11 rounded px-2 text-sm font-bold underline"
                        style={{ color: "rgba(26,76,94,0.7)" }}>
                        {allDone ? "Desmarcar todas" : "Marcar todas"}
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
                      const canAddAttempt = attempts.length < MAX_ATTEMPTS && (attempts.length === 0 || lastFailed);
                      const visibleSlots = attempts.length + (canAddAttempt ? 1 : 0);

                      return (
                        <li key={course.id} style={{ borderColor: "#f0f0f0" }}>
                          <div
                            className="w-full px-3 py-2"
                            style={{
                              background: everPassed ? "#f0fff4" : lastFailed ? "#fff5f5" : "#fff",
                              transition: "background 0.15s",
                            }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-x-2">
                              <button
                                type="button"
                                onClick={() => toggle(course.id)}
                                aria-pressed={isDone}
                                className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded text-left"
                                title={isDone ? "Desmarcar aprobación" : "Marcar como aprobada"}
                              >
                                <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${isDone ? "border-green-800 bg-green-800" : "border-slate-500 bg-white"}`} aria-hidden="true">
                                  {isDone && <CheckIcon color="#fff" />}
                                </span>
                                <span className="min-w-0 break-words text-sm leading-snug text-slate-800">
                                  {course.name} <span className="whitespace-nowrap font-semibold">({course.credits} cr.)</span>
                                </span>
                              </button>
                              {attempts.length > 0 && (
                                <span className="rounded px-2 py-0.5 text-xs font-bold"
                                  style={{ background: everPassed ? "#e6f7ec" : "#fde8e8", color: everPassed ? GREEN : RED }}>
                                  {everPassed ? "Aprobada" : "Reprobada"}
                                </span>
                              )}
                            </div>
                            {isLocked && (
                              <p className="ml-7 text-xs text-slate-600">
                                {missing.length > 0 && `${missing.length} prerrequisito${missing.length === 1 ? "" : "s"} pendiente${missing.length === 1 ? "" : "s"}`}
                                {missing.length > 0 && creditsNeeded > 0 && " · "}
                                {creditsNeeded > 0 && `Faltan ${creditsNeeded} créditos`}
                              </p>
                            )}
                            {legacyGrades[course.id]?.length > 0 && (
                              <p className="ml-7 mt-1 text-xs text-slate-600">
                                Historial (0–500): {legacyGrades[course.id].join(", ")}
                              </p>
                            )}

                            {/* Filas de intentos */}
                            <details open={attempts.length > 0} className="ml-7 text-sm text-slate-700">
                              <summary className="min-h-11 cursor-pointer rounded py-3 font-semibold text-[#1a4c5e]">Notas</summary>
                              <div className="space-y-1 pb-2">
                                {Array.from({ length: visibleSlots }, (_, i) => (
                                  <AttemptInput
                                    key={i}
                                    courseId={course.id}
                                    courseName={course.name}
                                    index={i}
                                    value={attempts[i]}
                                    onSave={setAttempt}
                                  />
                                ))}
                                {!everPassed && attempts.length >= MAX_ATTEMPTS && (
                                  <span className="text-sm font-semibold" style={{ color: RED }}>
                                    Máximo de intentos alcanzado ({MAX_ATTEMPTS})
                                  </span>
                                )}
                              </div>
                            </details>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>

      </div>
    </main>
  );
}
