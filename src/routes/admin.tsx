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

type Filtro = "todos" | "seguro" | "reglamento";

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
      return data;
    },
  });
  const rows = (data ?? []).filter((r) => filtro === "todos" || r.documento === filtro);
  const count = (d: string) => (data ?? []).filter((r) => r.documento === d).length;

  return (
    <div className="hf-page">
      <HoffmannHeader subtitle="Panel de confirmaciones de lectura" active="admin" />
      <main className="hf-container hf-wide">
        <div className="hf-filters">
          {(["todos", "seguro", "reglamento"] as Filtro[]).map((f) => (
            <button key={f} className={filtro === f ? "active" : ""} onClick={() => setFiltro(f)}>
              {f === "todos" ? `Todos (${data?.length ?? 0})` : f === "seguro" ? `Seguro (${count("seguro")})` : `Reglamento (${count("reglamento")})`}
            </button>
          ))}
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
                <tr><th>Nombre</th><th>D.N.I.</th><th>Documento</th><th>Fecha y hora</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nombre}</td>
                    <td>{r.dni}</td>
                    <td><span className={`hf-tag ${r.documento}`}>{r.documento === "seguro" ? "Seguro" : "Reglamento"}</span></td>
                    <td>{new Date(r.created_at).toLocaleString("es-AR")}</td>
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
