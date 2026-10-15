# Priebeh – skener zloženia

| Čas (UTC) | Stav | Čo |
|---|---|---|
| 2026-10-15 00:26 | beží | Štart skener agenta. Sieť: doi.org blokované (000), GitHub a npm OK. Stiahnutá taxonómia aditív OFF (727 E-čísel), rešerš hodnotení cez WebSearch (sub-agent). |
| 2026-10-15 00:40 | beží | Hotové (a): parser zloženia, databáza aditív (OFF + naše hodnotenia so zdrojmi), zložky, alergény, skóre, unit testy; obrazovka s ručným vložením textu, história a porovnanie. Ďalej: build, push, potom OCR. |
| 2026-10-15 00:40 | beží | Hotové (c): OCR Tesseract.js offline (slk/ces/eng v /ocr/, SW cache), úprava fotky (orez, otočenie, kontrast, čiernobiela), oprava textu; e2e so syntetickou etiketou prešiel. Ďalej: push, potom čiarový kód + OFF, lepšia voľba. |
| 2026-10-15 00:45 | beží | Hotové (d): čiarový kód (BarcodeDetector/ZXing, ručne) + Open Food Facts (online), história, porovnanie dvoch výrobkov, lepšia voľba (tipy + domáce recepty); e2e s mockom OFF. Ďalej: vizuálna kontrola, doladenie parsera na reálnych etiketách, ranný prehľad.
| 2026-10-15 00:48 | hotovo | Skener hotový: parser, DB aditív (OFF, ODbL), hodnotenia so zdrojmi, skóre, OCR offline, čiarový kód + OFF, história, porovnanie, lepšia voľba; ranný prehľad doplnený; e2e (4) a unit testy zelené, nasadenie cez workflow. |
| 2026-10-15 08:35 | beží | Nový beh (zadávateľ: „všetky návrhy aplikuj a oprav“). Hotová (a): oprava čiarového kódu – OFF text sk→cs→en→originál s jazykom, E-čísla/alergény/cukor/palmový olej z tagov, nízka spoľahlivosť, prísnejšie výživové prahy (UK FoP), fixtúra Nutella, unit + e2e. Ďalej: (b) offline cache výrobkov. |
| 2026-10-15 08:36 | beží | Hotová (b): lokálna zásoba výrobkov podľa kódu (localStorage, limit 300, „Uložené DD.MM.RRRR“, rozhranie importujPredstih pre neskorší beh), unit + e2e. Ďalej: (c) alergény pre diétu. |
| 2026-10-15 08:40 | beží | Hotová (c): upozornenia pre diétu Bezlepková a Bez laktózy a alergie (lepok, mlieko) so zdrojmi (EÚ 828/2014, 1169/2011 príl. II, AOECS), unit + e2e. Ďalej: (d) nákup z histórie. |
| 2026-10-15 08:41 | beží | Hotová (d): v histórii tlačidlá „Do nákupu“ a značka „Kupujem“ s filtrom (migrácia tvaru záznamov + test), recept z „lepšej voľby“ do nákupu, unit + e2e. Ďalej: (e) čistenie OCR. |
