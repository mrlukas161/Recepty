/** Databáza prídavných látok: taxonómia Open Food Facts (ODbL) + naše hodnotenia (hodnotenia.ts). */
import data from './data/aditiva-off.json';
import { HODNOTENIA, PREDVOLENE_TRIEDY, KOZMETICKE_TRIEDY, type HodnotenieAd } from './hodnotenia';
import { kluc, levenshtein, tolerancia } from './normalizacia';
import type { Hodnotenie } from './typy';

export interface Aditivum {
  id: string;             // napr. E330, E101(i)
  zaklad: string;         // E101
  nazov: string;          // slovenský názov (alebo český/anglický, ak chýba)
  nazvy: string[];        // všetky názvy a synonymá (sk, cs, en)
  triedy: string[];       // funkcie (anglické kľúče z OFF)
  efsa?: { url: string; datum: string };
  adi?: string;
  hodnotenie: Hodnotenie;
  kozmeticke: boolean;    // marker ultraspracovania (NOVA)
}

interface Surove { id: string; sk: string[]; cs: string[]; en: string[]; triedy: string[]; efsa?: { url: string; datum: string }; adi?: string }

export const TRIEDY_SK: Record<string, string> = {
  colour: 'farbivo', preservative: 'konzervant', antioxidant: 'antioxidant', emulsifier: 'emulgátor', stabiliser: 'stabilizátor',
  thickener: 'zahusťovadlo', 'gelling-agent': 'želírujúca látka', sweetener: 'sladidlo', 'flavour-enhancer': 'zvýrazňovač chuti',
  'acidity-regulator': 'regulátor kyslosti', acid: 'kyselina', 'anti-caking-agent': 'látka proti spekavosti', 'glazing-agent': 'leštidlo',
  humectant: 'látka na udržanie vlhkosti', 'raising-agent': 'prášok do pečiva', sequestrant: 'komplexotvorná látka', 'bulking-agent': 'objemová látka',
  'flour-treatment-agent': 'látka na úpravu múky', 'firming-agent': 'spevňovač', 'foaming-agent': 'penotvorná látka', 'carrier': 'nosič',
  'modified-starch': 'modifikovaný škrob', 'packaging-gas': 'baliaci plyn', propellant: 'hnací plyn', 'anti-foaming-agent': 'protipeniaca látka',
  'flavour': 'aróma', 'mineral-salt': 'minerálna soľ',
};

const surove = data as Surove[];

function zbuduj(): Aditivum[] {
  return surove.filter((s) => /^E\d{3,4}[a-z]?(\([ivx]+\))?$/.test(s.id)).map((s) => {
    const nazvy = [...s.sk, ...s.cs, ...s.en];
    const zaklad = zakladnyE(s.id);
    const o = HODNOTENIA[s.id] ?? HODNOTENIA[zaklad] ?? HODNOTENIA[zaklad.replace(/[a-z]$/, '')];
    const { ultra, ...hodn } = o ?? ({} as HodnotenieAd);
    return {
      id: s.id, zaklad,
      nazov: s.sk[0] ?? s.cs[0] ?? s.en[0] ?? s.id,
      nazvy, triedy: s.triedy,
      efsa: s.efsa && /doi\.org|efsa\.onlinelibrary/.test(s.efsa.url) ? s.efsa : undefined,
      adi: s.adi,
      hodnotenie: o ? (hodn as Hodnotenie) : PREDVOLENE_TRIEDY.default,
      kozmeticke: ultra ?? s.triedy.some((x) => KOZMETICKE_TRIEDY.includes(x)),
    };
  });
}

/** E330, E101(i), E160a(ii) → základ „E160“ + písmeno: E160a. */
export function zakladnyE(id: string): string {
  return id.replace(/\([ivx]+\)$/i, '');
}

export const ADITIVA: Aditivum[] = zbuduj();
export const ADITIVUM = new Map(ADITIVA.map((a) => [a.id, a]));
const PODLA_ZAKLADU = new Map<string, Aditivum[]>();
for (const a of ADITIVA) { const k = zakladnyE(a.id); (PODLA_ZAKLADU.get(k) ?? PODLA_ZAKLADU.set(k, []).get(k)!).push(a); }

/** Nájde aditívum podľa E-čísla; pri variante (i)/(ii) bez uvedenia vezme prvý. */
export function najdiPodlaE(e: string): Aditivum | undefined {
  const k = e.toUpperCase().replace(/\s+/g, '').replace(/^E-/, 'E');
  const m = /^E(\d{3,4})([A-Z]?)(?:\(?([IVX]+)\)?)?$/.exec(k);
  if (!m) return undefined;
  const zaklad = `E${m[1]}${m[2].toLowerCase()}`;
  const presne = m[3] ? ADITIVUM.get(`${zaklad}(${m[3].toLowerCase()})`) : ADITIVUM.get(zaklad);
  if (presne) return presne;
  const skup = PODLA_ZAKLADU.get(zaklad);
  return skup?.[0];
}

const OCR_CISLA: Record<string, string> = { O: '0', o: '0', l: '1', I: '1', S: '5', B: '8', Z: '2' };
/** Opravy typických OCR zámien v čísle: „E33O“ → „E330“. */
export function opravCislo(c: string): string {
  const hore = c.replace(/[OolISBZ]/g, (x) => OCR_CISLA[x]);
  return /^\d{3,4}$/.test(hore) ? hore : c;
}

const RE_E = /(?:^|[^A-Za-z0-9])[EeĚ][\s\-.]{0,2}([0-9OolISBZ]{3,4})\s*([a-z])?\b\s*(?:\(\s*([ivx]+)\s*\))?/;

/** Vyberie E-číslo z textu zložky: „E 330“, „E-330“, „E330i“, „(E150d)“. */
export function vytiahniE(text: string): { e: string; oprava: boolean } | undefined {
  const m = RE_E.exec(' ' + text);
  if (!m) return undefined;
  const cislo = opravCislo(m[1]);
  if (!/^\d{3,4}$/.test(cislo)) return undefined;
  const oprava = cislo !== m[1];
  let id = `E${cislo}`;
  const pis = m[2] && m[2] !== m[2].toUpperCase() ? m[2] : '';
  if (pis && /^[a-f]$/.test(pis)) id += pis;
  else if (pis && /^[ivx]+$/.test(pis)) id += `(${pis})`;
  if (m[3]) id += `(${m[3]})`;
  return { e: id, oprava };
}

interface NazovIdx { k: string; a: Aditivum }
const NAZOVY: NazovIdx[] = [];
for (const a of ADITIVA) for (const n of a.nazvy) { const k = kluc(n); if (k.length >= 4 && !/^e?\d/.test(k)) NAZOVY.push({ k, a }); }
const PODLA_NAZVU = new Map<string, Aditivum>();
for (const { k, a } of NAZOVY) if (!PODLA_NAZVU.has(k)) PODLA_NAZVU.set(k, a);

/** Zhoda podľa názvu: presná, potom s toleranciou preklepov. */
export function najdiPodlaNazvu(text: string, fuzzy = true): { a: Aditivum; fuzzy: boolean } | undefined {
  const k = kluc(text);
  if (k.length < 4) return undefined;
  const p = PODLA_NAZVU.get(k);
  if (p) return { a: p, fuzzy: false };
  if (!fuzzy) return undefined;
  const t = tolerancia(k.length);
  if (!t) return undefined;
  let najlepsi: { a: Aditivum; d: number } | undefined;
  for (const { k: n, a } of NAZOVY) {
    if (Math.abs(n.length - k.length) > t) continue;
    const d = levenshtein(k, n, t);
    if (d <= t && (!najlepsi || d < najlepsi.d)) najlepsi = { a, d };
  }
  return najlepsi ? { a: najlepsi.a, fuzzy: true } : undefined;
}
