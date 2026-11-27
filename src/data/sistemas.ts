import type { CareerConfig } from "@/data/curriculum";

export const sistemasConfig = {
  id: "sistemas" as const,
  name: "Ingeniería de Sistemas",
  shortName: "Ing. de Sistemas",
  referenceUrl: "https://umg.edu.gt/ingenieria/sistemas",
  description:
    "Programa enfocado en el desarrollo de software, algoritmos, arquitectura computacional, bases de datos, redes y gestión de tecnologías de la información.",
  storagePrefix: "malla-sistemas",
  englishIds: ["eng1", "eng2", "eng3", "eng4", "eng5"],
  semesters: [
    {
      number: 1, year: 1,
      courses: [
        { id: "algprog",   name: "Algoritmos y Programación", credits: 4 },
        { id: "calcdif",   name: "Cálculo Diferencial", credits: 4 },
        { id: "eng1",      name: "General English I", credits: 2 },
        { id: "introsis",  name: "Introducción a la Ingeniería de Sistemas", credits: 2 },
        { id: "matdisc",   name: "Matemáticas Discretas", credits: 4 },
        { id: "proclec",   name: "Procesos Lectores y Escriturales", credits: 2 },
      ],
    },
    {
      number: 2, year: 1,
      courses: [
        { id: "alglin",    name: "Álgebra Lineal", credits: 3 },
        { id: "calcint",   name: "Cálculo Integral", credits: 4 },
        { id: "estdatos1", name: "Estructura de Datos I", credits: 4 },
        { id: "eng2",      name: "General English II", credits: 2 },
        { id: "poo",       name: "Programación Orientada a Objetos", credits: 4 },
      ],
    },
    {
      number: 3, year: 2,
      courses: [
        { id: "calcvec",   name: "Cálculo Vectorial", credits: 4 },
        { id: "estdatos2", name: "Estructura de Datos II", credits: 4 },
        { id: "exporal",   name: "Expresión Oral y Argumentación", credits: 2 },
        { id: "eng3",      name: "General English III", credits: 2 },
        { id: "pensist",   name: "Pensamiento de Sistemas", credits: 2 },
        { id: "probest",   name: "Probabilidad y Estadística", credits: 3 },
      ],
    },
    {
      number: 4, year: 2,
      courses: [
        { id: "basedatos", name: "Bases de Datos", credits: 4 },
        { id: "ecuadif",   name: "Ecuaciones Diferenciales", credits: 3 },
        { id: "estinf",    name: "Estadística Inferencial", credits: 3 },
        { id: "formhum",   name: "Formación Humanística y Ciudadana", credits: 2 },
        { id: "eng4",      name: "General English IV", credits: 2 },
        { id: "sisdig",    name: "Sistemas Digitales", credits: 4 },
      ],
    },
    {
      number: 5, year: 3,
      courses: [
        { id: "analnum",   name: "Análisis Numérico", credits: 3 },
        { id: "arqcomp",   name: "Arquitectura de Computadores", credits: 3 },
        { id: "eng5",      name: "General English V", credits: 2 },
        { id: "invop",     name: "Investigación de Operaciones Determinísticas", credits: 3 },
        { id: "matav",     name: "Matemáticas Avanzadas", credits: 3 },
        { id: "progweb",   name: "Programación para Web", credits: 4 },
      ],
    },
    {
      number: 6, year: 3,
      courses: [
        { id: "compiladores", name: "Compiladores", credits: 4 },
        { id: "fisicamec", name: "Física Mecánica", credits: 4 },
        { id: "ingsoft",   name: "Ingeniería de Software", credits: 4 },
        { id: "ingecon",   name: "Ingeniería Económica", credits: 3 },
        { id: "proydis",   name: "Proyecto de Diseño y Prototipado", credits: 2 },
      ],
    },
    {
      number: 7, year: 4,
      courses: [
        { id: "arqsoft",   name: "Arquitectura de Software", credits: 4 },
        { id: "calorond",  name: "Calor y Ondas", credits: 4 },
        { id: "disorgti",  name: "Diseño Organizacional de TI", credits: 4 },
        { id: "leginf",    name: "Legislación Informática", credits: 2 },
        { id: "sisop",     name: "Sistemas Operativos", credits: 4 },
      ],
    },
    {
      number: 8, year: 4,
      courses: [
        { id: "elecprof1", name: "Electiva de Profundización I", credits: 3 },
        { id: "elecmag",   name: "Electricidad y Magnetismo", credits: 4 },
        { id: "etica",     name: "Ética en Ingeniería de Sistemas", credits: 2 },
        { id: "gestproy",  name: "Gestión de Proyectos", credits: 3 },
        { id: "ia",        name: "Inteligencia Artificial", credits: 4 },
      ],
    },
    {
      number: 9, year: 5,
      courses: [
        { id: "dinsist",   name: "Dinámica de Sistemas", credits: 4 },
        { id: "elecprof2", name: "Electiva de Profundización II", credits: 3 },
        { id: "elecprof3", name: "Electiva de Profundización III", credits: 3 },
        { id: "expfinal",  name: "Experiencia Final de Diseño en Ingeniería", credits: 4 },
        { id: "redes",     name: "Redes", credits: 4 },
      ],
    },
    {
      number: 10, year: 5,
      courses: [
        { id: "elecprof4", name: "Electiva de Profundización IV", credits: 3 },
      ],
    },
  ],
  prerequisites: [
    // English chain
    ["eng1",      "eng2"],
    ["eng2",      "eng3"],
    ["eng3",      "eng4"],
    ["eng4",      "eng5"],

    // Expresión oral
    ["proclec",   "exporal"],

    // Matemáticas y Estadística
    ["calcdif",   "calcint"],
    ["calcint",   "calcvec"],
    ["calcint",   "ecuadif"],
    ["ecuadif",   "matav"],
    ["ecuadif",   "analnum"],
    ["ecuadif",   "dinsist"],
    ["alglin",    "invop"],
    ["probest",   "estinf"],

    // Física
    ["calcdif",   "fisicamec"],
    ["fisicamec", "calorond"],
    ["calorond",  "elecmag"],

    // Algoritmos, Programación e Ingeniería de Software
    ["algprog",   "estdatos1"],
    ["algprog",   "poo"],
    ["estdatos1", "estdatos2"],
    ["poo",       "progweb"],
    ["estdatos2", "basedatos"],
    ["estdatos2", "compiladores"],
    ["estdatos2", "ingsoft"],
    ["ingsoft",   "arqsoft"],
    ["compiladores", "ia"],

    // Arquitectura y Redes
    ["matdisc",   "sisdig"],
    ["sisdig",    "arqcomp"],
    ["arqcomp",   "sisop"],
    ["sisop",     "redes"],

    // Pensamiento de Sistemas y Diseño
    ["pensist",   "disorgti"],
    ["proydis",   "expfinal"],
  ],
  creditLocks: {
    proydis: 0.30,
    elecprof1: 0.70,
    elecprof2: 0.70,
    elecprof3: 0.70,
    elecprof4: 0.70,
    etica: 0.80,
    gestproy: 0.80,
  },
} satisfies CareerConfig;
