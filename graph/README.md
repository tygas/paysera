# Loop Graph — Paysera Classifieds concierge pilot

**Tikslas:** per 30 parengiamųjų dienų pasiruošti concierge pilotui naudotos
elektronikos kategorijoje (telefonai ir nešiojamieji kompiuteriai) LT rinkoje.

**Metodas:** penki loop'ai. Keturi renka duomenis, penktas juos sujungia į vieną
brief'ą, kurio kiekvienas teiginys turi šaltinį.

> **Versija 2.0 (2026-08-16).** Versija 1.0 buvo peržiūrėta ir joje rasta klaidų
> penkiose kategorijose — nuo išgalvotų faktų iki sekos klaidos, kuri
> licencijuotoje įstaigoje reikštų asmens duomenų tvarkymą be užfiksuoto
> teisinio pagrindo. Visos jos ištaisytos ir surašytos:
> [`AUDIT-graph-2026-08-16.md`](../AUDIT-graph-2026-08-16.md).

---

## Du laikrodžiai

v1.0 versijoje „DAY 30" viename dokumente reiškė „pilotas prasideda", o kitame —
„pilotas baigėsi, plečiamės". Dabar dienos turi vardus:

| Žymėjimas | Ką reiškia |
|---|---|
| **P1–P30** | Parengiamasis langas — šis loop'ų grafas |
| **L1–L30** | Gyvas concierge pilotas, prasideda kitą dieną po P30 |
| **L31+** | Kelias po piloto |

---

## Vartai (gates)

Šiame grafe yra du vartai. Jie nėra etapai — jie yra sąlygos, be kurių
konkretūs agentai neveikia.

### G1 — teisinis pagrindas asmens duomenims · uždaromas **P6 pabaigoje**

Paysera yra licencijuota elektroninių pinigų įstaiga. **Nė vienas agentas
nerenka, neužklausia, nepraturtina ir nekontaktuoja jokio fizinio asmens, kol
Legal/DPO raštu neapibrėžė teisinio pagrindo.**

Blokuoja: visą Loop-A, visą Loop-D ir tuos Loop-E agentus, kurie tvarko klientų
asmens duomenis (`synthesize_all_outputs`, `create_persona`,
`draft_pilot_brief`).
Neuždarytas → Loop-A ir Loop-D nestartuoja, grafikas slenka diena už dienos.
Kelio „tęsiam laukdami pritarimo" nėra.

> Loop-E prie G1 pridėtas 2026-08-16. Anksčiau jis buvo pažymėtas tik G2 —
> piloto apimties patvirtinimu. G2 yra komercinis sprendimas; jis nėra teisinis
> pagrindas fizinio asmens duomenims tvarkyti. Trys iš keturių Loop-E agentų
> tokius duomenis tvarko.

### G2 — piloto apimties patvirtinimas · uždaromas **P15 pabaigoje**

Pasirašytos piloto ribos: sandorio riba, draudžiamos prekės, patikros lygis,
ginčų SLA, eskalavimo keliai.

Blokuoja: Loop-E teiginius apie patvirtintas ribas.
Neuždarytas → brief'as pateikiamas kaip „apimtis nepatvirtinta", atviri punktai
surašomi pirmame puslapyje, pilotas nestartuoja.

### G3 — publikavimo patvirtinimas · uždaromas **P26 pabaigoje**

CTO ir Legal peržiūros, abi privalomos, abi su vardu ir data. „Peržiūrėta" be
vardo nėra peržiūra.

Blokuoja: brief'o pristatymą CEO.
Neuždarytas → pristatymas slenka į vėlesnę datą. Brief'as, kurio Legal
neperžiūrėjo, nepristatomas.

> Pridėta 2026-08-16. Anksčiau CTO ir Legal peržiūros buvo Loop-E binary
> reikalavimai su terminu P26 — viena diena po to, kai Loop-E užsidaro P25.
> Reikalavimas, kurio terminas vėlesnis už jo savininko pabaigą, neturi
> savininko. Šie vartai yra pagrindinė šios repozitorijos taisyklė, įrašyta į
> struktūrą: generavimas ir publikavimas yra du atskiri žingsniai.

---

## Srauto diagrama

```
  P1 ─────────────────────────────────────────────────────────────────► P30

  ┌─ LOOP-B · Legal & Compliance ──────────────────────────┐
  │ P1–P3   extract_compliance_docs                        │
  │ P3–P6   legal_basis_review ═══════════► ⛔ G1 (P6)     │
  │ P4–P10  conduct_legal_consultation                     │
  │ P11–P15 map_to_pilot_scope ═══════════► ⛔ G2 (P15)    │
  └────────────────────────────────────────────────────────┘
        │                    │
        │                    │
  ┌─ LOOP-C · Photo→Listing ─┼──────────────────────────────┐
  │ (be asmens duomenų —     │  todėl be vartų)             │
  │ P1–P3   collect_test_photos                             │
  │ P4–P12  run_photo_to_listing_ai                         │
  │ P13–P15 quality_check_outputs                           │
  └─────────────────────────────────────────────────────────┘
                             │
                    ⛔ G1 ───┴─── atidaro:
                             │
  ┌─ LOOP-A · Pokalbiai ─────▼───────────┐  ┌─ LOOP-D · Kohorta ──────────────────┐
  │ P7–P9   find_contacts                │  │ P7–P9   query_paysera_transactions  │
  │ P9–P12  schedule_calls               │  │ P9–P11  enrich_seller_profiles      │
  │ P12–P18 conduct_interviews           │  │ P11–P17 recruit_pilot_cohort        │
  │ P18–P20 extract_insights             │  │ P18–P19 analyze_cohort_profile      │
  └──────────────────┬───────────────────┘  └──────────┬──────────────────────────┘
                     │                                 │
                     └──────────────┬──────────────────┘
                                    │  visi keturi baigti: P20
                                    ▼
  ┌─ LOOP-E · Sintezė (reikalauja G1 IR G2) ────────────────┐
  │ P21–P22 synthesize_all_outputs                          │
  │ P22–P23 create_persona · generate_workflow_checklist    │
  │ P23–P25 draft_pilot_brief                               │
  └────────────────────────┬────────────────────────────────┘
                           ▼
              P26  ⛔ G3 — CTO + Legal peržiūra (abi privalomos)
              P27  CEO sprendimas: startas / siauresnė apimtis / stop
              P28–P30  Onboarding ir platformos paruošimas
                           ▼
                    L1 ── CONCIERGE PILOTAS ── L30
```

> **Agentų vardai diagramoje.** Iki 2026-08-16 Loop-D stulpelyje buvo
> `query_transactions`, `enrich_profiles`, `recruit_cohort`, `analyze_cohort` —
> keturi vardai, kurių nėra nei `plan.json`, nei YAML faile. Tai ta pati klaida,
> kurią `INDEX.md` skelbė ištaisyta v1.0 versijoje. Validatoriaus C2 patikra jos
> nematė: ji ieško eilučių, kuriose YRA tikras agento vardas, ir tikrina prie jo
> esančias dienas, todėl sutrumpintas vardas praeina nepastebėtas. Dabar
> tikrinama ir tai.

---

## Slenksčių terminologija

v1.0 stulpeliai buvo „Kritinis | Būtina | Pageidautina" ir jų reikšmė
apsiversdavo tarp eilučių: skaičių eilutėse „kritinis" reiškė žemiausią kartelę,
o vėlavimo eilutėse — vėliausią datą. Tas pats žodis reiškė ir grindis, ir lubas.

| Lygis | Reikšmė |
|---|---|
| **minimum** | Žemiau — loop'as neįvykdytas. Ne švelnus tikslas. |
| **maximum** | Aukščiau — loop'as neįvykdytas. Rodikliams, kur mažiau yra geriau. |
| **target** | Planuotas rezultatas. Pasiekus — loop'as baigtas. |
| **stretch** | Geriau nei planuota. Niekada nėra priežastis pratęsti terminą. |

Kiekvienas rodiklis turi `direction`: `higher_better` naudoja `minimum`,
`lower_better` naudoja `maximum`. Vienas žodis — viena reikšmė.

> Kodėl reikėjo `direction`: inversija buvo grįžusi. `exit-conditions.json`
> turėjo `hallucination_rate_pct: minimum 5 / target 0` su pastaba, kad „čia
> minimum reiškia lubas", o `plan.json` — `listing_time_minutes: minimum 10 /
> target 5`. Perskaičius pažodžiui, 0 % haliucinacijų ir 5 min skelbimas
> reiškė neįvykdytą rodiklį. Tai tas pats žodis, reiškiantis ir grindis, ir
> lubas — būtent tai, ką ši lentelė sakė esant pašalinta.

---

## Loop-A · Domain Expert Interviews

**Tikslas:** suprasti pardavėjo ir pirkėjo kelią realiame kontekste.
**Langas:** P7–P20 · **Vartai:** G1

| Agentas | Dienos | Duomenų klasė |
|---|---|---|
| `find_contacts` | P7–P9 | vieši asmens duomenys |
| `schedule_calls` | P9–P12 | vieši asmens duomenys |
| `conduct_interviews` | P12–P18 | vieši asmens duomenys |
| `extract_insights` | P18–P20 | vieši asmens duomenys |

| Rodiklis | minimum | target | stretch |
|---|---|---|---|
| Kontaktai | 15 | 20 | 30 |
| Įvykę pokalbiai | 10 | 12 | 15 |
| Pokalbio trukmė (min) | 30 | 45 | 60 |
| Temų viename pokalbyje | 4 | 5 | 6 |
| Transkripto tikslumas | 80% | 95% | 100% |

**Pokalbių skaičius sutampa su laišku.** `Paysera-atsakymas.md` sako
„Pakalbinčiau 10–15". v1.0 grafe buvo 15–20 su kritine riba 12 — grafas
prieštaravo laiškui, kurį turėjo įgyvendinti.

**Skatinimas:** 20 EUR, nekintantis. Vėluojant plečiami kanalai ir laikas, o ne
suma: keičiant kainą viduryje tyrimo iškraipoma imtis ir nevienodai elgiamasi su
anksčiau sutikusiais.

**Kanalai:** skelbiu.lt, LT Facebook pirkimo–pardavimo grupės, forumas.lt,
rekomendacijos. **Ne LinkedIn ir ne TikTok** kaip pirminis kanalas — Lietuvos
naudotos elektronikos pardavėjai ten savo sandorių neskelbia.

---

## Loop-B · Legal & Compliance Bounds

**Tikslas:** pirma — teisinis pagrindas pačiam tyrimui (G1), po to — piloto ribos (G2).
**Langas:** P1–P15 · **Vartai:** turi savo (G1, G2)

| Agentas | Dienos | Rezultatas |
|---|---|---|
| `extract_compliance_docs` | P1–P3 | punktai su citatomis |
| `legal_basis_review` | P3–P6 | **uždaro G1** |
| `conduct_legal_consultation` | P4–P10 | protokolai |
| `map_to_pilot_scope` | P11–P15 | **uždaro G2** |

| Rodiklis | minimum | target | stretch |
|---|---|---|---|
| Padengtos sritys | 3 | 5 | 5 |
| Teisiniai susitikimai | 1 | 2 | 3 |
| Taisyklės su šaltiniais | 10 | 15 | 20 |

**Binary reikalavimai** (pakaitalo nėra): raštiškas G1 sprendimas iki P6;
pasirašyta apimtis iki P15 pilotui startuoti.

---

## Loop-C · Photo-to-Listing Workflow

**Tikslas:** patikrinti srautą nuo nuotraukos iki aprašymo ir kainos intervalo.
**Langas:** P1–P15 · **Vartai:** nėra

Vienintelis loop'as be vartų — būtent todėl, kad jame nėra asmens duomenų:
savi įrenginiai, sintetinės nuotraukos, licencijuoti pavyzdžiai. Realių skelbimų
nuotraukos iš prekyviečių į imtį nepatenka.

| Agentas | Dienos |
|---|---|
| `collect_test_photos` | P1–P3 |
| `run_photo_to_listing_ai` | P4–P12 |
| `quality_check_outputs` | P13–P15 |

| Rodiklis | riba | target | stretch |
|---|---|---|---|
| Testinės nuotraukos | min 8 | 10 | 12 |
| Nuotraukos su rezultatu | min 8 | 10 | 12 |
| Prompt'o versijos | min 2 | 3 | 3 |
| Kokybės įvertis (iš 10) | min 6 | 7 | 8 |
| **Haliucinacijų dalis** | **max 5%** | 0% | 0% |

**Haliucinacijų dalis yra ribojantis rodiklis, ne pastaba.** Virš 5 % Loop-C
neįvykdytas, nepriklausomai nuo kokybės įverčio: skelbimas, teigiantis
specifikaciją, kurios įrenginys neturi, reguliuojamoje platformoje yra
klaidinantis pranešimas vartotojui. Iki 2026-08-16 šis rodiklis buvo tik
sekimo faile ir negalėjo nieko sustabdyti.

**Vertinama aklai** — vertintojas nemato, kuri versija generavo tekstą.
**Etaloninė tiesa užrašoma prieš paleidžiant AI.**
**Kainų palyginimas — LT šaltiniai.** Ne eBay ir ne Vinted: eBay Lietuvoje
beveik nenaudojamas, Vinted yra drabužių perpardavimo prekyvietė.

---

## Loop-D · Repeat Seller Recruitment

**Tikslas:** atrinkti ir pakviesti 5 pardavėjus į pirmąją kohortą.
**Langas:** P7–P19 · **Vartai:** G1

| Agentas | Dienos | Duomenų klasė |
|---|---|---|
| `query_paysera_transactions` | P7–P9 | klientų asmens duomenys |
| `enrich_seller_profiles` | P9–P11 | klientų asmens duomenys |
| `recruit_pilot_cohort` | P11–P17 | klientų asmens duomenys |
| `analyze_cohort_profile` | P18–P19 | klientų asmens duomenys |

| Rodiklis | minimum | target | stretch |
|---|---|---|---|
| Tinkami pardavėjai | 20 | 50 | 100 |
| Praturtinti profiliai | 12 | 20 | 20 |
| Patvirtinta kohorta | 4 | 5 | 7 |

**Trys binary reikalavimai:**
1. Jokios užklausos į klientų duomenis prieš uždarant G1.
2. Sutikimas gaunamas **prieš** dalyvavimą — ne trečiame verbavimo žingsnyje.
3. AML/KYC duomenys atrankai nenaudojami be atskiro G1 leidimo raštu.

**Skatinimas:** 25 EUR, nekintantis.

---

## Loop-E · Synthesis & Pilot Brief

**Tikslas:** iš keturių loop'ų padaryti vieną brief'ą su šaltiniais.
**Langas:** P21–P25 · **Vartai:** G1 (asmens duomenys) **ir** G2 (apimtis)
**Priklauso nuo:** Loop-A, Loop-B, Loop-C, Loop-D — visi baigti

| Agentas | Dienos |
|---|---|
| `synthesize_all_outputs` | P21–P22 |
| `create_persona` | P22–P23 |
| `generate_workflow_checklist` | P22–P23 |
| `draft_pilot_brief` | P23–P25 |

**Binary reikalavimai:** 0 nepažymėtų faktinių teiginių · sintezės prompt'uose
nėra iš anksto įrašytų išvadų.

**CTO ir Legal peržiūros** (v1.0 Legal buvo pažymėta „optional") priklauso
vartams G3, o ne šiam loop'ui — jos vyksta P26, kai Loop-E jau baigtas.

**Šaltinių žymos:** `[A:n]` `[B]` `[C]` `[D]` `[EXT:url]` `[HYPOTHESIS]` `[TBD]`.
Teiginys be žymos blokuoja brief'ą.

---

## Gairės

| Diena | Įvykis |
|---|---|
| P3 | Compliance dokumentai ištraukti |
| **P6** | **G1 — teisinis pagrindas raštu** |
| **P15** | **G2 — apimtis pasirašyta; Loop-B ir Loop-C baigti** |
| P20 | Loop-A ir Loop-D baigti |
| P25 | Brief'o juodraštis |
| **P26** | **G3 — CTO + Legal peržiūra; brief'as patvirtintas pristatymui** |
| P27 | CEO sprendimas |
| P30 | Parengiamasis langas baigtas |
| L1 | Concierge pilotas startuoja |

---

## Failai

| Failas | Paskirtis |
|---|---|
| `plan.json` | **Vienintelis tiesos šaltinis.** Dienos, agentai, slenksčiai, vartai. |
| `README.md` | Šis failas — diagrama ir apžvalga |
| `INDEX.md` | Vykdymo instrukcija |
| `exit-conditions.json` | Kasdienis progreso sekimas |
| `loop-a-interviews.yaml` | Loop-A |
| `loop-b-legal.yaml` | Loop-B |
| `loop-c-photo-listing.yaml` | Loop-C |
| `loop-d-repeat-sellers.yaml` | Loop-D |
| `loop-e-synthesis.yaml` | Loop-E |
| `pilot-brief-template.md` | Galutinio brief'o šablonas (tuščias) |

Kiekviena diena, agento vardas ir slenkstis šiuose failuose kyla iš `plan.json`.
Neatitikimą sugauna:

```bash
node tools/validate-graph.mjs
```

---

## Kitas žingsnis

1. Perskaityk `INDEX.md`.
2. Paleisk Loop-B ir Loop-C nuo P1.
3. **Loop-A ir Loop-D nestartuok, kol G1 neuždarytas.**
