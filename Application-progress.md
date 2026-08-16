# Paysera Tech builder-PO application — progress checkpoint

Updated: 2026-08-16

## Checkpoint 2026-08-16 — audit of our own output, and three gaps closed

Paysera's follow-up (`Part2.md`) said the `graph/` directory contradicted the
discipline this file describes, and asked us to find the defects ourselves.

We did. Five categories, 23 findings, all fixed —
[`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md). The most serious was a
sequencing error: production customer-data queries and marketing outreach were
scheduled 11 days ahead of the legal sign-off authorising them, while
`INDEX.md` stated "Dependencies: None between loops".

**This file's own rule was the one that was broken.** The line below —
"Do not invent dates, metrics, team sizes, tools, ownership, or business
outcomes" — was written here and then violated in the same week's output,
because it lived in a document nobody re-read at publication time. It is now
enforced mechanically: `tools/validate-graph.mjs` (check C4), a blocking
`PreToolUse` hook, and `.claude/skills/pre-publish-audit/SKILL.md`.

**Three previously-open facts are now confirmed** (supplied by the candidate
2026-08-16; see §"Confirmed 2026-08-16" below): AI-plan start dates, US Bank
period and team size, and remote-work preference.

---


## Objective

Prepare a concise, evidence-based Lithuanian response to the questions in
`Task.md`. The response must demonstrate real senior engineering, Product Owner
responsibility, and AI-agent workflow. Do not invent dates, metrics, team sizes,
tools, ownership, or business outcomes.

## Confirmed positioning

- Target role: Product Owner at Paysera Tech.
- Strongest initial product preference: Paysera Classifieds.
- Candidate positioning: senior frontend engineer moving toward a builder-PO
  role rather than a non-technical PO.
- Relevant public technical background: React, Redux, and TypeScript.
- Interest and current practice: prompt engineering, loops, and graphs of
  loops; continuously creating and improving reusable agent skills.

## Confirmed 2026-08-16

Supplied directly by the candidate on 2026-08-16, closing the three gaps named
in `Part2.md`.

### AI plans — start dates

| Tool | In use since | Purpose |
|---|---|---|
| ChatGPT Pro/Max | early 2025 | Multi-agent orchestration, code review, market analysis (with OMX) |
| Claude Team | summer 2026 | Primary tool: development, architecture, skill authoring |
| OpenCode Zen + usage-based API | summer 2026 | Evaluating new models, routing simple tasks to cheaper ones, small API experiments |

Roughly 1.5 years of paid AI tooling overall; Claude Team Pro for about three months.

**Correction to the sent letter.** `Paysera-atsakymas.md` stated "Claude Code
Business/Premium — 90 Eur/mėn." and "ChatGPT Pro — 20 Eur/mėn." The plan names
were imprecise and the prices were from memory.

### US Bank — period and team

- **Senior Front End Developer, U.S. Bank, full-time, 2022-12 – 2024-04
  (1 year 5 months).**
- Own team: **5 front-end engineers, 4 QA, 1 Product Owner.**
- Delivery structure: **two FE teams and two BE teams in Lithuania plus one
  team in the US** — five teams whose code went into the same release.
- Represented own team in Agile Nexus meetings.

This resolves the previously-open question of whether "five teams" meant five
repositories: it did not. It meant five teams whose work converged on one
release — which is precisely why one unfinished piece could block the whole
release, and why release-readiness criteria plus feature flags addressed it.

### Remote-work preference

- **Hybrid: 3–4 days per week from an office in Kaunas, travelling to Vilnius
  when needed.**
- Supersedes the sent letter's "Nuotolinio darbo detalę galime suderinti pokalbio
  metu", which deferred the question rather than answering it.

---

## US Bank — confirmed facts

- Role: Senior Front End Developer (title as held: "Senior Front End Developer").
- Period: 2022-12 – 2024-04, full-time. *(Confirmed 2026-08-16.)*
- Team: 5 FE engineers, 4 QA, 1 PO. *(Confirmed 2026-08-16.)*
- Product context: a banking merchant system.
- Responsibility included building the merchant system.
- Represented the team in Agile Nexus meetings concerning strategic and
  architectural decisions.
- Worked with a strong Product Owner and adopted two explicit practices from
  that collaboration: strategic thinking and attention to detail.

### Release-process case

Initial situation:

- A release combined work from five teams: two FE and two BE teams in Lithuania
  plus one team in the US. *(Confirmed 2026-08-16 — five teams, not five
  repositories. Earlier wording left this ambiguous.)*
- Releases were frequently postponed and constrained by code freezes.

Changes made:

- Defined feature eligibility / release-readiness rules.
- Used feature flags so incomplete or ineligible functionality did not require
  postponing the entire release.
- Coordinated the release across five teams.
- Reorganized communication channels to shorten response time and make
  ownership clearer.
- Established a way to cut release code without repeatedly postponing the
  release.

Personal contribution confirmed by the candidate:

1. Feature eligibility / release-readiness rules.
2. Feature-flag approach.
3. Five-team release coordination.
4. Communication and escalation organization.

Resolved 2026-08-16:

- ~~Employment dates and duration.~~ → 2022-12 – 2024-04, 1 year 5 months.
- ~~Team size.~~ → 5 FE, 4 QA, 1 PO.
- ~~Five repositories or five contributing codebases.~~ → Five *teams*
  (2 FE + 2 BE in LT, 1 in the US) converging on one release. Do not write
  "five repositories".

Still not confirmed — do not write these:

- Exact frontend stack and CI/CD tooling.
- Quantitative before/after metrics: release frequency, delay rate, lead time,
  manual steps, rollback rate, or escaped defects.
- Exact Nexus meeting cadence and examples of strategic/architectural decisions.

## Scale Tech — confirmed facts

- Built a complex business system from zero.
- Contract duration: approximately 1.5 years.
- Was fully responsible for the frontend.
- Defined requirements for the backend RBAC structure.
- Coordinated development of the business system.
- Internal description: **“We were building a machine to build a machine.”**
- The system needed a dynamic structure supporting different business
  workflows.
- It also required complex user access control.
- The customers were not technically experienced.
- For approximately one year, the team consulted them and iteratively developed
  specifications and prototypes using Agile principles.
- Access control used RBAC.
- The authorization design contained several permission levels and schemas,
  including whitelist and blacklist rules.
- Organizations could have a multilevel hierarchy.
- Access could be granted to an individual entity or a folder of entities.
- Grants and denials could be assigned by individual user, user group, team, or
  organizational level.
- The same scopes supported blacklist rules.
- Personal ownership: designed this authorization structure and then designed
  its UX.
- Illustrative access rule supplied by the candidate: developers in Paysera
  Tech Team B can share the same documents, while team leads can keep a
  document scope shared only with C-level users. Treat this as an illustrative
  explanation unless the candidate confirms it was a real production case.

Not yet confirmed:

- Employment dates, formal role, and team size.
- Frontend/backend stack.
- Workflow representation: configuration, schema, state machine, executable
  code, or another mechanism.
- Exact allowed actions (for example view, edit, execute, approve, or manage).
- Conflict precedence when a broader grant and a narrower blacklist applied to
  the same user/resource.
- Whether the supplied Team B / team-lead document rule was a real production
  case or only an illustrative example.
- Business outcome and present product status.

## Drafting decision

Enough evidence exists to prepare the application. Remaining unknowns must be
handled explicitly rather than blocking indefinitely:

- ~~AI-plan start dates were requested more than once but not supplied.~~
  → Supplied 2026-08-16. See "Confirmed 2026-08-16".
- Exact monthly spend still not supplied. **Omit prices rather than estimate
  them** — the sent letter's €90 / €20 figures were from memory and the plan
  names were wrong.
- ~~Remote-work preference was not explicitly restated.~~ → Hybrid, 3–4 days per
  week from Kaunas, travelling to Vilnius as needed.
- ~~Exact employment dates and team size for US Bank.~~ → Supplied 2026-08-16.
- Scale Tech employment dates, formal role and team size remain unknown.
- Quantitative delivery/business outcomes remain unknown.

## Remaining application questions

The following facts are still required before drafting the final answer:

1. ~~AI subscriptions and tools.~~ **Closed 2026-08-16.** Tools and start dates
   are in "Confirmed 2026-08-16": ChatGPT Pro/Max since early 2025, Claude Team
   since summer 2026, OpenCode Zen + usage-based API since summer 2026. Usage:
   Claude for development and architecture; GPT with OMX for code review and
   market analysis; OpenCode for evaluating models and small API experiments.
   Still open: exact billing amounts — omit rather than estimate. Do not imply
   that other popular engineering tools are personally used.
2. AI-built skills/projects: strongest selected example is the work SRIS
   project. It includes reusable clean-code skills, deployment skills, and a
   skill that answers business analysts' questions about legacy repository
   behavior/functionality. Still needed: personal ownership, implementation
   mechanism, duration, users/adoption, and a defensible result.

### Verified skill-repository evidence

Inspected local repository:
`/Users/etauklys/WebstormProjects/am-claude-skills/`.

- It is a shared Claude Code marketplace for Aplinkos Ministerija projects.
- Git shortlog shows 41 commits under `Eimantas <tygasz@gmail.com>` plus two
  commits under another candidate identity/email.
- Candidate-authored work on 2026-07-28 includes extracting the TypeScript
  coding standards into `am/skills/am/coding-standards.md`, introducing a
  12-item pre-submit checklist, adding a Tailwind guard, resolving
  styled-components contradictions, and incorporating two rounds of review
  feedback.
- Candidate also corrected documentation drift in both the main `am` skill and
  the `biip-deploy` skill after checking the live organization setup.
- The `am` skill captures repository-aware conventions across Moleculer/TS,
  React/Vue/Vite, WordPress/Bedrock, Java/Maven ALIS, GitHub Actions, and
  deployment workflows. It includes legacy ALIS repository landmarks,
  parallel exploration guidance, form/validation parity checks, and evidence
  requirements for deployment verification.
- The `biip-deploy` skill is a detailed operational playbook, but its creation
  history belongs mainly to another contributor; the candidate has one
  verified drift-correction commit there. Do not claim authorship of the whole
  deploy skill.
- Candidate confirmed there is no separate business-analyst Q&A skill: the
  intended example is the legacy ALIS discovery/parity guidance inside the
  shared `am` skill. Describe it as repository-aware guidance that helps
  analysts and engineers recover and compare old-system behavior, not as a
  standalone deployed Q&A product.
- Repository-wide authored diff stats for candidate identities over `am/**`
  and `biip-deploy/**`: 697 added and 349 deleted lines. Use commit/file facts
  rather than line counts in the final application unless detail is requested.
3. Other lead and PO experience: company/project, period, team, personal
   decisions, and outcome.
4. Paysera Classifieds thesis — proposed by the agent acting as senior PO:
   - First wedge: used consumer electronics within the broader `daiktai`
     category, initially phones/laptops and a geographically dense Lithuanian
     pilot rather than launching every vertical at once.
   - First seller: a private person with a working unused device who postpones
     selling because creating a credible listing, choosing a price, filtering
     scam messages, and arranging payment/delivery feels like too much work.
   - Buyer problem: low trust in seller identity, item condition, external
     payment/delivery links, and whether the item will arrive.
   - AI-first hypothesis: photo-led listing creation can extract device/model
     attributes, propose a title/description and price range, flag missing
     evidence, and publish a structured listing in about a minute. Pairing this
     with Paysera-verified identities and an in-product protected-payment flow
     should improve both supply activation and transaction trust. Protected
     payment is a hypothesis subject to legal/compliance validation, not a
     claim about an already available consumer-classifieds product.
   - Primary metric: 14-day sell-through rate — the percentage of activated
     listings that reach a confirmed completed transaction within 14 days.
     Supporting diagnostics: photo-to-publish completion, median publish time,
     qualified buyer conversations per listing, dispute/fraud-report rate, and
     repeat listing rate.
   - First 30 days: (1) interview 10–15 recent sellers/buyers and inspect scam
     and abandonment journeys; (2) map legal/compliance constraints for
     identity, payments, funds holding, disputes, and prohibited goods; (3)
     prototype photo-to-listing plus verified chat/payment journey; (4) recruit
     a narrow seed cohort from existing Paysera channels/internal network;
     (5) run a concierge pilot with manually supported matching/payment and
     instrument the funnel; (6) decide whether evidence supports expanding the
     category, changing the wedge, or stopping.
   - Evidence behind the direction: Paysera publicly states that its Checkout
     serves more than 13,000 e-shops and documents fraud patterns where a buyer
     pays for an advertised parcel that never arrives. Lithuanian police also
     explicitly warns about fraud originating from listings and social-media
     sales. These support testing trust/payment as a wedge, but they do not
     prove product-market fit.
5. Work conditions: full-time confirmed; daily English confirmed; can start in
   2–4 weeks; MB contracting is acceptable; expected fixed compensation is
   EUR 4,000 per month. Because MB was named, do not call this `gross salary`
   unless an employment-contract alternative is later confirmed. ~~Remote-work
   preference was asked but not explicitly answered.~~ → **Closed 2026-08-16:**
   hybrid, 3–4 days per week from Kaunas, travelling to Vilnius as needed.

### Note on the ordering in item 4

The "First 30 days" list above runs (1) interviews → (2) map legal/compliance
constraints. That ordering is the seed of the sequencing defect found in
`graph/` on 2026-08-16: it puts talking to people ahead of establishing the
basis for holding their data.

For a licensed institution the correct order is the reverse. The corrected loop
graph closes a legal-basis gate on P6 and starts all personal-data work on P7.
**If this thesis is restated anywhere, restate it in that order.**

## Resume point

The AI-plan question is closed (see "Confirmed 2026-08-16"). Open items, in
priority order:

1. Scale Tech: employment dates, formal role, team size.
2. Other lead/PO experience: company, period, team, personal decisions, outcome.
3. Any defensible before/after observation for the US Bank release work —
   qualitative is fine, invented is not.

## Writing constraints

- Prefer first-person singular for personal ownership and first-person plural
  only for genuine team outcomes.
- Replace vague phrases such as “prisidėjau” or “susidėliojome” with named
  decisions and actions.
- Quote technical mechanisms: feature flags, release-readiness rules, Agile
  Nexus, RBAC, permission hierarchy, schemas, whitelist/blacklist precedence.
- Do not claim measurable improvement until a metric or defensible qualitative
  before/after observation is provided.
- The final answer should be specific and direct, not promotional copy.

### Added 2026-08-16, after the audit

- **`[TBD]` is a valid answer. A plausible number in place of a `[TBD]` is not.**
  Nearly every invented fact in the v1.0 graph came from a blank looking
  unfinished while a filled-in cell looked professional. That instinct is
  backwards.
- **Never ship a template containing worked examples.** They get read as
  findings. This was the single most damaging shape in the v1.0 output.
- **Quotation marks mean somebody said it.** No illustrative quotes, ever.
- **Check the artefact against the document it claims to implement.** The v1.0
  graph contradicted this file and the sent letter on interview counts and on
  whether protected payment exists.
- The rules above are no longer only written here. They are enforced by
  `tools/validate-graph.mjs`, a blocking `PreToolUse` hook, and
  `.claude/skills/pre-publish-audit/SKILL.md` — because a rule that lives only
  in a document nobody re-reads at publication time is the rule that got broken.
