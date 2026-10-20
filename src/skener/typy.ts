import type { Alergen } from '../data/types';

export type Stupen = 'bez-vyhrad' | 'v-poriadku' | 'obmedzit' | 'vyhnut-sa';
export const STUPEN_TEXT: Record<Stupen, string> = {
  'bez-vyhrad': 'Bez výhrad', 'v-poriadku': 'V poriadku', obmedzit: 'Obmedziť', 'vyhnut-sa': 'Vyhnúť sa (najmä deti)',
};
export const STUPEN_IKONA: Record<Stupen, string> = { 'bez-vyhrad': '●●●●', 'v-poriadku': '●●●○', obmedzit: '●●○○', 'vyhnut-sa': '●○○○' };

export type UrovenDokazov = 'silné' | 'stredné' | 'slabé' | 'prax' | 'odhad';

/** Hodnotenie látky alebo zložky – vždy s dôvodom a zdrojom. */
export interface Hodnotenie {
  stupen: Stupen;
  dovod: string;
  /** true = ide o preventívnu obavu, nie o preukázaný účinok pri bežnom príjme */
  preventivne?: boolean;
  /** hodnotenie sme nenapísali pre túto látku, ide o predvolenú hodnotu podľa funkcie */
  predvolene?: boolean;
  /** id zdrojov v src/data/zdroje/skener.json */
  zdroje: string[];
  uroven: UrovenDokazov;
  /** prísnejšie hodnotenie, ak v domácnosti sú malé deti */
  deti?: Stupen;
}

export type TypZlozky = 'aditivum' | 'zlozka' | 'neznama';

/** Príznaky, podľa ktorých sa skladá skóre a osobné upozornenia. */
export type PriznakZlozky =
  | 'cukor' | 'sirup' | 'rafinovana-muka' | 'celozrnne' | 'stuzeny-tuk' | 'palmovy-tuk' | 'sol' | 'aroma'
  | 'upraveny-skrob' | 'izolat' | 'udenina' | 'intenzivne-sladidlo' | 'polyol' | 'ultra' | 'pozitivum'
  | 'olej' | 'maso-oddelene' | 'hydrolyzat' | 'sladidlo-prirodne' | 'lepok';

export interface Zlozka {
  /** text, ako stál v zložení */
  povodny: string;
  /** zhodnotený názov (z databázy) alebo povodny */
  nazov: string;
  typ: TypZlozky;
  /** poradie najvyššej zložky (0 = prvá, množstvo klesá) */
  poradie: number;
  hlbka: number;
  rodic?: string;
  percento?: number;
  /** E-číslo ak ide o prídavnú látku */
  e?: string;
  funkcia?: string;
  id?: string;
  priznaky: PriznakZlozky[];
  hodnotenie?: Hodnotenie;
  /** zhoda bola nepresná (OCR preklep) – ukáž používateľovi na kontrolu */
  fuzzy?: boolean;
  /** len pri typ 'neznama': text vyzerá ako nezmysel z OCR */
  podozrivy?: boolean;
  alergeny: Alergen[];
  /** zložka pochádza z tagov databázy, nie z textu */
  zTagov?: boolean;
}

/** Doplnkové údaje z databázy (OFF tagy) – skladajú sa s rozborom textu. */
export interface Doplnok {
  /** E-čísla z additives_tags (napr. E322, E322i) */
  e?: string[];
  alergeny?: Alergen[];
  stopy?: Alergen[];
  /** ingredients_tags / analysis obsahujú en:added-sugar */
  cukor?: boolean;
  /** en:palm-oil */
  palma?: boolean;
  /** vybrané tagy databázy (ingredients_tags, labels_tags) potrebné na odhalenie rizikových kombinácií */
  tagy?: string[];
}

export interface Spolahlivost {
  nizka: boolean;
  nerozpoznane: number;
  podiel: number;
  /** názvy nerozpoznaných zložiek (na zobrazenie) */
  zoznam: string[];
  dovod?: string;
}

export interface Rozbor {
  zlozky: Zlozka[];
  alergeny: Alergen[];
  stopy: Alergen[];
  stopyText: string;
  pocetZloziek: number;
  text: string;
  spolahlivost: Spolahlivost;
}

export interface Vyziva {
  kcal?: number; tuky?: number; nasyt?: number; sach?: number; cukry?: number; vlak?: number; bielk?: number; sol?: number;
}
