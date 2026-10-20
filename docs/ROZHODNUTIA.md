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

## R-k1 – Kontrolný beh 15.10.
Bez zmeny kódu: žiadna chyba nenájdená. Migrácia sa overila odseknutým stavom (verzia 1) — uložený JSON sa neprepisuje, kým používateľ niečo nezmení; `zluc` ho migruje pri načítaní (pokrýva unit test a e2e „starý uložený stav“).

## R-k2 – Kontrolný beh 16.10.
- Všeobecná zložka s upresnením v zátvorke (`olej`, `aroma`) je jedna zložka: ak upresnenie je známa konkrétnejšia zložka (palm → palmový tuk), platí ona; inak ostane jedna všeobecná (aróma vanilín). Ostatné zložené zložky (čokoláda (cukor, …)) sa rozbaľujú ako doteraz. Test v `tests/skener7.test.ts`.
- Sieť ostala zatvorená (doi.org 000), úroveň zdrojov sa nemenila; agent pre zdroje nič nespustil, čo je zapísané v prehľade ako chýbajúce.

## R-v1 – Výživové hodnoty surovín z USDA a Ciqual (16.10.2026)
- Tabuľky (vetva `data-zdroje`) → 287 z 298 surovín má hodnoty z tabuľky (`odhad: false`, `zdrojNutr` = `ciqual:<kód>` / `fdc:<id>`; 249 Ciqual, 38 USDA), 11 ostáva `odhad: true` s poznámkou prečo (`poznamkaNutr`). Spracované hodnoty sú v `src/data/vyziva-tabulky.json`, prekrývajú sa v `src/data/index.ts`; surové tabuľky v `main` nie sú. Mapovanie surovina → položka → dôvod: `docs/vyskum/VYZIVA.md`.
- USDA: sacharidy = „by difference“ − vláknina (min. 0), soľ zo `sol_g_vypocet`. Ciqual: desatinná čiarka; „traces“ → 0; „< x“ → x/2; `-` → chýba (soľ sa dopočíta zo sodíka; chýbajúca nasýtené/cukry/vláknina → ponechaný pôvodný odhad; chýbajúce kcal/bielkoviny/tuky/sacharidy → surovina ostáva odhadom). Také hodnoty sú v appke označené „približné“. Cukry sa orežú na sacharidy, nasýtené na tuky.
- Párovanie robili sub-agenti po dávkach, sporné (istota „stredna“ alebo odchýlka > 35 % od starého odhadu) overil druhý sub-agent.
- **Kalibrácia skóre: bez zmeny.** Recepty (197) v pásmach Výborné/Dobré/Občas/Zriedka: pred 65/100/18/14, po 62/104/17/14; pásma sa nerozpadli, poradie sa takmer nemení, preto sa váhy ani prah nemenili.

## R-o1 – Balík slovenských výrobkov (16.10.2026)
- Skript sa nemenil. Do balíka idú výrobky s platným čiarovým kódom, ktoré majú aspoň zloženie, E-čísla/zložky alebo výživové hodnoty; 37 neplatných kódov a 1 151 prázdnych záznamov sa vyradilo, duplicity sa zlúčili → 2 498 výrobkov, ~0,7 MB (hlboko pod rozpočtom 3 MB).
- Dáta (`sk-vyrobky.jsonl.gz`) ostávajú len vo vetve `data-zdroje`, do main ide len spracovaný balík `public/off/` (ODbL, uvedené v appke aj v súbore s pôvodom).
- E2E používa EAN-8 `20131616` (Trappista, slovenské zloženie) a blokuje sieť na openfoodfacts.org, aby dokázalo, že údaj je z balíka.

## R-n1 – Diéty sú vedľajšie, skóre zrozumiteľne, faktor múky (19.10.2026)
- Hlavný smer appky (zadávateľ 19.10.): **obmedzovať múku**, potom cukor, údeniny, vyprážané. Diéty (keto…) sú vo Viac → Diéty; v Nastaveniach ostal len odkaz. Popis diéty je hneď na karte (zadávateľ hlásil, že sa po ťuknutí nezobrazil), na karte je aj „Použiť“.
- Skóre: bodovú škálu faktorov (0–100) sme z UI zrušili; pri každom faktore je **skutočná hodnota, cieľ a slovo** (výborné ≥ 75, dobré ≥ 50, slabé < 50 bodov faktora). Percento ostáva len pri celkovom skóre. Cieľ = horný/dolný prah lineárnej škály faktora (napr. vláknina 2→10 g: cieľ ~10 g), čiže je to naše nastavenie, nie smernica.
- Nový faktor `muka` (váha 12): gramy surovín s príznakom `rafinovana-muka` na porciu, 10 g → 100 bodov, 90 g → 0. Prahy sú odhad. Po pridaní sa kalibračný posun (R3) znížil z 58 na 55, aby pásma ostali podobné (pred/po: výborné 62/60, dobré 104/107, občas 17/12, zriedka 14/18).
- Vhodnosť diét v detaile: keto/nízkosacharidová ukáže „čisté sacharidy X g na porciu, limit Y g“ (sacharidy v tabuľke sú bez vlákniny, pozri R-v1); limity 15 a 40 g sú naše limity v appke (`LIMIT_SACH`).

## R-n2 – Učenie: karty surovín, slabé suroviny, denný tip (19.10.2026)
- Karta suroviny (`#/surovina/<id>`, zoznam `#/suroviny` vo Viac): prečo áno/nie, kedy áno/nie, čím nahradiť, výživa na 100 g oproti bielej múke (hodnoty a ich zdroj Ciqual/USDA sa berú z databázy, nie z textu), zdroje s úrovňou overenia. Ručne napísané karty (`src/data/karty-surovin.ts`) majú ~35 surovín okolo múky; ostatné suroviny majú automatické dôvody z príznakov. Každá karta nesie úroveň: tabuľka / prax / odhad. Test kontroluje, že tvrdenia o živinách (napr. bulgur má viac vlákniny než kuskus) sedia s tabuľkou.
- Posolstvo kariet: **tapioka a škroby = čistý škrob, nie zlepšenie** (bezlepkové ≠ zdravšie); **bulgur a kuskus = pšenica s lepkom** (kuskus je rafinovaná krupica); pšeno je proso (bez lepku, nie pšenica); chia a psyllium nie sú náhrada múky; tofu/tempeh nahrádzajú mäso, nie múku. Lepok v pšenici je podložený zdrojom `eu-1169-2011-ii`.
- Nové suroviny: tapioka (USDA FDC 169717), zemiakový škrob (Ciqual 4090, cukry chýbajú → približné), kukuričný škrob (Ciqual 9510), psyllium (v tabuľkách nie je → odhad). Ovsené vločky, quinoa, amarant, chia, tofu, tempeh, mandľová/kokosová/cícerová/šošovicová múka už v databáze boli.
- Nový zdroj `gibb-2015-psyllium` (metaanalýza RCT, psyllium a glykemická kontrola; PubMed 26561625): úroveň `vyhladavanie` – overené z 2 nezávislých výsledkov (PubMed, Duke) + novšia metaanalýza z roku 2024 potvrdzuje smer. Názov práce a krstné mená autorov sme vo výsledkoch nevideli, preto sa neuvádzajú; čísla sa neuvádzajú. Autori sú spojení s výrobcom, appka to hovorí. Metaanalýza o LDL (AJCN 2018) sa nepridala: vo výsledkoch chýbali autori.
- V recepte má každá slabá surovina (rafinovaná múka, údenina, pridaný cukor, kuskus…) pod riadkom dôvod a „Lepšie: …“ (ťuk = karta).
- Denný tip (`src/data/tipy.ts`, 30 tipov, každý s úrovňou): poradie je pevne pomiešané podľa dňa, takže sa tip nezopakuje, kým neprejdú všetky; tlačidlo „Ďalší tip“.

## R-s19 – Skener 19.10.2026: vlastné skeny, prenos, tlačidlo OFF, živá kamera
- **Vlastný sken = samostatné úložisko** (`recepty-skener-vlastne-v1`, kozmetika `recepty-kozmetika-vlastne-v1`, limit 500), nie záznam v zásobe výrobkov (`ulozisko.ts`, limit 300) – vďaka tomu naň limit 300 nedosiahne. Poradie hľadania: **vlastný sken → lokálna zásoba → balík → Open Food Facts/Open Beauty Facts**. Pri výrobku z OFF bez zloženia sa názov (a výživové hodnoty) predvyplnia z OFF a zloženie dopĺňa používateľ; po uložení vyhráva vlastný sken. Označenie „Vlastný sken (DD.MM.RRRR)“, mazanie v histórii aj priamo vo výsledku.
- **Kód v histórii:** história ukladá naskenovaný kód aj pri výrobku, ktorý v databáze nie je (`kodSken`), nielen pri výrobku z OFF.
- **Prenos:** údaje skenera idú v obálke prenosu v novom voliteľnom poli `x.sk` (verzia obálky ostáva 1). Staré prenosy ho nemajú a načítajú sa ako doteraz; stará appka pole ignoruje. Obsah: história skenov (potraviny aj kozmetika) a vlastné skeny celé, ostatné uložené výrobky len ako kódy (po prijatí sa pridajú do zoznamu „na dotiahnutie“ a appka si ich stiahne z balíka/OFF/OBF, keď je online). Zlúčiť = pridá nové, pri rovnakom kóde vlastného skenu vyhrá novší; Nahradiť = história a vlastné skeny z prenosu prepíšu lokálne. Pred použitím sa robí záloha skenera (Vrátiť späť).
- **Veľkosť:** QR sa zobrazí len keď odkaz ≤ `MAX_QR_ZNAKOV` (2200). Inak appka povie, že údajov je na QR priveľa, a ponúkne súbor JSON (stiahnuť/zdieľať; v druhom mobile „Prijať → Súbor alebo fotka QR“) a možnosť vypnúť „Poslať aj skener“, vtedy sa QR zmestí. Súbor má rovnakú obálku, len nekomprimovanú.
- **Adresa „Pridať do Open Food Facts“:** `https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=<kód>`. Tvar `cgi/product.pl?type=edit&code=` sme potvrdili vyhľadávaním (19.10.2026) – výsledky obsahujú takéto adresy na `us.openfoodfacts.org` a `be-de.openfoodfacts.org` s konkrétnymi kódmi a dokumentácia API opisuje `code` ako čiarový kód pridávaného/upravovaného výrobku. **Odhad (neoverené otvorením stránky):** že tá istá adresa slúži aj na pridanie výrobku, ktorý v databáze ešte nie je (preto nepoužívame `type=add`), a že rovnaký tvar platí aj na `world.openbeautyfacts.org` (OBF beží na rovnakom softvéri Product Opener; priamo pre OBF sa tvar vo výsledkoch nenašiel). Ak by stránka nefungovala, používateľ ostane na úvodnej stránke databázy a zloženie si môže uložiť vlastným skenom. Odkaz sa otvára v novom okne (`rel="noopener noreferrer"`), appka nič neodosiela. Zápis do databáz cez API (`product_jqm2.pl`) nepoužívame – vyžaduje prihlásenie a odosielanie údajov.
- **Živá kamera:** spoločný modul `src/skener/kamera.ts` + panel `KodPanel.tsx` pre potraviny aj kozmetiku. `BarcodeDetector`, ak ho prehliadač nemá, záložne ZXing (`decodeFromStream`); tlačidlo sa ukáže, keď existuje `getUserMedia`. Kamera sa vypne po načítaní kódu, pri opustení obrazovky (odmontovanie), pri schovaní appky (`visibilitychange`). Prvé načítanie = vibrácia a krátke pípnutie, ak to prehliadač dovolí (inak ticho). Pri odmietnutej kamere ostáva odfotenie a ručné vpísanie.

## R-n3 – Hviezdičky 1–5 a Zamiešať (19.10.2026)
- Nový kľúč stavu `hviezdicky` (id receptu → 1–5). Staré 👍/👎 (`hodnotenie` 1/−1) sa čítajú ako 4★/1★, kým recept nedostane hviezdičky (kľúč `hodnotenie` ostal kvôli prenosu a starým záloham). 1★ = nechutilo: recept sa nenavrhuje na Dnes, nie je v rulete ani v jedálničku (pri 1★ sa zo slotov odstráni; zamknutie sa zruší); v zozname Recepty ostáva, aby sa dal nájsť. Zoznam „Nechutilo“ je vo Viac, tlačidlo „Vrátiť“ hodnotenie zruší.
- Poradie na Dnes: 5★ +10, 4★ +5, 2★ −6 bodov. Prenos do druhého mobilu: pridaná politika pre `hviezdicky` v `src/engine/prenos.ts` (len celé čísla 1–5), nič iné sa v súbore nemenilo.
- Zamiešať (Jedálniček): náhodný výber so váhou skóre × váha hviezd (1★ 0, 2★ 0,5, nehodnotené/3★ 1, 4★ 2,5, 5★ 4). Test: 1★ sa nevyberie ani raz v 150 pokusoch, 5★ sa vyberá viac než 2× častejšie ako 2★.

## R-n4 – Čipy namiesto výberových zoznamov a olovrant (19.10.2026)
- Krátke výbery (typ jedla, čas, náročnosť, diéta a zoradenie vo filtri Receptov; obmedzenia a téma v Nastaveniach; typ a jednotka vo vlastnom recepte; náhrady surovín v recepte) sú čipy (`Cipy` v `src/ui/kom.tsx`, `role="group"`, `aria-pressed`). Výber náhradného receptu v jedálničku je zoznam tlačidiel. Skener a kozmetika (iný beh) sa nemenili.
- Nový typ jedla `olovrant` (v jedálničku ho vyberá z olovrantov, desiát a dezertov), v nastaveniach „Jedlá v jedálničku“ pribudol čip Olovrant.

## R-n5 – Fotky jedál: slot a formát (19.10.2026)
- Appka zobrazí fotku receptu, ak existuje `public/foto/<id-receptu>.webp` **a** je v `public/foto/zoznam.json` (pole `[{ "id": "…", "ai": true, "model": "názov modelu", "datum": "2026-10-20" }]`). Bez záznamu alebo pri chybe načítania ostáva doterajšia SVG ilustrácia. Fotka s `ai: true` má nenápadnú značku „AI“ (v rohu, s popisom po ťuknutí/podržaní) a v detaile popisok „Obrázok vytvorený umelou inteligenciou (model, dátum) – ilustračný“. Zoznam sa načíta pri prvom zobrazení (offline sa použije posledný uložený); id sa kontroluje (`^[a-z0-9][a-z0-9-]*$`).
- **Formát súboru:** WebP, pomer 4:3, **640 × 480 px**, najviac **80 kB** (tvrdý strop 120 kB), sRGB, bez metadát; názov presne `<id>.webp` (id zo `docs/RECEPTY_ZOZNAM.md`). Celkovo pri 197 receptoch ~16 MB – fotky sa nepredkešujú v service workeri (načítavajú sa pri zobrazení a ukladajú do medzipamäte `foto-jedal`).
- Zoznam id všetkých receptov s názvom: `docs/RECEPTY_ZOZNAM.md` (generuje `scripts/recepty-zoznam.ts`, test kontroluje aktuálnosť), tam aj popis formátu receptu pre nové recepty dodané zvonka (JSON na import / zápis do kódu). Pri fotkách ide o obrázky vytvorené umelou inteligenciou, nie cudzie fotky (CLAUDE.md: žiadne cudzie fotky).

## R-n6 – Nový dizajn (19.10.2026)
- Svetlý, vzdušný základ (chladná biela/šedozelená, mäkké tiene, 1 px rámiky, zaoblené karty a čipy), písmo Nunito (serif Fraunces sa už nepoužíva). Tmavý režim sa riadi systémom (`prefers-color-scheme`), v Nastaveniach sa dá vynútiť Svetlá/Tmavá (`data-tema`).
- Celkové skóre je veľký percentuálny kruh (`Pecat`, CSS `--p`); text v ňom ostáva čisté číslo (znak „%“ pridáva CSS), aby fungovali testy skenera a kozmetiky, ktoré číslo čítajú z `.pecat`.
- Farby sú len v CSS premenných (`:root` v `src/styles.css`); skener a kozmetika ich preberajú bez zmeny kódu (pribudli `--ramik` – rámik ovládacích prvkov, `--fokus`, `--tien`; existujúce názvy ostali). `tests/kontrast.test.ts` počíta WCAG kontrast 22 dvojíc farieb v troch režimoch (svetlý, tmavý podľa systému, tmavý ručne): text a skóre ≥ 4,5:1, rámiky a fokus ≥ 3:1.

## R-m1 – Múka a pečivo sa nenavrhujú, limit 1–2× (20.10.2026)
- `navrhnutelny()` (`src/engine/navrh.ts`): recept s príznakom `rafinovana-muka` (pšeničná a špaldová múka, chlieb, rožky, cestoviny, kuskus, strúhanka, škroby, ryžová múka…) a recept s rafinovaným cukrom sa **nenavrhuje** na Dnes, v jedálničku (aj Zamiešať a výber náhrady) ani v rulete. Výnimka: ak je v Nastaveniach kategória na „Bez obmedzenia“, platí staré správanie. Bezlepkové škroby a ryžové cestoviny majú tiež príznak múky, takže sa nenavrhujú (opatrné zjednodušenie; zadávateľ chce múky čo najmenej). Ostatné múky (pohánková, ovsená, mandľová, cícerová…) príznak nemajú – posudzuje ich skóre.
- Vyhľadaním v Receptoch sa nájdu a pri každom je „Bez múky: …“ (ručne vybrané `LEPSIE`, inak najpodobnejšie recepty rovnakého typu bez múky podľa spoločných surovín, názvu a značiek). Test: každé jedlo s múkou má aspoň jednu verziu.
- Limit: `limitMuky()` = 1 alebo 2 (predvolene 2; staršia uložená hodnota 3 sa berie ako 2), „Vylúčiť“ = 0, „Bez obmedzenia“ = bez limitu. Počítadlo (uvarené / naplánované, vyššie z čísel) je na Dnes aj v detaile receptu s múkou („ostáva N×“).
- Rafinovaný cukor = surovina zo skupiny sladidiel s príznakom pridaného cukru, ktorá nie je med (cukry, sirupy, džem, čokoláda, nátierky); voliteľné suroviny sa nepočítajú. Med posudzuje skóre (WHO ho radí k voľným cukrom).
