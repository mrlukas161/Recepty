import type { Info } from './filtre';
import type { UlozenyStav } from './types';

const dd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Pondelok týždňa, v ktorom je `d` (lokálny čas), ako RRRR-MM-DD. */
export function pondelokTyzdna(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return dd(x);
}
export function nedelaTyzdna(d: Date): string {
  const x = new Date(pondelokTyzdna(d) + 'T12:00:00');
  x.setDate(x.getDate() + 6);
  return dd(x);
}

export interface TyzdenMuky {
  /** uvarené tento týždeň (podľa „Uvarené“ v detaile receptu) */
  varene: number; vareneSMukou: number;
  /** naplánované v jedálničku (týždeň po–ne) */
  planovane: number; planovaneSMukou: number;
  /** týždenný limit jedál s múkou (null = bez obmedzenia) a či je vylúčená */
  limit: number | null; vylucena: boolean;
  /** stav podľa vyššieho z čísel (uvarené s múkou, naplánované s múkou) voči limitu */
  stav: 'ok' | 'na-limite' | 'nad-limitom' | 'bez-limitu';
}

/** Týždenný prehľad jedál s rafinovanou múkou z uvarených (história) a naplánovaných (jedálniček) jedál. */
export function tyzdenMuky(s: Pick<UlozenyStav, 'historia' | 'jedalnicek' | 'nastavenia'>, info: Map<string, Info>, dnes: Date = new Date()): TyzdenMuky {
  const od = pondelokTyzdna(dnes), po = nedelaTyzdna(dnes);
  let varene = 0, vareneSMukou = 0, planovane = 0, planovaneSMukou = 0;
  for (const h of s.historia) {
    if (h.den < od || h.den > po) continue;
    const i = info.get(h.recept); if (!i) continue;
    varene++; if (i.kat.muka) vareneSMukou++;
  }
  for (const id of Object.values(s.jedalnicek)) {
    if (!id) continue; const i = info.get(id); if (!i) continue;
    planovane++; if (i.kat.muka) planovaneSMukou++;
  }
  const u = s.nastavenia.obmedzenia.muka;
  const limit = u === 'obmedzit' ? s.nastavenia.maxTyzdenne.muka : u === 'vylucit' ? 0 : null;
  const vyssie = Math.max(vareneSMukou, planovaneSMukou);
  const stav: TyzdenMuky['stav'] = limit === null ? 'bez-limitu' : vyssie > limit ? 'nad-limitom' : vyssie === limit ? 'na-limite' : 'ok';
  return { varene, vareneSMukou, planovane, planovaneSMukou, limit, vylucena: u === 'vylucit', stav };
}
