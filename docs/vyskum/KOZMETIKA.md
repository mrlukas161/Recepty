# Skener kozmetiky – metodika, zdroje, rozhodnutia

Vlastná metodika (nie INCI Beauty, Yuka ani Codecheck – hodnotenia iných aplikácií nepreberáme). Nie je to lekárska rada.

## Čo skóre hovorí
- Skóre 0–100 je **naša heuristika**: začína na 100 a odpočítava body za **prítomnosť** látky v zozname INCI. Koncentrácie na obale nie sú → **nevieme dávku**; látka povolená s limitom môže byť v bezpečnom množstve aj mimo neho.
- Odpočty: zakázaná látka 40 (strop 80) · diskutovaná 6 · pozor (alergén vône, dráždivá zložka) 3 · povolená s limitom 1 · bežná 0. Stropy podľa kategórie (obmedzené 24, alergény 18, dráždivé 12, konzervanty 16, UV 12, mikročastice 10). Osobné nastavenia (citlivá pokožka +4, alergia na vône +6 / parfum 20, tehotenstvo 20, deti +8; spolu max. 40). Váhy sú odhad, zdroje podporujú len **zaradenie** látky.
- Pásma ako v receptoch: Výborné ≥ 80 · Dobré ≥ 60 · Občas ≥ 40 · Zriedka. Ak rozpoznáme < 40 % zložiek alebo je zoznam veľmi krátky, skóre sa zastropuje na 79 a označí „orientačne“.
- Zložky za „may contain“ / „+/-“ do skóre nepočítame.

## Úroveň overenia (CLAUDE.md)
**Sieť (test 15. 10. 2026 22:53 UTC):** EUR-Lex, ec.europa.eu, health.ec.europa.eu, Open Beauty Facts, Europe PMC, PubMed, Crossref → CONNECT 403 / ENOTFOUND. Dostupné len GitHub a npm. Zadanie počítalo s otvorenou sieťou; nie je.
- Všetky overené tvrdenia sú na úrovni **`vyhladavanie`**: existencia predpisu/stanoviska a hlavný záver z ≥ 2 výsledkov WebSearch; číslo (limit) sa v appke objaví **len ak ho výsledky uvádzali doslova**. Originál nariadenia sme nečítali.
- Tvrdenia bez takého potvrdenia majú úroveň **`odhad`** (v appke „odhad / prax, nie dôkaz“) a číselný limit nemajú (kontrola v `tests/kozmetika2.test.ts`: číslo bez `vyhladavanie` neprejde).

## Čo je v databáze a čo nie
`src/kozmetika/data/latky.json` (generované `node scripts/kozmetika-data.mjs`, zdroj údajov je v tom skripte; test kontroluje, že súbory sedia). ~118 látok:
- zakázané (Príloha II): formaldehyd, Lilial – **nie je to úplná Príloha II** (~1 700 látok; bez prístupu k EUR-Lex ju nemáme čo overiť). Appka to hovorí: „nenájdené“ ≠ „povolené“.
- konzervanty (Príloha V): MIT, MCI, fenoxyetanol, parabény, benzylalkohol, chlórfenezín, kyselina salicylová, triklosán, uvoľňovače formaldehydu (DMDM hydantoín, imidazolidinyl-/diazolidinylurea, quaternium-15, hydroxymetylglycinát, bronopol), benzoany, sorbany, DHA (s limitmi z Prílohy V).
- UV filtre (Príloha VI): oktokrylén, benzofenón-3, homosalát, TiO2 (s číslami), zinok oxid (25 %) a bežné chemické filtre (bez čísel).
- siloxany D4/D5/D6, mikročastice (polyetylén, nylón, PMMA …), parfum a 23 vonných alergénov (Príloha III), retinoidy (Príloha III, 2024/996), dráždivé zložky (SLS, SLES, denat. alkohol, propylénglykol, kokamidopropylbetaín, lanolín – posledné štyri iba ako odhad/prax), farbivá CI a ~35 bežných zložiek len s funkciou.
- Funkcie sú **naše zhrnutie** funkčných kategórií CosIng. Databáza CosIng (Európska komisia) nebola dostupná, **nič z nej sa nekopíruje**; podmienky použitia CosIng sme nemohli prečítať. Po otvorení siete: stiahnuť CosIng, preveriť podmienky opakovaného použitia a doplniť funkcie a synonymá.

## Overené vyhľadávaním (15. 10. 2026) – zhrnutie a nezrovnalosti
| Téma | Zistenie | Pozn. |
|---|---|---|
| Parabény | nar. 1004/2014; Príloha V: 0,4 % jeden ester, 0,8 % zmes; propyl+butyl spolu 0,14 % (ako kyselina); zákaz v nezmývateľných výrobkoch pre deti do 3 r. v oblasti plienok | prepis z legislation.gov.uk + umwelt-online |
| MIT | nezmývateľné: zakázaný (nar. 2016/1198, prechod do 2/2017); zmývateľné 15 ppm (nar. 2017/1224) | |
| Fenoxyetanol | SCCS/1575/16: bezpečný do 1,0 % aj pre deti (MoS ≈ 50); ANSM 2012: 0,4 % do 3 r. a nie plienky | dátum prijatia stanoviska sa líši medzi zdrojmi (marec/október 2016) – dátum neuvádzame |
| Oktokrylén | SCCS/1627/21: 10 %, v aerosóle 9 % pri spoločnom použití; nar. 2022/1176 | |
| Benzofenón-3 | 6 % / 2,2 % / 0,5 % podľa typu výrobku (nar. 2022/1176) | číslo z jedného súhrnu (Ceway) + stránka predpisu; databáza CosIng ukazuje neskoršiu zmenu (7/2024) – overiť v origináli |
| Homosalát | SCCS 2021: 0,5 % (jún), 7,34 % (dec.); nar. 2022/2195: 7,34 % na tvár, nie aerosól; 1. 1. 2025 / 1. 7. 2025 | zdroje sa líšia v znení výnimky pre spreje |
| D4/D5/D6 | REACH príl. XVII pol. 70, nar. 2024/1328; 0,1 %; dátumy 31. 1. 2020 / 6. 6. 2026 / 6. 6. 2027 | zdroje sa líšia v priradení dátumov |
| TiO2 | nar. 2021/850: Príloha III (vdýchnutie, prášky a spreje), UV filter ≤ 25 % | čísla pre prášky a spreje (1,4 %, 25 %…) z jedného súhrnu – neuvádzame |
| Lilial | nar. 2021/1902 → Príloha II; od 1. 3. 2022 mimo trhu | |
| Alergény | 26 pôvodných (príloha III, pol. 67–92); 0,001 % / 0,01 %; nar. 2023/1545: rozšírenie na ~80 látok; 31. 7. 2026 / 31. 7. 2028 | počty (81/82) sa líšia podľa zdroja |
| Retinol | nar. 2024/996: 0,3 % RE, telové mlieka 0,05 % RE, upozornenie „Contains vitamin A…“ | dátumy uplatnenia sa líšia (11/2025, 2027) |
| Formaldehyd | Príloha II od 2019; uvoľňovače povolené (DMDM hydantoín pol. 33) | prah označovania „uvoľňuje formaldehyd“ – finálne znenie nepotvrdené, neuvádzame |
| Mikroplasty | nar. 2023/2055; kozmetika s prechodným obdobím 4–12 r. | presné dátumy pre kozmetiku nepotvrdené, neuvádzame |
| Benzoany, sorbany, DHA | benzoová kyselina/benzoan sodný: 0,5 % nezmývateľné, 2,5 % zmývateľné, 1,7 % ústne (ako kyselina); sorbany a DHA 0,6 % | z prepisu Prílohy V a SCCP; zdroje v 1 prípade sekundárne |
| Oxid zinočnatý | nar. 2016/621: 25 % nano aj nenano, okrem rizika vdýchnutia | |
| Triklosán / triklokarbán | len návrh zmien (WTO 2023); prijatie a podmienky nepotvrdené → v appke bez čísel | pôvodne sme ho viazali na 2024/996 – opravené |
| SLS | EMA: podráždenie pri dlhšej aplikácii; CIR 1983 (laureth sulfáty) | spotrebiteľské blogy nepoužité |

**Vyvrátené / nepoužité:** formaldehyd „Príloha V pol. 5 0,2 %“ (zastarané), regulácia „2024/996“ pre lilial (nesedí – lilial je 2021/1902), „2022/1181 ako zmena Prílohy IV“ (v skutočnosti zmena preambuly Prílohy V), 2022/1176 pre homosalát (správne je 2022/2195).
**Bez overenia, preto v appke len ako „odhad“ bez čísla:** chemické UV filtre (avobenzón, oktinoxát …), farbivá CI (okrem opisu), SLS-podobné tenzidy, propylénglykol, lanolín, denat. alkohol.

## Rozhodnutia
- **K1** Modul `src/kozmetika/**`, trasa `#/kozmetika`, vlastné kľúče localStorage (`recepty-kozmetika-nastavenia-v1`, `-historia-v1`, `-obf-v1`); nezasahuje do stavu receptov ani do skenera potravín. Importuje len OCR (`ocr.ts`, `obrazok.ts`, `kod.ts`, `off.ts` → `platnyKod`). Jediná zmena mimo modulu v skeneri: typ `JazykOcr` rozšírený o `'eng'` (jazykové dáta `eng` už v appke sú).
- **K2** OCR kozmetiky: angličtina, **bez** slovníkovej opravy potravinových slov (poškodila by latinské názvy); opravu robí parser INCI (Levenshtein, jednoznačná zhoda, zámeny l/1, 0/O, rn/m). Druhý prechod OCR je vypnutý (jeho miera kvality je slovenská).
- **K3** Nenájdená zložka sa nepenalizuje (väčšinou ide o rastlinné extrakty), len zníži spoľahlivosť.
- **K4** „Hranica 1 %“: EÚ radí zložky nad 1 % zostupne; hranicu odhadujeme podľa prvej látky s overeným stropom ≤ 1 % (označené ako odhad).
- **K5** Zakázaná látka vo výrobku môže byť aj chyba OCR – appka vedie k prepisu podľa obalu.
- **K6** Zdroje kozmetiky sú v `src/kozmetika/data/`, nie v `src/data/zdroje/` (tam pracuje paralelný agent).
- **K7** Otvorené Open Beauty Facts: API v2 rovnakého tvaru ako Open Food Facts; mapovanie je pokryté testom na zmockovanú odpoveď, živú odpoveď sme overiť nemohli (sieť zatvorená).
