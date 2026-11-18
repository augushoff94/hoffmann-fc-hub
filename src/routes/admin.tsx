import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { HoffmannHeader } from "@/components/HoffmannHeader";
import { calcularEdad } from "@/lib/edad";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPlayerActions } from "@/components/AdminPlayerActions";
import { agrupar, coincideBusqueda, descargarCsv, type Confirmacion } from "@/lib/admin-listas";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de administración | Hoffmann FC" },
      { name: "description", content: "Panel privado del DT de Hoffmann FC." },
      { property: "og:title", content: "Panel de administración | Hoffmann FC" },
      { property: "og:description", content: "Panel privado del DT de Hoffmann FC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => data.subscription.unsubscribe();
  }, []);

  const { data: esAdmin, isLoading } = useQuery({
    queryKey: ["es-admin", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      if (!session) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
      return !!data;
    },
  });

  return (
    <div className="hf-page">
      <HoffmannHeader subtitle="Panel de administración" active="admin" />
      <main className="hf-container hf-wide">
        {session === undefined || (session && isLoading) ? (
          <p>Cargando…</p>
        ) : !session ? (
          <Login />
        ) : !esAdmin ? (
          <div className="hf-card hf-center">
            <h3>Sin permisos</h3>
            <p>Tu cuenta todavía no tiene acceso de administrador.</p>
            <Salir />
          </div>
        ) : (
          <Panel email={session.user.email ?? ""} />
        )}
      </main>
    </div>
  );
}

function aCorreo(usuario: string) {
  const u = usuario.trim().toLowerCase();
  if (u.includes("@")) return u;
  return `${u.replace(/[^a-z0-9._-]/g, "")}@hoffmannfc.app`;
}

function Login() {
  const [modo, setModo] = useState<"entrar" | "registro">("entrar");
  const [usuario, setUsuario] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pass.length < 6) return setMsg("La contraseña tiene que tener al menos 6 caracteres.");
    setCargando(true);
    const email = aCorreo(usuario);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setMsg("Usuario o contraseña incorrectos.");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password: pass, options: { data: { usuario: usuario.trim() } },
      });
      if (error) setMsg(error.message.includes("registered") ? "Ese usuario ya existe." : error.message);
    }
    setCargando(false);
  }

  return (
    <form className="hf-card hf-form hf-login" onSubmit={enviar}>
      <h3 className="hf-form-title">{modo === "entrar" ? "Ingresar como administrador" : "Crear cuenta"}</h3>
      <label>Usuario<input required autoCapitalize="none" value={usuario} onChange={(e) => setUsuario(e.target.value)} /></label>
      <label>Contraseña<input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} /></label>
      {msg && <p className="hf-error">{msg}</p>}
      <button className="hf-btn hf-btn-full" disabled={cargando}>{modo === "entrar" ? "Ingresar" : "Crear cuenta"}</button>
      <button type="button" className="hf-textlink" onClick={() => { setModo(modo === "entrar" ? "registro" : "entrar"); setMsg(""); }}>
        {modo === "entrar" ? "¿No tenés cuenta? Crear una" : "Ya tengo cuenta, ingresar"}
      </button>
    </form>
  );
}

function Salir() {
  const qc = useQueryClient();
  return (
    <button className="hf-textlink" onClick={async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); }}>
      Cerrar sesión
    </button>
  );
}

function Panel({ email }: { email: string }) {
  const [tab, setTab] = useState<"adultas" | "infantiles">("adultas");
  return (
    <>
      <div className="hf-adminbar"><span>{email.replace("@hoffmannfc.app", "")}</span><Salir /></div>
      <Enlaces />
      <div className="hf-tabs">
        <button className={tab === "adultas" ? "active" : ""} onClick={() => setTab("adultas")}>Adultas</button>
        <button className={tab === "infantiles" ? "active" : ""} onClick={() => setTab("infantiles")}>Infantiles</button>
      </div>
      {tab === "adultas" ? <Adultas /> : <InfantilesLista />}
    </>
  );
}

const LINKS = [
  { nombre: "Mayores · Fútbol Femenino", path: "/" },
  { nombre: "Infantiles · Área 93", path: "/infantiles" },
  { nombre: "Infantiles · 17 de Agosto", path: "/infantiles-17" },
];

function Enlaces() {
  const [copiado, setCopiado] = useState("");
  const base = "https://hoffmann-fc-hub.lovable.app";
  return (
    <div className="hf-card">
      <h3 className="hf-form-title">Enlaces para compartir</h3>
      {LINKS.map((l) => {
        const url = base + l.path;
        return (
          <div key={l.path} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
            <span><strong>{l.nombre}</strong><br /><small>{url.replace("https://", "")}</small></span>
            <span style={{ display: "flex", gap: 6 }}>
              <button className="hf-textlink" onClick={async () => { await navigator.clipboard.writeText(url); setCopiado(l.path); setTimeout(() => setCopiado(""), 1500); }}>
                {copiado === l.path ? "¡Copiado!" : "Copiar"}
              </button>
              <a className="hf-textlink" href={`https://wa.me/?text=${encodeURIComponent(`${l.nombre} – Hoffmann FC: ${url}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </span>
          </div>
        );
      })}
    </div>
  );
}

type Filtro = "todos" | "completos" | "incompletos";
function Tilde({ fecha }: { fecha: string | null }) {
  if (!fecha) return <span className="hf-check no">—</span>;
  return (
    <span className="hf-check si" title={new Date(fecha).toLocaleString("es-AR")}>
      ✓ <small>{new Date(fecha).toLocaleString("es-AR")}</small>
    </span>
  );
}

function Adultas() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
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
  const filtradas = filtro === "completos" ? completos : filtro === "incompletos" ? incompletos : personas;
  const rows = filtradas.filter((p) => coincideBusqueda(busqueda, p.nombre, p.dni));

  return (
    <>
      <div className="hf-filters">
        <button className={filtro === "todos" ? "active" : ""} onClick={() => setFiltro("todos")}>
          Todas ({personas.length})
        </button>
        <button className={filtro === "completos" ? "active" : ""} onClick={() => setFiltro("completos")}>
          Ambos ({completos.length})
        </button>
        <button className={filtro === "incompletos" ? "active" : ""} onClick={() => setFiltro("incompletos")}>
          Pendientes ({incompletos.length})
        </button>
      </div>
      <HerramientasLista busqueda={busqueda} setBusqueda={setBusqueda} disabled={isLoading || !!error || rows.length === 0} exportar={() => descargarCsv(`hoffmann-adultas-${filtro}.csv`, [
        ["Nombre", "DNI", "Seguro", "Reglamento"],
        ...rows.map((p) => [p.nombre, p.dni, fechaExportacion(p.seguro), fechaExportacion(p.reglamento)]),
      ])} />
      <div className="hf-card hf-table-wrap">
        {isLoading ? <p>Cargando…</p> : error ? <p>No se pudieron cargar las confirmaciones.</p> : rows.length === 0 ? (
          <p>{personas.length ? "No hay coincidencias con estos filtros." : "Todavía no hay confirmaciones."}</p>
        ) : (
          <table className="hf-table">
            <thead><tr><th>Nombre</th><th>D.N.I.</th><th>Seguro</th><th>Reglamento</th><th className="hf-actions-cell">Acciones</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.dni || p.nombre}>
                  <td>{p.nombre}</td><td>{p.dni}</td>
                  <td><Tilde fecha={p.seguro} /></td><td><Tilde fecha={p.reglamento} /></td>
                  <td className="hf-actions-cell"><AdminPlayerActions target={{ tipo: "adultas", persona: p }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function soloDigitos(t: string) {
  let d = t.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("54")) d = "549" + d;
  return d;
}

function InfantilesLista() {
  const [sede, setSede] = useState<"todas" | "Área 93" | "Barrio 17 de Agosto">("todas");
  const [busqueda, setBusqueda] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["inscripciones_infantiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscripciones_infantiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const todas = data ?? [];
  const cuenta = (s: string) => todas.filter((r) => r.sede === s).length;
  const rows = todas.filter((r) => (sede === "todas" || r.sede === sede) && coincideBusqueda(busqueda, `${r.apellidos} ${r.nombres}`, `${r.nombres} ${r.apellidos}`, r.dni));
  return (
    <>
      <div className="hf-filters">
        <button className={sede === "todas" ? "active" : ""} onClick={() => setSede("todas")}>Todas ({todas.length})</button>
        <button className={sede === "Área 93" ? "active" : ""} onClick={() => setSede("Área 93")}>Área 93 ({cuenta("Área 93")})</button>
        <button className={sede === "Barrio 17 de Agosto" ? "active" : ""} onClick={() => setSede("Barrio 17 de Agosto")}>17 de Agosto ({cuenta("Barrio 17 de Agosto")})</button>
      </div>
      <HerramientasLista busqueda={busqueda} setBusqueda={setBusqueda} disabled={isLoading || !!error || rows.length === 0} exportar={() => descargarCsv(`hoffmann-infantiles-${sede}.csv`, [
        ["Apellidos", "Nombres", "Sede", "DNI", "Nacimiento", "Edad", "Talle", "Alergias", "Tutor", "Teléfono", "Inscripción (Argentina)"],
        ...rows.map((r) => [r.apellidos, r.nombres, r.sede, r.dni, r.fecha_nacimiento, calcularEdad(r.fecha_nacimiento), r.talle, r.alergias, r.tutor_nombre, r.tutor_telefono, fechaExportacion(r.created_at)]),
      ])} />
      <p className="hf-count">Inscriptos: <strong>{rows.length}</strong></p>
      <div className="hf-card hf-table-wrap">
        {isLoading ? <p>Cargando…</p> : error ? <p>No se pudieron cargar las inscripciones.</p> : rows.length === 0 ? (
          <p>{todas.length ? "No hay coincidencias con estos filtros." : "Todavía no hay inscripciones."}</p>
        ) : (
          <table className="hf-table">
            <thead>
              <tr><th>Nombre</th><th>Sede</th><th>DNI</th><th>Nacimiento</th><th>Edad</th><th>Talle</th><th>Alergias</th><th>Tutor</th><th>Inscripción</th><th className="hf-actions-cell">Acciones</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.apellidos}, {r.nombres}</td>
                  <td>{r.sede}</td>
                  <td>{r.dni}</td>
                  <td>{new Date(r.fecha_nacimiento + "T00:00:00").toLocaleDateString("es-AR")}</td>
                  <td>{calcularEdad(r.fecha_nacimiento)}</td>
                  <td>{r.talle}</td>
                  <td>{r.alergias}</td>
                  <td>
                    {r.tutor_nombre}
                    <a className="hf-wa" href={`https://wa.me/${soloDigitos(r.tutor_telefono)}`} target="_blank" rel="noreferrer">
                      {r.tutor_telefono}
                    </a>
                  </td>
                  <td>{new Date(r.created_at).toLocaleString("es-AR")}</td>
                  <td className="hf-actions-cell"><AdminPlayerActions target={{ tipo: "infantiles", persona: r }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function fechaExportacion(fecha: string | null) {
  return fecha ? new Date(fecha).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }) : "Pendiente";
}

function HerramientasLista({ busqueda, setBusqueda, exportar, disabled }: { busqueda: string; setBusqueda: (s: string) => void; exportar: () => void; disabled: boolean }) {
  return <div className="hf-list-tools">
    <label className="hf-search"><Search aria-hidden="true" size={18} /><input type="search" aria-label="Buscar por nombre o DNI" placeholder="Nombre o DNI" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></label>
    <Button variant="outline" className="hf-action" onClick={exportar} disabled={disabled}><Download />Descargar CSV</Button>
  </div>;
}
