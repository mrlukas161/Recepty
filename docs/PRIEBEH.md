# Priebeh

| Čas (UTC) | Kto | Stav | Čo |
|---|---|---|---|
| 2026-10-15 00:03 | príprava (lokálny Claude) | hotové | Repo, GitHub Pages (workflow `nasadenie.yml`), zadanie `docs/ZADANIE.md`, pravidlá `CLAUDE.md`. Ďalej: cloud agent stavia appku. |
| 2026-10-15 00:09 | cloud agent | beží | Štart cloud behu: overenie pushu, ďalej fáza 1 (MVP) a paralelná rešerš. |
| 2026-10-15 00:25 | cloud agent | beží | Rešerš zlyhala: sieť blokuje PubMed/DOI (403 CONNECT). Žiadne citácie sa nevymýšľajú → appka ide bez overených zdrojov, skóre označené ako odhad. Pokračujem MVP. |
| 2026-10-15 00:22 | cloud agent | beží | Fáza 1–3 (základ): appka, ~177 receptov, 298 surovín, skóre, jedálniček, nákup, ruleta, diéty, náhrady; testy zelené. Nasadzujem MVP. Ďalej: e2e, vizuálna kontrola, kontrola kvality receptov. |
| 2026-10-15 00:50 | cloud agent | beží | Fáza 1–3 nasadené (CI zelené, behy 5–9 úspešné); e2e (Playwright, 412×915) prechádza; rešerš cez WebSearch (43 zdrojov, úroveň „vyhľadávanie“) integrovaná; prebieha adversariálne overenie zdrojov, kontrola surovín a UX. Živú adresu z cloudu nejde otvoriť (proxy blokuje github.io) – nasadenie overujem cez GitHub Actions. |
