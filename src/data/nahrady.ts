export interface Nahrada { za: string; kontext: string; zisk: string; strata: string; ides?: string[] }
export interface SkupinaNahrad { id: string; nazov: string; ikona: string; uvod: string; nahrady: Nahrada[] }
/** Všetky tvrdenia sú praktické odhady (kuchárska prax / výživová logika), nie citované dôkazy. */
export const NAHRADY: SkupinaNahrad[] = [
  { id: 'muka', nazov: 'Múka', ikona: '🌾', uvod: 'Biela pšeničná múka je v kuchyni všade. Nahradiť sa dá čiastočne alebo úplne – podľa jedla.', nahrady: [
    { za: 'Biela múka v plackách a lievancoch', kontext: 'raňajky', zisk: 'Viac vlákniny a sýtosti', strata: 'Hustejšia, menej nadýchaná textúra', ides: ['ovsene-vlocky', 'pohankova-muka'] },
    { za: 'Biela múka na zahustenie omáčky', kontext: 'omáčky, polievky', zisk: 'Menej rafinovanej múky', strata: 'Mierne iná chuť', ides: ['zemiaky', 'cervena-sosovica'] },
    { za: 'Biela múka v halušiek a šúľancoch', kontext: 'obed', zisk: 'Viac bielkovín a vlákniny (strukovinové cesto)', strata: 'Iná chuť a konzistencia – treba si zvyknúť' },
    { za: 'Pečivo na raňajky', kontext: 'raňajky', zisk: 'Vajcia, kaša alebo jogurt zasýtia dlhšie (odhad)', strata: 'Menej pohodlné, treba pár minút navyše' },
    { za: 'Cestoviny z bielej múky', kontext: 'obed, večera', zisk: 'Celozrnné alebo strukovinové cestoviny majú viac vlákniny a bielkovín', strata: 'Iná chuť; strukovinové cestoviny sa ľahko rozvaria' },
    { za: 'Strúhanka v rezňoch a karbonátkoch', kontext: 'obed', zisk: 'Ovsené vločky alebo mleté semienka dajú viac vlákniny', strata: 'Menej chrumkavé' },
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
  { chut: 'Chuť na rezeň', klasika: 'Vyprážaný rezeň', skus: 'Pečený kuracie prsia v ovsenej strúhanke.' },
  { chut: 'Chuť na palacinky', klasika: 'Palacinky z bielej múky', skus: 'Ovsené alebo pohánkové palacinky s ovocím.' },
  { chut: 'Chuť na pečivo na raňajky', klasika: 'Rožok s maslom a šunkou', skus: 'Praženica so zeleninou alebo kaša s ovocím.' },
];
