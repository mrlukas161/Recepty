import { SUROVINA, RECEPTY, RECEPT } from './data';
import { infoRecept, type Info } from './engine/filtre';

export const INFOS: Info[] = RECEPTY.map((r) => infoRecept(r, SUROVINA));
export const INFO = new Map(INFOS.map((i) => [i.r.id, i]));
export { SUROVINA, RECEPTY, RECEPT };

export function typPodlaCasu(d = new Date()): 'ranajky' | 'obed' | 'vecera' {
  const h = d.getHours();
  return h < 11 ? 'ranajky' : h < 16 ? 'obed' : 'vecera';
}
export const TYP_NAZOV: Record<string, string> = { ranajky: 'Raňajky', obed: 'Obed', vecera: 'Večera', polievka: 'Polievka', desiata: 'Desiata', dezert: 'Dezert' };
