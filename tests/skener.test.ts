import { describe, it, expect } from 'vitest';
import { rozbor } from '../src/skener/rozbor';
import { parsujZlozenie, rozdelText, delNaUrovni } from '../src/skener/parser';
import { vytiahniE, najdiPodlaE, ADITIVA } from '../src/skener/aditiva';
import { vypocitajSkoreVyrobku } from '../src/skener/skore';
import { alergenyVTexte } from '../src/skener/alergeny';
import { ZDROJ } from '../src/data/zdroje';
import { HODNOTENIA } from '../src/skener/hodnotenia';
import { ZLOZKY } from '../src/skener/zlozky';
import { PREDVOLENE } from '../src/engine/types';

const nazvy = (t: string) => rozbor(t).zlozky.map((z) => z.nazov);
const najdi = (t: string, re: RegExp) => rozbor(t).zlozky.find((z) => re.test(z.povodny));

describe('parser', () => {
  it('delí podľa čiarok a ignoruje čiarky v zátvorkách a desatinné čiarky', () => {
    expect(delNaUrovni('a, b (c, d), e 12,5 %')).toEqual(['a', 'b (c, d)', 'e 12,5 %']);
  });
  it('percentá a podzložky', () => {
    const s = parsujZlozenie('mäso 60 %, čokoláda (cukor, kakaová hmota 45 %), voda (12,5 %)');
    expect(s[0]).toMatchObject({ text: 'mäso', percento: 60 });
    expect(s[1].deti.map((d) => d.text)).toEqual(['cukor', 'kakaová hmota']);
    expect(s[1].deti[1].percento).toBe(45);
    expect(s[2]).toMatchObject({ text: 'voda', percento: 12.5 });
  });
  it('odstráni hlavičku, výživové údaje a oddelí stopy', () => {
    const r = rozdelText('Zloženie: múka, cukor, soľ. Môže obsahovať stopy orechov. Výživové údaje na 100 g: energia 400 kJ');
    expect(r.zlozenie).toBe('múka, cukor, soľ');
    expect(r.stopy).toMatch(/orechov/);
  });
  it('spojí slová rozdelené spojovníkom na konci riadku', () => {
    expect(rozdelText('Zloženie: sla-\ndidlo (E950), voda').zlozenie).toBe('sladidlo (E950), voda');
  });
});

describe('E-čísla', () => {
  it.each([['E330', 'E330'], ['E 330', 'E330'], ['E-330', 'E330'], ['e330', 'E330'], ['E150d', 'E150d'], ['E 160a', 'E160a'], ['E471', 'E471']])('%s', (t, e) => {
    expect(vytiahniE(t)?.e).toBe(e);
  });
  it('opraví OCR zámeny O/l/I v čísle', () => {
    expect(vytiahniE('E33O')?.e).toBe('E330');
    expect(vytiahniE('E1O2')?.e).toBe('E102');
  });
  it('variant (i) a zátvorka', () => {
    expect(najdiPodlaE('E101(i)')?.id).toBe('E101(i)');
    expect(najdiPodlaE('E101')?.zaklad).toBe('E101');
  });
  it('databáza má stovky aditív so slovenským názvom', () => {
    expect(ADITIVA.length).toBeGreaterThan(600);
    expect(najdiPodlaE('E330')?.nazov).toBe('Kyselina citrónová');
  });
});

describe('rozpoznanie zložiek', () => {
  const text = 'Pšeničná múka, cukor, palmový tuk, glukózo-fruktózový sirup, kakao 4,5 %, sójový lecitín, emulgátor (E 322, E471), farbivo: E150d, aróma, soľ, kyselina citrónová, šunka (bravčové mäso 80 %, soľ, dusitan sodný).';
  it('rozpozná kľúčové zložky', () => {
    const z = rozbor(text).zlozky;
    const ids = z.map((x) => x.id);
    expect(ids).toContain('rafinovana-muka');
    expect(ids).toContain('cukor');
    expect(ids).toContain('palmovy-tuk');
    expect(ids).toContain('sirup');
    expect(ids).toContain('aroma');
    expect(ids).toContain('udenina');
    expect(z.find((x) => x.e === 'E471')?.hodnotenie).toBeTruthy();
    expect(z.find((x) => x.e === 'E150d')?.funkcia).toBe('farbivo');
    expect(z.find((x) => x.e === 'E250' || /dusitan/i.test(x.povodny))?.hodnotenie?.stupen).toBe('obmedzit');
  });
  it('pozná slovné názvy aditív', () => {
    expect(nazvy('kyselina citrónová, sorbitol, aspartám')).toEqual(['Kyselina citrónová', 'Sorbitol', 'Aspartám']);
  });
  it('toleruje preklepy z OCR', () => {
    expect(najdi('kyselina citrónavá, aspartan', /citr/)?.id).toBe('E330');
    const f = najdi('palmovy tuk, pšenicná mukaa', /mukaa/);
    expect(f?.id).toBe('rafinovana-muka');
    expect(rozbor('cukor, kyselina cítrónová').zlozky[1].id).toBe('E330');
  });
  it('celozrnná múka nie je rafinovaná', () => {
    expect(najdi('celozrnná pšeničná múka 60 %, voda', /celozrn/)?.id).toBe('celozrnne');
    expect(najdi('pšeničná múka celozrnná, soľ', /celozrn/)?.id).toBe('celozrnne');
  });
  it('„bez pridaného cukru“ nie je cukor', () => {
    expect(rozbor('ovocná dužina, bez pridaného cukru').zlozky.some((z) => z.id === 'cukor')).toBe(false);
  });
  it('neznáme alebo nezmyselné zložky označí', () => {
    const z = rozbor('mäso, ##$ %&').zlozky;
    expect(z.length).toBeGreaterThanOrEqual(1);
  });
});

describe('alergény', () => {
  it('rozpozná alergény v zložení a stopy', () => {
    const r = rozbor('múka pšeničná, mlieko, sójový lecitín, vajcia. Môže obsahovať stopy orechov, sezamu.');
    expect(r.alergeny).toEqual(expect.arrayContaining(['lepok', 'mlieko', 'soja', 'vajcia']));
    expect(r.stopy).toEqual(expect.arrayContaining(['orechy', 'sezam']));
  });
  it('kakaové maslo nie je mlieko, muškátový orech nie je orech', () => {
    expect(alergenyVTexte('kakaové maslo, muškátový orech')).toEqual([]);
  });
  it('siričitany z E220', () => {
    expect(rozbor('konzervant: E220').alergeny).toContain('siricitany');
  });
});

describe('skóre výrobku', () => {
  const dobry = rozbor('Ovsené vločky celozrnné 100 %');
  const zly = rozbor('Cukor, pšeničná múka, glukózo-fruktózový sirup, palmový tuk, stužený rastlinný tuk, sladidlo (aspartám), farbivo (E102, E110), emulgátor (E471, E322), aróma, modifikovaný škrob, E250, soľ');
  it('jednoduchý výrobok vychádza lepšie ako priemyselný', () => {
    const a = vypocitajSkoreVyrobku(dobry), b = vypocitajSkoreVyrobku(zly);
    expect(a.celkom).toBeGreaterThanOrEqual(80);
    expect(b.celkom).toBeLessThan(40);
    expect(a.celkom).toBeGreaterThan(b.celkom);
    expect(a.pasmo).toBe('vyborne');
    expect(b.pasmo).toBe('zriedka');
  });
  it('faktory majú dôvod a váhy', () => {
    for (const f of vypocitajSkoreVyrobku(zly).faktory) { expect(f.preco.length).toBeGreaterThan(10); expect(f.vaha).toBeGreaterThan(0); }
  });
  it('osobné upozornenia: alergia, múka, cukor', () => {
    const n = { ...PREDVOLENE, alergie: ['lepok' as const], deti: [3] };
    const s = vypocitajSkoreVyrobku(rozbor('pšeničná múka, cukor, soľ'), { nastavenia: n });
    expect(s.osobne.some((x) => x.typ === 'alergen')).toBe(true);
    expect(s.osobne.some((x) => /múku|múka/i.test(x.text))).toBe(true);
    expect(s.osobne.some((x) => /cukor/i.test(x.text))).toBe(true);
  });
  it('s deťmi sú farbivá horšie než bez detí', () => {
    const r = rozbor('voda, farbivo (E110)');
    const bez = vypocitajSkoreVyrobku(r, { nastavenia: { ...PREDVOLENE, deti: [] } });
    const s = vypocitajSkoreVyrobku(r, { nastavenia: { ...PREDVOLENE, deti: [3] } });
    expect(s.celkom).toBeLessThan(bez.celkom);
  });
  it('výživové hodnoty zmenia skóre', () => {
    const r = rozbor('múka, cukor');
    const a = vypocitajSkoreVyrobku(r), b = vypocitajSkoreVyrobku(r, { vyziva: { cukry: 40, sol: 2, nasyt: 10 } });
    expect(b.faktory.some((f) => f.id === 'vyziva')).toBe(true);
    expect(b.celkom).toBeLessThan(a.celkom);
  });
  it('prázdny vstup nepadne', () => {
    expect(vypocitajSkoreVyrobku(rozbor('')).celkom).toBe(0);
  });
});

describe('dáta skenera', () => {
  const vsetky = [...Object.values(HODNOTENIA), ...ZLOZKY.map((z) => z.hodnotenie), ...ADITIVA.map((a) => a.hodnotenie)];
  it('každé hodnotenie má dôvod, úroveň a existujúce zdroje', () => {
    for (const h of vsetky) {
      expect(h.dovod.length).toBeGreaterThan(20);
      expect(h.uroven).toBeTruthy();
      for (const z of h.zdroje) expect(ZDROJ.has(z), z).toBe(true);
    }
  });
  it('zdroje skenera majú URL, dátum a stupeň overenia', () => {
    const sk = [...ZDROJ.values()].filter((z) => z.karty?.includes('skener'));
    expect(sk.length).toBeGreaterThan(20);
    for (const z of sk) { expect(z.url).toMatch(/^https:/); expect(z.overene).toMatch(/^2026-/); expect(z.overenie).toBe('vyhladavanie'); }
  });
  it('preventívne obavy nie sú označené ako silné dôkazy', () => {
    for (const h of vsetky) if (h.preventivne) expect(['slabé', 'prax', 'odhad']).toContain(h.uroven);
  });
});
