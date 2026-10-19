import { useEffect, useState } from 'preact/hooks';

/** Zoznam fotiek jedál: `public/foto/zoznam.json` (pole záznamov) a súbory `public/foto/<id-receptu>.webp`. */
export interface FotoZaznam { id: string; ai: boolean; model: string; datum: string }

/** Vyčistí zoznam z JSON-u: nepovolené id, duplicity a nesprávne tvary sa zahodia. Foto sa zobrazí len pre záznam, ktorý sa tu zachová. */
export function overZoznamFotiek(x: unknown): FotoZaznam[] {
  if (!Array.isArray(x)) return [];
  const videne = new Set<string>(); const o: FotoZaznam[] = [];
  for (const z of x) {
    if (!z || typeof z !== 'object') continue;
    const r = z as Record<string, unknown>;
    if (typeof r.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(r.id) || videne.has(r.id)) continue;
    videne.add(r.id);
    o.push({ id: r.id, ai: r.ai === true, model: typeof r.model === 'string' ? r.model.slice(0, 80) : '', datum: typeof r.datum === 'string' ? r.datum.slice(0, 20) : '' });
  }
  return o;
}

const zaklad = () => (import.meta.env?.BASE_URL ?? '/');
export const fotoUrl = (id: string) => `${zaklad()}foto/${id}.webp`;

let zoznam = new Map<string, FotoZaznam>();
let stav: 'nenacitane' | 'nacitava' | 'hotovo' = 'nenacitane';
const poslucha = new Set<() => void>();

export async function nacitajFotky(): Promise<void> {
  if (stav !== 'nenacitane') return;
  stav = 'nacitava';
  try {
    const r = await fetch(`${zaklad()}foto/zoznam.json`, { cache: 'no-cache' });
    if (r.ok) zoznam = new Map(overZoznamFotiek(await r.json()).map((z) => [z.id, z]));
  } catch { /* bez fotiek (offline alebo súbor chýba) – ostane ilustrácia */ }
  stav = 'hotovo';
  poslucha.forEach((f) => f());
}
/** Pre testy. */
export function nastavFotky(z: FotoZaznam[]) { zoznam = new Map(z.map((x) => [x.id, x])); stav = 'hotovo'; poslucha.forEach((f) => f()); }

export function useFoto(id: string): FotoZaznam | undefined {
  const [, r] = useState(0);
  useEffect(() => {
    const f = () => r((x) => x + 1);
    poslucha.add(f); void nacitajFotky();
    return () => { poslucha.delete(f); };
  }, []);
  return zoznam.get(id);
}
