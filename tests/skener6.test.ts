import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nacitajHistoriu, pridajDoHistorie, prepniKupujem, upravZaznam } from '../src/skener/historia';

beforeEach(() => {
  const m = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } });
});

describe('história skenov: migrácia a „kupujem“', () => {
  it('starý záznam (tvar zo začiatku) sa načíta bez straty', () => {
    const star = { id: 'a1', cas: '2026-10-14T10:00:00.000Z', nazov: 'Müsli', text: 'ovsené vločky, cukor', skore: 55, pasmo: 'obcas', vyziva: { cukry: 20 }, kod: '4006381333931' };
    localStorage.setItem('recepty-skener-v1', JSON.stringify([star]));
    const h = nacitajHistoriu();
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject(star);
    expect(h[0].kupujem).toBeUndefined();
  });
  it('poškodené záznamy sa preskočia, chýbajúce polia doplnia', () => {
    localStorage.setItem('recepty-skener-v1', JSON.stringify([null, 5, { text: 'cukor' }, { nazov: 'x' }]));
    const h = nacitajHistoriu();
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ text: 'cukor', nazov: 'Výrobok', skore: 0, pasmo: 'obcas' });
    expect(upravZaznam('zle')).toBeNull();
  });
  it('značka kupujem sa prepína a prežije limit 40 záznamov', () => {
    const prvy = pridajDoHistorie({ nazov: 'Obľúbený', text: 'ovos', skore: 90, pasmo: 'vyborne' });
    prepniKupujem(prvy.id);
    for (let i = 0; i < 50; i++) pridajDoHistorie({ nazov: `V${i}`, text: 'cukor', skore: 10, pasmo: 'zriedka' });
    const h = nacitajHistoriu();
    expect(h.length).toBe(40);
    expect(h.find((z) => z.id === prvy.id)?.kupujem).toBe(true);
    prepniKupujem(prvy.id);
    expect(nacitajHistoriu().find((z) => z.id === prvy.id)?.kupujem).toBeUndefined();
  });
});
