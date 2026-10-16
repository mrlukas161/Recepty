# Priebeh – overenie zdrojov v origináli a výživové tabuľky

- 22:53 UTC (15.10.2026) – **sieť zatvorená.** Test (curl, 15 s): PubMed, E-utilities, Europe PMC, Crossref, doi.org, WHO, EFSA, EUR-Lex, USDA FDC, Ciqual aj Open Food Facts → HTTP 000; proxy cloudu odmieta tunel (CONNECT 403). Úlohy 3–5 sa nedali spustiť; zdroje ostávajú na úrovni `vyhladavanie`. Nič v appke sa nezmenilo.
- 13:56 UTC (16.10.2026) – vetva data-zdroje prečítaná (USDA 8 229, Ciqual 3 484 položiek). Pripravený kód: prekrytie údajov surovín z src/data/vyziva-tabulky.json, zdroj v detaile receptu a karty USDA/Ciqual v zdrojoch; skript scripts/vyziva-zostav.mjs. Mapovanie surovín beží cez sub-agentov.
- 14:03 UTC – Bod 1 hotový: 287 z 298 surovín má hodnoty z tabuliek (249 Ciqual, 38 USDA), 11 ostalo odhadom; pásma skóre pred 65/100/18/14 → po 62/104/17/14 (Výborné/Dobré/Občas/Zriedka), bez prekalibrácie. Mapovanie v docs/vyskum/VYZIVA.md.
- 15:37 UTC – Bod 2: súbor off/sk-vyrobky.jsonl.gz sa vo vetve data-zdroje neobjavil ani po 90 min kontrol (každých 5 min, do 15:37). Kód (loader, skript, test) je hotový, dáta nie. Bod 3: ranný prehľad doplnený. Stav: hotovo (bod 2 s dôvodom nedokončený).
