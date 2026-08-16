# Graph loops and tools review — 2026-08-16

## Scope

Reviewed the current `graph/` execution model and the supporting scripts in
`tools/`. There is no `graph/tools/` directory: the graph definitions live in
`graph/`, while their validator, publication guard and regression tests live in
the repository-level `tools/` directory.

## Plain-language model

The graph is a 30-day preparation plan made of five feedback loops:

1. Loop B establishes the legal rules and closes two approval gates.
2. Loop C tests whether photos can safely become draft listings without using
   personal data, so it can start immediately.
3. After the lawful-basis gate G1 closes, Loop A interviews people and Loop D
   identifies/recruits a small seller cohort.
4. Loop E waits for all four earlier loops and both G1 and G2. It combines their
   evidence into a pilot brief.
5. Human CTO and Legal review closes G3 before the CEO decision. The live pilot
   starts only after the rest of the preparation window is complete.

`graph/plan.json` is the master plan. The YAML files are detailed instructions
for each loop. `exit-conditions.json` is the daily scorecard. README and INDEX
are the human-readable views. `tools/validate-graph.mjs` compares these copies
and enforces safety rules; the two test scripts deliberately damage temporary
copies to prove those checks can actually fail. `pre-publish-guard.mjs` runs the
validator before selected publish commands in Claude Code.

## Findings and fixes

### F16 — high — G2 failure path contradicted the executable graph

G2 structurally blocked all of Loop E, including drafting the brief, but its
`on_miss` and escalation prose said the brief would still be presented as
"scope pending". Both statements could not be true. Fixed the failure path in
`plan.json`, `exit-conditions.json`, README and INDEX: Loop E and the CEO
presentation now move later until G2 closes; open items remain visible after
drafting resumes.

### F17 — high — G3 blocked a nonexistent node

G3 declared `blocks: ["ceo_presentation"]`, but the graph has no node or
milestone with that ID; it has `ceo_decision`. Renamed the blocked target to the
real milestone and added validation that every `gate.blocks` target exists.

### F18 — high — gate ownership links were not validated

A gate could name a missing/wrong closing agent, disagree with that agent's
`closes_gate`, or close on a different day and the validator could still pass.
Added bidirectional owner/agent checks, close-day checks, tracking-file owner
checks and `closes_gate` drift checks.

### F19 — medium — milestones were not compared

`exit-conditions.json` could silently move, omit or invent milestones. Added
two-way milestone ID comparison and day comparison against `plan.json`.

### F20 — medium — same-day agent dependency cycles could pass

The date-order check permits a dependent task to start on the day its input
task ends. Two same-day tasks could therefore depend on each other and pass the
date check even though neither could start. Added explicit cycle detection.

## Verification

The implementation mutation suite now contains dedicated failing fixtures for
gate closers, milestone drift, unknown blocked milestones and dependency
cycles. Run all checks with:

```text
node tools/validate-graph.mjs
node tools/test-validator.mjs
node tools/test-implementation-checks.mjs
```

