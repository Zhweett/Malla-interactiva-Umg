// Datos del plan de estudios de Ingeniería Electrónica.
// Compartidos por la malla interactiva y la página de seguimiento de avance.

export interface Course {
  id: string;
  name: string;
  credits: number;
}

export interface Semester {
  number: number;
  year: number;
  courses: Course[];
}

export const semesters: Semester[] = [
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

export const prerequisites: [string, string][] = [
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

export const YEAR_COLORS: Record<number, { bg: string; header: string }> = {
  1: { bg: "#fce8e2", header: "#1a4c5e" },
  2: { bg: "#e2f0e2", header: "#1a4c5e" },
  3: { bg: "#fce8e2", header: "#1a4c5e" },
  4: { bg: "#e2f0e2", header: "#1a4c5e" },
  5: { bg: "#fce8e2", header: "#1a4c5e" },
};

export const TOTAL_YEARS = 5;
export const INK = "#1a4c5e";

export const allCourses: Course[] = semesters.flatMap((s) => s.courses);

export const courseById = new Map(allCourses.map((c) => [c.id, c]));

export const semesterOfCourse = new Map(
  semesters.flatMap((s) => s.courses.map((c) => [c.id, s.number] as const)),
);

export const TOTAL_CREDITS = allCourses.reduce((sum, c) => sum + c.credits, 0);

/** Materias que deben aprobarse antes de cada materia. */
export const prereqsOf = (id: string): string[] =>
  prerequisites.filter(([, to]) => to === id).map(([from]) => from);

/** Materias que se habilitan al aprobar esta. */
export const unlocksOf = (id: string): string[] =>
  prerequisites.filter(([from]) => from === id).map(([, to]) => to);

export const creditsOf = (ids: Iterable<string>): number => {
  let sum = 0;
  for (const id of ids) sum += courseById.get(id)?.credits ?? 0;
  return sum;

  // Nuevo: materias que además del prerrequisito normal exigen un % de créditos aprobados
export const creditLocks: Record<string, number> = {
  proyculm: 0.75,   // ej: Proyecto Culminante exige 75% de créditos aprobados
  elecprofA: 0.60,
  elecprofB: 0.60,
};

/** Determina si una materia está desbloqueada dado un set de materias aprobadas. */
export const isCourseUnlocked = (
  id: string,
  approvedIds: Set<string>,
): boolean => {
  const prereqsOk = prereqsOf(id).every((p) => approvedIds.has(p));
  if (!prereqsOk) return false;

  const minPercent = creditLocks[id];
  if (minPercent !== undefined) {
    const approvedCredits = creditsOf(approvedIds);
    if (approvedCredits / TOTAL_CREDITS < minPercent) return false;
  }
  return true;
};

/** Créditos que faltan para desbloquear por porcentaje (útil para mostrar en UI). */
export const creditsMissingFor = (
  id: string,
  approvedIds: Set<string>,
): number => {
  const minPercent = creditLocks[id];
  if (minPercent === undefined) return 0;
  const needed = Math.ceil(minPercent * TOTAL_CREDITS);
  const approvedCredits = creditsOf(approvedIds);
  return Math.max(0, needed - approvedCredits);
};
};
