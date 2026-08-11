export const profile = {
  name: "Eimantas Tauklys",
  role: "Senior Frontend Engineer → Builder-PO",
  tagline: "agent → loop → graph of loops → reusable skill",
  linkedin: "https://linkedin.com/in/eimantastauklys",
};

export const aiTools = [
  {
    name: "Claude Code Business/Premium",
    cost: "€90/mo",
    use: "Primary tool: programming, architecture, skill creation",
  },
  {
    name: "ChatGPT Pro",
    cost: "€20/mo",
    use: "Multi-agent orchestration, code reviews, market analysis",
  },
  {
    name: "OpenCode Zen + usage-based API",
    cost: "pay-as-you-go",
    use: "Evaluating new models, routing simpler tasks cheaper, API experiments",
  },
];

export const skills = [
  {
    title: "TypeScript coding standards extraction",
    detail:
      "Split standards from the shared skill into a standalone coding-standards.md — single source of truth. Before this, rules were scattered and the agent would ignore or contradict them.",
  },
  {
    title: "12-point pre-submit checklist",
    detail:
      "Added Tailwind and styled-components guards. Goal: the agent cannot submit a change that compiles but violates project conventions.",
  },
  {
    title: "ALIS legacy discovery guidance",
    detail:
      "Described how the agent must locate old forms, validations, services and data structures and compare them with the rewritten system. Result: an analyst can ask ‘how did this work in the old system’ and get an answer from real code, not memory.",
  },
  {
    title: "Documentation drift corrections",
    detail:
      "Verified the live org config against documented am and biip-deploy instructions and corrected every mismatch found.",
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
  },
  {
    id: "usbank",
    period: "Senior role",
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
      text: "1. Defined feature release-readiness criteria — separated what could ship from what couldn't, without re-negotiating every time.\n2. Introduced feature flags — incomplete work stays in the codebase without blocking the release.\n3. Restructured communication channels so each team knew its responsibility and escalation path.",
    },
  },
  {
    id: "am",
    period: "Current",
    company: "Aplinkos Ministerija projects",
    role: "Claude Code skills marketplace lead",
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
  },
];

export const classifieds = {
  wedge: "Used electronics in the 'daiktai' category — phones and laptops first",
  why: "Structured attributes suit AI automation, transaction value is sufficient, and the trust problem is real and documented.",
  hypothesis:
    "Photo → model/condition recognition → structured listing + price range in ~1 minute. Paysera-verified identity + in-product chat + protected payment reduces exit to scam links. Protected payment is a hypothesis pending legal/compliance review.",
  metric: "14-day sell-through rate — % of activated listings reaching a confirmed transaction within 14 days.",
  supporting: [
    "Paysera documents fraud scenarios where buyers pay for a parcel from a listing and never receive it.",
    "Lithuanian police regularly warns about fake delivery-link scams from classified listings.",
  ],
  thirtyDays: [
    "Interview 10–15 recent sellers/buyers — map the listing, negotiation, payment, and delivery journey.",
    "Define identity, funds-holding, dispute, and prohibited-goods limits with legal/compliance.",
    "Prototype photo-to-listing and verified chat/payment flow.",
    "Recruit a narrow seed cohort from Paysera channels or internal network.",
    "Run a concierge pilot, instrument the full funnel, decide at day 30: deepen, change wedge, or stop.",
  ],
};

export const conditions = {
  fullTime: true,
  english: true,
  startIn: "2–4 weeks",
  contract: "MB (sole proprietorship)",
  salary: "€4,000 fixed/month",
  remote: "To be confirmed during conversation",
};
