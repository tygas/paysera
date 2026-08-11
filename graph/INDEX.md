# Loop Graph Index: Paysera Classifieds 30-Day Pilot

This directory contains the complete loop graph specification for executing the 30-day Paysera Classifieds pilot (used electronics category).

## Quick Start

1. **Read first:** `README.md` — Overview of all loops, timeline, and workflow diagram
2. **Track progress:** `exit-conditions.json` — Update daily as you execute loops
3. **Execute in order:**
   - **Loop-A (parallel):** `loop-a-interviews.yaml` — Domain expert interviews
   - **Loop-B (parallel):** `loop-b-legal.yaml` — Legal & compliance bounds
   - **Loop-C (parallel):** `loop-c-photo-listing.yaml` — Photo-to-listing AI workflow
   - **Loop-D (parallel):** `loop-d-repeat-sellers.yaml` — Repeat seller recruitment
   - **Loop-E (sequential, after A–D):** `loop-e-synthesis.yaml` — Pilot brief synthesis

4. **Final deliverable:** `pilot-brief-template.md` — Template for the 30-day brief

## File Structure

```
graph/
├── INDEX.md (this file)
├── README.md (overview + diagrams)
├── exit-conditions.json (tracking + metrics)
├── loop-a-interviews.yaml (agents: find_contacts, schedule_calls, conduct_interviews, extract_insights)
├── loop-b-legal.yaml (agents: extract_compliance_docs, conduct_legal_consultation, map_to_pilot_scope)
├── loop-c-photo-listing.yaml (agents: collect_test_photos, run_photo_to_listing_ai, quality_check_outputs)
├── loop-d-repeat-sellers.yaml (agents: query_paysera_transactions, enrich_seller_profiles, recruit_pilot_cohort, analyze_cohort_profile)
├── loop-e-synthesis.yaml (agents: synthesize_all_outputs, create_persona, generate_workflow_checklist, draft_pilot_brief)
├── pilot-brief-template.md (final deliverable template)
└── [output folders — created during execution]
    ├── loop-a-interviews/output/
    ├── loop-b-legal/output/
    ├── loop-c-photo/output/
    ├── loop-d-sellers/output/
    └── loop-e-synthesis/output/
```

## Execution Model

### Parallel Phase (DAY 1–14): Loops A, B, C, D

All four loops run simultaneously. Each has independent agents, inputs, and outputs.

**Exit criteria per loop:**
- Loop-A: ≥15 interviews, ≥5 topics per interview
- Loop-B: ≥3 compliance categories, legal sign-off
- Loop-C: 10 photos tested, quality score ≥7/10
- Loop-D: 5 sellers confirmed with consent

**Dependencies:** None between loops. All 4 must complete by DAY 14.

### Sequential Phase (DAY 15–19): Loop-E

Loop-E depends on all 4 loops completing. It synthesizes their outputs into:
1. Unified context (persona + workflow validation)
2. Seller persona (detailed archetype)
3. Workflow checklist (seller-facing guide)
4. Pilot brief (for CEO presentation)

**Exit criteria:**
- Brief drafted and ready for internal review by DAY 18
- CEO presentation-ready by DAY 20

## Daily Tracking

Update `exit-conditions.json` with:
- Agent completion status
- Metric progress (e.g., "Loop-A: 8/15 interviews completed")
- Red flags (e.g., "Loop-B: legal meeting not yet scheduled")
- Escalation actions taken

Example daily update:
```json
"loop_a": {
  "status": "in_progress",
  "exit_conditions": {
    "interview_count": {
      "current": 8,
      "status": "on_track"
    }
  }
}
```

## Exit Condition Escalation

If a loop falls behind, refer to the `escalation` section in each YAML:

| Day | Trigger | Action |
|-----|---------|--------|
| **DAY 8** | Loop-A: <5 calls scheduled | Launch "parallel call 2" (alternative channels) |
| **DAY 10** | Loop-B: No legal response | Escalate to CEO |
| **DAY 12** | Any loop: Below "required" level | Start extending timeline or compressing Loop-E |
| **DAY 15** | Loop-E: No synthesis started | Skip some appendices, focus on core brief |
| **DAY 19** | Loop-E: Not ready for CEO | Present as "draft, internal feedback pending" |

## Outputs by Loop

### Loop-A Outputs
- `contacts.csv` — Contact list (15+ people)
- `call_schedule.json` — Confirmed interview dates/times
- `transcripts/` — Recordings + transcribed text
- `insights.json` — Extracted themes (platform, payment, logistics, trust)

### Loop-B Outputs
- `compliance_extracts.json` — GDPR, payment, items, fraud, liability rules
- `legal_consultation_notes.md` — Minutes from legal meetings
- `pilot_checklist.json` — 15+ rules with applicability
- `legal_sign_off.eml` — Email from legal@paysera approving scope

### Loop-C Outputs
- `photos/` — 10 test photos (indexed by device/condition)
- `photo_index.csv` — Metadata for each photo
- `ai_outputs.json` — Title, description, price_range per photo (3 prompt versions)
- `quality_report.md` — Quality scores + metrics
- `prompt_selection.json` — Winning prompt (v1/v2/v3) with rationale

### Loop-D Outputs
- `eligible_sellers.csv` — 50+ sellers meeting criteria
- `enriched_profiles.json` — 20 sellers with contact + behavior data
- `recruitment_log.json` — Outreach sequence + response tracking
- `cohort_profile.json` — 5 confirmed sellers + personas

### Loop-E Outputs
- `synthesis.json` — Unified context (all 4 loops merged)
- `persona.md` — Detailed seller persona
- `workflow_checklist.md` — Seller-facing guide
- `pilot_brief.md` → `pilot_brief.pdf` — Final brief for CEO

## How to Use This Graph

### For executing the pilot:
1. Open each loop's YAML file (loop-a-interviews.yaml, etc.)
2. Follow the agent prompts in order
3. Save outputs to the corresponding `/output/` folder
4. Update exit-conditions.json daily
5. Check escalation thresholds — act if triggered

### For integrating with future projects:
- Copy loop-e-synthesis.yaml to create reusable "synthesis" skill
- Adapt each loop's agents for different categories (auto, home goods, etc.)
- Maintain the 4+1 structure: parallel data gathering → synthesis

### For presenting to stakeholders:
1. Use `README.md` + diagram for 15-min overview
2. Use `pilot-brief-template.md` as final deliverable (filled in after Loop-E)
3. Reference specific loop outputs for deep dives (e.g., "interview themes" = Loop-A insights)

## Roles & Ownership

| Role | Responsibility | Loops |
|------|---|---|
| **You (Eimantas)** | Agentalization, prompt engineering, validation, CEO coordination | All loops |
| **Claude AI** | Agent execution (find_contacts, run_photo_to_listing, extract_insights, synthesis) | A, C, D, E |
| **Paysera team (Legal/Compliance)** | Legal consultation, sign-off | Loop-B |
| **Paysera team (Data/Analytics)** | Transaction queries, seller enrichment | Loop-D |
| **Sellers (5 pilot cohort)** | Interviews, testing, feedback | Loop-A, Loop-D, Loop-E |

## Success Indicators

**The pilot is on track if:**
- Loop-A: ≥12 interviews scheduled by DAY 7 ✅
- Loop-B: ≥1 legal meeting scheduled by DAY 5 ✅
- Loop-C: All 10 photos collected by DAY 5 ✅
- Loop-D: ≥3 sellers confirmed by DAY 10 ✅
- Loop-E: Brief drafted by DAY 17 ✅

**The pilot is in trouble if:**
- Loop-A: <8 interviews by DAY 12
- Loop-B: No legal sign-off by DAY 14
- Loop-C: Quality score <6/10 by DAY 14
- Loop-D: <4 sellers confirmed by DAY 14
- Loop-E: Brief not draft-ready by DAY 18

## Related Skills & Practices

Once this pilot completes, document as a reusable skill:
- **Skill name:** `paysera:user-research`
- **Purpose:** Conduct 15 user interviews + legal review + cohort recruitment in 14 days
- **Inputs:** Category, target seller type, interview count
- **Outputs:** Persona brief, legal checklist, seller cohort
- **Loop graph:** This directory

---

**Last updated:** 2026-08-11
**Status:** READY FOR EXECUTION
**Next checkpoint:** DAY 7 (Loop status review)
