/** Prenos údajov skenera do druhého mobilu (história skenov, vlastné skeny, kódy uložených výrobkov).
 *  Vlastné skeny idú celé; ostatné uložené výrobky len ako kódy – druhý mobil si ich dotiahne z balíka alebo Open Food Facts.
 *  Čisté funkcie (zlúčenie, kontrola) sú oddelené od zápisu do localStorage, aby sa dali testovať. */
import { nacitajHistoriu, ulozHistoriu, upravZaznam, type Zaznam } from './historia';
import { nacitajUlozisko } from './ulozisko';
import { vlastneSkenyPotravin, vlastneSkenyKozmetiky, overVlastny, zlucVlastne, type VlastnySken } from './vlastne-skeny';
import { nacitajHistoriu as nacitajHistoriuK, ulozHistoriuK, overZaznamK, nacitajObfUlozisko, type ZaznamK } from '../kozmetika/ulozisko';
import { nacitajOff } from './off';
import { nacitajObf } from '../kozmetika/obf';
import type { Rezim, RozdielKluca } from '../engine/prenos';

export interface SkenerPrenos { h: Zaznam[]; hk: ZaznamK[]; vs: VlastnySken[]; vk: VlastnySken[]; u: string[]; uk: string[] }

export const PRAZDNY_SKENER = (): SkenerPrenos => ({ h: [], hk: [], vs: [], vk: [], u: [], uk: [] });
const MAX_H = 200; const MAX_VLASTNE = 500; const MAX_KODY = 300;

/** Aktuálny stav skenera v tomto mobile. */
export function zoberSkener(): SkenerPrenos {
  const vlastne = new Set(vlastneSkenyPotravin.nacitaj().map((v) => v.kod));
  const vlastneK = new Set(vlastneSkenyKozmetiky.nacitaj().map((v) => v.kod));
  return {
    h: nacitajHistoriu(), hk: nacitajHistoriuK(),
    vs: vlastneSkenyPotravin.nacitaj(), vk: vlastneSkenyKozmetiky.nacitaj(),
    u: nacitajUlozisko().filter((x) => x.zdroj === 'sken' && !vlastne.has(x.kod)).map((x) => x.kod),
    uk: nacitajObfUlozisko().filter((x) => !vlastneK.has(x.kod)).map((x) => x.kod),
  };
}
export const jePrazdny = (d: SkenerPrenos) => Object.values(d).every((a) => a.length === 0);
export const pocetSkener = (d: SkenerPrenos) => Object.values(d).reduce((s, a) => s + a.length, 0);

const kody = (x: unknown): string[] => (Array.isArray(x) ? Array.from(new Set(x.filter((k): k is string => typeof k === 'string' && /^\d{8,14}$/.test(k)))).slice(0, MAX_KODY) : []);
const pole = <T>(x: unknown, ok: (v: unknown) => T | null, max: number): T[] => (Array.isArray(x) ? x.slice(0, max).map(ok).filter((v): v is T => v !== null) : []);

/** Skontroluje a vyčistí cudzie údaje skenera (z odkazu/QR/súboru). Neplatné časti sa vyhodia. */
export function overSkener(x: unknown): SkenerPrenos | null {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return null;
  const o = x as Record<string, unknown>;
  const d: SkenerPrenos = {
    h: pole(o.h, upravZaznam, MAX_H), hk: pole(o.hk, overZaznamK, MAX_H),
    vs: pole(o.vs, overVlastny, MAX_VLASTNE), vk: pole(o.vk, overVlastny, MAX_VLASTNE),
    u: kody(o.u), uk: kody(o.uk),
  };
  return jePrazdny(d) ? null : d;
}

const poId = <T extends { id: string; cas: string }>(a: T[], b: T[]): T[] => {
  const m = new Map<string, T>();
  for (const z of [...a, ...b]) if (!m.has(z.id)) m.set(z.id, z);
  return [...m.values()].sort((x, y) => Date.parse(y.cas) - Date.parse(x.cas));
};

/** Výsledok po použití prenosu. Zlúčiť = lokálne + prenos (pri rovnakom kóde vlastného skenu vyhrá novší);
 *  nahradiť = časti, ktoré prenos obsahuje, prepíšu lokálne (história, vlastné skeny). Kódy sa vždy zjednotia. */
export function zlucSkener(lok: SkenerPrenos, pri: SkenerPrenos, rezim: Rezim): SkenerPrenos {
  const nahr = rezim === 'nahradit';
  return {
    h: nahr && pri.h.length ? pri.h : poId(lok.h, pri.h),
    hk: nahr && pri.hk.length ? pri.hk : poId(lok.hk, pri.hk),
    vs: nahr && pri.vs.length ? pri.vs : zlucVlastne(lok.vs, pri.vs),
    vk: nahr && pri.vk.length ? pri.vk : zlucVlastne(lok.vk, pri.vk),
    u: Array.from(new Set([...lok.u, ...pri.u])), uk: Array.from(new Set([...lok.uk, ...pri.uk])),
  };
}

const SKUPINY: [keyof SkenerPrenos, string][] = [
  ['h', 'História skenov (potraviny)'], ['hk', 'História skenov (kozmetika)'],
  ['vs', 'Vlastné skeny (potraviny)'], ['vk', 'Vlastné skeny (kozmetika)'],
  ['u', 'Uložené výrobky – kódy (potraviny)'], ['uk', 'Uložené výrobky – kódy (kozmetika)'],
];
const kluc = (k: keyof SkenerPrenos, v: unknown): string => (k === 'u' || k === 'uk' ? (v as string) : k === 'vs' || k === 'vk' ? (v as VlastnySken).kod : (v as Zaznam).id);

/** Riadky náhľadu (rovnaký tvar ako pri ostatných údajoch prenosu). */
export function rozdielSkener(lok: SkenerPrenos, pri: SkenerPrenos): RozdielKluca[] {
  const out: RozdielKluca[] = [];
  for (const [k, popis] of SKUPINY) {
    if (!pri[k].length) continue;
    const L = new Map<string, unknown>((lok[k] as unknown[]).map((v) => [kluc(k, v), v]));
    let nove = 0; let rovnake = 0; let konflikty = 0;
    for (const v of pri[k] as unknown[]) {
      const l = L.get(kluc(k, v));
      if (l === undefined) nove++;
      else if ((k === 'vs' || k === 'vk') && JSON.stringify(l) !== JSON.stringify(v) && Date.parse((v as VlastnySken).ulozene) > Date.parse((l as VlastnySken).ulozene)) konflikty++;
      else rovnake++;
    }
    const P = new Set((pri[k] as unknown[]).map((v) => kluc(k, v)));
    const lenLokalne = [...L.keys()].filter((id) => !P.has(id)).length;
    out.push({ kluc: `skener:${k}`, popis, lokalne: lok[k].length, prichadzajuce: pri[k].length, nove, rovnake, konflikty, lenLokalne, vysledokZlucit: lok[k].length + nove });
  }
  return out;
}

/* ---------- zápis do úložísk ---------- */
const KLUC_CAKAJUCE = 'recepty-skener-cakajuce-v1';
export const KLUC_ZALOHA_SKENER = 'recepty-skener-zaloha-v1';
interface Cakajuce { f: string[]; k: string[] }
const nacitajCakajuce = (): Cakajuce => {
  try { const x = JSON.parse(localStorage.getItem(KLUC_CAKAJUCE) ?? '{}'); return { f: kody(x.f), k: kody(x.k) }; } catch { return { f: [], k: [] }; }
};
const zapisCakajuce = (c: Cakajuce) => { try { localStorage.setItem(KLUC_CAKAJUCE, JSON.stringify(c)); } catch { /* nič */ } };

/** Zapíše výsledok do úložísk. Kódy výrobkov, ktoré tu ešte nie sú, sa pridajú do zoznamu na dotiahnutie. */
export function zapisSkener(d: SkenerPrenos): void {
  const dnes = zoberSkener();
  ulozHistoriu(d.h);
  ulozHistoriuK(d.hk);
  vlastneSkenyPotravin.nahrad(d.vs);
  vlastneSkenyKozmetiky.nahrad(d.vk);
  const mamF = new Set([...dnes.u, ...d.vs.map((v) => v.kod)]); const mamK = new Set([...dnes.uk, ...d.vk.map((v) => v.kod)]);
  const c = nacitajCakajuce();
  zapisCakajuce({ f: kody([...c.f, ...d.u.filter((k) => !mamF.has(k))]), k: kody([...c.k, ...d.uk.filter((k) => !mamK.has(k))]) });
}

export function pouziSkener(pri: SkenerPrenos, rezim: Rezim): void {
  zapisSkener(zlucSkener(zoberSkener(), pri, rezim));
}

export function zalohujSkener(): void {
  try { localStorage.setItem(KLUC_ZALOHA_SKENER, JSON.stringify(zoberSkener())); } catch { /* bez zálohy */ }
}
export function zrusZalohuSkenera(): void { try { localStorage.removeItem(KLUC_ZALOHA_SKENER); } catch { /* nič */ } }
/** Vráti skener do stavu pred prenosom (ak záloha existuje). */
export function vratSkener(): boolean {
  try {
    const z = localStorage.getItem(KLUC_ZALOHA_SKENER);
    if (!z) return false;
    const d = overSkener(JSON.parse(z)) ?? PRAZDNY_SKENER();
    ulozHistoriu(d.h); ulozHistoriuK(d.hk); vlastneSkenyPotravin.nahrad(d.vs); vlastneSkenyKozmetiky.nahrad(d.vk);
    return true;
  } catch { return false; }
}

/** Dotiahne výrobky podľa kódov z prenosu (balík, Open Food Facts / Open Beauty Facts). Chyba siete = kód ostane na neskôr. */
export async function dotiahniCakajuce(max = 30): Promise<number> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  const c = nacitajCakajuce();
  if (!c.f.length && !c.k.length) return 0;
  let hotovo = 0; let n = 0;
  const zvysok: Cakajuce = { f: [], k: [] };
  for (const [zoznam, nacitaj, ciel] of [[c.f, nacitajOff, zvysok.f], [c.k, nacitajObf, zvysok.k]] as const) {
    for (const kod of zoznam) {
      if (n >= max) { ciel.push(kod); continue; }
      n++;
      try { await nacitaj(kod); hotovo++; } catch { ciel.push(kod); }
    }
  }
  zapisCakajuce(zvysok);
  return hotovo;
}
