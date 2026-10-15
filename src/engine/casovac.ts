// Rozpoznávanie časov v krokoch postupu pre časovač v režime varenia.
// „cez noc“ a podobné neurčité údaje sa zámerne nerozpoznávajú.

export interface NajdenyCas {
  /** presný zachytený text z kroku, napr. „45 – 60 minút“ */
  text: string;
  /** dolná hranica v sekundách (rovnaká ako horná, ak nejde o rozsah) */
  odS: number;
  /** horná hranica v sekundách */
  doS: number;
}

const NUM = String.raw`\d+(?:[.,]\d+)?`;
const SEP = String.raw`\s*[–—-]\s*`;
const H = String.raw`hodin\p{L}*|hod\.?`;
const M = String.raw`minút\p{L}*|min\.?`;
const S = String.raw`sekúnd\p{L}*|sek\.?`;
const JEDNOTKA = `(?:${H}|${M}|${S})`;
const KONIEC = String.raw`(?![\p{L}\d])`;
const ZAC = String.raw`(?<![\p{L}\d.,])`;

// poradie je dôležité: „1 a pol hodiny“ a „pol hodiny“ pred čistým číslom
const RE = new RegExp(
  [
    `${ZAC}(?<ca>${NUM}) a pol (?<ua>${H})${KONIEC}`,
    `${ZAC}pol (?<up>${H}|${M})${KONIEC}`,
    `${ZAC}(?<n1>${NUM})(?:${SEP}(?<n2>${NUM}))?\\s*(?<u>${JEDNOTKA})${KONIEC}`,
    `${ZAC}(?<hu>hodinu)${KONIEC}`,
  ].join('|'),
  'giu',
);

function cislo(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

function nasobok(u: string): number {
  const l = u.toLowerCase();
  if (l.startsWith('h')) return 3600;
  if (l.startsWith('m')) return 60;
  return 1;
}

export function najdiCasy(text: string): NajdenyCas[] {
  const out: NajdenyCas[] = [];
  const videne = new Set<string>();
  for (const m of text.matchAll(RE)) {
    const g = m.groups!;
    let odS: number;
    let doS: number;
    if (g.ca !== undefined) { odS = doS = Math.round((cislo(g.ca) + 0.5) * nasobok(g.ua)); }
    else if (g.up !== undefined) { odS = doS = Math.round(0.5 * nasobok(g.up)); }
    else if (g.n1 !== undefined) {
      const k = nasobok(g.u);
      odS = Math.round(cislo(g.n1) * k);
      doS = g.n2 !== undefined ? Math.round(cislo(g.n2) * k) : odS;
      if (doS < odS) doS = odS; // „5 – 3“ je preklep; ber ako jednu hodnotu
    } else { odS = doS = 3600; }
    if (doS < 5 || doS > 24 * 3600) continue;
    const kluc = `${odS}-${doS}`;
    if (videne.has(kluc)) continue;
    videne.add(kluc);
    out.push({ text: m[0], odS, doS });
  }
  return out;
}

/** Čitateľný čas: 180 → „3 min“, 3600 → „1 h“, 5400 → „1 h 30 min“. */
export function popisCasu(s: number): string {
  if (s < 60) return `${s} s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return m ? `${h} h ${m} min` : `${h} h`;
  return sec ? `${m} min ${sec} s` : `${m} min`;
}

/** Odpočet na displej: mm:ss alebo h:mm:ss. */
export function odpocet(zostavaMs: number): string {
  const t = Math.max(0, Math.ceil(zostavaMs / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}
