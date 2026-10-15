import latkyJson from './data/latky.json';
import zdrojeJson from './data/zdroje.json';
import type { Latka, ZdrojKoz } from './typy';

export const LATKY = latkyJson as Latka[];
export const ZDROJE_KOZ = zdrojeJson as Record<string, ZdrojKoz>;

/** Normalizácia na porovnávanie: malé písmená, bez diakritiky, len písmená a číslice oddelené medzerou. */
export function normKluc(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export const INDEX = new Map<string, Latka>();
for (const l of LATKY) for (const m of l.m) INDEX.set(normKluc(m), l);
export const KLUCE = [...INDEX.keys()];
export const LATKA_PODLA_ID = new Map(LATKY.map((l) => [l.id, l]));
