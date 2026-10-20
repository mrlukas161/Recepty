import { LEPSIE } from '../data/lepsie';
import type { Info } from './filtre';
import { vylucene } from './filtre';
import type { Nastavenia } from './types';

/**
 * Čo appka SAMA navrhuje (Dnes, jedálniček vrátane Zamiešať, ruleta): jedlá s pšeničnou múkou a pečivom
 * (múka, chlieb, rožky, cestoviny, halušky, knedle, strúhanka, kysnuté a lístkové cesto…) a jedlá s rafinovaným cukrom
 * sa nenavrhujú nikdy. Nájdeš ich len vyhľadaním v Receptoch, a to hneď s verziou bez múky.
 * Výnimka: ak má domácnosť v Nastaveniach obmedzenie danej kategórie na „Bez obmedzenia“, platí staré správanie.
 */
export function navrhnutelny(i: Info, n: Pick<Nastavenia, 'obmedzenia'>): boolean {
  if (i.kat.muka && n.obmedzenia.muka !== 'bez') return false;
  if (i.cukorRaf && n.obmedzenia.cukor !== 'bez') return false;
  return true;
}

/** Týždenný limit jedál s múkou, ak si ich používateľ vyberie sám: 1 alebo 2 (predvolene 2); null = bez obmedzenia, 0 = vylúčené. */
export function limitMuky(n: Pick<Nastavenia, 'obmedzenia' | 'maxTyzdenne'>): number | null {
  const u = n.obmedzenia.muka;
  if (u === 'bez') return null;
  if (u === 'vylucit') return 0;
  return n.maxTyzdenne.muka <= 1 ? 1 : 2;
}

const slova = (t: string) => new Set(t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4).map((w) => w.slice(0, 5)));
function podobnost(a: Info, b: Info): number {
  let spolu = 0;
  for (const x of a.surIds) if (b.surIds.has(x)) spolu++;
  const jacc = spolu / (a.surIds.size + b.surIds.size - spolu || 1);
  const sa = slova(a.r.nazov), sb = slova(b.r.nazov);
  let nz = 0; for (const w of sa) if (sb.has(w)) nz++;
  const tagy = a.r.tagy.filter((t) => b.r.tagy.includes(t)).length / (a.r.tagy.length || 1);
  return jacc + nz * 0.4 + tagy * 0.3 + (a.r.kuchyna === b.r.kuchyna ? 0.1 : 0) + b.skore.celkom / 1000;
}

/** Verzie/náhrady bez múky pre recept s múkou: najprv ručne vybrané („lepšia verzia“), potom najpodobnejšie recepty rovnakého typu bez múky a bez rafinovaného cukru. */
export function verzieBezMuky(i: Info, infos: Info[], n: Nastavenia, pocet = 2): Info[] {
  if (!i.kat.muka) return [];
  const ok = (x: Info) => x.r.id !== i.r.id && !x.kat.muka && !x.cukorRaf && !vylucene(x, n);
  const vyber: Info[] = [];
  const ids = [...(LEPSIE[i.r.id] ?? []), ...(i.r.lepsiaVerzia ?? [])];
  for (const id of ids) { const x = infos.find((y) => y.r.id === id); if (x && ok(x) && !vyber.includes(x)) vyber.push(x); }
  const typy = i.r.typ === 'polievka' ? ['polievka'] : i.r.typ === 'dezert' || i.r.typ === 'desiata' || i.r.typ === 'olovrant' ? ['dezert', 'desiata', 'olovrant'] : [i.r.typ];
  const ostatne = infos.filter((x) => ok(x) && typy.includes(x.r.typ) && !vyber.includes(x)).map((x) => ({ x, p: podobnost(i, x) })).sort((a, b) => b.p - a.p);
  for (const o of ostatne) { if (vyber.length >= pocet) break; vyber.push(o.x); }
  return vyber.slice(0, pocet);
}
