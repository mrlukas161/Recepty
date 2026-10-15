import { describe, it, expect } from 'vitest';
import { SUROVINA } from '../src/data';
import {
  exportVlastne, parseVlastne, zlucVlastne, naRecept, istotaSkore, skoreVlastneho, navrhniSuroviny, rozborRiadku,
  ocistiVlastne, VERZIA_FORMATU, type VlastnyRecept,
} from '../src/engine/vlastne';
import { zluc } from '../src/store';
import { zostavNakup } from '../src/engine/nakup';
import { VERZIA_STAVU } from '../src/engine/types';

const mk = (p: Partial<VlastnyRecept> = {}): VlastnyRecept => ({
  id: 'v-test1', nazov: 'Špenátová omeleta', typ: 'obed', casPripravy: 10, casVarenia: 10, porcie: 2,
  suroviny: [{ id: 'vajce-slepacie', mnozstvo: 4, jednotka: 'ks' }, { id: 'spenat', mnozstvo: 150, jednotka: 'g' }],
  volne: [], postup: ['Vyšľahaj vajcia.', 'Upeč.'], tagy: ['rychle'],
  vytvorene: '2026-10-15T08:00:00.000Z', upravene: '2026-10-15T08:00:00.000Z', ...p,
});

describe('export / import vlastných receptov', () => {
  it('okružná cesta zachová recept', () => {
    const r = parseVlastne(exportVlastne([mk(), mk({ id: 'v-test2', nazov: 'Iný', volne: ['hrsť petržlenu'] })]));
    expect(r.ok).toBe(true); expect(r.chyby).toEqual([]);
    expect(r.recepty).toHaveLength(2);
    expect(r.recepty[0]).toEqual(mk());
    expect(r.recepty[1].volne).toEqual(['hrsť petržlenu']);
  });
  it('súbor má formát a verziu', () => {
    const o = JSON.parse(exportVlastne([mk()]));
    expect(o.format).toBe('recepty-vlastne'); expect(o.verzia).toBe(VERZIA_FORMATU); expect(Array.isArray(o.recepty)).toBe(true);
  });
  it('chybné vstupy nevyhodia výnimku a vrátia ok=false', () => {
    for (const x of ['', 'nie json', '[]', 'null', '42', '{}', '{"format":"iné","verzia":1,"recepty":[]}', '{"format":"recepty-vlastne","recepty":[]}', '{"format":"recepty-vlastne","verzia":1}', '{"format":"recepty-vlastne","verzia":99,"recepty":[]}']) {
      const r = parseVlastne(x);
      expect(r.ok).toBe(false); expect(r.recepty).toEqual([]); expect(r.chyby.length).toBeGreaterThan(0);
    }
    expect(parseVlastne(undefined).ok).toBe(false);
  });
  it('chybný recept sa preskočí, dobrý prejde', () => {
    const o = JSON.parse(exportVlastne([mk()]));
    o.recepty.push({ nazov: '', typ: 'nič' }, 5, null, { ...mk({ id: 'v-ok2' }), porcie: -3 });
    const r = parseVlastne(JSON.stringify(o));
    expect(r.ok).toBe(true); expect(r.recepty).toHaveLength(1); expect(r.chyby).toHaveLength(4);
  });
  it('neznáma surovina sa zmení na voľný text, id sa sanitizuje, duplicitné id sa premenuje', () => {
    const o = JSON.parse(exportVlastne([mk(), mk()]));
    o.recepty[0].id = '<script>'; o.recepty[0].suroviny.push({ id: 'neexistuje-x', mnozstvo: 5, jednotka: 'g' });
    const r = parseVlastne(o);
    expect(r.recepty[0].id).toMatch(/^v-/); expect(r.recepty[0].volne).toContain('neexistuje x');
    expect(new Set(r.recepty.map((x) => x.id)).size).toBe(2);
  });
  it('zlúčenie: nové pridá, novšie prepíše, staršie nechá', () => {
    const a = mk(), b = mk({ id: 'v-b', nazov: 'B' });
    const nov = mk({ nazov: 'Nová verzia', upravene: '2026-10-16T08:00:00.000Z' });
    const star = mk({ id: 'v-b', nazov: 'Staré B', upravene: '2026-10-14T08:00:00.000Z' });
    const z = zlucVlastne([a, b], [nov, star, mk({ id: 'v-c', nazov: 'C' })]);
    expect(z).toMatchObject({ pridane: 1, aktualizovane: 1, nezmenene: 1 });
    expect(z.recepty.map((x) => x.nazov)).toEqual(['Nová verzia', 'B', 'C']);
  });
});

describe('skóre a istota', () => {
  it('používa rovnaký výpočet; kompletný recept má vysokú istotu', () => {
    const v = mk(); const sk = skoreVlastneho(v);
    expect(sk.celkom).toBeGreaterThan(0); expect(sk.faktory).toHaveLength(10);
    expect(istotaSkore(v).uroven).toBe('vysoka');
  });
  it('voľný text a chýbajúce množstvo znižujú istotu', () => {
    const a = istotaSkore(mk({ volne: ['2 PL domácej omáčky'] }));
    const b = istotaSkore(mk({ volne: ['300 g niečoho', '300 g ďalšieho'] }));
    const c = istotaSkore(mk({ suroviny: [{ id: 'spenat', mnozstvo: 0, jednotka: 'g' }], volne: ['niečo'] }));
    expect(a.uroven).not.toBe('vysoka'); expect(a.text).toMatch(/nezapočítal/);
    expect(b.uroven).toBe('nizka'); expect(b.podiel).toBeLessThan(a.podiel);
    expect(c.uroven).toBe('ziadna');
  });
  it('surovina bez množstva ide medzi voľný text a do nákupu v gramoch sa nedostane', () => {
    const r = naRecept(mk({ suroviny: [{ id: 'spenat', mnozstvo: 0, jednotka: 'g' }, { id: 'cibula', mnozstvo: 100, jednotka: 'g' }], volne: ['soľ'] }));
    expect(r.suroviny.map((s) => s.id)).toEqual(['cibula']);
    expect(r.volne).toEqual(['soľ', 'Špenát']);
    const n = zostavNakup([{ r, krat: 1 }], 2, SUROVINA, new Set());
    expect(Object.values(n).flat().map((p) => p.id)).toEqual(['cibula']);
  });
  it('vlastný recept ide do nákupu', () => {
    const n = zostavNakup([{ r: naRecept(mk()), krat: 1 }], 4, SUROVINA, new Set());
    const ids = Object.values(n).flat().map((p) => p.id);
    expect(ids).toContain('spenat'); expect(ids).toContain('vajce-slepacie');
  });
});

describe('voľný text', () => {
  it('rozbor množstva', () => {
    expect(rozborRiadku('2 PL olivového oleja')).toEqual({ mnozstvo: 2, jednotka: 'lyzica', zvysok: 'olivového oleja' });
    expect(rozborRiadku('1,5 dl mlieka')).toEqual({ mnozstvo: 150, jednotka: 'ml', zvysok: 'mlieka' });
    expect(rozborRiadku('0.5 kg múky')).toMatchObject({ mnozstvo: 500, jednotka: 'g' });
    expect(rozborRiadku('hrsť špenátu')).toEqual({ mnozstvo: null, jednotka: null, zvysok: 'hrsť špenátu' });
  });
  it('návrh priradenia z databázy', () => {
    expect(navrhniSuroviny('2 PL olivového oleja')[0]?.id).toBe('olej-olivovy');
    expect(navrhniSuroviny('čerstvý špenát')[0]?.id).toBe('spenat');
    expect(navrhniSuroviny('cibule')[0]?.id).toBe('cibula');
    expect(navrhniSuroviny('xyzzy')).toEqual([]);
    expect(navrhniSuroviny('')).toEqual([]);
  });
});

describe('uložený stav: verzia a migrácia', () => {
  it('starý stav (v1) sa migruje bez straty dát', () => {
    const stary = { nastavenia: { dospeli: 3, deti: [5] }, oblubene: ['x'], hodnotenie: { y: 1 }, nakupRecepty: ['z'] } as never;
    const s = zluc(stary);
    expect(s.verzia).toBe(VERZIA_STAVU); expect(s.vlastne).toEqual([]);
    expect(s.nastavenia.dospeli).toBe(3); expect(s.oblubene).toEqual(['x']); expect(s.nakupRecepty).toEqual(['z']);
  });
  it('chybné vlastné recepty v uloženom stave sa zahodia, dobré ostanú', () => {
    const s = zluc({ vlastne: [mk(), { zle: 1 }, null, 'x'] as never });
    expect(s.vlastne).toHaveLength(1);
    expect(ocistiVlastne('nie pole')).toEqual([]);
  });
});
