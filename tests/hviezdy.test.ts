import { describe, it, expect } from 'vitest';
import { RECEPTY, SUROVINA } from '../src/data';
import { infoRecept } from '../src/engine/filtre';
import { generujJedalnicek } from '../src/engine/planner';
import { dajHviezdy, nechutilo, vahaHviezd, bonusHviezd, idNechutilo } from '../src/engine/hviezdy';
import { PREDVOLENE } from '../src/engine/types';
import { nastavHviezdy, dajStav, nastav, zluc } from '../src/store';
import { POLITIKA } from '../src/engine/prenos';

const infos = RECEPTY.map((r) => infoRecept(r, SUROVINA));
const n = { ...PREDVOLENE, jedla: ['ranajky', 'obed', 'vecera'] as never, obmedzenia: { muka: 'bez', cukor: 'bez', udeniny: 'bez', vyprazane: 'bez', tazke: 'bez' } as never };

describe('hviezdičky', () => {
  it('čítanie: hviezdy, staré 👍/👎, nehodnotené', () => {
    expect(dajHviezdy({ hodnotenie: {}, hviezdicky: { a: 5 } }, 'a')).toBe(5);
    expect(dajHviezdy({ hodnotenie: { a: 1, b: -1 }, hviezdicky: {} }, 'a')).toBe(4);
    expect(dajHviezdy({ hodnotenie: { b: -1 } }, 'b')).toBe(1);
    expect(dajHviezdy({ hodnotenie: {}, hviezdicky: { a: 9 } }, 'a')).toBe(0);
    expect(nechutilo({ hodnotenie: { b: -1 } }, 'b')).toBe(true);
    expect(idNechutilo({ hodnotenie: {}, hviezdicky: { a: 1, b: 2 } }, ['a', 'b', 'c'])).toEqual(['a']);
  });
  it('váhy: 1★ nikdy, 4–5★ najviac', () => {
    expect(vahaHviezd(1)).toBe(0);
    expect(vahaHviezd(5)).toBeGreaterThan(vahaHviezd(4)); expect(vahaHviezd(4)).toBeGreaterThan(vahaHviezd(3)); expect(vahaHviezd(3)).toBeGreaterThan(vahaHviezd(2));
    expect(bonusHviezd(5)).toBeGreaterThan(bonusHviezd(2));
  });
  it('Zamiešať: recept s 1★ sa nikdy nevyberie, 4–5★ sa vyberá častejšie ako 2★', () => {
    const obedy = infos.filter((i) => i.r.typ === 'obed').slice(0, 30);
    const hv: Record<string, number> = {};
    obedy.slice(0, 5).forEach((i) => { hv[i.r.id] = 1; });
    obedy.slice(5, 10).forEach((i) => { hv[i.r.id] = 5; });
    obedy.slice(10, 15).forEach((i) => { hv[i.r.id] = 2; });
    const c = { 1: 0, 5: 0, 2: 0 } as Record<number, number>;
    for (let seed = 1; seed <= 150; seed++) {
      const plan = generujJedalnicek({ infos: obedy, n: { ...n, jedla: ['obed'] as never }, db: SUROVINA, seed, hodnotenia: { hodnotenie: {}, hviezdicky: hv } });
      for (const id of Object.values(plan)) if (id && hv[id]) c[hv[id]]++;
    }
    expect(c[1]).toBe(0);
    expect(c[5]).toBeGreaterThan(c[2] * 2);
  });
  it('legacy 👎 sa v generátore tiež nevyberie', () => {
    const obedy = infos.filter((i) => i.r.typ === 'obed').slice(0, 12);
    const hodnotenie = Object.fromEntries(obedy.slice(0, 4).map((i) => [i.r.id, -1])) as Record<string, 1 | -1>;
    for (let seed = 1; seed <= 30; seed++) {
      const plan = generujJedalnicek({ infos: obedy, n: { ...n, jedla: ['obed'] as never }, db: SUROVINA, seed, hodnotenia: { hodnotenie } });
      for (const id of Object.values(plan)) expect(hodnotenie[id as string]).toBeUndefined();
    }
  });
  it('1★ odstráni recept z jedálnička a dneška; druhé ťuknutie hodnotenie zruší', () => {
    nastav((s) => { s.jedalnicek['0:obed'] = 'x1'; s.jedalnicek['1:obed'] = 'x2'; s.zamknute = ['0:obed']; s.dnes['2026-10-19'] = ['x1', 'x2']; });
    nastavHviezdy('x1', 1);
    const s = dajStav();
    expect(s.hviezdicky.x1).toBe(1); expect(s.jedalnicek['0:obed']).toBeNull(); expect(s.jedalnicek['1:obed']).toBe('x2');
    expect(s.zamknute).toEqual([]); expect(s.dnes['2026-10-19']).toEqual(['x2']);
    nastavHviezdy('x1', 1);
    expect(dajStav().hviezdicky.x1).toBeUndefined();
    nastavHviezdy('x2', 4); nastavHviezdy('x2', 5);
    expect(dajStav().hviezdicky.x2).toBe(5);
  });
  it('stav: staré uložené dáta dostanú prázdne hviezdičky; prenos má pre kľúč politiku', () => {
    expect(zluc({}).hviezdicky).toEqual({});
    expect(POLITIKA.hviezdicky.over({ a: 3, b: 7, c: 1.5, d: 'x' })).toEqual({ a: 3 });
  });
});

describe('olovrant', () => {
  it('plánovač pre olovrant vyberie desiatu alebo dezert', () => {
    const plan = generujJedalnicek({ infos, n: { ...n, jedla: ['olovrant'] as never }, db: SUROVINA, seed: 3 });
    const ids = Object.values(plan).filter(Boolean) as string[];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(['olovrant', 'desiata', 'dezert']).toContain(infos.find((i) => i.r.id === id)!.r.typ);
  });
});
