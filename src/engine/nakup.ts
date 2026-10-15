import type { Recept, Surovina, Oddelenie } from '../data/types';
import { naGramy } from './units';
import { balenie, VAJCIA_V_BALENI } from './baleni';

export interface PolozkaNakupu {
  id: string; nazov: string; oddelenie: Oddelenie; gramy: number;
  /** Čo kúpiť (po zaokrúhlení na balenie). Prázdne pri položkách v skupine „Skontroluj“. */
  text: string;
  /** Koľko treba podľa receptov, ak sa líši od `text` (napr. „treba ~720 g“). */
  potreba?: string;
  skontroluj?: boolean;
}
export const SKONTROLUJ = 'skontroluj';
export const SKONTROLUJ_NAZOV = 'Skontroluj, či máš doma';
export const ODDELENIA: Record<Oddelenie, string> = {
  'ovocie-zelenina': 'Ovocie a zelenina', pecivo: 'Pečivo', 'maso-ryby': 'Mäso a ryby', udeniny: 'Údeniny',
  'mliecne-vajcia': 'Mliečne a vajcia', trvanlive: 'Trvanlivé', 'obilniny-muky': 'Obilniny a múky',
  'strukoviny-konzervy': 'Strukoviny a konzervy', koreniny: 'Koreniny', 'oleje-tuky': 'Oleje a tuky',
  'sladkosti-sladidla': 'Sladidlá a sladkosti', mrazene: 'Mrazené', napoje: 'Nápoje', ine: 'Iné',
};

/** Pod túto hranicu (v g) sa položka neráta do nákupu, len sa pripomenie „skontroluj, či máš doma“. */
export const PRAH_SKONTROLUJ_G = 10;
/** Koreniny a pod. ostávajú v „skontroluj“ aj nad prahom, kým je ich v týždni málo. */
const PRAH_KORENINY_G = 50;

/** Voda a ľad sa nenakupujú. */
export const jeVoda = (s: Pick<Surovina, 'id' | 'nazov'>) => s.id === 'voda' || s.id === 'lad' || /^(voda|ľad)\b/i.test(s.nazov);

const zaokruhliHore = (g: number): number => (g < 100 ? Math.ceil(g / 10) * 10 : g < 1000 ? Math.ceil(g / 50) * 50 : Math.ceil(g / 100) * 100);
const cislo = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');
const hmotnost = (g: number) => (g >= 1000 ? `${cislo(g / 1000)} kg` : `${Math.round(g)} g`);
const objem = (ml: number) => (ml >= 1000 ? `${cislo(ml / 1000)} l` : `${Math.round(ml)} ml`);

/** Tvary „1 / 2–4 / 5+“ pre kusové jednotky. */
const KUSY: Record<string, [string, string, string]> = {
  'rozok-biely': ['rožok', 'rožky', 'rožkov'],
  'tortilla-psenicna': ['tortilla', 'tortilly', 'tortíl'], 'tortilla-kukuricna': ['tortilla', 'tortilly', 'tortíl'],
  pita: ['pita', 'pity', 'pít'], bageta: ['bageta', 'bagety', 'bagiet'],
  cesnak: ['strúčik', 'strúčiky', 'strúčikov'], 'vyvar-kocka': ['kocka', 'kocky', 'kociek'],
  'rybie-prsty': ['kus', 'kusy', 'kusov'],
};
const PLATKY: [string, string, string] = ['plátok', 'plátky', 'plátkov'];
const tvar = (n: number, t: [string, string, string]) => (n === 1 ? t[0] : n >= 2 && n <= 4 ? t[1] : t[2]);
const jeChlieb = (s: Surovina) => s.skupina === 'pecivo' && /chlieb/i.test(s.nazov) && !/^(pita|tortilla)/i.test(s.nazov);

/** Text množstva pre položku bez balenia (váha, kusy, plátky). */
export function formatMnozstvo(s: Surovina | undefined, gr: number): string {
  const ks = s?.jednotky.ks;
  if (s && ks && jeChlieb(s)) {
    const g5 = Math.round(gr / 5) * 5;
    const n = Math.max(1, Math.round(gr / ks));
    return `~${g5} g ≈ ${n} ${tvar(n, PLATKY)}`;
  }
  if (s && ks && KUSY[s.id]) {
    const n = Math.max(1, Math.round(gr / ks));
    return `~${hmotnost(Math.round(gr / 5) * 5 || Math.round(gr))} ≈ ${n} ${tvar(n, KUSY[s.id])}`;
  }
  if (s && ks && ks >= 30 && ['ovocie', 'zelenina', 'vajcia', 'pecivo'].includes(s.skupina)) {
    const n = gr / ks;
    if (n >= 0.8) return `~${hmotnost(zaokruhliHore(gr))} ≈ ${Math.round(n)} ks`;
  }
  return hmotnost(s?.skupina === 'korenie-bylinky' && gr < 10 ? Math.round(gr * 10) / 10 : zaokruhliHore(gr));
}

/** Zaokrúhli potrebu na bežné balenie; vráti text a poznámku „treba“ (alebo undefined, ak balenie nie je). */
function naBalenie(s: Surovina, gr: number): { text: string; potreba?: string } | undefined {
  if (s.id === 'vajce-slepacie') {
    const potrebne = gr / (s.jednotky.ks ?? 58);
    const bal = Math.max(1, Math.ceil(potrebne / VAJCIA_V_BALENI - 0.05));
    return { text: `${bal * VAJCIA_V_BALENI} ks`, potreba: `treba ~${Math.ceil(potrebne - 0.01)} ks` };
  }
  const b = balenie(s);
  if (!b) return undefined;
  const potreba = b.jednotka === 'ml' ? gr / (s.jednotky.ml ?? 1) : gr;
  const n = Math.max(1, Math.ceil(potreba / b.velkost - 0.05));
  const cele = b.jednotka === 'ml' ? objem(b.velkost) : hmotnost(b.velkost);
  const text = b.kus ? (n === 1 ? `${b.kus} ${cele}` : `${n} × ${b.kus} ${cele}`) : (b.jednotka === 'ml' ? objem(b.velkost * n) : hmotnost(b.velkost * n));
  const treba = b.jednotka === 'ml' ? objem(Math.round(potreba / 10) * 10 || Math.round(potreba)) : hmotnost(Math.round(potreba / 10) * 10 || Math.round(potreba));
  return { text, potreba: `treba ~${treba}` };
}

export interface MoznostiNakupu {
  /** Voliteľné suroviny, ktoré používateľ pridal (id receptu → id surovín); započítajú sa do nákupu. */
  pridane?: Record<string, string[]>;
}

/** Zlúči suroviny z viacerých receptov, prepočíta na `porcieDomacnosti`, odpočíta zásoby. */
export function zostavNakup(
  recepty: { r: Recept; krat: number }[], porcieDomacnosti: number, db: Map<string, Surovina>, mamDoma: Set<string>,
  moznosti: MoznostiNakupu = {},
): Record<string, PolozkaNakupu[]> {
  const sum = new Map<string, number>();
  for (const { r, krat } of recepty) {
    const f = (porcieDomacnosti / r.porcie) * krat;
    for (const s of r.suroviny) {
      if (s.volitelna && !s.nevyhnutna && !(moznosti.pridane?.[r.id] ?? []).includes(s.id)) continue;
      sum.set(s.id, (sum.get(s.id) ?? 0) + naGramy(db.get(s.id), s.mnozstvo, s.jednotka) * f);
    }
  }
  const out: Record<string, PolozkaNakupu[]> = {};
  for (const [id, gr] of sum) {
    if (mamDoma.has(id)) continue;
    const s = db.get(id); if (!s) continue;
    if (jeVoda(s)) continue;
    const skontroluj = gr < PRAH_SKONTROLUJ_G || (s.oddelenie === 'koreniny' && gr < PRAH_KORENINY_G);
    if (skontroluj) {
      (out[SKONTROLUJ] ??= []).push({ id, nazov: s.nazov, oddelenie: s.oddelenie, gramy: gr, text: '', skontroluj: true });
      continue;
    }
    const bal = naBalenie(s, gr);
    (out[s.oddelenie] ??= []).push({ id, nazov: s.nazov, oddelenie: s.oddelenie, gramy: gr, text: bal?.text ?? formatMnozstvo(s, gr), potreba: bal?.potreba });
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.nazov.localeCompare(b.nazov, 'sk'));
  return out;
}

/** Počet výskytov receptov v zozname → `{ r, krat }` (ten istý recept dvakrát = jeden riadok, dvojnásobné množstvo). */
export function zoskupRecepty(ids: string[], najdi: (id: string) => Recept | undefined): { r: Recept; krat: number }[] {
  const m = new Map<string, number>();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return [...m].map(([id, krat]) => ({ r: najdi(id)!, krat })).filter((x) => x.r);
}
