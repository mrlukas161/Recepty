# Dáta pre appku Recepty (vetva `data-zdroje`)

Táto vetva **nie je appka** a nenasadzuje sa (workflow `nasadenie.yml` beží len pre `main` a `claude/**`).
Sú v nej verejné dátové tabuľky, ktoré 16.10.2026 stiahol počítač zadávateľa, lebo cloud agent má sieť len na GitHub a npm.
Cloud agent si ich vezme príkazom `git fetch origin data-zdroje` (napr. `git show origin/data-zdroje:usda/usda_vyziva.csv`)
a do `main` dáva len spracované, kompaktné údaje so zdrojom pri každej hodnote.

| Súbor | Čo obsahuje | Zdroj a licencia |
|---|---|---|
| `usda/usda_vyziva.csv` | 8 229 potravín – SR Legacy (2018-04) a Foundation Foods (2025-12-18): energia v kcal (pri Foundation aj Atwater), bielkoviny, tuky, nasýtené mastné kyseliny, sacharidy, cukry, vláknina, sodík (mg) a vypočítaná soľ (g = sodík × 2,5 / 1000); všetko na 100 g | U.S. Department of Agriculture, Agricultural Research Service. FoodData Central. CC0 1.0 (verejné vlastníctvo) |
| `ciqual/ciqual_vyziva.csv` | 3 484 potravín Ciqual 2025 (francúzsky a anglický názov, skupina): energia v kcal podľa nariadenia (EÚ) 1169/2011, bielkoviny (N × Jonesov faktor), sacharidy, tuky, cukry, vláknina, nasýtené mastné kyseliny, soľ, sodík; hodnoty ako v tabuľke (desatinná čiarka, „< 0,5“, „traces“, „-“); na 100 g | Anses. Table de composition nutritionnelle des aliments Ciqual 2025. doi:10.57745/RDMHWY. Licence Ouverte / Open Licence 2.0 (Etalab) |
| `ciqual/Table Ciqual 2025_FR_2025_11_03.xlsx` | originálna tabuľka Ciqual 2025 (všetky zložky) | ako vyššie |
| `off/sk-vyrobky.jsonl.gz` | 3 686 výrobkov z Open Food Facts s krajinou predaja Slovensko (zoznam kódov zo search.openfoodfacts.org, podrobnosti z `/api/v2/product/{kód}.json`, stiahnuté 16.10.2026; polia ako pri `src/skener/off.ts`, živiny na 100 g, bez obrázkov). Zloženie v niektorom jazyku má 1 234 výrobkov (slovensky 411, česky 376), `ingredients_tags` 1 228, výživové hodnoty 2 294 | Open Food Facts, Open Database License (ODbL) 1.0 – v appke uviesť zdroj a licenciu |
| `skripty/recepty_data_github.py` | skript, ktorým dáta vznikli (stiahnutie a výber stĺpcov) | – |

Každý priečinok má `zdroj.json` s adresou, verziou, dátumom stiahnutia a SHA-256 súborov.

**Pravidlá použitia v appke:** pri každej prevzatej hodnote uveď zdroj (FDC ID alebo kód Ciqual) a v appke uveď citáciu a licenciu
zdroja. Hodnoty „traces“ a „< x“ z Ciqualu nie sú presné čísla – v appke ich označ ako približné.
