# Implementation audit — loop graph v2.0

**Date:** 2026-08-16
**Scope:** `graph/` (v2.0) and `tools/validate-graph.mjs`
**Method:** structural review of the graph as an executable artefact — gates,
edges, thresholds, and the checks that are supposed to hold them together.
**Starting state:** `node tools/validate-graph.mjs` exits 0.
`node tools/test-validator.mjs` is green.

---

## Why this is a separate audit

`AUDIT-graph-2026-08-16.md` covers what was wrong with v1.0 *as a document*:
invented facts, wrong market, garbled language, drifted dates, and the
sequencing error. v2.0 fixed those and built a validator to keep them fixed.

This audit asks a different question: **does the v2.0 graph hold up as an
implementation?** Not "is the prose true" but "are the edges real, do the
gates bind, and does the validator check what it claims to check".

The headline result is that the validator passes, and passing means less than
it appears to. One of its seven checks has never executed a single comparison.
Two documents disagree in ways it structurally cannot see. And the defect class
it was built to catch — fabricated agent names in `README.md` — is present in
`README.md` right now.

Severity is about consequence, not about how hard the finding was to spot.

---

## Findings

| # | Severity | Area | Summary |
|---|---|---|---|
| F1 | **High** | Validator | C2's gate/status check is dead code; `INDEX.md` claims it is enforced |
| F2 | **High** | Drift | `README.md` diagram names four Loop-D agents that do not exist |
| F3 | **High** | Sequencing | Loop-E processes customer data gated only on G2, not on G1 |
| F4 | **High** | Thresholds | Two live metrics are polarity-inverted; the vocabulary has no direction |
| F5 | **High** | Controls | The graph's stated safety metric cannot fail anything |
| F6 | Medium | Validator | `exit-conditions.json` is validated in one direction only |
| F7 | Medium | Graph | `plan.json` contains no cross-loop dependency edges |
| F8 | Medium | Graph | Two binary requirements are due after their loop has closed; P26–P30 has no owner |
| F9 | Medium | Drift | Loop-D escalation day is P14 in one file, P15 in two others |
| F10 | Medium | Drift | `GRAPH-SETUP.md` gives Loop-D a P7–P20 window; `plan.json` says P7–P19 |
| F11 | Medium | Compliance | No node executes the retention/deletion decision G1 produces |
| F12 | Medium | Validator | Incentive amounts are duplicated in four places and never compared |
| F13 | Low | Consistency | Same-day and next-day handoff conventions are mixed, including within one loop |
| F14 | Low | Docs | `INDEX.md` threshold table omits three metrics and all of Loop-E |
| F15 | Low | Validator | C1 checks that `requires_gate` exists, never that it is the right gate |

---

### F1 — The gate/status check has never run · **High**

`tools/validate-graph.mjs` C2:

```js
for (const [gid, gate] of Object.entries(plan.gates || {})) {
  ...
  if (g.status !== 'closed') {
    for (const loopId of gate.blocks_loops || []) {      // <-- plan.json gate
```

`plan.json` gates define `blocks_agents`. They do not define `blocks_loops` —
that key exists only in `exit-conditions.json`. The loop body therefore
iterates an empty array on every run and has never performed a comparison.

The rule it was written to enforce is the one that keeps the tracking file
honest: while a gate is open, everything it blocks must read
`blocked_by_gate`. Today `exit-conditions.json` could mark Loop-D
`in_progress` with G1 still `pending` and the validator would exit 0.

Compounding it, `graph/INDEX.md:152` tells the reader:

> **While `G1.status != "closed"`, Loop-A and Loop-D status must remain
> `blocked_by_gate`.** The validator enforces this.

It does not. A control that is documented but absent is worse than one that is
absent, because it stops anyone from checking by hand.

**Fix:** derive the blocked loops from `blocks_agents`, cross-check them against
the `blocks_loops` list in `exit-conditions.json`, and fail if the two disagree.

---

### F2 — `README.md` reintroduces the fabricated-agent-name defect · **High**

`graph/README.md:79–82`, the Loop-D column of the flow diagram:

```
│ P7–P9   query_transactions  │
│ P9–P11  enrich_profiles     │
│ P11–P17 recruit_cohort      │
│ P18–P19 analyze_cohort      │
```

None of these four names exist in `plan.json` or in
`loop-d-repeat-sellers.yaml`. The real ids are `query_paysera_transactions`,
`enrich_seller_profiles`, `recruit_pilot_cohort`, `analyze_cohort_profile`.
The Loop-A column of the same diagram uses correct ids, so the diagram is
internally inconsistent as well.

This is the exact defect `INDEX.md:83–86` claims was fixed:

> In v1.0 they were not — `README.md` referred to `schedule_call`,
> `compliance_check`, `map_to_scope`, `filter_repeat_sellers` and
> `quality_check`, none of which existed in the YAML.

C2 does not catch it because its prose check is substring-based: it looks for
lines *containing* a real agent id and then validates the day numbers near it.
An abbreviated name contains no real id, so the line is never examined. The
check catches wrong days attached to right names, and is blind to wrong names.

**Fix:** correct the four names, and add a check that flags `snake_case` tokens
in the prose documents that look like agent ids but match none.

---

### F3 — Loop-E handles customer data behind the wrong gate · **High**

Three of Loop-E's four agents carry `data_class: customer_personal`
(`synthesize_all_outputs`, `create_persona`, `draft_pilot_brief`). Loop-E's
`gated_by` is `G2` — *pilot scope sign-off*, a commercial approval.

The lawful basis for touching a natural person's data is G1. The graph as
written asserts that building personas and a brief out of customer data is
authorised by a scope decision. For a licensed EMI that is the wrong
authority on the wrong document.

C1 passes it because C1 asks only "does this agent's loop declare *a* gate, and
does the agent start after it closes". Any gate satisfies the check. The root
cause is that `gated_by` is a scalar, so the model cannot express **G1 and G2**.

In practice the ordering is safe — G1 closes P6, Loop-E starts P21 — so this is
a modelling defect rather than a live sequencing violation. It matters because
the graph is meant to be the control: if the schedule ever compresses, nothing
records that Loop-E's personal-data processing depends on G1 at all.

**Fix:** `gated_by` becomes a list; Loop-E declares `["G1", "G2"]`; its
personal-data agents are added to `G1.blocks_agents`; C1 validates every gate
in the list rather than one.

---

### F4 — Two live metrics are polarity-inverted · **High**

`plan.json` defines the vocabulary and explains why:

> `minimum`: Below this the loop is FAILED. Not a soft target.
> v1.0 used `Kritinis | Būtina | Pageidautina`. Their meaning was inverted
> between the count rows and the delay rows, so the same word meant 'floor' in
> one row and 'ceiling' in the next.

Two metrics do exactly that:

| Location | Metric | Values | Read literally |
|---|---|---|---|
| `exit-conditions.json` | `loop_c.hallucination_rate_pct` | minimum 5 / target 0 / stretch 0 | a 0% hallucination rate **fails** the loop |
| `plan.json` | `measurement_definitions.listing_time_minutes` | minimum 10 / target 5 | a 5-minute listing **fails** the metric |

`exit-conditions.json` acknowledges the problem in a prose note — "lower is
better, so minimum is the ceiling here" — which is the v1.0 defect restated
rather than removed. The second instance is in the source of truth itself.

S2's monotonicity check misses both: it iterates `loop.thresholds` in
`plan.json` only, so it never sees `exit-conditions.json` metrics and never
sees `measurement_definitions`.

**Fix:** add an explicit `direction` to every threshold; express lower-better
metrics with `maximum` instead of `minimum`; extend S2 to check direction-aware
monotonicity across `plan.json` thresholds, `measurement_definitions`, and
`exit-conditions.json`.

---

### F5 — The safety metric cannot fail anything · **High**

`loop-c-photo-listing.yaml:175–178` states the stake plainly:

> `hallucination_rate`: … Tai svarbiausias saugumo rodiklis: klaidingas
> skelbimas reguliuojamoje platformoje yra rizika, o ne tik kokybės klausimas.

That metric appears in `exit-conditions.json` and nowhere else that binds:

- absent from `plan.json` `loop_c.thresholds`
- absent from `loop-c-photo-listing.yaml` `exit_conditions.completion`
- not a binary requirement
- absent from every escalation rule — Loop-C escalates on `quality < 6/10` only

Loop-C can therefore complete at target with every generated listing carrying
invented specifications. The one metric the graph calls a safety indicator is
the one metric with no consequence attached.

**Fix:** promote it to `plan.json` as a directional threshold, mirror it into
the YAML exit conditions, and add it to Loop-C's escalation rules.

---

### F6 — `exit-conditions.json` is validated in one direction · Medium

C2 walks `plan.json` and asserts each element appears in `exit-conditions.json`
with matching values. It never walks the other way, so anything present only in
the tracking file is unconstrained:

| Loop | Only in `exit-conditions.json` |
|---|---|
| A | `theme_saturation` |
| C | `hallucination_rate_pct` |
| E | `untagged_claims`, `tbd_count` |

The YAML `exit_conditions` blocks are not checked at all, which produces a
three-way split for Loop-C:

| Source | Metrics |
|---|---|
| `plan.json` | test_photos, photos_with_output, quality_score_of_10, prompt_versions |
| `exit-conditions.json` | + `hallucination_rate_pct` |
| `loop-c-*.yaml` | + `prompt_version_selected`, no hallucination metric |

Three files, three answers to "what does Loop-C have to hit". That is the C2
defect class alive inside the file C2 exists to protect.

**Fix:** make the metric-set comparison bidirectional and extend it to the YAML
`exit_conditions.completion` blocks.

---

### F7 — The graph has no cross-loop edges · Medium

Every `depends_on` in `plan.json` resolves inside its own loop.
`loop_e.synthesize_all_outputs` — which consumes all four loops' outputs — has
`depends_on: []`. S2 confirms this by construction: it builds `byId` from
`loop.agents`, so a cross-loop reference would be reported as an unknown agent.

Loop-E's real dependencies are recorded in two unvalidated places: a
`depends_on` array in `exit-conditions.json` and a `depends_on_completion`
comment block in the YAML.

So the ordering that makes the graph a graph is held by nothing but the
coincidence that P21 is greater than P20. Change one day number in `plan.json`
and no check objects.

**Fix:** add `depends_on_loops` to `plan.json`, validate that each dependency
finishes before the dependent loop starts, and check the YAML and tracking file
agree.

---

### F8 — Requirements due after their loop closes; P26–P30 has no owner · Medium

`loop_e` runs P21–P25. Two of its binary requirements are due P26:

```json
"legal_review": { "due_day": 26, "met": null, "substitute_allowed": false },
"cto_review":   { "due_day": 26, "met": null, "substitute_allowed": false }
```

Days P26–P30 carry three milestones — internal review, CEO decision, prep
complete — and no loop, no agent, no owner, no exit conditions. The mandatory
review is the one step `CLAUDE.md` puts above everything else, and it is the
step the graph models least.

**Fix:** model the review as a third gate, **G3 — publication approval**,
closing end of P26 and blocking the CEO presentation. It is the graph's own
founding rule ("generation and publication are two separate steps") written
into the structure that enforces it. Add a validator check that any binary
requirement with a `due_day` falls inside its owner's window.

---

### F9 — Loop-D escalation day disagrees across three files · Medium

| File | Says |
|---|---|
| `graph/INDEX.md:166` | **P14** — `< 3 confirmed` → extend candidate list 20 → 40 |
| `graph/loop-d-repeat-sellers.yaml:392,399` | P14 is the *warning*; the action is at **P15** |
| `graph/exit-conditions.json:197` | key is `p15_under_3_confirmed` |

`INDEX.md` promotes a warning threshold into an action a day early. C2's prose
check does not fire because the line contains no agent id.

**Fix:** `INDEX.md` row becomes P15, matching the two files that agree.

---

### F10 — `GRAPH-SETUP.md` gives Loop-D the wrong window · Medium

`GRAPH-SETUP.md:23`:

```
P7–P20   Loop-A interviews   +  Loop-D cohort recruitment
```

`plan.json` gives Loop-D P7–**P19**. Same blind spot as F9: no agent id on the
line, so C2 does not look.

---

### F11 — Nothing executes the retention decision · Medium

G1's deliverables include "Retention period + deletion procedure for research
data", and `legal_basis_review` outputs `retention_days` and `deletion_owner`.

No agent in any loop deletes anything. No milestone tracks it. No binary
requirement records it. The graph obtains permission to hold personal data on a
promise to delete it, and then contains no node that keeps the promise.

The affected outputs are named already: Loop-A transcripts and recordings,
Loop-D enriched profiles and recruitment log, Loop-E synthesis and persona.

**Fix:** add a `data_retention` obligation block to `plan.json` and
`exit-conditions.json`, listing the covered outputs with `[TBD — G1]` for the
period and the owner. The date cannot be filled in before G1 decides it, and
inventing one would break the evidence rules. What can be fixed now is that the
obligation is recorded and tracked instead of implied.

---

### F12 — Incentive amounts are duplicated and never compared · Medium

€20 (Loop-A) and €25 (Loop-D) each appear in four places: `plan.json`,
`exit-conditions.json`, the YAML `input` block, and the agent prompt body — plus
Loop-B's G1 questionnaire, which asks Legal to approve them.

Nothing compares these copies. Given the rule that any change to an incentive
requires re-approval under G1, a silent drift between the prompt and the
approved figure is a compliance drift, not a typo.

**Fix:** validate `incentive_eur` across `plan.json`, `exit-conditions.json` and
the YAML `input` blocks.

---

### F13 — Mixed handoff conventions · Low

Loop-A and Loop-B hand off on the same day (`find_contacts` ends P9,
`schedule_calls` starts P9). Loop-C and Loop-D hand off on the next day
(`run_photo_to_listing_ai` ends P12, `quality_check_outputs` starts P13).

Loop-B does both: `legal_basis_review` and `conduct_legal_consultation` share
the dependency `extract_compliance_docs` (ends P3) and start on P3 and P4
respectively.

Not an error — S2 permits both — but it makes every duration ambiguous by a
day and invites an off-by-one when the schedule is rebuilt. Recorded rather
than silently normalised, because changing agent days changes the plan.

---

### F14 — `INDEX.md` threshold table is incomplete · Low

Presented as the full list under "defined once in `plan.json`", it omits
`transcript_accuracy_pct` (A), `photos_with_output` (C), and every Loop-E
metric.

---

### F15 — C1 checks that a gate is named, not which one · Low

```js
if (ya && !ya.requires_gate) { error(...) }
```

A truthiness test. `requires_gate: G1` on an agent whose loop is gated by G2
passes. With F3's fix making gates a list, the check must compare contents.

---

## What was checked and found sound

Recorded so the audit is not read as a list of everything that exists.

- **Gate ordering.** G1 closes P6; every `public_personal` and
  `customer_personal` agent starts P7 or later. No agent touches a natural
  person before the lawful basis exists. The v1.0 headline defect is genuinely
  fixed.
- **Loop-D minimisation.** The excluded-fields list is specific and reasoned,
  and consent precedes participation rather than following it.
- **Market scope.** LT competitive set used consistently; excluded names appear
  only with a justification.
- **Two-clock notation.** P/L namespacing is used correctly in all seven
  documents, including the brief template.
- **Template discipline.** `pilot-brief-template.md` ships with `[TBD]`
  placeholders and no worked examples that could read as findings.
- **Threshold values against source.** Interview count 10/12/15 matches
  `Paysera-atsakymas.md`. The €1,500 cap is labelled a pilot risk limit, not an
  AML threshold.
- **S1.** `graph/output/` is gitignored and the reason is stated in the file.
- **Regression test.** `test-validator.mjs` genuinely fails v1.0 in all five
  categories; the counts are floors, not exact matches, so added checks do not
  make it brittle.

---

## Fixes applied

All fifteen findings are addressed in the same commit as this audit.

**`graph/plan.json`**
- `gated_by` becomes a list on every loop; Loop-E declares `["G1", "G2"]` (F3)
- Loop-E's three `customer_personal` agents added to `G1.blocks_agents` (F3)
- `blocks_loops` added to every gate, derived from `blocks_agents` (F1)
- `depends_on_loops` added to every loop (F7)
- `direction` added to every threshold; lower-better metrics use `maximum`;
  `listing_time_minutes` corrected (F4)
- `hallucination_rate_pct` promoted to `loop_c.thresholds` (F5)
- gate **G3 — publication approval** added, closing P26 (F8)
- `data_retention` obligation block added, with `[TBD — G1]` for period and
  owner (F11)

**`graph/exit-conditions.json`**
- mirrors all of the above; `hallucination_rate_pct` re-expressed with
  `maximum` and the apologetic note removed (F4, F5)
- `legal_review` / `cto_review` moved from `loop_e` to `gates.G3` (F8)
- `data_retention` tracking block added (F11)

**Loop YAML files**
- `gated_by` lists; Loop-E agents declare `requires_gate: [G1, G2]` (F3, F15)
- Loop-C gains the hallucination metric in `exit_conditions` and in escalation
  (F5)
- Loop-C's `prompt_version_selected` reconciled with `plan.json` (F6)

**`graph/README.md`**
- four Loop-D agent names in the flow diagram corrected (F2)
- Loop-C threshold table gains the hallucination row (F5)

**`graph/INDEX.md`**
- the false "the validator enforces this" claim replaced with what is actually
  enforced (F1)
- Loop-D escalation row P14 → P15 (F9)
- threshold table completed; G3 row added (F8, F14)

**`GRAPH-SETUP.md`**
- Loop-D window P7–P20 → P7–P19 (F10)

**`tools/validate-graph.mjs`**
- C1: multi-gate validation; `requires_gate` compared by value (F3, F15)
- C2: gate/status check reads a populated list and cross-checks both files
  (F1); metric comparison made bidirectional and extended to the YAML (F6);
  fabricated-agent-name check added (F2); incentive comparison added (F12)
- S2: direction-aware monotonicity across all three sources (F4); cross-loop
  dependency validation (F7); binary-requirement window check (F8)

**`tools/test-implementation-checks.mjs`** — new

F1 is the reason this file exists. A check that iterates an empty array reports
nothing and looks identical to a check that passes, and it stayed that way
through a full audit and a validator rewrite. `test-validator.mjs` could not
have caught it: it measures the validator against the v1.0 tree, and v1.0
predates `direction`, `depends_on_loops` and G3 entirely, so the newer checks
have nothing to fire on there.

So each new check now has a mutation test: reintroduce the defect into a
temporary copy of the tree, assert the validator reports it. Twelve cases, all
green. A check that cannot be made to fail is not a check.

---

## Verification

```
node tools/validate-graph.mjs              → exit 0, all seven checks pass
node tools/test-validator.mjs              → green; C2 detections on v1.0 rose 51 → 119
node tools/test-implementation-checks.mjs  → 12/12 checks detected their defect
```

The C2 increase is the measurable part of F2 and F6: the same v1.0 tree, the
same check, 68 additional real defects found once the check stopped being blind
to wrong names and to one-directional metric comparison.

---

## What this audit does not establish

The same limits the validator declares about itself apply here.

- It does not verify that any number in the graph is *correct* — only that the
  documents agree about it and that its polarity is coherent.
- It does not assess whether 30 preparation days is achievable, whether Legal
  can close G1 in six days, or whether the escalation ladders are realistic.
  Those are judgements about the plan, not about its implementation.
- It found F13 by reading agent windows one at a time. A convention that is
  applied inconsistently across five files is the kind of thing a reader
  normalises without noticing, and no check now catches it.
