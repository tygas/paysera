# Loop Graph Index — Paysera Classifieds concierge pilot

Execution guide for the 30-day preparation window (P1–P30) that precedes the
30-day live concierge pilot (L1–L30) in the LT used-electronics category.

**Version 2.0 (2026-08-16).** Supersedes 1.0 — see
[`AUDIT-graph-2026-08-16.md`](../AUDIT-graph-2026-08-16.md) for what was wrong
and what changed.

---

## 1. Read in this order

1. `plan.json` — the single source of truth. Days, agents, thresholds, gates.
2. `README.md` — diagram and overview.
3. This file — how to execute and track.
4. The relevant `loop-*.yaml` — agent prompts and schemas.
5. `pilot-brief-template.md` — the deliverable Loop-E fills in.

Run `node tools/validate-graph.mjs` before publishing any change. It fails the
build if a day, an agent name, a threshold or a gate drifts between documents.

---

## 2. Execution model

### 2.1 Two gates, not five parallel loops

Version 1.0 stated **"Dependencies: None between loops"** and ran all four data
loops from P1. That was the most serious defect in the graph: Loop-D queried
production customer data on P3 and mailed real customers from P8, while the
legal sign-off that would have authorised any of it was scheduled for P14.

The corrected model has two hard gates.

| Gate | Closes | Owner | Blocks |
|---|---|---|---|
| **G1** — lawful basis for personal data | end of **P6** | Loop-B `legal_basis_review` | all of Loop-A, all of Loop-D, Loop-E's personal-data agents |
| **G2** — pilot scope sign-off | end of **P15** | Loop-B `map_to_pilot_scope` | all of Loop-E |
| **G3** — publication approval | end of **P26** | CTO + Legal (named humans) | the CEO presentation |

Loop-E is behind **both** G1 and G2. Until 2026-08-16 it declared G2 only, while
three of its four agents carry `data_class: customer_personal`. G2 is the pilot
scope sign-off — a commercial approval, and not a lawful basis for processing a
natural person's data. C1 accepted it because it asked only whether the loop
named *some* gate closing before the agent started; any gate satisfied that.

G3 exists because `legal_review` and `cto_review` were binary requirements
inside Loop-E with `due_day: 26`, one day after Loop-E closes on P25 — and days
P26–P30 otherwise had three milestones and no owner at all.

**There is no "proceed pending approval" path.** If G1 does not close on P6,
Loops A and D do not start and the whole schedule moves day-for-day. Loop-C
continues, because it touches no personal data.

### 2.2 Phases

| Window | Running | Gate state |
|---|---|---|
| P1–P6 | Loop-B, Loop-C | G1 pending |
| P7–P15 | Loop-B, Loop-C, Loop-A, Loop-D | G1 closed; G2 pending |
| P16–P19 | Loop-A, Loop-D | G2 closed |
| P20 | Loop-A only (Loop-D ends P19) | G2 closed |
| P21–P25 | Loop-E | G1 + G2 closed |
| P26 | CTO + Legal review | G3 pending → closed |
| P27 | CEO decision | G3 closed |
| P28–P30 | Onboarding and platform prep | — |
| L1–L30 | Live concierge pilot | — |

---

## 3. Agents and windows

| Loop | Agent | Days | Data class | Gate |
|---|---|---|---|---|
| B | `extract_compliance_docs` | P1–P3 | none | — |
| C | `collect_test_photos` | P1–P3 | none | — |
| B | `legal_basis_review` | P3–P6 | none | **closes G1** |
| B | `conduct_legal_consultation` | P4–P10 | none | — |
| C | `run_photo_to_listing_ai` | P4–P12 | none | — |
| A | `find_contacts` | P7–P9 | public personal | G1 |
| D | `query_paysera_transactions` | P7–P9 | customer personal | G1 |
| A | `schedule_calls` | P9–P12 | public personal | G1 |
| D | `enrich_seller_profiles` | P9–P11 | customer personal | G1 |
| B | `map_to_pilot_scope` | P11–P15 | none | **closes G2** |
| D | `recruit_pilot_cohort` | P11–P17 | customer personal | G1 |
| A | `conduct_interviews` | P12–P18 | public personal | G1 |
| C | `quality_check_outputs` | P13–P15 | none | — |
| A | `extract_insights` | P18–P20 | public personal | G1 |
| D | `analyze_cohort_profile` | P18–P19 | customer personal | G1 |
| E | `synthesize_all_outputs` | P21–P22 | customer personal | G1 + G2 |
| E | `create_persona` | P22–P23 | customer personal | G1 + G2 |
| E | `generate_workflow_checklist` | P22–P23 | none | G2 |
| E | `draft_pilot_brief` | P23–P25 | customer personal | G1 + G2 |

Agent names here are identical to the `name:` fields in the YAML files and the
`id` fields in `plan.json`. In v1.0 they were not — `README.md` referred to
`schedule_call`, `compliance_check`, `map_to_scope`, `filter_repeat_sellers` and
`quality_check`, none of which existed in the YAML.

---

## 4. Exit thresholds

Defined once in `plan.json`. Every metric declares a `direction`:

- **`higher_better`** — uses **minimum**. Below it the loop has failed.
- **`lower_better`** — uses **maximum**. Above it the loop has failed.
- **target** — the planned outcome. Loop is COMPLETE here.
- **stretch** — better than planned. Never a reason to extend the timeline.
- **`binary`** — done or not; no numeric levels.

`direction` exists because the v1.0 floor/ceiling inversion had come back:
`hallucination_rate_pct` was written `minimum 5 / target 0` with a note saying
that in this one row `minimum` meant a ceiling, and
`measurement_definitions.listing_time_minutes` was `minimum 10 / target 5`.
Read literally, a 0% hallucination rate and a 5-minute listing both failed.

This table is the complete list. It previously omitted three metrics and all of
Loop-E while being presented as complete.

| Loop | Metric | dir | fail threshold | target | stretch |
|---|---|---|---|---|---|
| A | contacts identified | ↑ | min 15 | 20 | 30 |
| A | interviews completed | ↑ | min 10 | 12 | 15 |
| A | interview minutes | ↑ | min 30 | 45 | 60 |
| A | topics per interview | ↑ | min 4 | 5 | 6 |
| A | transcript accuracy % | ↑ | min 80 | 95 | 100 |
| A | theme saturation | binary | — | no new themes in last 3 | — |
| B | compliance categories | ↑ | min 3 | 5 | 5 |
| B | legal meetings | ↑ | min 1 | 2 | 3 |
| B | checklist rules | ↑ | min 10 | 15 | 20 |
| C | test photos | ↑ | min 8 | 10 | 12 |
| C | photos with output | ↑ | min 8 | 10 | 12 |
| C | prompt versions | ↑ | min 2 | 3 | 3 |
| C | quality score /10 | ↑ | min 6 | 7 | 8 |
| C | **hallucination rate %** | ↓ | **max 5** | 0 | 0 |
| C | prompt version selected | binary | — | one, with numbers | — |
| D | eligible sellers | ↑ | min 20 | 50 | 100 |
| D | profiles enriched | ↑ | min 12 | 20 | 20 |
| D | cohort confirmed | ↑ | min 4 | 5 | 7 |
| D | cohort profile documented | binary | — | + personas + Loop-A comparison | — |
| E | loop outputs integrated | ↑ | min 4 | 4 | 4 |
| E | personas | ↑ | min 1 | 1 | 3 |
| E | checklist steps | ↑ | min 6 | 6 | 6 |
| E | untagged claims | ↓ | **max 0** | 0 | 0 |
| E | TBD count | info | — | no threshold | — |

**Hallucination rate is a fail threshold, not a note.** Above 5% Loop-C has
failed regardless of its quality score: a listing asserting a specification the
device does not have is a misleading statement to a consumer on a regulated
platform. Until 2026-08-16 this metric lived only in `exit-conditions.json` —
absent from `plan.json`, from the YAML exit conditions, from the binary
requirements and from every escalation rule — so Loop-C could reach target with
every listing carrying invented specs.

### Binary requirements — no minimum/target/stretch, only done or not

| Loop | Requirement |
|---|---|
| A | Recording consent captured before recording |
| B | G1 written decision by P6 |
| B | G2 signed scope by P15 (for launch) |
| C | Blind review; ground truth recorded before the AI run |
| D | No customer query before G1 |
| D | Consent before participation |
| D | No KYC/AML reuse without explicit written G1 permission |
| E | Zero untagged factual claims |
| E | No pre-written conclusions in synthesis prompts |
| **G3** | CTO review **and** Legal review — both mandatory, both with a named reviewer and a date |
| — | Research data deleted on the G1 retention date, recorded with who and when |

---

## 5. Daily tracking

Update `exit-conditions.json`. One file, one shape:

```json
"loop_a": {
  "status": "in_progress",
  "metrics": {
    "interviews_completed": { "minimum": 10, "target": 12, "stretch": 15, "current": 8, "status": "on_track" }
  }
}
```

Gate state is tracked separately and explicitly:

```json
"gates": {
  "G1": { "closes_end_of_day": 6, "status": "pending", "decided_by": null, "decided_at": null }
}
```

**While `G1.status != "closed"`, Loop-A, Loop-D and Loop-E status must remain
`blocked_by_gate`.** Check C2 enforces this: it derives the blocked loops from
`plan.json` `gates.*.blocks_agents`, cross-checks them against the
`blocks_loops` list here, and fails if a blocked loop carries any other status.

> This sentence used to read "The validator enforces this", and it did not.
> C2 iterated `gate.blocks_loops` on the **`plan.json`** gate objects, which
> define `blocks_agents` and have never had a `blocks_loops` key — so the loop
> body ran zero comparisons on every invocation. `exit-conditions.json` could
> have marked Loop-D `in_progress` with G1 still `pending` and the validator
> would have exited 0. A control that is documented but absent is worse than
> one that is merely absent, because it stops anyone checking by hand.

---

## 6. Escalation

| Day | Trigger | Action |
|---|---|---|
| P4 | G1 meeting not scheduled | Escalate to CEO same day — G1 is the critical path |
| P6 | G1 not closed | Loops A and D do not start. Schedule slips day-for-day. Loop-C continues. |
| P8 | Loop-C: < 8 photos in pipeline | Add synthetic photos, not marketplace photos |
| P12 | Loop-A: < 8 calls confirmed | Broaden channels and time — **not** the incentive |
| P12 | Loop-B: < 10 rules documented | Narrow pilot scope rather than skip rules |
| P14 | Loop-D: < 3 confirmed | **Warning threshold** — no action yet, watch the response rate |
| P15 | Loop-D: < 3 confirmed | Extend candidate list 20 → 40; incentive unchanged |
| P15 | G2 not closed | Brief marked "scope unconfirmed"; open items on page 1; pilot does not launch |
| P17 | Loop-D: < 4 confirmed | Launch with 4, recorded as a limitation. Do not admit sellers who fail criteria. |
| P18 | Loop-A: < 10 interviews | Loop-A ends P22, Loop-E starts P23, CEO decision P29. Review is never compressed. |
| P23 | Loop-E not started | Cut appendices — never page 1 and never provenance tags |
| P26 | Untagged claims found in review | Remove them or mark `[TBD]`. The brief does not ship with untagged claims. |

**One rule sits above the table:** the response to being behind schedule is a
later date or a narrower scope. It is never a skipped review, a skipped
consent, or a bypassed gate.

---

## 7. Outputs

All outputs live under `graph/output/<loop>/`. In v1.0 three different
directory conventions appeared across three documents; there is now one.

| Loop | Files |
|---|---|
| A | `contacts.csv`, `call_schedule.json`, `transcripts/`, `insights.json` |
| B | `compliance_extracts.json`, `legal_basis_decision.md`, `legal_consultation_notes.md`, `pilot_checklist.json`, `legal_sign_off.eml` |
| C | `photos/`, `photo_index.csv`, `ai_outputs.json`, `quality_report.md`, `prompt_selection.json` |
| D | `eligible_sellers.csv`, `enriched_profiles.json`, `recruitment_log.json`, `cohort_profile.json` |
| E | `synthesis.json`, `persona.md`, `workflow_checklist.md`, `pilot_brief.md` |

`graph/output/` is gitignored. Research data containing personal data is not
committed to a public repository — and this repository is public.

### 7.1 Deletion

Not committing the data is not the same as deleting it. G1 decides a retention
period and names a deletion owner; `plan.json` `data_retention` records the
obligation and lists every output it covers, across Loops A, D and E.

Both the period and the owner are `[TBD]` until G1 runs. They stay `[TBD]` —
filling in a plausible number here would be inventing the answer to the
question G1 exists to ask.

Until 2026-08-16 no node in the graph deleted anything, no milestone tracked
it, and no requirement recorded it. The graph obtained permission to hold
personal data on a promise to delete it, and contained nothing that kept the
promise.

---

## 8. Roles

| Role | Responsibility | Loops |
|---|---|---|
| PO (Eimantas) | Agent design, prompts, validation, escalation, final editorial responsibility | all |
| Claude | Search, generation, pattern extraction, synthesis | A, C, D, E |
| Legal / DPO | **G1 decision**, G2 sign-off, brief review | B, E |
| Compliance | Risk eligibility screening (returns a decision, not data) | B, D |
| Data team | Transaction query | D |
| CTO | Technical feasibility review | E |
| Cohort sellers (5) | Participation, feedback | live pilot |

Every output published outside this repository is the PO's responsibility,
regardless of which agent generated it. That is the lesson of v1.0.

---

## 9. Market scope

The competitive set for this product is Lithuanian: **skelbiu.lt**,
**autoplius.lt**, **aruodas.lt**, and Facebook Marketplace / LT buy-sell groups.

**Vinted** is adjacent — LT-founded, useful as a trust and logistics design
reference, but a fashion-resale marketplace and not a used-electronics
comparable.

**OLX, eBay and Craigslist are out of scope** and must not appear as
competitors or as price comparables. v1.0 benchmarked against OLX, eBay and
Vinted, and drew price comparables "from an eBay/Vinted API". The validator now
fails on those names.

---

## 10. Reusability

If this pilot works, the structure — not the content — becomes a skill:

- **Name:** `paysera:product-discovery`
- **Shape:** legal-basis gate first → parallel evidence loops → gated synthesis
- **Parameters:** category, market, cohort size, interview count
- **Non-negotiable across every instance:** the gate order, the provenance tags,
  and the mandatory review before publication.

---

**Last updated:** 2026-08-16
**Status:** READY FOR EXECUTION — starting with Loop-B and Loop-C on P1
**First checkpoint:** P6 (G1)
