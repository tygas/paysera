export const profile = {
  name: "Eimantas Tauklys",
  role: "Senior Frontend Engineer → Builder-PO",
  linkedin: "https://linkedin.com/in/eimantastauklys",
  email: "eimantas.tauklys@am.lt",
};

export const aiTools = [
  {
    name: "Claude Code Business/Premium",
    cost: "€90/mo",
    use: "Primary tool: programming, architecture, skill creation",
    pct: 90,
    color: "#7c6fff",
  },
  {
    name: "ChatGPT Pro",
    cost: "€20/mo",
    use: "Multi-agent orchestration, code reviews, market analysis",
    pct: 20,
    color: "#10a37f",
  },
  {
    name: "OpenCode Zen + API",
    cost: "pay-as-you-go",
    use: "Evaluating new models, routing simpler tasks cheaper, API experiments",
    pct: 30,
    color: "#4fd8c4",
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
    color: "#4fd8c4",
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
    color: "#7c6fff",
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
    color: "#f0a050",
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

  thirtyDays: [
    "Interview 10–15 recent sellers/buyers — map the full listing → negotiation → payment → delivery journey.",
    "Define identity, funds-holding, dispute and prohibited-goods limits with legal/compliance.",
    "Prototype the photo-to-listing flow and in-product verified chat/payment screen.",
    "Recruit a narrow seed cohort from Paysera channels or internal network.",
    "Run a concierge pilot, instrument the funnel, decide at day 30: deepen this wedge, change it, or stop.",
  ],
};

export const conditions = [
  { label: "Availability", value: "Full-time · start in 2–4 weeks" },
  { label: "Language",     value: "English daily" },
  { label: "Contract",     value: "MB (sole proprietorship)" },
  { label: "Fixed rate",   value: "€4,000 / month" },
];
