export type Confirmacion = { id: string; nombre: string; dni: string; documento: string; created_at: string };
export type Persona = { ids: string[]; nombre: string; dni: string; seguro: string | null; reglamento: string | null };

export function agrupar(data: Confirmacion[]): Persona[] {
  const mapa = new Map<string, Persona>();
  for (const r of data) {
    const clave = r.dni.trim().toLowerCase() || r.nombre.trim().toLowerCase();
    const actual = mapa.get(clave) ?? { ids: [], nombre: r.nombre, dni: r.dni, seguro: null, reglamento: null };
    actual.ids.push(r.id);
    if (r.documento === "seguro" && (!actual.seguro || r.created_at > actual.seguro)) actual.seguro = r.created_at;
    if (r.documento === "reglamento" && (!actual.reglamento || r.created_at > actual.reglamento)) actual.reglamento = r.created_at;
    mapa.set(clave, actual);
  }
  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function coincideBusqueda(busqueda: string, ...valores: string[]) {
  const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const consulta = normalizar(busqueda);
  return valores.some((v) => normalizar(v).includes(consulta) || (/^\d+$/.test(consulta) && v.replace(/\D/g, "").includes(consulta)));
}

export function crearCsv(filas: (string | number | null)[][]) {
  return "\uFEFF" + filas.map((fila) => fila.map((valor) => {
    let texto = String(valor ?? "");
    // Evita ejecutar fórmulas al abrir datos ingresados por otras personas.
    if (/^[\s]*[=+@-]/.test(texto)) texto = "'" + texto;
    return `"${texto.replace(/"/g, '""')}"`;
  }).join(";")).join("\r\n");
}

export function descargarCsv(nombre: string, filas: (string | number | null)[][]) {
  const url = URL.createObjectURL(new Blob([crearCsv(filas)], { type: "text/csv;charset=utf-8;" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}