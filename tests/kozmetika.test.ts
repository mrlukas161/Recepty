import { describe, it, expect } from 'vitest';
import { parsujInci, rozdel, hranica1Percento, najdiLatku } from '../src/kozmetika/parser';

const mena = (t: string) => parsujInci(t).polozky.map((p) => p.latka?.id ?? p.nazov);

describe('parser INCI', () => {
  it('oddeľovače: čiarka, bodkočiarka, odrážky; zátvorky chránia čiarky', () => {
    expect(rozdel('Aqua, Glycerin; Parfum • Mica (CI 77019, CI 77891)')).toEqual(['Aqua', 'Glycerin', 'Parfum', 'Mica (CI 77019, CI 77891)']);
  });
  it('predpona „Ingredients:“ / „Zloženie:“ a záverečná bodka', () => {
    expect(mena('Ingredients: Aqua, Glycerin.')).toEqual(['voda', 'glycerin']);
    expect(mena('Zloženie: Aqua, Glycerin')).toEqual(['voda', 'glycerin']);
  });
  it('Aqua/Water/Eau a Parfum/Fragrance/Aroma sú jedna látka', () => {
    for (const v of ['Aqua', 'Water', 'Eau', 'Aqua/Water/Eau', 'Aqua (Water)', 'Aqua (Water, Eau)']) expect(mena(v)).toEqual(['voda']);
    for (const v of ['Parfum', 'Fragrance', 'Aroma', 'Parfum (Fragrance)', 'Parfum/Fragrance']) expect(mena(v)).toEqual(['parfum']);
  });
  it('(and) oddeľuje zložky zmesi', () => {
    expect(mena('Aqua (and) Glycerin (and) Parfum')).toEqual(['voda', 'glycerin', 'parfum']);
  });
  it('CI čísla: rôzne zápisy aj zámeny OCR', () => {
    expect(mena('CI 77891')).toEqual(['tio2']);
    expect(mena('CI77891')).toEqual(['tio2']);
    expect(mena('Cl 77891')).toEqual(['tio2']);
    expect(mena('CI 7789l')).toEqual(['tio2']);
    expect(mena('C.I. 77491')).toEqual(['ci-77491']);
    const n = parsujInci('CI 12345').polozky[0];
    expect(n.ci).toBe('12345'); expect(n.latka).toBeUndefined();
  });
  it('zátvorka s viacerými CI → samostatné zložky; názov + CI sa nezdvojí', () => {
    expect(mena('Mica (CI 77019, CI 77891, CI 77491)')).toEqual(['ci-77019', 'tio2', 'ci-77491']);
    expect(mena('Titanium Dioxide (CI 77891)')).toEqual(['tio2']);
  });
  it('(nano) sa rozpozná a nezasahuje do názvu', () => {
    const p = parsujInci('Titanium Dioxide (nano), Zinc Oxide [nano], Aqua').polozky;
    expect(p.map((x) => [x.latka?.id, x.nano])).toEqual([['tio2', true], ['zinok-oxid', true], ['voda', false]]);
  });
  it('„May contain“ a „+/-“ oddelia nepovinné zložky', () => {
    for (const t of ['Aqua, Glycerin. May contain: CI 77891, CI 77491', 'Aqua, Glycerin +/- CI 77891, CI 77491', 'Aqua, Glycerin, May Contain CI 77891/CI 77491']) {
      const r = parsujInci(t);
      expect(r.polozky.map((x) => x.latka?.id)).toEqual(['voda', 'glycerin']);
      expect(r.moze.every((x) => x.moze)).toBe(true);
      expect(r.moze.length).toBeGreaterThanOrEqual(2);
    }
  });
  it('preklepy z OCR sa opravia len pri jednoznačnej zhode a zapíšu sa', () => {
    const r = parsujInci('Phenoxyethanoi, Glycerln, Tocopheryl Acetale, Methylparaben');
    expect(r.polozky.map((x) => x.latka?.id)).toEqual(['fenoxyetanol', 'glycerin', 'tokoferylacetat', 'metylparaben']);
    expect(r.opravy.length).toBe(3);
    expect(najdiLatku('xyzabc')).toBeNull();
    expect(najdiLatku('Urea')?.latka.id).toBe('urea');
    expect(najdiLatku('Ure')).toBeNull();
  });
  it('percentá a hviezdičky sa odstránia, neznáma zložka zostane neznáma', () => {
    const p = parsujInci('Aqua 70 %, Glycerin*, Rosa Canina Fruit Oil').polozky;
    expect(p.map((x) => x.latka?.id)).toEqual(['voda', 'glycerin', undefined]);
    expect(p[2].zhoda).toBe('ziadna');
  });
  it('poradie sa číta zostupne; hranica 1 % je pri prvej látke s overeným stropom ≤ 1 %', () => {
    const r = parsujInci('Aqua, Glycerin, Cetearyl Alcohol, Phenoxyethanol, Parfum, Limonene');
    expect(hranica1Percento(r)).toBe(3);
    expect(r.polozky[3].poradie).toBe(4);
  });
  it('nový riadok z OCR a veľké písmená', () => {
    expect(mena('AQUA,\nGLYCERIN,\nPARFUM')).toEqual(['voda', 'glycerin', 'parfum']);
  });
});
