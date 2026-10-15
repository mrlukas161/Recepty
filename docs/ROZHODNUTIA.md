# Rozhodnutia

## R1 – Rešerš nebola možná, appka neobsahuje „overené“ zdroje (2026-10-15)
- **Čo:** sieť sandboxu blokuje PubMed, doi.org, WHO, IARC (proxy 403), WebFetch nevie otvoriť žiadnu doménu. Sub-agenti rešerše nevedeli otvoriť ani jeden primárny zdroj.
- **Rozhodnutie:** podľa CLAUDE.md („citácie nevymýšľaj; čo sa nedá overiť, do appky nejde“) appka **neuvádza žiadne zdroje ako overené**. Skóre zdravosti je výslovne označené ako **odhad / naša heuristika** inšpirovaná všeobecne známymi odporúčaniami (menej rafinovanej múky, cukru, spracovaného mäsa, viac vlákniny…), bez konkrétnych čísel z štúdií. Zoznam kandidátskych zdrojov zo zadania je v `docs/vyskum/NEOVERENE.md` ako úloha na doplnenie, nie v appke ako dôkaz.
- **Alternatíva:** napísať citácie z pamäte modelu – zamietnuté (riziko vymyslených údajov).
- **Dopad:** vedomostné karty majú úroveň „odhad / prax“ a odkaz, že zdroj čaká na overenie. Po sprístupnení siete treba rešerš zopakovať.

## R2 – Nutričné hodnoty surovín sú odhady
USDA/Ciqual nie sú dostupné → všetky hodnoty `odhad: true` (typické hodnoty z bežných tabuliek, zaokrúhlené), appka to zobrazí.
