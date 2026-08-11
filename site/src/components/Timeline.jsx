import { useState } from "react";
import { experience } from "../data";

const colors = {
  scaletech: "var(--accent2)",
  usbank: "var(--accent)",
  am: "#f0a050",
};

export default function Timeline() {
  const [open, setOpen] = useState("usbank");

  return (
    <section id="experience">
      <div className="label">Experience</div>
      <h2>Lead & PO Responsibilities</h2>

      <div style={{ position: "relative" }}>
        {/* vertical line */}
        <div style={{
          position: "absolute",
          left: 19,
          top: 24,
          bottom: 0,
          width: 2,
          background: "var(--border)",
          zIndex: 0,
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {experience.map((exp) => {
            const color = colors[exp.id];
            const isOpen = open === exp.id;
            return (
              <div key={exp.id} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* dot */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `color-mix(in srgb, ${color} 15%, var(--surface))`,
                  border: `2px solid ${isOpen ? color : "var(--border)"}`,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  transition: "border-color 0.2s",
                  cursor: "pointer",
                }} onClick={() => setOpen(isOpen ? null : exp.id)}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: isOpen ? color : "var(--muted)", transition: "background 0.2s" }} />
                </div>

                {/* content */}
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <div
                    className="card"
                    style={{
                      cursor: "pointer",
                      borderColor: isOpen ? color : "var(--border)",
                      transition: "border-color 0.2s",
                    }}
                    onClick={() => setOpen(isOpen ? null : exp.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: `color-mix(in srgb, ${color} 15%, transparent)`,
                            color,
                            border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                          }}>{exp.period}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{exp.company}</span>
                        </div>
                        <h3 style={{ marginBottom: 4 }}>{exp.role}</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{exp.summary}</p>
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: "0.8rem", flexShrink: 0 }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                        <ul style={{ marginBottom: 16 }}>
                          {exp.details.map((d, i) => (
                            <li key={i} style={{ fontSize: "0.87rem" }}>{d}</li>
                          ))}
                        </ul>

                        <div style={{
                          background: `color-mix(in srgb, ${color} 8%, var(--surface2))`,
                          border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                          borderRadius: 8,
                          padding: "14px 16px",
                        }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color, marginBottom: 8 }}>
                            {exp.decision.label}
                          </div>
                          <p style={{ fontSize: "0.86rem", color: "var(--text)", whiteSpace: "pre-line" }}>
                            {exp.decision.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
