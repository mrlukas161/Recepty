/** Open Beauty Facts (ODbL) – dopyt z prehliadača používateľa, len keď je internet; výsledok sa ukladá na použitie offline. */
import { platnyKod } from '../skener/off';
import { najdiObf, ulozObf, type VyrobokObf } from './ulozisko';
import { vlastneSkenyKozmetiky, type VlastnySken } from '../skener/vlastne-skeny';

export { platnyKod };

/** Stránka Open Beauty Facts na pridanie/úpravu výrobku s daným kódom (nový tab; appka nič neodosiela). */
export const obfPridatUrl = (kod: string) => `https://world.openbeautyfacts.org/cgi/product.pl?type=edit&code=${encodeURIComponent(kod)}`;

export function vlastnyNaObf(v: VlastnySken): VyrobokObf {
  return { kod: v.kod, nazov: v.nazov, znacka: v.znacka, zlozenie: v.zlozenie, url: `https://world.openbeautyfacts.org/product/${v.kod}`, vlastny: true, ulozene: v.ulozene };
}
export const obfUrl = (kod: string) => `https://world.openbeautyfacts.org/api/v2/product/${encodeURIComponent(kod)}.json?fields=product_name,product_name_en,brands,lang,ingredients_text,ingredients_text_en,ingredients_text_fr,ingredients_text_de,ingredients_text_sk,ingredients_text_cs`;

const retazec = (x: unknown): string | undefined => (typeof x === 'string' && x.trim() ? x : undefined);

/** Odpoveď OBF → náš tvar. Text zloženia: en → sk → cs → pôvodný jazyk výrobku → fr/de. */
export function mapujObf(kod: string, j: unknown): VyrobokObf | null {
  const o = j as { status?: number; product?: Record<string, unknown> } | null;
  const p = o?.product;
  if (!p || o?.status === 0) return null;
  const kand: [string, string | undefined][] = [['angličtine', retazec(p.ingredients_text_en)], ['slovenčine', retazec(p.ingredients_text_sk)], ['češtine', retazec(p.ingredients_text_cs)], ['pôvodnom jazyku', retazec(p.ingredients_text)], ['francúzštine', retazec(p.ingredients_text_fr)], ['nemčine', retazec(p.ingredients_text_de)]];
  const n = kand.find(([, t]) => t);
  const nazov = retazec(p.product_name_en) ?? retazec(p.product_name);
  return {
    kod,
    nazov: nazov?.trim() ?? `Výrobok ${kod}`,
    znacka: typeof p.brands === 'string' ? p.brands.split(',')[0].trim() || undefined : undefined,
    zlozenie: n?.[1]?.replace(/<[^>]+>/g, '').replace(/_/g, '').trim() ?? '',
    jazyk: n?.[0],
    url: `https://world.openbeautyfacts.org/product/${kod}`,
  };
}

/** Online: dopyt na OBF a uloženie. Bez internetu alebo pri chybe servera: výrobok z lokálnej zásoby. */
export async function nacitajObf(kod: string): Promise<VyrobokObf | null> {
  const vlastny = vlastneSkenyKozmetiky.najdi(kod);
  if (vlastny) return vlastnyNaObf(vlastny);
  let r: Response;
  try {
    r = await fetch(obfUrl(kod), { headers: { Accept: 'application/json' } });
  } catch (e) {
    const z = najdiObf(kod);
    if (z) return z;
    throw e;
  }
  if (r.status === 404) return null;
  if (!r.ok) {
    const z = najdiObf(kod);
    if (z) return z;
    throw new Error(`Open Beauty Facts odpovedal chybou ${r.status}`);
  }
  const v = mapujObf(kod, await r.json());
  if (v) ulozObf(v);
  return v;
}
