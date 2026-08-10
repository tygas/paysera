# Codex / OMX insights — Paysera builder-PO application

## Tikslas

Parengti konkretų atsakymą į Paysera Tech klausimus, naudojant kandidato
pateiktą informaciją ir patikrinamus lokalių repository duomenis. Sustojimo
kriterijus: atsakyti į kiekvieną klausimų grupę, nepadarant nei vieno išgalvoto
teiginio apie datą, metriką, komandos dydį, autorystę ar verslo rezultatą.

## Naudotas procesas

1. `Task.md` klausimai suskaidyti į faktų grupes: AI įrankiai, AI projektai,
   lead/PO patirtis, US Bank kontekstas, produkto kryptis ir darbo sąlygos.
2. Trūkstami faktai rinkti struktūruotais OMX klausimų raundais.
3. Kiekvienas atsakymas įrašytas į `Application-progress.md`, atskiriant
   patvirtintus ir nepatvirtintus teiginius.
4. Lokaliai patikrintas `/Users/etauklys/WebstormProjects/am-claude-skills/`
   repository: failų struktūra, skillų turinys, Git istorija, autorystė ir
   kandidatui priskiriami pakeitimai.
5. Classifieds hipotezei patikrinti vieši Paysera ir Lietuvos policijos
   šaltiniai. Išoriniai faktai naudoti tik problemos krypčiai pagrįsti, o ne
   produkto sėkmei teigti.
6. Galutiniame tekste atskirtos trys epistemologinės kategorijos:
   - kandidato patvirtinti faktai;
   - repository ar viešais šaltiniais patikrinti faktai;
   - siūlomos produkto hipotezės, kurias dar reikia validuoti.

## Repository patikros rezultatai

- Marketplace apima `am`, `biip-deploy` ir `security-gates` pluginus.
- Git shortlog rodo 41 commit'ą autoriaus vardu `Eimantas
  <tygasz@gmail.com>` ir dar du su kita kandidato tapatybe.
- Tiesiogiai patikrinti kandidato pakeitimai:
  - `am/skills/am/coding-standards.md` išskyrimas;
  - 12 punktų pre-submit checklist;
  - Tailwind guard;
  - styled-components taisyklių prieštaravimų taisymas;
  - keli review pataisymų raundai;
  - `am` ir `biip-deploy` dokumentacijos drift'o korekcijos.
- Atskiro BA Q&A skillo nerasta. Kandidatas patvirtino, kad turėjo omenyje
  legacy ALIS discovery/parity gaires bendrame `am` skille.
- Viso `biip-deploy` skillo autorystė kandidatui nepriskirta, nes Git istorija
  rodo kitą pagrindinį autorių.

## Svarbiausi sprendimai

- Classifieds pradėti nuo vieno wedge'o, o ne nuo NT, auto, darbo ir daiktų
  vienu metu.
- Pasirinkta naudota elektronika: struktūruojama nuotraukomis/atributais,
  pakankamai didelė vertė ir aiški pasitikėjimo problema.
- North-star pradžios rodiklis — 14 dienų sell-through rate, nes skelbimų ar AI
  sugeneruoto turinio kiekis pats savaime neįrodo marketplace vertės.
- Protected payment pateiktas kaip hipotezė, priklausoma nuo legal/compliance,
  o ne kaip egzistuojanti Paysera Classifieds galimybė.

## Sąmoningai neįtraukti arba su išlyga palikti teiginiai

- AI planų naudojimo pradžios datos nepateiktos.
- ChatGPT Pro ir OpenCode/API tikslios išlaidos nepateiktos.
- US Bank ir Scale Tech tikslūs kalendoriniai laikotarpiai bei komandų dydžiai
  nepateikti.
- Release'o ar RBAC sprendimų kiekybiniai before/after rezultatai nepateikti.
- Todėl galutiniame atsakyme nėra išgalvotų procentų, sutaupytų valandų ar
  produkto pajamų.

## Sukurti artefaktai

- `Paysera-atsakymas.md` — siunčiamas lietuviškas atsakymas.
- `Codex-OMX-insights.md` — ši darbo išklotinė.
- `Application-progress.md` — faktų ir sprendimų audito pėdsakas.
