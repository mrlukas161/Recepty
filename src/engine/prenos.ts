/**
 * Prenos stavu do druhého mobilu bez servera.
 * Stav sa zabalí do JSON obálky, skomprimuje (deflate-raw) a zakóduje base64url,
 * takže sa zmestí do odkazu `#/prenos/<dáta>` alebo do QR kódu. Všetko sú čisté funkcie
 * (okrem použitia CompressionStream, ktorý je v prehliadači aj v Node).
 *
 * Generickosť: prenáša sa KAŽDÝ kľúč stavu okrem vedome vylúčených (VYLUCENE). Kľúč, ktorý nemá
 * vlastnú politiku v POLITIKA, sa spracuje podľa tvaru dát (pole reťazcov → zjednotenie,
 * pole objektov → zjednotenie bez duplicít, objekt → zlúčenie po kľúčoch, inak prepis).
 * Test tests/prenos.test.ts zlyhá, ak pribudne kľúč stavu bez politiky alebo vylúčenia.
 */
import { PREDVOLENE } from './types';
import { ocistiVlastne, zlucVlastne, type VlastnyRecept } from './vlastne';

export const FORMAT = 'recepty-prenos';
export const VERZIA = 1;
/** Dĺžka odkazu, nad ktorú sa už QR nezmestí spoľahlivo (QR úroveň L ≈ 2953 B). */
export const MAX_QR_ZNAKOV = 2200;
const MAX_ROZBALENE = 4_000_000;

/** Kľúče stavu, ktoré sa vedome neprenášajú (kľúč → dôvod). */
export const VYLUCENE: Record<string, string> = {
  verzia: 'Verzia tvaru uloženého stavu patrí tejto appke; po použití prenosu ju nastaví store.zluc (migrácia starších tvarov).',
};
/** Údaje mimo stavu `recepty-v1`, ktoré sa neprenášajú (informácia pre používateľa). */
export const MIMO_STAVU = [
  'Prenáša sa aj skener (potraviny aj kozmetika): história skenov a vlastné skeny celé, ostatné uložené výrobky len ako kódy (druhý mobil si ich dotiahne z balíka alebo z Open Food Facts, keď bude online). Fotky sa neprenášajú.',
];

export type Rezim = 'zlucit' | 'nahradit';
type Stav = Record<string, unknown>;

export class PrenosChyba extends Error {}

/* ---------- politika podľa kľúča ---------- */
type Druh = 'mnozina' | 'zoznam' | 'mapa' | 'mapaPoli' | 'objekt' | 'vlastne';
interface Politika { popis: string; druh: Druh; over(v: unknown): unknown | undefined; zjednot?: string[] }

const jeObjekt = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const NEBEZPECNE = new Set(['__proto__', 'constructor', 'prototype']);
const retazce = (v: unknown): string[] | undefined => Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === 'string' && x.length < 200))) : undefined;
function mapa<V>(v: unknown, ok: (x: unknown) => V | undefined): Record<string, V> | undefined {
  if (!jeObjekt(v)) return undefined;
  const o: Record<string, V> = {};
  for (const [k, x] of Object.entries(v)) { if (NEBEZPECNE.has(k) || k.length > 100) continue; const c = ok(x); if (c !== undefined) o[k] = c; }
  return o;
}
function nastaveniaOver(vstup: unknown): unknown | undefined {
  if (!jeObjekt(vstup)) return undefined;
  let v = vstup;
  const o: Record<string, unknown> = {};
  if (typeof v.maxCas === 'number' && v.casTyzden === undefined) v = { ...v, casTyzden: v.maxCas }; // starší tvar
  const P = PREDVOLENE as unknown as Record<string, unknown>;
  for (const k of Object.keys(P)) {
    const x = v[k]; const p = P[k];
    if (x === undefined) continue;
    if (k === 'obmedzenia') { const m = mapa(x, (y) => (y === 'bez' || y === 'obmedzit' || y === 'vylucit' ? y : undefined)); if (m) o[k] = m; }
    else if (k === 'maxTyzdenne') { const m = mapa(x, (y) => (typeof y === 'number' && Number.isFinite(y) && y >= 0 && y <= 99 ? y : undefined)); if (m) o[k] = m; }
    else if (k === 'deti') { if (Array.isArray(x)) o[k] = x.filter((y): y is number => typeof y === 'number' && Number.isFinite(y) && y >= 0 && y <= 17).slice(0, 20); }
    else if (k === 'tema') { if (x === 'auto' || x === 'svetla' || x === 'tmava') o[k] = x; }
    else if (Array.isArray(p)) { const r = retazce(x); if (r) o[k] = r; }
    else if (typeof p === 'number') { if (typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 1000) o[k] = x; }
    else if (typeof p === 'boolean') { if (typeof x === 'boolean') o[k] = x; }
  }
  return o;
}

export const POLITIKA: Record<string, Politika> = {
  nastavenia: { popis: 'Nastavenia', druh: 'objekt', over: nastaveniaOver, zjednot: ['alergie', 'nejem', 'mamDoma'] },
  oblubene: { popis: 'Obľúbené recepty', druh: 'mnozina', over: retazce },
  hodnotenie: { popis: 'Hodnotenia receptov', druh: 'mapa', over: (v) => mapa(v, (x) => (x === 1 || x === -1 ? x : undefined)) },
  historia: {
    popis: 'História varenia', druh: 'zoznam',
    over: (v) => Array.isArray(v) ? v.filter((x) => jeObjekt(x) && typeof x.recept === 'string' && typeof x.den === 'string').map((x) => ({ recept: (x as { recept: string }).recept, den: (x as { den: string }).den })).slice(0, 5000) : undefined,
  },
  jedalnicek: { popis: 'Jedálniček', druh: 'mapa', over: (v) => mapa(v, (x) => (x === null || typeof x === 'string' ? x : undefined)) },
  zamknute: { popis: 'Zamknuté jedlá v jedálničku', druh: 'mnozina', over: retazce },
  nakupOdskrtnute: { popis: 'Odškrtnuté položky nákupu', druh: 'mnozina', over: retazce },
  nakupVlastne: { popis: 'Vlastné položky nákupu', druh: 'mnozina', over: retazce },
  nakupRecepty: { popis: 'Recepty v nákupe', druh: 'mnozina', over: retazce },
  dnes: { popis: 'Prijaté recepty dňa', druh: 'mapaPoli', over: (v) => mapa(v, retazce) },
  pridaneVolitelne: { popis: 'Pridané voliteľné suroviny', druh: 'mapaPoli', over: (v) => mapa(v, retazce) },
  vlastne: { popis: 'Vlastné recepty', druh: 'vlastne', over: (v) => (Array.isArray(v) ? ocistiVlastne(v) : undefined) },
};

/** Politika pre kľúč; neznámy kľúč sa spracuje podľa tvaru dát. */
function politika(kluc: string, hodnota: unknown): Politika {
  const p = POLITIKA[kluc];
  if (p) return p;
  const popis = kluc;
  if (Array.isArray(hodnota)) return hodnota.every((x) => typeof x === 'string') ? { popis, druh: 'mnozina', over: retazce } : { popis, druh: 'zoznam', over: (v) => (Array.isArray(v) ? v : undefined) };
  if (jeObjekt(hodnota)) return { popis, druh: 'mapa', over: (v) => mapa(v, (x) => x) };
  return { popis, druh: 'objekt', over: (v) => v };
}

/* ---------- zlučovanie a rozdiely ---------- */
const j = (x: unknown) => JSON.stringify(x);
function zlucKluc(p: Politika, lok: unknown, pri: unknown): unknown {
  switch (p.druh) {
    case 'mnozina': return Array.from(new Set([...(Array.isArray(lok) ? lok : []), ...(Array.isArray(pri) ? pri : [])]));
    case 'zoznam': { const vid = new Set<string>(); return [...(Array.isArray(lok) ? lok : []), ...(Array.isArray(pri) ? pri : [])].filter((x) => { const k = j(x); if (vid.has(k)) return false; vid.add(k); return true; }); }
    case 'mapa': return { ...(jeObjekt(lok) ? lok : {}), ...(jeObjekt(pri) ? pri : {}) };
    case 'mapaPoli': {
      const o: Record<string, unknown> = { ...(jeObjekt(lok) ? lok : {}) };
      for (const [k, v] of Object.entries(jeObjekt(pri) ? pri : {})) o[k] = Array.from(new Set([...(Array.isArray(o[k]) ? (o[k] as unknown[]) : []), ...(Array.isArray(v) ? v : [])]));
      return o;
    }
    case 'vlastne': return zlucVlastne(Array.isArray(lok) ? (lok as VlastnyRecept[]) : [], Array.isArray(pri) ? (pri as VlastnyRecept[]) : []).recepty;
    case 'objekt': {
      if (!jeObjekt(pri)) return pri ?? lok;
      const o: Record<string, unknown> = { ...(jeObjekt(lok) ? lok : {}), ...pri };
      for (const k of p.zjednot ?? []) { const a = jeObjekt(lok) ? lok[k] : undefined; if (Array.isArray(a) && Array.isArray(pri[k])) o[k] = Array.from(new Set([...a, ...(pri[k] as unknown[])])); }
      return o;
    }
  }
}
const pocet = (p: Politika, v: unknown): number => {
  if (p.druh === 'mapaPoli') return jeObjekt(v) ? Object.values(v).reduce<number>((s, a) => s + (Array.isArray(a) ? a.length : 0), 0) : 0;
  if (Array.isArray(v)) return v.length;
  if (jeObjekt(v)) return Object.keys(v).length;
  return v === undefined || v === null ? 0 : 1;
};
/** Položky: nové (len v prichádzajúcich), rovnaké, konflikt (rovnaký kľúč, iná hodnota), len lokálne. */
function porovnaj(p: Politika, lok: unknown, pri: unknown) {
  let nove = 0; let rovnake = 0; let konflikty = 0; let lenLokalne = 0;
  if (p.druh === 'mnozina' || p.druh === 'zoznam') {
    const L = new Set((Array.isArray(lok) ? lok : []).map(j)); const R = new Set((Array.isArray(pri) ? pri : []).map(j));
    for (const k of R) { if (L.has(k)) rovnake++; else nove++; }
    for (const k of L) if (!R.has(k)) lenLokalne++;
  } else if (p.druh === 'vlastne') {
    // zhoda podľa id; pri rozdiele vyhrá novší `upravene` (ako zlucVlastne)
    const L = new Map((Array.isArray(lok) ? (lok as VlastnyRecept[]) : []).map((x) => [x.id, x])); const R = new Map((Array.isArray(pri) ? (pri as VlastnyRecept[]) : []).map((x) => [x.id, x]));
    for (const [id, r] of R) { const l = L.get(id); if (!l) nove++; else if (j(l) === j(r)) rovnake++; else if (Date.parse(r.upravene) > Date.parse(l.upravene)) konflikty++; else rovnake++; }
    for (const id of L.keys()) if (!R.has(id)) lenLokalne++;
  } else if (p.druh === 'mapaPoli') {
    const L = jeObjekt(lok) ? lok : {}; const R = jeObjekt(pri) ? pri : {};
    for (const [k, a] of Object.entries(R)) for (const x of Array.isArray(a) ? a : []) { if (Array.isArray(L[k]) && (L[k] as unknown[]).includes(x)) rovnake++; else nove++; }
    for (const [k, a] of Object.entries(L)) for (const x of Array.isArray(a) ? a : []) if (!(Array.isArray(R[k]) && (R[k] as unknown[]).includes(x))) lenLokalne++;
  } else {
    const L = jeObjekt(lok) ? lok : {}; const R = jeObjekt(pri) ? pri : {};
    for (const [k, v] of Object.entries(R)) { if (!(k in L)) nove++; else if (j(L[k]) === j(v)) rovnake++; else konflikty++; }
    for (const k of Object.keys(L)) if (!(k in R)) lenLokalne++;
  }
  return { nove, rovnake, konflikty, lenLokalne };
}

/* ---------- balík ---------- */
/** `x` = dodatočné údaje mimo stavu `recepty-v1` (skener); starý prenos ich nemá a stará appka ich ignoruje. */
export interface Balik { v: number; c: number; s: Stav; x?: Record<string, unknown> }

export function zostavBalik(stav: Stav, cas = Date.now(), x?: Record<string, unknown>): Balik {
  const s: Stav = {};
  for (const [k, v] of Object.entries(stav)) if (!(k in VYLUCENE) && v !== undefined) s[k] = v;
  return x && Object.keys(x).length ? { v: VERZIA, c: cas, s, x } : { v: VERZIA, c: cas, s };
}

/** Skontroluje a vyčistí obálku. Poškodené kľúče vyhodí s varovaním; pri zlej obálke hodí PrenosChyba. */
export function over(x: unknown): { balik: Balik; varovania: string[] } {
  if (!jeObjekt(x) || x.a !== FORMAT) throw new PrenosChyba('Toto nie je prenos z appky Recepty.');
  if (typeof x.v !== 'number' || !Number.isInteger(x.v) || x.v < 1) throw new PrenosChyba('Prenos nemá platnú verziu formátu.');
  if (x.v > VERZIA) throw new PrenosChyba('Prenos je z novšej verzie appky. Najprv aktualizuj appku v tomto mobile (Viac → Nastavenia → O appke).');
  if (!jeObjekt(x.s)) throw new PrenosChyba('Prenos neobsahuje údaje.');
  const s: Stav = {}; const varovania: string[] = [];
  for (const [k, v] of Object.entries(x.s)) {
    if (NEBEZPECNE.has(k) || k in VYLUCENE) continue;
    const c = politika(k, v).over(v);
    if (c === undefined) varovania.push(`Časť „${POLITIKA[k]?.popis ?? k}“ je poškodená a preskočila sa.`); else s[k] = c;
  }
  const dod: Record<string, unknown> = {};
  if (jeObjekt(x.x)) for (const [k, v] of Object.entries(x.x)) if (!NEBEZPECNE.has(k) && k.length < 20) dod[k] = v;
  return { balik: { v: x.v, c: typeof x.c === 'number' ? x.c : 0, s, ...(Object.keys(dod).length ? { x: dod } : {}) }, varovania };
}

/* ---------- kódovanie ---------- */
const enc = new TextEncoder(); const dec = new TextDecoder('utf-8', { fatal: true });
export const mozeKomprimovat = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

async function prechod(data: Uint8Array, stream: CompressionStream | DecompressionStream, limit = Infinity): Promise<Uint8Array> {
  const w = stream.writable.getWriter();
  const zapis = w.write(data as BufferSource).then(() => w.close());
  zapis.catch(() => {});
  const r = stream.readable.getReader(); const kusy: Uint8Array[] = []; let n = 0;
  for (;;) {
    const { done, value } = await r.read();
    if (done) break;
    n += value.length;
    if (n > limit) { r.cancel().catch(() => {}); throw new PrenosChyba('Prenos je neprimerane veľký.'); }
    kusy.push(value);
  }
  await zapis;
  const out = new Uint8Array(n); let o = 0;
  for (const k of kusy) { out.set(k, o); o += k.length; }
  return out;
}
export function naBase64url(b: Uint8Array): string {
  let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function zBase64url(t: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(t)) throw new PrenosChyba('Údaje v odkaze sú poškodené.');
  const p = t.replace(/-/g, '+').replace(/_/g, '/'); const s = atob(p + '='.repeat((4 - (p.length % 4)) % 4));
  const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
}

/** Zabalí stav do textu (prvý znak: Z = deflate-raw, J = nekomprimovaný JSON). */
export async function zabal(stav: Stav, cas?: number, x?: Record<string, unknown>): Promise<string> {
  const json = enc.encode(JSON.stringify({ a: FORMAT, ...zostavBalik(stav, cas, x) }));
  if (mozeKomprimovat()) return 'Z' + naBase64url(await prechod(json, new CompressionStream('deflate-raw')));
  return 'J' + naBase64url(json);
}

/** Prenos ako súbor JSON (bez limitu QR; otvorí sa v druhom mobile cez „Súbor alebo fotka QR“). */
export function zabalJson(stav: Stav, cas?: number, x?: Record<string, unknown>): string {
  return JSON.stringify({ a: FORMAT, ...zostavBalik(stav, cas, x) });
}

/** Rozbalí text z odkazu/QR/súboru (komprimovaný text alebo súbor JSON). Pri akejkoľvek chybe hodí PrenosChyba. */
export async function rozbal(dataText: string): Promise<{ balik: Balik; varovania: string[] }> {
  const t = dataText.trim();
  if (t.length < 2) throw new PrenosChyba('V odkaze nie sú žiadne údaje.');
  if (t[0] === '{') {
    if (t.length > MAX_ROZBALENE) throw new PrenosChyba('Prenos je neprimerane veľký.');
    try { return over(JSON.parse(t)); } catch (e) {
      if (e instanceof PrenosChyba) throw e;
      throw new PrenosChyba('Súbor je poškodený alebo neúplný. Skús prenos vytvoriť znova.');
    }
  }
  try {
    const bin = zBase64url(t.slice(1));
    let json: Uint8Array;
    if (t[0] === 'Z') {
      if (typeof DecompressionStream === 'undefined') throw new PrenosChyba('Tento prehliadač nevie rozbaliť prenos. Skús novší Chrome alebo Safari.');
      json = await prechod(bin, new DecompressionStream('deflate-raw'), MAX_ROZBALENE);
    } else if (t[0] === 'J') json = bin;
    else throw new PrenosChyba('Neznámy formát prenosu.');
    if (json.length > MAX_ROZBALENE) throw new PrenosChyba('Prenos je neprimerane veľký.');
    return over(JSON.parse(dec.decode(json)));
  } catch (e) {
    if (e instanceof PrenosChyba) throw e;
    throw new PrenosChyba('Údaje sú poškodené alebo neúplné (odkaz sa mohol skrátiť pri kopírovaní). Skús prenos vytvoriť znova.');
  }
}

/** Z odkazu, textu súboru alebo QR vytiahne samotné dáta. */
export function vytiahniDataText(vstup: string): string | null {
  const t = vstup.trim();
  const m = t.match(/#\/prenos\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  if (t[0] === '{' && t.includes(`"${FORMAT}"`)) return t;
  return /^[ZJ][A-Za-z0-9_-]{8,}$/.test(t) ? t : null;
}
export const odkazZDat = (dataText: string, zaklad: string) => `${zaklad.split('#')[0]}#/prenos/${dataText}`;
export const zmestiSaDoQr = (odkaz: string) => odkaz.length <= MAX_QR_ZNAKOV;

/* ---------- náhľad a použitie ---------- */
export interface RozdielKluca { kluc: string; popis: string; lokalne: number; prichadzajuce: number; nove: number; rovnake: number; konflikty: number; lenLokalne: number; vysledokZlucit: number }
export interface Rozdiel { kluce: RozdielKluca[]; ignorovane: string[] }

/** Čo sa stane s lokálnym stavom. Kľúče, ktoré lokálny stav nepozná, sa ignorujú. */
export function rozdiel(lokalny: Stav, balik: Balik): Rozdiel {
  const kluce: RozdielKluca[] = []; const ignorovane: string[] = [];
  for (const [k, pri] of Object.entries(balik.s)) {
    if (!(k in lokalny)) { ignorovane.push(k); continue; }
    const p = politika(k, pri);
    kluce.push({ kluc: k, popis: p.popis, lokalne: pocet(p, lokalny[k]), prichadzajuce: pocet(p, pri), ...porovnaj(p, lokalny[k], pri), vysledokZlucit: pocet(p, zlucKluc(p, lokalny[k], pri)) });
  }
  return { kluce, ignorovane };
}

/** Zlúčiť = lokálne + prichádzajúce (pri konflikte vyhrá prichádzajúce); nahradiť = prichádzajúce kľúče prepíšu lokálne. Kľúče mimo balíka ostávajú. */
export function pouzi(lokalny: Stav, balik: Balik, rezim: Rezim): Stav {
  const out: Stav = { ...lokalny };
  for (const [k, pri] of Object.entries(balik.s)) {
    if (!(k in lokalny)) continue;
    out[k] = rezim === 'nahradit' ? (k === 'nastavenia' ? { ...(lokalny[k] as object), ...(pri as object) } : pri) : zlucKluc(politika(k, pri), lokalny[k], pri);
  }
  return out;
}
