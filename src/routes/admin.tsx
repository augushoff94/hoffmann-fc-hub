import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoffmannHeader } from "@/components/HoffmannHeader";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de confirmaciones | Hoffmann FC" },
      { name: "description", content: "Listado de jugadoras que confirmaron la lectura del seguro y el reglamento." },
      { property: "og:title", content: "Panel de confirmaciones | Hoffmann FC" },
      { property: "og:description", content: "Confirmaciones de lectura de Hoffmann FC." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Filtro = "todos" | "completos" | "incompletos";

type Confirmacion = {
  id: string;
  nombre: string;
  dni: string;
  documento: string;
  created_at: string;
};

type Persona = {
  nombre: string;
  dni: string;
  seguro: string | null;
  reglamento: string | null;
};

function agrupar(data: Confirmacion[]): Persona[] {
  const mapa = new Map<string, Persona>();
  for (const r of data) {
    const clave = r.dni.trim().toLowerCase() || r.nombre.trim().toLowerCase();
    const actual = mapa.get(clave) ?? { nombre: r.nombre, dni: r.dni, seguro: null, reglamento: null };
    if (r.documento === "seguro" && (!actual.seguro || r.created_at > actual.seguro)) actual.seguro = r.created_at;
    if (r.documento === "reglamento" && (!actual.reglamento || r.created_at > actual.reglamento)) actual.reglamento = r.created_at;
    mapa.set(clave, actual);
  }
  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

function Tilde({ fecha }: { fecha: string | null }) {
  if (!fecha) return <span className="hf-check no">—</span>;
  return (
    <span className="hf-check si" title={new Date(fecha).toLocaleString("es-AR")}>
      ✓ <small>{new Date(fecha).toLocaleString("es-AR")}</small>
    </span>
  );
}

function Admin() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const { data, isLoading, error } = useQuery({
    queryKey: ["confirmaciones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("confirmaciones")
        .select("id, nombre, dni, documento, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Confirmacion[];
    },
  });

  const personas = agrupar(data ?? []);
  const completos = personas.filter((p) => p.seguro && p.reglamento);
  const incompletos = personas.filter((p) => !p.seguro || !p.reglamento);
  const rows =
    filtro === "completos" ? completos : filtro === "incompletos" ? incompletos : personas;

  return (
    <div className="hf-page">
      <HoffmannHeader subtitle="Panel de confirmaciones de lectura" active="admin" />
      <main className="hf-container hf-wide">
        <div className="hf-filters">
          <button className={filtro === "todos" ? "active" : ""} onClick={() => setFiltro("todos")}>
            Todas ({personas.length})
          </button>
          <button className={filtro === "completos" ? "active" : ""} onClick={() => setFiltro("completos")}>
            Completaron ambos ({completos.length})
          </button>
          <button className={filtro === "incompletos" ? "active" : ""} onClick={() => setFiltro("incompletos")}>
            Les falta alguno ({incompletos.length})
          </button>
        </div>
        <div className="hf-card hf-table-wrap">
          {isLoading ? (
            <p>Cargando…</p>
          ) : error ? (
            <p>No se pudieron cargar las confirmaciones.</p>
          ) : rows.length === 0 ? (
            <p>Todavía no hay confirmaciones.</p>
          ) : (
            <table className="hf-table">
              <thead>
                <tr><th>Nombre</th><th>D.N.I.</th><th>Seguro</th><th>Reglamento</th></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.dni || p.nombre}>
                    <td>{p.nombre}</td>
                    <td>{p.dni}</td>
                    <td><Tilde fecha={p.seguro} /></td>
                    <td><Tilde fecha={p.reglamento} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
