import { describe, it, expect, vi, beforeEach } from 'vitest';
import { najdiVBaliku, rozbalZaznam, vynulujBalik, BALIK_ZDROJ, type BalikZaznam } from '../src/skener/balik';
import { nacitajOff } from '../src/skener/off';

function falosnyStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); }, clear: () => m.clear() };
}

const KOD = '3017620422003';
const zaznam: BalikZaznam = ['Nutella', 'Ferrero', 'Sugar, palm oil, hazelnuts 13%', 'en', ['en:e322'], ['mlieko', 'orechy'], [], 3, [539, 30.9, 10.6, 57.5, 56.3, null, 6.3, 0.107], 'E', 4];
const subory: Record<string, unknown> = { '/off/index.json': { v: 1, dlzka: 2, diely: ['30'], pocet: 1 }, '/off/30.json': { [KOD]: zaznam } };
function falosnaSiet(zvonka = false) {
  const volania: string[] = [];
  vi.stubGlobal('fetch', async (u: string) => {
    volania.push(String(u));
    const k = Object.keys(subory).find((x) => String(u).endsWith(x));
    if (k) return new Response(JSON.stringify(subory[k]), { status: 200 });
    if (zvonka) throw new TypeError('Failed to fetch');
    return new Response('{"status":0}', { status: 404 });
  });
  return volania;
}
beforeEach(() => { vynulujBalik(); vi.stubGlobal('localStorage', falosnyStorage()); });

describe('balík slovenských výrobkov', () => {
  it('rozbalí kompaktný záznam do tvaru skenera', () => {
    const v = rozbalZaznam(KOD, zaznam);
    expect(v.nazov).toBe('Nutella');
    expect(v.doplnok).toMatchObject({ e: ['en:e322'], alergeny: ['mlieko', 'orechy'], cukor: true, palma: true });
    expect(v.vyziva).toMatchObject({ kcal: 539, sol: 0.107, sach: 57.5 });
    expect(v.vyziva.vlak).toBeUndefined();
    expect(v.zBalika).toBe(true);
    expect(v.jazykText).toBe('angličtine');
  });
  it('nájde kód v balíku bez internetu a načíta len potrebný diel', async () => {
    const volania = falosnaSiet(true);
    const v = await najdiVBaliku(KOD);
    expect(v?.znacka).toBe('Ferrero');
    expect(volania.some((u) => u.includes('openfoodfacts'))).toBe(false);
    expect(volania.filter((u) => u.endsWith('30.json'))).toHaveLength(1);
    await najdiVBaliku(KOD);
    expect(volania.filter((u) => u.endsWith('30.json'))).toHaveLength(1);
  });
  it('kód mimo balíka vráti null; chýbajúci balík nerozbije hľadanie', async () => {
    falosnaSiet();
    expect(await najdiVBaliku('8588000000019')).toBeNull();
    vynulujBalik();
    delete subory['/off/index.json'];
    expect(await najdiVBaliku(KOD)).toBeNull();
    subory['/off/index.json'] = { v: 1, dlzka: 2, diely: ['30'], pocet: 1 };
  });
  it('nacitajOff: balík pred online dopytom, bez volania Open Food Facts', async () => {
    const volania = falosnaSiet(true);
    const v = await nacitajOff(KOD);
    expect(v?.zBalika).toBe(true);
    expect(volania.some((u) => u.includes('openfoodfacts'))).toBe(false);
    expect(BALIK_ZDROJ).toContain('ODbL');
    expect(BALIK_ZDROJ).toContain('16.10.2026');
  });
  it('nacitajOff: kód mimo balíka ide online', async () => {
    const volania = falosnaSiet();
    expect(await nacitajOff('8588000000019')).toBeNull();
    expect(volania.some((u) => u.includes('openfoodfacts'))).toBe(true);
  });
});
