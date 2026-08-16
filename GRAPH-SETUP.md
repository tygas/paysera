# Loop Graph — setup and execution

**Version:** 2.0
**Updated:** 2026-08-16
**Status:** ready for execution

> Version 1.0 (2026-08-11) was published without review. A subsequent audit found
> defects in five categories, including a sequencing error that would have put
> personal-data processing ahead of its legal basis. Everything below reflects
> the corrected graph. Findings and fixes: [`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md).

---

## What this is

A loop graph for preparing a concierge pilot of Paysera Classifieds in the
Lithuanian used-electronics category (phones, laptops).

```
P1–P6    Loop-B legal basis  +  Loop-C photo→listing        (no personal data yet)
         └─► GATE G1 closes end of P6

P7–P20   Loop-A interviews    (P7–P20)                       (personal data — G1 required)
P7–P19   Loop-D cohort recruitment                           (personal data — G1 required)
P11–P15  Loop-B pilot scope  └─► GATE G2 closes end of P15

P21–P25  Loop-E synthesis → pilot brief                      (G1 and G2 required)
P26      CTO + Legal review  └─► GATE G3 closes end of P26
P27      CEO go/no-go
P28–P30  Onboarding and platform prep

L1–L30   Live concierge pilot
```

**Two clocks.** `P` days are preparation, `L` days are the live pilot. v1.0 used
a single "DAY n" clock for both, so "DAY 30" meant two different things in two
different documents.

---

## The two gates

Everything else in this graph is a schedule. These two are conditions.

| Gate | Closes | Meaning | Blocks |
|---|---|---|---|
| **G1** | end of P6 | Legal/DPO has decided, in writing, the lawful basis for every personal-data purpose in this research | all of Loop-A, all of Loop-D, Loop-E's personal-data agents |
| **G2** | end of P15 | Pilot operating boundaries signed | all of Loop-E |
| **G3** | end of P26 | CTO and Legal have both reviewed the drafted brief, each with a name and a date | the CEO presentation |

There is no "proceed pending approval" path. If G1 does not close, Loops A and D
do not start and the schedule slips day-for-day. Loop-C continues, because it
uses no personal data.

Loop-E sits behind G1 as well as G2: three of its four agents process customer
personal data, and a pilot-scope sign-off is a commercial approval, not a lawful
basis. G3 separates drafting the brief from approving it — the repository's own
rule that generation and publication are two different steps.

---

## Files

| File | Purpose |
|---|---|
| `graph/plan.json` | **Single source of truth** — days, agents, thresholds, gates, market scope, claim policy |
| `graph/README.md` | Diagram, per-loop detail |
| `graph/INDEX.md` | Execution guide, escalation table |
| `graph/exit-conditions.json` | Daily tracking — update as you go |
| `graph/loop-a-interviews.yaml` | 4 agents: find_contacts → schedule_calls → conduct_interviews → extract_insights |
| `graph/loop-b-legal.yaml` | 4 agents: extract_compliance_docs → **legal_basis_review (G1)** → conduct_legal_consultation → map_to_pilot_scope (G2) |
| `graph/loop-c-photo-listing.yaml` | 3 agents: collect_test_photos → run_photo_to_listing_ai → quality_check_outputs |
| `graph/loop-d-repeat-sellers.yaml` | 4 agents: query_paysera_transactions → enrich_seller_profiles → recruit_pilot_cohort → analyze_cohort_profile |
| `graph/loop-e-synthesis.yaml` | 4 agents: synthesize_all_outputs → create_persona → generate_workflow_checklist → draft_pilot_brief |
| `graph/pilot-brief-template.md` | Empty template for the final brief |
| `tools/validate-graph.mjs` | Pre-publish validator — run before every commit that touches `graph/` |

---

## How to run it

### P1 — start Loop-B and Loop-C only

```bash
node tools/validate-graph.mjs     # must pass before you begin
```

Loop-B extracts compliance documents; Loop-C collects test photos. Neither
touches personal data.

### P3–P6 — close G1

`legal_basis_review` puts a written questionnaire in front of Legal/DPO and
comes back with a decision per processing purpose. Record it in
`exit-conditions.json` under `gates.G1`.

If P4 arrives and the meeting is not scheduled, escalate to the CEO that day.
G1 blocks half the graph.

### P7 — start Loop-A and Loop-D

Only after `gates.G1.status == "closed"`.

### P11–P15 — close G2

`map_to_pilot_scope` produces the signed pilot boundaries and, just as
importantly, the list of what could **not** be confirmed. That list goes on
page 1 of the brief.

### P21–P25 — Loop-E

Synthesis, persona, seller checklist, brief. Every factual claim carries a
provenance tag. Zero untagged claims is a binary exit condition.

### P26–P27 — review, then decide

CTO and Legal both review. Neither is optional. Then the CEO gets one clear
question: launch, reduce scope, or stop.

---

## Daily tracking

Update `graph/exit-conditions.json`:

```json
"loop_a": {
  "status": "in_progress",
  "metrics": {
    "interviews_completed": { "minimum": 10, "target": 12, "stretch": 15, "current": 8, "status": "on_track" }
  }
}
```

Three levels, defined once in `plan.json`:
**minimum** = below this the loop failed · **target** = the plan · **stretch** =
better than planned, never a reason to extend.

---

## Key dates

| Day | Event |
|---|---|
| P3 | Compliance documents extracted |
| **P6** | **G1 — lawful basis in writing** |
| P12 | Loop-A warning threshold (< 8 calls confirmed) |
| **P15** | **G2 — scope signed; Loops B and C complete** |
| P19 | Loop-D complete |
| P20 | Loop-A complete |
| P25 | Brief drafted |
| **P26** | **G3 — CTO + Legal review (both mandatory)** |
| P27 | CEO decision |
| P30 | Prep complete |
| L1 | Pilot starts |

---

## Escalation — the rule above the table

Being behind schedule buys you a **later date** or a **narrower scope**.

It never buys a skipped review, a skipped consent, or a bypassed gate.

---

## Market scope

Competitors are Lithuanian: **skelbiu.lt**, **autoplius.lt**, **aruodas.lt**,
Facebook Marketplace and LT buy-sell groups. 
---

## After the pilot

If the structure holds, it becomes a reusable skill — the shape, not the
content:

```
/paysera:product-discovery category=auto market=LT interviews=12 cohort=5
```

Non-negotiable in every instance: the gate order, the provenance tags, and the
mandatory review before publication.

---

## Before you publish anything from this repo

```bash
node tools/validate-graph.mjs
```

The validator checks the five failure modes found in v1.0: unsourced factual
claims, wrong-market competitors, non-Lithuanian and garbled text, cross-document
date and threshold drift, and legal-gate sequencing violations. See
`.claude/skills/pre-publish-audit/SKILL.md` for the review process it belongs to.
