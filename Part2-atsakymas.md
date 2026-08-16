# Atsakymas į antrą žingsnį

Kostai,

ačiū už tiesumą. Nurodyti, kad klaidos yra, bet neparodyti kur — teisinga
užduotis; radęs jas pats supratau daugiau, nei būtų davęs sąrašas.

Trumpai: **radau visose penkiose kategorijose — 18 radinių — plius 7, kurių
jūsų sąraše nebuvo. Iš viso 25.** Visi ištaisyti. Detalus auditas —
[`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md), kiekvienas radinys
sunumeruotas ir su nuoroda į konkrečią eilutę.

Žemiau — santrauka, proceso pakeitimas ir trys spragos.

---

## 1. Ką radau `graph/` kataloge

| Kategorija | Radiniai |
|---|---|
| **Išgalvoti faktai** | Piloto brief'o šablonas buvo išsiųstas užpildytas „rezultatais": 15 pokalbių su skaičiais 12/15 ir 14/15, keturios pažodinės pardavėjų citatos, penkių pardavėjų kohortos lentelė su vardais ir vertėmis, v1/v2/v3 kokybės matrica su Flesch balais, kohorta „avg age 36, 43 transactions, NPS 7.8/10". Nebuvo nė vieno pokalbio, nė vieno testo, nė vieno užverbuoto pardavėjo. Plius nešaltiniuoti „Paysera has 2M+ verified users", „~€2B market", „Classifieds becomes 10% of Paysera GMV". |
| **Ne tos rinkos konkurentai** | Konkurentų matrica: **OLX, Facebook, Vinted**. Kainų palyginimas „from eBay/Vinted API". Pardavėjui skirtame sąraše: „Check comparables on Vinted / eBay". Žodžiai **aruodas, autoplius, skelbiu** — kuriuos įvardijote savo laiške — `graph/` kataloge nepasirodo **nė karto**. |
| **Kitų kalbų artefaktai** | `Untuk setiap` — indoneziečių kalba, pirmoje `loop-c` agento prompt'o eilutėje. Kirilicos raidė „je" (U+0458), pasislėpusi ASCII žodyje `kategorija=auto` — vizualiai neatskiriama nuo lotyniškos `j`, bet komanda su ja tyliai neveiktų. Ir apie 20 neegzistuojančių žodžių lietuviškame tekste: `pirmaasistripe`, `parallelliai`, `grubul indai`, `Laisvieji šneliai`, `internorinių`, `negatim`, `telefonimai`, `Grammatika`. |
| **Vidinis nenuoseklumas** | „DAY 30" reiškė „pilotas prasideda" viename faile ir „pilotas baigėsi, plečiamės" kitame. Loop-B `fail_threshold: DAY 16` — o Loop-E, kuris nuo jo priklauso, jau vyko nuo DAY 15. `README.md` išvardijo agentus, kurių YAML failuose nėra. Stulpelis „Kritinis" reiškė žemiausią kartelę vienoje eilutėje ir vėliausią datą kitoje. Ir grafas planavo 15–20 pokalbių, nors laiškas, kurio įgyvendinimas jis turėjo būti, sakė 10–15. |
| **Proceso sekos klaida** | Žemiau atskirai. |

### Sekos klaida

Ji verta atskiro paragrafo, nes ji vienintelė iš tikrųjų pavojinga.

```
DAY 3    query_paysera_transactions — užklausa į produkcinę klientų bazę
                                       YAML: dependencies: none
DAY 8    enrich_seller_profiles     — el. paštas, telefonas, IP laiko juosta,
                                       susirašinėjimo žurnalai,
                                       TAPATYBĖS PATVIRTINIMO STATUSAS
DAY 8    recruit_pilot_cohort       — rinkodaros laiškai realiems klientams
DAY 10   sutikimas                  — verbavimo prompt'o 3-ias punktas
DAY 14   legal_sign_off             — teisinis pritarimas
```

O `INDEX.md` tuo pačiu metu: **„Dependencies: None between loops."**

Keturi pažeidimai vienoje sekoje: duomenų tvarkymas be užfiksuoto teisinio
pagrindo; AML/KYC duomenų panaudojimas verbavimui (tikslo apribojimas —
BDAR 5 str. 1 d. b p.); sutikimas po fakto; ir įrašytas apėjimo kelias —
Loop-B eskalacija „No sign-off → proceed with Loop-E draft", Loop-E exit
condition „reviewed by CTO + Legal **(optional for day 19)**". Plius šablone
žalia varnelė „✅ Approved by: [Legal team name]" virš trijų tuščių laukų.

**Kodėl praslydo:** kiekvienas loop'as atskirai atrodė protingai. Loop-B —
normalus compliance darbas. Loop-D — normalus verbavimas. Klaida egzistuoja tik
tarpusavio **tvarkoje**, o tvarkos nemato niekas, kas skaito failus po vieną.

**Taisymas:** įvesti vartai — sąlygos, ne etapai.
**G1** (teisinis pagrindas asmens duomenims, P6) blokuoja visą Loop-A ir visą
Loop-D. **G2** (piloto apimtis, P15) blokuoja Loop-E. KYC/AML laukai pašalinti
iš atrankos — rizikos peržiūrą dabar atlieka Compliance savo pusėje ir grąžina
**sprendimą, ne duomenis**. Sutikimas — pirmas žingsnis. Apėjimo kelias
pašalintas; virš visos eskalacijos lentelės viena taisyklė: *vėluojant perkama
vėlesnė data arba siauresnė apimtis — niekada praleista peržiūra, praleistas
sutikimas ar apeiti vartai.*

Tai kainavo aštuonias dienas: CEO sprendimas iš DAY 19–20 pasislinko į P27.
Senasis „trumpiausias kelias — 19 dienų" buvo pasiekiamas tik renkant asmens
duomenis prieš teisinį pagrindą. Tai ne greitesnis planas, o planas, kurio
negalima vykdyti.

---

## 2. Ką pakeičiau procese

Tai jums svarbiausia dalis, todėl noriu būti tikslus.

**Diagnozė:** klaida buvo ne generavime. Generavimas gali klysti — tam ir yra
peržiūra. Klaida buvo ta, kad **generavimas ir publikavimas pas mane buvo vienas
žingsnis.** `graph/` buvo sugeneruotas, sukommitintas, nustumtas ir įdėtas į
laišką vienu judesiu. Tarp tikėtinai atrodančio juodraščio ir viešo artefakto
nestovėjo niekas.

Checklist'as to nebūtų sustabdęs, nes checklist'ą reikia nuspręsti atsidaryti.
Todėl pakeitimas yra **vykdomas kodas**, ne dokumentas:

**1. Vienintelis tiesos šaltinis** — `graph/plan.json`. Aštuoni failai su
aštuoniomis grafiko kopijomis garantuoja nuokrypį. Dabar dienos, agentai,
slenksčiai, vartai, rinkos apimtis ir šaltinių politika gyvena viename faile.

**2. Validatorius** — `tools/validate-graph.mjs`, septyni patikrinimai, po vieną
kiekvienai rastai kategorijai. C1 sekos vartai · C2 nuokrypis tarp dokumentų ·
C3 ne tos rinkos konkurentai · C4 nešaltiniuoti teiginiai, varnelė virš tuščio
parašo, iš anksto įrašytos išvados prompt'uose · C5 kalbos artefaktai ·
S1 asmens duomenys viešame repo · S2 `plan.json` vidinis nuoseklumas.

**3. Regresinis testas** — `tools/test-validator.mjs`. Po fakto parašytą linterį
lengva apgauti: derini jį, kol dabartiniai failai praeina. Todėl testas nukreipia
validatorių į **tikrą commit'ą `f3cbfba`** ir reikalauja, kad visos penkios
kategorijos vis dar suveiktų:

```
    ok    C1   14 findings (expected >= 8)
    ok    C2   51 findings (expected >= 20)
    ok    C3   20 findings (expected >= 10)
    ok    C4   22 findings (expected >= 15)
    ok    C5   33 findings (expected >= 20)
    total on v1.0: 140 findings
    Current tree passes. v1.0 fails in all five categories. Test green.
```

**4. Hook'as, kuris blokuoja publikavimą** — `tools/pre-publish-guard.mjs`,
užregistruotas `.claude/settings.json` kaip `PreToolUse`. Perima kiekvieną
`git commit`, `git push`, `npm run deploy`, `gh-pages` ir **blokuoja**, jei
validatorius krenta. Tai vienintelė dalis, kuri nepriklauso nuo to, ar
prisiminsiu.

**5. Peržiūros skill'as** — `.claude/skills/pre-publish-audit/SKILL.md`.
Validatorius yra grindys: jis nesugauna sklandžios nesąmonės ir nepatikrina, ar
šaltiniuotas skaičius teisingas. Skill'as yra lubos — penki **atskiri**
adversarial pass'ai (išgalvojimai · rinka · kalba · nuoseklumas · proceso seka),
kiekvienas su savo prompt'u. Esminis dalykas: atskirai. Vienas „peržiūrėk šį
dokumentą" optimizuoja garsiausią problemą ir praleidžia tylias. Ir kiekvienas
grąžina arba radinių sąrašą su `file:line`, arba sakinį „No findings" — „atrodo
gerai" nėra galiojantis atsakymas.

**6. `CLAUDE.md`** — taisyklės, galiojančios kiekvienoje šio repo sesijoje.

Ir viena taisyklė, kurią laikau vertingiausia iš visko, ką čia padariau:

> **`[TBD]` publikuotame dokumente yra sąžiningas atsakymas.
> Tikėtinai atrodantis skaičius vietoje `[TBD]` yra klaida.**

Beveik visi išgalvoti faktai kilo iš to, kad tuščia vieta atrodė nebaigtai, o
užpildyta — profesionaliai. Tai yra atgal, ir kol nesupratau šito, taisiau
simptomus.

Paleisti galima taip:

```bash
node tools/validate-graph.mjs      # dabartinė būklė — 0 klaidų
node tools/test-validator.mjs      # v1.0 vs v2.0 regresija
```

---

## 3. Trys spragos

### 3.1 Nuo kada naudoju mokamus AI planus

| Įrankis | Nuo kada | Kam naudoju |
|---|---|---|
| **ChatGPT Pro/Max** | **2025 m. pradžios** | Kelių agentų darbo organizavimas, kodo peržiūros, rinkos analizė (su OMX) |
| **Claude Team** | **2026 m. vasaros** | Pagrindinis darbo įrankis: programavimas, architektūra, skill'ų kūrimas |
| **OpenCode Zen + usage-based API** | **2026 m. vasaros** | Naujų modelių vertinimas, paprastesnių užduočių nukreipimas pigesniems modeliams, nedideli API eksperimentai |

Taigi mokamus AI įrankius naudoju **apie pusantrų metų**, iš jų Claude —
maždaug tris mėnesius.

**Pataisa ankstesniam laiškui.** Ten rašiau „Claude Code Business/Premium —
90 Eur/mėn." ir „ChatGPT Pro — 20 Eur/mėn." Planų pavadinimai buvo netikslūs, o
kainos — iš atminties. Tikslūs pavadinimai yra lentelėje; kainų nenurodau, nes
neturiu jų po ranka tiksliai, o spėti po šito audito būtų keista.

### 3.2 US Bank — laikotarpis ir komandos dydis

**Senior Front End Developer, U.S. Bank · pilnas etatas · 2022 m. gruodis –
2024 m. balandis (1 m. 5 mėn.)**

**Mano komanda:** 5 front-end inžinieriai, 4 QA, 1 Product Owner.

**Kodėl release jungė penkių komandų darbą:** produktą kūrė **dvi FE komandos ir
dvi BE komandos** Lietuvoje plius **viena komanda JAV**. Visų penkių kodas eidavo
į tą patį leidimą. Aš atstovavau savo komandai Agile Nexus susitikimuose, kur
buvo derinami tarpkomandiniai ir architektūriniai sprendimai.

Tai patikslina ankstesnį laišką: „penkios komandos" reiškė ne penkis atskirus
repozitoriumus, o penkias komandas, kurių darbas suplaukdavo į vieną release'ą —
būtent todėl viena nebaigta dalis stabdydavo visą leidimą, ir būtent todėl
feature flag'ai ir pasirengimo release'ui kriterijai išsprendė problemą.

### 3.3 Nuotolinio darbo preferencija

**Renkuosi hibridą: 3–4 dienas per savaitę iš biuro Kaune, prireikus atvykstu į
Vilnių.**

Ankstesniame laiške parašiau „suderinsime pokalbio metu" — tai buvo vengimas, ne
atsakymas, ir jūs teisingai tai pastebėjote. Realus atsakymas: man geriau dirbti
iš biuro nei visiškai nuotoliu, o Kaunas yra ta vieta, iš kurios tai darau
kasdien.

---

## Pabaigai

Nemanau, kad šis auditas atperka pirminį rezultatą. Jis buvo blogas, ir jis buvo
išsiųstas kaip įrodymas, kaip aš dirbu.

Ką galiu pasakyti: klaidos buvo tikros ir konkrečios; kiekviena turi taisymą, o
kiekviena kategorija — automatinę gaudyklę, kurią galite paleisti patys; ir
grandinė nuo klaidos iki patikrinimo yra atsekamas kodas, ne ketinimas.

Ir dalykas, kurio neapeisiu: **jūs radote tai anksčiau už mane.** Viskas, ką
aprašiau 2 skyriuje, egzistuoja tam, kad kitą kartą būtų atvirkščiai.

Eimantas Tauklys
2026-08-16

---

### Pridedami dokumentai

| Failas | Kas |
|---|---|
| [`AUDIT-graph-2026-08-16.md`](AUDIT-graph-2026-08-16.md) | Pilnas auditas — 23 radiniai su eilučių nuorodomis |
| `graph/` | Ištaisytas loop'ų grafas (v2.0) |
| `graph/plan.json` | Vienintelis tiesos šaltinis |
| `tools/validate-graph.mjs` | Validatorius — 7 patikrinimai |
| `tools/test-validator.mjs` | Regresinis testas prieš `f3cbfba` |
| `tools/pre-publish-guard.mjs` | Hook'as, blokuojantis publikavimą |
| `.claude/skills/pre-publish-audit/SKILL.md` | Peržiūros procedūra |
| `CLAUDE.md` | Repo taisyklės |
