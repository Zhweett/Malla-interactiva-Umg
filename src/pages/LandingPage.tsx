import { useState } from "react";
import { careerRoute, Link } from "@/lib/router";
import { CAREER_LIST, getCareerPlan, TOTAL_YEARS, type CareerId } from "@/data/curriculum";

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

const PREVIEW_DATA: Record<CareerId, { bg: string; sem: string; courses: [string, string][]; approved: boolean[] }[]> = {
  electronica: [
    { bg: C.blush50, sem: "1", courses: [["Álgebra Lineal", "3"], ["Cálculo Dif.", "4"], ["Intro. Ing. E.", "2"], ["Programación", "3"]], approved: [true, true, true, true] },
    { bg: C.sage50,  sem: "2", courses: [["Cálculo Integ.", "4"], ["Circuitos DC", "4"], ["Física Mecánica", "4"], ["Programación II", "3"]], approved: [true, true, true, false] },
    { bg: C.blush50, sem: "3", courses: [["Cálc. Multivariable", "4"], ["Electrónica I", "4"], ["Ec. Diferenciales", "3"], ["Gral English III", "2"]], approved: [true, false, false, false] },
    { bg: C.sage50,  sem: "4", courses: [["Circuitos AC", "4"], ["Circuitos Dig.", "3"], ["Prob. y Estadística", "3"], ["Teoría EM I", "4"]], approved: [false, false, false, false] },
  ],
  sistemas: [
    { bg: C.blush50, sem: "1", courses: [["Algoritmos y Prog.", "4"], ["Cálculo Dif.", "4"], ["Intro. Ing. Sist.", "2"], ["Mat. Discretas", "4"]], approved: [true, true, true, true] },
    { bg: C.sage50,  sem: "2", courses: [["Álgebra Lineal", "3"], ["Cálculo Integ.", "4"], ["Est. de Datos I", "4"], ["POO", "4"]], approved: [true, true, true, false] },
    { bg: C.blush50, sem: "3", courses: [["Cálculo Vectorial", "4"], ["Est. de Datos II", "4"], ["Pens. de Sistemas", "2"], ["Prob. y Estadística", "3"]], approved: [true, false, false, false] },
    { bg: C.sage50,  sem: "4", courses: [["Bases de Datos", "4"], ["Ec. Diferenciales", "3"], ["Est. Inferencial", "3"], ["Sistemas Dig.", "4"]], approved: [false, false, false, false] },
  ],
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<CareerId>("electronica");
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
            <span style={{ fontFamily: "var(--font-display)", color: "white", fontSize: 17, display: "inline-block" }}>Mallas Interactiva</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="nav-links">
            <Link to="/" style={{ color: C.navy200, fontSize: 14, textDecoration: "none" }}>Inicio</Link>
            <Link to="/electronica/malla" style={{ color: C.navy200, fontSize: 14, textDecoration: "none" }}>Ing. Electrónica</Link>
            <Link to="/sistemas/malla" style={{ color: C.navy200, fontSize: 14, textDecoration: "none" }}>Ing. de Sistemas</Link>
          </div>

          <Link to={careerRoute(selectedCareer, "malla")} style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: C.orange500,
            color: "white", textDecoration: "none", transition: "background .15s",
          }}
            className="nav-cta">
            Ver malla
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} className="nav-burger"
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 6, display: "none" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
              {menuOpen ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div style={{ backgroundColor: C.navy900, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Link to="/" style={{ color: C.navy200, fontSize: 14, textDecoration: "none" }}>Inicio</Link>
            <Link to="/electronica/malla" style={{ color: C.navy200, fontSize: 14, textDecoration: "none" }}>Ing. Electrónica</Link>
            <Link to="/sistemas/malla" style={{ color: C.navy200, fontSize: 14, textDecoration: "none" }}>Ing. de Sistemas</Link>
            <Link to={careerRoute(selectedCareer, "malla")} style={{ marginTop: 4, padding: "10px 0", textAlign: "center", borderRadius: 8, backgroundColor: C.orange500, color: "white", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Ver malla</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 110, paddingBottom: 72, paddingLeft: 24, paddingRight: 24, background: `linear-gradient(170deg, ${C.navy950} 0%, ${C.navy800} 52%, #f7f8fa 52%)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="hero-grid">
          <div>
            <div style={{ display: "inline-flex", gap: 6, padding: 4, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", marginBottom: 22 }}>
              {CAREER_LIST.map((career) => {
                const active = career.id === selectedCareer;
                return (
                  <button
                    key={career.id}
                    onClick={() => setSelectedCareer(career.id)}
                    style={{
                      padding: "5px 13px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: active ? "rgba(240,146,30,0.22)" : "transparent",
                      color: active ? C.orange300 : C.navy200,
                      transition: "all .15s",
                    }}
                  >
                    {career.shortName}
                  </button>
                );
              })}
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08, fontWeight: 400, color: "white", margin: "0 0 18px" }}>
              La malla de tu carrera,{" "}
              <em style={{ color: C.orange300 }}>clara y navegable.</em>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: C.dorado, fontWeight: 300, marginBottom: 32, maxWidth: 440 }}>
              Visualiza todas las asignaturas, sus prerrequisitos y créditos en un diagrama interactivo. Planifica tu semestre y lleva el control de tu avance en Electrónica y Sistemas.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to={careerRoute(selectedCareer, "malla")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: C.orange500, color: "white", textDecoration: "none" }}>
                Explorar {activePlan.shortName}
                <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}><path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd"/></svg>
              </Link>
              <Link to={careerRoute(selectedCareer, "avance")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.22)", textDecoration: "none" }}>
                Ver avance
              </Link>
            </div>
          </div>

          {/* Mesh preview card */}
          <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 56px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div style={{ backgroundColor: C.navy950, padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <span style={{ color: "white", fontWeight: 600, fontSize: 12 }}>Plan de Estudios por Semestres</span>
                <span style={{ color: C.navy300, fontSize: 11, marginLeft: 6 }}>— {activePlan.shortName} · {TOTAL_YEARS * 2} semestres</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["Malla", true], ["Avance", false]].map(([label, active]) => (
                  <span key={label as string} style={{ padding: "3px 12px", borderRadius: 5, fontSize: 11, fontWeight: 600, fontFamily: "var(--font-body)", border: `1.5px solid ${active ? "white" : "rgba(255,255,255,0.22)"}`, backgroundColor: active ? "white" : "transparent", color: active ? C.navy950 : C.navy200 }}>{label}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", backgroundColor: "#eef1f4", borderBottom: `1px solid ${C.gray200}` }}>
              {["Año 1", "Año 2", "Año 3", "Año 4"].map((y, i) => (
                <div key={y} style={{ padding: "7px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: C.gray800, borderRight: i < 3 ? `1px solid ${C.gray200}` : "none" }}>{y}</div>
              ))}
            </div>
            <MeshPreview careerId={selectedCareer} />
          </div>
        </div>
      </section>

      {/* CAREERS */}
      <section style={{ padding: "72px 24px", backgroundColor: "white" }}>
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
                  <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)", color: C.orange500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {career.badge}
                  </span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: C.gray800, margin: "8px 0 12px" }}>
                    {career.name}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: C.gray600, fontWeight: 300, marginBottom: 20 }}>
                    {career.description}
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                      { val: String(career.semesters.length), lbl: "semestres" },
                      { val: String(career.totalCredits), lbl: "créditos" },
                      { val: String(career.allCourses.length), lbl: "asignaturas" },
                    ].map(({ val, lbl }) => (
                      <div key={lbl} style={{ textAlign: "center", borderRadius: 10, padding: "10px 16px", backgroundColor: "white", border: `1px solid ${C.gray200}`, minWidth: 76 }}>
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
              { icon: "✓", title: "Registro por carrera", desc: "Tu progreso y notas se guardan de forma independiente para Electrónica y Sistemas." },
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
            <Link to="/electronica/malla" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, fontSize: 14.5, fontWeight: 600, backgroundColor: C.orange500, color: "white", textDecoration: "none" }}>
              Ing. Electrónica
            </Link>
            <Link to="/sistemas/malla" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10, fontSize: 14.5, fontWeight: 600, backgroundColor: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.22)", textDecoration: "none" }}>
              Ing. de Sistemas
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
            <span style={{ fontFamily: "var(--font-display)", color: "white", fontSize: 15 }}>Mallas Interactiva</span>
          </div>
          <p style={{ fontSize: 12, color: C.navy300 }}>© 2026 Universidad. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 760px) {
          .hero-grid, .info-grid, .features-grid { grid-template-columns: 1fr !important; }
          .nav-links, .nav-cta { display: none !important; }
          .nav-burger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function MeshPreview({ careerId }: { careerId: CareerId }) {
  const cols = PREVIEW_DATA[careerId];

  return (
    <div style={{ display: "flex", overflowX: "auto", backgroundColor: "white" }}>
      {cols.map((col, ci) => (
        <div key={ci} style={{ flex: "0 0 auto", width: 128, backgroundColor: col.bg, borderRight: ci < cols.length - 1 ? `1px solid ${C.gray200}` : "none" }}>
          <div style={{ padding: "5px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: C.navy800, backgroundColor: C.gray100, borderBottom: `1px solid ${C.gray200}` }}>{col.sem}</div>
          <div style={{ padding: 7, display: "flex", flexDirection: "column", gap: 5 }}>
            {col.courses.map(([name, cr], i) => {
              const approved = col.approved[i];
              return (
                <div key={i} style={{ backgroundColor: "white", border: `1.5px solid ${approved ? C.orange400 : C.gray200}`, borderRadius: 7, padding: "7px 8px", position: "relative" }}>
                  <div style={{ fontSize: 10.5, lineHeight: 1.3, color: C.gray800, fontWeight: approved ? 600 : 400, paddingRight: approved ? 10 : 0 }}>{name}</div>
                  <div style={{ fontSize: 10, color: C.gray400, fontFamily: "var(--font-mono)" }}>({cr})</div>
                  {approved && <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: 99, backgroundColor: C.orange500 }} />}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
