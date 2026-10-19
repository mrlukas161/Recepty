import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

/** Kontrast WCAG AA pre dvojice farieb z premenných v src/styles.css – svetlý aj tmavý režim. */
const css = fs.readFileSync('src/styles.css', 'utf8');

function premenne(blok: string): Record<string, string> {
  const o: Record<string, string> = {};
  for (const m of blok.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) o[m[1]] = m[2].trim();
  return o;
}
const svetle = premenne(css.slice(css.indexOf(':root {'), css.indexOf('@media (prefers-color-scheme: dark)')));
const tmavaMedia = premenne(css.match(/@media \(prefers-color-scheme: dark\) \{ :root:not\(\[data-tema="svetla"\]\) \{([^}]*)\}/)![1]);
const tmavaRucne = premenne(css.match(/:root\[data-tema="tmava"\] \{([^}]*)\}/)![1]);

const lin = (c: number) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
function lum(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
const kontrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const REZIMY: [string, Record<string, string>][] = [
  ['svetlý', svetle],
  ['tmavý (podľa systému)', { ...svetle, ...tmavaMedia }],
  ['tmavý (ručne)', { ...svetle, ...tmavaRucne }],
];
/** [popredie, pozadie, minimum, popis] – 4,5 text, 3 prvky rozhrania a ikony. */
const DVOJICE: [string, string, number, string][] = [
  ['--text', '--papier', 4.5, 'text na pozadí'], ['--text', '--karta', 4.5, 'text na karte'],
  ['--tlmene', '--papier', 4.5, 'tlmený text'], ['--tlmene', '--karta', 4.5, 'tlmený text na karte'],
  ['--odkaz', '--karta', 4.5, 'odkaz'], ['--odkaz', '--papier', 4.5, 'odkaz na pozadí'],
  ['--paradajka', '--karta', 4.5, 'akcent'], ['--hl-text', '--hl-pozadie', 4.5, 'hlavné tlačidlo'],
  ['--papier', '--oliva', 4.5, 'zvolený čip'], ['--papier', '--text', 4.5, 'zvolená záložka'],
  ['--vyborne', '--karta', 4.5, 'skóre výborné'], ['--dobre', '--karta', 4.5, 'skóre dobré'], ['--obcas', '--karta', 4.5, 'skóre občas'], ['--zle', '--karta', 4.5, 'skóre zriedka'],
  ['--vyborne', '--papier', 4.5, 'skóre výborné na pozadí'], ['--dobre', '--papier', 4.5, 'skóre dobré na pozadí'], ['--obcas', '--papier', 4.5, 'skóre občas na pozadí'], ['--zle', '--papier', 4.5, 'skóre zriedka na pozadí'],
  ['--ramik', '--karta', 3, 'rámik ovládacích prvkov'], ['--ramik', '--papier', 3, 'rámik na pozadí'],
  ['--fokus', '--karta', 3, 'zvýraznenie fokusu'], ['--fokus', '--papier', 3, 'zvýraznenie fokusu na pozadí'],
];

describe('kontrast WCAG AA', () => {
  for (const [nazov, v] of REZIMY) {
    it(`${nazov} režim spĺňa AA`, () => {
      for (const [f, b, min, popis] of DVOJICE) {
        const k = kontrast(v[f], v[b]);
        expect(k, `${popis}: ${f} ${v[f]} na ${b} ${v[b]} = ${k.toFixed(2)}`).toBeGreaterThanOrEqual(min);
      }
    });
  }
  it('tmavý režim existuje v oboch podobách rovnaký', () => {
    for (const k of Object.keys(tmavaMedia)) if (k !== '--tien') expect(tmavaRucne[k], k).toBe(tmavaMedia[k]);
  });
  it('premenné sa správne načítali', () => { expect(svetle['--papier']).toMatch(/^#/); expect(tmavaMedia['--papier']).toMatch(/^#/); expect(tmavaRucne['--karta']).toMatch(/^#/); });
  it('systémový tmavý režim je zapnutý cez prefers-color-scheme', () => { expect(css).toMatch(/prefers-color-scheme: dark/); });
});
