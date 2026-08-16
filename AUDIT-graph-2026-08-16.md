# `graph/` auditas — ką radau, kaip ištaisiau, ką pakeičiau procese

**Auditas:** 2026-08-16
**Objektas:** `graph/` katalogas, commit `f3cbfba` (2026-08-11)
**Auditavo:** Eimantas Tauklys, naudodamas Claude Code
**Rezultatas:** 25 sunumeruoti radiniai. Visi ištaisyti.
**Skaičiavimas:** 4 (išgalvoti faktai) + 1 (ne ta rinka) + 3 (kalbos artefaktai)
+ 6 (nenuoseklumas) + 4 (sekos pažeidimai) = 18 jūsų penkiose kategorijose,
plius 7 papildomai rasti. Kiekvienas turi savo numerį žemiau — jei skaičius
neatitinka to, ką suskaičiuosite dokumente, tai mano klaida, ne apvalinimas.
**Patikra:** `node tools/validate-graph.mjs` — v1.0: 140 klaidų. v2.0: 0.

<!-- validator:allow-file C5 — Šis dokumentas cituoja rastas kalbos klaidas pažodžiui, įskaitant kirilicos simbolį. Be jų radinio neįmanoma dokumentuoti. Išimtis galioja tik C5 ir tik šiam failui; validatorius ją išspausdina kiekvieno paleidimo santraukoje. -->


---

## Trumpai

Kostai, jūs buvote teisus, ir tai buvo nemalonu perskaityti.

`graph/` katalogas buvo sugeneruotas, sukommitintas, nustumtas ir įdėtas į laišką
kaip įrodymas, kaip aš dirbu — vienu judesiu, neperskaičius. Tuo pačiu metu
`Application-progress.md`, į kurį rodžiau kaip į savo discipliną, sakė
„Do not invent dates, metrics, team sizes, tools, ownership, or business outcomes".
Vienas dokumentas aprašė taisyklę, kitas ją laužė, ir abu buvo tame pačiame
laiške.

Įdomus dalykas: tai nebuvo generavimo problema. Generavimas gali klysti — tam ir
yra peržiūra. Problema buvo ta, kad **generavimas ir publikavimas pas mane buvo
vienas žingsnis**, todėl tarp tikėtinai atrodančio juodraščio ir viešo artefakto
nestovėjo niekas.

Žemiau — radiniai pagal jūsų nurodytas penkias kategorijas, taisymai ir, kas
svarbiausia, kas pasikeitė procese. Procesas dabar yra vykdomas kodas, ne
pažadas: validatorius, jo regresinis testas, hook'as, kuris blokuoja `git push`,
ir peržiūros skill'as.

Vieno dalyko neslėpsiu iš karto: **jūs radote tai anksčiau už mane.** Viskas,
kas žemiau, egzistuoja tam, kad kitą kartą būtų atvirkščiai.

---

## Turinys

1. [Kategorija 1 — išgalvoti faktai](#1-išgalvoti-faktai-dokumente-kuris-žadėjo-jų-nedaryti)
2. [Kategorija 2 — ne tos rinkos konkurentai](#2-ne-tos-rinkos-konkurentai)
3. [Kategorija 3 — kitų kalbų artefaktai](#3-kitų-kalbų-artefaktai-tekste)
4. [Kategorija 4 — vidinis nenuoseklumas](#4-vidinis-terminų-ir-datų-nenuoseklumas)
5. [Kategorija 5 — proceso sekos klaida](#5-proceso-sekos-klaida)
6. [Papildomai rasta](#papildomai-rasta-ne-jūsų-sąraše)
7. [Kas pasikeitė procese](#kas-pasikeitė-procese)
8. [Kaip tai patikrinti](#kaip-tai-patikrinti)

---

## 1. Išgalvoti faktai dokumente, kuris žadėjo jų nedaryti

**Sunkumas: kritinis.** Tai kategorija, kuri sugriauna viską kitą — jei viena
lentelė išgalvota, skaitytojas negali pasitikėti nė viena.

### 1.1 Šablonas, pripildytas „rezultatų", kurių nebuvo

`pilot-brief-template.md` buvo **tuščias šablonas**, kurį Loop-E turėjo užpildyti
po tyrimo. Bet jis buvo išsiųstas jau užpildytas pavyzdžiais, kurie skaitosi kaip
radiniai:

| Vieta | Kas ten buvo | Tikrovė |
|---|---|---|
| §1.2 | „Based on 15 interviews with repeat sellers" + 4 temos su skaičiais 12/15, 14/15, 10/15, 8/15 | Nebuvo nė vieno pokalbio |
| §1.2 | 4 pažodinės pardavėjų citatos kabutėse | Niekas jų nepasakė |
| §2.1 | Penkių pardavėjų kohortos lentelė: vardai, dažnis, vidutinė vertė, pardavimų skaičius, motyvacija | Niekas nebuvo užverbuotas |
| §2.1 | „Risk assessment: LOW. All 5 sellers have clean transaction history. No AML flags." | Nebuvo užklausos į duomenis |
| Priedas D | Keturios temos su citatomis ir „CRITICAL/HIGH/MEDIUM" | Išgalvota |
| Priedas E | v1/v2/v3 palyginimo matrica: 70%/75%/73%, Flesch 55/62/58, „Overall 6.5 / 7.5 / 7" | Nebuvo paleistas nė vienas testas |
| Priedas F | „Avg age: 36 · 3 iš Vilniaus, 1 Kaunas, 1 Klaipėda · 43 total transactions · NPS 7.8/10" | Išgalvota iki paskutinio skaitmens |

Blogiausia čia — **citatos**. Skaičių skaitytojas dar gali suabejoti. Citata
kabutėse yra tai, kuo pasitikima labiausiai.

### 1.2 Nešaltiniuoti rinkos ir įmonės teiginiai

| Teiginys | Kur | Problema |
|---|---|---|
| „Paysera has 2M+ verified users" | §1 ir §1.1 | Niekur nepaminėta |
| „~€2B market in the EU" | §1.1 | Niekur nepaminėta |
| „Vinted (600k+ active users)" | §1.1 | nepaminėta, ir dar ne ta rinka (žr. 2 skyrių) |
| „v2 prompt achieves 7.5/10 accuracy (title + specs correct 75% of time)" | §2.2 | Matavimo nebuvo |
| „Classifieds becomes 10% of Paysera GMV within 12 months" | §5.1 | Neturėjo jokio pagrindo |

### 1.3 Hipotezė, pateikta kaip esama funkcija

`Paysera-atsakymas.md` — laiškas, kurį jums išsiunčiau — sako tiesiai:

> „Apsaugotą mokėjimą laikau hipoteze, priklausoma nuo legal/compliance
> vertinimo, — ne egzistuojančia funkcija."

`graph/` tą pačią savaitę rašė:

> „Paysera's existing platform (payment verification, identity confirmation)
> eliminates friction…", „Payment held for 7 days (standard escrow period)",
> „Paysera covers <500 EUR disputes", „Legal decision within 5 business days"

**Grafas prieštaravo laiškui, kurio įrodymas jis turėjo būti.** Tai ne
neatidumas — tai reiškia, kad rašant grafą laiškas nebuvo atidarytas.

### 1.4 Iš anksto įrašytos išvados agentų prompt'uose

Tai subtiliausias radinys ir, mano galva, pavojingiausias ilgainiui.
`loop-e-synthesis.yaml` sintezės agento prompt'e buvo:

```
- Loop-A: "payment trust" was #2 theme
- Loop-C: "photo-to-listing v2 scores 7.5/10"
- Išvada: "Persona matches real cohort — low risk for pilot"
- Išvada: "Product feature directly addresses user pain"
- Išvada: "AI feature solves real pain, quality adequate for pilot"
- Išvada: "Pilot launch is low-risk with documented safeguards"
```

Agentui buvo nurodyta, **ką rasti**, dar prieš egzistuojant duomenims. Toks
loop'as negali grąžinti „ne". Jis nėra tyrimas — jis yra jau parašytos išvados
patvirtinimo mechanizmas.

### Taisymas

- Šablonas perrašytas **tuščias**. Kiekvienas skaičius → `[TBD]`.
- Įvestas **šaltinių žymėjimas**, privalomas kiekvienam faktiniam teiginiui:
  `[A:n]` `[B]` `[C]` `[D]` `[EXT:url]` `[HYPOTHESIS]` `[TBD]`.
- Nepažymėtas teiginys **blokuoja brief'ą** — tai binary exit condition
  `loop-e-synthesis.yaml`, ne stiliaus pastaba.
- Naujas privalomas **§0 pirmas puslapis**: ką matavome, kokia imtis, kas liko
  nepatvirtinta, kas yra hipotezė. Jis niekada netrumpinamas.
- Iš sintezės prompt'ų pašalintos visos iš anksto įrašytos išvados. Vietoje jų —
  klausimai, ir aiškus nurodymas, kad nesutapimas tarp Loop-A ir Loop-D yra
  vertingesnis radinys nei sutapimas.
- Apsaugotas mokėjimas visur pažymėtas `[HYPOTHESIS]`, suderintas su laišku.
- Loop-A/C/D išvesčių schemos dabar reikalauja `denominator` ir `sample_size`
  prie kiekvieno skaičiaus, o citatoms — `verbatim: bool` ir `call_id`.

**Automatinė gaudyklė:** validatoriaus **C4** — nepažymėti dydžio teiginiai,
išgalvoti „n/m mentions", varnelė virš tuščio parašo lauko, iš anksto įrašytos
išvados prompt'uose. v1.0: 22 radiniai.

---

## 2. Ne tos rinkos konkurentai

**Sunkumas: aukštas.** Tai klaida, kuri skaitytojui sako: rinka nebuvo tikrinta.

Jūsų laiške konkurentai įvardyti tiesiai: *„prieš aruodas/autoplius/skelbiu"*.

`graph/` kataloge žodžiai **aruodas, autoplius ir skelbiu nepasirodo nė karto.**
Vietoje jų:

| Kur | Kas ten buvo | Kodėl blogai                                                                       |
|---|---|------------------------------------------------------------------------------------|
| `pilot-brief-template.md` §1.3 | Konkurentų matrica: **OLX · Facebook · Vinted · Paysera** | OLX Lietuvoje nėra prasmingas žaidėjas                                             |
| §1 | „…friction that plagues OLX and manual Facebook groups" | Įvardytas ne tas rinkos žaidėjas                                                   |
| §1.1 | „Vinted (600k+ active users), OLX classifieds" | Vinted — drabužių perpardavimas, ne elektronika                                    |
| §1.2 | Citata: „I check eBay / Vinted" | eBay Lietuvoje beveik nenaudojamas                                                 |
| Priedas D | Citata: „eBay prices are 50 EUR cheaper than Facebook" | Ta pati problema, dar ir išgalvota citata                                          |
| `loop-c` ×3 | Kainų palyginimas **„from eBay/Vinted API"** | Ne tos rinkos kainų etalonas                                                       |
| `loop-c` | Testinių nuotraukų šaltinis: „Vinted, eBay listings" | Ir ne ta rinka, ir svetimas turinys                                                |
| `loop-e` | Pardavėjui skirtame sąraše: „Check comparables on Vinted / eBay" | Klientui rodomas ne tos rinkos patarimas                                           |
| `loop-a` | Kontaktų šaltiniai: **LinkedIn, Foruma.lt, TikTok** | LinkedIn — ne naudotų telefonų kanalas; `Foruma.lt` neegzistuoja (yra `forumas.lt`) |

Ir dar viena logikos skylė: konkurentų matricoje buvo teiginiai apie konkurentų
tapatybės patikrą ir ginčų sprendimo greitį („Dispute resolution: Slow / Manual /
Fast") — be jokio šaltinio. Ne tik ne ta rinka, bet ir nepatikrinti teiginiai
apie trečiąsias šalis.

### Taisymas

- `graph/plan.json` → `market_scope` tapo apibrėžtu sąrašu:
  - **Primary:** skelbiu.lt, autoplius.lt, aruodas.lt, Facebook Marketplace / LT grupės
  - **Adjacent:** Vinted — įvardytas kaip LT kilmės, naudingas pasitikėjimo ir
    logistikos dizaino etalonas, **bet ne elektronikos konkurentas ir ne kainų
    palyginimas**
  - **Excluded:** OLX, eBay, Craigslist — su užrašyta priežastimi
- Kainų palyginimai perjungti į LT šaltinius; ar juos teisėtai galima rinkti —
  G1 klausimas, ne prielaida.
- Testinės nuotraukos: savi įrenginiai, sintetika, licencijuoti pavyzdžiai.
  Prekyviečių skelbimų nuotraukos pašalintos ir kaip svetimas turinys, ir kaip
  asmens duomenys.
- Loop-A kanalai perrašyti į realius LT: skelbiu.lt, FB grupės, forumas.lt,
  rekomendacijos.
- Kiekvienam teiginiui apie konkurentą dabar reikia `[EXT:url]` arba jis
  nerašomas.

**Automatinė gaudyklė:** validatoriaus **C3** — draudžiami vardai be pagrindimo
kontekste; įspėja, jei tikri LT konkurentai apskritai neminimi. v1.0: 20 radinių.

---

## 3. Kitų kalbų artefaktai tekste

**Sunkumas: vidutinis, bet signalas — stiprus.** Kalbos šiukšlės nesugadina
plano. Jos parodo, kad tekstas nebuvo perskaitytas.

### 3.1 Indoneziečių kalba agento prompt'e

`loop-c-photo-listing.yaml:65`, pati pirma vykdomo prompt'o eilutė:

> **`Untuk setiap`** `nuotrauka iš collect_test_photos:`

„Untuk setiap" yra indoneziečių/malajiečių „kiekvienam". Ne pastaboje — pirmoje
instrukcijos eilutėje.

### 3.2 Kirilica, pasislėpusi ASCII žodyje

`GRAPH-SETUP.md`, skill'o iškvietimo pavyzdys:

> `/paysera:user-research kategoriја=auto`

`kategoriја` viduryje turi **kirilicos „ј" (U+0458)**, ne lotynišką `j`. Vizualiai
neatskiriama. Kaip komanda ji tyliai neveiktų.

### 3.3 Neegzistuojantys žodžiai lietuviškame tekste

Šie nėra rašybos klaidos — tai žodžiai, kurių nėra:

| Kur | Tekstas |
|---|---|
| `README.md:141` | „jie yra **`pirmaasistripe`** cohort" |
| `README.md:5` | „vykdyti **`parallelliai`**, o **susidurti** jų rezultatus" |
| `README.md:3` | „**`telefonimai`** + nešiojamieji kompiuteriai" |
| `README.md:81` | „Parallel Call 2 (**`žaidingas`** su šalies forume dirbantiems)" |
| `README.md:95` | „Iš Paysera **`interiorinių`** dokumentų" |
| `README.md:159` | „naudoto **`atgra history`**" |
| `README.md:132` | „Lakoniškas + **`per informacijas`**" |
| `README.md:188` | „**`Grammatika`**, logika, links'ai · **`Primenantas`** PRD" |
| `README.md:52` | „## **`Detaliaus`**: Kiekvieno loop'o vardai" |
| `loop-a:25` | „**`grubul indai`** kai pardavimas/pirkinys" |
| `loop-a:74` | „**`Laisvieji šneliai`**: [calendar link]" |
| `loop-a:82` | „**Handbook** — backup — jei jie norėtų Zoom" |
| `loop-b:13` | „Iš Paysera **`internorinių`** dokumentų" |
| `loop-b:39` | „jei prekė **nesurenka/sustabus**" |
| `loop-b:137` | „jei kurie elektronikos subcategories **`negatim`**" |
| `loop-c:26` | „Vinted, eBay listings (**`s/o license`**)" |
| `loop-c:87` | „**`Testuoki`** v1 → v2 → v3" |
| `loop-c:152` | „Kuri v1/v2/v3 **`gaviausiai`** naudoti?" |
| `loop-d:4` | „pardavėjus **`pirmaai cohortai`**" |
| `loop-d:95` | „**`susatinkęs`** šią informaciją" |
| `loop-d:191` | „**`Laisvieji slotvai`**:" |
| `loop-e:18` | „Iš **`keturų`** loop'ų" |
| `loop-a:130` | „Ar žinote apie sukčiavimą / **`rūpestingai grį`**?" |

Ir viena, kuri būtų nuėjusi tiesiai klientui — `loop-a` el. laiško šablone:

> „ieško išmintingų žmonių, kurie **`dalyvauto`** 45 min pasikalbėjime"
> „padėsite **milijonams** išvengti sukčiavimo"

Antroji frazė ne tik keista — ji dar ir per didelis pažadas žmogui, kurio prašai
45 minučių.

### Taisymas

- Visi penki YAML ir abu markdown failai perrašyti; lietuviškas tekstas
  perskaitytas nuo pradžios iki galo.
- Kirilicos simbolis pašalintas.
- El. laiškų šablonai perrašyti: be perdėtų pažadų, su saugojimo terminu ir
  sutikimo atšaukimo galimybe.

**Automatinė gaudyklė:** validatoriaus **C5** — 30+ konkrečių tokenų denylist
(kad negrįžtų) + bet koks nelotyniškas raštas. Cituoti juos leidžiama —
dokumentuoti klaidą reikia ją įvardijant — todėl backtick'uose, code block'uose
ir blockquote'uose jie praeina. v1.0: 33 radiniai. Ko C5 **negali**: sklandžios
nesąmonės. Tam yra žmogaus peržiūra.

---

## 4. Vidinis terminų ir datų nenuoseklumas

**Sunkumas: aukštas.** Aštuoni failai, kiekvienas su savo grafiko kopija.

### 4.1 „DAY 30" reiškė du skirtingus dalykus

| Dokumentas | Ką DAY 30 reiškia |
|---|---|
| `README.md` timeline | „CONCIERGE PILOT START" — pilotas **prasideda** |
| `pilot-brief-template.md` §V „ROADMAP: DAY 30 → FULL LAUNCH" | Pilotas **baigėsi**, DAY 30–40 plečiamės |

Tas pats „30-day pilot" turėjo du laikrodžius vienu vardu.

### 4.2 Terminai, kurie vėlesni už tai, ką blokuoja

Visi keturi loop'ai turėjo `deadline: DAY 14`. Bet:

- Loop-B `fail_threshold: DAY 16` — o Loop-E, kuris **priklauso** nuo Loop-B,
  jau vyko nuo DAY 15. Loop-B galėjo „nepavykti" praėjus dienai po to, kai jo
  rezultatus jau naudojo kitas loop'as.
- Loop-C `fail_threshold: DAY 16` — ta pati problema.
- `README.md` Loop-C sakė „warning nuo DAY 15", YAML ir JSON sakė DAY 10.
- `README.md` Loop-D sakė „warning DAY 16, BLOCK DAY 18", YAML sakė warning
  DAY 10, fail DAY 15.

### 4.3 Agentų vardai nesutapo tarp failų

`README.md` išvardijo agentus, kurių YAML failuose nebuvo:

| README | Tikrovė YAML |
|---|---|
| Loop-A: 3 agentai — `schedule_call`, `extract_insights` | 4 agentai — `schedule_calls`, `conduct_interviews`, … |
| Loop-B: `extract_from_paysera_docs`, `compliance_check`, `map_to_scope` | `extract_compliance_docs`, `conduct_legal_consultation`, `map_to_pilot_scope` |
| Loop-C: `quality_check` | `quality_check_outputs` |
| Loop-D: `filter_repeat_sellers`, `enrich_profile` | `enrich_seller_profiles`, `recruit_pilot_cohort`, `analyze_cohort_profile` |
| Loop-E: „**Agentas (vienas)**" | keturi agentai, išvardyti tuoj pat po tuo |

Vykdytojas, sekantis README, būtų ieškojęs failų, kurių nėra.

### 4.4 Stulpelių reikšmė apsivertė lentelės viduje

Visose penkiose lentelėse buvo „Kritinis | Būtina | Pageidautina":

- Skaičių eilutėje: `n ≥ 12 | n ≥ 15 | n ≥ 20` → „kritinis" = **žemiausia** kartelė
- Vėlavimo eilutėje: `Nuo DAY 15 = FAIL | DAY 12 warning | Ideal DAY 10` →
  „kritinis" = **vėliausia** data

Tas pats žodis reiškė grindis ir lubas dviem eilutėm viena nuo kitos.

### 4.5 Grafas prieštaravo laiškui

| `Paysera-atsakymas.md` | `graph/` |
|---|---|
| „Pakalbinčiau **10–15** neseniai pardavusių ar pirkusių žmonių" | `find_contacts`: 15–20; exit: kritinis 12, būtinas 15, ideal 20 |

### 4.6 Smulkesni, bet tikri

- Pokalbio trukmė: `schedule_call(trukmė=45_min)` · exit „≥ 30 min kritinis" ·
  timeline „14–30 min call backlog" · Loop-D kvietimas „konsultacija (30 min)"
- `README.md:64`: „Skambini (kiekvienas pokalbis **≥24h**…)" — 24 valandų pokalbis
- Skatinimas: Loop-A 10 EUR → eskalacija „2x incentive (20 EUR)"; Loop-D 25 EUR →
  eskalacija „50 EUR instead of 25". Du skirtingi dydžiai persidengiančiai
  auditorijai, ir abu didinami tyrimo viduryje
- CEO pristatymas: `README` DAY 19 · `INDEX` DAY 20 · šablonas „DAY 20–21"
- „If Pilot Succeeds (**all 4 metrics** hit Target)" — o §3.1 lentelėje 5 rodikliai
- Katalogų keliai: `/paysera/graph/test-data/photos/` (prompt'e) vs
  `loop-c-photo/output/` (INDEX) vs `graph/loop-c-photo/test-data/photos/` (JSON)
- „Max transaction size: 1,500 EUR (**AML threshold**)" — 1 500 EUR nėra AML riba,
  tai buvo mūsų pačių rizikos apribojimas, pavadintas reguliacine riba. Tas pats
  dokumentas paskui eskaluoja „disputes > 1,500 EUR" — neįmanoma pagal jo paties
  ribą
- „Seller **NPS** ≥ 7/10" ir „NPS (pre-pilot): 7.8/10" — NPS yra promoter minus
  detractor skalėje −100..+100, ne x/10. Ir prie n=5 vienas nepatenkintas
  respondentas pakeičia jį 20 punktų, t. y. jis neneša informacijos
- `theme_saturation` JSON'e: `"critical": false, "required": true` — loginė
  reikšmė slenksčio laukelyje
- „shortest_possible_duration: 19 days" — pasiekiama tik renkant asmens duomenis
  prieš teisinį pagrindą

### Taisymas

- **Vienintelis tiesos šaltinis:** `graph/plan.json`. Visos dienos, agentų
  vardai, slenksčiai, vartai — ten. Visi kiti failai iš jo išvedami.
- **Du laikrodžiai su vardais:** `P1–P30` parengiamasis langas, `L1–L30` gyvas
  pilotas, `L31+` kelias po piloto. „DAY 30" nebeegzistuoja.
- **Terminologija:** `minimum` / `target` / `stretch` — reikšmė nebeapsiverčia.
- **Agentų vardai suvienodinti** visuose failuose.
- **Pokalbių skaičius suderintas su laišku:** minimum 10, target 12, stretch 15.
- **Vienas skatinimo dydis** kiekvienai auditorijai, nekintantis; eskaluojama
  kanalais ir laiku, ne pinigais — keičiant kainą viduryje tyrimo iškraipoma
  imtis ir nevienodai elgiamasi su anksčiau sutikusiais.
- **1 500 EUR** perrašyta kaip *piloto rizikos riba*; tikros reguliacinės ribos —
  `[TBD — Loop-B]` su citata.
- **NPS pakeistas** į „rekomendacijos įvertis 0–10, vidurkis ≥ 8", su užrašyta
  priežastimi, kodėl NPS prie n=5 netinka.
- **Katalogų keliai** suvienodinti: `graph/output/<loop>/`.

**Automatinė gaudyklė:** validatoriaus **C2** — lygina kiekvieną dieną, agento
vardą ir slenkstį tarp `plan.json`, penkių YAML, `exit-conditions.json`,
`README.md`, `INDEX.md` ir `GRAPH-SETUP.md`. Plius **S2** — tikrina patį
`plan.json`: priklausomybių tvarką, ar loop'as telpa į savo langą, ar slenksčiai
monotoniški. v1.0: 51 radinys.

---

## 5. Proceso sekos klaida

**Sunkumas: kritinis. Tai rimčiausias radinys.**

Paysera yra licencijuota elektroninių pinigų įstaiga. Šis grafas planavo
produkcinės klientų duomenų bazės užklausas ir rinkodaros komunikaciją realiems
klientams **prieš** tai, kai egzistavo sprendimas, leidžiantis tai daryti.

### Kaip atrodė seka

| Diena | Kas vyko | Kas tam leido |
|---|---|---|
| **DAY 3** | `query_paysera_transactions` — užklausa į produkcinę klientų sandorių bazę. YAML: `dependencies: none` | **niekas** |
| **DAY 8** | `enrich_seller_profiles` — traukia el. paštą, telefoną, IP nustatytą laiko juostą, susirašinėjimo su pirkėjais žurnalus, **tapatybės patvirtinimo statusą** | **niekas** |
| **DAY 8** | `recruit_pilot_cohort` — rinkodaros laiškai realiems Paysera klientams | **niekas** |
| **DAY 10** | Sutikimas — verbavimo prompt'o **3-ias punktas**, jau po profiliavimo ir laiškų | — |
| **DAY 14** | `legal_sign_off` — *čia* pagaliau ateina teisinis pritarimas | — |

O `INDEX.md` tuo pačiu metu, juodu ant balto:

> **„Dependencies: None between loops. All 4 must complete by DAY 14."**

Tai nėra netikslumas. Tai teiginys, kad Loop-D ir Loop-B nesusiję — būtent tai ir
yra klaida.

### Keturi atskiri pažeidimai vienoje sekoje

1. **Duomenų tvarkymas be užfiksuoto teisinio pagrindo.** Užklausa DAY 3,
   pagrindas DAY 14.

2. **Tikslo apribojimo pažeidimas.** `enrich_seller_profiles` traukė
   `identity_verification_status` ir atranka naudojo AML žymas. Šie duomenys
   surinkti vykdant **teisinę prievolę** (AML/KYC). Jų panaudojimas produkto
   verbavimui yra atskiras tvarkymo tikslas (BDAR 5 str. 1 d. b p.), ir jam
   reikia atskiro sprendimo. Grafe jo nebuvo.

3. **Sutikimas po fakto.** Trečias žingsnis po profiliavimo ir kontakto.

4. **Numatytas apėjimo kelias.** `loop-b-legal.yaml` eskalacijoje:

   > „DAY 14: No sign-off → mark Loop-B as 'pending approval',
   > **proceed with Loop-E draft** (pending final legal review)"

   Ir `loop-e-synthesis.yaml` exit condition:

   > „reviewed by CTO + Legal **(optional for day 19)**"

   Reguliuojamoje įstaigoje „tęsiam laukdami pritarimo" nėra eskalacija. Tai
   apėjimas, įrašytas į procedūrą.

Ir dar viena smulkmena, kuri tokia nėra: `pilot-brief-template.md` §IV prasidėjo

> ✅ **Approved by:** [Legal team name], [email], [date]

Žalia varnelė virš trijų tuščių laukų. Kiekvienas, kas pasiimtų šį šabloną,
paveldėtų varnelę, bet ne patvirtinimą.

### Kodėl tai praslydo

Kiekvienas loop'as **atskirai** atrodė protingai. Loop-B — normalus compliance
darbas. Loop-D — normalus verbavimas. Klaida egzistuoja tik **tarpusavio
tvarkoje**, o tvarkos nemato niekas, kas skaito failus po vieną.

Tai ir yra pamoka: nuosekliai peržiūrint dokumentus po vieną ši klaida
nerandama. Ją randa tik uždavus klausimą „koks yra tikrasis vykdymo eiliškumas ir
kas kiekvieną žingsnį leidžia".

### Taisymas

Įvesti **vartai** — ne etapai, o sąlygos.

**G1 — teisinis pagrindas asmens duomenims · uždaromas P6 pabaigoje**

Naujas agentas `loop_b.legal_basis_review` pateikia Legal/DPO raštišką
klausimyną ir grąžina sprendimą **kiekvienam tvarkymo tikslui atskirai**:
vidinė užklausa · profilių praturtinimas · verbavimo komunikacija · kontaktų
rinkimas iš viešų šaltinių · pokalbių įrašymas. Plius DPIA išvada, saugojimo
terminas, patvirtinti tekstai, leistinų išorinių šaltinių sąrašas.

Blokuoja **visą Loop-A ir visą Loop-D**. Neuždarytas — jie nestartuoja, grafikas
slenka diena už dienos. Loop-C tęsiasi, nes jame nėra asmens duomenų.

**G2 — piloto apimties patvirtinimas · uždaromas P15 pabaigoje**

Blokuoja Loop-E teiginius apie patvirtintas ribas.

Papildomai:
- **KYC/AML laukai pašalinti iš atrankos.** Rizikos filtravimas dabar vyksta
  kitaip: sąrašą peržiūri Compliance savo pusėje ir grąžina „tinka / netinka" —
  **sprendimą, ne duomenis**. Tiesioginis naudojimas galimas tik jei G1 jį
  raštu leidžia (`kyc_aml_reuse_permitted: true`).
- **Sutikimas — pirmas žingsnis**, ne trečias.
- **Duomenų minimizavimas** su užrašyta taisykle: jei laukas neatsako į klausimą
  „ar galiu išsiųsti kvietimą ir ar žmogus tinka pilotui" — jis nerenkamas.
  Pašalinta: telefonas, IP laiko juosta, profilio užpildymo procentas, avataras,
  susirašinėjimo žurnalai, tapatybės statusas.
- **Apėjimo kelias pašalintas.** Legal peržiūra nebe „optional". Virš visos
  eskalacijos lentelės — viena taisyklė: *vėluojant perkama vėlesnė data arba
  siauresnė apimtis; niekada — praleista peržiūra, praleistas sutikimas ar
  apeiti vartai.*
- **Varnelė iš šablono pašalinta.**
- `graph/output/` įtrauktas į `.gitignore` — ten gulėtų transkriptai ir
  pardavėjų profiliai, o šis repozitoriumas yra viešas. To v1.0 nebuvo.

### Ką tai kainavo grafikui

Sąžiningai: greitis.

| | v1.0 | v2.0 |
|---|---|---|
| Loop-A / Loop-D startas | DAY 1 / DAY 3 | **P7** (po G1) |
| Visi duomenų loop'ai baigti | DAY 14 | **P20** |
| CEO sprendimas | DAY 19–20 | **P27** |
| „Trumpiausia trukmė" | 19 dienų | **27 dienos** |

Aštuonios dienos. v1.0 „19 dienų" buvo pasiekiamos tik renkant asmens duomenis
prieš teisinį pagrindą — tai yra ne greitesnis planas, o planas, kurio negalima
vykdyti.

**Automatinė gaudyklė:** validatoriaus **C1** — kiekvienas agentas, kurio
`data_class != none`, privalo turėti vartus ir startuoti **griežtai po** jų
uždarymo; vartai privalo žinoti, ką blokuoja; YAML privalo tai pakartoti (nes
vykdytojas skaito YAML, ne `plan.json`); ir tekstinė paieška „proceed pending
sign-off" bei „Legal (optional)" formuluočių. Plius **S1** — asmens duomenų
katalogas privalo būti gitignore'intas. v1.0: 14 radinių.

---

## Papildomai rasta (ne jūsų sąraše)

Kelios, kurių jūsų penkios kategorijos neapima, bet kurias radau ir ištaisiau:

1. **„Zero disputes" kaip sėkmės rodiklis.** Nulis ginčų tarp penkių pardavėjų
   per 30 dienų yra tikėtinas rezultatas esant bet kokiam dizainui — jis matuoja
   kohortos dydį, ne produkto kokybę. Blogiau: jis sukuria spaudimą nepranešti.
   Paliktas kaip trigeris, pašalintas kaip sėkmės rodiklis.

2. **Nebuvo haliucinacijų rodiklio.** v1.0 matavo tikslumą, bet ne tai, kaip
   dažnai AI **prasimano** specifikaciją. Paskelbtas skelbimas, teigiantis
   atmintį, kurios įrenginys neturi, yra klaidinantis pranešimas vartotojui,
   paskelbtas reguliuojamos įstaigos. Pridėtas kaip **saugos** rodiklis su
   riba 0%.

3. **Vertinimas nebuvo aklas.** v1.0 vertintojas matė, kuri prompt'o versija
   generavo tekstą, o „v2 laimi" buvo iš anksto įrašyta į kelis failus. Dabar
   vertinama aklai, o etaloninė tiesa užrašoma **prieš** paleidžiant AI.

4. **„our AI nails it 80% of the time"** pardavėjui skirtame sąraše — skaičius,
   kurio niekas nematavo, rodomas klientui. Pakeista į: „AI pasiūlymas yra
   juodraštis. Prieš skelbiant peržiūrėk — už skelbimo turinį atsakai tu."

5. **„pirmos 2 savaitės nemokamai"** verbavimo laiške. Paysera Classifieds pagal
   apibrėžimą yra **nemokama** platforma (jūsų laiškas). „Pirmos 2 savaitės
   nemokamai" reiškia, kad paskui bus mokama — pažadas, kurio produktas neduoda,
   išsiųstas realiam klientui.

6. **„padėsite milijonams išvengti sukčiavimo"** — perdėtas pažadas žmogui,
   kurio prašoma 45 minučių.

7. **`Claude Vision API`** kaip atskiras produktas. Vaizdo įvestis yra Messages
   API galimybė, ne atskiras API. Pataisyta, ir pridėtas reikalavimas fiksuoti
   tikslią modelio versiją kartu su rezultatais, kad matavimas būtų atkartojamas.

---

## Kas pasikeitė procese

Tai svarbiausia dalis, ir noriu būti tikslus dėl to, kas iš tikrųjų pasikeitė.

**Diagnozė:** klaida buvo ne generavime. Generavimas gali klysti. Klaida buvo ta,
kad **generavimas ir publikavimas buvo vienas žingsnis**. Tarp tikėtinai
atrodančio juodraščio ir viešo artefakto nestovėjo niekas.

Checklist'as to nebūtų sustabdęs, nes checklist'ą reikia nuspręsti atsidaryti.

### 1. Vienintelis tiesos šaltinis — `graph/plan.json`

Aštuoni failai su aštuoniomis grafiko kopijomis garantuoja nuokrypį. Dabar
dienos, agentai, slenksčiai, vartai, rinkos apimtis ir šaltinių politika gyvena
viename faile; visa kita iš jo išvedama ir su juo lyginama.

### 2. Validatorius — `tools/validate-graph.mjs`

Septyni patikrinimai, po vieną kiekvienai rastai kategorijai:

| | Ką tikrina |
|---|---|
| **C1** | Asmens duomenys prieš teisinį pagrindą; „proceed pending sign-off"; „Legal (optional)" |
| **C2** | Dienų, agentų vardų ir slenksčių nuokrypis tarp dokumentų |
| **C3** | Ne tos rinkos konkurentai ir kainų etalonai |
| **C4** | Nepažymėti dydžio teiginiai, išgalvoti „n/m", varnelė virš tuščio parašo, iš anksto įrašytos išvados prompt'uose |
| **C5** | Kitų kalbų ir sugadinti tokenai, nelotyniškas raštas |
| **S1** | Asmens duomenų katalogas privalo būti gitignore'intas |
| **S2** | `plan.json` vidinis nuoseklumas: priklausomybių tvarka, langai, slenksčių monotoniškumas |

Be priklausomybių, apie 600 eilučių, kiekvienas patikrinimas su komentaru, kuri
konkreti 2026-08-11 klaida jį pagimdė.

### 3. Regresinis testas — `tools/test-validator.mjs`

Po fakto parašytą linterį lengva apgauti: derini jį, kol dabartiniai failai
praeina. Todėl testas nukreipia validatorių į **tikrą commit'ą `f3cbfba`** ir
reikalauja, kad visos penkios kategorijos vis dar suveiktų.

```
    ok    C1   14 findings (expected >= 8)
    ok    C2   51 findings (expected >= 20)
    ok    C3   20 findings (expected >= 10)
    ok    C4   22 findings (expected >= 15)
    ok    C5   33 findings (expected >= 20)
    total on v1.0: 140 findings
    Current tree passes. v1.0 fails in all five categories. Test green.
```

Jei kas nors ateityje susilpnins patikrinimą, kad naujas dokumentas praeitų,
šis testas parausta.

### 4. Hook'as, kuris blokuoja publikavimą — `tools/pre-publish-guard.mjs`

Užregistruotas `.claude/settings.json` kaip `PreToolUse`. Perima kiekvieną
`git commit`, `git push`, `npm run deploy` ir `gh-pages`, paleidžia validatorių
ir **blokuoja**, jei jis krenta.

Tai vienintelė dalis, kuri nepriklauso nuo to, ar prisiminsiu. 2026-08-11 grafas
buvo sugeneruotas, sukommitintas ir nustumtas vienu judesiu — hook'as tokio
judesio nebeleidžia.

### 5. Peržiūros skill'as — `.claude/skills/pre-publish-audit/SKILL.md`

Validatorius yra grindys. Jis nesugauna sklandžios nesąmonės ir nepatikrina, ar
šaltiniuotas skaičius teisingas. Skill'as yra lubos: penki **atskiri**
adversarial pass'ai — išgalvojimai, rinka, kalba, vidinis nuoseklumas, proceso
seka. Kiekvienas su savo prompt'u ir savo išvestimi.

Esminis dalykas: kiekvienas pass'as paleidžiamas **atskirai**. Vienas
„peržiūrėk šį dokumentą" optimizuoja garsiausią problemą ir praleidžia tylias.
Ir kiekvienas grąžina arba radinių sąrašą su `file:line`, arba sakinį „No
findings" — „atrodo gerai" nėra galiojantis atsakymas.

Skill'e užrašytas ir mastelis: ne viskam reikia penkių pass'ų. 2026-08-11
artefaktas buvo eilutėje „viešame repozitoriume, nuoroda laiške trečiajai
šaliai", o gavo eilutę „vienkartinis skriptas".

### 6. `CLAUDE.md`

Taisyklės, kurios dabar galioja kiekvienoje šio repozitoriumo sesijoje: įrodymų
taisyklės, rinkos apimtis, reguliuojamos įstaigos taisyklės, kalbos taisyklė.

### 7. Viena taisyklė, kurią laikau vertingiausia

> **`[TBD]` publikuotame dokumente yra sąžiningas atsakymas.
> Tikėtinai atrodantis skaičius vietoje `[TBD]` yra klaida.**

Beveik visi 1 kategorijos radiniai kyla iš to, kad tuščia vieta atrodė
nebaigtai, o užpildyta — profesionaliai. Tai atgal.

---

## Kaip tai patikrinti

```bash
node tools/validate-graph.mjs      # dabartinė būklė — turi būti 0 klaidų
node tools/test-validator.mjs      # v1.0 vs v2.0 regresija
node tools/validate-graph.mjs --json --only=C1   # vienas patikrinimas, mašininis formatas
```

Pakeisti failai:

| Failas | Kas |
|---|---|
| `graph/plan.json` | **naujas** — vienintelis tiesos šaltinis |
| `graph/README.md` · `INDEX.md` · `exit-conditions.json` | perrašyti iš `plan.json` |
| `graph/loop-a…e*.yaml` | visi penki perrašyti |
| `graph/pilot-brief-template.md` | perrašytas tuščias, su šaltinių žymėjimu |
| `GRAPH-SETUP.md` | perrašytas |
| `tools/validate-graph.mjs` | **naujas** |
| `tools/test-validator.mjs` | **naujas** |
| `tools/pre-publish-guard.mjs` | **naujas** |
| `.claude/settings.json` | **naujas** — hook'as |
| `.claude/skills/pre-publish-audit/SKILL.md` | **naujas** |
| `CLAUDE.md` | **naujas** |
| `.gitignore` | `graph/output/` |

---

## Pabaigai

Nemanau, kad šis auditas atperka pirminį rezultatą. Jis buvo blogas, ir jis buvo
išsiųstas kaip įrodymas, kaip aš dirbu.

Ką galiu pasakyti: klaidos buvo tikros ir konkrečios, ne miglotos; kiekviena
turi taisymą, o kiekviena kategorija — automatinę gaudyklę, kurią galima
paleisti; ir grandinė nuo klaidos iki patikrinimo yra atsekamas kodas, ne
ketinimas.

Ir viena, kurios neapeisiu: **jūs radote tai anksčiau už mane.** Visa, kas
aukščiau, egzistuoja tam, kad kitą kartą būtų atvirkščiai.

— Eimantas Tauklys, 2026-08-16
