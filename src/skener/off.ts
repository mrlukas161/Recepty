/** Open Food Facts (ODbL) – dopyt z prehliadača používateľa, len keď je internet. Údaje: Open Food Facts, licencia ODbL. */
import type { Vyziva } from './typy';

export interface OffVyrobok {
  kod: string;
  nazov: string;
  znacka?: string;
  zlozenie: string;
  vyziva: Vyziva;
  nutriscore?: string;
  nova?: number;
  url: string;
}

/** Kontrolný súčet EAN-8 / EAN-13 / UPC-A (12) / GTIN-14. */
export function platnyKod(kod: string): boolean {
  if (!/^\d{8}$|^\d{12,14}$/.test(kod)) return false;
  const c = kod.split('').map(Number);
  const kontrolna = c.pop()!;
  const suma = c.reverse().reduce((a, x, i) => a + x * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (suma % 10)) % 10 === kontrolna;
}

const POLIA = ['product_name', 'product_name_sk', 'brands', 'ingredients_text', 'ingredients_text_sk', 'ingredients_text_cs', 'nutriments', 'nutriscore_grade', 'nova_group'].join(',');
export const offUrl = (kod: string) => `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(kod)}.json?fields=${POLIA}`;

const cislo = (x: unknown): number | undefined => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 100) / 100 : undefined);

/** Premení odpoveď OFF na náš tvar (čistá funkcia – testovaná). */
export function mapujOff(kod: string, j: unknown): OffVyrobok | null {
  const o = j as { status?: number; product?: Record<string, unknown> } | null;
  const p = o?.product;
  if (!p || o?.status === 0) return null;
  const n = (p.nutriments ?? {}) as Record<string, unknown>;
  const text = [p.ingredients_text_sk, p.ingredients_text_cs, p.ingredients_text].find((x) => typeof x === 'string' && x.trim()) as string | undefined;
  const nazov = [p.product_name_sk, p.product_name].find((x) => typeof x === 'string' && x.trim()) as string | undefined;
  return {
    kod,
    nazov: nazov?.trim() ?? `Výrobok ${kod}`,
    znacka: typeof p.brands === 'string' ? p.brands.split(',')[0].trim() : undefined,
    zlozenie: text?.replace(/<[^>]+>/g, '').replace(/_/g, '').trim() ?? '',
    vyziva: {
      kcal: cislo(n['energy-kcal_100g']), tuky: cislo(n.fat_100g), nasyt: cislo(n['saturated-fat_100g']), sach: cislo(n.carbohydrates_100g),
      cukry: cislo(n.sugars_100g), vlak: cislo(n.fiber_100g), bielk: cislo(n.proteins_100g), sol: cislo(n.salt_100g),
    },
    nutriscore: typeof p.nutriscore_grade === 'string' && /^[a-e]$/i.test(p.nutriscore_grade) ? p.nutriscore_grade.toUpperCase() : undefined,
    nova: typeof p.nova_group === 'number' ? p.nova_group : undefined,
    url: `https://world.openfoodfacts.org/product/${kod}`,
  };
}

export async function nacitajOff(kod: string): Promise<OffVyrobok | null> {
  const r = await fetch(offUrl(kod), { headers: { Accept: 'application/json' } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Open Food Facts odpovedal chybou ${r.status}`);
  return mapujOff(kod, await r.json());
}
