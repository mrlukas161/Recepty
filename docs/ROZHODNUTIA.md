# Rozhodnutia

## R1 – Rešerš nebola možná, appka neobsahuje „overené“ zdroje (2026-10-15)
- **Čo:** sieť sandboxu blokuje PubMed, doi.org, WHO, IARC (proxy 403), WebFetch nevie otvoriť žiadnu doménu. Sub-agenti rešerše nevedeli otvoriť ani jeden primárny zdroj.
- **Rozhodnutie:** podľa CLAUDE.md („citácie nevymýšľaj; čo sa nedá overiť, do appky nejde“) appka **neuvádza žiadne zdroje ako overené**. Skóre zdravosti je výslovne označené ako **odhad / naša heuristika** inšpirovaná všeobecne známymi odporúčaniami (menej rafinovanej múky, cukru, spracovaného mäsa, viac vlákniny…), bez konkrétnych čísel z štúdií. Zoznam kandidátskych zdrojov zo zadania je v `docs/vyskum/NEOVERENE.md` ako úloha na doplnenie, nie v appke ako dôkaz.
- **Alternatíva:** napísať citácie z pamäte modelu – zamietnuté (riziko vymyslených údajov).
- **Dopad:** vedomostné karty majú úroveň „odhad / prax“ a odkaz, že zdroj čaká na overenie. Po sprístupnení siete treba rešerš zopakovať.

## R2 – Nutričné hodnoty surovín sú odhady
USDA/Ciqual nie sú dostupné → všetky hodnoty `odhad: true` (typické hodnoty z bežných tabuliek, zaokrúhlené), appka to zobrazí.

## R1b – Úprava R1 podľa nových pravidiel (15.10.2026)
CLAUDE.md zaviedol úrovne overenia `original` / `vyhladavanie` / `neoverene`. Rešerš sa preto zopakovala cez WebSearch (≥2 nezávislé potvrdenia na zdroj, čísla len ak sú vo výsledkoch doslova). Zdroje v appke nesú označenie „overené vyhľadávaním, originál nečítaný“. Váhy skóre a prahy ostávajú naším odhadom (zdroje podporujú smer, nie presné čísla).

## R3 – Kalibrácia skóre
Surové vážené skóre sa zhlukovalo v pásme 70–90, preto sa pred zobrazením lineárne roztiahlo (`58 + (x − 66) × 1,3`, orezané na 0–100). Poradie receptov sa nemení; klasiky s múkou, cukrom a vyprážaním vychádzajú v pásme „občas/zriedka“.

## R4 – Ovos a lepok
Ovos je v databáze označený ako `lepok` (riziko krížovej kontaminácie, EÚ ho radí k obilninám s lepkom). Bezlepková diéta preto vylúči aj ovsené recepty – je to opatrná voľba pre celiakiu.

## R5 – Skener zloženia
Stavia samostatný agent v `src/skener/**`; hlavná appka má len trasu `#/skener` a položku v menu (`src/skener-vstup.tsx` načíta `src/skener/index.tsx`, export `Skener`).
