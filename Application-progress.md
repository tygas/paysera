# Paysera Tech builder-PO application — progress checkpoint

Updated: 2026-08-07

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

## US Bank — confirmed facts

- Role: Senior Frontend Engineer.
- Product context: a banking merchant system.
- Responsibility included building the merchant system.
- Represented the team in Agile Nexus meetings concerning strategic and
  architectural decisions.
- Worked with a strong Product Owner and adopted two explicit practices from
  that collaboration: strategic thinking and attention to detail.

### Release-process case

Initial situation:

- A release combined work from five teams/repositories.
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

Not yet confirmed:

- Employment dates and duration.
- Exact frontend stack and CI/CD tooling.
- Whether the five teams used five separate repositories or five contributing
  codebases; the current wording should not overstate this distinction.
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

- AI-plan start dates were requested more than once but not supplied.
- ChatGPT Pro and OpenCode/API exact monthly spend was not supplied.
- Remote-work preference was not explicitly restated, although the role itself
  permits remote work.
- Exact employment dates and team sizes for US Bank/Scale Tech remain unknown.
- Quantitative delivery/business outcomes remain unknown.

## Remaining application questions

The following facts are still required before drafting the final answer:

1. AI subscriptions and tools: confirmed tools are Claude Code
   Business/Premium (€90 stated by candidate), ChatGPT Pro, and OpenCode Zen
   plus usage-based API access for trying new models or routing simple tasks to
   cheaper models. Confirmed usage: Claude Code for coding and architecture;
   GPT with OMX for code reviews and market analysis; OpenCode for evaluating
   new models and building API-based experiments, including horoscope apps.
   Still needed: exact billing period/currency for ChatGPT/OpenCode and start
   dates. Do not imply that other popular
   engineering tools are personally used; list them separately only as
   ecosystem awareness if useful and current evidence is verified.
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
   unless an employment-contract alternative is later confirmed. Remote-work
   preference was asked but not explicitly answered.

## Resume point

Continue with this exact question:

> List every AI plan/tool you currently pay for or actively use. For each give:
> exact plan name, monthly price, when you started using it, and what you use it
> for in practice. Include Claude Code, Codex CLI, Gemini, ChatGPT, local models,
> n8n, or others only if you genuinely use them.

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
