/** Open Food Facts (ODbL) – dopyt z prehliadača používateľa, len keď je internet. Údaje: Open Food Facts, licencia ODbL. */
import type { Vyziva, Doplnok } from './typy';
import type { Alergen } from '../data/types';
import { najdiVUlozisku, ulozVyrobok } from './ulozisko';
import { najdiVBaliku } from './balik';
import { vlastneSkenyPotravin, type VlastnySken } from './vlastne-skeny';

export type JazykZlozenia = 'sk' | 'cs' | 'en' | 'povodny';

export interface OffVyrobok {
  kod: string;
  nazov: string;
  znacka?: string;
  zlozenie: string;
  /** v akom jazyku je text zloženia */
  jazyk?: JazykZlozenia;
  jazykText?: string;
  /** údaje z tagov databázy (E-čísla, alergény, pridaný cukor, palmový olej) */
  doplnok?: Doplnok;
  vyziva: Vyziva;
  nutriscore?: string;
  nova?: number;
  url: string;
  /** výrobok pochádza z lokálnej zásoby (bez internetu) */
  zCache?: boolean;
  /** výrobok pochádza z balíka slovenských výrobkov (public/off) */
  zBalika?: boolean;
  /** ISO čas uloženia do lokálnej zásoby */
  ulozene?: string;
  /** vlastný sken používateľa (zloženie odfotené/vpísané k tomuto kódu) – má prednosť pred balíkom aj OFF */
  vlastny?: boolean;
}

/** Stránka Open Food Facts na pridanie/úpravu výrobku s daným kódom (otvára sa v novom okne; appka nič neodosiela).
 *  Tvar adresy `cgi/product.pl?type=edit&code=` potvrdený vyhľadávaním (pozri docs/ROZHODNUTIA.md). */
export const offPridatUrl = (kod: string) => `https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=${encodeURIComponent(kod)}`;

export function vlastnyNaVyrobok(v: VlastnySken): OffVyrobok {
  return { kod: v.kod, nazov: v.nazov, znacka: v.znacka, zlozenie: v.zlozenie, vyziva: v.vyziva ?? {}, url: `https://world.openfoodfacts.org/product/${v.kod}`, vlastny: true, ulozene: v.ulozene };
}

/** Kontrolný súčet EAN-8 / EAN-13 / UPC-A (12) / GTIN-14. */
export function platnyKod(kod: string): boolean {
  if (!/^\d{8}$|^\d{12,14}$/.test(kod)) return false;
  const c = kod.split('').map(Number);
  const kontrolna = c.pop()!;
  const suma = c.reverse().reduce((a, x, i) => a + x * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (suma % 10)) % 10 === kontrolna;
}

const POLIA = [
  'product_name', 'product_name_sk', 'brands', 'lang', 'ingredients_text', 'ingredients_text_sk', 'ingredients_text_cs', 'ingredients_text_en',
  'ingredients_tags', 'additives_tags', 'ingredients_analysis_tags', 'allergens_tags', 'traces_tags', 'nutriments', 'nutriscore_grade', 'nova_group',
].join(',');
export const offUrl = (kod: string) => `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(kod)}.json?fields=${POLIA}`;

const cislo = (x: unknown): number | undefined => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 100) / 100 : undefined);
const retazec = (x: unknown): string | undefined => (typeof x === 'string' && x.trim() ? x : undefined);
const tagy = (x: unknown): string[] => (Array.isArray(x) ? x.filter((t): t is string => typeof t === 'string') : []);

/** Alergény OFF (en:milk …) → naše kľúče. */
const ALERGEN_TAG: Record<string, Alergen> = {
  gluten: 'lepok', crustaceans: 'korovce', eggs: 'vajcia', fish: 'ryby', peanuts: 'arasidy', soybeans: 'soja', milk: 'mlieko', nuts: 'orechy',
  celery: 'zeler', mustard: 'horcica', 'sesame-seeds': 'sezam', 'sulphur-dioxide-and-sulphites': 'siricitany', lupin: 'vlcibob', molluscs: 'makkyse',
};
export function alergenyZTagov(t: unknown): Alergen[] {
  return [...new Set(tagy(t).map((x) => ALERGEN_TAG[x.replace(/^[a-z]{2}:/, '')]).filter((x): x is Alergen => !!x))];
}

const JAZYK_TEXT: Record<JazykZlozenia, string> = { sk: 'slovenčine', cs: 'češtine', en: 'angličtine', povodny: 'pôvodnom jazyku výrobku' };

/** Premení odpoveď OFF na náš tvar (čistá funkcia – testovaná). Text: sk → cs → en → originál. */
export function mapujOff(kod: string, j: unknown): OffVyrobok | null {
  const o = j as { status?: number; product?: Record<string, unknown> } | null;
  const p = o?.product;
  if (!p || o?.status === 0) return null;
  const n = (p.nutriments ?? {}) as Record<string, unknown>;
  const kandidati: [JazykZlozenia, string | undefined][] = [['sk', retazec(p.ingredients_text_sk)], ['cs', retazec(p.ingredients_text_cs)], ['en', retazec(p.ingredients_text_en)], ['povodny', retazec(p.ingredients_text)]];
  const najdeny = kandidati.find(([, t]) => t);
  const jazyk = najdeny?.[0];
  const nazov = [p.product_name_sk, p.product_name].find((x) => typeof x === 'string' && x.trim()) as string | undefined;
  const itags = [...tagy(p.ingredients_tags), ...tagy(p.ingredients_analysis_tags)];
  const doplnok: Doplnok = {
    e: tagy(p.additives_tags),
    alergeny: alergenyZTagov(p.allergens_tags),
    stopy: alergenyZTagov(p.traces_tags),
    cukor: itags.includes('en:added-sugar'),
    palma: itags.includes('en:palm-oil'),
  };
  return {
    kod,
    nazov: nazov?.trim() ?? `Výrobok ${kod}`,
    znacka: typeof p.brands === 'string' ? p.brands.split(',')[0].trim() : undefined,
    zlozenie: najdeny?.[1]?.replace(/<[^>]+>/g, '').replace(/_/g, '').trim() ?? '',
    jazyk,
    jazykText: jazyk ? (jazyk === 'povodny' && typeof p.lang === 'string' ? `pôvodnom jazyku výrobku (${p.lang})` : JAZYK_TEXT[jazyk]) : undefined,
    doplnok,
    vyziva: {
      kcal: cislo(n['energy-kcal_100g']), tuky: cislo(n.fat_100g), nasyt: cislo(n['saturated-fat_100g']), sach: cislo(n.carbohydrates_100g),
      cukry: cislo(n.sugars_100g), vlak: cislo(n.fiber_100g), bielk: cislo(n.proteins_100g), sol: cislo(n.salt_100g),
    },
    nutriscore: typeof p.nutriscore_grade === 'string' && /^[a-e]$/i.test(p.nutriscore_grade) ? p.nutriscore_grade.toUpperCase() : undefined,
    nova: typeof p.nova_group === 'number' ? p.nova_group : undefined,
    url: `https://world.openfoodfacts.org/product/${kod}`,
  };
}

/** Hľadanie podľa kódu: lokálna zásoba → balík → online dopyt na OFF (uloží sa do zásoby). */
export async function nacitajOff(kod: string): Promise<OffVyrobok | null> {
  // 0. vlastný sken (vždy vyhrá), 1. lokálna zásoba, 2. balík slovenských výrobkov (aj bez internetu), 3. Open Food Facts online
  const vlastny = vlastneSkenyPotravin.najdi(kod);
  if (vlastny) return vlastnyNaVyrobok(vlastny);
  const miestny = najdiVUlozisku(kod);
  if (miestny) return miestny;
  const zBalika = await najdiVBaliku(kod);
  if (zBalika) return zBalika;
  let r: Response;
  try {
    r = await fetch(offUrl(kod), { headers: { Accept: 'application/json' } });
  } catch (e) {
    const z = najdiVUlozisku(kod);
    if (z) return z;
    throw e;
  }
  if (r.status === 404) return null;
  if (!r.ok) {
    const z = najdiVUlozisku(kod);
    if (z) return z;
    throw new Error(`Open Food Facts odpovedal chybou ${r.status}`);
  }
  const v = mapujOff(kod, await r.json());
  if (v) ulozVyrobok(v);
  return v;
}
