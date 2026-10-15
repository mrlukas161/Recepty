import type { Recept, Surovina } from '../data/types';
import type { Kategoria, Nastavenia } from './types';
import { vypocitajSkore, type Skore } from './score';
import { naGramy } from './units';
import { DIETY } from '../data/diety';

export interface Info {
  r: Recept; skore: Skore; kat: Record<Kategoria, boolean>;
  alergeny: Set<string>; surIds: Set<string>; cas: number; mäso: boolean;
}

export function kategorie(r: Recept, sk: Skore, db: Map<string, Surovina>): Record<Kategoria, boolean> {
  const res: Record<Kategoria, boolean> = { muka: false, cukor: false, udeniny: false, vyprazane: !!r.vyprazane, tazke: false };
  for (const s of r.suroviny) {
    const x = db.get(s.id);
    if (!x || (s.volitelna && !s.nevyhnutna)) continue;
    if (x.priznaky.includes('rafinovana-muka')) res.muka = true;
    if (x.priznaky.includes('spracovane-maso')) res.udeniny = true;
  }
  res.cukor = sk.na100porcia.pridanyCukor >= 8;
  res.tazke = (sk.faktory.find((f) => f.id === 'tazkost')?.body ?? 100) < 40;
  return res;
}

export function infoRecept(r: Recept, db: Map<string, Surovina>): Info {
  const skore = vypocitajSkore(r, r.suroviny, db);
  const alergeny = new Set<string>();
  const surIds = new Set<string>();
  for (const s of r.suroviny) { surIds.add(s.id); db.get(s.id)?.alergeny.forEach((a) => alergeny.add(a)); }
  return { r, skore, kat: kategorie(r, skore, db), alergeny, surIds, cas: r.casPripravy + r.casVarenia, mäso: false };
}

function maPriznak(r: Recept, db: Map<string, Surovina>, p: string, len_nevyhnutne = false): boolean {
  return r.suroviny.some((s) => (!len_nevyhnutne || !s.volitelna) && db.get(s.id)?.priznaky.includes(p as never));
}

/** Je recept v súlade s dietou? (tvrdé pravidlá; mäkké diéty len podľa skóre) */
export function vyhovujeDiete(i: Info, dietaId: string, db: Map<string, Surovina>): boolean {
  const r = i.r;
  const has = (p: string) => maPriznak(r, db, p);
  switch (dietaId) {
    case 'vegetarianska': return !has('maso') && !has('ryba') && !has('spracovane-maso');
    case 'veganska': return !has('maso') && !has('ryba') && !has('spracovane-maso') && !has('vajce') && !has('mliecne') && !has('med');
    case 'bezlepkova': return !has('lepok') && !i.alergeny.has('lepok');
    case 'bez-laktozy': return !has('laktoza') && !has('mliecne');
    case 'low-fodmap': return !has('vysoky-fodmap');
    case 'menej-muky': return !has('rafinovana-muka');
    case 'nizkosacharidova': return i.skore.na100porcia.sach <= 40;
    case 'ketogenna': return i.skore.na100porcia.sach <= 15;
    case 'flexitarianska': return true;
    default: { // stredomorská, DASH, MIND, protizápalová, severská – mäkké
      return i.skore.celkom >= 55 && !has('spracovane-maso');
    }
  }
}

export function dietyOk(i: Info, n: Nastavenia, db: Map<string, Surovina>): boolean {
  return n.diety.every((d) => vyhovujeDiete(i, d, db));
}

/** Tvrdé vylúčenia: alergie, nejem, vylúčené kategórie. */
export function vylucene(i: Info, n: Nastavenia): boolean {
  for (const a of n.alergie) if (i.alergeny.has(a)) return true;
  for (const id of n.nejem) if (i.surIds.has(id)) {
    // vynechateľná surovina nevadí
    const s = i.r.suroviny.find((x) => x.id === id);
    if (s && !(s.volitelna && !s.nevyhnutna)) return true;
  }
  for (const k of Object.keys(n.obmedzenia) as Kategoria[]) if (n.obmedzenia[k] === 'vylucit' && i.kat[k]) return true;
  return false;
}

export function kolkoPorcii(n: Nastavenia): number {
  return Math.max(0.5, n.dospeli + n.deti.reduce((a, v) => a + (v < 2 ? 0.3 : v < 7 ? 0.5 : v < 12 ? 0.7 : 1), 0));
}

export function gramyReceptu(r: Recept, db: Map<string, Surovina>): number {
  return r.suroviny.reduce((a, s) => a + naGramy(db.get(s.id), s.mnozstvo, s.jednotka), 0);
}

export type Zoradenie = 'skore' | 'cas' | 'suroviny' | 'oblubene' | 'nahodne';
export interface FiltreRecept {
  hladat: string; typ: string; maxCas: number; narocnost: number; diety: string[];
  detske: boolean; bezVylucenych: boolean; mamDoma: boolean; zoradenie: Zoradenie; tag: string;
}
export const FILTRE0: FiltreRecept = { hladat: '', typ: '', maxCas: 0, narocnost: 0, diety: [], detske: false, bezVylucenych: true, mamDoma: false, zoradenie: 'skore', tag: '' };

export function bezDiakritiky(s: string): string { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

export function filtruj(infos: Info[], f: FiltreRecept, n: Nastavenia, db: Map<string, Surovina>, oblubene: string[], seed = 1): Info[] {
  const q = bezDiakritiky(f.hladat.trim());
  let out = infos.filter((i) => {
    const r = i.r;
    if (f.typ && r.typ !== f.typ) return false;
    if (f.maxCas && i.cas > f.maxCas) return false;
    if (f.narocnost && r.narocnost > f.narocnost) return false;
    if (f.detske && !r.tagy.includes('detske')) return false;
    if (f.tag && !r.tagy.includes(f.tag)) return false;
    if (f.bezVylucenych && vylucene(i, n)) return false;
    if (!f.diety.every((d) => vyhovujeDiete(i, d, db))) return false;
    if (f.mamDoma) {
      const doma = new Set(n.mamDoma);
      if (!r.suroviny.filter((s) => !s.volitelna).every((s) => doma.has(s.id))) return false;
    }
    if (q) {
      const hay = bezDiakritiky(r.nazov + ' ' + r.tagy.join(' ') + ' ' + r.suroviny.map((s) => db.get(s.id)?.nazov ?? '').join(' '));
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const rnd = (id: string) => { let h = seed; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 1000) / 1000; };
  const fav = new Set(oblubene);
  out = [...out].sort((a, b) => {
    switch (f.zoradenie) {
      case 'cas': return a.cas - b.cas;
      case 'suroviny': return a.r.suroviny.length - b.r.suroviny.length;
      case 'oblubene': return Number(fav.has(b.r.id)) - Number(fav.has(a.r.id)) || b.skore.celkom - a.skore.celkom;
      case 'nahodne': return rnd(a.r.id) - rnd(b.r.id);
      default: return b.skore.celkom - a.skore.celkom;
    }
  });
  return out;
}
