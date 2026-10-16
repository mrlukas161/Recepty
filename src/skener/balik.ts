/** Balík slovenských výrobkov z Open Food Facts (ODbL), stiahnutý 16.10.2026 – statické súbory v `public/off/`.
 *  Načíta sa až pri hľadaní podľa kódu (index + jeden diel podľa začiatku kódu); service worker ho uloží, takže funguje aj bez internetu.
 *  Údaje: © prispievatelia Open Food Facts, licencia ODbL. */
import type { OffVyrobok } from './off';
import type { Alergen } from '../data/types';

export const BALIK_DATUM = '16.10.2026';
export const BALIK_ISO = '2026-10-16T00:00:00.000Z';
export const BALIK_ZDROJ = `Open Food Facts (ODbL), stiahnuté ${BALIK_DATUM}`;

/** index.json: dĺžka predpony kódu, zoznam dielov a počet výrobkov. */
export interface BalikIndex { v: 1; dlzka: number; diely: string[]; pocet: number }
/** Kompaktný záznam: [názov, značka, text zloženia, jazyk, E-čísla, alergény, stopy, príznaky (1 = pridaný cukor, 2 = palmový olej), [kcal, tuky, nasyt, sach, cukry, vlak, bielk, sol], nutriscore, nova] */
export type BalikZaznam = [string, string, string, string, string[], Alergen[], Alergen[], number, (number | null)[], string, number];
export type BalikDiel = Record<string, BalikZaznam>;

const JAZYK_TEXT: Record<string, string> = { sk: 'slovenčine', cs: 'češtine', en: 'angličtine', povodny: 'pôvodnom jazyku výrobku' };
const zakladna = () => (typeof import.meta !== 'undefined' && (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL) || '/';

let indexSlub: Promise<BalikIndex | null> | undefined;
const diely = new Map<string, Promise<BalikDiel | null>>();
/** Len pre testy. */
export function vynulujBalik() { indexSlub = undefined; diely.clear(); }

async function json(url: string): Promise<unknown> {
  try { const r = await fetch(url); return r.ok ? await r.json() : null; } catch { return null; }
}
const platnyIndex = (x: unknown): x is BalikIndex => !!x && typeof x === 'object' && (x as BalikIndex).v === 1 && Number.isInteger((x as BalikIndex).dlzka) && Array.isArray((x as BalikIndex).diely);

export function rozbalZaznam(kod: string, z: BalikZaznam): OffVyrobok {
  const [nazov, znacka, zlozenie, jazyk, e, alergeny, stopy, prz, v, ns, nova] = z;
  const [kcal, tuky, nasyt, sach, cukry, vlak, bielk, sol] = v.map((x) => (x == null ? undefined : x));
  return {
    kod, nazov: nazov || `Výrobok ${kod}`, znacka: znacka || undefined, zlozenie, jazyk: (jazyk || undefined) as OffVyrobok['jazyk'],
    jazykText: jazyk ? JAZYK_TEXT[jazyk] : undefined,
    doplnok: { e, alergeny, stopy, cukor: !!(prz & 1), palma: !!(prz & 2) },
    vyziva: { kcal, tuky, nasyt, sach, cukry, vlak, bielk, sol },
    nutriscore: ns || undefined, nova: nova || undefined,
    url: `https://world.openfoodfacts.org/product/${kod}`,
    zBalika: true, ulozene: BALIK_ISO,
  };
}

/** Nájde výrobok v balíku (alebo null – aj keď balík nie je dostupný). */
export async function najdiVBaliku(kod: string): Promise<OffVyrobok | null> {
  const base = zakladna() + 'off/';
  indexSlub ??= json(base + 'index.json').then((x) => (platnyIndex(x) ? x : null));
  const idx = await indexSlub;
  if (!idx) { indexSlub = undefined; return null; }
  const dielKluc = kod.slice(0, idx.dlzka);
  if (!idx.diely.includes(dielKluc)) return null;
  if (!diely.has(dielKluc)) diely.set(dielKluc, json(`${base}${dielKluc}.json`).then((x) => (x && typeof x === 'object' ? (x as BalikDiel) : null)));
  const d = await diely.get(dielKluc)!;
  if (!d) { diely.delete(dielKluc); return null; }
  const z = d[kod];
  return Array.isArray(z) ? rozbalZaznam(kod, z) : null;
}
