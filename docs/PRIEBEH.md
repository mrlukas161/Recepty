# Priebeh

| Čas (UTC) | Kto | Stav | Čo |
|---|---|---|---|
| 2026-10-15 00:03 | príprava (lokálny Claude) | hotové | Repo, GitHub Pages (workflow `nasadenie.yml`), zadanie `docs/ZADANIE.md`, pravidlá `CLAUDE.md`. Ďalej: cloud agent stavia appku. |
| 2026-10-15 00:09 | cloud agent | beží | Štart cloud behu: overenie pushu, ďalej fáza 1 (MVP) a paralelná rešerš. |
| 2026-10-15 00:25 | cloud agent | beží | Rešerš zlyhala: sieť blokuje PubMed/DOI (403 CONNECT). Žiadne citácie sa nevymýšľajú → appka ide bez overených zdrojov, skóre označené ako odhad. Pokračujem MVP. |
| 2026-10-15 00:22 | cloud agent | beží | Fáza 1–3 (základ): appka, ~177 receptov, 298 surovín, skóre, jedálniček, nákup, ruleta, diéty, náhrady; testy zelené. Nasadzujem MVP. Ďalej: e2e, vizuálna kontrola, kontrola kvality receptov. |
| 2026-10-15 00:50 | cloud agent | beží | Fáza 1–3 nasadené (CI zelené, behy 5–9 úspešné); e2e (Playwright, 412×915) prechádza; rešerš cez WebSearch (43 zdrojov, úroveň „vyhľadávanie“) integrovaná; prebieha adversariálne overenie zdrojov, kontrola surovín a UX. Živú adresu z cloudu nejde otvoriť (proxy blokuje github.io) – nasadenie overujem cez GitHub Actions. |
| 2026-10-15 01:15 | cloud agent | beží | Adversariálne overenie zdrojov (32 opráv/zjemnení, vyvrátené priradenia odstránené – docs/vyskum/OVERENIE.md), kontrola surovín (~58 opráv), kontrola receptov (~115 opráv), UX test → opravy (diéta v zozname, prázdne stavy, kontrast, dotykové plochy, popisky). e2e zelené. |
| 2026-10-15 01:00 | cloud agent | hotovo | Appka nasadená (CI zelené, behy 14–15), 197 receptov, 298 surovín, 43 zdrojov (overené vyhľadávaním), e2e + 59 unit testov zelených, skener integrovaný. Pozri docs/RANNY_PREHLAD.md. Živú adresu z cloudu nejde otvoriť (proxy) – ráno over version.json. |
| 2026-10-15 03:40 | kontrolný beh | hotovo | Oba agenti mali stav „hotovo“. Sieť stále zatvorená (doi.org, github.io blokované) → zdroje ostávajú na úrovni `vyhladavanie`. Over HEAD a5c4501: `npm test` 68/68, `npm run build` OK, `npm run e2e` 5/5 (viewport 412×915, vrátane OCR syntetickej etikety a offline), workflow „Nasadenie“ (beh 20) úspešný. Živú adresu z cloudu nejde otvoriť (proxy) – ráno porovnaj `version.json` s commitom a5c4501 (alebo novším). Kód sa nemenil. |
| 2026-10-15 08:32 | cloud agent (appka) | beží | Ranný blok návrhov: štart 4 sub-agentov (a+d+e SW/úpravy/časovač, b+c+f nákup/voliteľné/plánovač, g vlastné recepty, i ilustrácie+ikona); h (prenos) po g. Sieť stále zatvorená (doi.org 000). |
