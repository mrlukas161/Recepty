# Skener zloženia – metodika, zdroje, rozhodnutia

## Metodika
- **Zložky** sa rozoberú parserom (čiarky na najvyššej úrovni, zátvorky = podzložky, percentá, E-čísla v tvaroch E330 / E 330 / E-330 / E330i, opravy OCR zámen O→0, l→1, fuzzy zhoda názvov na preklepy).
- **Databáza prídavných látok:** taxonómia aditív Open Food Facts (`additives.txt`, licencia **ODbL**), prevedená skriptom `scripts/skener-aditiva.mjs` na `src/skener/data/aditiva-off.json` (727 položiek; slovenské názvy, triedy, odkazy na EFSA). Dáta sú © prispievatelia Open Food Facts, ODbL; appka to uvádza.
- **Hodnotenie látok** (`src/skener/hodnotenia.ts`, `zlozky.ts`): 4 stupne (bez výhrad · v poriadku · obmedziť · vyhnúť sa/najmä deti). Každé má dôvod, zdroje (`src/data/zdroje/skener.json`) a úroveň dôkazov. Látka bez vlastného posúdenia dostane **predvolenú** hodnotu „v poriadku (predvolené podľa funkcie, odhad)“ — nepredstierame posúdenie, ktoré sme nespravili.
- **Preventívne obavy** (TiO2, emulgátory CMC/polysorbát, sladidlá podľa WHO 2023, erytritol) sú označené `preventivne` a majú len úroveň „slabé“.
- **Skóre výrobku** je naša heuristika: spracovanosť 28 · prídavné látky 22 · cukor 14 · tuky a soľ 10 · kvalita zloženia 8 · tvoje nastavenia 8 · (výživové hodnoty 10, ak sú zadané). Prahy a váhy sú odhad.
- **NOVA markery** (arómy, emulgátory, sladidlá, farbivá, izoláty, modifikované škroby, sirupy, stužené tuky…) podľa Monteiro 2019; je to klasifikácia, nie dôkaz škodlivosti jednotlivých látok.
- Hodnotenia z iných aplikácií (Férová potravina, Yuka, INCI Beauty) **nepreberáme**.

## Úroveň overenia (CLAUDE.md)
Sieť v cloude: doi.org, PubMed, EFSA, EUR-Lex neprístupné (test 15. 10. 2026 00:26 UTC). Všetky zdroje v skeneri sú na úrovni **`vyhladavanie`** (≥ 2 nezávislé výsledky WebSearch; číslo len ak bolo vo výsledkoch doslova), originál nečítaný. Appka to pri zdroji ukazuje.

## Čo overenie vyvrátilo / neprešlo (do appky nejde ako tvrdenie)
- „EFSA 2019 o EDTA E385“ – neexistuje; re-evaluácia E385 prebieha (výzva na údaje).
- BHT E321 (EFSA 2012), karagénan E407 (záver EFSA 2018), sukralóza-6-acetát (len tlačové správy), kyselina fosforečná v colách a kosti/obličky (iba slabé observačné štúdie), hyperaktivita u jednotlivých farbív mimo McCann 2007 – **NEOVERENÉ**, látky dostali predvolené hodnotenie.
- Sorbany: platí ADI 11 mg/kg/deň z roku 2019 (nie dočasná 3 mg/kg). Siričitany: ADI z 2016 bola v 2022 nepotvrdená (nedostatok údajov). 3-MCPD: TDI 0,8 µg/kg/deň z 2016 bola v 2018 revidovaná (číslo neuvádzame).
- ADI/TDI hodnoty sú zo súhrnov vyhľadávania; pri aspartáme (IARC 2B vs. JECFA ADI) a erytritole (EFSA 2023) je číselné ADI vynechané.

## Rozhodnutia
- **S1** Modul je v `src/skener/**`, vlastné CSS `skener.css`, história v `localStorage` kľúč `recepty-skener-v1` (nezasahuje do hlavného stavu). Zdroje sa pripájajú do zoznamu zdrojov appky cez `src/data/zdroje/skener.json` (ten zdroje.ts načíta globom).
- **S2** Hodnotenie `deti` je prísnejšie stupňovanie, ak sú v nastaveniach deti (farbivá s upozornením EÚ → „vyhnúť sa“, fosfáty, benzoany, sladidlá → „obmedziť“).
- **S3** Nerozpoznané zložky sa nepenalizujú (väčšinou ide o bežné suroviny); zjavný nezmysel z OCR sa označí „Skontroluj“.
- **S4** Pšeničná múka bez slova „celozrnná“ sa berie ako rafinovaná (zvyčajný prípad na obaloch v EÚ); je to označené ako odhad.
- **S5** Hlavný príznak „bez pridaného cukru“ neznamená, že výrobok je bez cukrov (môže byť ovocný cukor) — skóre pozerá len zloženie.
