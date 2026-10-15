/** Lokálne úložisko kozmetiky (localStorage, vlastné kľúče – nezasahuje do stavu appky ani skenera potravín). Každý zápis a čítanie je v try/catch. */
import { PREDVOLENE_NAST, type Nastavenia } from './typy';

export const KLUC_NAST = 'recepty-kozmetika-nastavenia-v1';
export const KLUC_HIST = 'recepty-kozmetika-historia-v1';
export const KLUC_OBF = 'recepty-kozmetika-obf-v1';
export const LIMIT_HISTORIE = 100;
export const LIMIT_OBF = 200;

function citaj<T>(kluc: string, nahrada: T): T {
  try { const x = localStorage.getItem(kluc); return x ? (JSON.parse(x) as T) : nahrada; } catch { return nahrada; }
}
function pis(kluc: string, v: unknown): boolean {
  try { localStorage.setItem(kluc, JSON.stringify(v)); return true; } catch { return false; }
}

export function nacitajNastavenia(): Nastavenia {
  const x = citaj<Partial<Nastavenia>>(KLUC_NAST, {});
  return { ...PREDVOLENE_NAST, ...Object.fromEntries(Object.entries(PREDVOLENE_NAST).map(([k]) => [k, (x as Record<string, unknown>)?.[k] === true])) } as Nastavenia;
}
export const ulozNastavenia = (n: Nastavenia) => pis(KLUC_NAST, n);

export interface ZaznamK {
  id: string; cas: string; nazov: string; text: string; skore: number; pasmo: string; kod?: string;
}
export function nacitajHistoriu(): ZaznamK[] {
  const x = citaj<unknown>(KLUC_HIST, []);
  return Array.isArray(x) ? x.filter((z): z is ZaznamK => !!z && typeof (z as ZaznamK).text === 'string' && typeof (z as ZaznamK).id === 'string' && typeof (z as ZaznamK).skore === 'number') : [];
}
export function pridajDoHistorie(z: Omit<ZaznamK, 'id' | 'cas'>): ZaznamK {
  const novy: ZaznamK = { ...z, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, cas: new Date().toISOString() };
  let h = [novy, ...nacitajHistoriu()].slice(0, LIMIT_HISTORIE);
  while (h.length && !pis(KLUC_HIST, h)) h = h.slice(0, Math.floor(h.length / 2));
  return novy;
}
export function zmazZaznam(id: string) { pis(KLUC_HIST, nacitajHistoriu().filter((z) => z.id !== id)); }
export function vymazHistoriu() { try { localStorage.removeItem(KLUC_HIST); } catch { /* nič */ } }

/** Výrobok z Open Beauty Facts (ODbL), uložený na použitie bez internetu. */
export interface VyrobokObf { kod: string; nazov: string; znacka?: string; zlozenie: string; jazyk?: string; url: string; ulozene?: string; zCache?: boolean }
interface ObfZaznam { kod: string; ulozene: string; vyrobok: VyrobokObf }
export function nacitajObfUlozisko(): ObfZaznam[] {
  const x = citaj<unknown>(KLUC_OBF, []);
  return Array.isArray(x) ? x.filter((u): u is ObfZaznam => !!u && typeof (u as ObfZaznam).kod === 'string' && !!(u as ObfZaznam).vyrobok) : [];
}
export function najdiObf(kod: string): VyrobokObf | null {
  const u = nacitajObfUlozisko().find((x) => x.kod === kod);
  return u ? { ...u.vyrobok, zCache: true, ulozene: u.ulozene } : null;
}
export function ulozObf(v: VyrobokObf) {
  let z = [{ kod: v.kod, ulozene: new Date().toISOString(), vyrobok: { ...v, zCache: undefined, ulozene: undefined } }, ...nacitajObfUlozisko().filter((x) => x.kod !== v.kod)].slice(0, LIMIT_OBF);
  while (z.length && !pis(KLUC_OBF, z)) z = z.slice(0, Math.floor(z.length / 2));
}
