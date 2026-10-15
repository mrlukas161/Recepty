import { describe, it, expect } from 'vitest';
import { rozbor } from '../src/skener/rozbor';
import { upozorneniaDiety } from '../src/skener/dieta';
import { vypocitajSkoreVyrobku } from '../src/skener/skore';
import { PREDVOLENE } from '../src/engine/types';
import { ZDROJ } from '../src/data/zdroje';

const lepok = { diety: ['bezlepkova'], alergie: [] as never[] };
const laktoza = { diety: ['bez-laktozy'], alergie: [] as never[] };
const texty = (t: string, n = lepok) => upozorneniaDiety(rozbor(t), n);

describe('bezlepková diéta', () => {
  it('pšenica, raž, jačmeň, špalda, kamut, slad', () => {
    const u = texty('pšeničná múka, ražná múka, jačmenný slad, špaldová múka, kamut, sladový výťažok');
    const t = u.map((x) => x.text).join(' | ');
    for (const s of ['pšenica', 'raž', 'jačmeň', 'špalda', 'kamut', 'slad']) expect(t).toContain(s);
    expect(u.every((x) => x.zdroje.length > 0)).toBe(true);
    expect(u.some((x) => x.zavaznost === 'vysoka')).toBe(true);
  });
  it('ovos bez označenia bezlepkový = krížová kontaminácia; s označením len informácia', () => {
    const a = texty('ovsené vločky, cukor');
    expect(a.find((x) => /ovos/i.test(x.text))?.zavaznost).toBe('vysoka');
    expect(a.find((x) => /ovos/i.test(x.text))?.text).toMatch(/kontamin/);
    const b = texty('bezlepkové ovsené vločky 100 %');
    expect(b.find((x) => /ovos/i.test(x.text))?.zavaznost).toBe('info');
  });
  it('„môže obsahovať stopy lepku“ je varovanie', () => {
    const u = texty('ryža, soľ. Môže obsahovať stopy lepku.');
    expect(u.some((x) => /stopy lepku/.test(x.text) && x.zavaznost === 'vysoka')).toBe(true);
  });
  it('pšeno, ryža a „bez lepku“ nie sú lepok', () => {
    const u = texty('pšeno, ryža, kukuričná múka, bez lepku');
    expect(u.filter((x) => x.zavaznost !== 'info')).toEqual([]);
  });
  it('pšeničný glukózový sirup – výnimka z označovania, len informácia', () => {
    const u = texty('cukor, pšeničný glukózový sirup');
    expect(u.find((x) => /glukózový/i.test(x.text))?.zavaznost).toBe('info');
  });
  it('bez diéty ani alergie nič neukáže', () => {
    expect(upozorneniaDiety(rozbor('pšeničná múka'), { diety: [], alergie: [] })).toEqual([]);
  });
  it('alergia na lepok funguje ako bezlepková diéta', () => {
    expect(upozorneniaDiety(rozbor('jačmeň'), { diety: [], alergie: ['lepok'] }).length).toBeGreaterThan(0);
  });
});

describe('diéta bez laktózy', () => {
  it('mlieko, srvátka, mliečna bielkovina, laktóza, smotana, maslo, syr', () => {
    const u = texty('odtučnené mlieko, srvátkový prášok, mliečna bielkovina, laktóza, smotana, maslo, syr', laktoza);
    const t = u.map((x) => x.text).join(' | ');
    for (const s of ['mlieko', 'srvátka', 'mliečna bielkovina', 'laktóza', 'smotana', 'maslo', 'syr']) expect(t.toLowerCase()).toContain(s);
  });
  it('syr má poznámku o vyzretých syroch a označenie „prax, nie dôkaz“', () => {
    const s = texty('tvrdý syr', laktoza).find((x) => /^Syr/.test(x.text))!;
    expect(s.text).toMatch(/vyzret/);
    expect(s.uroven).toMatch(/prax/);
  });
  it('rastlinné „mlieka“ a kakaové maslo nie sú laktóza', () => {
    expect(texty('ovsené mlieko, kakaové maslo, kokosové mlieko, javorový sirup', laktoza)).toEqual([]);
  });
  it('alergia na mlieko: „bez laktózy“ nepomôže', () => {
    const u = upozorneniaDiety(rozbor('mlieko bez laktózy, cukor'), { diety: [], alergie: ['mlieko'] });
    expect(u[0].zavaznost).toBe('vysoka');
    expect(u[0].text).toMatch(/bez laktózy/);
  });
});

describe('integrácia do skóre a dáta', () => {
  it('upozornenie zníži „Tvoje nastavenia“ a objaví sa vo výsledku', () => {
    const r = rozbor('pšeničná múka, ovsené vločky, cukor');
    const bez = vypocitajSkoreVyrobku(r, { nastavenia: { ...PREDVOLENE, diety: [] } });
    const s = vypocitajSkoreVyrobku(r, { nastavenia: { ...PREDVOLENE, diety: ['bezlepkova'] } });
    expect(s.dieta.length).toBeGreaterThan(0);
    expect(bez.dieta).toEqual([]);
    expect(s.faktory.find((f) => f.id === 'osobne')!.body).toBeLessThan(bez.faktory.find((f) => f.id === 'osobne')!.body);
  });
  it('všetky zdroje upozornení existujú', () => {
    const r = rozbor('pšeničná múka, ovos, mlieko. Môže obsahovať stopy lepku.');
    for (const u of [...upozorneniaDiety(r, lepok), ...upozorneniaDiety(r, laktoza)]) for (const z of u.zdroje) expect(ZDROJ.has(z), z).toBe(true);
  });
});
