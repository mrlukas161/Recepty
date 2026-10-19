import { SUROVINA, RECEPTY as RECEPTY_ZAKLAD } from './data';
import { infoRecept, type Info } from './engine/filtre';
import type { Recept } from './data/types';
import { naRecept } from './engine/vlastne';
import { dajStav, pocuvaj } from './store';

const INFOS_ZAKLAD: Info[] = RECEPTY_ZAKLAD.map((r) => infoRecept(r, SUROVINA));
/** Zoznamy sú „živé“: obsahujú vstavané aj vlastné recepty a obnovujú sa pri každej zmene uloženého stavu (mutujú sa na mieste). */
export const INFOS: Info[] = [...INFOS_ZAKLAD];
export const INFO = new Map(INFOS.map((i) => [i.r.id, i]));
export const RECEPTY: Recept[] = [...RECEPTY_ZAKLAD];
export const RECEPT = new Map(RECEPTY.map((r) => [r.id, r]));
export { SUROVINA };

let podpis = '\u0000';
/** Zmení sa vždy, keď sa zmenia vlastné recepty – hodí sa do závislostí useMemo. */
export const vlastnaVerzia = () => podpis;
export function synchronizujVlastne() {
  const v = dajStav().vlastne;
  const p = v.map((x) => x.id + x.upravene).join('|');
  if (p === podpis) return;
  podpis = p;
  for (const i of INFOS.splice(INFOS_ZAKLAD.length)) { INFO.delete(i.r.id); RECEPT.delete(i.r.id); }
  RECEPTY.length = RECEPTY_ZAKLAD.length;
  for (const x of v) {
    const r = naRecept(x, SUROVINA);
    const i = infoRecept(r, SUROVINA);
    INFOS.push(i); INFO.set(r.id, i); RECEPT.set(r.id, r); RECEPTY.push(r);
  }
}
synchronizujVlastne();
pocuvaj(synchronizujVlastne);

export function typPodlaCasu(d = new Date()): 'ranajky' | 'obed' | 'vecera' {
  const h = d.getHours();
  return h < 11 ? 'ranajky' : h < 16 ? 'obed' : 'vecera';
}
export const TYP_NAZOV: Record<string, string> = { ranajky: 'Raňajky', obed: 'Obed', vecera: 'Večera', polievka: 'Polievka', desiata: 'Desiata', olovrant: 'Olovrant', dezert: 'Dezert' };
