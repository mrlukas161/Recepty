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
