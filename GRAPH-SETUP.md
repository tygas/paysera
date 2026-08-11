# Loop Graph Setup Complete

**Date:** 2026-08-11  
**Branch:** `loop` (pushed to GitHub)  
**Status:** ✅ Ready for execution

## What Was Created

A complete **loop graph** system for your 30-day Paysera Classifieds pilot.

**Quick overview:**
```
DAY 1–14: Four parallel loops (A, B, C, D)
  ├─ Loop-A: Interview 15 domain experts (pokalbiai)
  ├─ Loop-B: Get legal bounds from Paysera compliance
  ├─ Loop-C: Test photo-to-listing AI on 10 photos
  └─ Loop-D: Recruit 5 pilot sellers from your transaction data

DAY 15–19: Sequential synthesis (Loop-E)
  └─ Merge all 4 → Create pilot brief for CEO

DAY 20: CEO presentation (go/no-go decision)
```

## Files in `/graph`

| File | Purpose |
|------|---------|
| `INDEX.md` | **START HERE** — Quick reference + execution guide |
| `README.md` | Workflow diagram + timeline + overview |
| `exit-conditions.json` | **Update daily** — Metrics + escalation thresholds |
| `loop-a-interviews.yaml` | 4 agents: find_contacts → schedule → conduct → extract_insights |
| `loop-b-legal.yaml` | 3 agents: extract docs → legal meeting → map to scope |
| `loop-c-photo-listing.yaml` | 3 agents: collect photos → run AI → quality check |
| `loop-d-repeat-sellers.yaml` | 4 agents: query transactions → enrich → recruit → analyze |
| `loop-e-synthesis.yaml` | 4 agents: synthesize → persona → checklist → brief |
| `pilot-brief-template.md` | Template for final 30-day brief (fill in after Loop-E) |

## How to Execute

### Week 1 (DAY 1–7): Launch all 4 loops
1. Read `graph/INDEX.md` (5 min)
2. Open each YAML file (loop-a-interviews.yaml, etc.)
3. Follow agent prompts in order
4. Save outputs to `/graph/[loop]/output/`
5. Update `exit-conditions.json` daily

### Week 2 (DAY 8–14): Continue all 4 loops
- Check daily: are you on track for "required" level?
- If behind, escalation paths in each YAML tell you what to do
- By DAY 14, all 4 loops must be COMPLETE

### Week 3 (DAY 15–19): Loop-E synthesis
- Merge outputs from A, B, C, D
- Create seller persona + workflow checklist
- Draft pilot brief

### Week 4 (DAY 20): CEO presentation
- Present brief to Kostas
- Decision: go/no-go for pilot launch

## Daily Tracking

Update `exit-conditions.json` with:
```json
{
  "loop_a": {
    "status": "in_progress",
    "exit_conditions": {
      "interview_count": {
        "current": 8,
        "required": 15,
        "status": "on_track"
      }
    }
  }
}
```

## Critical Dates

- **DAY 5:** First legal meeting, all test photos
- **DAY 10:** ≥8 interviews, legal response
- **DAY 12:** Review all loops (warning threshold)
- **DAY 14:** All A, B, C, D COMPLETE
- **DAY 17:** Loop-E draft ready
- **DAY 20:** CEO presentation

## Escalation Triggers

| Day | Trigger | Action |
|-----|---------|--------|
| **DAY 8** | Loop-A: <5 calls | Launch parallel channel |
| **DAY 10** | Loop-B: No legal | Escalate to CEO |
| **DAY 11** | Loop-A: <8 done | Offer 2x incentive |
| **DAY 12** | Any loop: behind | Start extending timeline |
| **DAY 15** | Loop-E: not started | Skip appendices, focus brief |

## Why Loop Graph Works

1. **Parallel execution:** All 4 loops run simultaneously (fast)
2. **Clear success criteria:** Not "when you feel like it" — specific metrics
3. **Daily tracking:** Know immediately if you're off track
4. **Escalation paths:** Documented responses to each failure mode
5. **Synthesis last:** All insights feed into ONE coherent brief

## What Happens After Pilot?

If pilot succeeds → This loop graph becomes a **reusable skill:**
```
/paysera:user-research kategoriја=auto kontaktai=15 dienos=14
```

Same workflow for auto, furniture, job listings, etc. Just change parameters.

## Questions?

Refer to the specific loop's YAML:
- **"How do I find interviews?"** → `loop-a-interviews.yaml`, agent `find_contacts`
- **"What are legal constraints?"** → `loop-b-legal.yaml`, agent `map_to_pilot_scope`
- **"How do I test the AI?"** → `loop-c-photo-listing.yaml`, agent `run_photo_to_listing_ai`
- **"How do I recruit sellers?"** → `loop-d-repeat-sellers.yaml`, agent `recruit_pilot_cohort`
- **"How do I synthesize?"** → `loop-e-synthesis.yaml`, agent `synthesize_all_outputs`

---

**Next step:** Open `/graph/INDEX.md` and start with Loop-A.

Good luck! 🚀
