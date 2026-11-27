import { electronicaConfig } from "@/data/electronica";
import { sistemasConfig } from "@/data/sistemas";

export type CareerId = "electronica" | "sistemas";

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

export interface CareerConfig {
  id: CareerId;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  storagePrefix: string;
  englishIds: string[];
  semesters: Semester[];
  prerequisites: [string, string][];
  creditLocks: Record<string, number>;
}

export interface CareerPlan extends CareerConfig {
  allCourses: Course[];
  courseById: Map<string, Course>;
  semesterOfCourse: Map<string, number>;
  totalCredits: number;
  prereqsOf: (id: string) => string[];
  unlocksOf: (id: string) => string[];
  creditsOf: (ids: Iterable<string>) => number;
  isCourseUnlocked: (id: string, approvedIds: Set<string>) => boolean;
  creditsMissingFor: (id: string, approvedIds: Set<string>) => number;
}

export const YEAR_COLORS: Record<number, { bg: string; header: string }> = {
  1: { bg: "#fce8e2", header: "#1a4c5e" },
  2: { bg: "#e2f0e2", header: "#1a4c5e" },
  3: { bg: "#fce8e2", header: "#1a4c5e" },
  4: { bg: "#e2f0e2", header: "#1a4c5e" },
  5: { bg: "#fce8e2", header: "#1a4c5e" },
};

export const TOTAL_YEARS = 5;
export const INK = "#1a4c5e";

function buildCareerPlan(config: CareerConfig): CareerPlan {
  const allCourses = config.semesters.flatMap((s) => s.courses);
  const courseById = new Map(allCourses.map((c) => [c.id, c]));
  const semesterOfCourse = new Map(
    config.semesters.flatMap((s) => s.courses.map((c) => [c.id, s.number] as const)),
  );
  const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

  const prereqsOf = (id: string): string[] =>
    config.prerequisites.filter(([, to]) => to === id).map(([from]) => from);

  const unlocksOf = (id: string): string[] =>
    config.prerequisites.filter(([from]) => from === id).map(([, to]) => to);

  const creditsOf = (ids: Iterable<string>): number => {
    let sum = 0;
    for (const id of ids) sum += courseById.get(id)?.credits ?? 0;
    return sum;
  };

  const isCourseUnlocked = (id: string, approvedIds: Set<string>): boolean => {
    if (!prereqsOf(id).every((p) => approvedIds.has(p))) return false;
    const minPercent = config.creditLocks[id];
    if (minPercent !== undefined && creditsOf(approvedIds) / totalCredits < minPercent) {
      return false;
    }
    return true;
  };

  const creditsMissingFor = (id: string, approvedIds: Set<string>): number => {
    const minPercent = config.creditLocks[id];
    if (minPercent === undefined) return 0;
    const needed = Math.ceil(minPercent * totalCredits);
    return Math.max(0, needed - creditsOf(approvedIds));
  };

  return {
    ...config,
    allCourses,
    courseById,
    semesterOfCourse,
    totalCredits,
    prereqsOf,
    unlocksOf,
    creditsOf,
    isCourseUnlocked,
    creditsMissingFor,
  };
}

export const CAREERS: Record<CareerId, CareerPlan> = {
  electronica: buildCareerPlan(electronicaConfig),
  sistemas: buildCareerPlan(sistemasConfig),
};

export const CAREER_LIST: CareerPlan[] = [CAREERS.electronica, CAREERS.sistemas];

export const getCareerPlan = (careerId: CareerId): CareerPlan => CAREERS[careerId];
