import { describe, it, expect } from 'vitest';
import { platnyKod, mapujOff, offUrl } from '../src/skener/off';
import { rozbor } from '../src/skener/rozbor';
import { vypocitajSkoreVyrobku } from '../src/skener/skore';
import { domaceAlternativy, tipyNaVyber, druhVyrobku } from '../src/skener/lepsia';
import { INFOS } from '../src/ctx';
import { otsuPrah, upravPixely } from '../src/skener/obrazok';
import { vycistiOcrText } from '../src/skener/ocr';

describe('čiarový kód a Open Food Facts', () => {
  it('kontrolný súčet EAN', () => {
    expect(platnyKod('4006381333931')).toBe(true);
    expect(platnyKod('96385074')).toBe(true);
    expect(platnyKod('4006381333932')).toBe(false);
    expect(platnyKod('12345')).toBe(false);
    expect(platnyKod('abcdefgh')).toBe(false);
  });
  it('URL pýta len potrebné polia', () => {
    expect(offUrl('4006381333931')).toMatch(/^https:\/\/world\.openfoodfacts\.org\/api\/v2\/product\/4006381333931\.json\?fields=/);
  });
  it('mapuje odpoveď OFF (zloženie sk má prednosť, výživa na 100 g)', () => {
    const v = mapujOff('4006381333931', {
      status: 1,
      product: { product_name: 'Cokoladove kocky', brands: 'Znacka, Ina', ingredients_text: 'sugar, milk', ingredients_text_sk: 'cukor, <b>mlieko</b>, _lecitín_', nutriscore_grade: 'd', nova_group: 4,
        nutriments: { sugars_100g: 52.1, salt_100g: 0.2, 'saturated-fat_100g': 18, fiber_100g: 3, 'energy-kcal_100g': 540 } },
    })!;
    expect(v.zlozenie).toBe('cukor, mlieko, lecitín');
    expect(v.znacka).toBe('Znacka');
    expect(v.vyziva).toMatchObject({ cukry: 52.1, sol: 0.2, nasyt: 18, vlak: 3, kcal: 540 });
    expect(v.nutriscore).toBe('D');
    expect(v.nova).toBe(4);
  });
  it('nenájdený výrobok → null', () => {
    expect(mapujOff('1', { status: 0 })).toBeNull();
    expect(mapujOff('1', {})).toBeNull();
  });
});

describe('lepšia voľba', () => {
  it('rozpozná druh výrobku a ponúkne domáce recepty z appky', () => {
    const r = rozbor('ovsené vločky, cukor, glukózový sirup, aróma');
    expect(druhVyrobku('Müsli čokoládové', r)?.id).toBe('musli');
    const a = domaceAlternativy('Müsli čokoládové', r, INFOS);
    expect(a?.recepty.length).toBeGreaterThan(0);
    expect(a!.recepty[0].skore.celkom).toBeGreaterThanOrEqual(a!.recepty[a!.recepty.length - 1].skore.celkom);
  });
  it('tipy podľa zistení', () => {
    const r = rozbor('cukor, palmový tuk, aróma, emulgátor (E471), farbivo (E110)');
    const t = tipyNaVyber(r, vypocitajSkoreVyrobku(r)).join(' ');
    expect(t).toMatch(/cukor/);
    expect(t).toMatch(/E110/);
    expect(t).toMatch(/stuženého|palmový/);
  });
});

describe('úprava obrázka a OCR text', () => {
  it('Otsu rozdelí dva odtiene', () => {
    const d = new Uint8ClampedArray([...Array(50).fill(30), ...Array(50).fill(220)]);
    const p = otsuPrah(d);
    expect(p).toBeGreaterThanOrEqual(30);
    expect(p).toBeLessThan(220);
  });
  it('čiernobiela úprava dá len 0 alebo 255', () => {
    const px = new Uint8ClampedArray([20, 20, 20, 255, 230, 230, 230, 255, 25, 25, 25, 255, 240, 240, 240, 255]);
    upravPixely(px, 1, true);
    expect([...px].filter((_, i) => i % 4 < 3).every((x) => x === 0 || x === 255)).toBe(true);
  });
  it('vyčistí zalomenia z OCR', () => {
    expect(vycistiOcrText('múka , cukor ,\nsla-\ndidlo (E950) .')).toBe('múka, cukor, sladidlo (E950).');
  });
});
