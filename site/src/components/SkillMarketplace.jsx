import { useState } from "react";
import { skills } from "../data";

export default function SkillMarketplace() {
  const [open, setOpen] = useState(null);

  return (
    <section id="skills">
      <div className="label">Skill Creation</div>
      <h2>am-claude-skills Marketplace</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: 12 }}>
          Shared Claude Code skills marketplace for Aplinkos Ministerija government projects.
          The <code style={{ background: "var(--surface2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.82rem" }}>am</code> skill
          gives agents repository-aware context across the full stack.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Moleculer/TS", "React/Vue/Vite", "WordPress/Bedrock", "Java/Maven ALIS", "GitHub Actions"].map((t) => (
            <span key={t} className="tag teal" style={{ fontSize: "0.68rem" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 14 }}>
          41 commits authored · tap a skill to expand
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {skills.map((s, i) => (
            <div
              key={i}
              className="card"
              style={{ cursor: "pointer", transition: "border-color 0.15s", borderColor: open === i ? "var(--accent)" : "var(--border)" }}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ marginBottom: 0, fontSize: "0.92rem" }}>{s.title}</h3>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem", marginLeft: 12, flexShrink: 0 }}>
                  {open === i ? "▲" : "▼"}
                </span>
              </div>
              {open === i && (
                <p style={{ marginTop: 12, fontSize: "0.87rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  {s.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
