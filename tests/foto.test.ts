import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { RECEPTY, SUROVINY } from '../src/data';
import { overZoznamFotiek, fotoUrl } from '../src/foto';

describe('fotky jedál (slot)', () => {
  it('zoznam: platné záznamy prejdú, zlé id a duplicity nie', () => {
    const z = overZoznamFotiek([
      { id: 'palacinky-s-dzemom', ai: true, model: 'model-x', datum: '2026-10-20' },
      { id: 'palacinky-s-dzemom', ai: false }, { id: '../hack', ai: true }, { id: 'A B' }, null, 5, { ai: true },
      { id: 'bez-ai', model: 5 },
    ]);
    expect(z.map((x) => x.id)).toEqual(['palacinky-s-dzemom', 'bez-ai']);
    expect(z[0]).toEqual({ id: 'palacinky-s-dzemom', ai: true, model: 'model-x', datum: '2026-10-20' });
    expect(z[1].ai).toBe(false); expect(z[1].model).toBe('');
    expect(overZoznamFotiek('nie pole')).toEqual([]);
  });
  it('adresa fotky je <id>.webp pod foto/', () => { expect(fotoUrl('x-y')).toMatch(/foto\/x-y\.webp$/); });
  it('public/foto/zoznam.json je platné pole a každá fotka v ňom existuje ako recept aj súbor', () => {
    const z = JSON.parse(fs.readFileSync('public/foto/zoznam.json', 'utf8'));
    expect(Array.isArray(z)).toBe(true);
    const ids = new Set(RECEPTY.map((r) => r.id));
    for (const f of overZoznamFotiek(z)) { expect(ids.has(f.id), f.id).toBe(true); expect(fs.existsSync(`public/foto/${f.id}.webp`), f.id).toBe(true); }
  });
  it('docs/RECEPTY_ZOZNAM.md obsahuje všetky recepty a docs/zoznam-surovin.txt všetky suroviny', () => {
    const md = fs.readFileSync('docs/RECEPTY_ZOZNAM.md', 'utf8');
    for (const r of RECEPTY) expect(md.includes(`| \`${r.id}\` |`), r.id).toBe(true);
    const sur = fs.readFileSync('docs/zoznam-surovin.txt', 'utf8');
    for (const s of SUROVINY) expect(sur.includes(`${s.id} | `), s.id).toBe(true);
  });
});
