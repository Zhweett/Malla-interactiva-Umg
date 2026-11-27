import { useState } from "react";
import { yearColor, type CareerPlan } from "@/data/curriculum";

interface SemesterListProps {
  plan: CareerPlan;
  approved: Set<string>;
  toggle: (id: string) => void;
  setMany: (ids: string[], value: boolean) => void;
}

const control = "min-h-11 rounded-md border border-[#bfced5] bg-white px-3 text-sm font-semibold text-[#1a4c5e] disabled:opacity-45";

export default function SemesterList({ plan, approved, toggle, setMany }: SemesterListProps) {
  const { semesters, courseById, semesterOfCourse } = plan;
  const [index, setIndex] = useState(0);
  const semester = semesters[index];
  const ids = semester.courses.map(({ id }) => id);
  const completed = ids.filter((id) => approved.has(id)).length;
  const allDone = completed === ids.length;

  return (
    <section className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:hidden" aria-label="Malla por semestre">
      <label className="mb-1 block text-sm font-bold text-[#1a4c5e]" htmlFor="malla-semestre">Ir al semestre</label>
      <select
        id="malla-semestre"
        value={index}
        onChange={(event) => setIndex(Number(event.target.value))}
        className={`app-select w-full pr-8 ${control}`}
      >
        {semesters.map((item, position) => (
          <option key={item.number} value={position}>Semestre {item.number} · Año {item.year}</option>
        ))}
      </select>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className={control} disabled={index === 0} onClick={() => setIndex(index - 1)}>Anterior</button>
        <button type="button" className={control} disabled={index === semesters.length - 1} onClick={() => setIndex(index + 1)}>Siguiente</button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg px-3 py-2" style={{ background: yearColor(semester.year) }}>
        <div aria-live="polite">
          <h2 className="font-bold text-[#1a4c5e]">Semestre {semester.number}</h2>
          <p className="text-sm text-slate-700">{completed} de {ids.length} aprobadas</p>
        </div>
        <button type="button" className={control} onClick={() => setMany(ids, !allDone)}>
          {allDone ? "Desmarcar todas" : "Marcar todas"}
        </button>
      </div>

      <ul key={semester.number} className="mt-3 space-y-3">
        {semester.courses.map((course) => {
          const done = approved.has(course.id);
          const available = plan.isCourseUnlocked(course.id, approved);
          const requirements = plan.prereqsOf(course.id);
          const unlocks = plan.unlocksOf(course.id);
          const credits = plan.creditsMissingFor(course.id, approved);
          const status = done ? "Aprobada" : available ? "Disponible" : "Bloqueada";
          const statusColor = done ? "bg-green-100 text-green-900" : available ? "bg-sky-100 text-sky-900" : "bg-slate-100 text-slate-700";
          return (
            <li key={course.id} className="rounded-lg border border-[#dce5e9] bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="min-w-0 flex-[1_1_9rem] break-words font-semibold leading-snug text-slate-900">{course.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor}`}>{status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{course.credits} {course.credits === 1 ? "crédito" : "créditos"}</p>
              <details className="mt-2 text-sm text-slate-700">
                <summary className="min-h-11 cursor-pointer rounded-md py-3 font-semibold text-[#1a4c5e]">Prerrequisitos y conexiones</summary>
                <div className="space-y-3 pb-3">
                  <div>
                    <p className="font-semibold">Prerrequisitos</p>
                    {requirements.length === 0 ? <p>Sin materias previas.</p> : (
                      <ul className="ml-4 list-disc">
                        {requirements.map((id) => (
                          <li key={id}>{courseById.get(id)?.name ?? id} · {approved.has(id) ? "Aprobada" : "Pendiente"}</li>
                        ))}
                      </ul>
                    )}
                    {credits > 0 && <p className="mt-1">Faltan {credits} créditos aprobados.</p>}
                  </div>
                  {unlocks.length > 0 && (
                    <div>
                      <p className="font-semibold">Es prerrequisito de</p>
                      <ul className="ml-4 list-disc">
                        {unlocks.map((id) => (
                          <li key={id}>{courseById.get(id)?.name ?? id} · Semestre {semesterOfCourse.get(id)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
              <button
                type="button"
                aria-label={`${done ? "Desmarcar" : "Marcar como aprobada"}: ${course.name}`}
                onClick={() => toggle(course.id)}
                className={`${control} w-full ${done ? "border-green-300 bg-green-50 text-green-900" : ""}`}
              >
                {done ? "Desmarcar" : "Marcar como aprobada"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
