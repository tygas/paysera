import { aiTools } from "../data";

export default function AITools() {
  return (
    <section id="ai">
      <div className="label">AI Stack</div>
      <h2>Tools & Methodology</h2>

      <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
        {aiTools.map((t) => (
          <div key={t.name} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h3 style={{ marginBottom: 0 }}>{t.name}</h3>
                <span className="tag">{t.cost}</span>
              </div>
              <p className="muted" style={{ fontSize: "0.88rem" }}>{t.use}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: "color-mix(in srgb, var(--accent2) 8%, var(--surface))",
        border: "1px solid color-mix(in srgb, var(--accent2) 25%, transparent)",
        borderRadius: "var(--radius)",
        padding: "20px 24px",
      }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent2)", marginBottom: 10 }}>
          Working methodology
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          {["Agent", "Loop", "Graph of loops", "Reusable skill"].map((step, i, arr) => (
            <span key={step} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <span style={{
                background: "color-mix(in srgb, var(--accent2) 18%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent2) 35%, transparent)",
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--accent2)",
                fontFamily: "monospace",
              }}>{step}</span>
              {i < arr.length - 1 && (
                <span style={{ color: "var(--muted)", padding: "0 6px", fontSize: "0.75rem" }}>→</span>
              )}
            </span>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--muted)" }}>
          Every validated practice becomes a reusable skill — not to save time once, but so the process runs correctly every time without re-explanation.
        </p>
      </div>
    </section>
  );
}
