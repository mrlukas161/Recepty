import { describe, it, expect } from 'vitest';
import { RECEPTY, SUROVINA } from '../src/data';
import { infoRecept } from '../src/engine/filtre';
import { navrhnutelny } from '../src/engine/navrh';
import { generujJedalnicek } from '../src/engine/planner';
import { PREDVOLENE } from '../src/engine/types';

const infos = RECEPTY.map((r) => infoRecept(r, SUROVINA));
describe('celozrnná pšenica platí ako múka', () => {
  it('celozrnné cestoviny, chlieb a múka sú kategória múka a nenavrhujú sa', () => {
    const c = infos.filter((i) => i.r.suroviny.some((s) => /celozrnn/.test(SUROVINA.get(s.id)?.nazov ?? '') && /(cestovin|chlieb|psenicna-muka)/.test(s.id) && !s.volitelna));
    expect(c.length).toBeGreaterThan(0);
    for (const i of c) { expect(i.kat.muka).toBe(true); expect(navrhnutelny(i, PREDVOLENE)).toBe(false); }
  });
  it('bulgur a kuskus sa nenavrhujú (Revízia bod 68)', () => {
    const c = infos.filter((i) => i.r.suroviny.some((s) => (s.id === 'bulgur' || s.id === 'kuskus') && !(s.volitelna && !s.nevyhnutna)));
    expect(c.length).toBeGreaterThan(0);
    for (const i of c) { expect(i.kat.muka).toBe(true); expect(navrhnutelny(i, PREDVOLENE)).toBe(false); }
  });
  it('Zamiešať: 30 týždňov bez jedla s múkou', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const plan = generujJedalnicek({ infos, n: PREDVOLENE, db: SUROVINA, zamknute: {}, seed, pridane: {}, hodnotenia: { hviezdicky: {}, hodnotenie: {} } as never });
      for (const id of Object.values(plan)) if (id) expect(infos.find((i) => i.r.id === id)!.kat.muka).toBe(false);
    }
  });
});
