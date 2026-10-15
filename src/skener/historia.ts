/** História skenov – len lokálne (localStorage), bez fotiek. */
import type { Vyziva } from './typy';

const KEY = 'recepty-skener-v1';
export interface Zaznam {
  id: string;
  cas: string;
  nazov: string;
  text: string;
  skore: number;
  pasmo: string;
  vyziva?: Vyziva;
  kod?: string;
}

export function nacitajHistoriu(): Zaznam[] {
  try { const x = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(x) ? x : []; } catch { return []; }
}
function uloz(z: Zaznam[]) { try { localStorage.setItem(KEY, JSON.stringify(z.slice(0, 40))); } catch { /* bez ukladania */ } }
export function pridajDoHistorie(z: Omit<Zaznam, 'id' | 'cas'>): Zaznam {
  const novy: Zaznam = { ...z, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, cas: new Date().toISOString() };
  uloz([novy, ...nacitajHistoriu()]);
  return novy;
}
export function zmazZaznam(id: string) { uloz(nacitajHistoriu().filter((z) => z.id !== id)); }
export function vymazHistoriu() { uloz([]); }
