import { describe, it, expect } from 'vitest';
import { RECEPTY, SUROVINA } from '../src/data';
import { vypocitajSkore, slovoPodlaBodov } from '../src/engine/score';
import { infoRecept, vhodnostDiet, LIMIT_SACH } from '../src/engine/filtre';

const infos = RECEPTY.map((r) => infoRecept(r, SUROVINA));

describe('zrozumiteľné skóre', () => {
  it('každý faktor má hodnotu, cieľ a slovné hodnotenie', () => {
    for (const i of infos) for (const f of i.skore.faktory) {
      expect(f.hodnota, i.r.id + f.id).toBeTruthy();
      expect(f.ciel.length, f.id).toBeGreaterThan(5);
      expect(['vyborne', 'dobre', 'slabe']).toContain(f.slovo);
      expect(f.slovo).toBe(slovoPodlaBodov(f.body));
      expect(f.slovoText.length).toBeGreaterThan(3);
    }
  });
  it('slovo podľa bodov', () => {
    expect(slovoPodlaBodov(90)).toBe('vyborne'); expect(slovoPodlaBodov(60)).toBe('dobre'); expect(slovoPodlaBodov(10)).toBe('slabe');
  });
  it('vláknina ukazuje gramy so slovenskou čiarkou a cieľ ~10 g', () => {
    const i = infos.find((x) => x.skore.na100porcia.vlak % 1 !== 0)!;
    const f = i.skore.faktory.find((x) => x.id === 'vlaknina')!;
    expect(f.hodnota).toMatch(/^\d+,\d g$/);
    expect(f.ciel).toContain('10 g');
  });
  it('faktor múky: recept bez rafinovanej múky má 0 g a plné body, s múkou menej', () => {
    const bez = infos.find((x) => !x.kat.muka && x.skore.na100porcia.mukaG === 0)!;
    const s = infos.find((x) => x.kat.muka && x.skore.na100porcia.mukaG > 100)!;
    expect(bez.skore.faktory.find((f) => f.id === 'muka')!.body).toBe(100);
    expect(s.skore.faktory.find((f) => f.id === 'muka')!.body).toBeLessThan(10);
    expect(s.skore.faktory.find((f) => f.id === 'muka')!.hodnota).toMatch(/^\d+ g/);
    expect(s.skore.slabiny.join(' ')).toMatch(/múk/i);
  });
  it('kalibrácia: pásma ostávajú rozumne rozložené', () => {
    const c = { vyborne: 0, dobre: 0, obcas: 0, zriedka: 0 };
    for (const i of infos) c[i.skore.pasmo]++;
    expect(c.vyborne).toBeGreaterThan(40); expect(c.vyborne).toBeLessThan(90);
    expect(c.zriedka).toBeGreaterThan(5); expect(c.dobre).toBeGreaterThan(60);
  });
});

describe('vhodnosť diét', () => {
  it('keto ukáže čisté sacharidy a limit', () => {
    for (const i of infos.slice(0, 40)) {
      const [v] = vhodnostDiet(i, ['ketogenna'], SUROVINA);
      expect(v.text).toContain(`limit ${LIMIT_SACH.ketogenna} g`);
      expect(v.ok).toBe(i.skore.na100porcia.sach <= LIMIT_SACH.ketogenna);
      expect(v.text).toMatch(/čisté sacharidy \d+,\d g/);
    }
  });
  it('menej múky: nevhodné s múkou a uvedie gramy', () => {
    const s = infos.find((x) => x.kat.muka)!;
    const [v] = vhodnostDiet(s, ['menej-muky'], SUROVINA);
    expect(v.ok).toBe(false); expect(v.text).toMatch(/\d+ g/);
  });
  it('bez diét prázdny zoznam', () => { expect(vhodnostDiet(infos[0], [], SUROVINA)).toEqual([]); });
});
