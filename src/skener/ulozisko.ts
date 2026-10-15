/** Lokálna zásoba výrobkov nájdených podľa čiarového kódu – aby ich appka našla aj bez internetu.
 *  localStorage s limitom počtu (najstaršie vypadnú). Údaje: Open Food Facts (ODbL). */
import type { OffVyrobok } from './off';

const KEY = 'recepty-skener-off-v1';
export const LIMIT_VYROBKOV = 300;

export type ZdrojUlozenia = 'sken' | 'predstih';
export interface UlozenyVyrobok { kod: string; ulozene: string; zdroj: ZdrojUlozenia; vyrobok: OffVyrobok }

export function nacitajUlozisko(): UlozenyVyrobok[] {
  try {
    const x = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(x) ? x.filter((u): u is UlozenyVyrobok => !!u && typeof u.kod === 'string' && !!u.vyrobok && typeof u.ulozene === 'string') : [];
  } catch { return []; }
}

function zapis(v: UlozenyVyrobok[]) {
  // pri plnom úložisku postupne zahadzujeme najstaršie, až kým sa zápis podarí
  let kus = v.slice(0, LIMIT_VYROBKOV);
  while (kus.length) {
    try { localStorage.setItem(KEY, JSON.stringify(kus)); return; } catch { kus = kus.slice(0, Math.floor(kus.length / 2)); }
  }
}

/** Uloží (alebo obnoví) výrobok; najnovšie je prvé. */
export function ulozVyrobok(v: OffVyrobok, zdroj: ZdrojUlozenia = 'sken', cas = new Date()): void {
  const { ulozene: _u, zCache: _z, ...cisty } = v;
  void _u; void _z;
  zapis([{ kod: v.kod, ulozene: cas.toISOString(), zdroj, vyrobok: cisty }, ...nacitajUlozisko().filter((u) => u.kod !== v.kod)]);
}

/** Nájde výrobok v lokálnej zásobe; označí ho dátumom uloženia. */
export function najdiVUlozisku(kod: string): OffVyrobok | null {
  const u = nacitajUlozisko().find((x) => x.kod === kod);
  return u ? { ...u.vyrobok, zCache: true, ulozene: u.ulozene } : null;
}

export function vymazUlozisko() { try { localStorage.removeItem(KEY); } catch { /* nič */ } }

/** Rozhranie pre neskorší beh: predstiahnutý výber slovenských výrobkov z OFF sa vloží touto funkciou
 *  (napr. po stiahnutí balíka JSON s poľom OffVyrobok). Údaje zo skenovania ostanú, predstih ich neprepíše. */
export function importujPredstih(vyrobky: OffVyrobok[], cas = new Date()): number {
  const maju = new Set(nacitajUlozisko().map((u) => u.kod));
  const nove = vyrobky.filter((v) => v && typeof v.kod === 'string' && !maju.has(v.kod))
    .map((v): UlozenyVyrobok => ({ kod: v.kod, ulozene: cas.toISOString(), zdroj: 'predstih', vyrobok: v }));
  zapis([...nacitajUlozisko(), ...nove]);
  return nove.length;
}

export const datumUlozenia = (iso?: string) => {
  const d = iso ? new Date(iso) : undefined;
  if (!d || Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};
