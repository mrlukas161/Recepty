# Výživové hodnoty surovín – mapovanie na tabuľky

Stav k 16.10.2026. Zdroje: **USDA FoodData Central** (SR Legacy 2018-04, Foundation Foods 2025-12-18; CC0 1.0) a **Ciqual 2025** (Anses, doi:10.57745/RDMHWY, Licence Ouverte 2.0). Tabuľky stiahol počítač zadávateľa do vetvy `data-zdroje` (surové dáta sú len tam, do `main` idú iba spracované hodnoty v `src/data/vyziva-tabulky.json`, skript `scripts/vyziva-zostav.mjs`).

## Pravidlá prevzatia
- Hodnoty na 100 g: energia (kcal), bielkoviny, tuky, nasýtené, sacharidy, cukry, vláknina, soľ.
- **USDA:** sacharidy = „Carbohydrate, by difference“ − vláknina (ako na etikete EÚ, nie menej než 0); soľ = stĺpec `sol_g_vypocet` (sodík × 2,5); energia zo stĺpca `kcal`, pri Foundation Foods bez nej z Atwaterovej hodnoty (všeobecnej, inak špecifickej).
- **Ciqual:** desatinná čiarka → číslo; „traces“ → 0; „< x“ → x/2; `-`/prázdne → chýba. Chýbajúca soľ sa dopočíta zo sodíka. Ak chýba nepodstatná živina (nasýtené, cukry, vláknina, soľ), ponechá sa pôvodný odhad. Ak chýba kcal, bielkoviny, tuky alebo sacharidy, suroviny sa nepriradí (zostáva odhad). Surovina s takouto náhradou alebo s „traces“/„< x“ má v appke značku **približné**.
- Párovanie robili sub-agenti paralelne po dávkach; **sporné** (istota „stredna“ alebo odchýlka kcal/živín od starého odhadu > 35 %) overil druhý sub-agent a niektoré opravil. Kód aj názov položky sa skontrolovali proti CSV.
- Cukry sa orežú na sacharidy a nasýtené na tuky (zaokrúhlenie / definícia tabuľky).
- Čo nemá dobrú zhodu, ostáva `odhad: true` s poznámkou.

## Mapovanie (surovina → položka tabuľky → dôvod)

| Surovina | Zdroj | Položka tabuľky | Dôvod | Istota | Poznámka |
|---|---|---|---|---|---|
| Pšeničná múka hladká (`psenicna-muka-hladka`) | ciqual:9436 | Wheat flour, type 55 (for bread) | Pšeničná múka typ 55, najbližšia slovenskej hladkej. | dobra | približné |
| Pšeničná múka polohrubá (`psenicna-muka-polohruba`) | ciqual:9435 | Wheat flour, type 65 | Typ 65 zodpovedá približne polohrubej múke. | stredna | približné (doplnené: nasyt) |
| Pšeničná múka hrubá (`psenicna-muka-hruba`) | ciqual:9445 | Wheat flour, type 80 | Typ 80 je najbližšia hrubšia pšeničná múka, presné typy sa líšia. | stredna | približné |
| Pšeničná múka celozrnná (`psenicna-muka-celozrnna`) | ciqual:9415 | Wheat flour, type 150 | Pšeničná múka typ 150 je celozrnná. | dobra |  |
| Špaldová múka svetlá (`spaldova-muka-biela`) | ciqual:9480 | Spelt flour | Špaldová múka bez určenia stupňa vymletia, svetlá nie je zaručená. | stredna | približné |
| Špaldová múka celozrnná (`spaldova-muka-celozrnna`) | fdc:2003587 | Flour, spelt, whole grain | Špaldová múka celozrnná, USDA Foundation. | dobra | približné (doplnené: nasyt, cukry) |
| Ražná múka celozrnná (`razna-muka`) | ciqual:9533 | Rye flour, type 130 | Ražná múka typ 130 (hrubšia, vyššie vymletie); T170 má nereálne nízke sacharidy (44,8 g) a vysokú vlákninu, nehodí sa ako typická múka. | stredna |  |
| Ovsená múka (`ovsena-muka`) | fdc:2261421 | Flour, oat, whole grain | Ovsená múka celozrnná, USDA Foundation. | dobra | približné (doplnené: nasyt, cukry) |
| Ovsené vločky (`ovsene-vlocky`) | ciqual:9310 | Oat, raw | Surový ovos (vločky sa jedia nevarené, kcal sedí). | dobra |  |
| Ovsené otruby (`ovsene-otruby`) | fdc:168872 | Oat bran, raw | Ovsené otruby surové; Ciqual 9640 má 361 kcal, čo je mimo nášho odhadu. | dobra |  |
| Pohánka lúpaná (`pohanka`) | ciqual:9380 | Buckwheat, wholegrain, raw | Pohánka celozrnná surová. | dobra | približné (doplnené: cukry) |
| Pohánková múka (`pohankova-muka`) | ciqual:9540 | Buckwheat flour | Pohánková múka. | dobra |  |
| Jahly (proso lúpané) (`jahly-proso`) | ciqual:9330 | Millet, wholegrain, raw | Proso celozrnné surové, jahly sú lúpané proso. | dobra | približné (doplnené: cukry) |
| Ryža biela dlhozrnná (`ryza-biela`) | ciqual:9100 | Rice, white, raw | Biela ryža surová. | dobra |  |
| Ryža natural (hnedá) (`ryza-natur`) | ciqual:9102 | Rice, wholegrain, raw | Celozrnná ryža surová. | dobra |  |
| Ryža basmati (`ryza-basmati`) | ciqual:9119 | Rice, basmati, raw | Basmati ryža surová. | dobra |  |
| Ryžová múka (`ryzova-muka`) | ciqual:9520 | Rice flour | Ryžová múka. | dobra | približné |
| Kuskus pšeničný (`kuskus`) | ciqual:9681 | Couscous (pre-cooked durum wheat semolina), raw | Kuskus predvarený z pšeničnej krupice, suchý. | dobra |  |
| Bulgur (`bulgur`) | ciqual:9690 | Wheat, bulgur, raw | Bulgur suchý surový. | dobra |  |
| Kukuričná múka (`kukuricna-muka`) | ciqual:9545 | Maize/corn flour | Kukuričná múka. | dobra |  |
| Kukuričná krupica (polenta) (`kukuricna-krupica`) | ciqual:9614 | Polenta or maize/corn semolina, pre-cooked, raw | Polenta/kukuričná krupica predvarená, suchá. | dobra | približné (doplnené: nasyt) |
| Jačmenné kroupy (`jacmenne-kroupy`) | ciqual:9321 | Pearled barley, raw | Jačmenné kroupy lúpané surové. | dobra |  |
| Pšeničná krupica (`psenicna-krupica`) | ciqual:9610 | Durum wheat semolina, raw | Krupica z tvrdej pšenice, slovenská je z mäkkej, zloženie je podobné. | stredna |  |
| Quinoa (`quinoa`) | ciqual:9340 | Quinoa, raw | Quinoa surová. | dobra | približné (doplnené: cukry) |
| Amarant (`amarant`) | ciqual:9345 | Amaranth, raw | Amarant surový. | dobra |  |
| Cícerová múka (`cicerova-muka`) | fdc:174288 | Chickpea flour (besan) | Cícerová múka (besan). | dobra |  |
| Šošovicová múka (`sosovicova-muka`) | ciqual:20359 | Lentil, dried (average) | Múka zo sušenej šošovice, použitá sušená šošovica (priemer). | stredna | približné |
| Mandľová múka (`mandlova-muka`) | fdc:2261420 | Flour, almond | Mandľová múka, USDA Foundation. | dobra | približné (doplnené: nasyt, cukry) |
| Kokosová múka (`kokosova-muka`) | fdc:2515382 | Flour, coconut | Kokosová múka, USDA Foundation. | dobra | približné (doplnené: cukry) |
| Kukurica na pukance (zrno) (`kukurica-pukancova`) | – (odhad) |  | Tabuľky nemajú surové pukancové zrno, len vypukané pukance (iný stav). | ziadna |  |
| Rožok biely (`rozok-biely`) | ciqual:7002 | Bread, French bread, with yeast | Biele kvasnicové francúzske pečivo, najbližšie rožku. | stredna |  |
| Chlieb pšenično-ražný (konzumný) (`chlieb-psenicno-razny`) | ciqual:7125 | Rye and wheat bread | Ražno-pšeničný chlieb. | dobra |  |
| Chlieb celozrnný pšeničný (`chlieb-celozrnny`) | ciqual:7110 | Bread, French bread, wholemeal or integral bread (made with flour type 150) | Celozrnný chlieb z múky typ 150. | dobra |  |
| Chlieb ražný kváskový tmavý (`chlieb-razny-kvaskovy`) | ciqual:7106 | Rye bread, whole grain, prepacked | Celozrnný ražný chlieb, kváskový spôsob výroby tabuľka neuvádza. | stredna |  |
| Toastový chlieb (`toastovy-chlieb`) | ciqual:7200 | Sandwich loaf, prepacked | Krájaný toastový chlieb balený. | dobra |  |
| Bageta (`bageta`) | ciqual:7001 | Bread, French bread, baguette | Francúzska bageta. | dobra |  |
| Tortilla pšeničná (`tortilla-psenicna`) | ciqual:7815 | Wheat tortilla wrap, to be filled | Pšeničná tortilla. | dobra |  |
| Tortilla kukuričná (`tortilla-kukuricna`) | fdc:175036 | Tortillas, ready-to-bake or -fry, corn | Kukuričná tortilla; Ciqual 7813 má 316 kcal, čo je mimo odhadu. | dobra |  |
| Pita chlieb (`pita`) | ciqual:7180 | Bread, pita | Pita chlieb. | dobra |  |
| Chrumkavý chlebíček ražný (`knackebrot-razny`) | fdc:172739 | Crackers, crispbread, rye | Ražný chrumkavý chlebíček (crispbread, rye). | dobra |  |
| Ryžové chlebíčky (nadúvané) (`ryzove-chlebicky`) | ciqual:7352 | Puffed rice textured bread, whole grain | Nadúvaný ryžový chlebíček celozrnný. | dobra |  |
| Strúhanka (`strouhanka`) | ciqual:7500 | Breadcrumbs | Strúhanka. | dobra |  |
| Cestoviny pšeničné sušené (`cestoviny-psenicne`) | ciqual:9810 | Pasta, dry, regular, raw | Cestoviny sušené bežné, surové. | dobra |  |
| Cestoviny celozrnné sušené (`cestoviny-celozrnne`) | ciqual:9870 | Pasta, dry, wholewheat, raw | Celozrnné cestoviny sušené, surové. | dobra |  |
| Cestoviny vaječné sušené (`cestoviny-vajecne`) | ciqual:9821 | Pasta, dry, with egg, raw | Vaječné cestoviny sušené, surové. | dobra |  |
| Cestoviny ryžové sušené (`cestoviny-ryzove`) | ciqual:9874 | Pasta, dry, gluten-free, raw | Bezlepkové sušené cestoviny, zloženie (ryža) nie je v názve určené. | stredna |  |
| Cestoviny cícerové sušené (`cestoviny-cicerove`) | – (odhad) |  | Tabuľky nemajú sušené cícerové cestoviny. | ziadna |  |
| Cestoviny šošovicové sušené (`cestoviny-sosovicove`) | – (odhad) |  | Ciqual má len varené šošovicové cestoviny, sušené chýbajú (iný stav). | ziadna |  |
| Zemiaky (`zemiaky`) | ciqual:4008 | Potato, peeled, raw | Zemiak olúpaný surový. | dobra | približné |
| Zemiaky nové (`zemiaky-nove`) | ciqual:4023 | Potato, new, raw | Nový zemiak surový. | dobra |  |
| Sladké zemiaky (batáty) (`sladke-zemiaky`) | ciqual:4101 | Sweet potato, raw | Surové batáty, kcal sedí. | dobra |  |
| Topinambur (`topinambur`) | ciqual:20196 | Jerusalem artichoke, raw | Surový topinambur. | dobra |  |
| Šošovica červená sušená (`sosovica-cervena`) | ciqual:20535 | Lentil, pink or red, dried | Červená šošovica sušená. | dobra | približné |
| Šošovica zelená/hnedá sušená (`sosovica-zelena`) | ciqual:20585 | Lentil, green, dried | Zelená šošovica sušená. | dobra | približné |
| Cícer sušený (`cicer-suseny`) | ciqual:20516 | Chick pea, dried | Cícer sušený. | dobra |  |
| Cícer konzervovaný (scedený) (`cicer-konzerva`) | ciqual:20532 | Chick pea, canned, drained | Cícer konzervovaný, scedený. | dobra |  |
| Fazuľa biela sušená (`fazula-biela`) | ciqual:20501 | Haricot bean, dried | Sušená fazuľa (haricot), tabuľka nerozlišuje odrodu bielej. | dobra | približné (doplnené: cukry) |
| Fazuľa červená sušená (`fazula-cervena`) | ciqual:20525 | Red kidney bean, dried | Červená fazuľa sušená. | dobra |  |
| Fazuľa červená konzervovaná (scedená) (`fazula-cervena-konzerva`) | ciqual:20524 | Red kidney bean, canned, drained | Červená fazuľa konzervovaná, scedená. | dobra |  |
| Fazuľa čierna sušená (`fazula-cierna`) | fdc:173734 | Beans, black, mature seeds, raw | Čierna fazuľa surová (suchá) z USDA, Ciqual ju nemá. | dobra |  |
| Hrach lúpaný sušený (`hrach-suseny`) | ciqual:20515 | Split pea, dried | Lúpaný sušený hrach (split pea). | dobra |  |
| Hrášok zelený mrazený (`hrasok-mrazeny`) | ciqual:20084 | Garden peas, frozen, raw | Mrazený hrášok surový (nevarený); recept ho zvyčajne ďalej varí. | stredna |  |
| Fazuľa mungo sušená (`mungo-fazula`) | ciqual:20530 | Beans, mung, mature, seeds, dried | Sušená mungo fazuľa. | dobra | približné (doplnené: cukry) |
| Sójové bôby sušené (`sojove-boby`) | ciqual:20901 | Soybean, seed, whole | Celé sójové zrno; tabuľka neuvádza výslovne sušené, kcal sedí na suché. | stredna |  |
| Tofu natural (`tofu-natur`) | fdc:172476 | Tofu, raw, regular, prepared with calcium sulfate | Obyčajné tofu (regular) sedí s odhadom 80 kcal; Ciqual tofu je pevné (147 kcal), typ v recepte nie je jasný. | stredna |  |
| Tempeh (`tempeh`) | fdc:174272 | Tempeh | USDA Tempeh sedí s odhadom (192 kcal, 20 g bielkovín, 10,8 g tuku); Ciqual tempeh má nižšie tuky (4,7 g). | dobra | približné (doplnené: cukry, vlak) |
| Edamame mrazené (bôby) (`edamame-mrazene`) | fdc:168410 | Edamame, frozen, unprepared | Mrazené edamame nepripravené. | dobra | približné (doplnené: nasyt) |
| Mrkva (`mrkva`) | ciqual:20009 | Carrot, raw | Surová mrkva. | dobra | približné |
| Cibuľa (`cibula`) | ciqual:20034 | Onion, raw | Surová cibuľa. | dobra |  |
| Cesnak (`cesnak`) | ciqual:11000 | Garlic, raw | Surový cesnak. | dobra | približné |
| Pór (`por`) | ciqual:20039 | Leek, raw | Surový pór; náš odhad 61 kcal je zrejme privysoký. | dobra |  |
| Paradajka (`paradajka`) | ciqual:20385 | Tomato, raw (average) | Surová paradajka (priemer). | dobra | približné |
| Uhorka šalátová (`uhorka`) | ciqual:20019 | Cucumber, flesh and skin, raw | Surová uhorka s kôrou. | dobra |  |
| Paprika červená (`paprika-cervena`) | ciqual:20087 | Sweet pepper, red, raw | Surová červená paprika. | dobra | približné |
| Cuketa (`cuketa`) | ciqual:20020 | Courgette or zucchini, flesh and skin, raw | Surová cuketa. | dobra |  |
| Baklažán (`baklazan`) | ciqual:20053 | Eggplant, raw | Surový baklažán. | dobra |  |
| Brokolica (`brokolica`) | ciqual:20057 | Broccoli, raw | Surová brokolica. | dobra |  |
| Karfiol (`karfiol`) | ciqual:20016 | Cauliflower, raw | Surový karfiol. | dobra |  |
| Kapusta biela (`kapusta-biela`) | ciqual:20116 | White cabbage, raw | Surová biela kapusta. | dobra |  |
| Kapusta červená (`kapusta-cervena`) | ciqual:20014 | Red cabbage, raw | Surová červená kapusta. | dobra | približné |
| Kel kučeravý (`kel`) | ciqual:20218 | Curly kale, raw | Surový kučeravý kel. | dobra |  |
| Kel ružičkový (`ruzickovy-kel`) | ciqual:20058 | Brussels sprout, raw | Surový ružičkový kel. | dobra |  |
| Špenát (`spenat`) | ciqual:20059 | Spinach, raw | Surový špenát; náš odhad je nižší, stav rovnaký. | dobra |  |
| Šalát hlávkový (`salat-hlavkovy`) | ciqual:20031 | Lettuce, raw | Surový hlávkový šalát. | dobra |  |
| Rukola (`rukola`) | ciqual:20217 | Roman rocket, raw | Surová rukola (roman rocket). | dobra |  |
| Kaleráb (`kalerab`) | ciqual:20065 | Kohlrabi, raw | Surový kaleráb. | dobra |  |
| Repa červená (`repa-cervena`) | ciqual:20091 | Beetroot, raw | Surová červená repa. | dobra |  |
| Zeler buľvový (`zeler-bulvovy`) | ciqual:20055 | Celeriac, raw | Surový zeler buľvový. | dobra | približné |
| Petržlen koreňový (`petrzlen-korenovy`) | – (odhad) |  | Ani Ciqual ani USDA nemá petržlenový koreň; petržlenová vňať je iná surovina. | ziadna |  |
| Pastinák (`pastinak`) | ciqual:20181 | Parsnip, raw | Surový pastinák. | dobra |  |
| Tekvica hokkaido (`tekvica-hokkaido`) | ciqual:20132 | Red kuri squash, flesh without skin, raw | Hokkaido je odroda red kuri, surová dužina bez šupy; kcal pod naším odhadom. | stredna |  |
| Tekvica maslová (`tekvica-maslova`) | ciqual:20138 | Squash, butternut, flesh without skin, raw | Butternut, surová dužina bez šupy. | dobra |  |
| Kukurica sladká (zrná) (`kukurica-sladka`) | fdc:169998 | Corn, sweet, yellow, raw | Surová sladká kukurica (zrná), kcal 86 a sacharidy 18,7 g sedia lepšie ako mrazená z Ciqualu. | dobra |  |
| Fazuľové struky (`fazulove-struky`) | ciqual:20061 | French bean, raw | Surová zelená fazuľka. | dobra |  |
| Špargľa (`spargla`) | ciqual:20279 | Asparagus, green, raw | Surová zelená špargľa. | dobra |  |
| Reďkovka (`redkovka`) | ciqual:20045 | Radish, raw | Surová reďkovka. | dobra | približné |
| Fenikel (buľva) (`fenikel`) | ciqual:20028 | Fennel, raw | Surová fenikelová buľva. | dobra | približné |
| Kapusta kvasená (`kvasena-kapusta`) | fdc:169279 | Sauerkraut, canned, solids and liquids | Kvasená kapusta konzervovaná z USDA; Ciqual má len pripravené jedlo so slaninou. | stredna |  |
| Uhorky kyslé nakladané (`kysle-uhorky`) | ciqual:11004 | Gherkin, pickled in vinegar | Uhorky nakladané v octe. | dobra | približné |
| Šampiňóny (`sampinony`) | ciqual:20056 | Button mushroom or cultivated mushroom, raw | Surový pestovaný šampiňón. | dobra |  |
| Hliva ustricová (`hliva-ustricova`) | ciqual:20114 | Oyster mushroom, raw | Surová hliva ustricová. | dobra |  |
| Paradajky krájané konzervované (`paradajky-konzervovane`) | ciqual:20137 | Tomato, peeled, canned, in juice, solids and liquids | Lúpané paradajky v konzerve s lisom, kcal sedí. | dobra |  |
| Jablko (`jablko`) | ciqual:13396 | Apple, flesh without skin, raw (average) | Surové jablko bez šupky, priemer. | dobra | približné |
| Hruška (`hruska`) | ciqual:13397 | Pear, flesh without skin, raw (average) | Surová hruška, priemer. | dobra | približné |
| Banán (`banan`) | ciqual:13005 | Banana, flesh without skin, raw | Surový banán bez šupky. | dobra | približné |
| Pomaranč (`pomaranc`) | ciqual:13034 | Orange, flesh without skin, without seeds, raw | Surový pomaranč. | dobra | približné |
| Mandarínka (`mandarinka`) | ciqual:13024 | Clementine or Mandarin orange, flesh without skin, without seeds, raw | Surová klementínka/mandarínka. | dobra | približné |
| Citrón (`citron`) | ciqual:13009 | Lemon, flesh without skin, without seeds, raw | Surový citrón bez šupky. | dobra | približné |
| Jahody (`jahody`) | ciqual:13014 | Strawberry, raw | Surové jahody. | dobra | približné |
| Maliny (`maliny`) | ciqual:13015 | Raspberry, raw | Surové maliny. | dobra | približné |
| Čučoriedky (`cucoriedky`) | ciqual:13028 | Blueberry, raw | Surové čučoriedky. | dobra |  |
| Ríbezle čierne (`ribezle-cierne`) | ciqual:13007 | Black currant, raw | Surové čierne ríbezle. | dobra |  |
| Slivky (`slivky`) | ciqual:13100 | Plum, flesh and skin, pitted, raw | Surové slivky. | dobra |  |
| Marhule (`marhule`) | ciqual:13000 | Apricot, pitted, raw | Surové marhule. | dobra | približné |
| Broskyňa (`broskyna`) | ciqual:13043 | Peach, flesh and skin, pitted, raw | Surová broskyňa. | dobra | približné |
| Čerešne (`ceresne`) | ciqual:13008 | Cherry, flesh and skin, pitted, raw | Surové čerešne; kcal o 15 % nižšie než odhad. | dobra | približné |
| Hrozno (`hrozno`) | ciqual:13395 | Grape, raw (average) | Surové hrozno, priemer. | dobra | približné |
| Melón vodový (`melon-vodovy`) | ciqual:13036 | Watermelon, flesh without skin, without seeds, raw | Surový vodový melón. | dobra | približné |
| Kiwi (`kiwi`) | ciqual:13021 | Kiwi fruit, flesh without skin, with seeds, raw | Surové kiwi. | dobra | približné |
| Ananás (`ananas`) | ciqual:13002 | Pineapple, flesh without skin, raw | Surový ananás. | dobra | približné |
| Mango (`mango`) | ciqual:13025 | Mango, flesh without skin, pitted, raw | Surové mango. | dobra | približné |
| Avokádo (`avokado`) | fdc:171705 | Avocados, raw, all commercial varieties | Ciqual má 203 kcal (inak tučné), USDA 160 kcal sedí s odhadom. | dobra |  |
| Hrozienka sušené (`hrozienka`) | ciqual:13046 | Raisin | Sušené hrozienka. | dobra |  |
| Datle sušené (`datle-susene`) | ciqual:13011 | Date, flesh and skin, pitted, dried | Sušené datle. | dobra |  |
| Slivky sušené (`slivky-susene`) | ciqual:13042 | Prune, pitted | Sušené slivky (sušené, bez kôstky). | dobra | približné |
| Marhule sušené (`marhule-susene`) | ciqual:13001 | Apricot, pitted, dried | Sušené marhule. | dobra | približné |
| Figy sušené (`figy-susene`) | ciqual:13013 | Fig, dried | Sušené figy. | dobra |  |
| Kuracie prsia (bez kože) (`kuracie-prsia`) | ciqual:36017 | Chicken, breast, without skin, raw | Surové kuracie prsia bez kože. | dobra | približné |
| Kuracie stehno (s kožou) (`kuracie-stehno`) | ciqual:36002 | Chicken, leg, meat and skin, raw | Surové kuracie stehno s kožou. | dobra | približné |
| Kuracie stehno bez kože a kosti (`kuracie-stehno-bez-kozy`) | ciqual:36024 | Chicken, leg, meat, raw | Surové kuracie stehno bez kože; kcal o 16 % nižšie než odhad. | stredna |  |
| Kuracie krídelká (`kuracie-kridla`) | ciqual:36023 | Chicken, wing, meat and skin, raw | Surové kuracie krídla s kožou; kcal o 16 % nižšie než odhad. | stredna |  |
| Kuracie mleté mäso (`kuracie-mlete`) | fdc:171116 | Chicken, ground, raw | USDA surové mleté kuracie, kcal sedí; tuk závisí od výrobku. | stredna |  |
| Kuracie kosti a chrbty na vývar (`kuraci-chrbat`) | – (odhad) |  | Kosti a chrbty na vývar sa v tabuľkách nedajú zhodnotiť; položky sú buď len mäso, alebo mäso s kožou s inou kalorickosťou. | ziadna |  |
| Kuracia pečeň (`kuracia-pecen`) | ciqual:40111 | Liver, chicken, raw | Surová kuracia pečeň. | dobra |  |
| Morčacie prsia (`morcacie-prsia`) | ciqual:36304 | Turkey, escalope, raw | Surový morčací rezeň (prsia). | dobra |  |
| Morčacie mleté mäso (`morcacie-mlete`) | fdc:171505 | Turkey, Ground, raw | USDA surové mleté morčacie, kcal sedí; tuk závisí od výrobku. | stredna |  |
| Bravčová krkovička (`bravcova-krkovicka`) | ciqual:28009 | Pork shoulder, raw | Surové bravčové plece/krkovička; kcal o 17 % nižšie. | stredna |  |
| Bravčový karé / panenka (`bravcova-panenka`) | ciqual:28204 | Pork, filet mignon, raw | Surová bravčová panenka (filet mignon); karé je tučnejšie. | stredna |  |
| Bravčové stehno (`bravcova-stehno`) | ciqual:28473 | Pork, way leg, without rind, fat and bone, raw | Surové bravčové stehno bez kože, tuku a kosti. | dobra |  |
| Bravčové mleté mäso (`bravcove-mlete`) | fdc:167902 | Pork, fresh, ground, raw | USDA surové mleté bravčové, kcal sedí. | dobra | približné (doplnené: cukry) |
| Bravčové rebrá (`bravcove-rebra`) | ciqual:28400 | Pork, spare-ribs, raw | Surové bravčové rebrá; kcal o 18 % nižšie, ale bez kosti nejasné. | stredna |  |
| Hovädzie zadné (na guláš, dusenie) (`hovadzie-zadne`) | ciqual:6231 | Beef, stewing meat, raw | Surové hovädzie mäso na dusenie. | dobra |  |
| Hovädzie mleté mäso (`hovadzie-mlete`) | ciqual:6254 | Beef, minced steak, 15% fat, raw | Surové mleté hovädzie 15 % tuku. | dobra |  |
| Hovädzí steak / sviečková (`hovadzie-steak`) | ciqual:6116 | Beef, tenderloin, raw | Surová hovädzia sviečková; kcal o 17 % nižšie. | stredna | približné |
| Hovädzie predné (na vývar, polievku) (`hovadzie-predne`) | ciqual:6270 | Beef, chuck, raw | Surová hovädzia hrudná/pliecková časť (chuck). | stredna |  |
| Teľacie mäso (`telacie-maso`) | ciqual:6560 | Veal, shoulder, raw | Surové teľacie plece; druh kusu nešpecifikovaný. | stredna |  |
| Králičie mäso (`kralik`) | fdc:172521 | Game meat, rabbit, domesticated, composite of cuts, raw | USDA surový domáci králik, kcal sedí (Ciqual 188 je príliš tučné). | dobra | približné (doplnené: cukry) |
| Losos (filet) (`losos`) | ciqual:26036 | Salmon, raw, farmed | Surový chovaný losos. | dobra | približné |
| Treska (filet) (`treska`) | ciqual:26043 | Cod, raw | Surová treska. | dobra | približné |
| Pstruh (`pstruh`) | ciqual:27009 | Rainbow trout, raw, farmed | Surový chovaný pstruh dúhový. | dobra | približné |
| Makrela čerstvá / údená (`makrela-cerstva`) | ciqual:26051 | Mackerel, raw | Surová makrela; údená verzia by mala viac kcal. | stredna | približné |
| Sardinky v konzerve (vo vlastnej šťave/oleji) (`sardinky-konzerva`) | ciqual:26034 | European pilchard or sardine, in oil, canned, drained | Sardinky v oleji, scedené. | dobra |  |
| Tuniak v konzerve (vo vlastnej šťave) (`tuniak-konzerva`) | ciqual:26181 | Yellowfin tuna, canned in brine, drained | Tuniak v slanom náleve, scedený. | dobra |  |
| Tuniak v konzerve v oleji (`tuniak-v-oleji`) | ciqual:26180 | Tuna, whole slice, in sunflower oil, canned, drained | Tuniak v slnečnicovom oleji, scedený. | dobra | približné (doplnené: cukry) |
| Sleď marinovaný (`slede-marinovany`) | ciqual:26010 | Atlantic herring, marinated, or rollmops, prepacked | Sleď marinovaný (rollmops). | dobra |  |
| Kapor (`kapor`) | ciqual:27003 | Carp, raw, farmed | Kapor surový, farmový. | dobra | približné |
| Rybie filé mrazené (hoki, treska alaska) (`ryba-fileje-mrazene`) | ciqual:26006 | Alaska pollock, raw | Aljašská treska (pollock) surová, najbližšie k mrazeným filé. | dobra | približné |
| Krevety (`krevety`) | ciqual:10007 | Shrimp or prawn, boiled | Krevety varené; surové sú v tabuľke s nezvyčajnými sacharidmi. | stredna |  |
| Surimi (krabie tyčinky) (`surimi`) | ciqual:26046 | Surimi, on sticks, in slices or grated, crab flavour | Surimi s krabou príchuťou na tyčinkách. | dobra |  |
| Šunka kuracia / morčacia (plátky) (`sunka-kuracia`) | ciqual:28963 | Cooked ham, from chicken, in slices | Kuracia varená šunka v plátkoch. | dobra |  |
| Šunka bravčová (plátky) (`sunka-bravcova`) | ciqual:28900 | Cooked ham, superior quality | Varená bravčová šunka vyššej kvality. | dobra | približné |
| Šunka dedinská / údená (`sunka-dedinska`) | ciqual:28803 | Cooked ham, smoked | Varená údená šunka, dedinská je približne podobná. | stredna |  |
| Saláma (Vysočina, Herkules, Lovecká) (`salama-vysociny`) | fdc:174582 | Salami, dry or hard, pork, beef | Trvanlivá saláma bravčovo-hovädzia; generická Ciqual "Salami" (457 kcal) je výrazne tučnejšia než Vysočina/Herkules. | stredna |  |
| Klobása údená (`klobasa-udena`) | – (odhad) |  | položka Ciqual 30102 nemá v tabuľke údaj o tukoch, preto sa nepoužila | ziadna |  |
| Slanina údená (`slanina-udena`) | fdc:168277 | Pork, cured, bacon, unprepared | Údená slanina, americká je o 20 % menej tučná než náš odhad. | stredna |  |
| Bravčová slanina / špek surový (`slanina-bravcova-surova`) | ciqual:28470 | Pork, back fat, rind less, raw | Bravčový chrbtový tuk bez kože; špek má o niečo viac mäsa. | stredna |  |
| Párky (hovädzie/bravčové) (`parky`) | ciqual:30134 | Frankfurter sausage | Frankfurterské párky. | dobra | približné |
| Párky kuracie (`parky-kuracie`) | ciqual:30131 | Poultry sausage, knack-style | Hydinová klobása typu knack. | dobra |  |
| Šunková saláma / mortadela (`sunkova-salama`) | fdc:173856 | Bologna, pork | Bravčová varená saláma (typ bologna) je bližšie k šunkovej saláme než mortadella (viac tuku, pistácie). | stredna |  |
| Paštéta pečeňová (`pastika-pecenova`) | ciqual:8305 | Pork liver pâté | Bravčová pečeňová paštéta. | stredna |  |
| Tlačenka / jaternica (`tlacenka`) | – (odhad) |  | Tlačenka a jaternica sú rôzne výrobky, jedna položka ich nepokryje. | ziadna |  |
| Mlieko polotučné 1,5 % (`mlieko-polotucne`) | ciqual:19033 | Milk, semi-skimmed (average) | Polotučné mlieko, priemer. | dobra |  |
| Mlieko plnotučné 3,5 % (`mlieko-plnotucne`) | ciqual:19016 | Milk, whole (average) | Plnotučné mlieko, priemer. | dobra |  |
| Mlieko bezlaktózové (`mlieko-bezlaktozove`) | ciqual:19060 | Milk, semi-skimmed, UHT, reduced lactose | Polotučné UHT mlieko so zníženým obsahom laktózy. | dobra |  |
| Jogurt biely (bez cukru) (`jogurt-biely`) | ciqual:19600 | Yoghurt or fermented milk, plain (average) | Biely jogurt, priemer. | dobra |  |
| Jogurt grécky (`jogurt-grecky`) | fdc:171304 | Yogurt, Greek, plain, whole milk | Grécky biely jogurt plnotučný; Ciqual "Greek-style" je smotanový jogurt s 3 g bielkovín, nie strained. | dobra |  |
| Jogurt ovocný (slazený) (`jogurt-ovocny`) | ciqual:19587 | Yogurt or fermented milk, with fruits, with sugar(s) | Jogurt s ovocím a cukrom. | dobra |  |
| Kefír (`kefir`) | ciqual:19805 | Fermented milk drink, plain, whole milk | Fermentovaný mliečny nápoj biely z plnotučného mlieka, najbližší kefíru. | stredna | približné |
| Cmar / acidko (`cmar`) | fdc:170874 | Milk, buttermilk, fluid, cultured, lowfat | Cmar (cultured buttermilk) nízkotučný. | dobra |  |
| Tvaroh mäkký (`tvaroh-makky`) | ciqual:19664 | Fresh cream cheese, petit-suisse type, plain, around 4% fat | Ciqual "Quark" je francúzsky fromage blanc (7 g bielkovín), slovenský mäkký tvaroh má ~12 g; petit-suisse 4 % tuku (9,7 g bielk.) je najbližšia nesolená čerstvá syrová hmota. Približné. | stredna | približné |
| Tvaroh polotučný (`tvaroh-polotucny`) | ciqual:19664 | Fresh cream cheese, petit-suisse type, plain, around 4% fat | Predošlá položka Quark 7-8 % mala len 5,6 g bielkovín a viac tuku; petit-suisse ~4 % tuku, 9,7 g bielk. je bližšie k polotučnému tvarohu (~5 % tuku). Približné. | stredna | približné |
| Cottage syr (`cottage`) | fdc:172179 | Cheese, cottage, creamed, large or small curd | Cottage syr s smotanou, americká tabuľka. | dobra |  |
| Bryndza ovčia (`bryndza`) | ciqual:12066 | Feta cheese, 70% min. from ewe's milk, 30% min. from goat's milk | Feta z ovčieho a kozieho mlieka, najbližšia soľou aj ovčím mliekom. | stredna | približné |
| Parmezán (`parmezan`) | ciqual:12120 | Parmesan cheese, from cow's milk | Parmezán. | dobra | približné |
| Syr Eidam 30 % (`syr-eidam`) | ciqual:12705 | Firm cheese, Maasdam-type, reduced fat, from cow's milk | Maasdam znížený tuk; edam so 30 % v tabuľke chýba. | stredna |  |
| Syr Eidam 45 % / Gouda (`syr-eidam-45`) | ciqual:12736 | Gouda cheese, from cow's milk | Gouda z kravského mlieka. | dobra | približné |
| Mozzarella (`mozzarella`) | ciqual:19590 | Mozzarella cheese, from cow's milk | Mozzarella z kravského mlieka. | dobra |  |
| Feta / balkánsky syr (`feta`) | ciqual:12066 | Feta cheese, 70% min. from ewe's milk, 30% min. from goat's milk | Feta z ovčieho a kozieho mlieka. | dobra | približné |
| Niva / modrý syr (`niva`) | ciqual:12520 | Blue cheese, from cow's milk | Modrý syr z kravského mlieka. | dobra |  |
| Syr taviaci (trojuholníčky) (`syr-taviaci`) | ciqual:12303 | Processed cheese, from cow's milk, triangle, not fortified | Taviaci syr trojuholníčky. | dobra |  |
| Smotana na varenie 15 % (`smotana-na-varenie`) | ciqual:19436 | Cream, 12-20% fat, light, fluid, refrigerated | Smotana 12-20 % tuku tekutá. | dobra |  |
| Smotana šľahačková 33 % (`smotana-sladka`) | ciqual:19417 | Cream 30% fat, liquid, UHT | Smotana 30 % tuku tekutá UHT. | dobra |  |
| Smotana kyslá 12 % (`smotana-kysla`) | fdc:173443 | Sour cream, light | Kyslá smotana o nižšom tuku (~10,6 g); Ciqual položka 12-25 % tuku mala 14,4 g a 162 kcal. Sacharidy USDA mierne vyššie. | stredna |  |
| Mascarpone (`mascarpone`) | ciqual:19584 | Mascarpone cheese, from cow's milk | Mascarpone. | dobra | približné |
| Maslo (`maslo`) | ciqual:16400 | Butter, 80% fat minimum, unsalted | Maslo 80 % tuku nesolené. | dobra |  |
| Maslo roztierateľné (Rama, Flora) (`maslo-pomazankove`) | ciqual:16410 | Butter, 60-62% fat, light, unsalted | Maslo s 60 % tuku; Rama/Flora je podobný roztierateľný tuk. | stredna | približné |
| Maslo prepustené (ghee) (`maslo-prepustene`) | ciqual:16401 | Butter oil or concentrated butter | Maslový olej (ghee). | dobra |  |
| Vajce slepačie (M) (`vajce-slepacie`) | ciqual:22000 | Egg, raw | Vajce celé surové. | dobra |  |
| Vaječný bielok (`vajce-bielok`) | ciqual:22001 | Egg white, raw | Vaječný bielok surový. | dobra |  |
| Vaječný žĺtok (`vajce-zltok`) | ciqual:22002 | Egg yolk, raw | Vaječný žĺtok surový. | dobra |  |
| Vajce prepeličie (`vajce-prepelicie`) | ciqual:22050 | Quail egg, raw | Surové prepeličie vajce, rovnaký druh a stav. | dobra |  |
| Olej repkový (`olej-repkovy`) | ciqual:17130 | Rapeseed oil | Repkový olej, rovnaký druh. | dobra | približné |
| Olej slnečnicový (`olej-slnecnicovy`) | ciqual:17440 | Sunflower oil | Slnečnicový olej, rovnaký druh. | dobra | približné |
| Olivový olej extra panenský (`olej-olivovy`) | ciqual:17270 | Olive oil, extra virgin | Extra panenský olivový olej, rovnaký druh. | dobra | približné |
| Olej ľanový (za studena) (`olej-lanovy`) | ciqual:17180 | Linseed oil | Ľanový olej, rovnaký druh. | dobra |  |
| Kokosový olej (`olej-kokosovy`) | ciqual:16040 | Coconut fat or oil | Kokosový tuk/olej, rovnaký druh. | dobra |  |
| Olej tekvicový (`olej-tekvicovy`) | – (odhad) |  | Tekvicový olej sa v tabuľkách nenašiel a iný olej by mal inú mastnokyselinovú skladbu. | ziadna |  |
| Bravčová masť (`mast-bravcova`) | ciqual:16520 | Lard or pork fat | Bravčová masť, rovnaký druh. | dobra |  |
| Vlašské orechy (`vlasske-orechy`) | ciqual:15005 | Walnut, kernel, dried | Sušené vlašské orechy bez škrupiny, kcal sedí. | dobra | približné |
| Lieskové orechy (`liesikove-orechy`) | ciqual:15004 | Hazelnut, no added salt | Lieskové orechy bez pridanej soli, surové. | dobra | približné |
| Mandle (`mandle`) | ciqual:15000 | Almond, with peel, no added salt | Mandle s šupkou bez soli, zodpovedá bežným mandliam. | dobra | približné |
| Kešu orechy (`kesu`) | ciqual:15054 | Cashew nut, grilled, no added salt | Kešu pražené bez soli; surová verzia v Ciquale chýba. | stredna |  |
| Arašidy nesolené (`arasidy`) | ciqual:15001 | Peanut, no added salt | Arašidy bez pridanej soli. | dobra |  |
| Arašidové maslo (100 % arašidy) (`arasidove-maslo`) | ciqual:15202 | Peanut butter or peanut paste | Arašidové maslo z arašidov, rovnaký produkt. | dobra |  |
| Pistácie (`pistacie`) | ciqual:15044 | Pistachio nut, grilled, no added salt | Pistácie pražené bez soli; surová verzia v Ciquale chýba, kcal o 13 % vyššie. | stredna |  |
| Pekanové orechy (`pekanove-orechy`) | ciqual:15026 | Pecan nut, no added salt | Pekanové orechy bez soli. | dobra |  |
| Slnečnicové semienka (`slnecnicove-semienka`) | ciqual:15011 | Sunflower, seed | Slnečnicové semienka, nepražené a nesolené. | dobra |  |
| Tekvicové semienka (`tekvicove-semienka`) | ciqual:15064 | Pumpkin and squash, seed, dried | Sušené tekvicové semienka, kcal sedí. | dobra |  |
| Chia semienka (`chia`) | ciqual:15047 | Chia, seed, dried | Sušené chia semienka. | dobra | približné (doplnené: cukry) |
| Ľanové semienka (`lan-semienka`) | ciqual:15034 | Flaxseed, seed | Ľanové semienka, rovnaký druh. | dobra |  |
| Sezamové semienka (`sezam`) | ciqual:15010 | Sesame seed | Sezamové semienka, rovnaký druh. | dobra | približné |
| Tahini (sezamová pasta) (`tahini`) | ciqual:15203 | Tahini (sesame paste) | Tahini zo sezamu, rovnaký produkt. | dobra |  |
| Mak jedlý (`mak`) | ciqual:11061 | Poppy, seed | Makové semienka, rovnaký druh. | dobra |  |
| Kokos strúhaný (`kokos-struhany`) | ciqual:15007 | Coconut, pulp, dried | Sušená kokosová dužina zodpovedá strúhanému kokosu. | dobra |  |
| Konopné semienka lúpané (`konopne-semienka`) | ciqual:15063 | Hemp, seed, hulled | Lúpané konopné semienka. | dobra |  |
| Soľ kuchynská (`sol`) | ciqual:11017 | Salt, white (sea, igneous or rock), no fortification | Biela kuchynská soľ bez fortifikácie. | dobra |  |
| Čierne korenie mleté (`korenie-cierne`) | ciqual:11015 | Black pepper, powder | Mleté čierne korenie; kcal o 32 % vyššie než odhad, no druh sedí. | dobra |  |
| Paprika sladká mletá (`paprika-sladka`) | ciqual:11049 | Paprika, powder | Mletá paprika (korenina). | dobra |  |
| Paprika pálivá mletá / chilli (`paprika-palivo`) | ciqual:11088 | Cayenne pepper, powder | Mletá kajenská paprika je najbližšia pálivá mletá paprika/chilli. | stredna |  |
| Rasca (`rasca`) | ciqual:11064 | Caraway, seed | Rasca (semená), rovnaký druh. | dobra |  |
| Majorán sušený (`majoran`) | ciqual:11034 | Marjoram, dried | Sušený majorán. | dobra |  |
| Oregano sušené (`oregano`) | ciqual:11035 | Oregano, dried | Sušené oregano. | dobra |  |
| Bazalka (čerstvá / sušená) (`bazalka`) | ciqual:11033 | Basil, fresh | Čerstvá bazalka; naša položka mieša čerstvú aj sušenú, kcal odhadu zodpovedá čerstvej. | stredna |  |
| Tymián (`tymian`) | ciqual:11070 | Thyme, fresh | Čerstvý tymian zodpovedá nášmu odhadu 100 kcal; stav v recepte nie je určený. | stredna | približné (doplnené: cukry) |
| Petržlenová vňať (`petrzlenova-vnat`) | ciqual:11014 | Parsley, fresh | Čerstvá petržlenová vňať. | dobra |  |
| Kôpor čerstvý (`kopor`) | ciqual:11093 | Dill, fresh | Čerstvý kôpor. | dobra |  |
| Pažítka (`pazitka`) | ciqual:11003 | Chive or spring onion, fresh | Čerstvá pažítka (položka spája pažítku a jarnú cibuľku). | dobra |  |
| Kurkuma mletá (`kurkuma`) | ciqual:11089 | Turmeric, powder | Mletá kurkuma. | dobra |  |
| Škorica mletá (`skorica`) | ciqual:11025 | Cinnamon, powder | Mletá škorica. | dobra |  |
| Zázvor čerstvý (`zazvor`) | fdc:169231 | Ginger root, raw | USDA surový zázvorový koreň (80 kcal, 17,8 g sacharidov) zodpovedá surovému zázvoru; Ciqual 11074 má len 33 kcal a 3,4 g sacharidov (sacharidy bez vlákniny, nižšia energia), čo nesedí. | dobra |  |
| Cesnak granulovaný / sušený (`cesnak-granulovany`) | ciqual:11023 | Garlic, dried, powder | Sušený cesnak v prášku. | dobra |  |
| Bobkový list (`bobkovy-list`) | ciqual:11053 | Bay, leaves | Bobkový list. | dobra |  |
| Koriander mletý / rascový mix (`koriander-mlety`) | ciqual:11026 | Coriander, seed | Koriandrové semená; položka je zmes s rascou, takže iba približná zhoda. | stredna | približné (doplnené: cukry) |
| Vanilkový cukor (`vanilkovy-cukor`) | ciqual:31044 | Sugar, vanilla flavoured | Vanilkový cukor, rovnaký produkt. | dobra |  |
| Prášok do pečiva (`prasok-do-peciva`) | fdc:172804 | Leavening agents, baking powder, double-acting, straight phosphate | Prášok do pečiva (fosfátový) zodpovedá nášmu odhadu; Ciqual má 108 kcal, čo je mimo odhadu. | stredna |  |
| Sóda bikarbóna (`soda-bikarbona`) | ciqual:11507 | Sodium bicarbonate | Hydrogenuhličitan sodný, rovnaká látka. | dobra |  |
| Vegeta / korenie univerzálne (`vegeta`) | – (odhad) |  | Vegeta je soľno-zeleninová zmes; sušený vývar (287 kcal) je iný produkt a o 51 % mimo odhadu. | ziadna |  |
| Cukor kryštálový (`cukor-biely`) | ciqual:31016 | Sugar, white | Biely cukor. | dobra |  |
| Cukor trstinový (`cukor-trstinovy`) | ciqual:31017 | Sugar, brown | Hnedý cukor je najbližší trstinovému; presná zhoda s trstinovým chýba. | stredna |  |
| Cukor práškový (`cukor-pudrovy`) | fdc:169656 | Sugars, powdered | Práškový cukor v USDA, Ciqual ho nemá samostatne. | dobra |  |
| Med (`med`) | ciqual:31008 | Honey | Med, kcal 331 vs. náš odhad 304. | dobra |  |
| Javorový sirup (`javorovy-sirup`) | ciqual:31034 | Maple syrup | Javorový sirup, rovnaká potravina. | dobra |  |
| Datle sušené (`datle`) | ciqual:13011 | Date, flesh and skin, pitted, dried | Datle sušené, bez kôstky, rovnaký stav. | dobra |  |
| Datľový sirup (`datlovy-sirup`) | – (odhad) |  | V tabuľkách nie je datľový sirup, nepriraďujem inú potravinu. | ziadna |  |
| Agávový sirup (`agavovy-sirup`) | fdc:170277 | Sweetener, syrup, agave | Agávový sirup, kcal 310 presne sedí (Ciqual nemá kcal). | dobra |  |
| Erytritol (`erytritol`) | – (odhad) |  | Erytritol v tabuľkách nie je (v EÚ sa vedie ako 0 kcal, tabuľky ho nemajú). | ziadna |  |
| Stévia (sladidlo) (`stevia`) | ciqual:31087 | Stevia sweetener | Sladidlo so stéviou, tabuľková hodnota je pre bežný stolový prípravok, zloženie sa líši podľa výrobku. | stredna | približné |
| Kakao holandské (neslazené) (`kakao`) | fdc:169594 | Cocoa, dry powder, unsweetened, processed with alkali | Kakao neslazené, spracované alkáliou (holandské), kcal 220 vs. 230. | dobra |  |
| Kečup (`kecup`) | ciqual:11008 | Ketchup, prepacked | Kečup balený, kcal 108 vs. 105. | dobra |  |
| Horčica (`horcica`) | fdc:172234 | Mustard, prepared, yellow | Horčica pripravená (žltá), kcal 60 vs. 90; Ciqual horčica má 151, druhy sa líšia. | stredna |  |
| Majonéza (`majoneza`) | ciqual:11054 | Mayonnaise (70% fat min.), prepacked | Majonéza min. 70 % tuku, kcal 692 vs. 680. | dobra |  |
| Sójová omáčka (`sojova-omacka`) | ciqual:11104 | Soy sauce, prepacked | Sójová omáčka, kcal 40 vs. 60, rovnaký druh. | dobra | približné |
| Vývar v kocke / bujón (`vyvar-kocka`) | ciqual:11001 | Broth or stock, beef, dehydrated | Hovädzí bujón sušený (kocka), druh príchute sa líši, kcal 232 vs. 250. | stredna |  |
| Paradajkový pretlak (`paradajkovy-pretlak`) | ciqual:20068 | Tomato paste, concentrated, canned | Paradajkový pretlak koncentrovaný, kcal 99 vs. 80. | dobra |  |
| Paradajky krájané v konzerve (`paradajky-krajane-konzerva`) | ciqual:20137 | Tomato, peeled, canned, in juice, solids and liquids | Lúpané paradajky v konzerve vo vlastnej šťave, kcal 22. | dobra |  |
| Paradajková passata (`paradajkova-passata`) | fdc:169074 | Tomato sauce, canned, no salt added | Paradajková omáčka z konzervy (najbližšia k passate), kcal 24 vs. 30; Ciqual pyré 48 je zahustenejšie. | stredna |  |
| Kukurica sladká v konzerve (`kukurica-konzerva`) | fdc:169214 | Corn, sweet, yellow, canned, whole kernel, drained solids | Sladká kukurica konzervovaná, scedená, kcal 67 vs. 75; Ciqual 105 je >35 % mimo. | dobra |  |
| Fazuľa červená v konzerve (`fazula-konzerva`) | ciqual:20524 | Red kidney bean, canned, drained | Červená fazuľa konzervovaná, scedená, kcal 108 vs. 95. | dobra |  |
| Cícer v konzerve (`cicerka-konzerva`) | fdc:173800 | Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids | Cícer konzervovaný, scedený, kcal 139 vs. 120. | dobra |  |
| Hummus (`hummus`) | ciqual:25621 | Hummus, prepacked | Hummus balený, kcal 258 vs. 230. | dobra |  |
| Džem / marmeláda (`dzem`) | ciqual:31006 | Jam or marmalade, miscellaneaous fruits (not reduced sugar) (average) | Džem alebo marmeláda z ovocia (priemer), kcal 244 vs. 250. | dobra |  |
| Čokoláda horká (70 %) (`cokolada-horka`) | ciqual:31074 | Dark chocolate, 70% cocoa, bar | Horká čokoláda 70 % kakaa, kcal 591 vs. 570. | dobra |  |
| Čokoláda mliečna (`cokolada-mliecna`) | ciqual:31004 | Milk chocolate, bar | Mliečna čokoláda, kcal 550 vs. 540. | dobra |  |
| Orieškovo-kakaová nátierka (`orieskova-natierka`) | ciqual:31032 | Chocolate spread with hazelnuts | Čokoládová nátierka s lieskovcami, kcal 549 vs. 540. | dobra |  |
| Múčna zmes na palacinky / lievance (`muka-zmes-na-palacinky`) | fdc:172772 | Pancakes, plain, dry mix, complete (includes buttermilk) | Suchá zmes na palacinky (kompletná), kcal 368 vs. 350; zloženie slovenských zmesí sa môže líšiť. | stredna |  |
| Pudingový prášok (`puding-prasok`) | fdc:168779 | Puddings, chocolate, dry mix, instant | Pudingový prášok (čokoládový instantný), kcal 378 vs. 350; chuť sa líši, základ je škrob a cukor. | stredna |  |
| Želatína (`zelatina`) | ciqual:11007 | Gelatin, dried | Želatína sušená, kcal 348 vs. 335. | dobra | približné |
| Droždie sušené (`kvasnice-sucha`) | ciqual:11045 | Baker's yeast, dehydrated | Pekárske droždie sušené, kcal 341 vs. 320. | dobra |  |
| Ocot jablčný / vínny (`ocot-jablkovy`) | ciqual:11018 | Vinegar | Ocot všeobecne, kcal 22 vs. 20; samostatný jablčný (c11090) nemá kcal. | stredna |  |
| Kyslá kapusta (`kysla-kapusta`) | fdc:169279 | Sauerkraut, canned, solids and liquids | Kyslá kapusta konzervovaná, kcal 19 vs. 20. | dobra |  |
| Olivy v náleve (`olivy`) | ciqual:13033 | Olive, green, in brine | Zelené olivy v náleve, kcal 164 vs. 145. | dobra | približné |
| Mrazená zeleninová zmes (`mrazena-zmes-zeleniny`) | ciqual:20101 | Mixed vegetables, frozen, raw | Zmiešaná mrazená zelenina surová, kcal 65 vs. 50; zloženie zmesí sa líši. | stredna |  |
| Hranolky mrazené (na fritovanie) (`hranolky-mrazene`) | ciqual:4044 | French fries or chips, frozen, pre-fried, raw, to cook in the oven | Mrazené predsmažené hranolky surové, kcal 142 vs. 150; verzia na fritovanie (c4046) má 244 kcal, tak beriem túto. | stredna |  |
| Rybie prsty mrazené (`rybie-prsty`) | ciqual:26029 | Fish, breaded, frozen, raw | Panovaná ryba mrazená surová, kcal 163 vs. 200. | dobra |  |
| Strúhanka (`struhanka`) | ciqual:7500 | Breadcrumbs | Strúhanka, kcal 365 vs. 370. | dobra |  |
| Voda (`voda`) | ciqual:18066 | Water, municipal | Voda z vodovodu, 0 kcal. | dobra |  |
| Čierny čaj (bez cukru) (`cierny-caj`) | ciqual:18154 | Black tea, brewed, no added sugars | Čierny čaj uvarený bez cukru. | dobra |  |
| Zelený čaj (bez cukru) (`zeleny-caj`) | ciqual:18155 | Green tea, brewed, no added sugars | Zelený čaj uvarený bez cukru. | dobra | približné (doplnené: nasyt, cukry) |
| Bylinkový / ovocný čaj (bez cukru) (`bylinkovy-caj`) | ciqual:18022 | Infusion, brewed, no added sugars | Všeobecný nálev bez cukru, konkrétne bylinky sa líšia. | stredna |  |
| Káva (bez cukru) (`kava`) | ciqual:18004 | Coffee, non instant no added sugars, ready-to-drink | Káva filtrovaná bez cukru, 6 kcal vs. 2. | dobra | približné |
| Džús 100 % ovocný (`dzus-100`) | ciqual:2004 | Fruit juice (average) | Ovocná šťava (priemer), kcal 47 vs. 45. | dobra |  |
| Džús / nektár slazený (`dzus-sladeny`) | ciqual:2061 | Multifruit nectar, standard | Multivitamínový ovocný nektár štandardný, kcal 50 vs. 45. | stredna |  |
| Limonáda / sladený nápoj (`limonada`) | ciqual:18010 | Lemonade, with sugar(s) | Limonáda s cukrom, kcal 33 vs. 40; zloženie sladených nápojov sa líši. | stredna |  |
| Ovsené mlieko (`mlieko-ovsene`) | ciqual:18899 | Oat drink, plain, no added sugar, not fortified, prepacked | Ovsený nápoj bez cukru, kcal 41 vs. 45. | dobra | približné |
| Sójové mlieko (neslazené) (`mlieko-sojove`) | ciqual:18900 | Soy drink, plain, not fortified, prepacked | Sójový nápoj bez cukru, kcal 42 vs. 35. | dobra |  |
| Mandľové mlieko (neslazené) (`mlieko-mandlove`) | ciqual:18107 | Almond drink, plain, no added sugars, not fortified, prepacked | Mandľový nápoj bez cukru, kcal 36 vs. 15; odhad je pravdepodobne nízky, stav sedí. | stredna | približné |
| Kokosové mlieko (konzerva) (`mlieko-kokosove`) | ciqual:18041 | Coconut milk | Kokosové mlieko, kcal 199 vs. 170. | dobra |  |
| Minerálka / sóda (`mineralka`) | ciqual:18046 | Mineral sparkling water, bottled (average) | Minerálna voda perlivá, 0 kcal. | dobra |  |
