import type { Recept, SurovinaVRecepte } from '../data/types';

export interface StavUprav {
  odobrane: string[];                  // id voliteľných surovín
  vymenene: Record<string, string>;    // z -> na
  pridane: number[];                   // indexy v recept.upravy typu 'pridat'
}
export const ZIADNE_UPRAVY: StavUprav = { odobrane: [], vymenene: {}, pridane: [] };

export function aplikujUpravy(r: Recept, st: StavUprav): SurovinaVRecepte[] {
  const out: SurovinaVRecepte[] = [];
  for (const s of r.suroviny) {
    if (s.volitelna && !s.nevyhnutna && st.odobrane.includes(s.id)) continue;
    const na = st.vymenene[s.id];
    out.push(na ? { ...s, id: na, alternativy: undefined } : s);
  }
  for (const i of st.pridane) {
    const u = r.upravy[i];
    if (u && u.typ === 'pridat' && u.na) out.push({ id: u.na, mnozstvo: u.mnozstvo ?? 50, jednotka: u.jednotka ?? 'g' });
  }
  return out;
}
