# Ranný prehľad – Recepty

**Appka:** https://mrlukas161.github.io/Recepty/ (verzia v Nastaveniach → „O appke“; `…/version.json` = posledný nasadený commit)

## Inštalácia na Android (Xiaomi 15) v 3 krokoch
1. Otvor odkaz v **Chrome**.
2. ⋮ (menu) → **Inštalovať aplikáciu** / **Pridať na plochu**.
3. Spusti ikonu „Recepty“ – funguje aj offline. (Na celú obrazovku: Nastavenia → „Na celú obrazovku“.) iPhone: Safari → Zdieľať → *Pridať na plochu*.

## Čo appka vie
- **Dnes:** podľa dennej doby návrhy raňajok/obeda/večere zoradené podľa skóre a tvojich preferencií, „Iné návrhy“, stav týždňa (koľkokrát múka, cukor… z limitu).
- **Recepty (197):** raňajky, obedy, večere, polievky, desiaty, dezerty; vyhľadávanie (bez diakritiky), filtre (typ, čas, náročnosť, diéta, detské, „mám doma“, bez vylúčených), zoradenie. 17 klasických múčnych/ťažkých jedál (halušky, rezeň, palacinky…) ako referencia s odkazom na lepšie verzie.
- **Detail:** skóre 0–100 s rozpadom na 10 faktorov (prečo + zdroje), prínosy a slabé stránky, suroviny prepočítané na domácnosť („bez tohto to nejde“ / voliteľné), **úpravy** (vynechať, vymeniť, pridať) s živým prepočtom skóre, režim varenia (veľké písmo, Wake Lock), obľúbené, 👍/👎, „Uvarené“.
- **Jedálniček:** týždeň (raňajky/desiata/obed/večera podľa nastavenia), rešpektuje alergie, vylúčenia, diétu, limity (múka, cukor, údeniny, vyprážané, ťažké), neopakuje recepty, striedá bielkoviny, ryby 1–2×; zamknúť/vymeniť/pregenerovať; súhrn týždňa.
- **Nákup:** z jedálnička alebo receptov, zlúčené množstvá, podľa oddelení obchodu, odškrtávanie, vlastné položky, „mám doma“, zdieľanie.
- **Ruleta**, **Náhrady** (múka, cukor, údeniny, vyprážané, smotana + „Chuť na…?“), **Diéty (14)** s popisom a „Použiť“, **Vedomosti** (14 kariet + zoznam zdrojov), **Nastavenia** (domácnosť, obmedzenia 3-stupňové, alergie, nejem, vybavenie, téma, export/import JSON, reset).
- **Skener zloženia** (Viac → Skener zloženia): staval samostatný agent, pozri `docs/PRIEBEH_SKENER.md` a `docs/vyskum/SKENER.md`.
- Offline PWA, bez backendu, bez kľúčov, dáta len v telefóne.

## Čo je overené a čo odhad
- **Overené vyhľadávaním (originál nečítaný):** 43 zdrojov v `src/data/zdroje/*.json`, adversariálne prekontrolovaných druhým agentom (`docs/vyskum/OVERENIE.md`; nepotvrdené čísla vyradené, nesprávne priradenia zdrojov odstránené). V appke majú viditeľné označenie.
- **Odhad / prax:** váhy a prahy skóre (`docs/vyskum/SKORE.md`), zaradenie surovín (zápal, NOVA, GI), **všetky nutričné hodnoty surovín** (typické hodnoty, USDA/Ciqual nedostupné), recepty (vlastné slová, 2 kontroly agentmi, ale **nik ich neuvaril** – prosím rodinná skúška).
- Nie je to lekárska rada – upozornenie je v appke.

## Čo chýba a prečo
- **Originály zdrojov** nie sú prečítané – sandbox blokuje PubMed/DOI/WHO (iba WebSearch). Po otvorení siete zopakovať rešerš na úroveň `original`.
- Nutričné hodnoty bez tabuliek (USDA/Ciqual) → všetky `odhad: true`.
- Živá adresa sa z cloudu nedá otvoriť (proxy blokuje github.io); nasadenie som overoval cez GitHub Actions (behy úspešné). **Ráno otvor `version.json` a porovnaj s commitom.**
- Plánovač nerieši zvyšky (večera → obed) ani rozdielny čas cez týždeň len približne; nákup nepozná balenia.
- Ilustrácie sú emoji; vlastné SVG chýbajú. Ikona appky je jednoduchá.
- e2e testy bežia na Chromium (nie na reálnom Xiaomi/iPhone).

## Novinky 15.10. – skener
**Čo sa zmenilo** (na základe tvojho „všetky návrhy aplikuj a oprav“; podrobnosti a rozhodnutia S7–S14 v `docs/vyskum/SKENER.md`):
- **Oprava chyby čiarového kódu (Nutella 3017620422003).** Appka mala len francúzsky text → 8 z 9 zložiek „nerozpoznaných“ a skóre 81 „Výborné“. Teraz: text sk → cs → en → originál (appka ukáže jazyk), E-čísla, alergény, stopy, pridaný cukor a palmový olej sa dopĺňajú aj zo štruktúrovaných údajov OFF, bez duplicít. Nutella vychádza v pásme „Zriedka“ (E322 rozpoznané, slabé stránky: cukor, palmový olej, vysoký obsah cukrov a nasýtených tukov).
- **Nízka spoľahlivosť:** keď je nerozpoznaných nad ~30 % zložiek alebo niektorá z prvých troch, ukáže sa „Nízka spoľahlivosť – skontroluj zloženie“, skóre sa zastropuje na „Občas“ (nikdy „Dobré“/„Výborné“) a pri ručnom texte je tlačidlo „Opraviť zloženie“.
- **Prísnejšie výživové hodnoty:** prahy „vysoký obsah“ z britského farebného značenia (cukry > 22,5 g, nasýtené tuky > 5 g, soľ > 1,5 g na 100 g; zdroj úrovne „overené vyhľadávaním“), váha faktora dvojnásobná a berie sa aj najhoršia živina.
- **Offline zásoba výrobkov:** výrobok nájdený podľa kódu sa uloží v mobile (limit 300) a nájde sa aj bez internetu s označením „Uložené DD.MM.RRRR“. Rozhranie na predstihnutý výber slovenských výrobkov (`importujPredstih`) je pripravené, **dáta nie** – spraví neskorší beh po otvorení siete.
- **Diéta a alergény:** pri diéte Bezlepková / Bez laktózy a pri alergiách na lepok a mlieko sú dôkladnejšie upozornenia (pšenica, raž, jačmeň, špalda, kamut, ovos s rizikom krížovej kontaminácie, slad, stopy lepku; mlieko, srvátka, mliečna bielkovina, laktóza, smotana, maslo, syry s poznámkou o vyzretých syroch) so zdrojom a úrovňou dôkazov. Poznámky o syroch a masle sú označené „prax, nie dôkaz“ (zdroje sa v číslach rozchádzali o rády).
- **Nákup z histórie:** v histórii „Do nákupu“ (pridá výrobok medzi vlastné položky) a značka „Kupujem“ s filtrom; domáci recept z „lepšej voľby“ ide tlačidlom do nákupu. Staré záznamy histórie sa načítajú bez straty (migrácia + test).
- **Lepšie čistenie OCR:** slovníková oprava preklepov a diakritiky (zoznam opráv sa ukáže na kontrolu), spájanie slov rozdelených na konci riadka, voliteľný druhý prechod OCR s orezom na pás textu pri slabom výsledku.

**Ako to vyskúšať:** (1) Viac → Skener zloženia → zadaj kód `3017620422003` → výsledok má byť „Zriedka“ a zloženie v angličtine. (2) V Nastaveniach zapni diétu Bezlepková alebo Bez laktózy a vlož zloženie s ovsom, mliekom, syrom → karta „Tvoja diéta a alergie“. (3) Nájdi ktorýkoľvek výrobok podľa kódu, vypni internet a hľadaj ho znova → „Uložené …“. (4) V histórii ťukni „☆ Kupujem“ a „🛒 Do nákupu“, potom skontroluj Nákup. (5) Odfoť zložený zoznam zložiek so zalomením riadkov a pozri riadok „Slovník opravil …“.

**Čo ostáva:** predstihnutý balík slovenských výrobkov z OFF (čaká na otvorenú sieť; OFF z cloudu nejde); overenie nových zdrojov (`uk-fop-2016`, `eu-828-2014`, `eu-1169-2011-ii`, `aoecs-pal`) v origináli; prahy 30 % nerozpoznaných a slovníkové prahy opráv sú naše odhady – po ostrej skúške na reálnych obaloch treba doladiť; dôkladné upozornenia sú podľa slov v zložení (neviažu sa na kód alergénu pri ručnom texte); skener neposudzuje kozmetiku (INCI) – bude samostatný beh. Nič z (a)–(e) som nevynechal.

## Skener zloženia
**Kde:** Viac → Skener zloženia (`#/skener`).
**Ako ho použiť:** (1) odfoť zoznam zložiek na obale (zblízka, rovno, pri svetle) → v náhľade môžeš fotku otočiť, orezať, zvýšiť kontrast alebo dať čiernobielu → „Rozpoznať text“ (OCR beží v mobile, offline po prvom použití; prvýkrát sa stiahnu jazykové dáta z appky) → rozpoznaný text **oprav** v políčku → „Vyhodnotiť“. (2) Alebo zloženie vlož/napíš ručne. (3) Alebo zadaj/odfoť **čiarový kód** (online; raz nájdené výrobky sú potom aj offline): z Open Food Facts sa načíta názov, zloženie (sk → cs → en → originál, s jazykom), výživové hodnoty, Nutri-Score a NOVA a štruktúrované údaje (E-čísla, alergény, pridaný cukor, palmový olej).
**Čo vie:** rozbor zloženia (zátvorky, percentá, poradie = množstvo, E-čísla v tvaroch E330/E 330/E-330, slovné názvy, opravy preklepov z OCR, 14 alergénov a „môže obsahovať stopy“) · skóre 0–100 s rozpadom na faktory (spracovanosť, prídavné látky, cukor, tuky a soľ, kvalita zloženia, tvoje nastavenia, výživové hodnoty ak sú) · ťuknutím na zložku dôvod, zdroj a úroveň dôkazov · osobné upozornenia podľa Nastavení (alergie, diéta bezlepková / bez laktózy, obmedzená múka/cukor/údeniny, deti) · hodnotenie „nízka spoľahlivosť“ pri nerozpoznanom zložení · **lepšia voľba** (podľa čoho vybrať + domáce recepty z appky) · história skenov (len v mobile) so značkou „Kupujem“ a tlačidlom „Do nákupu“ · porovnanie dvoch výrobkov. Fotky sa nikam neposielajú; jediný sieťový dopyt je voliteľný Open Food Facts podľa kódu.
**Čo je overené a na akej úrovni:** databáza prídavných látok = taxonómia aditív Open Food Facts (727 E-čísel, slovenské názvy, licencia ODbL). Naše hodnotenia 187 položiek databázy (vrátane skupín, napr. modifikované škroby E1404–E1452) majú dôvod a zdroj; zdroje (27) sú na úrovni **„overené vyhľadávaním, originál nečítaný“** (doi.org/PubMed/EFSA sú zo sandboxu neprístupné). Preventívne obavy (TiO2, emulgátory CMC/polysorbát, sladidlá podľa WHO 2023, erytritol) sú označené ako preventívne so slabými dôkazmi; látky bez vlastného posúdenia majú „predvolené hodnotenie (odhad)“. Neoverené do appky nešli: EDTA E385, BHT E321, karagénan, sukralóza-6-acetát, kyselina fosforečná v colách (pozri `docs/vyskum/SKENER.md`, sekcia „Čo overenie vyvrátilo“). Skóre výrobku je **naša heuristika** (váhy a prahy sú odhad).
**Obmedzenia OCR:** funguje najlepšie na rovnom, ostrom, kontrastnom tlači; slovníková oprava preklepov (sk/cs/en) a druhý prechod s orezom pomáhajú, no zle čítajú lesklé/zakrivené obaly, malé písmo, farebné pozadie a zloženie vo viacerých jazykoch naraz (vyber jazyk obalu). OCR môže zameniť znaky (O/0, l/1) – pri E-číslach to appka opravuje a nepresné zhody označí, ale **vždy skontroluj text pred vyhodnotením**. Prvé použitie OCR potrebuje internet (~8 MB jazykových dát a jadro; potom offline). Čiarový kód len pre výrobky, ktoré sú v Open Food Facts; údaje zadávajú používatelia a môžu byť zastarané. Hodnotenia z iných aplikácií (Férová potravina, Yuka, INCI Beauty) sme nepreberali. Nie je to lekárska rada.
**Overenie behom:** unit testy (parser, E-čísla, OCR preklepy, alergény, skóre, OFF mapovanie, lepšia voľba) a e2e na mobilnom viewporte: ručné vloženie → história → porovnanie; syntetická etiketa → OCR → zložky; čiarový kód (zmockovaný OFF); OCR offline po reloade so service workerom. Živú adresu zo sandboxu nevidno (github.io blokované) – nasadenie sa overilo cez úspešné behy workflow.

## Ďalšie návrhy (vyber si)
| Návrh | Prečo | Náročnosť |
|---|---|---|
| Overenie zdrojov v origináli (otvoriť sieť pre PubMed/doi.org) | zvýši dôveryhodnosť na `original` | nízka |
| Nutričné hodnoty z USDA/Ciqual | nahradiť odhady | stredná |
| Rodinná skúška receptov + úprava podľa chuti, fotky vlastných jedál | recepty sú len na papieri | stredná |
| Zvyšky: večera → obed v plánovači, plán „na viac dní“ | menej práce, menej plytvania | stredná |
| Časovač v režime varenia (z textu receptu) | pohodlie pri varení | nízka |
| Synchronizácia medzi mobilmi (QR/odkaz namiesto JSON) | druhý mobil v domácnosti | stredná |
| Vlastné recepty (pridať/importovať) so skóre | rodinné recepty | stredná |
| Kozmetika (INCI) v skeneri | pôvodný nápad | vysoká |
| Sledovanie váhy/príjmu | mimo cieľ appky; len ak chcete | – |
| Skener: kozmetika podľa INCI (zložky šampónov, krémov) so zdrojmi | pôvodný nápad; vlastná databáza INCI + hodnotenia podľa SCCS/EÚ | vysoká |
| Skener: overenie hodnotení v origináli, keď sa otvorí sieť (EFSA, PubMed) a doplnenie vlastných posúdení pre látky s predvoleným hodnotením | zvýšiť úroveň z „vyhľadávanie“ na „originál“ | stredná |
| Skener: vlastný model/čistenie OCR (napr. slovník zložiek, dvojfázové OCR s orezom riadkov) | menej preklepov na zakrivených obaloch | stredná |
| Skener: nákupný zoznam „lepší výrobok“ priamo z histórie skenov a značenie výrobkov „kupujem“ | prepojenie so záložkou Nákup | nízka |
| Skener: Open Food Facts offline (predstiahnutý výber SK produktov) | kód funguje aj bez internetu | vysoká |
| Skener: hodnotenie alergénov pre diétu (celiakia: dôkladnejšie „bezlepkové“, laktóza) | bezpečnosť | stredná |
