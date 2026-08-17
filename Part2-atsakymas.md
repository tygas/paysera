# Atsakymas į antrą žingsnį

Kostai,

ačiū už tiesumą. Trumpai: **radau visose penkiose kategorijose — 18 radinių, plius 7 jūsų sąraše nebuvusius. Iš viso 25.** Visi ištaisyti. Detalus auditas su taisymais — [`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md).

## 1. Ką radau `graph/` kataloge

- **Išgalvoti faktai** — piloto šablonas išsiųstas „užpildytas" rezultatais, kurių nebuvo: 15 pokalbių su skaičiais, pažodinės citatos, kohortos lentelė, kokybės matricos. Plius nešaltiniuoti „2M+ users", „~€2B market".
- **Ne ta rinka** — matricose OLX, eBay, Vinted; žodžiai *aruodas, autoplius, skelbiu* — kuriuos įvardijote laiške — nepasirodė nė karto.
- **Kalbos artefaktai** — `Untuk setiap` agento prompt'e, kirilicos „je" (U+0458) ASCII žodyje, ~20 neegzistuojančių žodžių (`pirmaasistripe`, `parallelliai`, …).
- **Nenuoseklumas** — „DAY 30" reiškė startą ir pabaigą skirtinguose failuose; README agentai, kurių YAML nėra; 15–20 pokalbių vietoje laiško 10–15.
- **Sekos klaida** — rimčiausia: užklausa į produkcinę klientų bazę DAY 3, AML/KYC duomenys atrankai ir laiškai klientams DAY 8, sutikimas DAY 10, teisinis pritarimas tik DAY 14 — plius įrašytas apėjimo kelias („proceed pending approval", „Legal (optional)").

**Sekos taisymas:** vartai kaip sąlygos, ne etapai. **G1** (teisinis pagrindas) blokuoja visą Loop-A ir Loop-D; **G2** (piloto apimtis) blokuoja Loop-E. KYC/AML laukai pašalinti iš atrankos — Compliance grąžina sprendimą, ne duomenis. Sutikimas — pirmas žingsnis. Apėjimo kelias pašalintas: vėluojant perkama vėlesnė data arba siauresnė apimtis, niekada — praleista peržiūra. Kaina — aštuonios dienos (CEO sprendimas DAY 19–20 → P27): senasis „19 dienų" planas buvo vykdomas tik renkant asmens duomenis prieš teisinį pagrindą.

## 2. Ką pakeičiau procese

Diagnozė: klaida ne generavime — **generavimas ir publikavimas buvo vienas žingsnis.** Checklist'as nebūtų padėjęs, nes jį reikia nuspręsti atsidaryti. Pakeitimas — vykdomas kodas:

1. **Vienintelis tiesos šaltinis** — `graph/plan.json`; dienos, agentai, slenksčiai, vartai viename faile, visa kita lyginama su juo.
2. **Validatorius** — `tools/validate-graph.mjs`, po patikrinimą kiekvienai rastai kategorijai (C1–C5, S1–S2).
3. **Regresinis testas** — `tools/test-validator.mjs`: validatorius paleidžiamas ant tikro v1.0 commit'o `f3cbfba` ir privalo rasti visas penkias kategorijas (šiuo metu — 413 radinių). Susilpninta patikra — raudonas testas.
4. **Mutaciniai testai** — `tools/test-implementation-checks.mjs`: kiekviena patikra privalo aptikti į medžio kopiją grąžintą savo defektą. Atsirado po to, kai vidinis auditas rado negyvą patikrinimą, kurį dokumentacija vadino veikiančiu.
5. **Hook'as** — `tools/pre-publish-guard.mjs` (`PreToolUse`): blokuoja `git commit / push / deploy`, jei validatorius krenta. Nepriklauso nuo to, ar prisiminsiu.
6. **Peržiūros skill'as** — penki atskiri adversarial pass'ai; kiekvienas grąžina radinius su `file:line` arba „No findings".

Ir taisyklė, kurią laikau vertingiausia:

> **`[TBD]` publikuotame dokumente yra sąžiningas atsakymas.
> Tikėtinai atrodantis skaičius vietoje `[TBD]` yra klaida.**

Patikrinti galima taip:

```bash
node tools/validate-graph.mjs      # dabartinė būklė — 0 klaidų
node tools/test-validator.mjs      # v1.0 regresija
```

### Kaip naudotis grafu — paprastai

`graph/` katalogas yra 30 dienų piloto planas, užrašytas taip, kad jį galėtų tikrinti programa, o ne tik skaityti žmogus. 
Skaityti pradėkite nuo `graph/README.md` — jis lietuviškai paaiškina visą struktūrą. Planą sudaro penki darbų srautai: pokalbiai su pardavėjais (A), 
teisinis pagrindas (B), skelbimo iš nuotraukos prototipas (C), pakartotinių pardavėjų atranka pilotui (D) ir galutinis piloto brief'as (E). 
Trys vartai (G1–G3) yra ne kalendoriaus etapai, o sąlygos: kol vartai neuždaryti — pavyzdžiui, 
kol nėra rašytinio teisinio sprendimo dėl asmens duomenų (G1) — nuo jų priklausantys darbai tiesiog nevyksta,
kad ir kaip vėluotų grafikas. Visos dienos, skaičiai ir slenksčiai gyvena viename faile — `graph/plan.json`; 
visi kiti dokumentai jį tik atkartoja, o jei kur nors atsiranda neatitikimas, aukščiau parodytos dvi komandos jį suranda ir publikavimas sustabdomas automatiškai.

## 3. Trys spragos

**Mokami AI planai.** ChatGPT Pro/Max — nuo **2025 m. pradžios** (agentų organizavimas, kodo peržiūros, rinkos analizė).
Claude Team — nuo **2026 m. pavasario**, dabar pagrindinis darbo įrankis.
OpenCode Zen + usage-based API — nuo 2026 m. vasaros, modelių vertinimui ir pigesnių užduočių nukreipimui. Iš viso — apie pusantrų metų.

**US Bank.** Senior Front End Developer  · **2022 m. gruodis – 2024 m. balandis (1 m. 5 mėn.)**. Mano komanda: 5 FE inžinieriai, 4 QA, 1 Product Owner. „Penkios komandos" reiškė dvi FE ir dvi BE komandas Lietuvoje plius vieną JAV, kurių darbas eidavo į vieną release'ą — atstovavau savo komandai Agile Nexus susitikimuose.

**Nuotolinis darbas.** Renkuosi hibridą: 3–4 dienos per savaitę iš biuro Kaune, prireikus galiu atvykti į Vilnių. Ankstesnis „suderinsime pokalbio metu" buvo vengimas, ne atsakymas.

---

Nemanau, kad auditas atperka pirminį rezultatą. Bet klaidos buvo tikros ir konkrečios; kiekviena turi taisymą ir automatinę gaudyklę, kurią galite paleisti patys. Ir dalykas, kurio neapeisiu: **jūs radote tai anksčiau už mane.** Viskas 2 skyriuje egzistuoja tam, kad kitą kartą būtų atvirkščiai.

Eimantas Tauklys
2026-08-16

### Pridedami dokumentai

| Failas | Kas |
|---|---|
| [`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md) | Pilnas auditas: 25 v1.0 radiniai + 15 v2.0 implementacijos radinių |
| `graph/` | Ištaisytas loop'ų grafas (v2.0), `plan.json` — vienintelis tiesos šaltinis |
| `tools/` | Validatorius, regresinis ir mutaciniai testai, publikavimo hook'as |
| `.claude/skills/pre-publish-audit/SKILL.md` | Peržiūros procedūra |
| `CLAUDE.md` | Repo taisyklės |
