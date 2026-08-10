# Atsakymas dėl builder-PO rolės

Kostai,

ačiū už konkretų laišką. Builder-PO modelis man natūralus: stipriausiose rolėse
neapsiribojau implementacija — apibrėžiau reikalavimus, priėmiau architektūrinius
bei proceso sprendimus ir koordinavau kelių komandų darbą. Žemiau aprašau, kas
tiksliai buvo mano sprendimai, o ne ką darė komanda.

## AI planai ir darbo metodas

- **Claude Code Business/Premium — 90 Eur/mėn.** Pagrindinis darbo įrankis:
  programavimas, architektūra, skillų kūrimas.
- **ChatGPT Pro — 20 Eur/mėn.** Kelių agentų darbo organizavimas, kodo
  peržiūros, rinkos analizė.
- **OpenCode Zen + usage-based API.** Naujų modelių vertinimas, paprastesnių
  užduočių nukreipimas pigesniems modeliams, nedideli API eksperimentai.

Mano darbo metodika veikia per keturis lygmenis: **agentas → loop → loop'ų
grafas → pakartotinio naudojimo skillis**. Kiekvieną pasiteisinusią praktiką
dokumentuoju kaip skillą — ne tam, kad sutaupyčiau laiko vieną kartą, bet kad
procesas veiktų teisingai kaskart be papildomų paaiškinimų.

## Skill kūrimas: am-claude-skills marketplace

Aplinkos ministerijos projektams kuriame bendrą Claude Code skillų marketplace.
Mano konkreti atsakomybė — `am` skillas ir jo evoliucija.

**Problema, kurią sprendžiau:** keliuose repozitoriumuose dirba inžinieriai ir
analitikai su skirtingomis technologijomis — Moleculer/TypeScript API, React ir
Vue/Vite frontendai, WordPress/Bedrock, Java/Maven legacy ALIS sistema, GitHub
Actions. Agentas be konteksto daro prielaidas, kurios griauna kodavimo standartus
arba praleidžia svarbias validacijas.

**Mano priimti sprendimai:**

1. Išskyriau TypeScript kodavimo standartus iš bendro skillo į atskirą
   `coding-standards.md` dokumentą — jis tapo vieninteliu šaltiniu. Prieš tai
   taisyklės buvo išsibarsčiusios, todėl agentas jas ignoruodavo arba
   interpretuodavo prieštaringai.

2. Sukūriau 12 punktų pre-submit checklist su Tailwind ir styled-components
   apsaugomis. Tikslas: agentas negali pateikti pakeitimo, kuris praeina
   kompiliavimą, bet pažeidžia projekto konvencijas ar stilių.

3. ALIS dalyje aprašiau, kaip agentas turi rasti senas formas, validacijas,
   servisus ir duomenų struktūras bei palyginti jas su perrašoma sistema.
   Rezultatas: analitikas gali pateikti klausimą „kaip ši funkcija veikė senoje
   sistemoje" ir gauti atsakymą remiantis tikru kodu, o ne atmintimi.

4. Tikrinau realios organizacijos konfigūraciją ir taisiau dokumentacijos
   drift'ą tiek `am`, tiek `biip-deploy` dokumentuose, kai instrukcijos
   neatitiko faktiškai veikiančio proceso.

Git istorijoje — 41 commit'as mano vardu. Viso `biip-deploy` skillo autorystės
sau nepriskiriu: ten mano indėlis yra konkrečių neatitikimų korekcija.

## Lead ir PO atsakomybės

### US Bank — Senior Frontend Engineer, bankinė sistema prekybininkams

Atstovavau komandai Agile Nexus susitikimuose, kur buvo priimami strateginiai ir
architektūriniai sprendimai. Be techninio darbo buvau atsakingas už vieną
didžiausių proceso kliūčių.

**Problema:** release jungė penkių komandų darbą. Kiekvieną kartą atsiradus
vienai nebaigtai daliai buvo stabdomas visas leidimas ir taikomi code freeze'ai.
Tai buvo pasikartojantis ciklas, nes nebuvo aišku, kada funkcija yra pasiruošusi
release'ui ir kas yra atsakingas.

**Mano sprendimai:**

1. **Apibrėžiau funkcijai keliamus pasirengimo release'ui kriterijus.** Tai
   leido atskirti, kas gali patekti į leidimą, o kas turi likti — be šio
   apibrėžimo kiekvieną kartą buvo deramasi iš naujo.

2. **Įvedžiau feature flag'us.** Nepabaigta dalis gali būti kode ir neblokuoti
   release'o, nes pasiekiama tik per flag'ą. Tai pašalino pagrindinę priežastį,
   dėl kurios release'as buvo stabdomas.

3. **Koordinavau penkių komandų release'o procesą ir pertvarkiau komunikacijos
   kanalus.** Kiekviena komanda žinojo savo atsakomybę ir eskalavimo kelią —
   nebereikėjo ieškoti, kas gali priimti sprendimą.

Dirbdamas su stipriu PO perėmiau dvi praktikas, kurias naudoju iki šiol:
strateginį mąstymą (kas tikrai svarbu, o kas yra triukšmas) ir dėmesį detalėms
proceso lygmeniu.

### Scale Tech — ~1,5 metų kontraktas, verslo sistema nuo nulio

Kūrėme „mašiną mašinai kurti" — sistemą, kurios struktūra ir prieigos valdymas
turėjo prisitaikyti prie skirtingų klientų verslo procesų. Klientai nebuvo
techniški.

**Mano atsakomybės:** visiškai atsakingas už frontendą; formulavau backend RBAC
struktūros reikalavimus; koordinavau visos sistemos vystymą.

**PO dalis — ne titulas, o kasdieniai sprendimai:** Maždaug metus su
netechniniais klientais iteravau reikalavimus, prototipus ir srautus pagal
Agile principus. Reikalavimų šaltinis nebuvo PRD — buvau aš: pokalbiai su
klientu, maketos, iteracijos ir sprendimų dokumentavimas.

**Architektūrinis sprendimas, kurį sukūriau ir dokumentavau:** Organizacija gali
turėti kelių lygių hierarchiją. Prieigą prie atskiro objekto ar objektų aplanko
galima suteikti arba atšaukti naudotojui, grupei, komandai ar organizaciniam
lygiui — whitelist ir blacklist taisyklės taikomos tame pačiame scope'e. Šią
logiką sukūriau aš ir suprojektavau jos UX, nes be aiškios autorinės nuosavybės
tai liko „bendras" sprendimas, kuriuo niekas nebuvo tikras.

## Kryptis: Paysera Classifieds

Pradėčiau nuo vieno siauro segmento — naudotos elektronikos kategorijoje
„daiktai" (pirmiausia telefonai ir nešiojamieji kompiuteriai). Priežastys:
struktūruoti atributai tinka AI automatizacijai, sandorio vertė pakankama,
pasitikėjimo problema reali ir dokumentuota.

**Pirma hipotezė:** nuotraukų pagrindu atpažinus modelį ir būklę, pasiūlius
struktūruotą aprašymą ir kainos intervalą, pardavėjas gali paskelbti patikimą
skelbimą maždaug per minutę. Paysera patvirtinta tapatybė, vidinis pokalbis ir
apsaugoto mokėjimo scenarijus turėtų mažinti pereiti prie sukčių siunčiamų
išorinių nuorodų. Apsaugotą mokėjimą laikau hipoteze, priklausoma nuo
legal/compliance vertinimo, — ne egzistuojančia funkcija.

**Šios krypties pagrindas:** Paysera pati dokumentuoja sukčiavimo scenarijus,
kai pirkėjas sumoka už skelbime rastą siuntą ir jos negauna; Lietuvos policija
reguliariai įspėja apie fiktyvių pristatymo nuorodų sukčiavimą. Tai pagrindžia
pasitikėjimo problemos egzistavimą, bet ne produkto sėkmę.

**Pagrindinis rodiklis:** 14 dienų sell-through rate — aktyvuotų skelbimų dalis,
per 14 dienų baigiasi patvirtintu sandoriu. Papildomai: nuotrauka→publikavimas
konversija ir trukmė, kokybiniai pokalbiai per skelbimą, sukčiavimo/dispute
signalai, pakartotinis pardavėjų naudojimas.

**Per pirmas 30 dienų:**

1. Pakalbinčiau 10–15 neseniai pardavusių ar pirkusių žmonių — skelbimo,
   derybų, mokėjimo ir pristatymo kelias.
2. Su legal/compliance apibrėžčiau tapatybės, lėšų laikymo, ginčų ir
   draudžiamų prekių ribas.
3. Sukurčiau photo-to-listing ir patvirtinto pokalbio/mokėjimo prototipą.
4. Iš Paysera kanalų ar vidinio tinklo surinkčiau siaurą pirminę pardavėjų
   kohortą.
5. Paleisčiau concierge pilotą, instrumentuočiau funnelį ir po 30 dienų
   nuspręsčiau: gilinti šį segmentą, keisti wedge'ą ar sustoti.

## Praktinės sąlygos

Tinka pilnas etatas ir kasdienė anglų kalba. Pradėti galėčiau per 2–4 savaites.
Tinka bendradarbiavimas per MB; fiksuoto atlygio lūkestis — **4 000 Eur per
mėnesį**. Nuotolinio darbo detalę galime suderinti pokalbio metu.

Pridedu Codex/OMX darbo išklotinę (`Codex-OMX-insights.md`), kurioje atskirti
kandidato patvirtinti faktai, repository patikrinti teiginiai ir produkto
hipotezės.

Eimantas Tauklys

---

### Šaltiniai produkto hipotezei

- [Paysera: fraud prevention](https://www.paysera.com/v2/en/fraud-prevention)
- [Lietuvos policija: sukčiavimas apsiperkant internetu](https://vilnius.policija.lrv.lt/lt/policija-pataria/sukciavimu-prevencija/sukciavimas-apsiperkant-internetu/)
- [Paysera Cashback / Checkout ekosistema](https://www.paysera.com/v2/en/save-money)
