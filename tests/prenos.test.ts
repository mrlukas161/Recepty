import { describe, it, expect } from 'vitest';
import { zluc } from '../src/store';
import { PREDVOLENE } from '../src/engine/types';
import { POLITIKA, VYLUCENE, zabal, rozbal, zostavBalik, rozdiel, pouzi, vytiahniDataText, odkazZDat, zmestiSaDoQr, naBase64url, over, PrenosChyba } from '../src/engine/prenos';

const stavA = () => zluc({
  nastavenia: { ...structuredClone(PREDVOLENE), hotovo: true, dospeli: 3, alergie: ['lepok'], tema: 'tmava' },
  oblubene: ['a', 'b'], hodnotenie: { a: 1, b: -1 }, historia: [{ recept: 'a', den: '2026-10-01' }],
  jedalnicek: { '0:obed': 'a', '1:obed': 'b' }, zamknute: ['0:obed'], nakupOdskrtnute: ['mlieko'], nakupVlastne: ['chlieb'], nakupRecepty: ['a'],
  dnes: { '2026-10-15': ['a'] },
});
const stavB = () => zluc({
  nastavenia: { ...structuredClone(PREDVOLENE), hotovo: true, alergie: ['orechy'] },
  oblubene: ['b', 'c'], hodnotenie: { b: 1, c: 1 }, historia: [{ recept: 'c', den: '2026-10-02' }],
  jedalnicek: { '0:obed': 'c' }, nakupVlastne: ['soľ'], dnes: { '2026-10-15': ['c'] },
});

describe('prenos – úplnosť kľúčov stavu', () => {
  it('každý kľúč stavu má politiku alebo je vedome vylúčený', () => {
    for (const k of Object.keys(zluc({}))) {
      expect(k in POLITIKA || k in VYLUCENE, `Kľúč „${k}“ zo src/store.ts nie je v prenose (POLITIKA) ani vo VYLUCENE v src/engine/prenos.ts`).toBe(true);
    }
  });
  it('zabalený balík obsahuje všetky neprevylúčené kľúče', async () => {
    const stav = stavA();
    const { balik } = await rozbal(await zabal(stav));
    for (const k of Object.keys(stav)) if (!(k in VYLUCENE)) expect(balik.s, k).toHaveProperty(k);
  });
  it('neznámy (budúci) kľúč prejde generickým spôsobom', async () => {
    const stav = { ...stavA(), vlastneRecepty: [{ id: 'x', nazov: 'Koláč' }] };
    const { balik } = await rozbal(await zabal(stav));
    expect(balik.s.vlastneRecepty).toEqual([{ id: 'x', nazov: 'Koláč' }]);
    const lok = { ...stavB(), vlastneRecepty: [{ id: 'y', nazov: 'Guláš' }] };
    const r = pouzi(lok, balik, 'zlucit');
    expect((r.vlastneRecepty as unknown[]).length).toBe(2);
    expect(rozdiel(lok, balik).kluce.find((k) => k.kluc === 'vlastneRecepty')?.nove).toBe(1);
  });
});

describe('prenos – zbaliť a rozbaliť', () => {
  it('okružná cesta zachová stav', async () => {
    const stav = stavA();
    const t = await zabal(stav, 123);
    expect(t).toMatch(/^[ZJ][A-Za-z0-9_-]+$/);
    const { balik, varovania } = await rozbal(t);
    expect(varovania).toEqual([]);
    expect(balik.v).toBe(1);
    expect(zluc(balik.s as never)).toEqual(stav);
  });
  it('diakritika a odkaz', async () => {
    const stav = { ...stavA(), nakupVlastne: ['žltá šošovica', 'kôrovce'] };
    const t = await zabal(stav);
    expect(vytiahniDataText(odkazZDat(t, 'https://x.github.io/Recepty/#/viac'))).toBe(t);
    expect(vytiahniDataText(`  ${t}\n`)).toBe(t);
    expect((await rozbal(t)).balik.s.nakupVlastne).toEqual(['žltá šošovica', 'kôrovce']);
    expect(zmestiSaDoQr(odkazZDat(t, 'https://x.github.io/Recepty/'))).toBe(true);
  });
  it('veľké dáta sa nezmestia do QR', async () => {
    const stav = { ...stavA(), historia: Array.from({ length: 3000 }, (_, i) => ({ recept: 'r' + i * 7919, den: `2026-${i}` })) };
    expect(zmestiSaDoQr(odkazZDat(await zabal(stav), 'https://x/'))).toBe(false);
  });
  it('nekomprimovaný formát J sa tiež načíta', async () => {
    const j = 'J' + naBase64url(new TextEncoder().encode(JSON.stringify({ a: 'recepty-prenos', v: 1, c: 1, s: { oblubene: ['q'] } })));
    expect((await rozbal(j)).balik.s.oblubene).toEqual(['q']);
  });
});

describe('prenos – odolnosť voči chybám', () => {
  it('poškodené, orezané a cudzie dáta hodia PrenosChyba', async () => {
    const t = await zabal(stavA());
    for (const zle of ['', 'Z', 'Zabc', 'Q' + t.slice(1), t.slice(0, 20), t.slice(0, -10), 'Z' + t.slice(1).replace(/./, '!'), 'J' + naBase64url(new TextEncoder().encode('{nie json')), 'J' + naBase64url(new TextEncoder().encode('{"a":"iné","v":1,"s":{}}'))]) {
      await expect(rozbal(zle), zle.slice(0, 30)).rejects.toBeInstanceOf(PrenosChyba);
    }
  });
  it('novšia verzia formátu sa odmietne s radou aktualizovať', () => {
    expect(() => over({ a: 'recepty-prenos', v: 99, s: {} })).toThrow(/novšej verzie/);
    expect(() => over({ a: 'recepty-prenos', v: 0, s: {} })).toThrow(PrenosChyba);
  });
  it('zlé typy v časti sa preskočia s varovaním, ostatné ostanú', () => {
    const { balik, varovania } = over({ a: 'recepty-prenos', v: 1, c: 1, s: { oblubene: 'nie pole', hodnotenie: { a: 5, b: 1, __proto__: 1 }, nastavenia: { dospeli: 'x', tema: 'tmava', maxCas: 30 }, nakupVlastne: ['ok', 3, null] } });
    expect(varovania.length).toBe(1);
    expect(balik.s.hodnotenie).toEqual({ b: 1 });
    expect(balik.s.nastavenia).toEqual({ tema: 'tmava', maxCas: 30 });
    expect(balik.s.nakupVlastne).toEqual(['ok']);
    expect(balik.s).not.toHaveProperty('oblubene');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it('kompresná bomba sa zastaví', async () => {
    const velke = new Uint8Array(6_000_000);
    const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(velke); w.close();
    const out = new Uint8Array(await new Response(cs.readable).arrayBuffer());
    await expect(rozbal('Z' + naBase64url(out))).rejects.toThrow(/veľký/);
  });
});

describe('prenos – náhľad a zlúčenie', () => {
  it('rozdiel spočíta nové, rovnaké, konflikty', () => {
    const d = rozdiel(stavB(), zostavBalik(stavA()));
    const k = (n: string) => d.kluce.find((x) => x.kluc === n)!;
    expect(k('oblubene')).toMatchObject({ lokalne: 2, prichadzajuce: 2, nove: 1, rovnake: 1, lenLokalne: 1, vysledokZlucit: 3 });
    expect(k('hodnotenie')).toMatchObject({ nove: 1, konflikty: 1, lenLokalne: 1 });
    expect(k('dnes')).toMatchObject({ nove: 1, lenLokalne: 1, vysledokZlucit: 2 });
    expect(d.ignorovane).toEqual([]);
  });
  it('zlúčiť nič nestratí, pri konflikte vyhrá prichádzajúce', () => {
    const r = pouzi(stavB(), zostavBalik(stavA()), 'zlucit');
    expect([...(r.oblubene as string[])].sort()).toEqual(['a', 'b', 'c']);
    expect(r.hodnotenie).toEqual({ a: 1, b: -1, c: 1 });
    expect(r.jedalnicek).toEqual({ '0:obed': 'a', '1:obed': 'b' });
    expect((r.historia as unknown[]).length).toBe(2);
    expect((r.nakupVlastne as string[]).sort()).toEqual(['chlieb', 'soľ']);
    expect(r.dnes).toEqual({ '2026-10-15': ['c', 'a'] });
    const n = r.nastavenia as typeof PREDVOLENE;
    expect(n.dospeli).toBe(3); expect(n.alergie.sort()).toEqual(['lepok', 'orechy']);
  });
  it('nahradiť prepíše prichádzajúce kľúče, kľúče mimo balíka ostanú', () => {
    const bal = zostavBalik({ oblubene: ['z'] });
    const r = pouzi(stavB(), bal, 'nahradit');
    expect(r.oblubene).toEqual(['z']);
    expect(r.hodnotenie).toEqual(stavB().hodnotenie);
    expect(pouzi(stavB(), zostavBalik(stavA()), 'nahradit').hodnotenie).toEqual({ a: 1, b: -1 });
  });
  it('nezmení vstupný stav a ignoruje kľúče, ktoré lokálny stav nemá', () => {
    const lok = stavB(); const kopia = structuredClone(lok);
    const bal = zostavBalik({ ...stavA(), cudzi: ['x'] });
    expect(rozdiel(lok, bal).ignorovane).toEqual(['cudzi']);
    const r = pouzi(lok, bal, 'zlucit');
    expect(lok).toEqual(kopia);
    expect(r).not.toHaveProperty('cudzi');
  });
});
