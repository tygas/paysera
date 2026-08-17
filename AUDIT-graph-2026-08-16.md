# `graph/` auditas — radiniai ir taisymai

**Auditas:** 2026-08-16
**Objektas:** v1.0 (`graph/` @ `f3cbfba`, 2026-08-11) kaip dokumentas ir v2.0 kaip implementacija
**Rezultatas:** 25 radiniai v1.0 (18 penkiose nurodytose kategorijose + 7 papildomi) ir 15 radinių v2.0 implementacijoje. Visi ištaisyti.
**Patikra:** `node tools/validate-graph.mjs` — v2.0: 0 klaidų. v1.0 medyje: 413 (140 su pirminėmis patikromis; skaičius auga su kiekvienu patikrų sustiprinimu — galiojantį skaičių spausdina `node tools/test-validator.mjs`).

<!-- validator:allow-file C5 — Šis dokumentas cituoja rastas kalbos klaidas pažodžiui, įskaitant kirilicos simbolį. Be jų radinio neįmanoma dokumentuoti. Išimtis galioja tik C5 ir tik šiam failui; validatorius ją išspausdina kiekvieno paleidimo santraukoje. -->

---

## I dalis — v1.0 dokumentų auditas (25 radiniai)

### 1. Išgalvoti faktai · kritinis

- `pilot-brief-template.md` — tuščias šablonas — išsiųstas „užpildytas": 15 pokalbių su skaičiais 12/15 ir 14/15, keturios pažodinės pardavėjų citatos, penkių pardavėjų kohortos lentelė su vardais, v1/v2/v3 matrica su Flesch balais, „avg age 36 · 43 transactions". Nebuvo nė vieno pokalbio, testo ar užverbuoto pardavėjo.
- Nešaltiniuoti teiginiai: „Paysera has 2M+ verified users", „~€2B market", „Classifieds becomes 10% of Paysera GMV".
- Apsaugotas mokėjimas aprašytas kaip esama funkcija — nors laiškas, kurio įrodymas grafas turėjo būti, jį vadino hipoteze.
- `loop-e-synthesis.yaml` prompt'e iš anksto įrašytos išvados („Pilot launch is low-risk…") — agentas negalėjo grąžinti „ne".

**Taisymas:** šablonas perrašytas tuščias, kiekvienas skaičius → `[TBD]`; privalomas šaltinių žymėjimas `[A:n] [B] [C] [D] [EXT:url] [HYPOTHESIS] [TBD]` — nepažymėtas teiginys blokuoja brief'ą; išvados iš prompt'ų pašalintos; hipotezė visur pažymėta. **Gaudyklė: C4** (v1.0: 22 radiniai pirminėmis patikromis; su dabartinėmis — 25).

### 2. Ne tos rinkos konkurentai · aukštas

Laiške konkurentai įvardyti: *aruodas / autoplius / skelbiu*. `graph/` kataloge šie žodžiai nepasirodė nė karto — vietoje jų OLX, eBay, Vinted konkurentų matricoje, kainų palyginimuose „from eBay/Vinted API" ir pardavėjui rodomuose patarimuose; kontaktų kanaluose LinkedIn ir neegzistuojantis `Foruma.lt`.

**Taisymas:** `graph/plan.json` → `market_scope`: primary — skelbiu.lt, autoplius.lt, aruodas.lt, Facebook Marketplace / LT grupės; adjacent — Vinted (pasitikėjimo dizaino etalonas, ne elektronikos konkurentas); excluded — OLX, eBay, Craigslist su užrašyta priežastimi. Kainų šaltiniai ir kanalai perrašyti į LT. **Gaudyklė: C3** (v1.0: 20 radinių).

### 3. Kitų kalbų artefaktai · vidutinis

- `Untuk setiap` (indoneziečių k.) — pirmoje `loop-c` vykdomo prompt'o eilutėje.
- Kirilicos „ј" (U+0458), pasislėpusi ASCII žodyje `kategoriја=auto` — vizualiai neatskiriama, komanda tyliai neveiktų.
- ~20 neegzistuojančių žodžių lietuviškame tekste: `pirmaasistripe`, `parallelliai`, `grubul indai`, `Laisvieji šneliai`, `internorinių`, `negatim`, `telefonimai`, `Grammatika` ir kt. — įskaitant klientui skirtą el. laišką („`dalyvauto` 45 min pasikalbėjime", „padėsite milijonams išvengti sukčiavimo").

**Taisymas:** visi failai perrašyti ir perskaityti nuo pradžios iki galo; el. laiškų šablonai — be perdėtų pažadų, su saugojimo terminu ir sutikimo atšaukimu. **Gaudyklė: C5** — tikslių tokenų denylist + bet koks nelotyniškas raštas (v1.0: 33 radiniai). Sklandžios nesąmonės C5 nesugauna — tam žmogaus peržiūra.

### 4. Vidinis terminų ir datų nenuoseklumas · aukštas

- „DAY 30" reiškė piloto **startą** viename faile ir piloto **pabaigą** kitame.
- Loop-B/C `fail_threshold: DAY 16` — o nuo jų priklausęs Loop-E jau vyko nuo DAY 15.
- `README.md` išvardijo agentus, kurių YAML failuose nebuvo (`schedule_call`, `compliance_check`, …).
- Stulpelis „Kritinis" reiškė žemiausią kartelę vienoje eilutėje ir vėliausią datą kitoje.
- Grafas planavo 15–20 pokalbių; laiškas sakė 10–15. Plius: 1 500 EUR riba pavadinta „AML threshold" (nebuvo), NPS x/10 skalėje prie n=5, nesutampantys katalogų keliai ir skatinimo dydžiai.

**Taisymas:** `graph/plan.json` — vienintelis tiesos šaltinis (dienos, agentai, slenksčiai, vartai); du laikrodžiai `P1–P30` / `L1–L30`; terminologija `minimum / target / stretch`; agentų vardai suvienodinti; pokalbiai 10/12/15 pagal laišką; vienas skatinimo dydis auditorijai. **Gaudyklė: C2 + S2** (v1.0: 51 radinys pirminėmis patikromis; su dabartinėmis — 321).

### 5. Proceso sekos klaida · kritinis, rimčiausias radinys

Grafas planavo produkcinės klientų bazės užklausas ir rinkodarą realiems klientams **prieš** egzistuojant tam leidžiančiam sprendimui:

| Diena | Kas vyko | Kas leido |
|---|---|---|
| DAY 3 | `query_paysera_transactions` — produkcinė klientų bazė | niekas |
| DAY 8 | `enrich_seller_profiles` — el. paštas, telefonas, susirašinėjimai, **tapatybės patvirtinimo statusas** | niekas |
| DAY 8 | `recruit_pilot_cohort` — laiškai realiems klientams | niekas |
| DAY 10 | sutikimas — verbavimo prompt'o 3-ias punktas | — |
| DAY 14 | `legal_sign_off` | — |

Keturi pažeidimai: duomenų tvarkymas be teisinio pagrindo; AML/KYC duomenys verbavimui (tikslo apribojimas, BDAR 5 str. 1 d. b p.); sutikimas po fakto; įrašytas apėjimo kelias (Loop-B „No sign-off → proceed with Loop-E draft", Loop-E „reviewed by CTO + Legal (optional)"). Plius žalia varnelė „✅ Approved by:" virš tuščių parašo laukų. Klaida matoma tik tarpusavio **tvarkoje** — po vieną skaitant failus jos nėra.

**Taisymas:** vartai kaip sąlygos — **G1** (teisinis pagrindas, uždaromas P6) blokuoja visą Loop-A ir Loop-D; **G2** (piloto apimtis, P15) blokuoja Loop-E. KYC/AML laukai pašalinti iš atrankos — Compliance grąžina *sprendimą, ne duomenis*. Sutikimas — pirmas žingsnis. Apėjimo kelias pašalintas: vėluojant perkama vėlesnė data arba siauresnė apimtis, niekada — praleista peržiūra. `graph/output/` gitignore'intas (asmens duomenys viešame repo). Kaina: CEO sprendimas iš DAY 19–20 → P27 — v1.0 „19 dienų" buvo pasiekiamos tik pažeidžiant teisinį pagrindą. **Gaudyklė: C1 + S1** (v1.0: 14 radinių).

### Papildomai rasta (7, ne užduoties sąraše)

„Zero disputes" kaip sėkmės rodiklis (matuoja kohortos dydį, ne kokybę; skatina nepranešti) · nebuvo haliucinacijų rodiklio (pridėtas kaip saugos rodiklis) · vertinimas nebuvo aklas · „our AI nails it 80% of the time" klientui be matavimo · „pirmos 2 savaitės nemokamai" nemokamoje platformoje · „padėsite milijonams" · „Claude Vision API" kaip neegzistuojantis atskiras produktas.

---

## II dalis — v2.0 implementacijos auditas (15 radinių)

Kitas klausimas nei I dalis: ne „ar proza teisinga", o **ar briaunos tikros, ar vartai riša, ar validatorius tikrina tai, ką sako tikrinąs**. Pagrindinė išvada: validatorius praėjo, bet praėjimas reiškė mažiau, nei atrodė.

| # | Svarba | Radinys |
|---|---|---|
| F1 | **Aukšta** | C2 vartų/statuso patikra — negyvas kodas: skaitė `blocks_loops` iš `plan.json`, kur to rakto niekada nebuvo; iteravo tuščią masyvą kiekvieną kartą, o `INDEX.md` teigė „the validator enforces this" |
| F2 | **Aukšta** | `README.md` diagrama vardijo keturis Loop-D agentus, kurių nėra — tas pats defektas, kurį v2.0 skelbėsi ištaisiusi |
| F3 | **Aukšta** | Loop-E tvarkė klientų duomenis už G2 (komercinio), ne G1 (teisinio pagrindo) vartų — `gated_by` buvo skaliaras, negalėjo išreikšti „G1 ir G2" |
| F4 | **Aukšta** | Dvi metrikos apverstu poliarumu: 0 % haliucinacijų formaliai **neišlaikė** slenksčio — v1.0 „apsivertusio stulpelio" defektas grįžo |
| F5 | **Aukšta** | Skelbtas svarbiausias saugos rodiklis (haliucinacijos) neturėjo jokios pasekmės — nebuvo slenksčiuose, exit sąlygose nei eskalacijoje |
| F6–F12 | Vidutinė | `exit-conditions.json` tikrintas viena kryptimi; `plan.json` be tarp-loop'inių briaunų; reikalavimai su terminu po loop'o pabaigos ir P26–P30 be šeimininko; Loop-D eskalacijos diena skyrėsi trijuose failuose; niekas nevykdė G1 saugojimo/trynimo sprendimo; skatinimo sumos dubliuotos ir nelygintos |
| F13–F15 | Žema | Mišrios perdavimo konvencijos; nepilna `INDEX.md` slenksčių lentelė; C1 tikrino, kad vartai įvardyti, bet ne kurie |

**Pritaikyti taisymai** (visi tame pačiame commit'e): `gated_by` tapo sąrašu, Loop-E — `[G1, G2]`; `blocks_loops` ir `depends_on_loops` pridėti į `plan.json` ir tikrinami; kiekvienas slenkstis gavo `direction`, žemyn geresnės metrikos naudoja `maximum`; haliucinacijų rodiklis pakeltas į `plan.json` slenksčius, YAML ir eskalaciją; pridėti vartai **G3 — publikavimo patvirtinimas** (P26); `data_retention` blokas su `[TBD — G1]`; C1/C2/S2 patikrinimai perrašyti (dvikryptis metrikų lyginimas, išgalvotų agento vardų paieška, skatinimo sumų lyginimas).

**Svarbiausia pamoka (F1):** žalias validatoriaus paleidimas nėra įrodymas, kad patikra vykdoma. Todėl atsirado `tools/test-implementation-checks.mjs` — mutaciniai testai: kiekvienas defektas grąžinamas į laikiną medžio kopiją ir tikrinama, kad validatorius jį praneša. Patikra, kurios neįmanoma priversti kristi, nėra patikra.

---

## Kas pasikeitė procese

Diagnozė: klaida ne generavime — **generavimas ir publikavimas buvo vienas žingsnis.** Pakeitimas yra vykdomas kodas, ne dokumentas:

1. **Vienintelis tiesos šaltinis** — `graph/plan.json`; visi kiti failai iš jo išvedami ir su juo lyginami.
2. **Validatorius** — `tools/validate-graph.mjs`: C1 seka/vartai · C2 nuokrypis tarp dokumentų · C3 rinka · C4 nešaltiniuoti teiginiai · C5 kalbos artefaktai · S1 asmens duomenų higiena · S2 `plan.json` vidinis nuoseklumas.
3. **Regresinis testas** — `tools/test-validator.mjs`: paleidžia validatorių ant tikro v1.0 commit'o `f3cbfba` ir reikalauja, kad visos penkios kategorijos suveiktų (šiuo metu — 413 radinių). Susilpninta patikra — raudonas testas.
4. **Mutaciniai testai** — `tools/test-implementation-checks.mjs`: 58 atvejai, kiekviena nauja patikra privalo aptikti savo defektą.
5. **Hook'as** — `tools/pre-publish-guard.mjs` (`.claude/settings.json`, `PreToolUse`): perima `git commit / push / deploy` ir blokuoja, jei validatorius krenta. Nepriklauso nuo to, ar prisiminsiu.
6. **Peržiūros skill'as** — `.claude/skills/pre-publish-audit/SKILL.md`: penki atskiri adversarial pass'ai; kiekvienas grąžina radinius su `file:line` arba „No findings" — „atrodo gerai" negalioja.
7. **`CLAUDE.md`** — taisyklės kiekvienai sesijai, įskaitant vertingiausią:

> **`[TBD]` publikuotame dokumente yra sąžiningas atsakymas.
> Tikėtinai atrodantis skaičius vietoje `[TBD]` yra klaida.**

## Kaip patikrinti

```bash
node tools/validate-graph.mjs              # dabartinė būklė — 0 klaidų
node tools/test-validator.mjs              # v1.0 regresija — 413 radinių penkiose kategorijose
node tools/test-implementation-checks.mjs  # 12/12 mutacijų aptikta
```

— Eimantas Tauklys, 2026-08-16
