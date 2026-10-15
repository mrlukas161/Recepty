import type { Recept, Surovina } from '../data/types';
import type { Kategoria, Nastavenia } from './types';

/** Do ktorých obmedzovaných kategórií surovina patrí (podľa príznakov, rovnako ako v skóre a filtroch). */
export function kategorieSuroviny(s: Surovina | undefined): Kategoria[] {
  if (!s) return [];
  const k: Kategoria[] = [];
  if (s.priznaky.includes('spracovane-maso')) k.push('udeniny');
  if (s.priznaky.includes('rafinovana-muka')) k.push('muka');
  if (s.priznaky.includes('pridany-cukor')) k.push('cukor');
  if (s.priznaky.includes('vyprazane')) k.push('vyprazane');
  return k;
}

/**
 * Voliteľné suroviny receptu, ktoré patria do kategórie, ktorú má domácnosť obmedzenú alebo vylúčenú.
 * Predvolene sa vynechávajú (nepočítajú sa do limitu, nákupu ani skóre), kým ich používateľ nepridá.
 */
export function obmedzeneVolitelne(r: Recept, n: Nastavenia, db: Map<string, Surovina>): string[] {
  const out: string[] = [];
  for (const s of r.suroviny) {
    if (!s.volitelna || s.nevyhnutna) continue;
    if (kategorieSuroviny(db.get(s.id)).some((k) => n.obmedzenia[k] !== 'bez') && !out.includes(s.id)) out.push(s.id);
  }
  return out;
}

/** Obmedzené voliteľné suroviny, ktoré sú v tomto recepte vynechané (používateľ ich nepridal). */
export function vynechaneVolitelne(r: Recept, n: Nastavenia, db: Map<string, Surovina>, pridane: string[] = []): string[] {
  return obmedzeneVolitelne(r, n, db).filter((id) => !pridane.includes(id));
}

/** Kategórie, do ktorých recept patrí kvôli pridaným voliteľným surovinám (nad rámec `Info.kat`). */
export function kategorieZPridanych(r: Recept, db: Map<string, Surovina>, pridane: string[] = []): Kategoria[] {
  const out = new Set<Kategoria>();
  for (const s of r.suroviny) if (s.volitelna && !s.nevyhnutna && pridane.includes(s.id)) kategorieSuroviny(db.get(s.id)).forEach((k) => out.add(k));
  return [...out];
}

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PREDLOZKY = new Set(['s', 'so', 'z', 'zo', 'a', 'na', 'v']);

/**
 * Zobrazovací názov receptu. Ak názov sľubuje vynechanú voliteľnú surovinu („s údeným“, „so šunkou“),
 * vráti sa bez nej a s poznámkou, napr. „Fazuľový prívarok (klobása voliteľne)“. Dáta receptu sa nemenia.
 */
export function zobrazenyNazov(r: Pick<Recept, 'nazov'>, db: Map<string, Surovina>, vynechane: string[]): string {
  let slova = r.nazov.split(' ');
  const poznamky: string[] = [];
  for (const id of vynechane) {
    const s = db.get(id);
    if (!s) continue;
    const kmene = s.nazov.split(/[\s/(),]+/).map(norm).filter((w) => w.length >= 4).map((w) => w.slice(0, Math.max(4, w.length - 2)));
    const idx = slova.findIndex((w) => { const x = norm(w.replace(/[(),]/g, '')); return kmene.some((k) => x.startsWith(k)); });
    if (idx < 0) continue;
    let od = idx;
    if (od > 0 && PREDLOZKY.has(norm(slova[od - 1]))) od--;
    slova = [...slova.slice(0, od), ...slova.slice(idx + 1)];
    poznamky.push(`${s.nazov.split(/[\s/]+/)[0].toLowerCase()} voliteľne`);
  }
  if (!poznamky.length) return r.nazov;
  while (slova.length && PREDLOZKY.has(norm(slova[slova.length - 1]))) slova.pop();
  return `${slova.join(' ')} (${poznamky.join(', ')})`;
}

/** Zobrazovací názov pre nastavenia domácnosti a prípadne pridané voliteľné suroviny. */
export function nazovPreDomacnost(r: Recept, n: Nastavenia, db: Map<string, Surovina>, pridane: string[] = []): string {
  return zobrazenyNazov(r, db, vynechaneVolitelne(r, n, db, pridane));
}
