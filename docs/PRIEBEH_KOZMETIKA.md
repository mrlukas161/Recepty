# Priebeh – skener kozmetiky

## 15.–16. 10. 2026

### 22:53 UTC – štart a test siete
Test z cloudu (curl cez proxy; WebFetch hlási „ENOTFOUND“ pre všetky domény):

| Doména | Výsledok |
|---|---|
| eur-lex.europa.eu | nedostupné (CONNECT 403) |
| ec.europa.eu | nedostupné (CONNECT 403) |
| health.ec.europa.eu | nedostupné (CONNECT 403) |
| world.openbeautyfacts.org | nedostupné (CONNECT 403) |
| Europe PMC (REST) | nedostupné (CONNECT 403) |
| PubMed, Crossref | nedostupné (CONNECT 403) |
| registry.npmjs.org | dostupné (200) |
| GitHub | dostupné |

**Dôsledok:** zadanie predpokladalo otvorenú sieť k EUR-Lex a pod., tá nie je. Predpisy a stanoviská SCCS sa overujú cez **WebSearch (úroveň `vyhladavanie`)** – existencia predpisu, hlavný záver a čísla len tam, kde ich výsledky uvádzali doslova. Originál nariadenia sme nečítali; úplná Príloha II (~1 700 zakázaných látok), CosIng a Open Beauty Facts v tomto behu nie sú dostupné → viď `docs/vyskum/KOZMETIKA.md`.

### 23:04 UTC – (a) databáza INCI, (b) parser, základ (c)
Hotové: generátor `scripts/kozmetika-data.mjs` → `src/kozmetika/data` (118 látok, 35 zdrojov, ~46 kB), parser INCI + skóre + úložisko + Open Beauty Facts + obrazovka (skenovanie, história, porovnanie, nastavenia), integrácia (trasa, Viac, odkaz zo skenera). 204 unit testov a build zelené. Ďalej: e2e (d), doladenie.

### 23:07 UTC – (d) e2e
4 e2e na 412×915: ručné vloženie (Viac → rozpad, detail zložky, nastavenia, história, porovnanie), syntetická etiketa → OCR (angličtina), kód so zmockovaným Open Beauty Facts + z uloženého po výpadku, offline reload (service worker). Všetko zelené.
