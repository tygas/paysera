# CLAUDE.md — working rules for this repository

This repository is a job application to Paysera Tech. It is **public**, and it
is read as evidence of how I work. That raises the bar on everything committed
here.

---

## The rule that matters

**Generation and publication are two separate steps.**

Anything generated here — a document, a directory, a plan, a brief — gets an
adversarial review before it is committed, pushed, linked or sent. The review's
job is to find what is wrong, not to confirm that it is fine.

Run it: `.claude/skills/pre-publish-audit/SKILL.md`

This rule exists because on 2026-08-11 a loop graph was generated, committed,
pushed and linked from an application email in one motion, without ever being
read back. See [`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md).

---

## Before any commit that touches `graph/`

```bash
node tools/validate-graph.mjs --strict    # must exit 0; warnings block publication
node tools/test-validator.mjs             # proves the checks still detect the v1.0 defects
node tools/test-implementation-checks.mjs # proves each check can still be made to fail
node tools/test-pre-publish-guard.mjs     # proves command detection and snapshot checks fail closed
```

**A green validator run is not evidence that a check ran.** On 2026-08-16 an
implementation audit found that C2's gate/status check had been reading
`blocks_loops` off the `plan.json` gates, which only ever defined
`blocks_agents`. It iterated an empty array on every invocation and had never
performed a single comparison — while `graph/INDEX.md` told readers "The
validator enforces this".

`test-implementation-checks.mjs` exists for that reason: it reintroduces each
defect into a temporary copy of the tree and asserts the validator reports it.
`test-validator.mjs` cannot cover the newer checks, because v1.0 predates the
structures they read. See part II of
[`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md).

---

## Evidence rules

Carried over from `Application-progress.md`, which stated them first and which
the 2026-08-11 output then violated:

> Do not invent dates, metrics, team sizes, tools, ownership, or business outcomes.

In practice:

1. **Every factual claim carries a source.** A number, a date, a count, a quote,
   a capability, a status. If there is no source, the claim is marked `[TBD]`,
   `[HYPOTHESIS]`, or deleted.
2. **`[TBD]` is a valid answer.** A plausible number in place of a `[TBD]` is
   not. Silence about a fact looks better than a fact that turns out to be made
   up — and it is the only version that survives being checked.
3. **Quotation marks mean somebody said it.** Never write an illustrative quote
   that reads as real.
4. **Templates ship empty.** A template containing worked examples that look
   like findings is the most dangerous document shape in this repo, because the
   examples get read as results.
5. **Hypotheses stay in the hypothetical.** Protected payment for consumer
   classifieds is a hypothesis pending legal validation. It is never described
   in the present tense as a Paysera feature.

---

## Market context

The product is for the **Lithuanian** market. The competitive set is
**skelbiu.lt, autoplius.lt, aruodas.lt**, and Facebook Marketplace / LT
buy-sell groups — the set named in the CEO's letter.

Vinted is adjacent: LT-founded and a useful trust-design reference, but a
fashion-resale marketplace, not a used-electronics competitor or price
comparable.

**OLX, eBay and Craigslist are out of scope.** They are not meaningful in this
market, and naming them signals the market was never checked. The validator
fails on them (check C3).

---

## Regulated-institution rules

Paysera is a licensed electronic money institution. Any plan written here treats
that as a hard constraint, not as flavour.

1. **Legal basis before personal data.** No step collects, queries, enriches or
   contacts a natural person before the written decision authorising it exists.
   This is a gate, not a task.
2. **Consent before the thing it authorises**, not after.
3. **Purpose limitation.** Data collected under a legal obligation — AML, KYC,
   identity verification — is not reused for product research or marketing
   without a separate written decision.
4. **No approval bypass.** "Proceed pending sign-off" is not an escalation path.
   Being behind schedule buys a later date or a narrower scope. It never buys a
   skipped review, a skipped consent, or a bypassed gate.
5. **Review steps are never optional.** If a plan marks one "optional", that is
   a defect.

Checks C1 and S1 in `tools/validate-graph.mjs` enforce the mechanical parts.

---

## Language

Lithuanian documents are read end to end by a Lithuanian speaker before
publishing. The validator catches non-Latin scripts and known bad tokens
(check C5); it cannot catch fluent nonsense.

Applies to prose, agent prompts, YAML comments and email templates alike — the
2026-08-11 defects were mostly inside agent prompts, where nobody was looking.

---

## Repository layout

| Path | What it is |
|---|---|
| `Task.md` | The original letter from Paysera Tech |
| `Part2.md` | The follow-up: find your own errors, close three gaps |
| `Application-progress.md` | Fact-vs-claim working file for the application |
| `Paysera-atsakymas.md` | The reply that was sent |
| `Part2-atsakymas.md` | The follow-up reply |
| `AUDIT-graph-2026-08-16.md` | Findings and fixes: part I — the v1.0 graph as a document; part II — the v2.0 graph as an implementation |
| `graph/plan.json` | **Single source of truth** for the loop graph |
| `graph/` | The loop graph — five loops, two gates |
| `tools/` | Pre-publish validator and its regression test |
| `.claude/skills/pre-publish-audit/` | The review procedure |

`graph/output/` is gitignored: it holds interview transcripts and seller
profiles, which are personal data, and this repository is public.
