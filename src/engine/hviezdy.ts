import type { UlozenyStav } from './types';

/**
 * Hodnotenie receptov hviezdičkami 1–5 (`hviezdicky`). 1★ = nechutilo → recept sa nenavrhuje, nedostane sa do rulety ani jedálnička.
 * Staré 👍/👎 (`hodnotenie` 1 / −1) sa čítajú ako 4★ / 1★, kým recept nedostane novú hviezdičku.
 */
export type StavHviezd = Pick<UlozenyStav, 'hodnotenie'> & { hviezdicky?: Record<string, number> };

export function dajHviezdy(s: StavHviezd, id: string): number {
  const h = s.hviezdicky?.[id];
  if (typeof h === 'number' && h >= 1 && h <= 5) return h;
  const st = s.hodnotenie?.[id];
  return st === 1 ? 4 : st === -1 ? 1 : 0;
}
export const nechutilo = (s: StavHviezd, id: string) => dajHviezdy(s, id) === 1;
export function idNechutilo(s: StavHviezd, vsetky: Iterable<string>): string[] {
  return [...vsetky].filter((id) => nechutilo(s, id));
}
/** Váha pri náhodnom výbere (Zamiešať): 4–5★ viac, nehodnotené a 3★ neutrálne, 2★ menej, 1★ nikdy. */
export function vahaHviezd(h: number): number {
  return h === 1 ? 0 : h === 2 ? 0.5 : h === 4 ? 2.5 : h === 5 ? 4 : 1;
}
/** Úprava poradia návrhov (body skóre): 5★ +10, 4★ +5, 2★ −6. */
export function bonusHviezd(h: number): number {
  return h === 5 ? 10 : h === 4 ? 5 : h === 2 ? -6 : 0;
}
export const HVIEZDY_TEXT: Record<number, string> = { 1: 'nechutilo', 2: 'skôr nie', 3: 'ujde', 4: 'chutilo', 5: 'výborné' };
