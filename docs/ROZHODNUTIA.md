# Rozhodnutia

## R1 – Rešerš nebola možná, appka neobsahuje „overené“ zdroje (2026-10-15)
- **Čo:** sieť sandboxu blokuje PubMed, doi.org, WHO, IARC (proxy 403), WebFetch nevie otvoriť žiadnu doménu. Sub-agenti rešerše nevedeli otvoriť ani jeden primárny zdroj.
- **Rozhodnutie:** podľa CLAUDE.md („citácie nevymýšľaj; čo sa nedá overiť, do appky nejde“) appka **neuvádza žiadne zdroje ako overené**. Skóre zdravosti je výslovne označené ako **odhad / naša heuristika** inšpirovaná všeobecne známymi odporúčaniami (menej rafinovanej múky, cukru, spracovaného mäsa, viac vlákniny…), bez konkrétnych čísel z štúdií. Zoznam kandidátskych zdrojov zo zadania je v `docs/vyskum/NEOVERENE.md` ako úloha na doplnenie, nie v appke ako dôkaz.
- **Alternatíva:** napísať citácie z pamäte modelu – zamietnuté (riziko vymyslených údajov).
- **Dopad:** vedomostné karty majú úroveň „odhad / prax“ a odkaz, že zdroj čaká na overenie. Po sprístupnení siete treba rešerš zopakovať.

## R2 – Nutričné hodnoty surovín sú odhady
USDA/Ciqual nie sú dostupné → všetky hodnoty `odhad: true` (typické hodnoty z bežných tabuliek, zaokrúhlené), appka to zobrazí.

## R1b – Úprava R1 podľa nových pravidiel (15.10.2026)
CLAUDE.md zaviedol úrovne overenia `original` / `vyhladavanie` / `neoverene`. Rešerš sa preto zopakovala cez WebSearch (≥2 nezávislé potvrdenia na zdroj, čísla len ak sú vo výsledkoch doslova). Zdroje v appke nesú označenie „overené vyhľadávaním, originál nečítaný“. Váhy skóre a prahy ostávajú naším odhadom (zdroje podporujú smer, nie presné čísla).

## R3 – Kalibrácia skóre
Surové vážené skóre sa zhlukovalo v pásme 70–90, preto sa pred zobrazením lineárne roztiahlo (`58 + (x − 66) × 1,3`, orezané na 0–100). Poradie receptov sa nemení; klasiky s múkou, cukrom a vyprážaním vychádzajú v pásme „občas/zriedka“.

## R4 – Ovos a lepok
Ovos je v databáze označený ako `lepok` (riziko krížovej kontaminácie, EÚ ho radí k obilninám s lepkom). Bezlepková diéta preto vylúči aj ovsené recepty – je to opatrná voľba pre celiakiu.

## R5 – Skener zloženia
Stavia samostatný agent v `src/skener/**`; hlavná appka má len trasu `#/skener` a položku v menu (`src/skener-vstup.tsx` načíta `src/skener/index.tsx`, export `Skener`).

## R6 – Kontrolný beh 15.10.2026 (03:40 UTC)
Bez zmien kódu: testy, build a e2e zelené, nasadenie úspešné. Opätovná WebSearch rešerš sa nerobila – zdroje už prešli adversariálnym overením (docs/vyskum/OVERENIE.md) a opakovanie by nepridalo novú úroveň dôkazov; úroveň `original` čaká na otvorenie siete.

## R-i1 – Vlastné ilustrácie a ikona
Emoji pri receptoch, kategóriách, v navigácii a na rulete nahradila vlastná sada SVG (`src/ui/ilustracia.tsx`, farby cez premenné `--il-*`, svetlá aj tmavá téma). Dáta receptov ostávajú s emoji v poli `ilustracia`; appka ho mapuje na typ ilustrácie (inak podľa kategórie jedla), takže nové recepty nič nerozbijú. Test kontroluje pokrytie. Ikona appky (tanier s paradajkou) sa generuje cez `node scripts/ikony.mjs`.


## R-a1 – Aktualizácie, úpravy ako prepínače, časovač
Service worker: autoUpdate + skipWaiting + clientsClaim + cleanupOutdatedCaches; kontrola novej verzie (`update()`) pri návrate z pozadia (najviac raz za 30 s) a raz za hodinu (`src/aktualizacia.ts`). Verzia a čas zostavenia sú v Nastaveniach → O appke, vrátane tlačidla „Skontrolovať aktualizáciu“. Úpravy receptu sú tlačidlá s `aria-pressed`. Časovač (`src/engine/casovac.ts`, `src/ui/Varenie.tsx`): pri rozsahu času sa ponúkne dolná aj horná hranica; „cez noc“ sa nerozpoznáva; časy sú údaje z postupov (kuchárska prax, nie zdravotné tvrdenie). Notifikácie sa pýtajú až po ťuknutí na štart časovača.
## R-b1 – Nákupný zoznam: balenia, „skontroluj“, jednotky
Voda a ľad sa do nákupu nepočítajú. Položky pod ~10 g (a koreniny pod ~50 g) idú do skupiny „Skontroluj, či máš doma“ bez gramov. Množstvá sa zaokrúhľujú nahor na bežné balenie (múka 1 kg, mlieko 1 l, vajcia po 10, konzervy po kusoch…). **Tabuľka balení (`src/engine/baleni.ts`) je odhad** typických obchodných balení, nie údaj z konkrétneho obchodu; appka to hovorí v Nákupe a vždy ukáže aj „treba ~…“. Chlieb sa ukazuje v plátkoch („~315 g ≈ 7 plátkov“), rožky/tortilly/pity v kusoch.

## R-c1 – Voliteľné obmedzované suroviny
Ak je voliteľná surovina v kategórii, ktorú má domácnosť obmedzenú alebo vylúčenú (údeniny, rafinovaná múka, pridaný cukor, vyprážané; podľa príznakov surovín), recept ju predvolene vynecháva: nepočíta sa do limitu, nákupu ani skóre a v detaile je „voliteľne (máš obmedzené)“. Názov sa odvodzuje vo funkcii `zobrazenyNazov` (dáta sa neprepisujú): „Fazuľový prívarok (klobása voliteľne)“. Keď ju používateľ pridá, uloží sa do `pridaneVolitelne` (stav v. 2) a počíta sa všade. Známe obmedzenie: skóre a kategórie v zoznamoch kariet (`Info`) sa počítajú staticky so všetkými surovinami, presné skóre je v detaile.

## R-f1 – Plánovač: zvyšky a čas
Nastavenia majú `casTyzden` (po–pi), `casVikend` a `varimNa2Dni` (stav verzia 2; migrácia `maxCas` → `casTyzden`, víkend predvolene 90 min). Pri „varím na 2 dni“ sa večera s tagom `na-viac-dni` zopakuje ako obed ďalšieho dňa (zvyšky sa nevaria, limit času sa tam nepoužije). Nákup spočíta recept podľa počtu výskytov v pláne, takže kúpi raz za obe jedlá v jednom riadku.


## R-g1 – Vlastné recepty
- Ukladajú sa v localStorage (`vlastne` v stave, verzia stavu 3; starší stav sa pri načítaní migruje, chybné vlastné recepty sa zahodia). Pri zmazaní sa recept odstráni aj z jedálnička, nákupu, obľúbených a histórie.
- Skóre sa počíta rovnakou funkciou ako pri vstavaných receptoch, ale len zo surovín z databázy s množstvom. Voľný text a suroviny bez množstva sa do skóre nezapočítajú; appka ukáže „istotu skóre“ (vysoká/stredná/nízka/žiadna) podľa odhadu podielu hmotnosti, ktorý je započítaný (prahy 90 % a 70 % sú naše odhady). Návrh priradenia voľného textu k surovine je len zhoda podľa názvu a vždy ho potvrdzuje používateľ.
- Voľný text sa v nákupe ukáže ako samostatný zoznam bez množstiev.
- Formát exportu: `{format:"recepty-vlastne", verzia:1, vytvorene, recepty[]}`; API v `src/engine/vlastne.ts`: `exportVlastne(recepty)`, `parseVlastne(json)` → `{ok, recepty, chyby}`, `zlucVlastne(existujuce, prichadzajuce)` → `{recepty, pridane, aktualizovane, nezmenene}` (pri rovnakom id vyhrá novší `upravene`). Import je tolerantný: neznáme suroviny prevedie na voľný text, chybné recepty preskočí, novšiu verziu formátu odmietne.


## R-h1 – Prenos do druhého mobilu bez servera
Stav sa zabalí do JSON obálky `{a:"recepty-prenos", v:1, s:{…}}`, skomprimuje (CompressionStream deflate-raw, prvý znak Z; J = bez kompresie) a zakóduje base64url do odkazu `#/prenos/<dáta>` alebo QR (lokálny generátor z @zxing/library, úroveň L, limit ~2200 znakov odkazu; nad ním súbor / Zdieľať / Stiahnuť). Import cez odkaz, QR z kamery, fotku QR, súbor alebo vložený odkaz; vždy náhľad (počty nové / rovnaké / prepíše / len lokálne), predvolene „zlúčiť“ (zjednotenie; pri rozpore vyhrá prenos; vlastné recepty cez `zlucVlastne`), „nahradiť“ len po upozornení; pred použitím sa uloží záloha a ide „Vrátiť späť“. Prenáša sa KAŽDÝ kľúč stavu (generická politika podľa tvaru dát); test `tests/prenos.test.ts` zlyhá, ak pribudne kľúč bez politiky v `POLITIKA` alebo vedome vo `VYLUCENE`. Vylúčené: `verzia` (patrí appke, migruje ju `zluc`) a história/zásoba skenera (samostatné úložiská, môžu byť veľké – výrobky sa v druhom mobile naskenujú znova). Dáta sa validujú a čistia (typy, hodnoty, `__proto__`, limit 4 MB po rozbalení proti kompresnej bombe); chyba nikdy nezmení stav. Odkaz obsahuje všetky údaje – appka upozorní, aby sa nezdieľal verejne.

## R-q1 – Záverečná kontrola ako používateľ (Playwright, 412×915, svetlá aj tmavá téma)
Prešlo sa Dnes, recepty, detail s úpravami, režim varenia s časovačom, vlastný recept, jedálniček („varím na 2 dni“), nákup, ruleta, diéty, náhrady, vedomosti, prenos, nastavenia a Viac; automatická kontrola pretekania, vodorovného posunu, dotykových plôch pod 40 px a chýb v konzole (0 chýb).
- Ilustrácia `orechy` je teraz lieskovec s čiapočkou (predtým pripomínala melón). Pribudli ilustrácie `paradajka`, `avokado`, `mlieko` a ikony pre odkazy a karty (náhrady, diéty, skener, prenos, nastavenia, múka, cukor, údeniny, vyprážané, balík, soľ, brucho, plameň, dieťa).
- Emoji v `Viac.tsx` a v ikonách kariet vedomostí a náhrad sa v UI mapujú na ilustrácie (`IkonaKarty`); dáta v `src/data/**` ostali nezmenené. Neznáme emoji by sa zobrazilo ako text, test kontroluje pokrytie.
- Karty receptov počítajú skóre s vynechanými voliteľnými obmedzovanými surovinami rovnako ako Detail (zjednotené, R-c1 „známe obmedzenie“ platí už len pre kategórie `kat` použité vo filtroch).
- Postup receptu: krok, ktorý spomína vynechanú voliteľnú surovinu (podľa kmeňa názvu), dostane poznámku „(voliteľné – máš obmedzené)“; texty receptov v dátach sa nemenia (`postupPreDomacnost`).
- Opravy rozloženia: záložky s ikonou, zmršťujúce sa checkboxy v nákupe (`flex: none`), dotykové plochy odkazov a rozbaľovača aspoň 44 px.
- E2E: port sa dá zvoliť cez `PW_PORT` (predvolene 4173); `e2e/prenos.spec.ts` mal natvrdo 4173, preto na inom porte zlyhával.
