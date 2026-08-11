# Loop Graph: 30-Day Paysera Classifieds Pilot

**Tikslas:** Pasiruošti concierge pilotą „naudota elektronika" kategorijai (telefonimai + nešiojamieji kompiuteriai) per 30 dienų.

**Metodas:** Keturis independent loop'us (A, B, C, D) vykdyti parallelliai, o susidurti jų rezultatus į Loop-E (sintezė).

---

## Workflow diagrama

```
     DAY 1–30: PAYSERA CLASSIFIEDS 30-DAY PILOT SETUP
     
     ┌────────────────────────────────────────────────────────────────┐
     │                       START: Pilot Brief                        │
     │  (kategorija=naudota_elektronika, tikslas=14d sell-through)   │
     └────────────────────┬───────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬───────────────┐
          │               │               │               │
      ┌───▼────┐      ┌──▼────┐      ┌──▼────┐      ┌──▼────┐
      │ Loop-A │      │Loop-B │      │Loop-C │      │Loop-D │
      └────────┘      └───────┘      └───────┘      └───────┘
      POKALBIAI      LEGAL BOUNDS    FOTO→LISTING   PARDAVĖJŲ
      (15 žmonės)    (3–5 ribos)     WORKFLOW       PATTERN
      
      Šaltinis:      Šaltinis:      Šaltinis:      Šaltinis:
      • LinkedIn     • Paysera      • 10 test     • Paysera
      • Forume       • GDPR         • AI photo    • transakcijų
      • TikTok       • Compliance   • NLP aprašo  • duomenys
      
      Paralelinis darbas — 14 dienų
                          │
           ┌──────────────┼──────────────┐
           │              │              │
       ┌───▼─────────────▼───────────────▼────────┐
       │        Loop-E: SYNTHESIS                  │
       │  (visos 4 output'ų → persona + checklist)│
       └───┬──────────────────────────────────────┘
           │
       ┌───▼─────────────────────────────┐
       │  ARTEFAKTAS: 30-Day Brief       │
       │  • Persona (ideali pardavėja)   │
       │  • Legal guardrails             │
       │  • Photo-to-listing process     │
       │  • First cohort (5 sellers)     │
       └────────────────────────────────┘
```

---

## Detaliaus: Kiekvieno loop'o vardai, agentai ir exit conditions

### Loop-A: Domain Expert Interviews (Pokalbiai)

**Tikslas:** Suprasti pardavėjo/pirkėjo kelią ir jo problemas realiame kontekste.

**Agentai:**
1. `find_contacts(platform=[LinkedIn, Facebook, Foruma.lt, TikTok], category=elektronika_naudota, last_30_days=True, min_contact=15)`
2. `schedule_call(kontaktai, įrašymas=True, trukmė=45_min)`
3. `extract_insights(call_transcript, templates=[derybos, mokėjimas, pristatymas, pasitikėjimas])`

**Paralelinis vykdymas:**
- Diena 1–3: Surink kontaktus (n=15, pagal targetą)
- Diena 4–10: Skambini (kiekvienas pokalbis ≥24h arba paprasyk raštu)
- Diena 11–14: Iš transcript'ų ekstrahavai insight'us

**Exit conditions (kada Loop-A yra COMPLETE):**

| Sąlyga | Kritinis (BLOCK) | Būtina | Pageidautina |
|--------|-----------------|--------|-------------|
| **Pokalbių skaičius** | n ≥ 12 | n ≥ 15 | n ≥ 20 |
| **Pokalbio trukmė** | ≥ 30 min | ≥ 45 min | ≥ 60 min |
| **Duomenys** | ≥ 4 temos (derybos, mokėjimas, pristatymas, pasitikėjimas) | ≥ 5 temos | ≥ 6 |
| **Kodavimas** | Kiekvienas pokalbis — markdown'e, tema po temoje | Indexed + searchable | Video clips + highlights |
| **Vėlavimas** | Nuo "dienos 15" brandi = FAIL Loop-A | Nuo "dienos 12" — warning | Ideal: DAY 10 |

**Loop-A iteracija, jei nepavyko:**
- Jei n < 12: Rask daugiau kontaktų, skambini iš naujo
- Jei < 4 temos: Perskaityk pokalbio clips'us, ieško praleistų insight'ų
- Jei vėluoja > 3 dienos: Parallel Call 2 (žaidingas su šalies forume dirbantiems)

---

### Loop-B: Legal & Compliance Bounds (Teisiniai ribai)

**Tikslas:** Apibrėžti, ką Paysera gali / negali pasiūlyti pilotui (duomenys, ginčai, draudžiamos prekės).

**Agentai:**
1. `extract_from_paysera_docs(duomenų_apsauga=GDPR, klientų_data=PII, ginčai=dispute_policy)`
2. `compliance_check(classifieds_model, fraud_scenarios, payment_hold_logic)`
3. `map_to_scope(pilot_kategorija=elektronika, scope_out=[daiktai_kurie_reikalingi_asmens_egz, greitos_prekės])`

**Paralelinis vykdymas:**
- Diena 1–5: Iš Paysera interiorinių dokumentų skaityti GDPR, dispute policy
- Diena 6–10: Compliance'o tiesiniu pokalbiai (legal@paysera)
- Diena 11–14: Užrašai ir checklist

**Exit conditions:**

| Sąlyga | Kritinis | Būtina | Pageidautina |
|--------|----------|--------|-------------|
| **Teisinės ribos** | ≥ 3 ribos identifikuotos + patvirtintos | ≥ 4 ribos | ≥ 5 ribos dokumentuotos |
| **Ginčų politika** | Apibrėžta, kas yra dispute, kiek laiko | + eskalacijos žingsniai | + SLA laikai |
| **Draudžiami daiktai** | PO/Legal turi žinoti bent 5 kategorijas | Bent 10 kategorijų | Išsami elektronikos checklist |
| **Patvirtinimas** | Legal/Compliance pasirašo brief'ą | Pasirašo + timestamp | Pasirašo + comments process |
| **Vėlavimas** | Nuo DAY 12 = FAIL Loop-B | DAY 14 warning | Ideal: DAY 10 |

---

### Loop-C: Photo-to-Listing Workflow (Nuotraukos → Skelbimas)

**Tikslas:** Testuoti AI workflow: nuo telefono nuotraukos → struktūruoto aprašymo + kainos intervalo.

**Agentai:**
1. `collect_test_photos(n=10, elektronika=naudota, quality=[blurry, clear, multiple_angles])`
2. `run_photo_to_listing_ai(images, output_schema=[title, description, price_range, condition])`
3. `quality_check(output, templates=[photo_recognition_accuracy, description_clarity, price_reasonableness])`

**Paralelinis vykdymas:**
- Diena 1–3: Surink 10 test'o nuotraukų (iš Paysera archyvo arba demo)
- Diena 4–8: AI apibūdinami kiekvieną nuotraką, testai + prompt refinement
- Diena 9–12: Žiūrėk galutinius aprašymus + kainų intervalo pasiūlymus
- Diena 13–14: Dokumentuoji, kas veikė, kas ne

**Exit conditions:**

| Sąlyga | Kritinis | Būtina | Pageidautina |
|--------|----------|--------|-------------|
| **Nuotraukos** | n ≥ 8 | n = 10 | n ≥ 12 (su outlier'iais) |
| **AI recognition** | Bent 8/10 modelis teisingai atpažintas | 9/10+ | 10/10 |
| **Aprašymo kokybė** | Nėra gramatinių klaidų | Lakoniškas + per informacijas | Skaitomas, persuasyvus |
| **Kainos intervalo** | ±20% nuo market rate | ±15% | ±10% arba < 5 EUR skirtumas |
| **Prompt versija** | v1.0 dokumentuota (kokia frazė veikė?) | v1.1 optimizuota | v1.2 A/B tested |
| **Vėlavimas** | Nuo DAY 15 = warning | DAY 17 red flag | Ideal: DAY 12 |

---

### Loop-D: Repeat Seller Pattern (Kartojantys pardavėjai)

**Tikslas:** Identifikuoti ir surinkti 5 jau pardavusio žmogaus duomenis — jie yra pirmaasistripe cohort.

**Agentai:**
1. `query_paysera_transactions(last_90_days, kategoriją=elektronika, repeat_sellers=True)`
2. `filter_repeat_sellers(min_transactions=2, avg_price=acceptable, disputes=0 or minimal)`
3. `enrich_profile(seller_id, tapatybės_duomenys, komunikacijos_kanalas, prefs)`

**Paralelinis vykdymas:**
- Diena 3–7: Iš Paysera duomenų bazės query'ti repeat seller'ius (jei jie sutiko komunikuoti)
- Diena 8–12: Enrichment + first contact (email/in-app message)
- Diena 13–14: Dokumentuok pirmus 5 + backup 3

**Exit conditions:**

| Sąlyga | Kritinis | Būtina | Pageidautina |
|--------|----------|--------|-------------|
| **Cohort dydis** | n ≥ 4 pardavėjai | n = 5 | n ≥ 7 (su reserve'ais) |
| **Pokalbis iniciuotas** | ≥ 4 atsakė "taip" | = 5 atsakė | Visi susitikę async call |
| **Profilo duomenys** | Vardas, email, last_tx_date | + phone, location | + naudoto profilio linkas + naudoto atgra history |
| **Pirmas message** | Pristatytas piloto tikslas | + explicit consent | + incentive/reward offer |
| **Vėlavimas** | Nuo DAY 16 = warning | DAY 18 = BLOCK Loop-D | Ideal: DAY 12 |

---

### Loop-E: Synthesis (Sintezė)

**Tikslas:** Iš A + B + C + D rezultatų sukurti vieną, koherentišką **30-Day Pilot Brief**.

**Agentas (vienas):**
1. `synthesize_all_outputs(Loop_A_insights, Loop_B_bounds, Loop_C_workflow, Loop_D_cohort)`
2. `create_persona(iš Loop_A pokalbių → ideali pardavėja profilis)`
3. `generate_checklist(iš Loop_C → workflow checklist pardavėjui)`
4. `draft_pilot_brief(viskas → 1 dokumentas, ready to present to CEO)`

**Vykdymas (Sequential — tik po A, B, C, D completion):**
- Diena 15–16: Sintezė ir persona sukūrimas
- Diena 17–18: Brief redakcija, CTO + Legal review
- Diena 19: Pasiūlymas CEO/Kostas

**Exit conditions:**

| Sąlyga | Kritinis | Būtina | Pageidautina |
|--------|----------|--------|-------------|
| **Persona** | Iš ≥12 pokalbių syntezuota, nesuabstrakta | Nubrėžtas pilnas archetype | + video persona mock |
| **Legal checklist** | Iš Loop-B → pardavėjo checklist | Patvirtintas Legal | + customer-facing format |
| **Workflow** | Iš Loop-C → step-by-step UI flow | Validuotas 5 sellers | + edge cases documented |
| **Cohort** | Loop-D → 5 sellers, jų profiliai brief'e | + contact plan | + incentive structure |
| **Dokumento kokybė** | Grammatika, logika, links'ai | Primenantas PRD, ne brainstorm | Galima pateikti boardui |
| **Vėlavimas** | DAY 20 = FAIL Loop-E | DAY 19 red flag | Ideal: DAY 18 |

---

## Timeline summary

```
SAVAITĖ 1 (DAY 1–7)
├─ Loop-A: Kontaktų surinkimas (3 dienos) → Pirmi pokalbiai (4 dienos)
├─ Loop-B: Dokumentų skaitymas (5 dienų)
├─ Loop-C: Test nuotraukų surinkimas (3 dienos)
└─ Loop-D: Query repeat sellers (5 dienos)

SAVAITĖ 2 (DAY 8–14)
├─ Loop-A: Pokalbiai tęsiasi (14–30 min call backlog)
├─ Loop-B: Compliance'o pokalbiai (2–3 dienos)
├─ Loop-C: AI testing + prompt refinement (5 dienų)
├─ Loop-D: Enrichment + first contact (5 dienų)
└─ DEADLINE: DAY 14, visi 4 loop'ai = COMPLETE

SAVAITĖ 3 (DAY 15–21)
├─ Loop-E: Synthesis (3 dienos)
├─ Internal review (2 dienos)
└─ CEO presentation (1 diena)

SAVAITĖ 4 (DAY 22–30)
├─ Feedback iterations (5–7 dienų)
├─ Pilot launch prep (2–3 dienos)
└─ CONCIERGE PILOT START
```

---

## Failų struktūra `/graph` aplanke

```
graph/
├─ README.md (šis failas — diagramos ir timeline)
├─ loop-a-interviews.yaml
├─ loop-b-legal.yaml
├─ loop-c-photo-listing.yaml
├─ loop-d-repeat-sellers.yaml
├─ loop-e-synthesis.yaml
├─ pilot-brief-template.md
└─ exit-conditions.json (structured, parsable)
```

---

## Kito žingsnio nuorodose

1. Norėdami paleisti **Loop-A**, skaitykite `loop-a-interviews.yaml`
2. Norėdami sekti progress, atnaujinti `exit-conditions.json` kasdien
3. Norėdami pamatyti galutinio brief'o šabloni, žiūrėkite `pilot-brief-template.md`

