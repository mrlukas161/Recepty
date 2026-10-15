import type { Surovina, Typ } from '../data/types';
import type { Kategoria, Nastavenia } from './types';
import { dietyOk, vylucene, type Info } from './filtre';

export const DNI = ['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota', 'Nedeľa'];
export const kluc = (den: number, typ: Typ) => `${den}:${typ}`;

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export interface PlanVstup {
  infos: Info[]; n: Nastavenia; db: Map<string, Surovina>;
  zamknute?: Record<string, string | null>; seed?: number;
}

function hlavnyBielkovina(i: Info, db: Map<string, Surovina>): string {
  for (const s of i.r.suroviny) {
    const p = db.get(s.id)?.priznaky ?? [];
    if (p.includes('ryba')) return 'ryba';
    if (p.includes('maso') || p.includes('spracovane-maso')) return 'maso';
    if (p.includes('strukovina')) return 'strukovina';
    if (p.includes('vajce')) return 'vajce';
  }
  return 'ine';
}
const jeRyba = (i: Info, db: Map<string, Surovina>) => i.r.suroviny.some((s) => db.get(s.id)?.priznaky.includes('ryba'));

/** Vygeneruje týždenný jedálniček. Zamknuté sloty ostanú. */
export function generujJedalnicek(v: PlanVstup): Record<string, string | null> {
  const { infos, n, db } = v;
  const rand = rng(v.seed ?? 1);
  const out: Record<string, string | null> = {};
  const pouzite = new Map<string, number>(); // recept -> posledný deň použitia
  const pocet: Record<Kategoria, number> = { muka: 0, cukor: 0, udeniny: 0, vyprazane: 0, tazke: 0 };
  let ryby = 0;
  const bielkoviny: string[] = [];
  const dopln = (i: Info) => { (Object.keys(pocet) as Kategoria[]).forEach((k) => { if (i.kat[k]) pocet[k]++; }); if (jeRyba(i, db)) ryby++; };
  for (const [k, id] of Object.entries(v.zamknute ?? {})) {
    if (!id) continue;
    out[k] = id;
    const i = infos.find((x) => x.r.id === id); if (i) dopln(i);
  }
  const povolene = infos.filter((i) => !vylucene(i, n) && dietyOk(i, n, db));
  const typyHlavne = new Set<Typ>(['obed', 'vecera']);
  for (let d = 0; d < 7; d++) {
    const vikend = d >= 5;
    for (const typ of n.jedla) {
      const k = kluc(d, typ);
      if (out[k]) { continue; }
      const poolTyp: Typ[] = typ === 'obed' ? ['obed', 'polievka'] : typ === 'desiata' ? ['desiata', 'dezert'] : [typ];
      const pool = povolene.filter((i) => poolTyp.includes(i.r.typ) && (typ !== 'obed' || i.r.typ === 'obed'));
      const kand = pool.filter((i) => {
        for (const kat of Object.keys(pocet) as Kategoria[]) {
          if (!i.kat[kat]) continue;
          if (n.obmedzenia[kat] === 'obmedzit' && pocet[kat] >= n.maxTyzdenne[kat]) return false;
        }
        const last = pouzite.get(i.r.id);
        if (last !== undefined) return false; // nepoužiť dvakrát v týždni
        if (!vikend && typyHlavne.has(typ) && i.cas > n.maxCas) return false;
        if (jeRyba(i, db) && ryby >= 2) return false;
        return true;
      });
      const zdroj = kand.length ? kand : pool.filter((i) => !pouzite.has(i.r.id));
      if (!zdroj.length) { out[k] = null; continue; }
      const pred = bielkoviny[bielkoviny.length - 1];
      const vazene = zdroj.map((i) => {
        let w = Math.pow(Math.max(5, i.skore.celkom) / 100, 3) + 0.01;
        const b = hlavnyBielkovina(i, db);
        if (b === pred && b !== 'ine') w *= 0.35;
        if (jeRyba(i, db) && ryby < 1 && d >= 2) w *= 2.5;
        return w;
      });
      let t = rand() * vazene.reduce((a, b) => a + b, 0), idx = 0;
      for (; idx < vazene.length - 1; idx++) { t -= vazene[idx]; if (t <= 0) break; }
      const pick = zdroj[idx];
      out[k] = pick.r.id; pouzite.set(pick.r.id, d); dopln(pick);
      if (typyHlavne.has(typ)) bielkoviny.push(hlavnyBielkovina(pick, db));
    }
  }
  return out;
}

export interface SuhrnTyzdna { kat: Record<Kategoria, number>; rastliny: number; vlakninaPriemer: number; ryby: number; pocetJedal: number }
export function suhrn(plan: Record<string, string | null>, infos: Map<string, Info>, db: Map<string, Surovina>): SuhrnTyzdna {
  const kat: Record<Kategoria, number> = { muka: 0, cukor: 0, udeniny: 0, vyprazane: 0, tazke: 0 };
  const rast = new Set<string>(); let vl = 0, ryby = 0, pocet = 0;
  for (const id of Object.values(plan)) {
    if (!id) continue; const i = infos.get(id); if (!i) continue;
    pocet++; vl += i.skore.na100porcia.vlak;
    (Object.keys(kat) as Kategoria[]).forEach((k) => { if (i.kat[k]) kat[k]++; });
    if (jeRyba(i, db)) ryby++;
    for (const s of i.r.suroviny) { const x = db.get(s.id); if (x && x.priznaky.some((p) => ['zelenina', 'ovocie', 'strukovina', 'orechy', 'semienka', 'celozrnne'].includes(p))) rast.add(s.id); }
  }
  return { kat, rastliny: rast.size, vlakninaPriemer: pocet ? vl / pocet : 0, ryby, pocetJedal: pocet };
}
