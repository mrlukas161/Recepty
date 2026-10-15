# CLAUDE.md – Recepty

Rodinná PWA appka: radí, čo variť, keď chceme obmedziť múku, cukor, údeniny a vyprážané; hodnotí jedlá podľa výskumov; robí jedálniček, nákupný zoznam a ruletu. **Zadanie: `docs/ZADANIE.md`.** Priebeh: `docs/PRIEBEH.md`. Rozhodnutia: `docs/ROZHODNUTIA.md`.

## Záväzné pravidlá
- **Jazyk:** UI, obsah, dokumentácia a commit správy po slovensky (s diakritikou). Identifikátory v kóde môžu byť anglicky.
- **Žiadne nepriznané predpoklady.** Tvrdenie o účinku jedla len s **overeným zdrojom** (otvorený a prečítaný v tejto práci: PubMed/DOI/oficiálny dokument) a s úrovňou dôkazov. Odhad alebo kuchárska prax sa v appke výslovne označí („odhad", „prax, nie dôkaz"). **Citácie nevymýšľaj**; čo sa nedá overiť, do appky nejde.
- **Skóre zdravosti je naša heuristika** — appka to povie a každý faktor vysvetlí so zdrojom.
- **Nie je to lekárska rada** — upozornenie v appke (deti, tehotenstvo, celiakia, cukrovka a iné choroby → lekár alebo nutričný terapeut).
- **Autorské práva:** recepty a texty vlastnými slovami; žiadne kopírovanie z receptových webov ani zo štúdií (krátka citácia do 15 slov so zdrojom je OK); žiadne cudzie fotky.
- **Commit a push často** (aspoň po každej fáze) + zápis do `docs/PRIEBEH.md`. Nič s červenými testami — workflow vtedy nenasadí.
- **Over spustením**, nie len kompiláciou: unit testy, e2e na mobilnom viewporte, prechod appkou v prehliadači, živá adresa (`version.json`).
- Do repa žiadne tajomstvá, tokeny ani osobné údaje.

## Sieť v cloude a úrovne overenia zdrojov (doplnené 15.10.2026 02:25)
- Zo sandboxu cloudu ide len **GitHub** (git, raw.githubusercontent.com) a **npm**. PubMed, doi.org, EFSA, EUR-Lex, WHO, Open Food Facts a nástroj WebFetch sú blokované (test 15.10.2026 00:21 UTC). **WebSearch funguje** (vracia súhrny výsledkov).
- Preto **3 úrovne overenia zdroja**, appka pri každom tvrdení ukáže, na akej úrovni je:
  - `original` — originál otvorený a prečítaný (zatiaľ nedostupné; doplní sa, keď sa sieť otvorí),
  - `vyhladavanie` — existencia, bibliografia (autori, rok, časopis, DOI) a hlavný záver potvrdené aspoň z 2 nezávislých výsledkov WebSearch (napr. vydavateľ + PubMed alebo repozitár); čísla len ak sú vo výsledkoch doslova,
  - `neoverene` — do appky nejde ako tvrdenie.
- Tvrdenia s úrovňou `vyhladavanie` smú ísť do appky s viditeľným označením („overené vyhľadávaním, originál nečítaný"). Toto upravuje rozhodnutie R1 v `docs/ROZHODNUTIA.md`: zdroje nemusia ostať len „odhad".
- Na začiatku každého behu over sieť (`curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://doi.org/10.1136/bmj.i2716`). Ak je otvorená, overuj v origináli a zvyšuj úroveň na `original`.
