import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SemesterList from "@/components/SemesterList";
import PlanNotice from "@/components/PlanNotice";
import ProgressReset from "@/components/ProgressReset";
import {
  getCareerPlan,
  INK,
  yearColor,
  type CareerId,
} from "@/data/curriculum";
import { useProgress } from "@/lib/progress";

const ARROW_COLOR = "#6b1f82";
const ARROW_CROSS_COLOR = "#d97706";
const GREEN = "#1a7a3a";
const CARD_W = 148;
const COL_GAP = 44;
const HOP_R = 5;

interface RawArrow {
  from: string; to: string;
  x1: number; y1: number; midX: number; x2: number; y2: number;
}
interface ProcessedArrow {
  from: string; to: string; path: string;
  hasCrossing: boolean; crossPoints: { x: number; y: number }[];
}

function hCrossesV(hY: number, hXa: number, hXb: number, vX: number, vYa: number, vYb: number, tol = 2): boolean {
  const xMin = Math.min(hXa, hXb), xMax = Math.max(hXa, hXb);
  const yMin = Math.min(vYa, vYb), yMax = Math.max(vYa, vYb);
  return vX > xMin + tol && vX < xMax - tol && hY > yMin + tol && hY < yMax - tol;
}
function hSegsOverlap(y1: number, xa1: number, xb1: number, y2: number, xa2: number, xb2: number, tol = 2): boolean {
  if (Math.abs(y1 - y2) > tol) return false;
  const min1 = Math.min(xa1, xb1), max1 = Math.max(xa1, xb1);
  const min2 = Math.min(xa2, xb2), max2 = Math.max(xa2, xb2);
  return min1 < max2 - tol && min2 < max1 - tol;
}
function vSegsOverlap(x1: number, ya1: number, yb1: number, x2: number, ya2: number, yb2: number, tol = 2): boolean {
  if (Math.abs(x1 - x2) > tol) return false;
  const min1 = Math.min(ya1, yb1), max1 = Math.max(ya1, yb1);
  const min2 = Math.min(ya2, yb2), max2 = Math.max(ya2, yb2);
  return min1 < max2 - tol && min2 < max1 - tol;
}

function buildProcessedArrows(rawArrows: RawArrow[]): ProcessedArrow[] {
  return rawArrows.map((arrow) => {
    const h1Crossings: number[] = [], h2Crossings: number[] = [];
    const crossPoints: { x: number; y: number }[] = [];
    let hasCrossing = false;
    for (const other of rawArrows) {
      if (other.from === arrow.from && other.to === arrow.to) continue;
      const otherVyMin = Math.min(other.y1, other.y2), otherVyMax = Math.max(other.y1, other.y2);
      if (hCrossesV(arrow.y1, arrow.x1, arrow.midX, other.midX, otherVyMin, otherVyMax)) {
        h1Crossings.push(other.midX); crossPoints.push({ x: other.midX, y: arrow.y1 }); hasCrossing = true;
      }
      if (hCrossesV(arrow.y2, arrow.midX, arrow.x2, other.midX, otherVyMin, otherVyMax)) {
        h2Crossings.push(other.midX); crossPoints.push({ x: other.midX, y: arrow.y2 }); hasCrossing = true;
      }
      if (
        hSegsOverlap(arrow.y1, arrow.x1, arrow.midX, other.y1, other.x1, other.midX) ||
        hSegsOverlap(arrow.y1, arrow.x1, arrow.midX, other.y2, other.midX, other.x2) ||
        hSegsOverlap(arrow.y2, arrow.midX, arrow.x2, other.y1, other.x1, other.midX) ||
        hSegsOverlap(arrow.y2, arrow.midX, arrow.x2, other.y2, other.midX, other.x2)
      ) hasCrossing = true;
      if (vSegsOverlap(arrow.midX, arrow.y1, arrow.y2, other.midX, other.y1, other.y2)) hasCrossing = true;
    }
    const sortedH1 = [...new Set(h1Crossings)].sort((a, b) => a - b);
    const sortedH2 = [...new Set(h2Crossings)].sort((a, b) => a - b);
    let path = `M ${arrow.x1} ${arrow.y1}`;
    let curX = arrow.x1;
    for (const hopX of sortedH1) {
      if (hopX - HOP_R > curX) path += ` H ${hopX - HOP_R}`;
      path += ` A ${HOP_R} ${HOP_R} 0 0 0 ${hopX + HOP_R} ${arrow.y1}`; curX = hopX + HOP_R;
    }
    path += ` H ${arrow.midX} V ${arrow.y2}`; curX = arrow.midX;
    for (const hopX of sortedH2) {
      if (hopX - HOP_R > curX) path += ` H ${hopX - HOP_R}`;
      path += ` A ${HOP_R} ${HOP_R} 0 0 0 ${hopX + HOP_R} ${arrow.y2}`; curX = hopX + HOP_R;
    }
    path += ` H ${arrow.x2}`;
    return { from: arrow.from, to: arrow.to, path, hasCrossing, crossPoints };
  });
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.4 L4.6 9 L10 3" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Meter({ value, total, color = INK }: { value: number; total: number; color?: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(26,76,94,0.12)" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.25s ease-out" }} />
    </div>
  );
}

export default function MallaPage({ careerId }: { careerId: CareerId }) {
  const plan = getCareerPlan(careerId);
  const {
    allCourses,
    courseById,
    creditsMissingFor,
    creditsOf,
    isCourseUnlocked,
    prereqsOf,
    prerequisites,
    semesters,
    totalCredits,
    unlocksOf,
  } = plan;

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [arrows, setArrows] = useState<ProcessedArrow[]>([]);
  const [svgW, setSvgW] = useState(0);
  const [svgH, setSvgH] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const { approved, grades, legacyGrades, saveError, toggle, setMany, reset } = useProgress(careerId);

  const approvedCredits = creditsOf(approved);
  const percent = totalCredits ? Math.round((approvedCredits / totalCredits) * 100) : 0;
  const available = allCourses.filter((c) => !approved.has(c.id) && isCourseUnlocked(c.id, approved));
  const completeSemesters = semesters.filter((s) => s.courses.every((c) => approved.has(c.id)));
  const missingPrereqs = (id: string) => prereqsOf(id).filter((p) => !approved.has(p));
  const irregular = allCourses.filter((c) => approved.has(c.id) && !isCourseUnlocked(c.id, approved));

  const computeArrows = useCallback(() => {
    const container = containerRef.current, content = contentRef.current;
    if (!container || !content || container.clientWidth === 0) return;
    setSvgW(content.offsetWidth);
    setSvgH(content.offsetHeight);
    const contentRect = content.getBoundingClientRect();
    const rawArrows: RawArrow[] = [];
    for (const [from, to] of prerequisites) {
      const fromEl = cardRefs.current[from], toEl = cardRefs.current[to];
      if (!fromEl || !toEl) continue;
      const fRect = fromEl.getBoundingClientRect(), tRect = toEl.getBoundingClientRect();
      const x1 = Math.round(fRect.right - contentRect.left);
      const y1 = Math.round(fRect.top - contentRect.top + fRect.height / 2);
      const x2 = Math.round(tRect.left - contentRect.left);
      const y2 = Math.round(tRect.top - contentRect.top + tRect.height / 2);
      rawArrows.push({ from, to, x1, y1, midX: Math.round((x1 + x2) / 2), x2, y2 });
    }
    setArrows(buildProcessedArrows(rawArrows));
  }, [prerequisites]);

  useEffect(() => {
    computeArrows();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", computeArrows);
      return () => window.removeEventListener("resize", computeArrows);
    }
    const observer = new ResizeObserver(computeArrows);
    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [computeArrows]);

  useEffect(() => { computeArrows(); }, [approved, computeArrows]);

  const highlighted = hovered
    ? new Set([hovered, ...prereqsOf(hovered), ...unlocksOf(hovered)])
    : null;

  const yearGroups = Array.from(new Set(semesters.map((semester) => semester.year))).map((year) => ({
    year,
    semesters: semesters.filter((s) => s.year === year),
  }));

  return (
    <main className="flex min-h-dvh flex-col bg-white font-sans lg:h-dvh">
      <SiteHeader
        careerId={careerId}
        view="malla"
        title="Plan de estudios"
        note={`${plan.name} · ${semesters.length} semestres`}
      />

      <PlanNotice plan={plan} saveError={saveError} />

      <section aria-label="Resumen del avance" className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[#dce5e9] bg-slate-50 px-4 py-3 sm:px-6">
        <div className="flex w-full items-center gap-3 sm:w-auto sm:min-w-44">
          <span className="text-2xl font-bold tabular-nums leading-none text-[#1a4c5e]">{percent}%</span>
          <div className="flex-1">
            <div className="mb-1 text-sm text-slate-600">{approvedCredits} / {totalCredits} créditos</div>
            <Meter value={approvedCredits} total={totalCredits} color={GREEN} />
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
          <li><strong>{approved.size}/{allCourses.length}</strong> aprobadas</li>
          <li><strong>{available.length}</strong> disponibles</li>
          <li><strong>{completeSemesters.length}/{semesters.length}</strong> semestres completos</li>
        </ul>
        {irregular.length > 0 && (
          <p className="rounded bg-amber-50 px-2 py-1 text-sm text-amber-900">
            {irregular.length} con requisitos pendientes
          </p>
        )}
        {(approved.size > 0 || Object.keys(grades).length > 0 || Object.keys(legacyGrades).length > 0) && (
          <div className="sm:ml-auto"><ProgressReset reset={reset} career={plan.shortName} /></div>
        )}
      </section>

      <SemesterList plan={plan} approved={approved} toggle={toggle} setMany={setMany} />

      <div ref={containerRef} className="relative hidden min-h-0 min-w-0 flex-1 overflow-auto lg:block">
        <div ref={contentRef} className="relative inline-block min-w-full align-top">
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0" width={svgW} height={svgH} style={{ overflow: "visible", zIndex: 0 }}>
            <defs>
              {[
                { id: "ah-normal", color: ARROW_COLOR },
                { id: "ah-cross", color: ARROW_CROSS_COLOR },
                { id: "ah-dim", color: "rgba(0,0,0,0.1)" },
                { id: "ah-prereq", color: "#c0392b" },
                { id: "ah-unlock", color: GREEN },
              ].map(({ id, color }) => (
                <marker key={id} id={id} markerWidth="9" markerHeight="9" refX="9" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                  <polygon points="0 0, 9 4.5, 0 9" fill={color} />
                </marker>
              ))}
            </defs>
            {arrows.map(({ from, to, path, hasCrossing, crossPoints }) => {
              const isPrereq = hovered === to && highlighted?.has(from);
              const isUnlock = hovered === from && highlighted?.has(to);
              const isDim = highlighted && !isPrereq && !isUnlock;
              let stroke = hasCrossing ? ARROW_CROSS_COLOR : ARROW_COLOR;
              let opacity = hasCrossing ? 0.55 : 0.3;
              let sw = 2;
              let marker = hasCrossing ? "url(#ah-cross)" : "url(#ah-normal)";
              if (isDim) { stroke = "rgba(0,0,0,0.15)"; opacity = 0.08; sw = 1.5; marker = "url(#ah-dim)"; }
              else if (isPrereq) { stroke = "#c0392b"; opacity = 0.9; sw = 2.5; marker = "url(#ah-prereq)"; }
              else if (isUnlock) { stroke = GREEN; opacity = 0.9; sw = 2.5; marker = "url(#ah-unlock)"; }
              else if (highlighted) { opacity = 0.08; }
              return (
                <g key={`${careerId}-${from}-${to}`} style={{ transition: "opacity 0.15s" }} opacity={opacity}>
                  <path d={path} fill="none" stroke={stroke} strokeWidth={sw} markerEnd={marker} />
                  {!isDim && crossPoints.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r={HOP_R} fill="none" stroke={stroke} strokeWidth={1} />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Year header */}
          <div className="flex sticky top-0 z-20">
            {yearGroups.map(({ year, semesters: ySems }, index) => (
              <div key={year} className="flex-none flex items-center justify-center"
                style={{
                  width: ySems.length * CARD_W + (ySems.length - 1) * COL_GAP + (index < yearGroups.length - 1 ? COL_GAP : 0),
                  background: INK, padding: "8px 0",
                  borderRight: index < yearGroups.length - 1 ? "2px solid rgba(255,255,255,0.15)" : "none",
                }}>
                <span className="text-white font-bold text-sm tracking-wide">Año {year}</span>
              </div>
            ))}
          </div>

          {/* Semester numbers + "Todo" buttons */}
          <div className="flex sticky top-[33px] z-20">
            {semesters.map((sem, si) => {
              const ids = sem.courses.map((c) => c.id);
              const allDone = ids.every((id) => approved.has(id));
              return (
                <div key={sem.number} className="flex-none flex items-center justify-between px-2"
                  style={{ width: CARD_W + (si < semesters.length - 1 ? COL_GAP : 0), background: yearColor(sem.year) }}>
                  <div className="text-center py-1">
                    <span className="font-bold text-lg" style={{ color: "#1a4c5e" }}>{sem.number}</span>
                  </div>
                  <button
                    onClick={() => setMany(ids, !allDone)}
                    className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{ color: allDone ? GREEN : "rgba(26,76,94,0.55)", background: allDone ? "#e6f7ec" : "transparent", border: `1px solid ${allDone ? GREEN + "50" : "transparent"}` }}
                    title={allDone ? "Desmarcar semestre" : "Marcar semestre completo"}
                  >
                    {allDone ? "✓ Listo" : "Todo"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cards */}
          <div className="flex relative" style={{ paddingBottom: 32 }}>
            {semesters.map((sem, si) => (
              <div key={sem.number} className="flex-none flex flex-col"
                style={{ width: CARD_W, marginRight: si < semesters.length - 1 ? COL_GAP : 0, background: yearColor(sem.year), paddingTop: 16, paddingBottom: 16 }}>
                <div className="flex flex-col gap-3 items-center">
                  {sem.courses.map((course) => {
                    const isHov = hovered === course.id;
                    const isPrereq = hovered !== null && hovered !== course.id && prereqsOf(hovered).includes(course.id);
                    const isUnlock = hovered !== null && hovered !== course.id && unlocksOf(hovered).includes(course.id);
                    const isActive = highlighted?.has(course.id) ?? false;
                    const isDim = highlighted && !isActive;

                    const isDone = approved.has(course.id);
                    const missing = missingPrereqs(course.id);
                    const creditsNeeded = creditsMissingFor(course.id, approved);
                    const isLocked = !isDone && (missing.length > 0 || creditsNeeded > 0);
                    const isAvailable = !isDone && !isLocked;

                    let borderColor = "#ccc";
                    let bg = "#fff";
                    let shadow = "none";

                    if (isDone) { borderColor = GREEN; bg = "#f0fff4"; }
                    else if (isAvailable) { borderColor = "#4a9ebe"; bg = "#f0f9ff"; }

                    if (isHov) { borderColor = ARROW_COLOR; bg = "#f3e8ff"; shadow = `0 0 0 2px ${ARROW_COLOR}40`; }
                    else if (isPrereq) { borderColor = "#c0392b"; bg = "#fff5f5"; shadow = "0 0 0 1.5px #c0392b50"; }
                    else if (isUnlock) { borderColor = GREEN; bg = "#f0fff4"; shadow = `0 0 0 1.5px ${GREEN}50`; }

                    const lockReasons = [
                      missing.length > 0 ? `Requiere: ${missing.map((p) => courseById.get(p)?.name ?? p).join(", ")}` : null,
                      creditsNeeded > 0 ? `Faltan ${creditsNeeded} créditos aprobados` : null,
                    ].filter(Boolean).join(" · ");

                    return (
                      <button
                        key={course.id}
                        type="button"
                        aria-pressed={isDone}
                        aria-label={`${course.name}, ${course.credits} créditos${isLocked ? `. ${lockReasons}` : ""}`}
                        ref={(el) => { cardRefs.current[course.id] = el; }}
                        onMouseEnter={() => setHovered(course.id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(course.id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => toggle(course.id)}
                        className="min-h-11 cursor-pointer select-none text-center"
                        title={isLocked ? lockReasons : isDone ? "Haz clic para desmarcar" : "Haz clic para marcar como aprobada"}
                        style={{
                          width: CARD_W - 8,
                          background: bg,
                          border: `1.5px solid ${borderColor}`,
                          borderRadius: 4,
                          padding: "7px 10px 7px",
                          filter: isDim ? "grayscale(60%) opacity(0.3)" : isLocked && !highlighted ? "opacity(0.65)" : "none",
                          boxShadow: shadow,
                          transition: "all 0.15s",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {isDone && (
                          <span className="absolute top-1 right-1.5 flex items-center justify-center rounded-sm"
                            style={{ width: 13, height: 13, background: GREEN }}>
                            <CheckIcon color="#fff" />
                          </span>
                        )}
                        {isAvailable && !isDone && (
                          <span className="absolute top-1 right-1.5 rounded-full"
                            style={{ width: 6, height: 6, background: "#4a9ebe" }} />
                        )}
                        <span className="block text-xs leading-snug pr-1" style={{ color: isLocked && !isDone ? "#888" : "#111", fontWeight: isDone ? 600 : 400 }}>
                          {course.name}
                        </span>
                        <span className="mt-0.5 block text-xs font-bold" style={{ color: isLocked && !isDone ? "#aaa" : "#111" }}>
                          ({course.credits})
                        </span>
                        {isLocked && !isDone && (
                          <span className="mt-0.5 block text-[10px]" style={{ color: "#bbb" }}>
                            {missing.length > 0 && `${missing.length} previa${missing.length > 1 ? "s" : ""}`}
                            {missing.length > 0 && creditsNeeded > 0 && " · "}
                            {creditsNeeded > 0 && `${creditsNeeded} cr.`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-6 py-3 border-t flex-wrap" style={{ borderColor: "#e0e0e0" }}>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: GREEN }} />
              <span className="text-[10.5px] text-gray-500">Aprobada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#4a9ebe" }} />
              <span className="text-[10.5px] text-gray-500">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm border" style={{ background: "#fff", borderColor: "#ccc" }} />
              <span className="text-[10.5px] text-gray-500">Bloqueada</span>
            </div>
            <div className="w-px h-4" style={{ background: "#e0e0e0" }} />
            {[
              { color: ARROW_COLOR, label: "Flujo normal" },
              { color: ARROW_CROSS_COLOR, label: "Se cruzan" },
              { color: "#c0392b", label: "Prerrequisito" },
              { color: GREEN, label: "Desbloquea" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <svg width="28" height="10">
                  <line x1="0" y1="5" x2="20" y2="5" stroke={color} strokeWidth="2" />
                  <polygon points="20 1, 28 5, 20 9" fill={color} />
                </svg>
                <span className="text-[10.5px] text-gray-500">{label}</span>
              </div>
            ))}
            <span className="text-[10px] text-gray-400 ml-auto italic">
              Enfoca una materia para ver conexiones · Selecciónala para marcarla como aprobada
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
