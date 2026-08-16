export const profile = {
  name: "Eimantas Tauklys",
  role: "Senior Frontend Engineer → Builder-PO",
  linkedin: "https://linkedin.com/in/eimantastauklys",
  email: "eimantas.tauklys@am.lt",
};

// An earlier version of this list showed each tool with a percentage bar —
// 90%, 20%, 30%. Those were the monthly euro prices redrawn as percentages of
// nothing. A number rendered as a chart implies it was measured; these were not.
// Removed, along with the prices themselves, which were from memory and whose
// plan names were wrong. What is left is what is actually known: the plan and
// when it started. See AUDIT-graph-2026-08-16.md.
export const aiTools = [
  {
    name: "ChatGPT Pro/Max",
    since: "since early 2025",
    use: "Multi-agent orchestration, code reviews, market analysis (with OMX)",
    color: "#eab308",
  },
  {
    name: "Claude Team",
    since: "since summer 2026",
    use: "Primary tool: programming, architecture, skill creation",
    color: "#dc2626",
  },
  {
    name: "OpenCode Zen + usage-based API",
    since: "since summer 2026",
    use: "Evaluating new models, routing simpler tasks cheaper, API experiments",
    color: "#d97706",
  },
];

export const methodologySteps = [
  { id: "agent", label: "Agent", desc: "Spawn a capable agent with a focused prompt" },
  { id: "loop",  label: "Loop",  desc: "Iterate until the output meets the criterion" },
  { id: "graph", label: "Graph of Loops", desc: "Wire loops together for complex multi-step work" },
  { id: "skill", label: "Reusable Skill", desc: "Encode the validated process so it runs correctly every time" },
];

export const skills = [
  {
    title: "TypeScript coding standards extraction",
    detail: "Split standards from the shared skill into a standalone coding-standards.md — single source of truth. Before this, rules were scattered and the agent would ignore or contradict them.",
  },
  {
    title: "12-point pre-submit checklist",
    detail: "Added Tailwind and styled-components guards. Goal: the agent cannot submit a change that compiles but violates project conventions.",
  },
  {
    title: "ALIS legacy discovery guidance",
    detail: "Described how the agent must find old forms, validations, services and data structures and compare them with the rewritten system. Result: an analyst can ask 'how did this work in the old system' and get an answer from real code, not memory.",
  },
  {
    title: "Documentation drift corrections",
    detail: "Verified the live org config against documented am and biip-deploy instructions and corrected every mismatch found.",
  },
];

export const experience = [
  {
    id: "scaletech",
    period: "~1.5 years",
    company: "Scale Tech",
    role: "Frontend Lead + de-facto PO",
    summary: "Built a complex business system from zero — 'a machine to build a machine'",
    details: [
      "Fully responsible for the frontend.",
      "Defined backend RBAC structure requirements.",
      "Coordinated full system development.",
      "For ~1 year: iterated requirements, prototypes, and flows with non-technical clients using Agile — the requirements source was me, not a PRD.",
    ],
    decision: {
      label: "Architectural decision owned",
      text: "Designed a multi-level org hierarchy where access to any object or folder can be granted or denied per user, group, team, or org level — with whitelist and blacklist rules in the same scope. Also designed the UX for this logic.",
    },
    color: "#d97706",
  },
  {
    id: "usbank",
    period: "2 years",
    company: "US Bank",
    role: "Senior Frontend Engineer",
    summary: "Banking merchant system — represented the team in Agile Nexus strategic meetings",
    details: [
      "Built the merchant system frontend.",
      "Represented the team in Agile Nexus — strategic and architectural decisions.",
      "Owned the biggest recurring process blocker: releases combining 5 teams' work were repeatedly delayed by code freezes.",
    ],
    decision: {
      label: "Three decisions that fixed the release cycle",
      text: "1. Defined feature release-readiness criteria — separated what could ship from what couldn't.\n2. Introduced feature flags — incomplete work stays in the codebase without blocking the release.\n3. Restructured communication channels so each team knew its responsibility and escalation path.",
    },
    color: "#dc2626",
  },
  {
    id: "am",
    period: "Current",
    company: "Aplinkos Ministerija",
    role: "Claude Code Skills Marketplace Lead",
    summary: "Building a shared Claude Code skills marketplace for government digital projects",
    details: [
      "41 commits under personal identity.",
      "am skill covers: Moleculer/TS API, React/Vue/Vite, WordPress/Bedrock, Java/Maven ALIS legacy, GitHub Actions.",
      "Verified live org config and corrected documentation drift in am and biip-deploy.",
    ],
    decision: {
      label: "Skill design principle",
      text: "Every validated practice becomes a reusable skill — not to save time once, but so the process runs correctly every time without re-explanation.",
    },
    color: "#d97706",
  },
];

export const classifieds = {
  graphUrl: "https://github.com/tygas/paysera/tree/master/graph",

  wedge: "Used electronics — phones & laptops first",
  wedgeReason: "Structured attributes (model, condition, storage) are ideal for AI. Transaction value is high enough to justify trust infrastructure. Fraud is documented and hurts buyers today.",

  problem: {
    headline: "Classified ads in Lithuania have a trust gap",
    points: [
      "Paysera's own fraud docs describe buyers paying for parcels from listings and never receiving them.",
      "Lithuanian police regularly warn about fake delivery-link scams sent from classified ad chats.",
      "Sellers and buyers exit to WhatsApp or external payment links — outside any platform's control.",
    ],
  },

  offer: {
    headline: "What I'd build: AI-first listing + Paysera trust layer",
    steps: [
      {
        label: "Photo → listing in ~1 min",
        desc: "Seller uploads photos. AI recognises model, condition and storage. Structured listing + market price range auto-generated. Seller reviews and publishes.",
      },
      {
        label: "Paysera-verified identity",
        desc: "Seller identity is already verified by Paysera. Buyers see a trust badge — no anonymous listings.",
      },
      {
        label: "In-product chat",
        desc: "All negotiation stays inside the platform. Eliminates the exit to external links where scams happen.",
      },
      {
        label: "Protected payment (hypothesis)",
        desc: "Funds held until delivery confirmed. Hypothesis — depends on legal/compliance scope. Not an existing feature.",
      },
    ],
  },

  metric: "14-day sell-through rate — % of activated listings reaching a confirmed transaction within 14 days.",

  // Order matters here, and it is deliberate. An earlier version of this list
  // put interviews first and legal second. In a licensed institution that is
  // backwards: it starts collecting people's data before establishing the basis
  // for holding it. The loop graph now gates all personal-data work behind a
  // written legal-basis decision on day 6. See AUDIT-graph-2026-08-16.md.
  thirtyDays: [
    "Days 1–6 — establish the lawful basis with legal/compliance first: what data may be used, for which purpose, retained how long. Nothing touching a person starts before this is decided in writing.",
    "Days 1–15 — prototype and measure the photo-to-listing flow. No personal data involved, so it runs from day one.",
    "Days 7–20 — interview 10–15 recent sellers/buyers; map listing → negotiation → payment → delivery.",
    "Days 7–19 — recruit a narrow seed cohort from Paysera channels, consent first.",
    "Days 21–27 — synthesise into one evidence-tagged brief, mandatory CTO + legal review, then a go/no-go decision.",
    "Then run the concierge pilot for 30 days, instrument the funnel, and decide: deepen this wedge, change it, or stop.",
  ],
};

export const conditions = [
  { label: "Availability", value: "Full-time · start in 2–4 weeks" },
  { label: "Location",     value: "Hybrid — 3–4 days/week from Kaunas, Vilnius as needed" },
  { label: "Language",     value: "English daily" },
  { label: "Contract",     value: "MB (sole proprietorship)" },
  { label: "Fixed rate",   value: "€4,000 / month" },
];
