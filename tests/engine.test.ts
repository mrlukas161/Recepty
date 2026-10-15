import { describe, it, expect } from 'vitest';
import { SUROVINA, RECEPTY } from '../src/data';
import { vypocitajSkore } from '../src/engine/score';
import { naGramy } from '../src/engine/units';
import { aplikujUpravy, ZIADNE_UPRAVY } from '../src/engine/upravy';
import { infoRecept, filtruj, FILTRE0, vylucene, vyhovujeDiete, kolkoPorcii } from '../src/engine/filtre';
import { generujJedalnicek, suhrn } from '../src/engine/planner';
import { zostavNakup } from '../src/engine/nakup';
import { PREDVOLENE } from '../src/engine/types';
import type { Recept } from '../src/data/types';

const mk = (p: Partial<Recept>): Recept => ({ id: 't', nazov: 'T', typ: 'obed', kuchyna: 'x', casPripravy: 10, casVarenia: 10, narocnost: 1, porcie: 2, suroviny: [], postup: ['a', 'b'], tagy: [], vybavenie: [], upravy: [], ilustracia: '🍲', ...p });
const first = (pred: (id: string) => boolean) => [...SUROVINA.keys()].find(pred)!;

describe('skóre', () => {
  it('je v rozsahu 0–100 pre všetky recepty', () => {
    for (const r of RECEPTY) { const s = vypocitajSkore(r, r.suroviny, SUROVINA); expect(s.celkom).toBeGreaterThanOrEqual(0); expect(s.celkom).toBeLessThanOrEqual(100); expect(s.faktory.length).toBe(10); }
  });
  it('zelenina + strukoviny skórujú lepšie než biela múka + cukor', () => {
    const muka = first((id) => SUROVINA.get(id)!.priznaky.includes('rafinovana-muka') && SUROVINA.get(id)!.skupina === 'muky-obilniny');
    const cukor = first((id) => id === 'cukor' || id.startsWith('cukor'));
    const zel = first((id) => SUROVINA.get(id)!.priznaky.includes('zelenina') && SUROVINA.get(id)!.na100.kcal < 50);
    const str = first((id) => SUROVINA.get(id)!.priznaky.includes('strukovina'));
    const zle = vypocitajSkore(mk({}), [{ id: muka, mnozstvo: 250, jednotka: 'g' }, { id: cukor, mnozstvo: 80, jednotka: 'g' }], SUROVINA);
    const dobre = vypocitajSkore(mk({}), [{ id: zel, mnozstvo: 300, jednotka: 'g' }, { id: str, mnozstvo: 150, jednotka: 'g' }], SUROVINA);
    expect(dobre.celkom).toBeGreaterThan(zle.celkom);
  });
  it('vyprážanie znižuje skóre', () => {
    const r = RECEPTY[0];
    expect(vypocitajSkore({ ...r, vyprazane: true }, r.suroviny, SUROVINA).celkom).toBeLessThanOrEqual(vypocitajSkore({ ...r, vyprazane: false }, r.suroviny, SUROVINA).celkom);
  });
  it('každý faktor má vysvetlenie', () => {
    const s = vypocitajSkore(RECEPTY[0], RECEPTY[0].suroviny, SUROVINA);
    for (const f of s.faktory) expect(f.preco.length).toBeGreaterThan(10);
  });
});

describe('jednotky a úpravy', () => {
  it('prepočíta ks, ml, lyžicu', () => {
    const v = SUROVINA.get('vajce') ?? [...SUROVINA.values()].find((s) => s.jednotky.ks && s.skupina === 'vajcia')!;
    expect(naGramy(v, 2, 'ks')).toBe(2 * (v.jednotky.ks ?? 50));
    expect(naGramy(v, 100, 'g')).toBe(100);
    expect(naGramy(undefined, 1, 'lyzica')).toBe(15);
  });
  it('úprava vynechá voliteľné, vymení a pridá', () => {
    const a = first((id) => SUROVINA.get(id)!.priznaky.includes('zelenina'));
    const b = [...SUROVINA.keys()].filter((id) => SUROVINA.get(id)!.priznaky.includes('zelenina'))[1];
    const r = mk({ suroviny: [{ id: a, mnozstvo: 100, jednotka: 'g', nevyhnutna: true }, { id: b, mnozstvo: 50, jednotka: 'g', volitelna: true }], upravy: [{ typ: 'pridat', popis: 'x', na: b, mnozstvo: 30 }] });
    expect(aplikujUpravy(r, { ...ZIADNE_UPRAVY, odobrane: [b] }).length).toBe(1);
    expect(aplikujUpravy(r, { ...ZIADNE_UPRAVY, odobrane: [a] }).length).toBe(2); // nevyhnutnú nemožno odobrať
    expect(aplikujUpravy(r, { ...ZIADNE_UPRAVY, pridane: [0] }).length).toBe(3);
    expect(aplikujUpravy(r, { ...ZIADNE_UPRAVY, vymenene: { [a]: b } })[0].id).toBe(b);
  });
});

const infos = RECEPTY.map((r) => infoRecept(r, SUROVINA));

describe('filtre', () => {
  it('alergia vylúči recepty s alergénom', () => {
    const n = { ...PREDVOLENE, alergie: ['lepok' as const] };
    for (const i of filtruj(infos, FILTRE0, n, SUROVINA, [])) expect(i.alergeny.has('lepok')).toBe(false);
  });
  it('vegetariánska diéta bez mäsa', () => {
    for (const i of infos.filter((x) => vyhovujeDiete(x, 'vegetarianska', SUROVINA)))
      for (const s of i.r.suroviny) expect(SUROVINA.get(s.id)!.priznaky).not.toContain('maso');
  });
  it('vylúčená kategória nikdy neprejde', () => {
    const n = { ...PREDVOLENE, obmedzenia: { ...PREDVOLENE.obmedzenia, muka: 'vylucit' as const } };
    for (const i of infos) if (i.kat.muka) expect(vylucene(i, n)).toBe(true);
  });
  it('hľadanie ignoruje diakritiku', () => {
    const r = infos[0].r;
    const q = r.nazov.slice(0, 4).normalize('NFD').replace(/[̀-ͯ]/g, '');
    expect(filtruj(infos, { ...FILTRE0, hladat: q, bezVylucenych: false }, PREDVOLENE, SUROVINA, []).some((i) => i.r.id === r.id)).toBe(true);
  });
  it('porcie domácnosti', () => { expect(kolkoPorcii({ ...PREDVOLENE, dospeli: 2, deti: [2, 4, 6] })).toBe(3.5); });
});

describe('plánovač', () => {
  const n = { ...PREDVOLENE, maxTyzdenne: { muka: 2, cukor: 1, udeniny: 1, vyprazane: 1, tazke: 2 } };
  for (const seed of [1, 2, 3, 4, 5]) {
    it(`dodrží vylúčenia, limity a rozmanitosť (seed ${seed})`, () => {
      const plan = generujJedalnicek({ infos, n: { ...n, alergie: ['orechy'] }, db: SUROVINA, seed });
      const map = new Map(infos.map((i) => [i.r.id, i]));
      const ids = Object.values(plan).filter(Boolean) as string[];
      expect(ids.length).toBeGreaterThan(10);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(map.get(id)!.alergeny.has('orechy')).toBe(false);
      const sh = suhrn(plan, map, SUROVINA);
      expect(sh.kat.muka).toBeLessThanOrEqual(2);
      expect(sh.kat.udeniny).toBeLessThanOrEqual(1);
      expect(sh.ryby).toBeLessThanOrEqual(2);
    });
  }
  it('zamknuté sloty ostanú', () => {
    const id = infos.find((i) => i.r.typ === 'obed')!.r.id;
    const plan = generujJedalnicek({ infos, n: PREDVOLENE, db: SUROVINA, zamknute: { '0:obed': id }, seed: 9 });
    expect(plan['0:obed']).toBe(id);
  });
});

describe('nákup', () => {
  it('zlúči rovnaké suroviny a odpočíta zásoby', () => {
    const r = infos[0].r;
    const dvakrat = zostavNakup([{ r, krat: 1 }, { r, krat: 1 }], r.porcie, SUROVINA, new Set());
    const raz = zostavNakup([{ r, krat: 1 }], r.porcie, SUROVINA, new Set());
    const g = (o: ReturnType<typeof zostavNakup>) => Object.values(o).flat().reduce((a, p) => a + p.gramy, 0);
    expect(g(dvakrat)).toBeCloseTo(2 * g(raz), 3);
    const prva = r.suroviny.find((s) => !s.volitelna)!.id;
    const bez = zostavNakup([{ r, krat: 1 }], r.porcie, SUROVINA, new Set([prva]));
    expect(Object.values(bez).flat().some((p) => p.id === prva)).toBe(false);
  });
  it('prepočíta na domácnosť', () => {
    const r = infos[0].r;
    const a = zostavNakup([{ r, krat: 1 }], r.porcie, SUROVINA, new Set());
    const b = zostavNakup([{ r, krat: 1 }], r.porcie * 2, SUROVINA, new Set());
    const g = (o: ReturnType<typeof zostavNakup>) => Object.values(o).flat().reduce((x, p) => x + p.gramy, 0);
    expect(g(b)).toBeCloseTo(2 * g(a), 3);
  });
});

describe('postupPreDomacnost', () => {
  it('pridá poznámku ku kroku s vynechanou surovinou, ostatné nechá', async () => {
    const { postupPreDomacnost } = await import('../src/engine/obmedzene');
    const s = [...SUROVINA.values()].find((x) => x.priznaky.includes('spracovane-maso'))!;
    const kmen = s.nazov.split(/[\s/(),]+/)[0].toLowerCase();
    const out = postupPreDomacnost([`Pridaj ${kmen}.`, 'Zamiešaj.'], SUROVINA, [s.id]);
    expect(out[0]).toContain('(voliteľné – máš obmedzené)');
    expect(out[1]).toBe('Zamiešaj.');
    expect(postupPreDomacnost(['Pridaj.'], SUROVINA, [])).toEqual(['Pridaj.']);
  });
});
