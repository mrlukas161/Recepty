import type { Surovina, Recept } from './types';

function collect<T>(mods: Record<string, unknown>): T[] {
  const out: T[] = [];
  for (const m of Object.values(mods)) {
    for (const v of Object.values(m as Record<string, unknown>)) if (Array.isArray(v)) out.push(...(v as T[]));
  }
  return out;
}
import TABULKY from './vyziva-tabulky.json';

/** Výživové hodnoty z tabuliek (USDA FDC / Ciqual) prekryjú pôvodný odhad; zdroj je v `zdrojNutr` (napr. ciqual:20047). */
type Tab = { z?: string; n?: number[]; p?: number; d?: string[]; pozn?: string };
const TAB = TABULKY as unknown as Record<string, Tab>;
export function sTabulkou(s: Surovina): Surovina {
  const t = TAB[s.id];
  if (!t) return s;
  if (!t.n || !t.z) return t.pozn ? { ...s, poznamkaNutr: t.pozn } : s;
  const [kcal, bielk, tuky, nasyt, sach, cukry, vlak, sol] = t.n;
  return { ...s, na100: { kcal, bielk, tuky, nasyt, sach, cukry, vlak, sol }, zdrojNutr: t.z, odhad: false, ...(t.p ? { priblizne: true } : {}), ...(t.pozn ? { poznamkaNutr: t.pozn } : {}) };
}
export const SUROVINY: Surovina[] = collect<Surovina>(import.meta.glob('./suroviny/*.ts', { eager: true })).map(sTabulkou);
export const RECEPTY: Recept[] = collect<Recept>(import.meta.glob('./recepty/*.ts', { eager: true }));
export const SUROVINA = new Map(SUROVINY.map((s) => [s.id, s]));
export const RECEPT = new Map(RECEPTY.map((r) => [r.id, r]));
