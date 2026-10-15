# Zadanie – appka „Recepty"

> Zadanie pre autonómneho agenta (cloud). Zadávateľ cez noc spí a nemôže odpovedať — **neklaď otázky**, rozhoduj rozumne sám a každé dôležité rozhodnutie zapíš do `docs/ROZHODNUTIA.md` (čo, prečo, zvažované alternatívy). Pravidlá práce: `CLAUDE.md`. Priebeh: `docs/PRIEBEH.md`.

## 1. Cieľ
Mobilná webová appka (PWA) pre rodinu (predvolene 2 dospelí + 3 deti vo veku 2–6 rokov; nastaviteľné), ktorá radí, **čo variť, keď chceme obmedziť veci, ktorých máme v strave priveľa** — hlavne **múku** (ráno chlieb alebo placky, na obed halušky, cestoviny…), ďalej **cukor a sladké jedlá**, **údeniny a spracované mäso**, **vyprážané a ťažké jedlá**. Appka má:
1. ukázať **náhrady** (čím to nahradiť a čo tým získam alebo stratím),
2. **hodnotiť každé jedlo podľa výskumov** — prínosy aj slabé stránky (zápalový potenciál, ťažkosť po jedle, cukor v krvi, vláknina, sýtosť, spracovanosť, soľ…),
3. **ráno ponúknuť raňajky** podľa preferencií so skóre, aké sú dobré pre telo (a analogicky obed a večeru podľa dennej doby),
4. **zoraďovať a filtrovať** recepty,
5. **upraviť jedlo** — čo sa dá pridať, odobrať, vymeniť a **bez čoho sa to nedá urobiť**,
6. zostaviť **jedálniček** a **nákupný zoznam**,
7. **ruletu**, ktorá náhodne vyberie recept na deň,
8. podporovať **rôzne diéty s popisom, čo diéta zahŕňa**.

Zadávateľ chce, aby to bolo **založené na výskumoch** a aby agent **preveril suroviny bežne používané vo varení a veľa receptov**. Dizajn **nesmie vyzerať ako obyčajný generovaný AI vzhľad**.

## 2. Platforma (rozhodnuté)
- **PWA: Vite + TypeScript + Preact**, `base: '/Recepty/'`, výstup `dist/`. Skripty: `npm test` = `vitest run`, `npm run build`, `npm run e2e` = Playwright. Commituj `package-lock.json`.
- **Hosting: GitHub Pages** — https://mrlukas161.github.io/Recepty/. Workflow `.github/workflows/nasadenie.yml` je pripravený a odskúšaný: push do `main` alebo `claude/**` → `npm ci` → `npm test` → `npm run build` → nasadenie; push do `claude/**` zároveň posunie `main` (fast-forward). Meň ho, len ak musíš, a zachovaj tieto vlastnosti. **Červené testy = nič sa nenasadí.**
- Pri builde vytvor `dist/version.json` (`{"sha": process.env.GIT_SHA alebo git rev-parse HEAD, "cas": ISO čas}`) a verziu ukáž v Nastaveniach — podľa neho overíš, že živá adresa beží na poslednom commite.
- Cieľ: Android + Chrome (napr. Xiaomi 15, viewport ~400×890 CSS px); musí fungovať aj na iPhone (Safari) a na počítači.
- **Inštalovateľná a offline:** manifest (sk, ikony 192/512 + maskable), service worker (napr. `vite-plugin-pwa`), všetky dáta v balíku. `display_override: ["fullscreen", "standalone"]`; v prehliadači tlačidlo „Na celú obrazovku" (Fullscreen API); layout 100dvh, safe-area insets.
- **Bez backendu, bez API kľúčov, bez volaní AI za behu** (prevádzka nesmie nič stáť). Stav v localStorage/IndexedDB; **export/import JSON** (prenos nastavení, obľúbených a jedálnička na druhý mobil v domácnosti).

## 3. Výskum — základ appky
Postup (paralelne cez sub-agentov):
1. **Rešerš po témach** → `docs/vyskum/<tema>.md` po slovensky: tvrdenie → zdroj (autori, rok, časopis, DOI/PMID, URL) → čo presne zistili (čísla, populácia) → **úroveň dôkazov** (`silné` = metaanalýzy/RCT · `stredné` = kohorty · `slabé` = malé alebo mechanistické štúdie · `prax` = bez dôkazov, kuchárska či klinická prax) → dátum overenia.
2. **Adversariálne overenie:** iný sub-agent ku každému tvrdeniu otvorí zdroj a hľadá, čo nesedí (iné číslo, iný záver, iná populácia, neexistujúca citácia, novší rozporný výsledok). Výsledok `docs/vyskum/OVERENIE.md` vrátane sekcie **„Čo overenie vyvrátilo"** — vyvrátené do appky nejde.
3. Do appky ide len overené: `src/data/zdroje.ts` (id, citácia, DOI/URL, úroveň, `overene: '2026-10-15'`, čo podporuje).

**Témy (minimum):** rafinovaná múka vs. celozrnné obilniny · glykemický index/záťaž a glykémia po jedle · „ťažkosť" po jedle (tuk a vyprázdňovanie žalúdka, vyprážanie, veľkosť porcie, FODMAP/fruktány — pri pšenici často fruktány, nie lepok; celiakia vs. neceliakálna citlivosť) · zápal: Dietary Inflammatory Index (DII), Empirical Dietary Inflammatory Pattern (EDIP) — ktoré potraviny a živiny sú pro- a protizápalové · voľné cukry a sladené nápoje · spracované a červené mäso · vyprážané jedlá, trans-tuky, oleje na vysokú teplotu · ultraspracované potraviny (NOVA) · vláknina, strukoviny, zelenina a ovocie, rozmanitosť rastlín · fermentované potraviny · ryby a omega-3, orechy, semienka · soľ (dospelí aj deti) · bielkoviny, sýtosť a raňajky · **deti:** riziko dusenia do 4 rokov (celé orechy, celé hrozno, tvrdá surová zelenina…), soľ a cukor u detí · diéty (bod 5).

**Kandidátske zdroje — NEOVERENÉ tipy na začiatok** (každý over: existencia, DOI, čo naozaj tvrdí; pokojne nájdi lepšie a novšie):
- Shivappa N. a kol. 2014, Public Health Nutr — Dietary Inflammatory Index (doi 10.1017/S1368980013002115)
- Tabung F. K. a kol. 2016, J Nutr — EDIP (doi 10.3945/jn.115.228718)
- Reynolds A. a kol. 2019, Lancet — kvalita sacharidov, vláknina, celozrnné (doi 10.1016/S0140-6736(18)31809-9)
- Aune D. a kol. 2016, BMJ — celozrnné obilniny a mortalita (doi 10.1136/bmj.i2716)
- Atkinson F. S. a kol. 2021, Am J Clin Nutr — tabuľky GI/GL (doi 10.1093/ajcn/nqab233)
- Monteiro C. A. a kol. 2019, Public Health Nutr — NOVA (doi 10.1017/S1368980018003762)
- Hall K. D. a kol. 2019, Cell Metab — ultraspracovaná strava v RCT (doi 10.1016/j.cmet.2019.05.008)
- Lane M. M. a kol. 2024, BMJ — umbrella review ultraspracovaných potravín (doi 10.1136/bmj-2023-077310)
- Bouvard V. a kol. 2015, Lancet Oncol — IARC: spracované a červené mäso (doi 10.1016/S1470-2045(15)00444-1)
- Qin P. a kol. 2021, Heart — vyprážané jedlá a kardiovaskulárne ochorenia (doi 10.1136/heartjnl-2020-317883)
- WHO 2015 — Guideline: Sugars intake for adults and children
- Estruch R. a kol. 2018, NEJM — PREDIMED (doi 10.1056/NEJMoa1800389)
- Sacks F. M. a kol. 2001, NEJM — DASH-Sodium (doi 10.1056/NEJM200101043440101)
- Morris M. C. a kol. 2015, Alzheimers Dement — MIND; Barnes L. L. a kol. 2023, NEJM — MIND RCT (neutrálny výsledok!)
- Wastyk H. C. a kol. 2021, Cell — fermentované potraviny a zápalové markery (doi 10.1016/j.cell.2021.06.019)
- McDonald D. a kol. 2018, mSystems — American Gut, rozmanitosť rastlín (doi 10.1128/mSystems.00031-18)
- Skodje G. I. a kol. 2018, Gastroenterology — fruktány vs. lepok (doi 10.1053/j.gastro.2017.10.040)
- Halmos E. P. a kol. 2014, Gastroenterology — low-FODMAP (doi 10.1053/j.gastro.2013.09.046)
- O'Keefe J. H. a kol. 2008, J Am Coll Cardiol — glykémia, lipidy a zápal po jedle (doi 10.1016/j.jacc.2007.10.016)

## 4. Databáza surovín („prever položky, ktoré sa používajú vo varení")
- **≥ 200 surovín** bežných v slovenskej kuchyni: múky a obilniny, pečivo, cestoviny, prílohy, strukoviny, zelenina, ovocie, mäso, ryby, údeniny, mliečne výrobky, vajcia, tuky a oleje, orechy a semienka, koreniny a bylinky, sladidlá, polotovary.
- Pri každej: id, názov, skupina, **oddelenie v obchode**, jednotky a prevody (g ↔ ks/lyžica/hrnček), **nutričné hodnoty na 100 g** (energia, bielkoviny, tuky, nasýtené, sacharidy, cukry, vláknina, soľ) **so zdrojom** (USDA FoodData Central s FDC ID alebo Ciqual; čo sa nedá overiť → `odhad: true` a appka to tak zobrazí), GI kategória (ak je známa), NOVA skupina, zápalová skupina (EDIP/DII), príznaky (rafinovaná múka, celozrnné, lepok, laktóza, spracované mäso, pridaný cukor, vysoký FODMAP, 14 alergénov EÚ), poznámka pre deti.
- **Náhrady:** ku každej obmedzovanej surovine alebo kategórii zoznam náhrad s kontextom (do placiek, do omáčky, na raňajky, na zahustenie…) a čo sa zmenou získa alebo stratí.

## 5. Diéty (s popisom, čo diéta zahŕňa)
Pri každej: krátky popis · čo **zahŕňa / obmedzuje / vylučuje** · pre koho je a **pre koho nie** (deti, tehotné, choroby) · čo hovoria dôkazy (overené zdroje + úroveň) · praktické tipy · tlačidlo **„Použiť"** (nastaví filtre a limity; diéty sa dajú kombinovať, konflikty appka vysvetlí).
Minimum: stredomorská · DASH · MIND · protizápalová (vzorec podľa DII/EDIP) · severská · flexitariánska · vegetariánska · vegánska · bezlepková (nutná pri celiakii, inak nie) · bez laktózy · nízkosacharidová · ketogénna (nie pre deti; len s lekárom) · low-FODMAP (dočasná eliminácia pri dráždivom čreve, s odborníkom) · **„Menej múky"** (naša: múku nahrádzame strukovinami, zemiakmi, pohánkou, ovsom, pšenom, zeleninou).

## 6. Recepty („mnoho receptov")
- **Cieľ ≥ 150 receptov, kvalita pred počtom:** raňajky ≥ 40 (veľa **bez pečiva**: vajcia, ovsené/pohánkové/pšenové kaše, jogurt, kefír, tvaroh, slané kaše, placky bez pšeničnej múky, nátierky zo strukovín so zeleninou…), obedy ≥ 50, večere ≥ 40, polievky, desiaty a olovranty pre deti, sladké jedlá s menej cukru.
- Aj **klasické slovenské jedlá s veľa múkou** (bryndzové halušky, pirohy, knedle, palacinky, rezeň, langoš, buchty, lokše…) ako referencia — so skóre a s „lepšími verziami" („Chuť na halušky? Skús…").
- Každý recept: id, názov, typ jedla, kuchyňa, čas prípravy a varenia, náročnosť, porcie (dospelý = 1; dieťa podľa veku, nastaviteľné), suroviny (id, množstvo v g/ml/ks, **`nevyhnutna`** = bez nej sa to nedá, **`volitelna`**, alternatívy), postup v krokoch, tagy (detské, rýchle, do krabičky, lacné, bezmäsité…), vybavenie, **možné úpravy** (pridať zeleninu či semienka, vymeniť prílohu…), skladovanie, poznámka pre deti.
- Píš **vlastnými slovami**, uvariteľne (rozumné pomery, časy, teploty). Každú dávku receptov **skontroluje iný sub-agent** (pomery, chýbajúce kroky, časy, bezpečnosť, slovenčina) a chyby oprav.
- Ilustrácie: emoji alebo vlastné SVG, žiadne cudzie fotky.

## 7. Skóre zdravosti
- **0–100** + pásmo (napr. 80+ výborné · 60–79 dobré · 40–59 občas · < 40 zriedka) a farba (nikdy len farba — aj text).
- **Rozpad pri každom recepte:** zápalový potenciál · glykemická záťaž · vláknina · bielkoviny a sýtosť · podiel zeleniny, ovocia a strukovín · spracovanosť (NOVA) · tuky (nasýtené, vyprážanie) · soľ · pridaný cukor · ťažkosť — pri každom faktore „prečo" + odkaz na zdroj.
- **Kompozitné skóre je naša heuristika** — váhy zdôvodni v `docs/vyskum/SKORE.md` a appka to povie.
- **Úpravy receptu** (odobrať, pridať, vymeniť) prepočítajú skóre naživo a ukážu rozdiel („+8: menej rafinovanej múky, viac vlákniny").
- **Prínosy** a **slabé stránky** (2–4 body) sa generujú z faktorov, nie vymýšľajú.

## 8. Obrazovky a funkcie (všetko po slovensky)
1. **Úvodné nastavenie** (prvé spustenie, dá sa preskočiť): domácnosť (dospelí, deti s vekom) · čo obmedziť alebo vylúčiť — 3 úrovne: *bez obmedzenia* / *obmedziť (max N× týždenne)* / *vylúčiť* · alergie · čo nejeme a nemáme radi · diéta · čas na varenie · vybavenie (rúra, airfryer, mixér…). **Predvolené: obmedziť múku, cukor a sladké, údeniny a spracované mäso, vyprážané a ťažké.**
2. **Dnes** (domov): podľa dennej doby najbližšie jedlo — **ráno raňajky** (5–8 návrhov zoradených podľa skóre a preferencií; skóre, čas, 1–2 dôvody), napoludnie obed, večer večera; prepínač jedla; „Iné návrhy"; vstup do rulety; stav týždňa (múka, cukor… koľkokrát z limitu).
3. **Recepty:** vyhľadávanie; filtre (typ jedla, čas, náročnosť, diéta, detské, bez vylúčených surovín, **„mám doma"**); zoradenie (skóre, čas, počet surovín, obľúbené, náhodne).
4. **Detail receptu:** skóre a rozpad · prínosy a slabé stránky · suroviny prepočítané na domácnosť (nevyhnutné označené „bez tohto to nejde") · **úpravy** (odobrať voliteľné, vymeniť za náhradu, pridať vylepšenie) so živým prepočtom · postup (režim varenia: veľké písmo, krok po kroku, Wake Lock) · zdroje · do jedálnička · obľúbené · hodnotenie rodiny 👍/👎 · „Uvarené" (história).
5. **Náhrady:** „Čím nahradiť…" múku, pečivo, cestoviny, cukor, údeniny, vyprážanie, smotanu… — výhody a nevýhody, dôkazy, recepty; **„Chuť na…?"** (klasika → podobné zdravšie jedlo).
6. **Diéty:** zoznam a detail podľa bodu 5, „Použiť".
7. **Jedálniček:** týždeň (raňajky, desiata, obed, olovrant, večera — nastaviteľné); generátor rešpektuje vylúčenia, limity (napr. múka max 2× týždenne), diétu, rozmanitosť (neopakovať do N dní, striedať bielkoviny, ryby 1–2× týždenne), zvyšky (večera → obed), menej času cez týždeň; zamknúť, vymeniť, pregenerovať; súhrn týždňa (limity, počet rôznych rastlín, odhad vlákniny).
8. **Nákup:** z jedálnička alebo vybraných receptov; zlúčené množstvá a jednotky; podľa oddelení obchodu; odškrtávanie; vlastné položky; zásoby „mám doma" sa odpočítajú; zdieľanie (Web Share alebo kopírovať text).
9. **Ruleta:** animované koleso (rešpektuje filtre a vylúčenia), **„Recept dňa"** — prijať (do dnešného jedálnička) alebo roztočiť znova; vibrácia voliteľne.
10. **Vedomosti:** krátke karty (múka, celozrnné, cukor, údeniny, vyprážané, ultraspracované, vláknina, strukoviny, omega-3, fermentované, soľ, FODMAP a ťažkosť, zápal) s úrovňou dôkazov a zdrojmi; zoznam všetkých zdrojov.
11. **Nastavenia:** všetko z úvodného nastavenia · téma (svetlá/tmavá/auto) · celá obrazovka · export/import JSON · reset · verzia · upozornenie, že **nejde o lekársku radu**. Všetky nastavenia v GUI appky, nie v konfiguračnom súbore.

## 9. Dizajn
- **Nie generický AI vzhľad:** výrazná typografia (OFL písmo self-hosted cez `@fontsource`), teplá „kuchynská" paleta, charakterné karty, jemné animácie (rešpektuj `prefers-reduced-motion`), svetlý aj tmavý režim.
- Ovládanie jednou rukou: spodná navigácia (Dnes · Recepty · Jedálniček · Nákup · Viac), dotykové plochy ≥ 44 px, čitateľné pri varení.
- Prístupnosť: kontrast AA, popisy pre čítačky, informácia nikdy len farbou.

## 10. Kvalita a testy
- **Vitest:** skóre · filtre · plánovač (vylúčené nikdy, limity dodržané, rozmanitosť) · nákupný zoznam (zlučovanie, jednotky) · úpravy receptu · **validácia dát** (každá surovina v recepte existuje; každý zdroj má DOI/URL a dátum overenia; tag „bezlepkové" bez lepku; každá diéta má popis…).
- **Playwright e2e** (Chromium, viewport 412×915): prvé spustenie → nastavenie → raňajky → detail → úprava → jedálniček → nákup → ruleta → offline reload.
- Pred koncom **prejdi appku ako používateľ** v headless prehliadači (screenshoty na mobilnom viewporte) a oprav, čo nefunguje alebo vyzerá zle.
- Nasadenie over na živej adrese: `https://mrlukas161.github.io/Recepty/version.json` = posledný commit (curl alebo WebFetch; Pages sa obnoví do pár minút).

## 11. Postup a odovzdanie
1. **Hneď na začiatku:** zápis štartu do `docs/PRIEBEH.md` → commit → push (overenie, že push funguje).
2. **Fáza 1 – MVP (do ~2 h):** kostra appky + PWA + 30–40 receptov + základné skóre + Dnes, Recepty, Detail, Ruleta → nasadiť, aby ráno určite niečo fungovalo.
3. **Fáza 2:** výskum + overenie → zdroje, skóre, vedomosti, diéty.
4. **Fáza 3:** suroviny a recepty v plnom rozsahu, náhrady, úpravy, jedálniček, nákup.
5. **Fáza 4:** e2e testy, nezávislá kontrola kvality (sub-agent: UX, dáta, citácie), dizajn, nasadenie.
6. **Po každej fáze:** testy zelené → commit → push → zápis do `docs/PRIEBEH.md` (čas UTC, hotové, ďalej) → over živú adresu.
7. **Na konci `docs/RANNY_PREHLAD.md`** (slovensky, stručne): odkaz · inštalácia na Android v 3 krokoch · čo appka vie · čo je overené a čo odhad · čo chýba a prečo · **Ďalšie návrhy** (konkrétne rozšírenia: čo, prečo, náročnosť — zadávateľ si ráno vyberie).

Pracuj so sub-agentmi (paralelne rešerš, recepty, kontrola) a hlavný kontext drž malý.

## 12. Skener zloženia výrobkov (doplnené 15.10.2026 02:14)
Zadávateľ chce **odfotiť zloženie na obale → OCR → podľa databázy rozpoznať zložky a prídavné látky → hodnotenie a skóre výrobku** — princíp ako appky Férová potravina (potraviny) či INCI Beauty (kozmetika), ale s **vlastnou metodikou a zdrojmi** (hodnotenia z iných appiek nepreberaj). **Musí byť ráno v appke.** Stavia ho **samostatný cloud agent paralelne** v module `src/skener/**` (postup `docs/PRIEBEH_SKENER.md`, metodika a zdroje `docs/vyskum/SKENER.md`); hlavný agent doň nezasahuje, len nechá integračné body (položka v menu, trasa).
- **Vstup:** fotka (`<input type="file" accept="image/*" capture="environment">`, voliteľne živá kamera), orezanie, otočenie a úprava kontrastu pred OCR; rozpoznaný text sa dá pred vyhodnotením opraviť; záložne ručné vloženie textu.
- **OCR offline a zadarmo:** Tesseract.js so slovenčinou a češtinou (+ angličtina), jazykové dáta `tessdata_fast` hosťované s appkou (nie z cudzieho CDN), načítané až pri otvorení skenera a cachované service workerom.
- **Čiarový kód (voliteľne, keď je internet):** `BarcodeDetector` (Chrome Android) alebo zxing → Open Food Facts API (zadarmo, bez kľúča): názov, zloženie, výživové hodnoty, Nutri-Score, NOVA; v appke „Údaje: Open Food Facts (ODbL)". Bez internetu alebo bez nálezu → OCR.
- **Rozbor zloženia:** zložky (čiarky; zátvorky = podzložky; percentá „mäso 60 %"; poradie = množstvo), normalizácia (diakritika, veľkosť písmen, fuzzy zhoda na preklepy z OCR), E-čísla v tvaroch E330 / E 330 / E-330 aj slovné názvy („kyselina citrónová"), 14 alergénov EÚ, „môže obsahovať stopy".
- **Databáza:** (a) **všetky prídavné látky povolené v EÚ** (príloha II nariadenia (ES) č. 1333/2008; slovenské názvy z EUR-Lex; strojovo čitateľný zdroj napr. taxonómia aditív Open Food Facts — ODbL, uveď licenciu): E-číslo, názov a synonymá, funkcia, hodnotenie v 4 stupňoch (*bez výhrad · v poriadku · obmedziť · vyhnúť sa / najmä deti*) **s dôvodom, zdrojom a úrovňou dôkazov** (EFSA re-evaluácie, IARC, recenzované štúdie); vyvážene — povolená látka nie je automaticky „jed", preventívne obavy označ ako preventívne; (b) **ďalšie zložky** dôležité pre naše limity a zdravie: druhy cukru a sirupov, rafinovaná múka, stužené tuky (trans), palmový tuk, soľ, arómy, škroby, izoláty — aj **pozitíva** (celozrnné na 1. mieste, vysoký podiel hlavnej suroviny, krátke zloženie, bez pridaného cukru).
- **Skóre výrobku 0–100** (+ pásmo, nie len farba): spracovanosť (markery ultraspracovania podľa NOVA, počet zložiek) · najhoršie prídavné látky · cukor, soľ, tuky (ak sú výživové hodnoty z OFF alebo zadané) · **osobné upozornenia** podľa nastavení (obmedzená múka, cukor, údeniny, diéta, alergie). Rozpad skóre; ťuknutím na zložku detail (čo to je, prečo, zdroj). Naša heuristika — appka to povie.
- **Lepšia voľba:** domáca alternatíva z našich receptov (nátierka, müsli, omáčka…) a podľa čoho vybrať lepší výrobok.
- **História skenov** (lokálne), porovnanie dvoch výrobkov. Fotky sa spracúvajú len v mobile, nikam sa neposielajú.
- **Testy:** parser (E-čísla, zátvorky, percentá, OCR preklepy), skóre, e2e so syntetickou fotkou etikety (vyrenderovaný text → OCR → očakávané zložky).
- **Kozmetika (INCI)** teraz nie — patrí do „Ďalších návrhov".
