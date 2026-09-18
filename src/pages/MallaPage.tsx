import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  allCourses,
  courseById,
  creditsOf,
  creditsMissingFor,
  INK,
  isCourseUnlocked,
  prereqsOf,
  prerequisites,
  semesters,
  TOTAL_CREDITS,
  TOTAL_YEARS,
  unlocksOf,
  YEAR_COLORS,
} from "@/data/curriculum";
import { useProgress } from "@/lib/progress";

const ARROW_COLOR = "#6b1f82";
const ARROW_CROSS_COLOR = "#d97706";
const GREEN = "#1a7a3a";
const AMBER = "#d97706";
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

export default function MallaPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [arrows, setArrows] = useState<ProcessedArrow[]>([]);
  const [svgW, setSvgW] = useState(5000);
  const [svgH, setSvgH] = useState(2000);
  const [hovered, setHovered] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const { approved, loaded, toggle, setMany, reset } = useProgress();

  const approvedCredits = creditsOf(approved);
  const percent = Math.round((approvedCredits / TOTAL_CREDITS) * 100);
  const available = allCourses.filter((c) => !approved.has(c.id) && isCourseUnlocked(c.id, approved));
  const completeSemesters = semesters.filter((s) => s.courses.every((c) => approved.has(c.id)));
  const missingPrereqs = (id: string) => prereqsOf(id).filter((p) => !approved.has(p));
  const irregular = allCourses.filter((c) => approved.has(c.id) && missingPrereqs(c.id).length > 0);

  const computeArrows = useCallback(() => {
    const container = containerRef.current, content = contentRef.current;
    if (!container || !content) return;
    setSvgW(Math.max(content.scrollWidth, 100));
    setSvgH(Math.max(content.scrollHeight, 100));
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
    setArrows(buildProcessedArrows(rawArrows).map(a => ({ ...a, crossPoints: a.crossPoints ?? [] })));
  }, []);

  useEffect(() => {
    computeArrows();
    const ro = new ResizeObserver(computeArrows);
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [computeArrows]);

  useEffect(() => { computeArrows(); }, [approved, computeArrows]);

  const highlighted = hovered
    ? new Set([hovered, ...prereqsOf(hovered), ...unlocksOf(hovered)])
    : null;

  const yearGroups = Array.from({ length: TOTAL_YEARS }, (_, i) => i + 1).map((year) => ({
    year,
    semesters: semesters.filter((s) => s.year === year),
  }));

  return (
    <div className="size-full flex flex-col bg-white overflow-hidden font-sans">
      <SiteHeader
        title="Plan de Estudios por Semestres"
        note="Ingeniería Electrónica · 10 semestres"
        percent={percent}
      />

      {/* Stats bar */}
      <div className="flex-none border-b px-4 py-2 flex items-center gap-4 flex-wrap" style={{ borderColor: "#e0e0e0", background: "#fafafa" }}>
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: INK }}>{percent}%</span>
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 mb-0.5">{approvedCredits} / {TOTAL_CREDITS} créditos</div>
            <Meter value={approvedCredits} total={TOTAL_CREDITS} color={GREEN} />
          </div>
        </div>
        <div className="h-6 w-px" style={{ background: "#e0e0e0" }} />
        {[
          { lbl: "Aprobadas", val: `${approved.size}/${allCourses.length}` },
          { lbl: "Disponibles", val: `${available.length}` },
          { lbl: "Semestres completos", val: `${completeSemesters.length}/${semesters.length}` },
        ].map(({ lbl, val }) => (
          <div key={lbl} className="text-center">
            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "rgba(26,76,94,0.55)" }}>{lbl}</div>
            <div className="text-sm font-bold tabular-nums" style={{ color: INK }}>{val}</div>
          </div>
        ))}
        {irregular.length > 0 && (
          <>
            <div className="h-6 w-px" style={{ background: "#e0e0e0" }} />
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-1 rounded" style={{ color: AMBER, background: "#fffbeb", border: `1px solid ${AMBER}40` }}>
              <svg width="11" height="11" viewBox="0 0 14 14"><path d="M7 1.5 L13 12.5 H1 Z" fill="none" stroke={AMBER} strokeWidth="1.6"/><path d="M7 5.5 V9" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round"/></svg>
              {irregular.length} con prereq. pendiente
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          {loaded && approved.size === 0 ? (
            <span className="text-[10.5px] text-gray-400 italic">Haz clic en una materia para marcarla como aprobada</span>
          ) : confirmReset ? (
            <span className="flex items-center gap-2 text-[11px]">
              <span className="text-gray-600">¿Borrar todo?</span>
              <button onClick={() => { reset(); setConfirmReset(false); }} className="font-bold px-2 py-0.5 rounded border" style={{ borderColor: "#c0392b", color: "#c0392b" }}>Sí</button>
              <button onClick={() => setConfirmReset(false)} className="text-gray-500 underline">No</button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-[10.5px] text-gray-400 underline"
              disabled={approved.size === 0}
              style={{ opacity: approved.size === 0 ? 0.4 : 1 }}
            >
              Reiniciar avance
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto relative" onScroll={computeArrows}>
        <div ref={contentRef} className="relative inline-block min-w-full">
          <svg className="absolute inset-0 pointer-events-none" width={svgW} height={svgH} style={{ overflow: "visible", zIndex: 0 }}>
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
                <g key={`${from}-${to}`} style={{ transition: "opacity 0.15s" }} opacity={opacity}>
                  <path d={path} fill="none" stroke={stroke} strokeWidth={sw} markerEnd={marker} />
                  {!isDim && (crossPoints ?? []).map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r={HOP_R} fill="none" stroke={stroke} strokeWidth={1} />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Year header */}
          <div className="flex sticky top-0 z-20">
            {yearGroups.map(({ year, semesters: ySems }) => (
              <div key={year} className="flex-none flex items-center justify-center"
                style={{
                  width: ySems.length * CARD_W + (ySems.length - 1) * COL_GAP + (year < TOTAL_YEARS ? COL_GAP : 0),
                  background: YEAR_COLORS[year].header, padding: "8px 0",
                  borderRight: year < TOTAL_YEARS ? "2px solid rgba(255,255,255,0.15)" : "none",
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
                  style={{ width: CARD_W + (si < semesters.length - 1 ? COL_GAP : 0), background: YEAR_COLORS[sem.year].bg }}>
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
                style={{ width: CARD_W, marginRight: si < semesters.length - 1 ? COL_GAP : 0, background: YEAR_COLORS[sem.year].bg, paddingTop: 16, paddingBottom: 16 }}>
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
                      <div
                        key={course.id}
                        ref={(el) => { cardRefs.current[course.id] = el; }}
                        onMouseEnter={() => setHovered(course.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => toggle(course.id)}
                        className="text-center cursor-pointer select-none"
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
                        <div className="text-[11px] leading-snug pr-1" style={{ color: isLocked && !isDone ? "#888" : "#111", fontWeight: isDone ? 600 : 400 }}>
                          {course.name}
                        </div>
                        <div className="text-[11px] font-bold mt-0.5" style={{ color: isLocked && !isDone ? "#aaa" : "#111" }}>
                          ({course.credits})
                        </div>
                        {isLocked && !isDone && (
                          <div className="text-[9px] mt-0.5" style={{ color: "#bbb" }}>
                            {missing.length > 0 && `${missing.length} previa${missing.length > 1 ? "s" : ""}`}
                            {missing.length > 0 && creditsNeeded > 0 && " · "}
                            {creditsNeeded > 0 && `${creditsNeeded} cr.`}
                          </div>
                        )}
                      </div>
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
              Hover = ver conexiones · Clic = marcar aprobada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
