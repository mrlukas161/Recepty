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
    expect(m.limit).toBe(2); expect(m.ostava).toBe(1); expect(m.stav).toBe('ok');
  });
  it('limit: na limite, nad limitom, vylúčená, bez obmedzenia', () => {
    const h = (n: number) => Array.from({ length: n }, () => ({ recept: sMukou, den: '2026-10-20' }));
    const s = (o: 'bez' | 'obmedzit' | 'vylucit', n: number) => tyzdenMuky({ nastavenia: { ...PREDVOLENE, obmedzenia: { ...PREDVOLENE.obmedzenia, muka: o } }, historia: h(n), jedalnicek: {} }, mapa, streda);
    expect(s('obmedzit', 2).stav).toBe('na-limite');
    expect(s('obmedzit', 3).stav).toBe('nad-limitom');
    expect(s('vylucit', 1).stav).toBe('nad-limitom'); expect(s('vylucit', 0).vylucena).toBe(true);
    expect(s('bez', 9).stav).toBe('bez-limitu'); expect(s('bez', 9).limit).toBeNull();
  });
});

import { navrhnutelny, limitMuky, verzieBezMuky } from '../src/engine/navrh';
import { generujJedalnicek } from '../src/engine/planner';

describe('múka a pečivo: appka ich sama nenavrhne', () => {
  const n = PREDVOLENE;
  it('jedlo s múkou ani s rafinovaným cukrom nie je navrhnuteľné, bez múky áno', () => {
    expect(navrhnutelny(infos.find((i) => i.kat.muka)!, n)).toBe(false);
    expect(navrhnutelny({ ...infos.find((i) => !i.kat.muka)!, cukorRaf: true }, n)).toBe(false);
    expect(navrhnutelny(infos.find((i) => !i.kat.muka && !i.cukorRaf)!, n)).toBe(true);
    const bezO = { ...n, obmedzenia: { ...n.obmedzenia, muka: 'bez' as const } };
    expect(navrhnutelny(infos.find((i) => i.kat.muka && !i.cukorRaf)!, bezO)).toBe(true);
  });
  it('Zamiešať nikdy nedá jedlo s múkou ani rafinovaným cukrom (20 semien)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const plan = generujJedalnicek({ infos, n: { ...n, jedla: ['ranajky', 'obed', 'vecera', 'desiata'] }, db: SUROVINA, seed });
      for (const id of Object.values(plan)) if (id) { const i = mapa.get(id)!; expect(i.kat.muka, id).toBe(false); expect(i.cukorRaf, id).toBe(false); }
    }
  });
  it('limit: predvolene 2, nastaviteľný 1/2, vylúčená 0, bez = null', () => {
    expect(limitMuky(n)).toBe(2);
    expect(limitMuky({ ...n, maxTyzdenne: { ...n.maxTyzdenne, muka: 1 } })).toBe(1);
    expect(limitMuky({ ...n, maxTyzdenne: { ...n.maxTyzdenne, muka: 3 } })).toBe(2);
    expect(limitMuky({ ...n, obmedzenia: { ...n.obmedzenia, muka: 'vylucit' } })).toBe(0);
    expect(limitMuky({ ...n, obmedzenia: { ...n.obmedzenia, muka: 'bez' } })).toBeNull();
  });
  it('žiadny vstavaný recept už neobsahuje rafinovaný cukor (nahradený medom alebo ovocím)', () => {
    expect(infos.filter((i) => i.cukorRaf).map((i) => i.r.id)).toEqual([]);
  });
  it('každé jedlo s múkou má aspoň jednu verziu bez múky', () => {
    for (const i of infos.filter((x) => x.kat.muka)) {
      const v = verzieBezMuky(i, infos, n, 2);
      expect(v.length, i.r.id).toBeGreaterThan(0);
      for (const x of v) { expect(x.kat.muka).toBe(false); expect(x.cukorRaf).toBe(false); }
    }
  });
});

describe('keto recepty', () => {
  const keto = infos.filter((i) => i.r.id.startsWith('keto-'));
  it('je ich 8–12, všetky bez múky a bez rafinovaného cukru, pod limitom keto diéty', async () => {
    const { LIMIT_SACH } = await import('../src/engine/filtre');
    expect(keto.length).toBeGreaterThanOrEqual(8); expect(keto.length).toBeLessThanOrEqual(12);
    expect(new Set(keto.map((i) => i.r.typ))).toEqual(new Set(['ranajky', 'polievka', 'obed', 'vecera', 'dezert']));
    for (const i of keto) {
      expect(i.kat.muka, i.r.id).toBe(false); expect(i.cukorRaf, i.r.id).toBe(false);
      expect(i.skore.na100porcia.sach, i.r.id).toBeLessThanOrEqual(LIMIT_SACH.ketogenna);
      expect(i.r.tagy).toContain('keto');
      expect(i.r.casPripravy + i.r.casVarenia, i.r.id).toBeLessThanOrEqual(90);
    }
  });
});
