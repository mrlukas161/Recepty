import { describe, it, expect } from 'vitest';
import { mapujOff, alergenyZTagov } from '../src/skener/off';
import { rozbor } from '../src/skener/rozbor';
import { vypocitajSkoreVyrobku } from '../src/skener/skore';
import { alergenyVTexte } from '../src/skener/alergeny';
import nutella from './fixtures/off/nutella.json';

const vyhodnot = (j: unknown) => {
  const v = mapujOff('3017620422003', j)!;
  const r = rozbor(v.zlozenie, v.doplnok);
  return { v, r, s: vypocitajSkoreVyrobku(r, { vyziva: v.vyziva }) };
};

describe('Open Food Facts: Nutella (fixtúra z 15. 10. 2026)', () => {
  const { v, r, s } = vyhodnot(nutella);
  it('vyberie anglický text (sk a cs nie sú) a povie jazyk', () => {
    expect(v.jazyk).toBe('en');
    expect(v.jazykText).toBe('angličtine');
    expect(v.zlozenie).toMatch(/^Sugar, vegetable fat/);
  });
  it('E322 je rozpoznané (len raz), cukor a palmový olej sú rozpoznané', () => {
    expect(r.zlozky.filter((z) => z.e === 'E322')).toHaveLength(1);
    expect(r.zlozky.some((z) => z.id === 'cukor')).toBe(true);
    expect(r.zlozky.some((z) => z.priznaky.includes('palmovy-tuk'))).toBe(true);
    expect(r.spolahlivost.nizka).toBe(false);
  });
  it('alergény z textu aj z tagov; „Sans gluten“ nie je alergén', () => {
    expect(r.alergeny).toEqual(expect.arrayContaining(['mlieko', 'orechy', 'soja']));
    expect(r.alergeny).not.toContain('lepok');
    expect(alergenyVTexte('Sans gluten. Gluten-free. Bez lepku')).toEqual([]);
  });
  it('skóre je „Zriedka“ alebo „Občas“, slabé stránky: cukor a palmový olej', () => {
    expect(['zriedka', 'obcas']).toContain(s.pasmo);
    expect(s.celkom).toBeLessThan(50);
    const t = s.negativa.join(' ');
    expect(t).toMatch(/Cukor|cukr/i);
    expect(s.faktory.find((f) => f.id === 'cukor')!.body).toBeLessThan(20);
    expect(s.faktory.find((f) => f.id === 'tuky-sol')!.hodnota).toMatch(/palmov/);
    expect(t).toMatch(/Vysoký obsah cukrov: 56,3|Vysoký obsah cukrov: 56.3/);
  });
});

describe('tagy bez textu a nízka spoľahlivosť', () => {
  it('pri pôvodnom (francúzskom) texte doplnia tagy E-číslo, cukor, palmový olej a alergény', () => {
    const p = { ...nutella.product } as Record<string, unknown>;
    delete p.ingredients_text_en;
    const { v, r, s } = vyhodnot({ status: 1, product: p });
    expect(v.jazyk).toBe('povodny');
    expect(r.zlozky.some((z) => z.e === 'E322')).toBe(true);
    expect(r.zlozky.some((z) => z.id === 'cukor')).toBe(true);
    expect(r.zlozky.some((z) => z.id === 'palmovy-tuk')).toBe(true);
    expect(r.alergeny).toEqual(expect.arrayContaining(['mlieko', 'orechy', 'soja']));
    expect(r.spolahlivost.nizka).toBe(true);
    expect(['vyborne', 'dobre']).not.toContain(s.pasmo);
    expect(s.spolahlivostText).toMatch(/Nízka spoľahlivosť/);
  });
  it('mnoho nerozpoznaných zložiek znamená nízku spoľahlivosť a strop pásma', () => {
    const r = rozbor('xqzvb, wrtplk, ghfdsx, mnbvcx, qwrtyp');
    expect(r.spolahlivost.nizka).toBe(true);
    expect(vypocitajSkoreVyrobku(r).celkom).toBeLessThanOrEqual(59);
  });
  it('bežné zloženie je spoľahlivé', () => {
    expect(rozbor('ovsené vločky celozrnné 100 %').spolahlivost.nizka).toBe(false);
  });
  it('tagy alergénov, traces, bez duplicít', () => {
    expect(alergenyZTagov(['en:milk', 'en:gluten', 'en:nuts', 'en:milk', 'en:xx'])).toEqual(['mlieko', 'lepok', 'orechy']);
    const r = rozbor('cukor', { alergeny: ['mlieko'], stopy: ['mlieko', 'sezam'] });
    expect(r.alergeny).toEqual(['mlieko']);
    expect(r.stopy).toEqual(['sezam']);
  });
});
