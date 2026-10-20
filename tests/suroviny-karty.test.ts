import { describe, it, expect } from 'vitest';
import { SUROVINA, SUROVINY, RECEPTY } from '../src/data';
import { KARTY_SUROVIN, VERDIKT_TEXT } from '../src/data/karty-surovin';
import { ZDROJ, zdrojePre } from '../src/data/zdroje';
import { slabaSurovina, dovodyAuto } from '../src/engine/slabe';
import { TIPY, tipDna } from '../src/data/tipy';

describe('karty surovín', () => {
  it('každá karta a každá náhrada ukazuje na existujúcu surovinu a zdroj', () => {
    for (const [id, k] of Object.entries(KARTY_SUROVIN)) {
      expect(SUROVINA.has(id), id).toBe(true);
      expect(VERDIKT_TEXT[k.verdikt]).toBeTruthy();
      expect(k.kratko.length, id).toBeGreaterThan(20);
      expect(k.preco.length + k.kedyAno.length, id).toBeGreaterThan(1);
      expect(k.kedyNie.length, id).toBeGreaterThan(0);
      for (const n of k.nahrady) expect(SUROVINA.has(n), `${id} → ${n}`).toBe(true);
      expect(k.nahrady.includes(id), id).toBe(false);
      for (const z of k.zdroje ?? []) expect(ZDROJ.has(z), `${id} zdroj ${z}`).toBe(true);
    }
  });
  it('požadované suroviny existujú a majú kartu', () => {
    for (const id of ['tapioka-skrob', 'karfiol', 'kalerab', 'zeler-bulvovy', 'bulgur', 'kuskus', 'quinoa', 'amarant', 'jahly-proso', 'pohanka', 'chia', 'psyllium', 'mandlova-muka', 'kokosova-muka', 'tofu-natur', 'tempeh', 'ovsene-vlocky', 'cicerova-muka', 'sosovicova-muka'])
      expect(KARTY_SUROVIN[id], id).toBeTruthy();
  });
  it('tapioka, bulgur a kuskus nie sú označené ako zlepšenie; bulgur a kuskus majú lepok', () => {
    expect(KARTY_SUROVIN['tapioka-skrob'].verdikt).toBe('podobne');
    expect(KARTY_SUROVIN['tapioka-skrob'].kratko).toMatch(/škrob/);
    for (const id of ['bulgur', 'kuskus']) {
      expect(KARTY_SUROVIN[id].verdikt).toBe('podobne');
      expect(SUROVINA.get(id)!.alergeny).toContain('lepok');
      expect(KARTY_SUROVIN[id].kratko).toMatch(/lepk|lepok/);
    }
  });
  it('tvrdenia o živinách zodpovedajú tabuľke', () => {
    const v = (id: string) => SUROVINA.get(id)!.na100;
    expect(v('bulgur').vlak).toBeGreaterThan(v('kuskus').vlak);
    expect(v('quinoa').bielk).toBeGreaterThan(v('ryza-biela').bielk);
    for (const id of ['cicerova-muka', 'sosovicova-muka', 'ovsena-muka', 'pohankova-muka']) {
      expect(v(id).vlak, id).toBeGreaterThan(v('psenicna-muka-hladka').vlak);
      expect(v(id).bielk, id).toBeGreaterThan(v('psenicna-muka-hladka').bielk);
    }
    expect(v('tapioka-skrob').vlak).toBeLessThan(2); expect(v('tapioka-skrob').bielk).toBeLessThan(1);
    expect(v('ryza-natur').vlak).toBeGreaterThan(v('ryza-biela').vlak);
    expect(v('cestoviny-cicerove').bielk).toBeGreaterThan(v('cestoviny-psenicne').bielk);
    expect(v('chlieb-celozrnny').vlak).toBeGreaterThan(v('rozok-biely').vlak);
    expect(v('psenicna-muka-celozrnna').vlak).toBeGreaterThan(v('psenicna-muka-hladka').vlak);
  });
  it('nové suroviny: hodnoty zo zdrojov, psyllium je odhad', () => {
    expect(SUROVINA.get('tapioka-skrob')!.zdrojNutr).toBe('fdc:169717');
    expect(SUROVINA.get('kukuricny-skrob')!.zdrojNutr).toBe('ciqual:9510');
    expect(SUROVINA.get('psyllium')!.odhad).toBe(true);
    expect(SUROVINA.get('psyllium')!.poznamkaNutr).toMatch(/odhad/);
  });
  it('psyllium má zdroj s úrovňou vyhľadávania', () => {
    const z = zdrojePre('karty', 'psyllium');
    expect(z.length).toBeGreaterThan(0);
    expect(z.every((x) => x.overenie === 'vyhladavanie')).toBe(true);
  });
});

describe('slabé suroviny a náhrady', () => {
  it('každá surovina s rafinovanou múkou alebo údeninou v recepte má dôvod a existujúcu náhradu', () => {
    for (const s of SUROVINY) {
      if (!s.priznaky.some((p) => p === 'rafinovana-muka' || p === 'spracovane-maso' || p === 'pridany-cukor')) continue;
      const w = slabaSurovina(s);
      expect(w, s.id).toBeTruthy();
      expect(w!.dovod.length, s.id).toBeGreaterThan(10);
      expect(w!.nahrady.filter((n) => SUROVINA.has(n)).length, s.id).toBeGreaterThan(0);
      expect(w!.nahrady.includes(s.id)).toBe(false);
    }
  });
  it('zdravá surovina nie je slabá', () => {
    expect(slabaSurovina(SUROVINA.get('brokolica')!)).toBeNull();
    expect(slabaSurovina(SUROVINA.get('pohanka')!)).toBeNull();
    expect(slabaSurovina(SUROVINA.get('bulgur')!)).toBeTruthy();
  });
  it('automatické dôvody pre lepok a múku', () => {
    expect(dovodyAuto(SUROVINA.get('psenicna-muka-hladka')!).join(' ')).toMatch(/lepok/);
  });
  it('recept s múkou má aspoň jednu slabú surovinu', () => {
    const r = RECEPTY.find((x) => x.id === 'palacinky-s-dzemom')!;
    expect(r.suroviny.some((x) => slabaSurovina(SUROVINA.get(x.id)!))).toBe(true);
  });
});

describe('denný tip', () => {
  it('tipy majú unikátne id a odkazy na existujúce karty', () => {
    expect(new Set(TIPY.map((t) => t.id)).size).toBe(TIPY.length);
    for (const t of TIPY) { const m = t.odkaz?.match(/^#\/surovina\/(.+)$/); if (m) expect(SUROVINA.has(m[1]), t.id).toBe(true); expect(t.text.length).toBeGreaterThan(20); }
  });
  it('rotácia: v ďalších N dňoch sa tip nezopakuje, nasledujúci deň je iný', () => {
    const n = TIPY.length, z = new Date(2026, 9, 19, 9);
    const ids = Array.from({ length: n }, (_, k) => tipDna(new Date(z.getTime() + k * 86400000)).id);
    expect(new Set(ids).size).toBe(n);
    expect(tipDna(z).id).toBe(tipDna(new Date(2026, 9, 19, 22)).id);
    expect(tipDna(z, 1).id).not.toBe(tipDna(z).id);
  });
});
