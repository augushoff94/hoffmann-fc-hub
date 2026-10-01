import { createFileRoute } from "@tanstack/react-router";
import { HoffmannHeader } from "@/components/HoffmannHeader";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/1Oq4Cf2VLnF2xg7x3RCHUZJuXnw-WwbQAO5S0g0eDFWI/viewform";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hoffmann FC | Fútbol Femenino" },
      { name: "description", content: "Inscripción a Hoffmann FC en 3 pasos: formulario, seguro deportivo y reglamento interno." },
      { property: "og:title", content: "Hoffmann FC | Fútbol Femenino" },
      { property: "og:description", content: "Completá tu inscripción: formulario, seguro deportivo y reglamento interno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="hf-page">
      <HoffmannHeader subtitle="Inscripción en 3 pasos obligatorios" active="inicio" />
      <main className="hf-container">
        <div className="hf-card hf-center">
          <h3>¿Cómo completar tu inscripción?</h3>
          <p>Seguí los tres pasos en orden. Los tres son obligatorios para quedar activa en el plantel.</p>
        </div>
        <a className="hf-card hf-link" href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
          <span className="hf-num">1</span>
          <span>
            <strong>Formulario de inscripción</strong>
            <small>Completá tus datos personales y de salud</small>
          </span>
        </a>
        <a className="hf-card hf-link" href="/seguro.html">
          <span className="hf-num">2</span>
          <span>
            <strong>Leer y confirmar el Seguro Deportivo</strong>
            <small>Cobertura, procedimiento y reintegros</small>
          </span>
        </a>
        <a className="hf-card hf-link" href="/reglamento.html">
          <span className="hf-num">3</span>
          <span>
            <strong>Leer y confirmar el Reglamento Interno</strong>
            <small>Normas de convivencia del equipo</small>
          </span>
        </a>
        <div className="hf-footer">
          <p>Documento oficial de <strong>Hoffmann FC</strong> – Fútbol Femenino</p>
        </div>
      </main>
    </div>
  );
}
