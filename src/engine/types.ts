import type { Alergen, Typ } from '../data/types';

export type Kategoria = 'muka' | 'cukor' | 'udeniny' | 'vyprazane' | 'tazke';
export type Uroven = 'bez' | 'obmedzit' | 'vylucit';
export const KATEGORIE: { id: Kategoria; nazov: string; popis: string }[] = [
  { id: 'muka', nazov: 'Rafinovaná múka', popis: 'pečivo, halušky, cestoviny, palacinky z bielej múky' },
  { id: 'cukor', nazov: 'Cukor a sladké', popis: 'jedlá s viac ako ~8 g pridaného cukru na porciu' },
  { id: 'udeniny', nazov: 'Údeniny a spracované mäso', popis: 'šunka, saláma, klobása, párky, slanina' },
  { id: 'vyprazane', nazov: 'Vyprážané', popis: 'rezne, hranolky, vyprážané syry' },
  { id: 'tazke', nazov: 'Ťažké jedlá', popis: 'veľmi tučné alebo objemné jedlá' },
];

export interface Nastavenia {
  dospeli: number;
  deti: number[];                      // vek každého dieťaťa
  obmedzenia: Record<Kategoria, Uroven>;
  maxTyzdenne: Record<Kategoria, number>;
  alergie: Alergen[];
  nejem: string[];                     // id surovín
  diety: string[];
  casTyzden: number;                   // minúty (príprava+varenie) pre pracovný deň (po–pi)
  casVikend: number;                   // minúty pre víkend (so, ne)
  varimNa2Dni: boolean;                // večera sa uvarí dvojnásobne a na ďalší deň je z nej obed
  vybavenie: string[];
  tema: 'auto' | 'svetla' | 'tmava';
  jedla: Typ[];                        // aké jedlá plánovať
  mamDoma: string[];                   // id surovín
  vibracia: boolean;
  hotovo: boolean;                     // úvodné nastavenie dokončené/preskočené
}
export const PREDVOLENE: Nastavenia = {
  dospeli: 2, deti: [2, 4, 6],
  obmedzenia: { muka: 'obmedzit', cukor: 'obmedzit', udeniny: 'obmedzit', vyprazane: 'obmedzit', tazke: 'obmedzit' },
  maxTyzdenne: { muka: 3, cukor: 2, udeniny: 1, vyprazane: 1, tazke: 2 },
  alergie: [], nejem: [], diety: [], casTyzden: 45, casVikend: 90, varimNa2Dni: false,
  vybavenie: ['rura', 'panvica', 'hrniec', 'mixer'],
  tema: 'auto', jedla: ['ranajky', 'obed', 'vecera'], mamDoma: [], vibracia: true, hotovo: false,
};

/** Verzia tvaru uloženého stavu. 2 = casTyzden/casVikend/varimNa2Dni namiesto maxCas, pridaneVolitelne. */
export const VERZIA_STAVU = 2;

/** Limit času varenia pre deň (0 = po … 6 = ne). */
export const casNaDen = (n: Pick<Nastavenia, 'casTyzden' | 'casVikend'>, den: number): number => (den >= 5 ? n.casVikend : n.casTyzden);

export interface UlozenyStav {
  verzia: number;
  nastavenia: Nastavenia;
  oblubene: string[];
  hodnotenie: Record<string, 1 | -1>;
  historia: { recept: string; den: string }[];
  jedalnicek: Record<string, string | null>;   // kľúč `${deň0-6}:${typ}` -> id receptu
  zamknute: string[];
  nakupOdskrtnute: string[];
  nakupVlastne: string[];
  nakupRecepty: string[];
  dnes: Record<string, string[]>;               // dátum -> prijaté recepty dňa
  /** Obmedzované voliteľné suroviny, ktoré používateľ do receptu pridal: id receptu -> id surovín. */
  pridaneVolitelne: Record<string, string[]>;
}
