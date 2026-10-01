export function HoffmannHeader({ subtitle, active }: { subtitle: string; active?: "inicio" | "admin" }) {
  return (
    <>
      <header className="hf-header">
        <div className="hf-logo">
          <img src="/logo.png" alt="Hoffmann FC" />
        </div>
        <div className="hf-badge">Temporada 2026</div>
        <h1>Hoffmann FC</h1>
        <p>{subtitle}</p>
        <div className="hf-accent" />
      </header>
      <nav className="hf-nav">
        <a href="/" className={active === "inicio" ? "active" : ""}>Inicio</a>
        <a href="/seguro.html">Seguro</a>
        <a href="/reglamento.html">Reglamento</a>
      </nav>
    </>
  );
}
