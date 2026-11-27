import type { CareerPlan } from "@/data/curriculum";

export default function PlanNotice({ plan, saveError }: { plan: CareerPlan; saveError: boolean }) {
  return (
    <div className="border-b border-[#dce5e9] bg-[#f5f8fa] px-4 py-2 text-sm text-slate-700 sm:px-6">
      <p>
        El plan del proyecto puede diferir del pensum de tu sede.{" "}
        <a href={plan.referenceUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#1a4c5e] underline underline-offset-2">
          Consultar la malla publicada por la UMG
        </a>
      </p>
      {saveError && <p role="alert" className="mt-1 text-red-800">El navegador no pudo guardar el avance. Los cambios quedarán en esta página mientras siga abierta.</p>}
    </div>
  );
}
