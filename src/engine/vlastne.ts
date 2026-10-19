/**
 * Vlastné recepty – čisté funkcie (bez prístupu k localStorage/DOM), vhodné aj na prenos medzi zariadeniami.
 *
 * Formát súboru (verzia 1):
 *   { "format": "recepty-vlastne", "verzia": 1, "vytvorene": ISO, "recepty": [VlastnyRecept, …] }
 * Importér je tolerantný: neznáme suroviny z databázy prevedie na voľný text, chybné recepty preskočí
 * a vráti o nich zoznam chýb. Súbor s novšou verziou formátu odmietne.
 */
import type { Recept, Surovina, SurovinaVRecepte, Typ } from '../data/types';
import { SUROVINA } from '../data';
import { vypocitajSkore, type Skore } from './score';
import { naGramy } from './units';

export const FORMAT_VLASTNE = 'recepty-vlastne';
export const VERZIA_FORMATU = 1;
export const TYPY: Typ[] = ['ranajky', 'desiata', 'obed', 'olovrant', 'vecera', 'polievka', 'dezert'];
export const JEDNOTKY = ['g', 'ml', 'ks', 'lyzica', 'lyzicka'] as const;
export const IKONA_TYPU: Record<Typ, string> = { ranajky: '🍳', obed: '🍲', vecera: '🥗', polievka: '🥣', desiata: '🍎', olovrant: '🥨', dezert: '🍰' };
export const TAGY_VLASTNE: { id: string; nazov: string }[] = [
  { id: 'detske', nazov: 'Detské' }, { id: 'rychle', nazov: 'Rýchle' }, { id: 'do-krabicky', nazov: 'Do krabičky' },
  { id: 'lacne', nazov: 'Lacné' }, { id: 'bezmasite', nazov: 'Bezmäsité' }, { id: 'bez-peciva', nazov: 'Bez pečiva' },
  { id: 'sladke', nazov: 'Sladké' }, { id: 'na-viac-dni', nazov: 'Na viac dní' },
];

/** Recept, ako sa ukladá a prenáša. Suroviny z databázy majú id; ostatné sú voľný text. */
export interface VlastnyRecept {
  id: string;                         // 'v-…'
  nazov: string;
  typ: Typ;
  casPripravy: number;                // minúty
  casVarenia: number;
  porcie: number;                     // počet dospelých porcií
  suroviny: SurovinaVRecepte[];       // z databázy; mnozstvo 0 = bez údajov o množstve
  volne: string[];                    // voľný text, napr. „2 hrste špenátu“
  postup: string[];
  tagy: string[];
  vytvorene: string;                  // ISO
  upravene: string;                   // ISO – podľa neho sa pri zlúčení vyberá novšia verzia
}
export interface SuborVlastne { format: typeof FORMAT_VLASTNE; verzia: number; vytvorene: string; recepty: VlastnyRecept[] }
export interface VysledokParse { ok: boolean; recepty: VlastnyRecept[]; chyby: string[] }

export function noveId(): string {
  return 'v-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
const ID_RE = /^v-[a-z0-9-]{1,40}$/;

// ---------- export / import / zlúčenie ----------

export function exportVlastne(recepty: VlastnyRecept[], teraz = new Date()): string {
  const s: SuborVlastne = { format: FORMAT_VLASTNE, verzia: VERZIA_FORMATU, vytvorene: teraz.toISOString(), recepty };
  return JSON.stringify(s, null, 2);
}

// eslint-disable-next-line no-control-regex
const RIADIACE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;
const txt = (x: unknown, max: number): string => (typeof x === 'string' ? x.replace(RIADIACE, '').trim().slice(0, max) : '');
const cislo = (x: unknown, lo: number, hi: number): number | null => (typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi ? x : null);
const jeIso = (x: unknown): string | null => (typeof x === 'string' && !Number.isNaN(Date.parse(x)) ? new Date(x).toISOString() : null);

/** Overí jeden recept z neznámeho vstupu. Vráti vyčistený recept alebo zoznam chýb. */
export function overRecept(x: unknown, db: Map<string, Surovina> = SUROVINA): { recept?: VlastnyRecept; chyby: string[] } {
  const chyby: string[] = [];
  if (!x || typeof x !== 'object' || Array.isArray(x)) return { chyby: ['recept nie je objekt'] };
  const o = x as Record<string, unknown>;
  const nazov = txt(o.nazov, 120);
  if (!nazov) chyby.push('chýba názov');
  const typ = TYPY.includes(o.typ as Typ) ? (o.typ as Typ) : null;
  if (!typ) chyby.push('neplatný typ jedla');
  const cp = cislo(o.casPripravy ?? 0, 0, 1440), cv = cislo(o.casVarenia ?? 0, 0, 1440), por = cislo(o.porcie ?? 2, 0.25, 100);
  if (cp === null || cv === null) chyby.push('neplatný čas');
  if (por === null) chyby.push('neplatný počet porcií');
  const suroviny: SurovinaVRecepte[] = [];
  const volne: string[] = [];
  if (Array.isArray(o.volne)) for (const v of o.volne.slice(0, 80)) { const t = txt(v, 160); if (t) volne.push(t); }
  if (o.suroviny !== undefined && !Array.isArray(o.suroviny)) chyby.push('suroviny nie sú zoznam');
  if (Array.isArray(o.suroviny)) {
    for (const s of o.suroviny.slice(0, 80)) {
      const so = s && typeof s === 'object' ? (s as Record<string, unknown>) : null;
      const id = so && typeof so.id === 'string' ? so.id : '';
      const mn = so ? cislo(so.mnozstvo ?? 0, 0, 100000) : null;
      const j = so && (JEDNOTKY as readonly string[]).includes(so.jednotka as string) ? (so.jednotka as SurovinaVRecepte['jednotka']) : 'g';
      if (!id || mn === null) { chyby.push('neplatná položka v surovinách'); continue; }
      if (!db.has(id)) { volne.push(txt(id.replace(/-/g, ' '), 160)); continue; } // neznáma surovina → voľný text
      suroviny.push({ id, mnozstvo: mn, jednotka: j });
    }
  }
  if (!chyby.length && !suroviny.length && !volne.length) chyby.push('recept nemá žiadne suroviny');
  const postup = Array.isArray(o.postup) ? o.postup.slice(0, 60).map((p) => txt(p, 1000)).filter(Boolean) : [];
  const tagy = Array.isArray(o.tagy) ? o.tagy.slice(0, 20).map((t) => txt(t, 30)).filter(Boolean) : [];
  if (chyby.length) return { chyby };
  const vytvorene = jeIso(o.vytvorene) ?? new Date().toISOString();
  const id = typeof o.id === 'string' && ID_RE.test(o.id) ? o.id : noveId();
  return { chyby, recept: { id, nazov, typ: typ!, casPripravy: cp!, casVarenia: cv!, porcie: por!, suroviny, volne, postup, tagy, vytvorene, upravene: jeIso(o.upravene) ?? vytvorene } };
}

/** Spracuje text JSON súboru. Nikdy nevyhodí výnimku. `ok` = súbor je použiteľný (a prešiel aspoň jeden recept, alebo je zoznam prázdny). */
export function parseVlastne(json: unknown, db: Map<string, Surovina> = SUROVINA): VysledokParse {
  let d: unknown = json;
  if (typeof json === 'string') {
    if (json.length > 5_000_000) return { ok: false, recepty: [], chyby: ['súbor je príliš veľký'] };
    try { d = JSON.parse(json); } catch { return { ok: false, recepty: [], chyby: ['súbor nie je platný JSON'] }; }
  }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { ok: false, recepty: [], chyby: ['súbor nemá očakávaný tvar'] };
  const o = d as Record<string, unknown>;
  if (o.format !== FORMAT_VLASTNE) return { ok: false, recepty: [], chyby: ['toto nie je export vlastných receptov (chýba format „recepty-vlastne“)'] };
  if (typeof o.verzia !== 'number' || !Number.isInteger(o.verzia) || o.verzia < 1) return { ok: false, recepty: [], chyby: ['chýba alebo je neplatná verzia formátu'] };
  if (o.verzia > VERZIA_FORMATU) return { ok: false, recepty: [], chyby: [`súbor je vo verzii ${o.verzia}; táto appka rozumie verzii ${VERZIA_FORMATU} – aktualizuj appku`] };
  if (!Array.isArray(o.recepty)) return { ok: false, recepty: [], chyby: ['chýba zoznam receptov'] };
  const recepty: VlastnyRecept[] = [];
  const chyby: string[] = [];
  const videne = new Set<string>();
  o.recepty.slice(0, 2000).forEach((r, i) => {
    const v = overRecept(r, db);
    if (!v.recept) { const n = r && typeof r === 'object' ? txt((r as Record<string, unknown>).nazov, 60) : ''; chyby.push(`recept ${i + 1}${n ? ` („${n}“)` : ''}: ${v.chyby.join(', ')}`); return; }
    if (videne.has(v.recept.id)) v.recept.id = noveId();
    videne.add(v.recept.id);
    recepty.push(v.recept);
  });
  return { ok: recepty.length > 0 || o.recepty.length === 0, recepty, chyby };
}

export interface VysledokZlucenia { recepty: VlastnyRecept[]; pridane: number; aktualizovane: number; nezmenene: number }
/** Zlúči prichádzajúce recepty do existujúcich podľa `id`; pri zhode vyhrá novší `upravene` (pri rovnosti ostáva existujúci). */
export function zlucVlastne(existujuce: VlastnyRecept[], prichadzajuce: VlastnyRecept[]): VysledokZlucenia {
  const out = existujuce.slice();
  let pridane = 0, aktualizovane = 0, nezmenene = 0;
  for (const p of prichadzajuce) {
    const k = out.findIndex((e) => e.id === p.id);
    if (k < 0) { out.push(p); pridane++; }
    else if (Date.parse(p.upravene) > Date.parse(out[k].upravene)) { out[k] = p; aktualizovane++; }
    else nezmenene++;
  }
  return { recepty: out, pridane, aktualizovane, nezmenene };
}

/** Pre uložený stav: vyčistí zoznam z localStorage (chybné položky zahodí). */
export function ocistiVlastne(x: unknown, db: Map<string, Surovina> = SUROVINA): VlastnyRecept[] {
  if (!Array.isArray(x)) return [];
  const out: VlastnyRecept[] = []; const videne = new Set<string>();
  for (const r of x) { const v = overRecept(r, db).recept; if (v && !videne.has(v.id)) { videne.add(v.id); out.push(v); } }
  return out;
}

// ---------- prevod na Recept a istota skóre ----------

/** Prevod na bežný `Recept`. Suroviny bez množstva idú medzi voľný text (nezapočítajú sa do skóre ani nákupu v gramoch). */
export function naRecept(v: VlastnyRecept, db: Map<string, Surovina> = SUROVINA): Recept {
  const sur = v.suroviny.filter((s) => s.mnozstvo > 0 && db.has(s.id));
  const bezMn = v.suroviny.filter((s) => !(s.mnozstvo > 0) && db.has(s.id)).map((s) => db.get(s.id)!.nazov);
  return {
    id: v.id, nazov: v.nazov, typ: v.typ, kuchyna: 'vlastný recept', casPripravy: v.casPripravy, casVarenia: v.casVarenia, narocnost: 2,
    porcie: v.porcie, suroviny: sur, postup: v.postup.length ? v.postup : ['Postup nie je zapísaný.'], tagy: v.tagy, vybavenie: [], upravy: [],
    ilustracia: IKONA_TYPU[v.typ], vlastny: true, volne: [...v.volne, ...bezMn],
  };
}

export function skoreVlastneho(v: VlastnyRecept, db: Map<string, Surovina> = SUROVINA): Skore {
  const r = naRecept(v, db);
  return vypocitajSkore(r, r.suroviny, db);
}

export interface Istota { podiel: number; uroven: 'vysoka' | 'stredna' | 'nizka' | 'ziadna'; text: string; neznamych: number }
/** Aká časť receptu (podľa odhadu hmotnosti) je v skóre skutočne započítaná. Odhad, nie meranie. */
export function istotaSkore(v: VlastnyRecept, db: Map<string, Surovina> = SUROVINA): Istota {
  let znama = 0, neznama = 0, nezn = 0;
  for (const s of v.suroviny) {
    const sv = db.get(s.id);
    if (sv && s.mnozstvo > 0) znama += naGramy(sv, s.mnozstvo, s.jednotka);
    else { neznama += 50; nezn++; }
  }
  for (const t of v.volne) {
    const r = rozborRiadku(t);
    neznama += r.jednotka === 'g' || r.jednotka === 'ml' ? Math.min(r.mnozstvo ?? 50, 2000) : 50;
    nezn++;
  }
  const spolu = znama + neznama;
  const podiel = spolu > 0 ? znama / spolu : 0;
  if (znama === 0) return { podiel: 0, uroven: 'ziadna', neznamych: nezn, text: 'Skóre sa nedá spoľahlivo určiť: žiadna surovina z databázy nemá zadané množstvo. Doplň suroviny z databázy aj s množstvom.' };
  const pr = Math.round(podiel * 100);
  if (nezn === 0) return { podiel, uroven: 'vysoka', neznamych: 0, text: 'Všetky suroviny sú z databázy aj s množstvom, skóre sa počíta rovnako ako pri ostatných receptoch (stále je to naša heuristika).' };
  const uroven = podiel >= 0.9 ? 'vysoka' : podiel >= 0.7 ? 'stredna' : 'nizka';
  const slovo = uroven === 'vysoka' ? 'Skóre je skoro úplné' : uroven === 'stredna' ? 'Skóre je len približné' : 'Skóre je len hrubý odhad';
  return { podiel, uroven, neznamych: nezn, text: `${slovo}: ${nezn} ${nezn === 1 ? 'surovina' : nezn < 5 ? 'suroviny' : 'surovín'} (voľný text alebo bez množstva) sa do skóre nezapočítalo, započítaných je približne ${pr} % receptu (odhad podľa hmotnosti).` };
}

// ---------- voľný text: rozbor a návrh priradenia ----------

const bezDiakritiky = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set(['so', 'na', 'do', 'po', 'pre', 'asi', 'cca', 'trochu', 'malo', 'velka', 'velky', 'velke', 'mala', 'maly', 'male', 'cerstvy', 'cerstva', 'cerstve', 'hrst', 'hrste', 'hrsti', 'kus', 'kusy', 'trocha', 'podla', 'chuti']);
const JED: Record<string, { j: SurovinaVRecepte['jednotka']; k: number }> = {
  g: { j: 'g', k: 1 }, gr: { j: 'g', k: 1 }, kg: { j: 'g', k: 1000 }, dkg: { j: 'g', k: 10 }, ml: { j: 'ml', k: 1 }, dl: { j: 'ml', k: 100 }, l: { j: 'ml', k: 1000 },
  ks: { j: 'ks', k: 1 }, pl: { j: 'lyzica', k: 1 }, lyzica: { j: 'lyzica', k: 1 }, lyzice: { j: 'lyzica', k: 1 }, lyzic: { j: 'lyzica', k: 1 },
  cl: { j: 'lyzicka', k: 1 }, lyzicka: { j: 'lyzicka', k: 1 }, lyzicky: { j: 'lyzicka', k: 1 }, lyzicek: { j: 'lyzicka', k: 1 },
};
export interface RozborRiadku { mnozstvo: number | null; jednotka: SurovinaVRecepte['jednotka'] | null; zvysok: string }
/** „2 PL olivového oleja“ → {2, lyzica, „olivového oleja“}; „hrsť špenátu“ → bez množstva. */
export function rozborRiadku(t: string): RozborRiadku {
  const m = t.trim().match(/^(\d+(?:[.,]\d+)?)\s*([\p{L}]+)?\.?\s*(.*)$/u);
  if (!m) return { mnozstvo: null, jednotka: null, zvysok: t.trim() };
  const n = parseFloat(m[1].replace(',', '.'));
  const u = m[2] ? JED[bezDiakritiky(m[2])] : undefined;
  if (u) return { mnozstvo: n * u.k, jednotka: u.j, zvysok: m[3].trim() };
  return { mnozstvo: n, jednotka: 'ks', zvysok: `${m[2] ?? ''} ${m[3]}`.trim() };
}
const tokeny = (s: string) => bezDiakritiky(s).split(/[^a-z]+/).filter((x) => x.length >= 3 && !STOP.has(x));
function zhoda(a: string, b: string): boolean {
  let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++;
  return k >= 3 && k >= Math.min(a.length, b.length) - 2;
}
/** Návrh surovín z databázy pre voľný text (najlepšie prvé). Je to len odhad zhody podľa názvu – používateľ ho potvrdzuje. */
export function navrhniSuroviny(text: string, db: Map<string, Surovina> = SUROVINA, max = 3): Surovina[] {
  const q = tokeny(rozborRiadku(text).zvysok);
  if (!q.length) return [];
  const out: { s: Surovina; sk: number }[] = [];
  for (const s of db.values()) {
    const n = tokeny(s.nazov);
    if (!n.length) continue;
    const zhodnute = n.filter((t) => q.some((x) => zhoda(x, t))).length;
    const pokryte = q.filter((x) => n.some((t) => zhoda(x, t))).length;
    if (!zhodnute || zhodnute / n.length < 0.5) continue;
    out.push({ s, sk: (zhodnute / n.length) * 2 + pokryte / q.length - n.length * 0.01 });
  }
  return out.sort((a, b) => b.sk - a.sk).slice(0, max).map((x) => x.s);
}
