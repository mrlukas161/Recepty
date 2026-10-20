import { describe, it, expect } from 'vitest';
import { rozbor } from '../src/skener/rozbor';
import { najdiRizika } from '../src/skener/rizika';
import { mapujOff } from '../src/skener/off';

const ids = (t: string, d?: Parameters<typeof rozbor>[1]) => najdiRizika(rozbor(t, d), d).map((x) => x.id);

describe('skrytý zdroj dusičnanov/dusitanov', () => {
  it('sk: mäsový výrobok so zeleninovým extraktom/práškom', () => {
    expect(ids('Bravčové mäso (86 %), voda, soľ, zelerový extrakt, dextróza')).toContain('skryte-dusicnany');
    expect(ids('Kuracie mäso, voda, soľ, špenátový prášok, cukor')).toContain('skryte-dusicnany');
    expect(ids('Hovädzie mäso, soľ, cvikla extrakt, korenie')).toContain('skryte-dusicnany');
    expect(ids('Šunka z bravčového mäsa, soľ, acerola (extrakt), kultúry')).toContain('skryte-dusicnany');
    expect(ids('Bravčové mäso, mangold šťava, soľ')).toContain('skryte-dusicnany');
  });
  it('cs: maso + zeleninový extrakt', () => {
    expect(ids('Vepřové maso 90 %, sůl, celerový extrakt, kultura')).toContain('skryte-dusicnany');
    expect(ids('Kuřecí maso, voda, špenátový prášek, sůl')).toContain('skryte-dusicnany');
  });
  it('en: meat + vegetable powder/extract/juice concentrate', () => {
    expect(ids('Pork, water, salt, celery powder, sugar')).toContain('skryte-dusicnany');
    expect(ids('Turkey breast, sea salt, cultured celery juice, spices')).toContain('skryte-dusicnany');
    expect(ids('Beef, beetroot juice concentrate, salt')).toContain('skryte-dusicnany');
    expect(ids('Chicken, spinach extract, acerola cherry extract, salt')).toContain('skryte-dusicnany');
  });
  it('de: Fleisch + Gemüseextrakt', () => {
    expect(ids('Schweinefleisch, Wasser, Salz, Selleriepulver, Zucker')).toContain('skryte-dusicnany');
    expect(ids('Putenbrust, Spinatextrakt, Salz')).toContain('skryte-dusicnany');
    expect(ids('Rindfleisch, Rote-Bete-Saft, Salz')).toContain('skryte-dusicnany');
  });
  it('tvrdenie „bez éčok / bez pridaných dusitanov“ sa pripojí do textu nálezu (z tagov databázy)', () => {
    const d = { tagy: ['en:pork', 'en:no-added-nitrite'] };
    const r = najdiRizika(rozbor('Bravčové mäso, soľ, zelerový prášok', d), d).find((x) => x.id === 'skryte-dusicnany')!;
    expect(r.text).toMatch(/bez éčok/);
  });
  it('tvrdenie sa nájde aj v texte (sk, cs, en, de)', () => {
    for (const t of ['Bravčové mäso, soľ, zelerový prášok. Bez pridaných dusitanov.', 'Vepřové maso, sůl, celerový extrakt. Bez přidaných dusitanů.', 'Pork, salt, celery powder. No added nitrites.', 'Schweinefleisch, Salz, Selleriepulver. Ohne Nitritpökelsalz.']) {
      const r = najdiRizika(rozbor(t)).find((x) => x.id === 'skryte-dusicnany');
      expect(r, t).toBeTruthy();
      expect(r!.text, t).toMatch(/bez éčok/);
    }
  });
  it('FALOŠNÉ POPLACHY: zeler/špenát bez mäsa nie je nález', () => {
    expect(ids('Zeler, mrkva, uhorka, olivový olej, soľ')).not.toContain('skryte-dusicnany');
    expect(ids('Špenátový prášok, pšeničná múka, voda')).not.toContain('skryte-dusicnany');
    expect(ids('Celery, tomato, onion, salt')).not.toContain('skryte-dusicnany');
    expect(ids('Zeleninová polievka: zeler, cvikla, mrkva, soľ')).not.toContain('skryte-dusicnany');
    expect(ids('Sellerie, Karotte, Rote Bete, Salz')).not.toContain('skryte-dusicnany');
  });
  it('FALOŠNÉ POPLACHY: mäso bez zeleninového extraktu a celý zeler v mäsovej polievke nie je extrakt', () => {
    expect(ids('Bravčové mäso, voda, soľ, korenie')).not.toContain('skryte-dusicnany');
    expect(ids('Kuracie mäso, zelenina (mrkva, petržlen, zeler), voda, soľ')).not.toContain('skryte-dusicnany');
    expect(ids('Crouton, kuracie mäso, mrkva')).not.toContain('skryte-dusicnany');
    expect(ids('Meatless burger: pea protein, beet, water')).not.toContain('skryte-dusicnany');
  });
  it('ak sú E249–E252 uvedené priamo, je to nález „dusitany“, nie skrytý zdroj', () => {
    const x = ids('Bravčové mäso, soľ, dusitan sodný (E250), zelerový extrakt');
    expect(x).toContain('dusitany'); expect(x).not.toContain('skryte-dusicnany');
  });
  it('ingredients_tags z Open Food Facts', () => {
    const d = mapujOff('1', { status: 1, product: { ingredients_text: '', ingredients_tags: ['en:pork', 'en:celery-extract', 'en:salt'], labels_tags: ['en:no-nitrite'] } })!.doplnok!;
    expect(najdiRizika(rozbor('', d), d).map((x) => x.id)).toContain('skryte-dusicnany');
    const d2 = mapujOff('2', { status: 1, product: { ingredients_text: 'zeler, voda', ingredients_tags: ['en:celery', 'en:water'] } })!.doplnok!;
    expect(najdiRizika(rozbor('zeler, voda', d2), d2).map((x) => x.id)).not.toContain('skryte-dusicnany');
  });
});

describe('benzoan + kyselina askorbová, údeniny', () => {
  it('E211 + E300 v nápoji → benzén', () => {
    expect(ids('Voda, cukor, kyselina citrónová, benzoan sodný (E211), kyselina askorbová (E300), aróma')).toContain('benzen');
    expect(ids('Water, sugar, sodium benzoate, ascorbic acid, flavouring')).toContain('benzen');
  });
  it('samotný E211 alebo samotný vitamín C nie je nález', () => {
    expect(ids('Voda, cukor, benzoan sodný (E211)')).not.toContain('benzen');
    expect(ids('Voda, pomarančová šťava, kyselina askorbová (E300)')).not.toContain('benzen');
  });
  it('dusitany E250 → nález s popisom', () => {
    expect(ids('Bravčové mäso, soľ, konzervant E250')).toContain('dusitany');
  });
});
