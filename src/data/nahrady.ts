export interface Nahrada { za: string; kontext: string; zisk: string; strata: string; ides?: string[] }
export interface SkupinaNahrad { id: string; nazov: string; ikona: string; uvod: string; nahrady: Nahrada[] }
/** Všetky tvrdenia sú praktické odhady (kuchárska prax / výživová logika), nie citované dôkazy. */
export const NAHRADY: SkupinaNahrad[] = [
  { id: 'muka', nazov: 'Múka', ikona: '🌾', uvod: 'Pšeničnú múku a pečivo (chlieb, rožky, cestoviny, halušky, knedle, strúhanku, cesto) appka sama nenavrhuje; ak si ich vyberieš sám, stráži limit 1–2× týždenne. Najlepšia náhrada je jedlo úplne BEZ múky (vajcia, zelenina, celé strukoviny, zemiaky, vločky). Iné múky (pohánková, ovsená, mandľová, cícerová) nie sú automatická náhrada – posudzuje ich skóre. Tvrdenia o náhradách sú praktické odhady, nie citované dôkazy.', nahrady: [
    { za: 'Biela múka v plackách a lievancoch', kontext: 'raňajky', zisk: 'Vajcia s ovocím alebo pomletými ovsenými vločkami (celé zrno) dajú sýtosť a vlákninu bez múky', strata: 'Hustejšia, menej nadýchaná textúra', ides: ['vajce-slepacie', 'ovsene-vlocky', 'banan'] },
    { za: 'Biela múka na zahustenie omáčky', kontext: 'omáčky, polievky', zisk: 'Bez múky: uvarený zemiak, karfiol alebo červená šošovica rozmixované do omáčky', strata: 'Mierne iná chuť', ides: ['zemiaky', 'karfiol', 'sosovica-cervena', 'cuketa'] },
    { za: 'Biela múka v haluškách a šúľancoch', kontext: 'obed', zisk: 'Bez múky: zemiaková alebo zeleninová príloha (kaša zo zeleru či karfiolu, pečená tekvica), alebo celé strukoviny', strata: 'Iná chuť a konzistencia – treba si zvyknúť', ides: ['zemiaky', 'zeler-bulvovy', 'karfiol', 'sosovica-zelena'] },
    { za: 'Pečivo na raňajky', kontext: 'raňajky', zisk: 'Vajcia, ovsená kaša alebo jogurt s ovocím zasýtia dlhšie (odhad); „chlieb“ z vajec a semienok je bez múky', strata: 'Menej pohodlné, treba pár minút navyše', ides: ['vajce-slepacie', 'ovsene-vlocky', 'jogurt-grecky', 'psyllium'] },
    { za: 'Cestoviny z bielej múky', kontext: 'obed, večera', zisk: 'Bez múky: cuketové alebo kalerábové „špagety“, karfiolová ryža, ryža natur či zemiaky; strukovinové cestoviny len občas (stále sú cestoviny)', strata: 'Iná chuť; strukovinové cestoviny sa ľahko rozvaria', ides: ['cuketa', 'kalerab', 'karfiol', 'ryza-natur'] },
    { za: 'Strúhanka v rezňoch a karbonátkoch', kontext: 'obed', zisk: 'Bez múky: pomleté ovsené vločky, mleté orechy alebo semienka dajú chrumkavý obal', strata: 'Menej chrumkavé', ides: ['ovsene-vlocky', 'lan-semienka', 'slnecnicove-semienka'] },
  ] },
  { id: 'zemiaky-muka', nazov: 'Zemiaky a múka → kaleráb, karfiol, zeler', ikona: '🥬', uvod: 'Tri zeleniny z bežného obchodu nahradia zemiaky aj múku v jedlách, ktoré inak bývajú ťažké. Sú to kuchárske nápady (prax), nie dôkaz o účinku.', nahrady: [
    { za: 'Zemiaková kaša alebo knedle', kontext: 'obed, príloha', zisk: 'Pyré zo zeleru alebo karfiolu: menej sacharidov a viac vlákniny', strata: 'Iná chuť, menej „plná“; zeler je alergén', ides: ['zeler-bulvovy', 'karfiol'] },
    { za: 'Hranolky', kontext: 'príloha', zisk: 'Kalerábové hranolky z rúry do zlatista', strata: 'Menej chrumkavé; neprepiecť dohneda', ides: ['kalerab'] },
    { za: 'Ryža a cestoviny', kontext: 'obed', zisk: 'Karfiolová ryža (ku kari a rybe), cuketové špagety', strata: 'Rýchlo sa rozvarí – opekať na panvici', ides: ['karfiol', 'cuketa'] },
    { za: 'Múka na zahustenie polievky (kulajda, krémové polievky)', kontext: 'polievky', zisk: 'Nastrúhaná cuketa alebo uvarený kaleráb rozmixovaný do polievky', strata: 'Jemne zelenkastá farba', ides: ['cuketa', 'kalerab'] },
    { za: 'Pizza a placky z múky', kontext: 'večera', zisk: 'Cesto z mozzarelly a vajec alebo cuketové placky so syrom', strata: 'Menej chrumkavé, treba panvicu alebo rúru', ides: ['cuketa'] },
  ] },
  { id: 'cukor', nazov: 'Cukor a sladké', ikona: '🍬', uvod: 'Voľné cukry (cukor, med, sirupy, džúsy) je vhodné držať nízko. Ovocie ako sladidlo je lepšie než cukor, ale stále je to cukor.', nahrady: [
    { za: 'Cukor v kaši a jogurte', kontext: 'raňajky', zisk: 'Ovocie dá vlákninu a sladkosť', strata: 'Menej sladké; treba si privyknúť' },
    { za: 'Cukor v koláčoch', kontext: 'pečenie', zisk: 'Pridaním banánu, datlí alebo jablka sa dá cukor znížiť o tretinu až polovicu (prax)', strata: 'Iná textúra a chuť' },
    { za: 'Sladené nápoje a džúsy', kontext: 'pitie', zisk: 'Voda, nesladený čaj alebo voda s ovocím nemajú cukor', strata: 'Menej chuti pre deti' },
    { za: 'Čokoládové nátierky', kontext: 'desiata', zisk: 'Orechové maslo bez cukru alebo ovocná nátierka', strata: 'Menej sladké; orechy – pozor na alergie' },
  ] },
  { id: 'udeniny', nazov: 'Údeniny a spracované mäso', ikona: '🥓', uvod: 'Šunka, saláma, klobása, párky obsahujú veľa soli. Dajú sa nahradiť čerstvým mäsom, vajcom alebo nátierkami.', nahrady: [
    { za: 'Šunka v sendviči', kontext: 'raňajky, desiata', zisk: 'Menej soli: plátky pečeného kuracieho alebo vajce', strata: 'Treba mäso pripraviť vopred' },
    { za: 'Slanina v praženici', kontext: 'raňajky', zisk: 'Menej soli a nasýtených tukov: paprika a údená paprika pre chuť', strata: 'Menej údená chuť' },
    { za: 'Párky pre deti', kontext: 'obed, večera', zisk: 'Domáce fašírky alebo kuracie kúsky nemajú dusičnany ani veľa soli', strata: 'Viac práce' },
    { za: 'Klobása do fazuľovej polievky', kontext: 'polievka', zisk: 'Údená paprika dodá podobnú chuť bez mäsa', strata: 'Mierne iná chuť' },
  ] },
  { id: 'vyprazane', nazov: 'Vyprážané', ikona: '🍟', uvod: 'Vyprážanie pridáva veľa tuku. Rúra či airfryer dajú podobnú chrumkavosť s menej olejom.', nahrady: [
    { za: 'Vyprážaný rezeň', kontext: 'obed', zisk: 'Pečený v rúre alebo airfryeri: výrazne menej oleja', strata: 'Menej chrumkavý' },
    { za: 'Hranolky', kontext: 'príloha', zisk: 'Zemiakové mesiačiky pečené v rúre', strata: 'Menej chrumkavé' },
    { za: 'Vyprážaný syr', kontext: 'obed', zisk: 'Pečený syr alebo grilovaný halloumi', strata: 'Iná chuť' },
  ] },
  { id: 'smotana', nazov: 'Smotana a tučné omáčky', ikona: '🥛', uvod: 'Smotana robí omáčky hustými, ale pridáva nasýtené tuky.', nahrady: [
    { za: 'Smotana do omáčok', kontext: 'omáčky', zisk: 'Jogurt alebo kyslé mlieko pridané na konci varenia, alebo pretlak zo strukovín', strata: 'Jogurt sa môže zrazit pri varení' },
    { za: 'Majonéza', kontext: 'šaláty, nátierky', zisk: 'Grécky jogurt s horčicou a citrónom', strata: 'Iná chuť' },
  ] },
];
export const CHUT_NA: { chut: string; klasika: string; skus: string }[] = [
  { chut: 'Chuť na halušky', klasika: 'Bryndzové halušky', skus: 'Zemiakové jedlo so strukovinovou múkou, alebo pohánkové/pšenové jedlo s bryndzou a zeleninou.' },
  { chut: 'Chuť na pizzu', klasika: 'Pizza s bielou múkou', skus: 'Pizza z celozrnnej múky alebo placka z karfiolu/cukety.' },
  { chut: 'Chuť na rezeň', klasika: 'Vyprážaný rezeň', skus: 'Kuracie prsia pečené v ovsenej strúhanke.' },
  { chut: 'Chuť na palacinky', klasika: 'Palacinky z bielej múky', skus: 'Ovsené alebo pohánkové palacinky s ovocím.' },
  { chut: 'Chuť na pečivo na raňajky', klasika: 'Rožok s maslom a šunkou', skus: 'Praženica so zeleninou alebo kaša s ovocím.' },
];
