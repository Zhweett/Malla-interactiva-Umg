import { electronicaConfig } from "@/data/electronica";
import { sistemasConfig } from "@/data/sistemas";

const careerConfigs = [electronicaConfig, sistemasConfig];
export type CareerId = (typeof careerConfigs)[number]["id"];

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
  id: string;
  name: string;
  shortName: string;
  referenceUrl: string;
  description: string;
  storagePrefix: string;
  englishIds: string[];
  semesters: Semester[];
  prerequisites: [string, string][];
  creditLocks: Record<string, number>;
}

export interface CareerPlan extends CareerConfig {
  id: CareerId;
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

export const INK = "#1a4c5e";

export const yearColor = (year: number) => (year % 2 === 0 ? "#e2f0e2" : "#fce8e2");

function buildCareerPlan(config: CareerConfig & { id: CareerId }): CareerPlan {
  const allCourses = config.semesters.flatMap((s) => s.courses);
  const courseById = new Map(allCourses.map((c) => [c.id, c]));
  const semesterOfCourse = new Map(
    config.semesters.flatMap((s) => s.courses.map((c) => [c.id, s.number] as const)),
  );
  const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

  const requires = new Map<string, string[]>();
  const unlocks = new Map<string, string[]>();
  for (const [from, to] of config.prerequisites) {
    requires.set(to, [...(requires.get(to) ?? []), from]);
    unlocks.set(from, [...(unlocks.get(from) ?? []), to]);
  }
  const prereqsOf = (id: string) => requires.get(id) ?? [];
  const unlocksOf = (id: string) => unlocks.get(id) ?? [];

  const creditsOf = (ids: Iterable<string>): number => {
    let sum = 0;
    for (const id of ids) sum += courseById.get(id)?.credits ?? 0;
    return sum;
  };

  const creditsMissingFor = (id: string, approvedIds: Set<string>): number => {
    const minPercent = config.creditLocks[id];
    if (minPercent === undefined) return 0;
    const needed = Math.ceil(minPercent * totalCredits);
    return Math.max(0, needed - creditsOf(approvedIds));
  };

  const isCourseUnlocked = (id: string, approvedIds: Set<string>): boolean =>
    courseById.has(id) && prereqsOf(id).every((prerequisite) => approvedIds.has(prerequisite)) && creditsMissingFor(id, approvedIds) === 0;

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

export const CAREER_LIST = careerConfigs.map(buildCareerPlan);
const careersById = new Map(CAREER_LIST.map((career) => [career.id, career]));
export const DEFAULT_CAREER = careerConfigs[0].id;

export function isCareerId(id: string): id is CareerId {
  return careersById.has(id as CareerId);
}

export function getCareerPlan(careerId: CareerId): CareerPlan {
  return careersById.get(careerId)!;
}
