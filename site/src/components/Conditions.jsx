import { conditions } from "../data";

const items = [
  { label: "Availability", value: `Full-time · start in ${conditions.startIn}` },
  { label: "Language", value: "English daily" },
  { label: "Contract", value: conditions.contract },
  { label: "Fixed rate", value: conditions.salary },
  { label: "Remote", value: conditions.remote },
];

export default function Conditions() {
  return (
    <section id="conditions">
      <div className="label">Practical Conditions</div>
      <h2>Work Setup</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {items.map((item) => (
          <div key={item.label} className="card">
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontWeight: 600 }}>Eimantas Tauklys</p>
          <p className="muted" style={{ fontSize: "0.85rem" }}>eimantas.tauklys@am.lt</p>
        </div>
        <a
          href="https://linkedin.com/in/eimantastauklys"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 18px",
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            borderRadius: 8,
            color: "var(--accent)",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          ↗ LinkedIn
        </a>
      </div>
    </section>
  );
}
