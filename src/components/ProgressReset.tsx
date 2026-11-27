import { useState } from "react";

export default function ProgressReset({ reset, career }: { reset: () => void; career: string }) {
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button type="button" onClick={() => setConfirm(true)} className="min-h-11 rounded-md px-2 text-sm font-semibold text-red-800 underline">
        Reiniciar avance
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 text-sm">
      <span>¿Borrar el avance y las notas de {career} en este navegador?</span>
      <button type="button" onClick={() => { reset(); setConfirm(false); }} className="min-h-11 rounded-md px-2 font-bold text-red-800 underline">
        Sí, borrar
      </button>
      <button type="button" onClick={() => setConfirm(false)} className="min-h-11 rounded-md px-2 font-semibold underline">
        Cancelar
      </button>
    </div>
  );
}
