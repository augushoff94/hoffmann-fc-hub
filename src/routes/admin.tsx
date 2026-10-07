import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { HoffmannHeader } from "@/components/HoffmannHeader";
import { calcularEdad } from "@/lib/edad";

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
      const { data } = await supabase.rpc("has_role", { _user_id: session!.user.id, _role: "admin" });
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

function Login() {
  const [modo, setModo] = useState<"entrar" | "registro">("entrar");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setCargando(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setMsg("Correo o contraseña incorrectos (o correo aún sin confirmar).");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password: pass, options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Cuenta creada. Revisá tu correo para confirmarla y después ingresá.");
    }
    setCargando(false);
  }

  return (
    <form className="hf-card hf-form hf-login" onSubmit={enviar}>
      <h3 className="hf-form-title">{modo === "entrar" ? "Ingresar como administrador" : "Crear cuenta"}</h3>
      <label>Correo<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Contraseña<input type="password" required minLength={4} value={pass} onChange={(e) => setPass(e.target.value)} /></label>
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
      <div className="hf-adminbar"><span>{email}</span><Salir /></div>
      <div className="hf-tabs">
        <button className={tab === "adultas" ? "active" : ""} onClick={() => setTab("adultas")}>Adultas</button>
        <button className={tab === "infantiles" ? "active" : ""} onClick={() => setTab("infantiles")}>Infantiles</button>
      </div>
      {tab === "adultas" ? <Adultas /> : <InfantilesLista />}
    </>
  );
}

type Filtro = "todos" | "completos" | "incompletos";
type Confirmacion = { id: string; nombre: string; dni: string; documento: string; created_at: string };
type Persona = { nombre: string; dni: string; seguro: string | null; reglamento: string | null };

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

function Adultas() {
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
  const rows = filtro === "completos" ? completos : filtro === "incompletos" ? incompletos : personas;

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
      <div className="hf-card hf-table-wrap">
        {isLoading ? <p>Cargando…</p> : error ? <p>No se pudieron cargar las confirmaciones.</p> : rows.length === 0 ? (
          <p>Todavía no hay confirmaciones.</p>
        ) : (
          <table className="hf-table">
            <thead><tr><th>Nombre</th><th>D.N.I.</th><th>Seguro</th><th>Reglamento</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.dni || p.nombre}>
                  <td>{p.nombre}</td><td>{p.dni}</td>
                  <td><Tilde fecha={p.seguro} /></td><td><Tilde fecha={p.reglamento} /></td>
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
  const rows = data ?? [];
  return (
    <>
      <p className="hf-count">Inscriptos: <strong>{rows.length}</strong></p>
      <div className="hf-card hf-table-wrap">
        {isLoading ? <p>Cargando…</p> : error ? <p>No se pudieron cargar las inscripciones.</p> : rows.length === 0 ? (
          <p>Todavía no hay inscripciones.</p>
        ) : (
          <table className="hf-table">
            <thead>
              <tr><th>Nombre</th><th>DNI</th><th>Nacimiento</th><th>Edad</th><th>Talle</th><th>Alergias</th><th>Tutor</th><th>Inscripción</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.apellidos}, {r.nombres}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
