import type { Surovina, SurovinaVRecepte } from '../data/types';

/** Prepočet množstva suroviny na gramy. */
export function naGramy(s: Surovina | undefined, mnozstvo: number, jednotka: SurovinaVRecepte['jednotka'] | 'ks'): number {
  const j = s?.jednotky ?? {};
  switch (jednotka) {
    case 'g': return mnozstvo;
    case 'ml': return mnozstvo * (j.ml ?? 1);
    case 'ks': return mnozstvo * (j.ks ?? 50);
    case 'lyzica': return mnozstvo * (j.lyzica ?? 15);
    case 'lyzicka': return mnozstvo * (j.lyzicka ?? 5);
  }
}
