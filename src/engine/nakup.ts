import type { Recept, Surovina, Oddelenie } from '../data/types';
import { naGramy } from './units';

export interface PolozkaNakupu { id: string; nazov: string; oddelenie: Oddelenie; gramy: number; text: string }
export const ODDELENIA: Record<Oddelenie, string> = {
  'ovocie-zelenina': 'Ovocie a zelenina', pecivo: 'Pečivo', 'maso-ryby': 'Mäso a ryby', udeniny: 'Údeniny',
  'mliecne-vajcia': 'Mliečne a vajcia', trvanlive: 'Trvanlivé', 'obilniny-muky': 'Obilniny a múky',
  'strukoviny-konzervy': 'Strukoviny a konzervy', koreniny: 'Koreniny', 'oleje-tuky': 'Oleje a tuky',
  'sladkosti-sladidla': 'Sladidlá a sladkosti', mrazene: 'Mrazené', napoje: 'Nápoje', ine: 'Iné',
};

export function formatMnozstvo(s: Surovina | undefined, g: number): string {
  if (s?.jednotky.ks && s.jednotky.ks >= 30 && ['ovocie', 'zelenina', 'vajcia', 'pecivo'].includes(s.skupina)) {
    const ks = g / s.jednotky.ks;
    if (ks >= 0.8) return `${g >= 1000 ? (g / 1000).toFixed(1).replace('.', ',') + ' kg' : Math.round(g) + ' g'} (~${Math.round(ks)} ks)`;
  }
  if (g >= 1000) return `${(g / 1000).toFixed(2).replace(/0$/, '').replace('.', ',')} kg`;
  if (g < 10) return `${Math.round(g * 10) / 10} g`.replace('.', ',');
  return `${Math.round(g / 5) * 5 || Math.round(g)} g`;
}

/** Zlúči suroviny z viacerých receptov, prepočíta na `porcieDomacnosti`, odpočíta zásoby. */
export function zostavNakup(
  recepty: { r: Recept; krat: number }[], porcieDomacnosti: number, db: Map<string, Surovina>, mamDoma: Set<string>,
): Record<string, PolozkaNakupu[]> {
  const sum = new Map<string, number>();
  for (const { r, krat } of recepty) {
    const f = (porcieDomacnosti / r.porcie) * krat;
    for (const s of r.suroviny) {
      if (s.volitelna) continue;
      sum.set(s.id, (sum.get(s.id) ?? 0) + naGramy(db.get(s.id), s.mnozstvo, s.jednotka) * f);
    }
  }
  const out: Record<string, PolozkaNakupu[]> = {};
  for (const [id, g] of sum) {
    if (mamDoma.has(id)) continue;
    const s = db.get(id); if (!s) continue;
    (out[s.oddelenie] ??= []).push({ id, nazov: s.nazov, oddelenie: s.oddelenie, gramy: g, text: formatMnozstvo(s, g) });
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.nazov.localeCompare(b.nazov, 'sk'));
  return out;
}
