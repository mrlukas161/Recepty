import { describe, it, expect } from 'vitest';
import { RECEPTY, SUROVINA } from '../src/data';
import { infoRecept } from '../src/engine/filtre';
import { tyzdenMuky, pondelokTyzdna, nedelaTyzdna } from '../src/engine/muka';
import { PREDVOLENE } from '../src/engine/types';

const infos = RECEPTY.map((r) => infoRecept(r, SUROVINA));
const mapa = new Map(infos.map((i) => [i.r.id, i]));
const sMukou = infos.find((i) => i.kat.muka)!.r.id;
const bez = infos.find((i) => !i.kat.muka)!.r.id;
const streda = new Date(2026, 9, 21, 12); // 21.10.2026 = streda

describe('týždenný prehľad múky', () => {
  it('týždeň je po–ne', () => {
    expect(pondelokTyzdna(streda)).toBe('2026-10-19');
    expect(nedelaTyzdna(streda)).toBe('2026-10-25');
    expect(pondelokTyzdna(new Date(2026, 9, 25, 23))).toBe('2026-10-19');
    expect(pondelokTyzdna(new Date(2026, 9, 26, 1))).toBe('2026-10-26');
  });
  it('počíta uvarené a naplánované jedlá s múkou len z tohto týždňa', () => {
    const m = tyzdenMuky({
      nastavenia: PREDVOLENE,
      historia: [{ recept: sMukou, den: '2026-10-19' }, { recept: bez, den: '2026-10-20' }, { recept: sMukou, den: '2026-10-18' }, { recept: sMukou, den: '2026-10-26' }],
      jedalnicek: { '3:obed': sMukou, '3:vecera': bez, '4:obed': null },
    }, mapa, streda);
    expect(m.varene).toBe(2); expect(m.vareneSMukou).toBe(1);
    expect(m.planovane).toBe(2); expect(m.planovaneSMukou).toBe(1);
    expect(m.limit).toBe(3); expect(m.stav).toBe('ok');
  });
  it('limit: na limite, nad limitom, vylúčená, bez obmedzenia', () => {
    const h = (n: number) => Array.from({ length: n }, () => ({ recept: sMukou, den: '2026-10-20' }));
    const s = (o: 'bez' | 'obmedzit' | 'vylucit', n: number) => tyzdenMuky({ nastavenia: { ...PREDVOLENE, obmedzenia: { ...PREDVOLENE.obmedzenia, muka: o } }, historia: h(n), jedalnicek: {} }, mapa, streda);
    expect(s('obmedzit', 3).stav).toBe('na-limite');
    expect(s('obmedzit', 4).stav).toBe('nad-limitom');
    expect(s('vylucit', 1).stav).toBe('nad-limitom'); expect(s('vylucit', 0).vylucena).toBe(true);
    expect(s('bez', 9).stav).toBe('bez-limitu'); expect(s('bez', 9).limit).toBeNull();
  });
});
