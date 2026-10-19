# Ranný prehľad – Recepty

**Appka:** https://mrlukas161.github.io/Recepty/ (verzia v Nastaveniach → „O appke“; `…/version.json` = posledný nasadený commit)

## Stav v skratke (kontrola 16.10. ~04:50 UTC)
- **Nové:** skener kozmetiky podľa INCI (Viac → Skener kozmetiky → „Ukáž príklad“), oprava skenera potravín: zložka s upresnením v zátvorke je jedna zložka („vegetable fat (palm)“ → Palmový tuk, „flavouring (vanillin)“ → jedna Aróma; Nutella cez Open Food Facts už nemá duplicity).
- **Ako vyskúšať v mobile:** otvor adresu vyššie, Viac → Skener zloženia → vlož text „Ingredients: sugar, vegetable fat (palm), flavouring (vanillin)“; potom Viac → Skener kozmetiky.
- **Overené spustením:** 205 unit testov, build, 27 e2e na 412×915 (skener potravín vrátane OCR a offline, skener kozmetiky: ručné INCI, syntetická etiketa, kód so zmockovanou odpoveďou). Skóre receptov: žiadny recept označený ako klasika/vyprážaný nie je v pásme „Výborné“.
- **Úroveň zdrojov:** všetko stále „overené vyhľadávaním, originál nečítaný“. Nočný agent pre zdroje sa nespustil – sieť (PubMed, doi.org, EUR-Lex, Open Food Facts…) je z cloudu zatvorená, preto **nie sú** nové výživové tabuľky, balík slovenských výrobkov ani `OVERENIE-ORIGINAL.md`; všetky nutričné hodnoty surovín ostávajú odhad.
- **Čo chýba a prečo:** originály zdrojov, tabuľky USDA/Ciqual, úplná Príloha II/CosIng (sieť), skúška na reálnom telefóne, uvarenie receptov rodinou.

## Novinky 19.10. – appka (múka ako hlavný smer, skóre, hviezdičky, nový dizajn)
- **Dnes:** hore „Múka tento týždeň“ (koľko z uvarených a naplánovaných jedál bolo s múkou voči limitu), „Tip dňa“ (tlačidlo „Ďalší tip“), sekcia „Bez múky na obed/večeru“ a odkaz „Čím nahradiť múku“. Skús: otvor recept s múkou → „✅ Uvarené“ → vráť sa na Dnes, číslo sa zmení.
- **Skóre zrozumiteľne:** v detaile receptu pri každom faktore vidíš skutočnú hodnotu, cieľ a slovo (napr. „Vláknina: 6,3 g · cieľ ~10 g na jedlo · dobré“); percento ostalo len pri celkovom skóre (veľký kruh). Nový faktor „Múka (rafinovaná)“. Pri zvolenej diéte (keto…) pribudne „Vhodnosť pre tvoje diéty“ (čisté sacharidy na porciu vs. limit).
- **Slabé suroviny:** v zozname surovín receptu je pod slabou surovinou (biela múka, údenina, cukor, kuskus…) dôvod a „Lepšie: …“. Ťuk na názov alebo náhradu otvorí **kartu suroviny** (prečo áno/nie, kedy áno/nie, čím nahradiť, výživa oproti bielej múke, zdroje s úrovňou overenia). Viac → Suroviny: tapioka je len škrob (nie zlepšenie), bulgur a kuskus sú pšenica s lepkom, pšeno je proso, psyllium je spojivo.
- **Hviezdičky 1–5** v detaile receptu. 1★ = nechutilo: recept zmizne z Dnes, rulety aj jedálnička; zoznam je vo Viac → Nechutilo (tam „Vrátiť“). Jedálniček → **Zamiešať** uprednostní 4–5★ a nikdy nedá 1★. Hodnotenia idú do prenosu do druhého mobilu.
- **Diéty** sú vedľajšie: Viac → Diéty, popis je hneď na karte, tlačidlo „Použiť“ priamo tam. Výbery (typ jedla, čas, obmedzenia, téma…) sú čipy; pribudol olovrant (Nastavenia → Jedlá v jedálničku).
- **Nový dizajn:** svetlý vzdušný základ, tmavý režim podľa systému (Nastavenia → Vzhľad → Automaticky). Skús prepnúť tmavý režim v telefóne a prejsť Dnes, recept, Viac.
- **Fotky jedál (slot):** zatiaľ prázdny (`public/foto/zoznam.json` = `[]`). Keď PC dodá `public/foto/<id>.webp` a zápis v zozname, karta a detail ich ukážu s nenápadným „AI“. Formát: `docs/ROZHODNUTIA.md` (R-n5), id receptov: `docs/RECEPTY_ZOZNAM.md`.
- **Overené spustením:** unit testy (vrátane kontrastu WCAG AA v oboch režimoch), build, e2e na 412×915. Úroveň zdrojov: všetko „overené vyhľadávaním, originál nečítaný“ (nový zdroj k psylliu); sieť na PubMed/DOI stále zatvorená.

## Novinky 19.10. – skener
- **Vlastný sken k čiarovému kódu.** Keď skener kód nenájde (alebo výrobok nemá zloženie), odfoť alebo vpíš zloženie, daj „Vyhodnotiť“ a potom „💾 Zapamätať zloženie pod kód…“. Nabudúce ho appka nájde aj bez internetu, označí „Vlastný sken (dátum)“ a má prednosť pred balíkom aj Open Food Facts. Zmazať sa dá priamo vo výsledku alebo v histórii („Moje vlastné skeny“). Platí aj pre kozmetiku.
- **Prenos do druhého mobilu** (Viac → Preniesť) berie aj skener: históriu skenov, vlastné skeny celé a ostatné uložené výrobky ako kódy (druhý mobil si ich dotiahne, keď je online). Ak je toho na QR priveľa, appka to povie a ponúkne súbor (⬇ Stiahnuť súbor → v druhom mobile Prijať → Súbor alebo fotka QR); alebo vypni „Poslať aj skener“ a QR sa zmestí. Staré prenosy fungujú ďalej.
- **„➕ Pridať do Open Food Facts“ (kozmetika: Open Beauty Facts)** sa ukáže pri nenájdenom výrobku aj pri výrobku bez zloženia – otvorí stránku databázy s kódom v novom okne; appka sama nič neodosiela. Tvar adresy je potvrdený len vyhľadávaním (pozri `docs/ROZHODNUTIA.md`, R-s19), pri kozmetike je odhad.
- **Živá kamera na čiarový kód aj v skeneri potravín.** Skener zloženia → „🎥 Živá kamera“ → namier na kód. Pri prvom načítaní krátko zavibruje/pípne (ak to telefón dovolí), kamera sa sama vypne a vypne sa aj pri odchode z obrazovky. Bez kamery ostáva odfotenie a ručné vpísanie.
- **Ako vyskúšať v mobile:** (1) Skener zloženia → vpíš kód, ktorý v databáze nie je (napr. ľubovoľný platný EAN z drobného výrobku), vpíš zloženie, Vyhodnotiť, Zapamätať; zapni režim v lietadle a kód vyhľadaj znova. (2) Viac → Preniesť do druhého mobilu → pozri riadky skenera v náhľade na druhom mobile. (3) Živá kamera na ľubovoľnom čiarovom kóde z obalu.

## Novinky 16.10. – výživa a slovenské výrobky
- **Výživa surovín:** 287 z 298 surovín má hodnoty z tabuliek (249 Ciqual 2025, 38 USDA FoodData Central), 11 ostalo odhadom (poznámka pri každej: napr. chýba zhoda pre petržlenový koreň, tlačenku, kuraciu chrbticu, cícerové a šošovicové cestoviny, pukancovú kukuricu, klobásu bez údaja o tukoch). Hodnoty „traces“ a „< x“ z Ciqualu sú v appke „približné“. Mapovanie a pravidlá: `docs/vyskum/VYZIVA.md`, rozhodnutie R-v1.
- **Skóre receptov (197):** Výborné/Dobré/Občas/Zriedka pred 65/100/18/14, po 62/104/17/14 – pásma sa nerozpadli, kalibrácia sa nemenila.
- **Ako vyskúšať:** otvor ľubovoľný recept → dole „Zdroj výživových hodnôt (X z Y z tabuliek)“; Viac → Vedomosti → Zdroje → „Výživové tabuľky“ (USDA CC0, Ciqual Licence Ouverte 2.0).
- **Balík slovenských výrobkov: HOTOVÝ (2 498 výrobkov).** Z 3 686 výrobkov Open Food Facts (krajina Slovensko, ODbL, stiahnuté 16.10.2026) sa vyradilo 37 s neplatným čiarovým kódom a 1 151 bez zloženia, E-čísel aj výživových hodnôt; po odstránení duplicít ostalo 2 498 v 164 dieloch, spolu ~0,7 MB (rozpočet 3 MB). Skener hľadá najprv lokálnu zásobu, potom balík `public/off/` (načíta sa až pri hľadaní, service worker ho uloží), až potom Open Food Facts online. **Ako vyskúšať v mobile bez internetu:** otvor appku s internetom aspoň raz (nech sa nainštaluje), potom zapni režim lietadlo → Viac → Skener → „Čiarový kód“ → vlož `20131616` (syr Trappista, Milbona) → Nájsť. Má sa ukázať „Open Food Facts (ODbL), stiahnuté 16.10.2026“ a zloženie „Pasterizované mlieko, jedlá soľ…“. Ďalšie kódy na skúšku: `20004408` (červená kapusta), `20402013` (Kakaós ital). Údaje môžu byť staršie než obal.

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
- **Odhad / prax:** váhy a prahy skóre (`docs/vyskum/SKORE.md`), zaradenie surovín (zápal, NOVA, GI), nutričné hodnoty 11 surovín (ostatné 287 sú z USDA/Ciqual), recepty (vlastné slová, 2 kontroly agentmi, ale **nik ich neuvaril** – prosím rodinná skúška).
- Nie je to lekárska rada – upozornenie je v appke.

## Novinky 15.10. – appka
- **Aktualizácie:** appka sa po nasadení sama obnoví (autoUpdate, kontrola pri návrate z pozadia a raz za hodinu). Nastavenia → O appke: verzia, čas zostavenia, „Skontrolovať aktualizáciu“. *Reálnu výmenu verzie v mobile sme zo sandboxu neskúšali – po prvej aktualizácii over, že sa verzia zmenila.*
- **Nákup:** bez vody a ľadu; soľ, korenie a drobnosti v skupine „Skontroluj, či máš doma“ bez gramov; chlieb „~315 g ≈ 7 plátkov“; zaokrúhlenie na bežné balenia (múka 1 kg, mlieko 1 l, vajcia po 10…). Tabuľka balení je náš odhad a appka to povie.
- **Voliteľné obmedzované suroviny:** ak máš údeniny/múku/cukor/vyprážané obmedzené, voliteľná surovina sa predvolene vynechá („voliteľne … (máš obmedzené)“, názov napr. „Fazuľový prívarok (klobása voliteľne)“); po pridaní sa počíta do limitu, skóre aj nákupu.
- **Úpravy receptu** sú tlačidlá-prepínače (≥ 48 px, zapnuté/vypnuté).
- **Časovač v režime varenia:** z postupu rozpozná časy (aj rozsahy), viac časovačov naraz, zvuk/vibrácia/notifikácia, Wake Lock.
- **Plánovač:** „varím na 2 dni“ (večera → obed na ďalší deň, nákup raz), čas na varenie cez týždeň a cez víkend v Nastaveniach.
- **Vlastné recepty:** Recepty → „+ Vlastný recept“ (aj Viac → Moje recepty): úprava, duplikát, zmazanie, export/import JSON; skóre rovnakým výpočtom, suroviny voľným textom znižujú „istotu skóre“; fungujú v zozname, jedálničku, rulete aj nákupe.
- **Prenos do druhého mobilu:** Viac → Preniesť do druhého mobilu: odkaz, QR (lokálne), súbor; na druhom mobile náhľad zmien, zlúčiť alebo nahradiť, vrátiť späť. *Živú kameru na QR sme neskúšali na reálnom telefóne.*
- **Vlastné SVG ilustrácie a nová ikona** (tanier s paradajkou) namiesto emoji; svetlá aj tmavá téma skontrolované na 412×915.
- Ako vyskúšať: otvor appku, prejdi menu Viac a záložky vyššie; testy: 177 unit, 23 e2e.

## Čo chýba a prečo
- **Originály zdrojov** nie sú prečítané – sandbox blokuje PubMed/DOI/WHO (iba WebSearch). Po otvorení siete zopakovať rešerš na úroveň `original`.
- Overenie štúdií v origináli stále chýba – sieť je zatvorená (tabuľky USDA/Ciqual sme dostali cez vetvu `data-zdroje`, ale PubMed/DOI nie).
- Živá adresa sa z cloudu nedá otvoriť (proxy blokuje github.io); nasadenie overujem cez GitHub Actions. **Ráno otvor `version.json` a porovnaj s commitom.**
- Nič z novinky sme neskúšali na reálnom Xiaomi/iPhone (len Chromium 412×915): aktualizácia SW, živé skenovanie QR kamerou, notifikácie časovača.
- Tabuľka balení v nákupe je odhad. Filtre používajú kategórie (`Info.kat`) počítané so všetkými surovinami; poznámka „(voliteľné – máš obmedzené)“ je pri kroku postupu, nie pri konkrétnej surovine.
- Emoji ostali v niektorých tlačidlách (⭐ 👍 👎 ✏️ 🗑 ✨ 🛒 📤); niektoré ilustrácie receptov sú približné (struk, banán/jahoda). Kozmetika (INCI) čaká na samostatný beh.
- Recepty nik neuvaril – potrebná rodinná skúška.

## Novinky 15.10. – skener
**Čo sa zmenilo** (na základe tvojho „všetky návrhy aplikuj a oprav“; podrobnosti a rozhodnutia S7–S14 v `docs/vyskum/SKENER.md`):
- **Oprava chyby čiarového kódu (Nutella 3017620422003).** Appka mala len francúzsky text → 8 z 9 zložiek „nerozpoznaných“ a skóre 81 „Výborné“. Teraz: text sk → cs → en → originál (appka ukáže jazyk), E-čísla, alergény, stopy, pridaný cukor a palmový olej sa dopĺňajú aj zo štruktúrovaných údajov OFF, bez duplicít. Nutella vychádza 42/100 v pásme „Občas“ (nižšie než pred opravou, nie „Zriedka“ – naše skóre je mierne) (E322 rozpoznané, slabé stránky: cukor, palmový olej, vysoký obsah cukrov a nasýtených tukov).
- **Nízka spoľahlivosť:** keď je nerozpoznaných nad ~30 % zložiek alebo niektorá z prvých troch, ukáže sa „Nízka spoľahlivosť – skontroluj zloženie“, skóre sa zastropuje na „Občas“ (nikdy „Dobré“/„Výborné“) a pri ručnom texte je tlačidlo „Opraviť zloženie“.
- **Prísnejšie výživové hodnoty:** prahy „vysoký obsah“ z britského farebného značenia (cukry > 22,5 g, nasýtené tuky > 5 g, soľ > 1,5 g na 100 g; zdroj úrovne „overené vyhľadávaním“), váha faktora dvojnásobná a berie sa aj najhoršia živina.
- **Offline zásoba výrobkov:** výrobok nájdený podľa kódu sa uloží v mobile (limit 300) a nájde sa aj bez internetu s označením „Uložené DD.MM.RRRR“. Rozhranie na predstihnutý výber slovenských výrobkov (`importujPredstih`) je pripravené, **dáta nie** – spraví neskorší beh po otvorení siete.
- **Diéta a alergény:** pri diéte Bezlepková / Bez laktózy a pri alergiách na lepok a mlieko sú dôkladnejšie upozornenia (pšenica, raž, jačmeň, špalda, kamut, ovos s rizikom krížovej kontaminácie, slad, stopy lepku; mlieko, srvátka, mliečna bielkovina, laktóza, smotana, maslo, syry s poznámkou o vyzretých syroch) so zdrojom a úrovňou dôkazov. Poznámky o syroch a masle sú označené „prax, nie dôkaz“ (zdroje sa v číslach rozchádzali o rády).
- **Nákup z histórie:** v histórii „Do nákupu“ (pridá výrobok medzi vlastné položky) a značka „Kupujem“ s filtrom; domáci recept z „lepšej voľby“ ide tlačidlom do nákupu. Staré záznamy histórie sa načítajú bez straty (migrácia + test).
- **Lepšie čistenie OCR:** slovníková oprava preklepov a diakritiky (zoznam opráv sa ukáže na kontrolu), spájanie slov rozdelených na konci riadka, voliteľný druhý prechod OCR s orezom na pás textu pri slabom výsledku.

**Ako to vyskúšať:** (1) Viac → Skener zloženia → zadaj kód `3017620422003` → výsledok má byť „Občas“ (42) a zloženie v angličtine. (2) V Nastaveniach zapni diétu Bezlepková alebo Bez laktózy a vlož zloženie s ovsom, mliekom, syrom → karta „Tvoja diéta a alergie“. (3) Nájdi ktorýkoľvek výrobok podľa kódu, vypni internet a hľadaj ho znova → „Uložené …“. (4) V histórii ťukni „☆ Kupujem“ a „🛒 Do nákupu“, potom skontroluj Nákup. (5) Odfoť zložený zoznam zložiek so zalomením riadkov a pozri riadok „Slovník opravil …“.

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

## Novinky 16.10. – kozmetika
**Čo vie:** nový „Skener kozmetiky“ (Viac → 🧴 Skener kozmetiky, trasa `#/kozmetika`, odkaz aj zo skenera zloženia). Odfotíš zoznam INCI (OCR v angličtine), vložíš ho ručne alebo nájdeš výrobok podľa čiarového kódu v Open Beauty Facts (online, ODbL; nájdené sa uložia a nájdu aj offline). Výsledok: skóre 0–100 s pásmom a rozpadom (zakázané a obmedzené látky, alergény vôní, dráždivé a citlivé zložky, konzervanty, UV filtre, mikročastice); ťuknutím na zložku uvidíš funkciu, dôvod, zdroj a úroveň dôkazov. Osobné nastavenia (citlivá pokožka, alergia na vône, tehotenstvo, deti) sú priamo v obrazovke, história a porovnanie dvoch výrobkov.
**Ako vyskúšať:** Viac → Skener kozmetiky → „Ukáž príklad“; zapni „Alergia na vône“ a sleduj zmenu skóre; uložiť dva výrobky do histórie → Porovnať.
**Čo je overené a na akej úrovni:** všetko na úrovni **overené vyhľadávaním** (EUR-Lex, ec.europa.eu, Open Beauty Facts a PubMed boli v cloude zatvorené, originály sme nečítali): parabény (nar. 1004/2014), MIT (2016/1198, 2017/1224), fenoxyetanol (SCCS 2016), oktokrylén (SCCS 2021), benzofenón-3 (2022/1176), homosalát (2022/2195), D4/D5/D6 (2024/1328), oxid titaničitý (2021/850), Lilial (2021/1902), vonné alergény (0,001 % / 0,01 %; 2023/1545), retinol (2024/996), benzoany, sorbany, DHA, oxid zinočnatý. Čo sa nepotvrdilo, je v appke „odhad / prax, nie dôkaz“ a bez čísla.
**Obmedzenia:** hodnotíme prítomnosť látky, nie dávku (koncentrácie na obale nie sú). Databáza má asi 120 látok, nie celú Prílohu II (~1 700 zakázaných látok) ani CosIng; „nenájdené“ neznamená „povolené“. Skóre je naša heuristika. Nie je to lekárska rada. Podrobnosti: `docs/vyskum/KOZMETIKA.md`.
