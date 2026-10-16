import { describe, it, expect } from 'vitest';
import { SUROVINY } from '../src/data';
import TAB from '../src/data/vyziva-tabulky.json';

describe('výživové hodnoty z tabuliek', () => {
  const tab = TAB as Record<string, { z?: string; n?: number[]; pozn?: string }>;
  it('každá surovina z tabuľky má zdroj, odhad false a rozumné hodnoty', () => {
    let n = 0;
    for (const s of SUROVINY) {
      const t = tab[s.id];
      if (!t?.n) { expect(s.odhad).toBe(true); continue; }
      n++;
      expect(s.odhad).toBe(false);
      expect(s.zdrojNutr).toMatch(/^(ciqual|fdc):\d+$/);
      const x = s.na100;
      expect(x.kcal).toBeGreaterThanOrEqual(0); expect(x.kcal).toBeLessThan(910);
      expect(x.bielk + x.tuky + x.sach).toBeLessThanOrEqual(101);
      expect(x.cukry).toBeLessThanOrEqual(x.sach + 0.11);
      expect(x.nasyt).toBeLessThanOrEqual(x.tuky + 0.11);
    }
    expect(n).toBeGreaterThan(250);
  });
  it('suroviny bez zhody majú poznámku, prečo ostali odhadom', () => {
    for (const s of SUROVINY.filter((x) => x.odhad)) expect(s.poznamkaNutr).toMatch(/^odhad – /);
  });
  it('USDA: sacharidy sú bez vlákniny (mandľová múka fdc:2261420)', () => {
    const s = SUROVINY.find((x) => x.zdrojNutr === 'fdc:2261420');
    expect(s).toBeTruthy();
  });
});
