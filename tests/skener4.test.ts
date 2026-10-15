import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nacitajOff, mapujOff } from '../src/skener/off';
import { ulozVyrobok, najdiVUlozisku, nacitajUlozisko, importujPredstih, datumUlozenia, LIMIT_VYROBKOV } from '../src/skener/ulozisko';
import nutella from './fixtures/off/nutella.json';

function falosnyStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); }, clear: () => m.clear() };
}
beforeEach(() => { vi.stubGlobal('localStorage', falosnyStorage()); });

describe('skener offline: lokálna zásoba výrobkov', () => {
  it('online načíta a uloží; bez siete nájde z uloženého s dátumom', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify(nutella), { status: 200 }));
    const online = await nacitajOff('3017620422003');
    expect(online?.zCache).toBeUndefined();
    vi.stubGlobal('fetch', async () => { throw new TypeError('Failed to fetch'); });
    const offline = await nacitajOff('3017620422003');
    expect(offline?.zCache).toBe(true);
    expect(offline?.nazov).toBe('Nutella');
    expect(datumUlozenia(offline?.ulozene)).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });
  it('bez siete a bez uloženia chyba (appka ponúkne fotku)', async () => {
    vi.stubGlobal('fetch', async () => { throw new TypeError('Failed to fetch'); });
    await expect(nacitajOff('4006381333931')).rejects.toThrow();
  });
  it('chyba servera 500 → použije uložený výrobok', async () => {
    ulozVyrobok(mapujOff('3017620422003', nutella)!);
    vi.stubGlobal('fetch', async () => new Response('', { status: 503 }));
    expect((await nacitajOff('3017620422003'))?.zCache).toBe(true);
  });
  it('limit počtu: najstaršie vypadnú, duplicita sa obnoví', () => {
    const v = mapujOff('3017620422003', nutella)!;
    for (let i = 0; i < LIMIT_VYROBKOV + 20; i++) ulozVyrobok({ ...v, kod: String(1000 + i) });
    expect(nacitajUlozisko()).toHaveLength(LIMIT_VYROBKOV);
    expect(najdiVUlozisku('1000')).toBeNull();
    ulozVyrobok({ ...v, kod: String(1000 + LIMIT_VYROBKOV + 19) });
    expect(nacitajUlozisko()).toHaveLength(LIMIT_VYROBKOV);
  });
  it('predstihnutý výber: vloží len nové a neprepíše skenované', () => {
    const v = mapujOff('3017620422003', nutella)!;
    ulozVyrobok(v);
    expect(importujPredstih([v, { ...v, kod: '5900000000001' }])).toBe(1);
    expect(nacitajUlozisko().map((u) => u.zdroj).sort()).toEqual(['predstih', 'sken']);
  });
  it('poškodené úložisko nepadne', () => {
    localStorage.setItem('recepty-skener-off-v1', '{zle');
    expect(nacitajUlozisko()).toEqual([]);
    expect(najdiVUlozisku('1')).toBeNull();
  });
});
