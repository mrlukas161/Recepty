/** Parser zoznamu INCI: oddeľovače, zátvorky, synonymá (Aqua/Water/Eau), CI čísla, (nano), „May contain“ / „+/-“, preklepy z OCR. */
import { INDEX, KLUCE, normKluc } from './databaza';
import type { Latka, Oprava, Parsovane, Polozka } from './typy';

const PREDPONA = /^\s*(?:ingredients?|ingr[eé]dients?|inci|zlo[zž]enie|slo[zž]en[ií]|zutaten|composition|inhaltsstoffe|ingredientes)\s*[:：.]?\s*/i;
const MOZE = /(?:\bmay\s+contain\b|\bpeut\s+contenir\b|\bm[ôo][zž]e\s+obsahova[ťt]\b|\bm[ůu][zž]e\s+obsahovat\b|\bkann\s+enthalten\b|\+\s*\/?\s*[-−–]\s*(?=\s*[A-Za-z0-9]))\s*:?/i;
const CI_RE = /\bC\.?[Il1]\.?\s*[-:]?\s*([0-9OoIl]{5})(?![0-9])/g;

const poCislach = (s: string) => s.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');

/** Rozdelí na úrovni 0 (mimo zátvoriek) podľa čiarky, bodkočiarky, odrážok, zvislej čiary a „(and)“. */
export function rozdel(t: string): string[] {
  const out: string[] = [];
  let hl = 0, cur = '';
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    // „(and)“ ako oddelovač zmesi
    if (hl === 0 && c === '(' && /^\(\s*and\s*\)/i.test(t.slice(i))) { out.push(cur); cur = ''; i += t.slice(i).match(/^\(\s*and\s*\)/i)![0].length - 1; continue; }
    if (c === '(' || c === '[') hl++;
    else if (c === ')' || c === ']') hl = Math.max(0, hl - 1);
    if (hl === 0 && /[,;•·●▪|]/.test(c)) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function zatvorky(s: string): { hlavne: string; vnutri: string[] } {
  const vnutri: string[] = [];
  let hl = 0, cur = '', hlavne = '';
  for (const c of s) {
    if (c === '(' || c === '[') { if (hl === 0) cur = ''; else cur += c; hl++; continue; }
    if (c === ')' || c === ']') { hl = Math.max(0, hl - 1); if (hl === 0) vnutri.push(cur.trim()); else cur += c; continue; }
    if (hl === 0) hlavne += c; else cur += c;
  }
  if (hl > 0 && cur.trim()) vnutri.push(cur.trim());
  return { hlavne: hlavne.replace(/\s+/g, ' ').trim(), vnutri };
}

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < min) min = cur[j];
    }
    if (min > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Presná zhoda; inak najbližší názov s toleranciou na preklepy z OCR (len ak je výsledok jednoznačný). */
export function najdiLatku(nazov: string): { latka: Latka; priblizna: boolean } | null {
  const k = normKluc(nazov);
  if (!k) return null;
  const p = INDEX.get(k);
  if (p) return { latka: p, priblizna: false };
  // OCR často zamieňa l/1/i, 0/o, rn/m
  const alt = [k.replace(/1/g, 'l'), k.replace(/0/g, 'o'), k.replace(/rn/g, 'm'), k.replace(/vv/g, 'w')];
  for (const a of alt) { const x = INDEX.get(a); if (x) return { latka: x, priblizna: true }; }
  if (k.length < 6) return null;
  const max = k.length >= 14 ? 3 : k.length >= 10 ? 2 : 1;
  let best = max + 1, bestL: Latka | null = null, dup = false;
  for (const kl of KLUCE) {
    if (kl.startsWith('ci ')) continue;
    const d = lev(k, kl, max);
    if (d < best) { best = d; bestL = INDEX.get(kl)!; dup = false; } else if (d === best && bestL && INDEX.get(kl) !== bestL) dup = true;
  }
  return bestL && !dup && best <= max ? { latka: bestL, priblizna: true } : null;
}

const cistyNazov = (s: string) => s.replace(/\d+([.,]\d+)?\s*%/g, '').replace(/[*†‡§]+/g, '').replace(/^[\s\-–.:]+|[\s\-–.:]+$/g, '').replace(/\s+/g, ' ').trim();

function spracujToken(token: string, poradie: number, moze: boolean, opravy: Oprava[]): Polozka[] {
  const surove = token.trim();
  const nano = /[(\[]\s*nano\s*[)\]]|\bnano\b/i.test(surove);
  const bezNano = surove.replace(/[(\[]\s*nano\s*[)\]]/gi, ' ');
  const { hlavne, vnutri } = zatvorky(bezNano);
  const vysl: Polozka[] = [];
  const zaklad = (nazov: string): Polozka => ({ surove, nazov, nano, poradie, moze, zhoda: 'ziadna' });

  // CI čísla v celom tokene (aj v zátvorke: „Mica (CI 77019, CI 77891)“)
  const celeCI = [...bezNano.matchAll(CI_RE)].map((m) => poCislach(m[1]));
  const hlavneBezCI = cistyNazov(hlavne.replace(CI_RE, ' '));
  const alt: string[] = [];
  for (const v of vnutri) { if (!CI_RE.test(v) || /[A-Za-z]{4,}/.test(v.replace(CI_RE, ''))) alt.push(...v.replace(CI_RE, ' ').split('/').map(cistyNazov)); CI_RE.lastIndex = 0; }
  const kandidati = [...hlavneBezCI.split('/').map(cistyNazov), ...alt].filter((x) => x && !/^nano$/i.test(x));

  const zhodaNazvu = (): Polozka | null => {
    for (const k of kandidati) { const r = najdiLatku(k); if (r && !r.priblizna) return { ...zaklad(k), latka: r.latka, zhoda: 'presna' }; }
    for (const k of kandidati) { const r = najdiLatku(k); if (r) { opravy.push({ z: k, na: r.latka.m[0] }); return { ...zaklad(k), latka: r.latka, zhoda: 'priblizna' }; } }
    return null;
  };
  const z = zhodaNazvu();
  if (z) vysl.push(z);
  else if (kandidati.length && !(celeCI.length && !hlavneBezCI)) vysl.push(zaklad(kandidati[0]));

  const videne = new Set<string>();
  for (const ci of celeCI) {
    if (videne.has(ci)) continue; videne.add(ci);
    // „Titanium Dioxide (CI 77891)“: ak sa názov už zhodol s tou istou látkou, CI nepridávame znova
    const l = INDEX.get(`ci ${ci}`);
    if (l && vysl.some((p) => p.latka === l)) continue;
    vysl.push({ ...zaklad(`CI ${ci}`), ci, latka: l, zhoda: l ? 'presna' : 'ziadna' });
  }
  return vysl;
}

export function parsujInci(vstup: string): Parsovane {
  let t = vstup.normalize('NFC').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(PREDPONA, '');
  const m = MOZE.exec(t);
  const hlavny = m ? t.slice(0, m.index) : t;
  const volitelny = m ? t.slice(m.index + m[0].length) : '';
  const opravy: Oprava[] = [];
  let n = 0;
  const polozky = rozdel(hlavny.replace(/[.]\s*$/, '')).flatMap((tk) => spracujToken(tk, ++n, false, opravy));
  const moze = rozdel(volitelny.replace(/[.]\s*$/, '')).flatMap((tk) => spracujToken(tk, ++n, true, opravy));
  // poradie = poradie zložky v zozname (nie počet CI), prečíslujeme súvisle
  polozky.forEach((p, i) => { p.poradie = i + 1; });
  return { polozky, moze, opravy };
}

/** Index prvej zložky, od ktorej už nutne ide o ≤ 1 % (prvá s overeným stropom ≤ 1 %); -1 ak taká nie je. */
export function hranica1Percento(p: Parsovane): number {
  return p.polozky.findIndex((x) => x.latka?.x !== undefined && x.latka.x <= 1);
}
