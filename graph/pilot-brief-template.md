# PAYSERA CLASSIFIEDS: 30-DAY PILOT BRIEF
## Used Electronics Category (Phones, Laptops)

**Prepared by:** [Your name]
**Date:** [Today's date]
**Pilot Start:** [Target date]
**Pilot End:** [Target date + 30 days]
**Status:** DRAFT → INTERNAL REVIEW → CEO APPROVAL

---

## EXECUTIVE SUMMARY

Paysera Classifieds launches in the used electronics category (phones, laptops) with 5 pilot sellers over 30 days. 

**The opportunity:** Used electronics represents ~[X]k annual GMV in Lithuania with high fraud risk and trust friction. Paysera's existing platform (payment verification, identity confirmation) eliminates friction that plagues OLX and manual Facebook groups.

**The hook:** AI-powered listing creation (photo → description + price range) cuts seller time from 15–20 minutes to ~5 minutes while improving description quality. This solves the #1 pain point for repeat sellers.

**Why now:** 
- Paysera has 2M+ verified users with existing payment infrastructure
- EU regulations (PSD2, AML) demand identity verification — this is our moat
- AI vision + NLP are production-ready (Claude Vision + Haiku 4.5)

**Pilot success metrics:**
- 14-day sell-through rate ≥ 50% (vs. seller historical baseline)
- Listing creation time ≤ 5 minutes
- Seller NPS ≥ 7/10
- Zero disputes or chargebacks during pilot

**If successful:** Expand to auto category (DAY 30+), recruit 50 sellers, launch public beta (DAY 60+).

---

## I. MARKET & OPPORTUNITY

### 1.1 Category Overview

Used electronics (phones, laptops, tablets) is a ~€2B market in the EU. In Lithuania:
- High volume: Vinted (600k+ active users), OLX classifieds, Facebook Marketplace
- High friction: No identity verification, payment disputes common, scams frequent
- High trust gap: Buyers fear counterfeits, sellers fear chargebacks

**Paysera's position:** 2M+ verified users, existing payment rails, identity infrastructure.

### 1.2 Seller Pain Points (from research)

Based on 15 interviews with repeat sellers (phones + laptops, last 90 days):

1. **Payment trust (Theme severity: HIGH, 12/15 mentions)**
   - "I'm worried the buyer will say the item wasn't as described, then get a chargeback"
   - "If I ship first, what guarantees do I have the buyer will pay?"
   - **Mitigation:** Paysera escrow + protected payment (7-day hold)

2. **Time friction (Theme severity: HIGH, 14/15 mentions)**
   - "Creating a listing takes 15–20 minutes: photos, description, pricing, research"
   - "I just want to upload a photo and sell — that's it"
   - **Mitigation:** AI photo-to-listing (reduces to ~5 min)

3. **Description quality (Theme severity: MEDIUM, 10/15 mentions)**
   - "I describe the condition poorly, buyers ask 50 questions I already answered"
   - "Professional listings get more inquiries, but I don't have time"
   - **Mitigation:** AI generates professional descriptions from photos

4. **Pricing uncertainty (Theme severity: MEDIUM, 8/15 mentions)**
   - "Is 200 EUR fair for an iPhone 12? I check eBay / Vinted, but prices vary wildly"
   - **Mitigation:** AI recommends price range based on model + condition

### 1.3 Paysera's Advantage Over Competitors

| Dimension | OLX | Facebook | Vinted | **Paysera** |
|-----------|-----|----------|--------|-----------|
| Identity verification | Limited | None | ID required | ✅ GDPR-compliant |
| Protected payment | None | Limited | Built-in | ✅ 7-day escrow |
| Dispute resolution | Slow | Manual | Fast | ✅ Legal SLA |
| Seller onboarding | Manual | Social | Simple | ✅ AI-assisted listing |
| Buyer trust | Low | Very low | High | ✅ Paysera verification |

---

## II. PILOT DESIGN

### 2.1 Pilot Cohort: 5 Repeat Sellers

**Selection criteria:**
- ≥ 2 transactions in last 90 days (proven active)
- 0 disputes, 0 chargebacks (clean history)
- Avg transaction value ≥ 100 EUR (serious sellers)
- Willing to participate in 30-day concierge pilot

**Cohort composition:**

| Seller | Type | Freq | Avg Value | Primary Category | History | Motivation |
|--------|------|------|-----------|------------------|---------|-----------|
| [Name 1] | Casual upgrader | 4/month | 220 EUR | Phones | 6 sales, 0 disputes | Time savings |
| [Name 2] | Professional reseller | 8/month | 280 EUR | Phones (60%), Laptops (40%) | 18 sales, 0 disputes | Volume + margins |
| [Name 3] | Casual upgrader | 3/month | 150 EUR | Phones | 5 sales, 0 disputes | Easier selling |
| [Name 4] | Casual upgrader | 2/month | 350 EUR | Laptops | 4 sales, 0 disputes | Better pricing |
| [Name 5] | Part-time | 5/month | 210 EUR | Mixed electronics | 10 sales, 0 disputes | Description help |

**Risk assessment:** LOW. All 5 sellers have clean transaction history. No AML flags, no rapid velocity anomalies.

### 2.2 Feature Set for Pilot

#### Feature 1: Photo-to-Listing AI
- Seller uploads 3–5 photos of used device
- Claude Vision recognizes model, storage, color, condition
- Claude Haiku generates title (≤100 chars), description (50–150 words), price range
- Seller edits before publishing (or accepts as-is)
- **Quality bar:** v2 prompt achieves 7.5/10 accuracy (title + specs correct 75% of time)

#### Feature 2: Protected Payment + Escrow
- Buyer pays into Paysera
- Payment held for 7 days (standard escrow period)
- Buyer confirms receipt + condition matches (or disputes)
- On day 7: payment released to seller OR escalates to legal team
- **Safety:** Paysera covers <500 EUR disputes; >500 EUR escalates to legal@paysera

#### Feature 3: Identity Verification
- Seller: Verified via Paysera existing flow (email + phone OR national ID)
- Buyer: Same verification
- Platform displays verification badge (trust signal)

#### Feature 4: Dispute Resolution
- Buyer initiates dispute via in-app form (condition, missing parts, damage)
- Platform escalates to legal@paysera within 24h
- Legal reviews photos + buyer claim + seller response
- Decision within 5 business days (refund buyer OR dismiss claim)

### 2.3 Timeline

| Week | Phase | Deliverables | Owner |
|------|-------|--------------|-------|
| **1** | Onboarding | Seller training videos, FAQ, first listing | You + sellers |
| **2–4** | Live selling | Sellers list items, track metrics, collect feedback | Sellers (ad-hoc support) |
| **4** | Analysis | Metrics review, seller interviews, success/fail decision | You |

**Daily sync recommended:** 15-min standup with CTO to track cohort progress.

---

## III. SUCCESS CRITERIA

### 3.1 Quantitative Metrics

| Metric | Critical | Target | Nice-to-have | How to measure |
|--------|----------|--------|-------------|-----------------|
| **14-day sell-through rate** | ≥ 40% | ≥ 50% | ≥ 60% | (sold in 14d) / (total active listings) |
| **Listing creation time** | ≤ 10 min | ≤ 5 min | ≤ 3 min | Time from first photo to publish |
| **AI description quality** | ≥ 6/10 | ≥ 7/10 | ≥ 8/10 | Human review (title + specs + clarity) |
| **Zero disputes** | Critical | All 5 sellers | N/A | Dispute count = 0 during pilot |
| **Participation rate** | ≥ 60% | 100% | N/A | (sellers listing ≥3 items) / 5 |

### 3.2 Qualitative Metrics

| Metric | How to measure | Success threshold |
|--------|-----------------|-------------------|
| **Seller NPS** | Post-pilot survey: "Likelihood to recommend? (0–10)" | ≥ 7/10 average |
| **Payment trust** | "I trust Paysera escrow to protect me" (1–5 scale) | ≥ 4/5 average |
| **Feature adoption** | "AI description was helpful" (1–5 scale) | ≥ 4/5 average |
| **Support burden** | Tickets per seller during pilot | ≤ 2 per seller (goal: <1) |

### 3.3 Failure Modes

| Failure Mode | Trigger | Response |
|--------------|---------|----------|
| **Low sell-through (<40%)** | Day 21+ sell-through < 40% | Diagnose: pricing? description? platform visibility? |
| **Disputes** | Any dispute raised by buyer | Escalate to legal immediately; diagnose root cause |
| **Low NPS (<5/10)** | Post-pilot: NPS < 5 | Collect feedback; identify UX friction |
| **Seller churn** | < 3 of 5 complete ≥3 listings | Extend pilot timeline OR declare "product-market fit not yet achieved" |

---

## IV. LEGAL & COMPLIANCE

✅ **Approved by:** [Legal team name], [email], [date]

### 4.1 Constraints & Safeguards

**Transaction limits:**
- Max transaction size per listing: 1,500 EUR (AML threshold)
- Max 10 transactions per seller per day (velocity check)

**Prohibited items:**
- Stolen goods (IMEI blacklist if available)
- Counterfeit goods (manual review for high-value items)
- Regulated electronics (hazmat, radiological)
- Items requiring licenses (professional equipment)

**Identity verification:**
- Seller: Email + phone verified (minimum)
- Buyer: Same
- Repeat seller: Expedited flow (already verified)

**Dispute escalation:**
- Buyer → Support (in-app form)
- Support → Legal (within 24h, if claim ≥ 100 EUR OR fraud suspected)
- Legal decision within 5 business days

**Compliance with GDPR:**
- Photos + messages stored for 30 days post-transaction (audit trail)
- Personal data deleted on request (GDPR right to erasure)
- No third-party sharing without explicit consent

### 4.2 Insurance & Liability

- Paysera covers transactions < 500 EUR (chargeback risk)
- Transactions 500–1,500 EUR: shared liability (seller responsible for item authenticity)
- Disputes > 1,500 EUR: escalate to legal (rare in electronics category)

---

## V. ROADMAP: DAY 30 → FULL LAUNCH

### 5.1 If Pilot Succeeds (all 4 metrics hit "Target")

**DAY 30–40:** Preparation
- Expand seller cohort: 5 → 50 (recruit next wave)
- Optimize AI prompt: v2 → v3 (iterate on feedback)
- Add buyer-side features: offers, bulk messaging, saved listings

**DAY 40–60:** Soft launch
- Open to all 50 sellers, monitored closely
- In-app promotion: "Beta: Paysera Classifieds"
- Collect metrics + feedback for auto category expansion

**DAY 60+:** Public launch
- Expand to auto category (same workflow, higher prices)
- Open to all Paysera users
- Plan: Classifieds becomes 10% of Paysera GMV within 12 months

### 5.2 If Pilot Has Issues (1 metric misses "Target")

**Diagnose:** Which metric failed?

| Metric | Root cause (hypothesis) | Iteration |
|--------|---|---|
| Sell-through < 50% | Pricing too high OR description poor | Adjust AI prompt; lower prices by 10%; increase buyer visibility |
| NPS < 7 | UX friction OR payment trust | Simplify onboarding; emphasize escrow in marketing |
| Disputes raised | Buyer expectations misaligned | Better description checklist; buyer education |
| Quality < 7/10 | AI hallucinations OR corner cases | Refine prompt; add manual review layer |

**Response:** Pick ONE high-impact iteration, re-run with same 5 sellers (DAY 35–45), re-measure (DAY 45).

**If re-run succeeds:** Proceed with expansion.
**If re-run fails:** Pause classifieds, diagnose deeper (product-market fit issue?), pivot.

---

## VI. APPENDICES

### Appendix A: Seller Persona

**Name:** Repeat Seller (Electronics)

**Demographics:**
- Age: 28–45
- Location: Urban Lithuania (Vilnius, Kaunas)
- Tech comfort: Intermediate (uses Paysera, but not power user)
- Seller type: Casual upgrader or part-time reseller

**Selling behavior:**
- Frequency: 3–8 items/month
- Categories: Phones 60%, Laptops 30%, Tablets 10%
- Avg item value: 150–350 EUR
- Listing time (current): 15–20 min per item

**Pain points:**
1. Time-consuming listing process
2. Uncertainty about pricing
3. Fear of payment fraud / chargebacks
4. Difficulty writing compelling descriptions

**Trust triggers:**
- Paysera's existing reputation (already use for buying)
- Verified buyer/seller badges
- Protected payment + escrow
- Legal dispute resolution

**Objections:**
- "Will AI descriptions match my style?"
- "What if the price recommendation is too low?"
- "How do I handle disputes?"

**Success drivers:**
- Saves 10+ min per listing (convenience)
- Better descriptions → more inquiries (quality)
- Peace of mind (payment protection)

---

### Appendix B: Workflow Checklist (Seller-Facing)

**Title:** How to List Your Item on Paysera Classifieds

#### Step 1: Prepare Your Item
- [ ] Clean the device
- [ ] Gather specs (brand, model, storage, color, year)
- [ ] Assess condition: Mint / Good / Fair / Poor
- [ ] Check for: cracks, dents, scratches, missing parts

#### Step 2: Take Photos
- [ ] 3–5 clear photos (natural lighting)
- [ ] Include: Front, back, sides (show condition)
- [ ] Avoid: shadows, cluttered backgrounds
- [ ] Include: Box / charger (if available)

#### Step 3: Upload & Auto-Generate
- [ ] Click "Sell item" → Select category (phone / laptop)
- [ ] Upload photos
- [ ] Review AI-generated title + description
- [ ] (Optional) Edit title or description

#### Step 4: Set Price
- [ ] Check AI price recommendation
- [ ] Adjust if needed (market comparables)
- [ ] Publish

#### Step 5: Legal & Safety
- [ ] Confirm: Item is not stolen
- [ ] Confirm: Item is not counterfeit
- [ ] Confirm: Item matches description
- [ ] Acknowledge: Paysera buyer protection + escrow

#### Step 6: Publish & Monitor
- [ ] Click "Publish"
- [ ] Share on Facebook / friends (optional)
- [ ] Monitor inquiries in-app

#### FAQ
- **Q: Can I edit after publishing?** A: Yes, via "Edit" button.
- **Q: What if the description is wrong?** A: Customize before publishing.
- **Q: What if no buyer after 14 days?** A: Relist for free or adjust price.
- **Q: What happens if I sell?** A: Buyer pays into escrow; you ship; buyer confirms receipt; payment released.

---

### Appendix C: Legal Checklist (from Loop-B)

**Pilot Guardrails:**
1. Transaction max: 1,500 EUR (AML compliance)
2. Prohibited items: Stolen goods, counterfeits, hazmat
3. Seller verification: Email + phone (minimum)
4. Dispute SLA: 5 business days (legal decision)
5. Data retention: 30 days post-transaction
6. Chargeback cover: < 500 EUR (Paysera); > 500 EUR (escalate)

---

### Appendix D: Interview Insights Summary (from Loop-A)

**Theme 1: Payment Trust (12/15 mentions, CRITICAL)**
- Key quote: "I'm afraid the buyer will claim the item is damaged, then I lose the money."
- Mitigation: 7-day escrow + Paysera dispute resolution
- Product implication: Emphasize escrow in seller onboarding

**Theme 2: Time Friction (14/15 mentions, CRITICAL)**
- Key quote: "Creating a listing takes forever. I just want to upload a photo and sell."
- Mitigation: AI photo-to-listing (5 min vs. 15–20 min)
- Product implication: AI description must work out-of-box for 70%+ of listings

**Theme 3: Description Quality (10/15 mentions, HIGH)**
- Key quote: "Professional listings get 2x inquiries, but I don't have time."
- Mitigation: AI generates professional descriptions
- Product implication: Quality bar for AI output is high (7/10 minimum)

**Theme 4: Pricing Uncertainty (8/15 mentions, MEDIUM)**
- Key quote: "eBay prices are 50 EUR cheaper than Facebook. How do I know fair price?"
- Mitigation: AI price recommendations based on model + condition
- Product implication: Price range must be ±15% of market, not wide guesses

---

### Appendix E: AI Quality Report (from Loop-C)

**Tested:** 10 photos (phones, laptops, tablets)
**Prompt versions:** 3 (v1: baseline, v2: marketplace-optimized, v3: seller-focused)

**Results:**

| Dimension | v1 | v2 | v3 | Winner |
|-----------|----|----|----|----|
| **Title accuracy** | 70% | 75% | 73% | v2 |
| **Description clarity** (Flesch score) | 55 | 62 | 58 | v2 |
| **Price realism** (±% deviation) | ±18% | ±12% | ±15% | v2 |
| **Condition detection** | 70% | 80% | 75% | v2 |
| **Overall quality** | 6.5/10 | 7.5/10 | 7/10 | **v2** |

**Recommendation:** Use v2 prompt for pilot. Monitor edge cases (damaged devices, counterfeit detection).

---

### Appendix F: Cohort Profile (from Loop-D)

**Recruitment:** 20 eligible sellers contacted → 5 confirmed

**Cohort characteristics:**
- Avg age: 36
- Geographic spread: 3 from Vilnius, 1 Kaunas, 1 Klaipėda
- Avg monthly volume: 4.4 items/month
- Avg item value: 232 EUR
- Clean history: 0 disputes, 0 chargebacks (across 43 total transactions)
- Primary category: Phones (64%)
- NPS (pre-pilot, recruitment call): 7.8/10

**Seller personas:**
1. **"Casual upgrader"** (3 sellers) — sell their own used phones/laptops, 2–4/month
2. **"Part-time reseller"** (1 seller) — buy + resell, 5–8/month, higher volume
3. **"Professional reseller"** (1 seller) — dedicated business, 8+/month, bulk buyer

---

## VII. NEXT STEPS

**Internal approval (DAY 20):**
- [ ] CTO reviews brief (technical feasibility)
- [ ] Legal reviews constraints (compliance)
- [ ] Marketing reviews go-to-market (messaging)

**CEO presentation (DAY 20–21):**
- [ ] Present brief (10 min overview)
- [ ] Answer questions (10 min)
- [ ] Seek go/no-go decision

**If approved (DAY 22–30):**
- [ ] Seller onboarding (3–5 days)
- [ ] Platform integration testing (2–3 days)
- [ ] Soft launch (internal staff testing) (1–2 days)
- [ ] Go live with 5 sellers (DAY 30)

---

## Approval Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Prepared by | [Your name] | [Date] | |
| Legal review | [Legal lead] | [Date] | |
| CTO review | [CTO name] | [Date] | |
| CEO approval | Kostas Noreika | [Date] | |

---

**Document version:** 1.0 (DRAFT)
**Last updated:** [Today]
**Next review:** [Date + 7 days]
