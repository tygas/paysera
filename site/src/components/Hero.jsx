import { profile } from "../data";

export default function Hero() {
  return (
    <section style={{ paddingTop: 56, paddingBottom: 16 }}>
      <div className="label">Paysera Tech — Builder-PO Application</div>
      <h1 style={{ marginBottom: 12 }}>
        {profile.name}
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "1.05rem", marginBottom: 20 }}>
        {profile.role}
      </p>

      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 16px",
        fontFamily: "monospace",
        fontSize: "0.85rem",
        color: "var(--accent2)",
        marginBottom: 28,
      }}>
        {profile.tagline}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: "0.85rem",
            color: "var(--text)",
            fontWeight: 500,
          }}
        >
          ↗ LinkedIn
        </a>
        <a
          href="mailto:eimantas.tauklys@am.lt"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: "0.85rem",
            color: "var(--accent)",
            fontWeight: 500,
          }}
        >
          ✉ Contact
        </a>
      </div>
    </section>
  );
}
