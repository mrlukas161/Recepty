/** „Lepšia voľba“: pravidlá na výber výrobku + domáce recepty z appky podľa druhu výrobku. Naše pravidlá (odhad), nie dôkazy. */
import { norm } from './normalizacia';
import type { Rozbor } from './typy';
import type { SkoreVyrobku } from './skore';
import type { Info } from '../engine/filtre';

interface Pravidlo { id: string; nazov: string; kluce: RegExp; recepty: RegExp }
export const DRUHY: Pravidlo[] = [
  { id: 'musli', nazov: 'müsli, cereálie, kaša', kluce: /musli|granol|cerealn|cerealie|ovsene vlock|raňajkov|ranajkov|cornflak|kukuricne platky|chrumk/, recepty: /müsli|ovsená kaša|ovsená kaša cez noc|kefírová misa|jogurtová misa s ovocím a orechmi/i },
  { id: 'susienky', nazov: 'sušienky, keksy, tyčinky, koláče', kluce: /susienk|keks|oblatk|tycink|piskot|lieskov.*oplatk|kolac|croissant|donut|muffin|vafl/, recepty: /sušienky|tyčinky|muffiny|jablkový koláč/i },
  { id: 'cokolada', nazov: 'čokoláda, sladké nátierky', kluce: /cokolad|kakaov(y|a|e) (krem|natier)|lieskovooresk|nutell|nugat|sladka natier/, recepty: /čokoládový puding|banánová zmrzlina s kakaom|kakaový chia/i },
  { id: 'dezert', nazov: 'jogurt, puding, dezert', kluce: /jogurt|puding|dezert|tvarohov(y|e) (dezert|krem)|zmrzlin|krem /, recepty: /jogurtová misa|tvarohová misa|chia puding|tvarohový krém|jogurtová zmrzlina/i },
  { id: 'natierka', nazov: 'nátierky a pomazánky', kluce: /natierk|pomazank|hummus|paste/, recepty: /nátierka|hummus/i },
  { id: 'udeniny', nazov: 'šunka, saláma, párky, údeniny', kluce: /sunk|salam|parok|klobas|slanin|udeni|mortadel/, recepty: /pečené kura so zeleninou|vajíčková nátierka|vajce natvrdo|fazuľová nátierka/i },
  { id: 'omacka', nazov: 'omáčky, kečup, polievky', kluce: /omack|kecup|paradajkov(y|a|e) (pretlak|pyre|omack)|polievk|bujon|instantn/, recepty: /paradajková polievka|zeleninová polievka|šošovicová polievka|minestrone/i },
  { id: 'cestoviny', nazov: 'cestoviny', kluce: /cestovin|spagety|penne|fusilli|rezanc/, recepty: /celozrnné cestoviny|cícerové cestoviny|šošovicové cestoviny/i },
  { id: 'pecivo', nazov: 'pečivo, chlieb', kluce: /chlieb|rozok|pecivo|bageta|toast|tortill|pita/, recepty: /celozrnn|toast|tortilly|fazuľová nátierka/i },
  { id: 'napoj', nazov: 'nápoje, džúsy', kluce: /napoj|dzus|limonad|cola|sirup|ice tea|smoothie|nektar/, recepty: /smoothie|kefírové/i },
  { id: 'snack', nazov: 'slané snacky, chipsy', kluce: /chips|slane|snack|tyčin|krekr|cracker|popcorn|arasidy/, recepty: /mrkva a uhorka s hummusom|slané zeleninové muffiny|pečen/i },
];

export function druhVyrobku(nazov: string, r: Rozbor): Pravidlo | undefined {
  const t = norm(`${nazov} ${r.text.slice(0, 160)}`);
  return DRUHY.find((d) => d.kluce.test(t));
}

export function domaceAlternativy(nazov: string, r: Rozbor, infos: Info[], n = 3): { druh: Pravidlo; recepty: Info[] } | null {
  const d = druhVyrobku(nazov, r);
  if (!d) return null;
  const rec = infos.filter((i) => d.recepty.test(i.r.nazov)).sort((a, b) => b.skore.celkom - a.skore.celkom).slice(0, n);
  return rec.length ? { druh: d, recepty: rec } : null;
}

/** Podľa čoho vybrať lepší výrobok – z toho, čo skóre našlo. */
export function tipyNaVyber(r: Rozbor, s: SkoreVyrobku): string[] {
  const t: string[] = [];
  const f = (id: string) => s.faktory.find((x) => x.id === id)?.body ?? 100;
  if (f('spracovanost') < 60) t.push('Vyber variant s kratším zložením a bez emulgátorov, arómy, sirupov a farbív – čím menej markerov ultraspracovania, tým lepšie.');
  if (f('cukor') < 60) t.push('Hľadaj výrobok, kde cukor nie je medzi prvými tromi zložkami (alebo je „bez pridaného cukru“); porovnaj riadok „z toho cukry“ v tabuľke na 100 g.');
  if (r.zlozky.some((z) => z.priznaky.includes('stuzeny-tuk') || z.priznaky.includes('palmovy-tuk'))) t.push('Vyhni sa stuženému tuku; palmový tuk radšej nahraď výrobkom s olejom alebo maslom (podľa chuti a použitia).');
  if (r.zlozky.some((z) => z.priznaky.includes('rafinovana-muka'))) t.push('Pri pečive, cestovinách a sušienkach hľadaj slovo „celozrnné“ na prvom mieste zloženia.');
  if (r.zlozky.some((z) => z.priznaky.includes('udenina'))) t.push('Pri údeninách porovnaj podiel mäsa (vyšší je lepší) a vyber kratšie zloženie bez zbytočných prísad.');
  if (r.zlozky.some((z) => z.typ === 'aditivum' && z.hodnotenie && (z.hodnotenie.stupen === 'vyhnut-sa' || z.hodnotenie.deti === 'vyhnut-sa'))) t.push('Pre deti vyber variant bez farbív s upozornením EÚ (E102, E104, E110, E122, E124, E129).');
  if (r.zlozky.some((z) => z.priznaky.includes('intenzivne-sladidlo'))) t.push('Pri „light“ výrobkoch so sladidlami WHO (2023) odporúča radšej znižovať sladkú chuť celkovo než ju nahrádzať sladidlami.');
  if (!t.length) t.push('Zloženie vyzerá dobre; pri výbere medzi podobnými výrobkami porovnaj výživové hodnoty na 100 g.');
  return t;
}
