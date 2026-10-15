import { describe, it, expect } from 'vitest';
import { SUROVINA, RECEPTY, RECEPT } from '../src/data';
import { infoRecept } from '../src/engine/filtre';
import { generujJedalnicek, suhrn, jeZvysok, kluc } from '../src/engine/planner';
import { zostavNakup, zoskupRecepty, formatMnozstvo, SKONTROLUJ } from '../src/engine/nakup';
import { obmedzeneVolitelne, vynechaneVolitelne, zobrazenyNazov, nazovPreDomacnost, kategorieSuroviny } from '../src/engine/obmedzene';
import { PREDVOLENE, casNaDen, VERZIA_STAVU } from '../src/engine/types';
import { zluc } from '../src/store';
import { aplikujUpravy, ZIADNE_UPRAVY } from '../src/engine/upravy';
import { vypocitajSkore } from '../src/engine/score';
import type { Recept } from '../src/data/types';

const mk = (p: Partial<Recept>): Recept => ({ id: 't', nazov: 'T', typ: 'obed', kuchyna: 'x', casPripravy: 10, casVarenia: 10, narocnost: 1, porcie: 2, suroviny: [], postup: ['a', 'b'], tagy: [], vybavenie: [], upravy: [], ilustracia: '🍲', ...p });
const infos = RECEPTY.map((r) => infoRecept(r, SUROVINA));
const vsetko = (o: ReturnType<typeof zostavNakup>) => Object.values(o).flat();
const nak = (suroviny: Recept['suroviny'], por = 2) => zostavNakup([{ r: mk({ suroviny }), krat: 1 }], por, SUROVINA, new Set());
const najdi = (o: ReturnType<typeof zostavNakup>, id: string) => vsetko(o).find((p) => p.id === id);

describe('nákupný zoznam – položky a jednotky', () => {
  it('voda a ľad nie sú v zozname', () => {
    const o = nak([{ id: 'voda', mnozstvo: 1000, jednotka: 'ml' }, { id: 'cibula', mnozstvo: 200, jednotka: 'g' }]);
    expect(najdi(o, 'voda')).toBeUndefined();
    expect(najdi(o, 'cibula')).toBeDefined();
  });
  it('soľ, korenie a drobnosti pod ~10 g idú do „skontroluj“ bez gramov', () => {
    const o = nak([{ id: 'sol', mnozstvo: 1, jednotka: 'lyzicka' }, { id: 'korenie-cierne', mnozstvo: 1, jednotka: 'lyzicka' }, { id: 'cibula', mnozstvo: 200, jednotka: 'g' }]);
    expect(o[SKONTROLUJ].map((p) => p.id).sort()).toEqual(['korenie-cierne', 'sol']);
    expect(o[SKONTROLUJ].every((p) => p.text === '' && p.skontroluj)).toBe(true);
    expect(najdi(o, 'cibula')!.skontroluj).toBeUndefined();
  });
  it('chlieb v plátkoch, nie v „ks“', () => {
    const k = formatMnozstvo(SUROVINA.get('chlieb-celozrnny'), 315);
    expect(k).toBe('~315 g ≈ 7 plátkov');
    expect(formatMnozstvo(SUROVINA.get('chlieb-celozrnny'), 90)).toBe('~90 g ≈ 2 plátky');
    expect(formatMnozstvo(SUROVINA.get('rozok-biely'), 135)).toContain('3 rožky');
    expect(formatMnozstvo(SUROVINA.get('jablko'), 540)).toContain('≈ 3 ks');
  });
  it('múka na 1 kg, mlieko na 1 l, vajcia po 10, konzervy po kusoch', () => {
    const o = nak([
      { id: 'psenicna-muka-hladka', mnozstvo: 720, jednotka: 'g' }, { id: 'mlieko-polotucne', mnozstvo: 300, jednotka: 'ml' },
      { id: 'vajce-slepacie', mnozstvo: 6, jednotka: 'ks' }, { id: 'paradajky-krajane-konzerva', mnozstvo: 500, jednotka: 'g' },
      { id: 'olej-repkovy', mnozstvo: 120, jednotka: 'ml' },
    ], 2);
    expect(najdi(o, 'psenicna-muka-hladka')!.text).toBe('1 kg');
    expect(najdi(o, 'psenicna-muka-hladka')!.potreba).toBe('treba ~720 g');
    expect(najdi(o, 'mlieko-polotucne')!.text).toBe('1 l');
    expect(najdi(o, 'vajce-slepacie')!.text).toBe('10 ks');
    expect(najdi(o, 'vajce-slepacie')!.potreba).toBe('treba ~6 ks');
    expect(najdi(o, 'paradajky-krajane-konzerva')!.text).toBe('2 × konzerva 400 g');
    expect(najdi(o, 'olej-repkovy')!.text).toBe('1 l');
  });
  it('viac balení: 1,3 kg múky → 2 kg', () => {
    const o = nak([{ id: 'psenicna-muka-hladka', mnozstvo: 1300, jednotka: 'g' }]);
    expect(najdi(o, 'psenicna-muka-hladka')!.text).toBe('2 kg');
  });
  it('každý recept dá zoznam bez vody a bez položiek s nezmyselným textom', () => {
    for (const r of RECEPTY) {
      const o = zostavNakup([{ r, krat: 1 }], r.porcie, SUROVINA, new Set());
      for (const p of vsetko(o)) {
        expect(p.id).not.toBe('voda');
        if (!p.skontroluj) expect(p.text.length).toBeGreaterThan(0);
        expect(p.text).not.toMatch(/NaN|undefined/);
      }
    }
  });
  it('rovnaký recept dvakrát = jeden riadok, dvojnásobné množstvo (varím na 2 dni)', () => {
    const r = RECEPTY.find((x) => x.id === 'fazulovy-privarok')!;
    const sk = zoskupRecepty([r.id, r.id], (id) => RECEPT.get(id));
    expect(sk).toEqual([{ r, krat: 2 }]);
    const raz = zostavNakup([{ r, krat: 1 }], 4, SUROVINA, new Set());
    const dva = zostavNakup(sk, 4, SUROVINA, new Set());
    expect(vsetko(dva).filter((p) => p.id === 'fazula-biela').length).toBe(1);
    expect(najdi(dva, 'fazula-biela')!.gramy).toBeCloseTo(2 * najdi(raz, 'fazula-biela')!.gramy, 5);
  });
});

describe('voliteľné obmedzované suroviny', () => {
  const privarok = RECEPT.get('fazulovy-privarok')!;
  const karfiol = RECEPT.get('zapekany-karfiol-so-syrom')!;
  const n = PREDVOLENE; // údeniny „obmedziť“

  it('klobása je pri obmedzených údeninách vynechaná, kým ju používateľ nepridá', () => {
    expect(obmedzeneVolitelne(privarok, n, SUROVINA)).toEqual(['klobasa-udena']);
    expect(vynechaneVolitelne(privarok, n, SUROVINA)).toEqual(['klobasa-udena']);
    expect(vynechaneVolitelne(privarok, n, SUROVINA, ['klobasa-udena'])).toEqual([]);
    const bez = { ...n, obmedzenia: { ...n.obmedzenia, udeniny: 'bez' as const } };
    expect(obmedzeneVolitelne(privarok, bez, SUROVINA)).toEqual([]);
    const vyl = { ...n, obmedzenia: { ...n.obmedzenia, udeniny: 'vylucit' as const } };
    expect(obmedzeneVolitelne(privarok, vyl, SUROVINA)).toEqual(['klobasa-udena']);
  });
  it('názov sa zobrazí bez sľubu, dáta ostanú', () => {
    expect(nazovPreDomacnost(privarok, n, SUROVINA)).toBe('Fazuľový prívarok (klobása voliteľne)');
    expect(nazovPreDomacnost(privarok, n, SUROVINA, ['klobasa-udena'])).toBe('Fazuľový prívarok s údeným');
    expect(nazovPreDomacnost(karfiol, n, SUROVINA)).toBe('Zapekaný karfiol so syrom (šunka voliteľne)');
    expect(privarok.nazov).toBe('Fazuľový prívarok s údeným');
  });
  it('skript cez všetky recepty: obmedzená voliteľná surovina nikdy nezostane v zobrazenom názve', () => {
    const vyl = { ...PREDVOLENE, obmedzenia: { muka: 'vylucit', cukor: 'vylucit', udeniny: 'vylucit', vyprazane: 'vylucit', tazke: 'bez' } as typeof PREDVOLENE.obmedzenia };
    let pocetObm = 0;
    for (const r of RECEPTY) {
      const obm = obmedzeneVolitelne(r, vyl, SUROVINA);
      for (const id of obm) {
        pocetObm++;
        const s = SUROVINA.get(id)!;
        expect(kategorieSuroviny(s).length).toBeGreaterThan(0);
        expect(r.suroviny.find((x) => x.id === id)!.volitelna).toBe(true);
      }
      const nazov = nazovPreDomacnost(r, vyl, SUROVINA);
      expect(nazov.length).toBeGreaterThan(3);
      expect(nazov).not.toMatch(/\(\s*\)|\s{2,}| (s|so|a|z|zo)$/);
      if (nazov !== r.nazov) expect(nazov).toMatch(/\(.+ voliteľne\)$/);
      // s pridanou surovinou sa názov vráti na pôvodný
      expect(nazovPreDomacnost(r, vyl, SUROVINA, obm)).toBe(r.nazov);
    }
    expect(pocetObm).toBeGreaterThan(10);
  });
  it('zobrazenyNazov bez vynechaných surovín nemení názov', () => {
    expect(zobrazenyNazov(privarok, SUROVINA, [])).toBe(privarok.nazov);
  });
  it('nákup: klobása sa nepočíta, kým ju používateľ nepridá; potom áno', () => {
    const bez = zostavNakup([{ r: privarok, krat: 1 }], 4, SUROVINA, new Set());
    expect(najdi(bez, 'klobasa-udena')).toBeUndefined();
    const s = zostavNakup([{ r: privarok, krat: 1 }], 4, SUROVINA, new Set(), { pridane: { [privarok.id]: ['klobasa-udena'] } });
    expect(najdi(s, 'klobasa-udena')).toBeDefined();
  });
  it('limit údenín: pridaná klobása sa započíta do súhrnu aj generátora', () => {
    const plan = { [kluc(0, 'obed')]: privarok.id };
    const infoMap = new Map(infos.map((i) => [i.r.id, i]));
    expect(suhrn(plan, infoMap, SUROVINA).kat.udeniny).toBe(0);
    expect(suhrn(plan, infoMap, SUROVINA, { [privarok.id]: ['klobasa-udena'] }).kat.udeniny).toBe(1);
    // zamknutý obed s pridanou klobásou vyčerpá limit 1× údeniny týždenne
    const nn = { ...PREDVOLENE, jedla: ['obed' as const], maxTyzdenne: { ...PREDVOLENE.maxTyzdenne, udeniny: 1 } };
    for (let seed = 1; seed <= 5; seed++) {
      const p = generujJedalnicek({ infos, n: nn, db: SUROVINA, zamknute: { [kluc(0, 'obed')]: privarok.id }, seed, pridane: { [privarok.id]: ['klobasa-udena'] } });
      const ud = Object.values(p).filter(Boolean).filter((id) => id !== privarok.id && infos.find((i) => i.r.id === id)!.kat.udeniny);
      expect(ud.length).toBe(0);
    }
  });
  it('skóre: s pridanou klobásou sa skóre zmení (počíta sa len po pridaní)', () => {
    const bez = vypocitajSkore(privarok, aplikujUpravy(privarok, { ...ZIADNE_UPRAVY, odobrane: ['klobasa-udena'] }), SUROVINA).celkom;
    const s = vypocitajSkore(privarok, aplikujUpravy(privarok, ZIADNE_UPRAVY), SUROVINA).celkom;
    expect(bez).not.toBe(s);
  });
});

describe('plánovač – čas a varenie na 2 dni', () => {
  const trv = (id: string | null) => infos.find((i) => i.r.id === id)!;
  it('generátor drží čas cez týždeň aj cez víkend', () => {
    const nn = { ...PREDVOLENE, casTyzden: 30, casVikend: 60 };
    for (let seed = 1; seed <= 6; seed++) {
      const p = generujJedalnicek({ infos, n: nn, db: SUROVINA, seed });
      let pocet = 0;
      for (let d = 0; d < 7; d++) for (const typ of ['obed', 'vecera'] as const) {
        const id = p[kluc(d, typ)]; if (!id) continue;
        pocet++;
        expect(trv(id).cas).toBeLessThanOrEqual(casNaDen(nn, d));
      }
      expect(pocet).toBeGreaterThan(8);
    }
  });
  it('víkend má vlastný limit', () => {
    const nn = { ...PREDVOLENE, casTyzden: 25, casVikend: 150 };
    let dlhsieVikend = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const p = generujJedalnicek({ infos, n: nn, db: SUROVINA, seed });
      for (const d of [5, 6]) for (const typ of ['obed', 'vecera'] as const) { const id = p[kluc(d, typ)]; if (id && trv(id).cas > 25) dlhsieVikend++; }
    }
    expect(dlhsieVikend).toBeGreaterThan(0);
  });
  it('varím na 2 dni: večera sa zopakuje ako obed na ďalší deň a nákup je jeden riadok', () => {
    const nn = { ...PREDVOLENE, varimNa2Dni: true };
    let dvojic = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const p = generujJedalnicek({ infos, n: nn, db: SUROVINA, seed });
      for (let d = 1; d < 7; d++) {
        if (!jeZvysok(p, d, 'obed', nn)) continue;
        dvojic++;
        expect(p[kluc(d - 1, 'vecera')]).toBe(p[kluc(d, 'obed')]);
        expect(trv(p[kluc(d, 'obed')]).r.tagy).toContain('na-viac-dni');
      }
      const ids = Object.values(p).filter(Boolean) as string[];
      const sk = zoskupRecepty(ids, (id) => RECEPT.get(id));
      expect(sk.length).toBe(new Set(ids).size);
    }
    expect(dvojic).toBeGreaterThan(5);
    // bez voľby sa nič nezdvojuje
    for (let seed = 1; seed <= 4; seed++) {
      const p = generujJedalnicek({ infos, n: PREDVOLENE, db: SUROVINA, seed });
      const ids = Object.values(p).filter(Boolean) as string[];
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('uložený stav – migrácia v1 → v2', () => {
  it('maxCas sa prenesie do casTyzden, nové polia dostanú predvolené hodnoty', () => {
    const { casTyzden: _a, casVikend: _b, varimNa2Dni: _c, ...bezNovych } = PREDVOLENE;
    const stary = { nastavenia: { ...bezNovych, maxCas: 20, deti: [3] } as never, oblubene: ['x'], nakupRecepty: ['a', 'b'] };
    const s = zluc(stary);
    expect(s.verzia).toBe(VERZIA_STAVU);
    expect(s.nastavenia.casTyzden).toBe(20);
    expect(s.nastavenia.casVikend).toBe(PREDVOLENE.casVikend);
    expect(s.nastavenia.varimNa2Dni).toBe(false);
    expect((s.nastavenia as unknown as Record<string, unknown>).maxCas).toBeUndefined();
    expect(s.pridaneVolitelne).toEqual({});
    expect(s.oblubene).toEqual(['x']);
    expect(s.nastavenia.deti).toEqual([3]);
    expect(s.nakupRecepty).toEqual(['a', 'b']);
  });
  it('nový stav sa nemení a prázdny vstup dá predvolené', () => {
    const s = zluc({});
    expect(s.nastavenia.casTyzden).toBe(45);
    expect(zluc(s)).toEqual(s);
    expect(zluc({ nastavenia: { ...PREDVOLENE, casTyzden: 30, casVikend: 70, varimNa2Dni: true }, pridaneVolitelne: { r: ['klobasa-udena'] } }).nastavenia.casVikend).toBe(70);
  });
});
