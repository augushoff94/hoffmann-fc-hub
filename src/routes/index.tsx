import { createFileRoute } from "@tanstack/react-router";
import { HoffmannHeader } from "@/components/HoffmannHeader";

// Placeholder: replace with the definitive Google Form URL.
const GOOGLE_FORM_URL = "https://forms.google.com/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hoffmann FC | Fútbol Femenino" },
      { name: "description", content: "Portal de Hoffmann FC: formulario de inscripción, seguro deportivo y reglamento interno." },
      { property: "og:title", content: "Hoffmann FC | Fútbol Femenino" },
      { property: "og:description", content: "Formulario, seguro deportivo y reglamento interno de Hoffmann FC." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="hf-page">
      <HoffmannHeader subtitle="Bienvenida al portal del club" active="inicio" />
      <main className="hf-container">
        <div className="hf-card hf-center">
          <h3>Formulario del club</h3>
          <p>Completá el formulario para registrar tus datos en Hoffmann FC.</p>
          <a className="hf-btn" href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
            Abrir formulario
          </a>
        </div>
        <a className="hf-card hf-link" href="/seguro.html">
          <span className="hf-num">1</span>
          <span>
            <strong>Seguro Deportivo</strong>
            <small>Cobertura, procedimiento y reintegros</small>
          </span>
        </a>
        <a className="hf-card hf-link" href="/reglamento.html">
          <span className="hf-num">2</span>
          <span>
            <strong>Reglamento Interno</strong>
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
