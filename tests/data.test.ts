import { describe, it, expect } from 'vitest';
import { SUROVINY, RECEPTY, SUROVINA } from '../src/data';
import { DIETY } from '../src/data/diety';

describe('validácia dát', () => {
  it('id surovín sú unikátne a nutrične rozumné', () => {
    const ids = SUROVINY.map((s) => s.id);
    expect(new Set(ids).size, 'duplicitné id surovín: ' + ids.filter((x, i) => ids.indexOf(x) !== i)).toBe(ids.length);
    for (const s of SUROVINY) {
      expect(s.nazov, s.id).toBeTruthy();
      expect(s.na100.kcal, s.id).toBeGreaterThanOrEqual(0);
      expect(s.na100.kcal, s.id).toBeLessThanOrEqual(900);
      expect(s.na100.cukry, s.id + ' cukry>sacharidy').toBeLessThanOrEqual(s.na100.sach + 0.5);
      expect(s.na100.nasyt, s.id + ' nasyt>tuky').toBeLessThanOrEqual(s.na100.tuky + 0.5);
      expect(s.odhad || /USDA|Ciqual/.test(s.zdrojNutr), s.id).toBe(true);
    }
  });
  it('suroviny s lepkom majú alergén lepok', () => {
    for (const s of SUROVINY) if (s.priznaky.includes('lepok')) expect(s.alergeny, s.id).toContain('lepok');
  });
  it('id receptov sú unikátne, každá surovina existuje', () => {
    const ids = RECEPTY.map((r) => r.id);
    expect(new Set(ids).size, 'duplicitné id receptov: ' + ids.filter((x, i) => ids.indexOf(x) !== i)).toBe(ids.length);
    for (const r of RECEPTY) {
      expect(r.suroviny.length, r.id).toBeGreaterThan(1);
      expect(r.postup.length, r.id + ' postup').toBeGreaterThanOrEqual(2);
      expect(r.porcie, r.id).toBeGreaterThan(0);
      expect(r.ilustracia, r.id).toBeTruthy();
      for (const s of r.suroviny) {
        expect(SUROVINA.has(s.id), `${r.id}: neznáma surovina ${s.id}`).toBe(true);
        expect(s.mnozstvo, `${r.id}/${s.id}`).toBeGreaterThan(0);
        for (const a of s.alternativy ?? []) expect(SUROVINA.has(a), `${r.id}: neznáma alternatíva ${a}`).toBe(true);
      }
      for (const u of r.upravy) {
        if (u.na) expect(SUROVINA.has(u.na), `${r.id}: úprava, neznáma ${u.na}`).toBe(true);
        if (u.typ === 'vymenit') expect(r.suroviny.some((s) => s.id === u.z), `${r.id}: úprava vymeniť z ${u.z}`).toBe(true);
      }
    }
  });
  it('tag bezlepkové nemá lepok', () => {
    for (const r of RECEPTY) if (r.tagy.includes('bezlepkove'))
      for (const s of r.suroviny) if (!s.volitelna) expect(SUROVINA.get(s.id)!.priznaky, `${r.id}/${s.id}`).not.toContain('lepok');
  });
  it('tag bezmäsité nemá mäso ani ryby', () => {
    for (const r of RECEPTY) if (r.tagy.includes('bezmasite'))
      for (const s of r.suroviny) { const p = SUROVINA.get(s.id)!.priznaky; expect(p.includes('maso') || p.includes('spracovane-maso') || p.includes('ryba'), `${r.id}/${s.id}`).toBe(false); }
  });
  it('každá diéta má popis', () => {
    for (const d of DIETY) { expect(d.popis.length, d.id).toBeGreaterThan(20); expect(d.neVhodne, d.id).toBeTruthy(); }
  });
});
