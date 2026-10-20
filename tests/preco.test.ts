import { describe, it, expect } from 'vitest';
import { PRECO, PRECO_ID } from '../src/data/preco';
import { ZDROJ } from '../src/data/zdroje';
import { RECEPTY, SUROVINY, SUROVINA } from '../src/data';
import { precoPreRecept, precoPreSurovinu } from '../src/engine/preco-vyber';

describe('popisy „prečo to škodí“ (jeden zdroj pravdy)', () => {
  it('existuje popis pre každú požadovanú látku a kombináciu', () => {
    expect([...PRECO_ID].sort()).toEqual(['akrylamid', 'benzen-e211', 'bez-e-zelenina', 'dusitany', 'hca-pah', 'nitrozaminy', 'psenicna-muka', 'rafinovany-cukor', 'udeniny', 'vyprazane']);
  });
  for (const id of PRECO_ID) {
    it(`${id}: všetkých päť častí, úroveň dôkazov a aspoň jeden existujúci zdroj`, () => {
      const p = PRECO[id];
      expect(p.id).toBe(id);
      for (const k of ['co', 'davka', 'komu', 'namiesto'] as const) expect(p[k].trim().length, k).toBeGreaterThan(40);
      expect(p.dokaz.text.trim().length).toBeGreaterThan(20);
      expect(['silné', 'stredné', 'slabé', 'prax', 'odhad']).toContain(p.dokaz.uroven);
      expect(p.zdroje.length).toBeGreaterThan(0);
      for (const z of p.zdroje) expect(ZDROJ.has(z), `zdroj ${z}`).toBe(true);
      expect(p.co.length + p.davka.length + p.komu.length + p.namiesto.length, 'popis má byť krátky').toBeLessThan(1700);
    });
  }
  it('med: deti do 1 roka nie; WHO počíta med k voľným cukrom', () => {
    const t = PRECO['rafinovany-cukor'];
    expect(t.davka).toMatch(/med/i); expect(t.komu).toMatch(/do 1 roka/);
  });
  it('suroviny a recepty dostanú správne popisy', () => {
    expect(precoPreSurovinu(SUROVINA.get('psenicna-muka-hladka'))).toContain('psenicna-muka');
    expect(precoPreSurovinu(SUROVINA.get('cukor-biely'))).toContain('rafinovany-cukor');
    expect(precoPreSurovinu(SUROVINA.get('sunka-bravcova'))).toEqual(expect.arrayContaining(['udeniny', 'dusitany']));
    expect(precoPreSurovinu(SUROVINA.get('mrkva'))).toEqual([]);
    const r = RECEPTY.find((x) => x.id === 'bryndzove-halusky')!;
    expect(precoPreRecept(r, SUROVINA)).toContain('psenicna-muka');
    expect(SUROVINY.length).toBeGreaterThan(0);
  });
});
