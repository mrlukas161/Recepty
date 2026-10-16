import { describe, it, expect } from 'vitest';
import { opravSlova, spojRozdeleneSlova, najblizsieSlovo, kvalitaTextu, pasmoTextu, jeSlovo, slovnikVelkost } from '../src/skener/slovnik';
import { spracujOcrText, vycistiOcrText } from '../src/skener/ocr';
import { rozbor } from '../src/skener/rozbor';

describe('slovník OCR', () => {
  it('slovník má rozumnú veľkosť a pozná názvy z databázy aditív', () => {
    expect(slovnikVelkost()).toBeGreaterThan(800);
    expect(jeSlovo('sorbitol')).toBe(true);
    expect(jeSlovo('lecitín')).toBe(true);
  });
  it('najbližšie slovo s prahom podľa dĺžky', () => {
    expect(najblizsieSlovo('cukur')?.vzor).toBe('cukor');
    expect(najblizsieSlovo('emulgatar')?.vzdialenost).toBe(1);
    expect(najblizsieSlovo('xyzqw')).toBeUndefined();
    expect(najblizsieSlovo('abc')).toBeUndefined();
  });
});

describe('oprava zašumeného textu', () => {
  it('preklepy zo skutočného typu OCR chýb', () => {
    const { text, opravy } = opravSlova('cukur, pšenicná mukaa, palmovy tuk, emulgatar, kyselina citrónavá, zahusťovadlo, sladidlo');
    expect(text).toContain('cukor');
    expect(text).toContain('pšeničná múka'.split(' ')[0]);
    expect(text).toMatch(/palmový|palmovy/);
    expect(text).toContain('citrónová');
    expect(opravy.length).toBeGreaterThanOrEqual(3);
  });
  it('doplní diakritiku, ktorú OCR zahodilo', () => {
    expect(opravSlova('psenicna mluka, sladidlo, kysilina citronova').text).toMatch(/pšeničná/);
    expect(opravSlova('smotana, zahustovadlo').text).toContain('zahusťovadlo');
  });
  it('E-čísla, percentá, čísla a krátke slová sa nemenia', () => {
    const t = 'kakao 4,5 %, E330, E471, soľ, voda, aróma';
    expect(opravSlova(t).text).toBe(t);
  });
  it('neznáme, ale platné slová nemení (nejednoznačné alebo ďaleko)', () => {
    const t = 'kurkuma, moringa, spirulina';
    expect(opravSlova(t).text).toBe(t);
  });
  it('zachová veľké písmená', () => {
    expect(opravSlova('Cukur, SMOTANA').text).toMatch(/^Cukor/);
  });
  it('po oprave sa zloženie rozpozná lepšie než pred ňou', () => {
    const surove = 'pšenicná mukaa, cukur, palmovy tuk, kyselina citrónavá, emulgatar (E471), soľ';
    const pred = rozbor(surove).zlozky.filter((z) => z.typ === 'neznama').length;
    const po = rozbor(opravSlova(surove).text).zlozky.filter((z) => z.typ === 'neznama').length;
    expect(po).toBeLessThanOrEqual(pred);
    expect(kvalitaTextu(opravSlova(surove).text)).toBeGreaterThan(kvalitaTextu('zxcvb mnbvc qwert')) ;
  });
});

describe('spájanie slov na konci riadka', () => {
  it('pomlčka na konci riadka', () => {
    expect(spojRozdeleneSlova('múka, sla-\ndidlo (E950)')).toBe('múka, sladidlo (E950)');
    expect(spojRozdeleneSlova('emul-\n gátor, farbivo')).toBe('emulgátor, farbivo');
  });
  it('zloženina s pomlčkou ostane (glukózo-fruktózový)', () => {
    expect(vycistiOcrText('glukózo-\nfruktózový sirup, cukor')).toBe('glukózo-fruktózový sirup, cukor');
  });
  it('zlom bez pomlčky sa spojí len keď je výsledok slovo', () => {
    expect(spojRozdeleneSlova('sladi\ndlo, cukor')).toBe('sladidlo, cukor');
    expect(spojRozdeleneSlova('múka\ncukor')).toBe('múka\ncukor');
  });
  it('celý reťazec cez spracujOcrText', () => {
    const r = spracujOcrText('Zloženie: pšenicná mu-\nka , cukur ,\nsladi-\ndlo (E950) .');
    expect(r.text).toMatch(/múka|muka/);
    expect(r.text).toContain('cukor');
    expect(r.text).toContain('sladidlo (E950).');
  });
});

describe('druhý prechod: pás textu', () => {
  const riadok = (y0: number, y1: number, conf = 80, text = 'cukor, múka') => ({ text, confidence: conf, bbox: { x0: 100, y0, x1: 700, y1 } });
  it('orezne na pás dobrých riadkov s okrajom', () => {
    const p = pasmoTextu([riadok(300, 340), riadok(350, 390), riadok(10, 30, 20, '#$'), riadok(1500, 1520, 30, '~~')], 1000, 2000)!;
    expect(p.top).toBeLessThanOrEqual(300);
    expect(p.top + p.height).toBeGreaterThanOrEqual(390);
    expect(p.height).toBeLessThan(200);
    expect(p.left).toBeLessThan(100);
  });
  it('ak pás zaberá takmer celý obraz alebo nič nenašiel, orez sa nerobí', () => {
    expect(pasmoTextu([{ text: 'cukor', confidence: 90, bbox: { x0: 0, y0: 0, x1: 1000, y1: 2000 } }], 1000, 2000)).toBeUndefined();
    expect(pasmoTextu([], 1000, 2000)).toBeUndefined();
    expect(pasmoTextu([riadok(10, 30, 10)], 1000, 2000)).toBeUndefined();
  });
});

describe('zložka s upresnením v zátvorke je jedna zložka', () => {
  it('Nutella (angličtina): palmový tuk a aróma vanilín bez duplicít', async () => {
    const { rozbor } = await import('../src/skener/rozbor');
    const r = rozbor('Ingredients: sugar, vegetable fat (palm), hazelnuts (13%), skimmed milk powder (8.7%), fat-reduced cocoa (7.4%), emulsifier: lecithins (soy), flavouring: vanillin.');
    const id = r.zlozky.map((z) => z.id);
    expect(id.filter((x) => x === 'palmovy-tuk')).toHaveLength(1);
    expect(id).not.toContain('olej');
    const e2 = rozbor('sugar, flavouring (vanillin), salt');
    expect(e2.zlozky.filter((z) => z.id === 'aroma')).toHaveLength(1);
    const e3 = rozbor('vegetable fat (palm), flavouring (vanillin)');
    expect(e3.zlozky.map((z) => z.id)).toEqual(['palmovy-tuk', 'aroma']);
  });
});
