import { useEffect, useState } from "react";

const links = [
  { href: "#ai", label: "AI Stack" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#classifieds", label: "Classifieds" },
  { href: "#conditions", label: "Conditions" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: scrolled ? "rgba(10,10,15,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      transition: "all 0.2s",
      padding: "12px 0",
      margin: "0 -24px",
      paddingLeft: "24px",
      paddingRight: "24px",
    }}>
      <div style={{ display: "flex", gap: 24, overflowX: "auto" }}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              color: "var(--muted)",
              fontSize: "0.82rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
