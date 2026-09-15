import { useCallback, useEffect, useRef, useState } from "react";

interface Course {
  id: string;
  name: string;
  credits: number;
}

interface Semester {
  number: number;
  year: number;
  courses: Course[];
}

const semesters: Semester[] = [
  {
    number: 1, year: 1,
    courses: [
      { id: "alglin",   name: "Álgebra Lineal", credits: 3 },
      { id: "calcdif",  name: "Cálculo Diferencial", credits: 4 },
      { id: "eng1",     name: "General English I", credits: 2 },
      { id: "introele", name: "Introducción a la Ingeniería Electrónica", credits: 2 },
      { id: "proclec",  name: "Procesos Lectores y Escriturales", credits: 2 },
      { id: "prog",     name: "Programación", credits: 3 },
      { id: "razonmat", name: "Razonamiento y Representación Matemática", credits: 2 },
    ],
  },
  {
    number: 2, year: 1,
    courses: [
      { id: "calcint",  name: "Cálculo Integral", credits: 4 },
      { id: "circdc",   name: "Circuitos DC", credits: 4 },
      { id: "exporal",  name: "Expresión Oral y Argumentación", credits: 2 },
      { id: "fisicamec",name: "Física Mecánica", credits: 4 },
      { id: "eng2",     name: "General English II", credits: 2 },
      { id: "prog2",    name: "Programación II", credits: 3 },
    ],
  },
  {
    number: 3, year: 2,
    courses: [
      { id: "calcmulti",name: "Cálculo Multivariable", credits: 4 },
      { id: "calorond", name: "Calor y Ondas", credits: 4 },
      { id: "catedra",  name: "Cátedra Global", credits: 2 },
      { id: "ecuadif",  name: "Ecuaciones Diferenciales", credits: 3 },
      { id: "elec1",    name: "Electrónica I", credits: 4 },
      { id: "eng3",     name: "General English III", credits: 2 },
    ],
  },
  {
    number: 4, year: 2,
    courses: [
      { id: "circac",   name: "Circuitos AC", credits: 4 },
      { id: "circdig",  name: "Circuitos Digitales", credits: 3 },
      { id: "eng4",     name: "General English IV", credits: 2 },
      { id: "matesp1",  name: "Matemáticas Especiales I", credits: 3 },
      { id: "probest",  name: "Probabilidad y Estadística", credits: 3 },
      { id: "teoem1",   name: "Teoría Electromagnética I", credits: 4 },
    ],
  },
  {
    number: 5, year: 3,
    courses: [
      { id: "disdig",   name: "Diseño de Sistemas Digitales", credits: 4 },
      { id: "elec2",    name: "Electrónica II", credits: 4 },
      { id: "eng5",     name: "General English V", credits: 2 },
      { id: "matesp2",  name: "Matemáticas Especiales II", credits: 3 },
      { id: "procsig1", name: "Procesamiento de Señales I", credits: 3 },
      { id: "teoem2",   name: "Teoría Electromagnética II", credits: 3 },
    ],
  },
  {
    number: 6, year: 3,
    courses: [
      { id: "bioing1",  name: "Bioingeniería I", credits: 3 },
      { id: "elec3",    name: "Electrónica III", credits: 4 },
      { id: "medtrans", name: "Medios de Transmisión", credits: 3 },
      { id: "microproc",name: "Microprocesamiento", credits: 3 },
      { id: "modelado", name: "Modelado y Simulación de Sistemas Dinámicos", credits: 3 },
      { id: "procsig2", name: "Procesamiento de Señales II", credits: 3 },
    ],
  },
  {
    number: 7, year: 4,
    courses: [
      { id: "control1", name: "Control I", credits: 4 },
      { id: "disproto", name: "Diseño y Prototipado", credits: 2 },
      { id: "elecpot",  name: "Electrónica de Potencia", credits: 3 },
      { id: "fismod",   name: "Física Moderna y Cuántica", credits: 3 },
      { id: "telecom",  name: "Telecomunicaciones", credits: 4 },
      { id: "telematica",name: "Telemática", credits: 3 },
    ],
  },
  {
    number: 8, year: 4,
    courses: [
      { id: "bioing2",  name: "Bioingeniería II", credits: 4 },
      { id: "control2", name: "Control II", credits: 4 },
      { id: "fissolido",name: "Física Estado Sólido", credits: 3 },
      { id: "ingproy",  name: "Ingeniería de Proyectos", credits: 3 },
      { id: "maqelec",  name: "Máquinas Eléctricas", credits: 3 },
      { id: "metodinv", name: "Metodología y Técnicas de Investigación en Ingeniería", credits: 2 },
    ],
  },
  {
    number: 9, year: 5,
    courses: [
      { id: "deonto",   name: "Deontología en la Ingeniería Electrónica", credits: 2 },
      { id: "elecprofA",name: "Electiva de Profundización A", credits: 3 },
      { id: "elecprofB",name: "Electiva de Profundización B", credits: 3 },
      { id: "elecing",  name: "Electrónica Industrial", credits: 4 },
      { id: "formhum",  name: "Formación Humanística y Ciudadana", credits: 2 },
      { id: "propinv",  name: "Propuesta de Investigación en Ingeniería", credits: 2 },
      { id: "radiocom", name: "Radiocomunicaciones", credits: 3 },
    ],
  },
  {
    number: 10, year: 5,
    courses: [
      { id: "proyculm", name: "Proyecto Culminante de Diseño", credits: 2 },
    ],
  },
];

const prerequisites: [string, string][] = [
  // English chain
  ["eng1",     "eng2"],
  ["eng2",     "eng3"],
  ["eng3",     "eng4"],
  ["eng4",     "eng5"],

  // Expresión oral
  ["proclec",  "exporal"],

  // Programación
  ["prog",     "prog2"],

  // Matemáticas
  ["calcdif",  "calcint"],
  ["calcdif",  "fisicamec"],
  ["calcint",  "calcmulti"],
  ["alglin",   "calcmulti"],
  ["calcint",  "ecuadif"],
  ["calcint",  "elec1"],
  ["calcint",  "probest"],
  ["ecuadif",  "circac"],
  ["ecuadif",  "matesp1"],
  ["calcmulti","matesp1"],
  ["calcmulti","teoem1"],
  ["matesp1",  "matesp2"],
  ["matesp1",  "elec2"],
  ["matesp1",  "procsig1"],
  ["matesp1",  "teoem2"],
  ["matesp2",  "fissolido"],

  // Física
  ["fisicamec","calorond"],
  ["calorond", "teoem1"],
  ["teoem1",   "teoem2"],
  ["teoem2",   "fismod"],
  ["teoem2",   "medtrans"],
  ["teoem2",   "maqelec"],
  ["fismod",   "fissolido"],

  // Circuitos
  ["introele", "circdc"],
  ["circdc",   "circac"],
  ["circdc",   "elec1"],
  ["circdc",   "circdig"],
  ["circac",   "elec2"],
  ["circac",   "elecpot"],
  ["circac",   "medtrans"],
  ["circac",   "procsig1"],

  // Electrónica
  ["elec1",    "elec2"],
  ["elec1",    "elecpot"],
  ["elec2",    "elec3"],
  ["elec2",    "telecom"],
  ["elecpot",  "maqelec"],

  // Sistemas digitales
  ["circdig",  "disdig"],
  ["disdig",   "microproc"],
  ["disdig",   "telematica"],

  // Señales
  ["procsig1", "procsig2"],
  ["procsig1", "bioing1"],
  ["procsig1", "modelado"],
  ["procsig1", "telecom"],
  ["probest",  "procsig2"],
  ["probest",  "telecom"],

  // Modelado → Control
  ["modelado", "control1"],
  ["control1", "control2"],
  ["control1", "elecing"],

  // Máquinas y electrónica industrial
  ["maqelec",  "elecing"],
  ["telematica","elecing"],

  // Bioingeniería
  ["bioing1",  "bioing2"],

  // Telecomunicaciones
  ["medtrans", "radiocom"],
  ["telecom",  "radiocom"],

  // Investigación chain
  ["disproto", "metodinv"],
  ["metodinv", "propinv"],
  ["propinv",  "proyculm"],
];

const YEAR_COLORS: Record<number, { bg: string; header: string }> = {
  1: { bg: "#fce8e2", header: "#1a4c5e" },
  2: { bg: "#e2f0e2", header: "#1a4c5e" },
  3: { bg: "#fce8e2", header: "#1a4c5e" },
  4: { bg: "#e2f0e2", header: "#1a4c5e" },
  5: { bg: "#fce8e2", header: "#1a4c5e" },
};

const ARROW_COLOR = "#6b1f82";
const ARROW_CROSS_COLOR = "#d97706";
const CARD_W = 148;
const COL_GAP = 44;
const TOTAL_YEARS = 5;
const HOP_R = 5;

interface RawArrow {
  from: string;
  to: string;
  x1: number; y1: number;
  midX: number;
  x2: number; y2: number;
}

interface ProcessedArrow {
  from: string;
  to: string;
  path: string;
  hasCrossing: boolean;
  crossPoints: { x: number; y: number }[];
}

function hCrossesV(
  hY: number, hXa: number, hXb: number,
  vX: number, vYa: number, vYb: number,
  tol = 2
): boolean {
  const xMin = Math.min(hXa, hXb);
  const xMax = Math.max(hXa, hXb);
  const yMin = Math.min(vYa, vYb);
  const yMax = Math.max(vYa, vYb);
  return vX > xMin + tol && vX < xMax - tol &&
    hY > yMin + tol && hY < yMax - tol;
}

function hSegsOverlap(
  y1: number, xa1: number, xb1: number,
  y2: number, xa2: number, xb2: number,
  tol = 2
): boolean {
  if (Math.abs(y1 - y2) > tol) return false;
  const min1 = Math.min(xa1, xb1), max1 = Math.max(xa1, xb1);
  const min2 = Math.min(xa2, xb2), max2 = Math.max(xa2, xb2);
  return min1 < max2 - tol && min2 < max1 - tol;
}

function vSegsOverlap(
  x1: number, ya1: number, yb1: number,
  x2: number, ya2: number, yb2: number,
  tol = 2
): boolean {
  if (Math.abs(x1 - x2) > tol) return false;
  const min1 = Math.min(ya1, yb1), max1 = Math.max(ya1, yb1);
  const min2 = Math.min(ya2, yb2), max2 = Math.max(ya2, yb2);
  return min1 < max2 - tol && min2 < max1 - tol;
}

function buildProcessedArrows(rawArrows: RawArrow[]): ProcessedArrow[] {
  return rawArrows.map((arrow) => {
    const h1Crossings: number[] = [];
    const h2Crossings: number[] = [];
    const crossPoints: { x: number; y: number }[] = [];
    let hasCrossing = false;

    for (const other of rawArrows) {
      if (other.from === arrow.from && other.to === arrow.to) continue;

      const otherVyMin = Math.min(other.y1, other.y2);
      const otherVyMax = Math.max(other.y1, other.y2);

      if (hCrossesV(arrow.y1, arrow.x1, arrow.midX, other.midX, otherVyMin, otherVyMax)) {
        h1Crossings.push(other.midX);
        crossPoints.push({ x: other.midX, y: arrow.y1 });
        hasCrossing = true;
      }

      if (hCrossesV(arrow.y2, arrow.midX, arrow.x2, other.midX, otherVyMin, otherVyMax)) {
        h2Crossings.push(other.midX);
        crossPoints.push({ x: other.midX, y: arrow.y2 });
        hasCrossing = true;
      }

      if (
        hSegsOverlap(arrow.y1, arrow.x1, arrow.midX, other.y1, other.x1, other.midX) ||
        hSegsOverlap(arrow.y1, arrow.x1, arrow.midX, other.y2, other.midX, other.x2) ||
        hSegsOverlap(arrow.y2, arrow.midX, arrow.x2, other.y1, other.x1, other.midX) ||
        hSegsOverlap(arrow.y2, arrow.midX, arrow.x2, other.y2, other.midX, other.x2)
      ) {
        hasCrossing = true;
      }

      if (vSegsOverlap(arrow.midX, arrow.y1, arrow.y2, other.midX, other.y1, other.y2)) {
        hasCrossing = true;
      }
    }

    const sortedH1 = [...new Set(h1Crossings)].sort((a, b) => a - b);
    const sortedH2 = [...new Set(h2Crossings)].sort((a, b) => a - b);

    let path = `M ${arrow.x1} ${arrow.y1}`;
    let curX = arrow.x1;
    for (const hopX of sortedH1) {
      if (hopX - HOP_R > curX) path += ` H ${hopX - HOP_R}`;
      path += ` A ${HOP_R} ${HOP_R} 0 0 0 ${hopX + HOP_R} ${arrow.y1}`;
      curX = hopX + HOP_R;
    }
    path += ` H ${arrow.midX}`;
    path += ` V ${arrow.y2}`;
    curX = arrow.midX;
    for (const hopX of sortedH2) {
      if (hopX - HOP_R > curX) path += ` H ${hopX - HOP_R}`;
      path += ` A ${HOP_R} ${HOP_R} 0 0 0 ${hopX + HOP_R} ${arrow.y2}`;
      curX = hopX + HOP_R;
    }
    path += ` H ${arrow.x2}`;

    return { from: arrow.from, to: arrow.to, path, hasCrossing, crossPoints };
  });
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [arrows, setArrows] = useState<ProcessedArrow[]>([]);
  const [svgW, setSvgW] = useState(5000);
  const [svgH, setSvgH] = useState(2000);
  const [hovered, setHovered] = useState<string | null>(null);

  const computeArrows = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    setSvgW(Math.max(content.scrollWidth, 100));
    setSvgH(Math.max(content.scrollHeight, 100));

    const contentRect = content.getBoundingClientRect();
    const rawArrows: RawArrow[] = [];

    for (const [from, to] of prerequisites) {
      const fromEl = cardRefs.current[from];
      const toEl = cardRefs.current[to];
      if (!fromEl || !toEl) continue;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();

      const x1 = Math.round(fRect.right - contentRect.left);
      const y1 = Math.round(fRect.top - contentRect.top + fRect.height / 2);
      const x2 = Math.round(tRect.left - contentRect.left);
      const y2 = Math.round(tRect.top - contentRect.top + tRect.height / 2);
      const midX = Math.round((x1 + x2) / 2);

      rawArrows.push({ from, to, x1, y1, midX, x2, y2 });
    }

    setArrows(buildProcessedArrows(rawArrows).map(a => ({
      ...a,
      crossPoints: a.crossPoints ?? [],
    })));
  }, []);

  useEffect(() => {
    computeArrows();
    const ro = new ResizeObserver(computeArrows);
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [computeArrows]);

  const prereqsOf = (id: string) =>
    prerequisites.filter(([, to]) => to === id).map(([f]) => f);
  const unlocksOf = (id: string) =>
    prerequisites.filter(([from]) => from === id).map(([, t]) => t);

  const highlighted = hovered
    ? new Set([hovered, ...prereqsOf(hovered), ...unlocksOf(hovered)])
    : null;

  const yearGroups = Array.from({ length: TOTAL_YEARS }, (_, i) => i + 1).map((year) => ({
    year,
    semesters: semesters.filter((s) => s.year === year),
  }));

  return (
    <div className="size-full flex flex-col bg-white overflow-hidden font-sans">
      <div className="flex-none px-6 py-3 flex items-center gap-3" style={{ background: "#1a4c5e" }}>
        <h1 className="text-white font-bold text-base tracking-tight leading-none">
          Plan de Estudios por Semestres
        </h1>
        <span className="text-white/40 text-xs font-mono">
          — Ingeniería Electrónica · 10 semestres
        </span>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto relative" onScroll={computeArrows}>
        <div ref={contentRef} className="relative inline-block min-w-full">
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgW}
            height={svgH}
            style={{ overflow: "visible", zIndex: 0 }}
          >
            <defs>
              {[
                { id: "ah-normal", color: ARROW_COLOR },
                { id: "ah-cross", color: ARROW_CROSS_COLOR },
                { id: "ah-dim", color: "rgba(0,0,0,0.1)" },
                { id: "ah-prereq", color: "#c0392b" },
                { id: "ah-unlock", color: "#1a7a3a" },
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

              if (isDim) {
                stroke = "rgba(0,0,0,0.15)";
                opacity = 0.08;
                sw = 1.5;
                marker = "url(#ah-dim)";
              } else if (isPrereq) {
                stroke = "#c0392b";
                opacity = 0.9;
                sw = 2.5;
                marker = "url(#ah-prereq)";
              } else if (isUnlock) {
                stroke = "#1a7a3a";
                opacity = 0.9;
                sw = 2.5;
                marker = "url(#ah-unlock)";
              } else if (highlighted) {
                opacity = 0.08;
              }

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

          {/* Year header row */}
          <div className="flex sticky top-0 z-20">
            {yearGroups.map(({ year, semesters: ySems }) => (
              <div
                key={year}
                className="flex-none flex items-center justify-center"
                style={{
                  width:
                    ySems.length * CARD_W +
                    (ySems.length - 1) * COL_GAP +
                    (year < TOTAL_YEARS ? COL_GAP : 0),
                  background: YEAR_COLORS[year].header,
                  padding: "8px 0",
                  borderRight: year < TOTAL_YEARS ? "2px solid rgba(255,255,255,0.15)" : "none",
                }}
              >
                <span className="text-white font-bold text-sm tracking-wide">Año {year}</span>
              </div>
            ))}
          </div>

          {/* Semester numbers */}
          <div className="flex">
            {semesters.map((sem, si) => (
              <div
                key={sem.number}
                className="flex-none"
                style={{ width: CARD_W + (si < semesters.length - 1 ? COL_GAP : 0) }}
              >
                <div className="text-center py-1" style={{ background: YEAR_COLORS[sem.year].bg }}>
                  <span className="font-bold text-lg" style={{ color: "#1a4c5e" }}>
                    {sem.number}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex relative" style={{ paddingBottom: 32 }}>
            {semesters.map((sem, si) => (
              <div
                key={sem.number}
                className="flex-none flex flex-col"
                style={{
                  width: CARD_W,
                  marginRight: si < semesters.length - 1 ? COL_GAP : 0,
                  background: YEAR_COLORS[sem.year].bg,
                  paddingTop: 16,
                  paddingBottom: 16,
                }}
              >
                <div className="flex flex-col gap-3 items-center">
                  {sem.courses.map((course) => {
                    const isActive = highlighted?.has(course.id) ?? false;
                    const isDim = highlighted && !isActive;
                    const isHov = hovered === course.id;
                    const isPrereq = hovered !== null && hovered !== course.id && prereqsOf(hovered).includes(course.id);
                    const isUnlock = hovered !== null && hovered !== course.id && unlocksOf(hovered).includes(course.id);

                    let borderColor = "#222";
                    let bg = "#fff";
                    let shadow = "none";

                    if (isHov) { borderColor = ARROW_COLOR; bg = "#f3e8ff"; shadow = `0 0 0 2px ${ARROW_COLOR}40`; }
                    else if (isPrereq) { borderColor = "#c0392b"; bg = "#fff5f5"; shadow = "0 0 0 1.5px #c0392b50"; }
                    else if (isUnlock) { borderColor = "#1a7a3a"; bg = "#f0fff4"; shadow = "0 0 0 1.5px #1a7a3a50"; }

                    return (
                      <div
                        key={course.id}
                        ref={(el) => { cardRefs.current[course.id] = el; }}
                        onMouseEnter={() => setHovered(course.id)}
                        onMouseLeave={() => setHovered(null)}
                        className="text-center cursor-default"
                        style={{
                          width: CARD_W - 8,
                          background: bg,
                          border: `1.5px solid ${borderColor}`,
                          borderRadius: 4,
                          padding: "8px 10px",
                          filter: isDim ? "grayscale(60%) opacity(0.3)" : "none",
                          boxShadow: shadow,
                          transition: "all 0.15s",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <div className="text-[11.5px] leading-snug" style={{ color: "#111" }}>
                          {course.name}
                        </div>
                        <div className="text-[11px] font-bold mt-1" style={{ color: "#111" }}>
                          ({course.credits})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 px-6 py-3 border-t flex-wrap" style={{ borderColor: "#e0e0e0" }}>
            <div className="flex items-center gap-2">
              <svg width="36" height="10">
                <line x1="0" y1="5" x2="28" y2="5" stroke={ARROW_COLOR} strokeWidth="2" />
                <polygon points="28 1, 36 5, 28 9" fill={ARROW_COLOR} />
              </svg>
              <span className="text-[11px] text-gray-500">Flujo normal</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="36" height="10">
                <line x1="0" y1="5" x2="28" y2="5" stroke={ARROW_CROSS_COLOR} strokeWidth="2" />
                <polygon points="28 1, 36 5, 28 9" fill={ARROW_CROSS_COLOR} />
              </svg>
              <span className="text-[11px] text-gray-500">Líneas que se cruzan</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="36" height="10">
                <line x1="0" y1="5" x2="28" y2="5" stroke="#c0392b" strokeWidth="2" />
                <polygon points="28 1, 36 5, 28 9" fill="#c0392b" />
              </svg>
              <span className="text-[11px] text-gray-500">Prerequisito (hover)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="36" height="10">
                <line x1="0" y1="5" x2="28" y2="5" stroke="#1a7a3a" strokeWidth="2" />
                <polygon points="28 1, 36 5, 28 9" fill="#1a7a3a" />
              </svg>
              <span className="text-[11px] text-gray-500">Desbloquea (hover)</span>
            </div>
            <span className="text-[11px] text-gray-400 ml-auto italic">
              Pasa el cursor sobre una materia para ver sus conexiones
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
