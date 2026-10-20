import type { PrecoId } from '../data/preco';
import type { Recept, Surovina } from '../data/types';
import { jeRafCukor } from './filtre';

/** Ktoré popisy „prečo to škodí“ patria k surovine (podľa príznakov v databáze). */
export function precoPreSurovinu(s: Surovina | undefined): PrecoId[] {
  if (!s) return [];
  const out: PrecoId[] = [];
  if (s.priznaky.includes('rafinovana-muka')) out.push('psenicna-muka');
  if (jeRafCukor(s) || s.priznaky.includes('med')) out.push('rafinovany-cukor');
  if (s.priznaky.includes('spracovane-maso')) out.push('udeniny', 'dusitany');
  if (s.priznaky.includes('vyprazane')) out.push('vyprazane');
  return out;
}

const SKROB = /zemiak|hranolk|chlieb|toast|rozok|bageta|placka|lokse|lokš/;

/** Popisy pre recept: slabé suroviny a spôsob úpravy (gril, opekanie, vyprážanie, pečenie škrobových jedál). Voliteľné suroviny sa nepočítajú. */
export function precoPreRecept(r: Recept, db: Map<string, Surovina>): PrecoId[] {
  const out: PrecoId[] = [];
  const sur = r.suroviny.filter((x) => !(x.volitelna && !x.nevyhnutna)).map((x) => db.get(x.id));
  for (const s of sur) out.push(...precoPreSurovinu(s).filter((p) => p !== 'rafinovany-cukor' || jeRafCukor(s)));
  const text = r.postup.join(' ').toLowerCase();
  const maso = sur.some((s) => s?.priznaky.includes('maso') || s?.priznaky.includes('spracovane-maso'));
  if (maso && /gril|opek|opeč|na ohni|na uhl/.test(text)) out.push('hca-pah');
  const skrob = sur.some((s) => s && SKROB.test(s.id)) || SKROB.test(r.id);
  if (skrob && (r.vyprazane || /hranolk|opek|opeč|chrumk|vypráž|vypraz|smaž|smaz|2[0-4]0 ?°c/.test(text))) out.push('akrylamid');
  if (r.vyprazane) out.push('vyprazane');
  return [...new Set(out)];
}
