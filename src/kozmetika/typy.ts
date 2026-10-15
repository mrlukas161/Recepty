/** Skener kozmetiky – typy. Hodnotíme PRÍTOMNOSŤ látky podľa INCI, nie dávku (koncentrácie na obale nie sú). */
export type Trieda = 'zakazana' | 'obmedzena' | 'alergen' | 'draziva' | 'konzervant' | 'uv' | 'mikroc' | 'siloxan' | 'vona' | 'farbivo' | 'ina';
export type Stupen = 'zakazana' | 'diskusia' | 'obmedzena' | 'pozor' | 'ok';
export type Os = 'citliva' | 'vona' | 'tehotenstvo' | 'deti';
export type Uroven = 'vyhladavanie' | 'odhad';

/** Záznam databázy (kompaktné kľúče kvôli veľkosti – generuje scripts/kozmetika-data.mjs). */
export interface Latka {
  id: string;
  /** INCI názov a synonymá */
  m: string[];
  /** funkcie (naše zhrnutie) */
  f: string[];
  t: Trieda;
  s: Stupen;
  /** dôvod / vysvetlenie */
  d: string;
  /** id zdrojov */
  z: string[];
  u: Uroven;
  /** limit (len overený) */
  l?: string;
  /** najvyššia povolená koncentrácia v % (len overená) */
  x?: number;
  /** osobné príznaky */
  o?: Os[];
}
export interface ZdrojKoz { n: string; url: string; u: Uroven }

export interface Polozka {
  surove: string;
  nazov: string;
  nano: boolean;
  /** 1-based poradie v zozname (zostupne podľa množstva len nad 1 %) */
  poradie: number;
  /** za „may contain“ / „+/-“ */
  moze: boolean;
  latka?: Latka;
  /** CI číslo farbiva (5 cifier) */
  ci?: string;
  zhoda: 'presna' | 'priblizna' | 'ziadna';
}
export interface Oprava { z: string; na: string }
export interface Parsovane { polozky: Polozka[]; moze: Polozka[]; opravy: Oprava[] }

export interface Nastavenia { citliva: boolean; vona: boolean; tehotenstvo: boolean; deti: boolean }
export const PREDVOLENE_NAST: Nastavenia = { citliva: false, vona: false, tehotenstvo: false, deti: false };
