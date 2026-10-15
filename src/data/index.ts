import type { Surovina, Recept } from './types';

function collect<T>(mods: Record<string, unknown>): T[] {
  const out: T[] = [];
  for (const m of Object.values(mods)) {
    for (const v of Object.values(m as Record<string, unknown>)) if (Array.isArray(v)) out.push(...(v as T[]));
  }
  return out;
}
export const SUROVINY: Surovina[] = collect<Surovina>(import.meta.glob('./suroviny/*.ts', { eager: true }));
export const RECEPTY: Recept[] = collect<Recept>(import.meta.glob('./recepty/*.ts', { eager: true }));
export const SUROVINA = new Map(SUROVINY.map((s) => [s.id, s]));
export const RECEPT = new Map(RECEPTY.map((r) => [r.id, r]));
