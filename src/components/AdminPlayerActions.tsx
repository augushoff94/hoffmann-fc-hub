import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Persona } from "@/lib/admin-listas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Target = { tipo: "adultas"; persona: Persona } | { tipo: "infantiles"; persona: Tables<"inscripciones_infantiles"> };

export function AdminPlayerActions({ target }: { target: Target }) {
  const qc = useQueryClient();
  const [modo, setModo] = useState<"editar" | "eliminar" | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const nombre = target.tipo === "adultas" ? target.persona.nombre : `${target.persona.apellidos}, ${target.persona.nombres}`;

  function abrir(accion: "editar" | "eliminar") { setError(""); setModo(accion); }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOcupado(true);
    setError("");
    const datos = new FormData(e.currentTarget);
    const valor = (campo: string) => String(datos.get(campo) ?? "").trim();
    try {
      const tabla = target.tipo === "adultas" ? "confirmaciones" : "inscripciones_infantiles";
      const ids = target.tipo === "adultas" ? target.persona.ids : [target.persona.id];
      if (modo === "eliminar") {
        const { data, error } = await supabase.from(tabla).delete().in("id", ids).select("id");
        if (error) throw error;
        if (data.length !== ids.length) throw new Error("No se pudieron eliminar todos los registros. Actualizá la lista y revisá tus permisos.");
      } else if (target.tipo === "adultas") {
        const { data, error } = await supabase.from("confirmaciones").update({ nombre: valor("nombre"), dni: valor("dni") }).in("id", ids).select("id");
        if (error) throw error;
        if (data.length !== ids.length) throw new Error("No se pudieron guardar todos los registros. Actualizá la lista y revisá tus permisos.");
      } else {
        const { data, error } = await supabase.from("inscripciones_infantiles").update({
          nombres: valor("nombres"), apellidos: valor("apellidos"), dni: valor("dni"),
          fecha_nacimiento: valor("fecha_nacimiento"), talle: valor("talle"), alergias: valor("alergias") || "No",
          tutor_nombre: valor("tutor_nombre"), tutor_telefono: valor("tutor_telefono"), sede: valor("sede"),
        }).eq("id", target.persona.id).select("id");
        if (error) throw error;
        if (data.length !== 1) throw new Error("No se pudo guardar. Actualizá la lista y revisá tus permisos.");
      }
      await qc.invalidateQueries({ queryKey: [tabla] });
      setModo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la acción. Revisá los datos e intentá nuevamente.");
    } finally { setOcupado(false); }
  }

  return <>
    <div className="hf-row-actions">
      <Button variant="ghost" size="icon" className="hf-action" aria-label={`Editar ${nombre}`} title={`Editar ${nombre}`} onClick={() => abrir("editar")}><Pencil /></Button>
      <Button variant="ghost" size="icon" className="hf-action hf-action-danger" aria-label={`Eliminar ${nombre}`} title={`Eliminar ${nombre}`} onClick={() => abrir("eliminar")}><Trash2 /></Button>
    </div>
    <Dialog open={modo !== null} onOpenChange={(open) => { if (!open && !ocupado) setModo(null); }}>
      <DialogContent className="hf-admin-dialog" onEscapeKeyDown={(e) => { if (ocupado) e.preventDefault(); }} onPointerDownOutside={(e) => { if (ocupado) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>{modo === "eliminar" ? "Eliminar jugadora" : "Editar jugadora"}</DialogTitle>
          <DialogDescription>{modo === "eliminar" ? `¿Eliminar a ${nombre}? Esta acción no se puede deshacer.${target.tipo === "adultas" ? " Se borrarán todas sus confirmaciones de Seguro y Reglamento." : ""}` : nombre}</DialogDescription>
        </DialogHeader>
        <form className="hf-form" onSubmit={enviar}>
          {modo === "editar" && (target.tipo === "adultas" ? <>
            <label>Nombre<input name="nombre" defaultValue={target.persona.nombre} required maxLength={150} pattern=".*\S.*" /></label>
            <label>DNI<input name="dni" defaultValue={target.persona.dni} required inputMode="numeric" maxLength={30} pattern=".*\S.*" /></label>
          </> : <div className="hf-edit-grid">
            <label>Nombres<input name="nombres" defaultValue={target.persona.nombres} required maxLength={100} pattern=".*\S.*" /></label>
            <label>Apellidos<input name="apellidos" defaultValue={target.persona.apellidos} required maxLength={100} pattern=".*\S.*" /></label>
            <label>DNI<input name="dni" defaultValue={target.persona.dni} required inputMode="numeric" pattern="[0-9. \-]{6,15}" /></label>
            <label>Fecha de nacimiento<input name="fecha_nacimiento" type="date" defaultValue={target.persona.fecha_nacimiento} required min="2000-01-01" max={new Date().toLocaleDateString("en-CA")} /></label>
            <label>Sede<select name="sede" defaultValue={target.persona.sede}><option>Área 93</option><option>Barrio 17 de Agosto</option></select></label>
            <label>Talle<input name="talle" defaultValue={target.persona.talle} required maxLength={20} pattern=".*\S.*" /></label>
            <label className="hf-edit-full">Alergias<textarea name="alergias" defaultValue={target.persona.alergias} maxLength={500} rows={2} /></label>
            <label className="hf-edit-full">Nombre del tutor<input name="tutor_nombre" defaultValue={target.persona.tutor_nombre} required maxLength={150} pattern=".*\S.*" /></label>
            <label className="hf-edit-full">Teléfono del tutor<input name="tutor_telefono" type="tel" defaultValue={target.persona.tutor_telefono} required pattern="[0-9+ ().\-]{6,30}" /></label>
          </div>)}
          <p className="hf-management-note">Los cambios afectan solo al panel; no modifican registros que ya estén en Google Drive.</p>
          {error && <p role="alert" className="hf-error">{error}</p>}
          <div className="hf-dialog-actions">
            <Button type="button" variant="outline" disabled={ocupado} onClick={() => setModo(null)}>Cancelar</Button>
            <Button type="submit" variant={modo === "eliminar" ? "destructive" : "default"} className={modo === "editar" ? "hf-action-primary" : ""} disabled={ocupado}>
              {modo === "eliminar" ? <Trash2 /> : <Save />}{ocupado ? "Procesando…" : modo === "eliminar" ? "Eliminar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}