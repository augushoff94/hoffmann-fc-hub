import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP = "5493794668266";
const TALLES = ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L"];

export const Route = createFileRoute("/infantiles")({
  head: () => ({
    meta: [
      { title: "Inscripción Infantiles | Hoffmann FC" },
      { name: "description", content: "Formulario de inscripción para la categoría Infantiles de Hoffmann FC." },
      { property: "og:title", content: "Inscripción Infantiles | Hoffmann FC" },
      { property: "og:description", content: "Inscribí a tu hijo o hija en Hoffmann FC Infantiles en un minuto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Infantiles,
});

export function calcularEdad(fecha: string): number | null {
  if (!fecha) return null;
  const n = new Date(fecha + "T00:00:00");
  if (isNaN(n.getTime())) return null;
  const h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--;
  return e;
}

function Infantiles() {
  const [f, setF] = useState({
    nombres: "", apellidos: "", dni: "", fecha_nacimiento: "", talle: "",
    tieneAlergia: "No", alergiaDetalle: "", tutor_nombre: "", tutor_telefono: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const edad = calcularEdad(f.fecha_nacimiento);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (edad === null || edad < 2 || edad > 18) return setErr("Revisá la fecha de nacimiento.");
    if (f.tieneAlergia === "Sí" && !f.alergiaDetalle.trim()) return setErr("Especificá la alergia.");
    const alergias = f.tieneAlergia === "Sí" ? `Sí: ${f.alergiaDetalle.trim()}` : "No";
    setEnviando(true);
    const { error } = await supabase.from("inscripciones_infantiles").insert({
      nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), dni: f.dni.trim(),
      fecha_nacimiento: f.fecha_nacimiento, talle: f.talle, alergias,
      tutor_nombre: f.tutor_nombre.trim(), tutor_telefono: f.tutor_telefono.trim(),
    });
    setEnviando(false);
    if (error) return setErr("No se pudo enviar la inscripción. Intentá nuevamente.");
    const msg =
      `¡Hola Profe! Acabo de inscribir a ${f.nombres.trim()} ${f.apellidos.trim()} en Hoffmann FC Infantiles.\n` +
      `DNI: ${f.dni.trim()}\nEdad: ${edad} años\nTalle: ${f.talle}\nAlergias: ${alergias}\n` +
      `Tutor: ${f.tutor_nombre.trim()} (${f.tutor_telefono.trim()})`;
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    setListo(url);
    window.location.href = url;
  }

  return (
    <div className="hf-page">
      <header className="hf-header">
        <div className="hf-logo"><img src="/logo.png" alt="Hoffmann FC" /></div>
        <div className="hf-badge">Infantiles 2026</div>
        <h1>Hoffmann FC</h1>
        <p>Formulario de inscripción</p>
        <div className="hf-accent" />
      </header>
      <main className="hf-container">
        {listo ? (
          <div className="hf-card hf-center">
            <h3>¡Inscripción registrada!</h3>
            <p>Si WhatsApp no se abrió automáticamente, tocá el botón para avisarle al profe.</p>
            <a className="hf-btn" href={listo}>Enviar por WhatsApp</a>
          </div>
        ) : (
          <form className="hf-card hf-form" onSubmit={enviar}>
            <h3 className="hf-form-title">Datos del jugador/a</h3>
            <label>Nombres<input required value={f.nombres} onChange={set("nombres")} /></label>
            <label>Apellidos<input required value={f.apellidos} onChange={set("apellidos")} /></label>
            <label>DNI<input required inputMode="numeric" value={f.dni} onChange={set("dni")} /></label>
            <label>Fecha de nacimiento
              <input required type="date" value={f.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
            </label>
            {edad !== null && edad >= 0 && (
              <div className="hf-edad">Edad: <strong>{edad} años</strong> · Categoría {f.fecha_nacimiento.slice(0, 4)}</div>
            )}
            <label>Talle de camiseta
              <select required value={f.talle} onChange={set("talle")}>
                <option value="">Elegí un talle</option>
                {TALLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>¿Tiene alergias?
              <select value={f.tieneAlergia} onChange={set("tieneAlergia")}>
                <option>No</option><option>Sí</option>
              </select>
            </label>
            {f.tieneAlergia === "Sí" && (
              <label>¿Cuál?<input required value={f.alergiaDetalle} onChange={set("alergiaDetalle")} /></label>
            )}
            <h3 className="hf-form-title">Datos del tutor</h3>
            <label>Nombre y apellido del tutor<input required value={f.tutor_nombre} onChange={set("tutor_nombre")} /></label>
            <label>Teléfono del tutor<input required type="tel" value={f.tutor_telefono} onChange={set("tutor_telefono")} /></label>
            {err && <p className="hf-error">{err}</p>}
            <button className="hf-btn hf-btn-full" disabled={enviando}>
              {enviando ? "Enviando…" : "Completar inscripción"}
            </button>
          </form>
        )}
      </main>
      <footer className="hf-footer"><strong>Hoffmann FC</strong> · Infantiles</footer>
    </div>
  );
}
