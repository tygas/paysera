import { useState } from "react";
import { classifieds } from "../data";

export default function Classifieds() {
  const [tab, setTab] = useState("hypothesis");

  const tabs = [
    { id: "hypothesis", label: "Hypothesis" },
    { id: "30days", label: "First 30 days" },
    { id: "metric", label: "North-star metric" },
  ];

  return (
    <section id="classifieds">
      <div className="label">Product Direction</div>
      <h2>Paysera Classifieds</h2>

      <div className="card" style={{ marginBottom: 16, borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
          Wedge
        </div>
        <p style={{ fontWeight: 600, marginBottom: 6 }}>{classifieds.wedge}</p>
        <p style={{ fontSize: "0.87rem", color: "var(--muted)" }}>{classifieds.why}</p>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              fontSize: "0.82rem",
              fontWeight: 600,
              background: tab === t.id ? "color-mix(in srgb, var(--accent) 15%, var(--surface2))" : "var(--surface)",
              border: `1px solid ${tab === t.id ? "var(--accent)" : "var(--border)"}`,
              color: tab === t.id ? "var(--accent)" : "var(--muted)",
              transition: "all 0.15s",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === "hypothesis" && (
          <>
            <p style={{ marginBottom: 16, fontSize: "0.9rem" }}>{classifieds.hypothesis}</p>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
                Supporting evidence
              </div>
              <ul>
                {classifieds.supporting.map((s, i) => (
                  <li key={i} style={{ fontSize: "0.86rem" }}>{s}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {tab === "30days" && (
          <ol style={{ paddingLeft: 20 }}>
            {classifieds.thirtyDays.map((item, i) => (
              <li key={i} style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: 10 }}>
                {item}
              </li>
            ))}
          </ol>
        )}

        {tab === "metric" && (
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
              Primary metric
            </div>
            <p style={{ fontSize: "0.95rem", fontWeight: 500, marginBottom: 16 }}>{classifieds.metric}</p>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
                Supporting diagnostics
              </div>
              <ul>
                {[
                  "Photo → publish conversion rate and median time",
                  "Qualified buyer conversations per listing",
                  "Fraud / dispute signal rate",
                  "Repeat seller rate within 30 days",
                ].map((d, i) => (
                  <li key={i} style={{ fontSize: "0.86rem" }}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
