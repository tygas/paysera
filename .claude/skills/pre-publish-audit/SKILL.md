---
name: pre-publish-audit
description: >-
  Adversarial review of any artefact before it leaves this machine — a repo
  directory, a document, a brief, an email attachment, a public link. Use
  whenever output is about to be published, sent, linked, or shown to someone
  outside the session. Triggers: "publish", "send", "push", "share", "attach",
  "ready to send", "commit the docs", "put it in the repo", "link them to it".
  Also use before answering "is this done?" about anything a third party will read.
---

# Pre-publish audit

## Why this exists

On 2026-08-11 a loop-graph directory was generated, committed, pushed, and linked
from a job application as evidence of how I work. It was never read back. It
contained invented research results, competitors from the wrong country,
Indonesian text inside Lithuanian prose, dates that contradicted each other
across five files, and a schedule that put production customer-data queries
eleven days ahead of the legal sign-off authorising them.

Every one of those was visible on a careful read. Nobody read it.

The failure was not the generation. Generation is allowed to be wrong. The
failure was that **generation and publication were a single step**, so nothing
sat between a plausible draft and a public artefact.

This skill is that step.

---

## The rule

> Nothing generated becomes published without a separate adversarial pass whose
> explicit job is to find what is wrong with it.

Separate means: a different pass, with a different prompt, whose success
criterion is *finding defects* — not confirming quality. A reviewer asked
"is this good?" says yes. A reviewer asked "this is wrong, find out how" finds
things.

---

## Procedure

### Step 0 — Say what the artefact claims to be

One sentence. "A loop graph implementing the 30-day plan from the application
letter." This sentence is the yardstick for step 3.

### Step 1 — Machine pass

```bash
node tools/validate-graph.mjs
```

Must exit 0. It checks the five categories mechanically: sequencing, drift,
market scope, unsourced claims, language artifacts. It is the floor.

If the artefact is not this repo's graph, the equivalent floor is: does a
machine check exist for the categories that matter here? If not, that is the
first thing to build.

### Step 2 — Adversarial pass, one lens at a time

Run these as **separate** reviews. Do not merge them into one "review this
document" prompt — a single pass optimises for the loudest problem and misses
the quiet ones. Each lens gets its own prompt and its own output.

Each lens returns a list of findings with `file:line`, or the sentence
**"No findings"**. "Looks good" is not a valid output.

---

#### Lens 1 — Fabrication

> Go through this document and list every factual claim: numbers, dates,
> counts, quotes, named entities, capabilities, statuses. For each one, name
> the source. If you cannot name a source, say INVENTED. Do not explain the
> claims. Just classify them.

Specifically hunt for:
- Numbers presented without a source, especially round and impressive ones
- Quotation marks around a sentence nobody said
- **A template shipped with worked examples that read as findings**
- Approval marks, tick marks or sign-off lines above unfilled fields
- Pre-written conclusions inside an agent prompt — the agent being told what to find
- A capability described in the present tense that is actually a hypothesis

> The 2026-08-11 failure mode was the third one. A pilot brief template shipped
> with a five-seller cohort table, "12/15 mentions", a v1/v2/v3 accuracy matrix
> and four verbatim seller quotes. A reader had no way to tell them from real
> output. Invented quotes are the worst of these, because a quote is the part a
> reader trusts most.

**Then check the promise.** If any document in this project states a rule about
evidence — `Application-progress.md` says "Do not invent dates, metrics, team
sizes, tools, ownership, or business outcomes" — re-read the artefact against
that exact sentence. A document that violates its own project's stated rule is
worse than one that never made the promise.

#### Lens 2 — Market and domain reality

> Which country, market and user is this for? List every competitor, platform,
> channel, price source and comparable named in the document. For each: does it
> actually operate in that market, in that category, at a scale that matters?
> Then list what a knowledgeable local would have named that is missing.

The tell is not that a name is wrong. The tell is **which names are missing**.
A Lithuanian classifieds document that names OLX and eBay but never names
skelbiu.lt was not written by anyone who checked the market — and that is what
the reader concludes.

#### Lens 3 — Language and register

> Read every sentence in the non-English portions. Flag anything that is not
> correct in that language: words from another language, garbled tokens, machine
> translation artifacts, terms in a register a native speaker would not use.
> Quote each one.

Non-Latin characters and known bad tokens are caught mechanically (C5). This
lens catches what the machine cannot: fluent-looking nonsense. `parallelliai`,
`pirmaasistripe`, `Laisvieji šneliai` and `grubul indai` all read as words at a
glance. `Untuk setiap` is Indonesian and sat at the top of an agent prompt.

#### Lens 4 — Internal consistency

> Build a table of every number, date, threshold, agent name, file path and
> defined term that appears more than once anywhere in this artefact. Show every
> value each appears with. Flag every disagreement.

This is mechanical work that a human eye reliably fails at. Do it as a table,
not as a read-through.

Also check: does a term mean the same thing in every row it appears? The
2026-08-11 tables used "Kritinis" to mean the lowest bar in the count rows and
the latest date in the delay rows — the same word meaning floor and ceiling two
lines apart.

#### Lens 5 — Process order and consequences

> Draw the actual execution order. For each step: what does it touch, what
> authorises it, and has that authorisation happened yet at that point in the
> timeline? Then, for each step, ask: if this ran exactly as written, in a
> regulated financial institution, what would go wrong and who would be
> accountable?

This is the lens that catches the expensive ones. Look for:
- Data access scheduled before the decision that permits it
- Consent collected after the thing it is meant to authorise
- Data collected for a legal obligation reused for a commercial purpose
- Approval steps marked "optional" or with a "proceed pending approval" path
- A dependency stated as "none" between two things that are actually dependent

> The 2026-08-11 graph queried the production transaction database on day 3,
> pulled identity-verification and AML flags on day 8, emailed real customers on
> day 8, collected consent on day 10 — and scheduled the legal sign-off for
> day 14. `INDEX.md` stated "Dependencies: None between loops." Every individual
> loop looked reasonable. The defect only exists in the ordering.

**Rule of thumb:** if a document contains both a compliance step and a
data-touching step, put them on one timeline and look at which comes first.
That single act would have caught it.

### Step 3 — The yardstick check

Re-read the step 0 sentence. Does the artefact do what it claims?

If it claims to implement a plan stated elsewhere, open that plan and diff them.
The 2026-08-11 graph said 15–20 interviews; the letter it implemented said
10–15. The graph described protected payment as an existing feature; the letter
had correctly called it a hypothesis pending legal validation. The graph
contradicted the document it was evidence for.

### Step 4 — Record the pass

Findings go in a dated audit note next to the artefact. If there were no
findings, record that too, with the date and what was checked. An unrecorded
review did not happen.

---

## Definition of done for anything published

An artefact is publishable only when **all** of these are true:

- [ ] Machine validation exits 0
- [ ] All five lenses run separately, each returning findings or "No findings"
- [ ] Every factual claim has a named source, or is marked as unknown/hypothesis
- [ ] Placeholders are visibly placeholders — never plausible-looking examples
- [ ] Every step that touches personal data sits after the decision authorising it
- [ ] Numbers, dates and names agree across every file
- [ ] Non-English text read end to end by someone who speaks it
- [ ] Checked against the document it claims to implement
- [ ] Audit note written and dated

**A `[TBD]` in a published document is an honest answer. A plausible number in
place of a `[TBD]` is a defect.** This is the single most useful sentence in
this skill.

---

## Scaling the pass

Not everything needs five lenses.

| Artefact | Pass |
|---|---|
| Throwaway script, local only | None |
| Internal note, one reader who knows the context | Lens 1 and 4 |
| Anything committed to a public repo | Full pass |
| Anything linked from an email to a third party | Full pass + a night's gap before sending |
| Anything a regulator, auditor or customer could read | Full pass + named human reviewer |

The 2026-08-11 artefact was in row four and got row one.

---

## What this skill does not do

It does not check whether a sourced number is *true* — only that a source
exists. It does not check whether the plan is *good* — only that it is
consistent and correctly ordered. It will not catch a lie told consistently
across every file.

Those need a person who knows the domain. This skill's job is to make sure that
person is looking at something worth their attention.
