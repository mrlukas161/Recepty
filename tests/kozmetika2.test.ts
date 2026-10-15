import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LATKY, ZDROJE_KOZ, INDEX } from '../src/kozmetika/databaza';
import { zostav } from '../scripts/kozmetika-data.mjs';
import { parsujInci } from '../src/kozmetika/parser';
import { vypocitajSkoreKozmetiky } from '../src/kozmetika/skore';
import { mapujObf, nacitajObf } from '../src/kozmetika/obf';
import { PREDVOLENE_NAST } from '../src/kozmetika/typy';
import { nacitajNastavenia, ulozNastavenia, pridajDoHistorie, nacitajHistoriu, najdiObf, ulozObf, KLUC_HIST } from '../src/kozmetika/ulozisko';
import { readFileSync, statSync } from 'node:fs';

const skore = (t: string, n = {}) => vypocitajSkoreKozmetiky(parsujInci(t), { ...PREDVOLENE_NAST, ...n });

describe('databáza INCI', () => {
  it('súbory v repe zodpovedajú generátoru (node scripts/kozmetika-data.mjs)', () => {
    const { latky, zdroje } = zostav();
    expect(JSON.stringify(latky)).toBe(readFileSync('src/kozmetika/data/latky.json', 'utf8'));
    expect(JSON.stringify(zdroje)).toBe(readFileSync('src/kozmetika/data/zdroje.json', 'utf8'));
  });
  it('rozpočet ~2 MB: dáta sú výrazne menšie', () => {
    expect(statSync('src/kozmetika/data/latky.json').size + statSync('src/kozmetika/data/zdroje.json').size).toBeLessThan(2 * 1024 * 1024);
  });
  it('každé tvrdenie má zdroj alebo je výslovne odhad; zdroje existujú a majú https adresu', () => {
    for (const l of LATKY) {
      for (const z of l.z) { expect(ZDROJE_KOZ[z], `${l.id}: ${z}`).toBeTruthy(); expect(ZDROJE_KOZ[z].url).toMatch(/^https:\/\//); }
      if (l.u === 'vyhladavanie') expect(l.z.length, l.id).toBeGreaterThanOrEqual(2);
      if (l.l || l.x !== undefined) expect(l.u, `${l.id}: číslo bez overenia`).toBe('vyhladavanie');
      if (l.s !== 'ok' && l.u === 'odhad') expect(l.d.length).toBeGreaterThan(30);
      expect(l.d).toBeTruthy(); expect(l.f.length).toBeGreaterThan(0);
    }
  });
  it('názvy sú jednoznačné (jedna normalizovaná forma = jedna látka)', () => {
    const videne = new Map<string, string>();
    for (const l of LATKY) for (const m of l.m) {
      const k = m.toLowerCase();
      if (videne.has(k)) expect(videne.get(k)).toBe(l.id);
      videne.set(k, l.id);
    }
    expect(INDEX.size).toBeGreaterThan(150);
  });
  it('overené čísla: parabény, MIT, fenoxyetanol, BP-3, homosalát', () => {
    const f = (id: string) => LATKY.find((l) => l.id === id)!;
    expect(f('metylparaben').x).toBe(0.4); expect(f('propylparaben').x).toBe(0.14); expect(f('fenoxyetanol').x).toBe(1);
    expect(f('mit').l).toContain('15 ppm'); expect(f('benzofenon3').l).toContain('6 %'); expect(f('homosalat').x).toBe(7.34);
  });
  it('Lilial a formaldehyd sú zakázané; alergény vôní sú v triede alergén', () => {
    expect(INDEX.get('butylphenyl methylpropional')!.s).toBe('zakazana');
    expect(INDEX.get('formaldehyde')!.s).toBe('zakazana');
    expect(INDEX.get('limonene')!.t).toBe('alergen');
  });
});

describe('skóre kozmetiky', () => {
  it('jednoduchý zoznam s bežnými zložkami vyjde vysoko a nízky počet rozpoznaných ho zastropuje', () => {
    const s = skore('Aqua, Glycerin, Cetearyl Alcohol, Panthenol, Tocopherol, Squalane');
    expect(s.celkom).toBeGreaterThanOrEqual(90);
    expect(s.nizkaSpolahlivost).toBe(false);
    const n = skore('Rosa Canina Fruit Oil, Helianthus Annuus Extract, Calendula Officinalis Extract, Aqua');
    expect(n.nizkaSpolahlivost).toBe(true); expect(n.celkom).toBeLessThanOrEqual(79);
  });
  it('zakázaná látka stiahne skóre výrazne', () => {
    const s = skore('Aqua, Glycerin, Butylphenyl Methylpropional, Parfum, Cetearyl Alcohol');
    expect(s.faktory.find((f) => f.id === 'zakazane')!.body).toBe(40);
    expect(s.celkom).toBeLessThan(65);
  });
  it('rozpad: alergény, konzervanty, UV filtre, mikročastice, dráždivé', () => {
    const s = skore('Aqua, Parfum, Limonene, Linalool, Phenoxyethanol, DMDM Hydantoin, Octocrylene, Polyethylene, Sodium Lauryl Sulfate, Glycerin');
    const b = (id: string) => s.faktory.find((f) => f.id === id)!;
    expect(b('alergeny').polozky.map((x) => x.nazov)).toEqual(expect.arrayContaining(['Parfum', 'Limonene', 'Linalool']));
    expect(b('konzervanty').body).toBeGreaterThan(0);
    expect(b('uv').polozky[0].nazov).toBe('Octocrylene');
    expect(b('mikroc').body).toBe(6);
    expect(b('draziva').polozky[0].nazov).toBe('Sodium Lauryl Sulfate');
  });
  it('osobné nastavenia znížia skóre a ukážu dôvod', () => {
    const t = 'Aqua, Glycerin, Cetearyl Alcohol, Parfum, Retinol, Sodium Lauryl Sulfate, Panthenol';
    const zaklad = skore(t).celkom;
    expect(skore(t, { vona: true }).celkom).toBeLessThan(zaklad);
    expect(skore(t, { tehotenstvo: true }).celkom).toBeLessThan(zaklad);
    expect(skore(t, { citliva: true }).celkom).toBeLessThan(zaklad);
    const os = skore(t, { tehotenstvo: true, vona: true }).faktory.find((f) => f.id === 'osobne')!;
    expect(os.polozky.map((x) => x.nazov).join()).toMatch(/Retinol \(tehotenstvo\)/);
    expect(os.body).toBeLessThanOrEqual(40);
    expect(skore(t).faktory.find((f) => f.id === 'osobne')).toBeUndefined();
  });
  it('„May contain“ sa do skóre nepočíta; tá istá látka sa neodpočíta dvakrát', () => {
    expect(skore('Aqua, Glycerin, Cetearyl Alcohol, Panthenol +/- Butylphenyl Methylpropional').celkom).toBe(skore('Aqua, Glycerin, Cetearyl Alcohol, Panthenol').celkom);
    expect(skore('Aqua, Parfum, Parfum, Fragrance, Glycerin, Panthenol').faktory.find((f) => f.id === 'alergeny')!.body).toBe(3);
  });
  it('pásmo zodpovedá skóre (≥ 80 výborné … < 40 zriedka)', () => {
    expect(skore('Aqua, Glycerin, Cetearyl Alcohol, Panthenol').pasmo).toBe('vyborne');
    expect(skore('Aqua, Formaldehyde, Butylphenyl Methylpropional, Parfum, Glycerin').pasmo).toBe('zriedka');
  });
});

describe('Open Beauty Facts a úložisko', () => {
  beforeEach(() => {
    const m = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); }, clear: () => m.clear() });
  });
  it('online načíta a uloží; bez siete nájde z uloženého; neznámy kód → null; chyba servera bez uloženého → výnimka', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ status: 1, product: { product_name: 'Krém', ingredients_text_en: 'Aqua, Glycerin' } }), { status: 200 }));
    const on = await nacitajObf('3600550000000');
    expect(on?.zCache).toBeUndefined();
    vi.stubGlobal('fetch', async () => { throw new TypeError('offline'); });
    const off = await nacitajObf('3600550000000');
    expect(off).toMatchObject({ zCache: true, zlozenie: 'Aqua, Glycerin' });
    await expect(nacitajObf('4006381333931')).rejects.toThrow();
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
    expect(await nacitajObf('4006381333931')).toBeNull();
    vi.stubGlobal('fetch', async () => new Response('', { status: 500 }));
    await expect(nacitajObf('4006381333931')).rejects.toThrow();
  });
  it('mapovanie odpovede: angličtina má prednosť, bez zloženia prázdny reťazec, status 0 → null', () => {
    const v = mapujObf('3600550000000', { status: 1, product: { product_name: 'Krém', brands: 'Znacka, Iná', ingredients_text_fr: 'Eau', ingredients_text_en: '<b>Aqua</b>, _Glycerin_' } })!;
    expect(v.zlozenie).toBe('Aqua, Glycerin'); expect(v.znacka).toBe('Znacka'); expect(v.jazyk).toBe('angličtine');
    expect(mapujObf('1', { status: 1, product: { product_name: 'x' } })!.zlozenie).toBe('');
    expect(mapujObf('1', { status: 0 })).toBeNull();
  });
  it('výrobok sa uloží a nájde offline; história a nastavenia prežijú; poškodené dáta nespadnú', () => {
    ulozObf({ kod: '3600550000000', nazov: 'Krém', zlozenie: 'Aqua', url: 'u' });
    expect(najdiObf('3600550000000')).toMatchObject({ nazov: 'Krém', zCache: true });
    expect(najdiObf('0000000000000')).toBeNull();
    ulozNastavenia({ ...PREDVOLENE_NAST, vona: true });
    expect(nacitajNastavenia()).toEqual({ citliva: false, vona: true, tehotenstvo: false, deti: false });
    pridajDoHistorie({ nazov: 'A', text: 'Aqua', skore: 90, pasmo: 'vyborne' });
    expect(nacitajHistoriu()).toHaveLength(1);
    localStorage.setItem(KLUC_HIST, '{zle'); expect(nacitajHistoriu()).toEqual([]);
    localStorage.setItem('recepty-kozmetika-nastavenia-v1', '"x"'); expect(nacitajNastavenia()).toEqual(PREDVOLENE_NAST);
  });
});
