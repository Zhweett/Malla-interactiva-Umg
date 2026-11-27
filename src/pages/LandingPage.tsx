import { useState } from "react";
import { careerRoute, Link } from "@/lib/router";
import { CAREER_LIST, DEFAULT_CAREER, getCareerPlan, type CareerId, type CareerPlan } from "@/data/curriculum";

const C = {
  navy950: "#0d1e2e",
  navy900: "#122436",
  navy800: "#1a3040",
  navy300: "#7aaabf",
  navy200: "#b0ceda",
  navy100: "#dceef5",
  orange500: "#e07c18",
  orange400: "#f0921e",
  orange300: "#f5b45a",
  orange100: "#fef0dc",
  blush50: "#fdf4f3",
  sage50: "#f3faf5",
  gray50: "#f7f8fa",
  gray100: "#eef0f3",
  gray200: "#dde1e7",
  gray400: "#9aa1ad",
  gray600: "#5a6272",
  gray800: "#2a3040",
  dorado: "#d4a72c",
};

export default function LandingPage() {
  const [selectedCareer, setSelectedCareer] = useState<CareerId>(DEFAULT_CAREER);
  const activePlan = getCareerPlan(selectedCareer);

  return (
    <div style={{ fontFamily: "var(--font-body)", backgroundColor: "#fff", color: C.gray800 }}>

      {/* NAV */}
      <nav style={{ backgroundColor: C.navy950, position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: C.orange500, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="white" width={17} height={17}><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-display)", color: "white", fontSize: 17, display: "inline-block" }}>Malla interactiva UMG</span>
          </div>

          <a href="#carreras" className="inline-flex min-h-11 items-center text-sm font-semibold text-white hover:underline">
            Carreras
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero" style={{ paddingTop: 110, paddingBottom: 72, paddingLeft: 24, paddingRight: 24, background: `linear-gradient(170deg, ${C.navy950} 0%, ${C.navy800} 52%, #f7f8fa 52%)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 56, alignItems: "center" }} className="hero-grid">
          <div>
            <label className="mb-5 inline-flex max-w-full items-center">
              <span className="sr-only">Elegir carrera</span>
              <select
                className="app-select min-h-11 max-w-full rounded-md border border-white/35 bg-[#1a3040] pl-3 pr-9 text-sm text-white"
                value={selectedCareer}
                onChange={(event) => {
                  const career = CAREER_LIST.find(({ id }) => id === event.target.value);
                  if (career) setSelectedCareer(career.id);
                }}
              >
                {CAREER_LIST.map((career) => <option key={career.id} value={career.id}>{career.name}</option>)}
              </select>
            </label>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08, fontWeight: 400, color: "white", margin: "0 0 18px" }}>
              La malla de tu carrera,{" "}
              <em style={{ color: C.orange300 }}>clara y navegable.</em>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: C.dorado, fontWeight: 300, marginBottom: 32, maxWidth: 440 }}>
              Consulta las materias, sus prerrequisitos y créditos. Planifica tu semestre y lleva el control de tu avance desde el navegador.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to={careerRoute(selectedCareer, "malla")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: C.orange500, color: "white", textDecoration: "none" }}>
                Explorar {activePlan.shortName}
              </Link>
              <Link to={careerRoute(selectedCareer, "avance")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.22)", textDecoration: "none" }}>
                Ver avance
              </Link>
            </div>
          </div>

          <MeshPreview plan={activePlan} />
        </div>
      </section>

      {/* CAREERS */}
      <section id="carreras" className="scroll-mt-16" style={{ padding: "72px 24px", backgroundColor: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.orange500, fontFamily: "var(--font-mono)", marginBottom: 10 }}>Planes disponibles</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 400, color: C.gray800, margin: 0 }}>
              Elige tu programa académico
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }} className="info-grid">
            {CAREER_LIST.map((career) => (
              <div key={career.id} style={{ borderRadius: 14, border: `1px solid ${C.gray200}`, padding: "26px 28px", backgroundColor: C.gray50, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: C.gray800, margin: "8px 0 12px" }}>
                    {career.name}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: C.gray600, fontWeight: 300, marginBottom: 20 }}>
                    {career.description}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { val: String(career.semesters.length), lbl: "semestres" },
                      { val: String(career.totalCredits), lbl: "créditos" },
                      { val: String(career.allCourses.length), lbl: "asignaturas" },
                    ].map(({ val, lbl }) => (
                      <div key={lbl} style={{ textAlign: "center", borderRadius: 10, padding: "8px 10px", backgroundColor: "white", border: `1px solid ${C.gray200}`, minWidth: 68 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: C.orange500, fontFamily: "var(--font-mono)", lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: 11.5, color: C.gray600, marginTop: 4 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link to={careerRoute(career.id, "malla")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, backgroundColor: C.orange500, color: "white", textDecoration: "none" }}>
                    Abrir malla
                  </Link>
                  <Link to={careerRoute(career.id, "avance")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, backgroundColor: "white", color: C.navy950, border: `1px solid ${C.gray200}`, textDecoration: "none" }}>
                    Seguimiento de avance
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="features-grid">
            {[
              { icon: "→", title: "Prerrequisitos visuales", desc: "Flechas conectan cada asignatura con sus dependencias para que nunca te pierdas." },
              { icon: "✓", title: "Registro por carrera", desc: "Tu progreso y notas se guardan en este navegador para cada carrera." },
              { icon: "◎", title: "Vista por semestre", desc: "Navega año a año y entiende la secuencia lógica del plan de estudios completo." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: 14, padding: "16px 18px", borderRadius: 10, border: `1px solid ${C.gray100}`, backgroundColor: "white" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.orange100, color: C.orange500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.gray800, marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, fontWeight: 300 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 24px", backgroundColor: C.navy950 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem,3.5vw,2.6rem)", fontWeight: 400, color: "white", lineHeight: 1.12, marginBottom: 16 }}>
            Empieza a explorar<br/><em style={{ color: C.orange300 }}>tu malla ahora.</em>
          </h2>
          <p style={{ fontSize: 15, color: C.navy200, fontWeight: 300, lineHeight: 1.7, marginBottom: 32 }}>
            Sin registro. Sin instalación. Abre la malla de tu carrera y comienza a planificar.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={careerRoute(selectedCareer, "malla")} style={{ display: "inline-flex", alignItems: "center", padding: "13px 26px", borderRadius: 10, fontSize: 14.5, fontWeight: 600, backgroundColor: C.orange500, color: "white", textDecoration: "none" }}>
              Abrir malla de {activePlan.shortName}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: C.navy900, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "22px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 5, backgroundColor: C.orange500, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="white" width={14} height={14}><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-display)", color: "white", fontSize: 15 }}>Malla interactiva UMG</span>
          </div>
          <p style={{ fontSize: 12, color: C.navy300 }}>Proyecto estudiantil independiente.</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 760px) {
          .hero-grid, .info-grid, .features-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .hero-grid { gap: 28px !important; }
          .landing-hero { background: #0d1e2e !important; padding: 88px 16px 36px !important; }
        }
      `}</style>
    </div>
  );
}

function MeshPreview({ plan }: { plan: CareerPlan }) {
  return (
    <section aria-label="Vista previa del plan" className="min-w-0 overflow-hidden rounded-xl bg-white shadow-2xl">
      <div className="bg-[#122436] px-4 py-3 text-white">
        <h2 className="font-semibold">Vista previa · {plan.shortName}</h2>
        <p className="text-sm text-[#b0ceda]">{plan.semesters.length} semestres</p>
      </div>
      <div className="grid grid-cols-1 gap-2 bg-[#eef0f3] p-3 min-[360px]:grid-cols-2">
        {plan.semesters.slice(0, 2).map((semester) => (
          <div key={semester.number} className="min-w-0 rounded-md bg-white p-3">
            <h3 className="mb-2 text-sm font-bold text-[#1a4c5e]">Semestre {semester.number}</h3>
            <ul className="space-y-2">
              {semester.courses.slice(0, 3).map((course) => (
                <li key={course.id} className="flex items-start justify-between gap-1 border-t border-[#eef0f3] pt-2 text-sm">
                  <span className="min-w-0 wrap-break-word">{course.name}</span>
                  <span className="shrink-0 text-xs text-[#5a6272]">{course.credits} cr.</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
