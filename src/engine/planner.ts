import type { Surovina, Typ } from '../data/types';
import type { Kategoria, Nastavenia } from './types';
import { casNaDen } from './types';
import { kategorieZPridanych } from './obmedzene';
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
  /** voliteľné obmedzované suroviny, ktoré používateľ do receptov pridal (id receptu -> id surovín) */
  pridane?: Record<string, string[]>;
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

/** Je slot zvyškom? (varím na 2 dni: obed je z včerajšej večere – rovnaký recept) */
export function jeZvysok(plan: Record<string, string | null>, den: number, typ: Typ, n: Pick<Nastavenia, 'varimNa2Dni'>): boolean {
  return n.varimNa2Dni && typ === 'obed' && den > 0 && !!plan[kluc(den, 'obed')] && plan[kluc(den, 'obed')] === plan[kluc(den - 1, 'vecera')];
}

/** Vygeneruje týždenný jedálniček. Zamknuté sloty ostanú. */
export function generujJedalnicek(v: PlanVstup): Record<string, string | null> {
  const { infos, n, db } = v;
  const rand = rng(v.seed ?? 1);
  const out: Record<string, string | null> = {};
  const pouzite = new Map<string, number>(); // recept -> posledný deň použitia
  const pocet: Record<Kategoria, number> = { muka: 0, cukor: 0, udeniny: 0, vyprazane: 0, tazke: 0 };
  let ryby = 0;
  const bielkoviny: string[] = [];
  const efKat = (i: Info): Kategoria[] => {
    const z = kategorieZPridanych(i.r, db, v.pridane?.[i.r.id]);
    return (Object.keys(pocet) as Kategoria[]).filter((k) => i.kat[k] || z.includes(k));
  };
  const dopln = (i: Info) => { efKat(i).forEach((k) => { pocet[k]++; }); if (jeRyba(i, db)) ryby++; };
  for (const [k, id] of Object.entries(v.zamknute ?? {})) {
    if (!id) continue;
    out[k] = id;
    const i = infos.find((x) => x.r.id === id); if (i) dopln(i);
  }
  const povolene = infos.filter((i) => !vylucene(i, n) && dietyOk(i, n, db));
  const typyHlavne = new Set<Typ>(['obed', 'vecera']);
  const naViacDni = (i: Info) => i.r.tagy.includes('na-viac-dni');
  const dvaDni = n.varimNa2Dni && n.jedla.includes('vecera') && n.jedla.includes('obed');
  for (let d = 0; d < 7; d++) {
    for (const typ of n.jedla) {
      const k = kluc(d, typ);
      if (out[k]) { continue; }
      const poolTyp: Typ[] = typ === 'obed' ? ['obed', 'polievka'] : typ === 'desiata' ? ['desiata', 'dezert'] : [typ];
      const pool = povolene.filter((i) => (poolTyp.includes(i.r.typ) || (dvaDni && typ === 'vecera' && i.r.typ === 'obed' && naViacDni(i))) && (typ !== 'obed' || i.r.typ === 'obed'));
      const limitCasu = typyHlavne.has(typ) ? casNaDen(n, d) : Infinity;
      const dost = (i: Info) => i.cas <= limitCasu;
      const volne = pool.filter((i) => !pouzite.has(i.r.id));
      const kand = volne.filter((i) => {
        for (const kat of efKat(i)) {
          if (n.obmedzenia[kat] === 'obmedzit' && pocet[kat] >= n.maxTyzdenne[kat]) return false;
        }
        if (!dost(i)) return false;
        if (jeRyba(i, db) && ryby >= 2) return false;
        return true;
      });
      // ak nič nevyhovuje všetkému, aspoň čas (ak sa dá), potom čokoľvek nepoužité
      const zdroj = kand.length ? kand : (volne.filter(dost).length ? volne.filter(dost) : volne);
      if (!zdroj.length) { out[k] = null; continue; }
      const pred = bielkoviny[bielkoviny.length - 1];
      const dvojita = dvaDni && typ === 'vecera' && d < 6 && !out[kluc(d + 1, 'obed')];
      const vazene = zdroj.map((i) => {
        let w = Math.pow(Math.max(5, i.skore.celkom) / 100, 3) + 0.01;
        const b = hlavnyBielkovina(i, db);
        if (b === pred && b !== 'ine') w *= 0.35;
        if (jeRyba(i, db) && ryby < 1 && d >= 2) w *= 2.5;
        if (dvojita && naViacDni(i)) w *= d % 2 === 0 ? 8 : 3;   // dvojité varenie najmä po, st, pi
        return w;
      });
      let t = rand() * vazene.reduce((a, b) => a + b, 0), idx = 0;
      for (; idx < vazene.length - 1; idx++) { t -= vazene[idx]; if (t <= 0) break; }
      const pick = zdroj[idx];
      out[k] = pick.r.id; pouzite.set(pick.r.id, d); dopln(pick);
      if (typyHlavne.has(typ)) bielkoviny.push(hlavnyBielkovina(pick, db));
      // večera na 2 dni → zvyšky na obed nasledujúceho dňa (recept s tagom „na viac dní“)
      if (dvojita && naViacDni(pick)) { out[kluc(d + 1, 'obed')] = pick.r.id; dopln(pick); }
    }
  }
  return out;
}

export interface SuhrnTyzdna { kat: Record<Kategoria, number>; rastliny: number; vlakninaPriemer: number; ryby: number; pocetJedal: number }
export function suhrn(plan: Record<string, string | null>, infos: Map<string, Info>, db: Map<string, Surovina>, pridane: Record<string, string[]> = {}): SuhrnTyzdna {
  const kat: Record<Kategoria, number> = { muka: 0, cukor: 0, udeniny: 0, vyprazane: 0, tazke: 0 };
  const rast = new Set<string>(); let vl = 0, ryby = 0, pocet = 0;
  for (const id of Object.values(plan)) {
    if (!id) continue; const i = infos.get(id); if (!i) continue;
    pocet++; vl += i.skore.na100porcia.vlak;
    const z = kategorieZPridanych(i.r, db, pridane[id]);
    (Object.keys(kat) as Kategoria[]).forEach((k) => { if (i.kat[k] || z.includes(k)) kat[k]++; });
    if (jeRyba(i, db)) ryby++;
    for (const s of i.r.suroviny) { const x = db.get(s.id); if (x && x.priznaky.some((p) => ['zelenina', 'ovocie', 'strukovina', 'orechy', 'semienka', 'celozrnne'].includes(p))) rast.add(s.id); }
  }
  return { kat, rastliny: rast.size, vlakninaPriemer: pocet ? vl / pocet : 0, ryby, pocetJedal: pocet };
}
