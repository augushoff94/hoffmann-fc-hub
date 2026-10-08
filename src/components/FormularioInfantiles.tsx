import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calcularEdad } from "@/lib/edad";

const TALLES = ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L"];
const GOOGLE_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSfgY-FQXqma9UY_8kYXl1dxQxEdEXJFK41FOYPOVgCmC9FoVA/formResponse";

type Props = {
  sede: string;
  whatsapp: string;
  preinscripcion?: boolean;
  enviarGoogleForm?: boolean;
};

export function FormularioInfantiles({ sede, whatsapp, preinscripcion = false, enviarGoogleForm = false }: Props) {
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

  const accion = preinscripcion ? "preinscribir" : "inscribir";
  const titulo = preinscripcion ? "Formulario de preinscripción" : "Formulario de inscripción";

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
      tutor_nombre: f.tutor_nombre.trim(), tutor_telefono: f.tutor_telefono.trim(), sede,
    });
    if (error) { setEnviando(false); return setErr("No se pudo enviar. Intentá nuevamente."); }
    if (enviarGoogleForm) {
      // Copia a la planilla de Google (vía el Google Form original) — solo Área 93
      const fd = new URLSearchParams({
        "entry.56035384": f.nombres.trim(),
        "entry.989992132": f.apellidos.trim(),
        "entry.907551032": f.dni.trim(),
        "entry.1259455725": f.fecha_nacimiento,
        "entry.182554489": f.talle,
        "entry.2132429635": `${alergias} | Sede: ${sede}`,
        "entry.743095418": f.tutor_nombre.trim(),
        "entry.606520516": f.tutor_telefono.trim(),
      });
      try {
        await fetch(GOOGLE_FORM, { method: "POST", mode: "no-cors", body: fd });
      } catch { /* la inscripción ya quedó guardada */ }
    }
    setEnviando(false);
    const msg =
      `¡Hola Profe! Acabo de ${accion} a ${f.nombres.trim()} ${f.apellidos.trim()} en Hoffmann FC Infantiles.\n` +
      `Sede: ${sede}\n` +
      `DNI: ${f.dni.trim()}\nEdad: ${edad} años\nTalle: ${f.talle}\nAlergias: ${alergias}\n` +
      `Tutor: ${f.tutor_nombre.trim()} (${f.tutor_telefono.trim()})`;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    setListo(url);
    window.location.href = url;
  }

  return (
    <div className="hf-page">
      <header className="hf-header">
        <div className="hf-logo"><img src="/logo.png" alt="Hoffmann FC" /></div>
        <div className="hf-badge">Infantiles 2026</div>
        <h1>Hoffmann FC</h1>
        <p>{titulo} · Sede {sede}</p>
        <div className="hf-accent" />
      </header>
      <main className="hf-container">
        {listo ? (
          <div className="hf-card hf-center">
            <h3>¡{preinscripcion ? "Preinscripción" : "Inscripción"} registrada!</h3>
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
              {enviando ? "Enviando…" : `Completar ${preinscripcion ? "preinscripción" : "inscripción"}`}
            </button>
          </form>
        )}
      </main>
      <footer className="hf-footer"><strong>Hoffmann FC</strong> · Infantiles · Sede {sede}</footer>
    </div>
  );
}
