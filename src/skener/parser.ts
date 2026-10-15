/** Rozbor textu zloženia na strom zložiek (bez databázy – tá sa pripája v rozbor.ts). */
import { norm } from './normalizacia';

export interface Uzol {
  text: string;          // názov bez percent a zátvoriek
  percento?: number;
  deti: Uzol[];
}

const HLAVICKA = /^\s*(?:zlo[zž]enie|zlozeni|ingredienty|ingredients?|zusammensetzung|zutaten|sk[lł]adniki|složení|složky|obsah)\s*[:：.\-–]?\s*/i;
/** Úseky, kde zloženie končí. */
const KONIEC = /(?:v[yý][zž]ivov[eé]\s+(?:[uú]daje|hodnoty)|priemern[aá]\s+v[yý][zž]ivov|nutri[cč]n[ií]\s+(?:[uú]daje|hodnoty)|nutrition\s+(?:facts|information)|skladujte|uchov[aá]vajte|uchov[aá]vejte|najlep[sš]ie\s+spotrebova[tť]|spotrebujte\s+do|minim[aá]lna\s+trvanlivos[tť]|trvanlivos[tť]|vyroben[eé]\s+v|vyrobca|v[yý]robca|distribu[uú]tor|dovozca|krajina\s+p[oô]vodu|energetick[aá]\s+hodnota|best\s+before|store\s+in|po\s+otvoren[ií])/i;

export function vycistiText(vstup: string): string {
  let t = vstup.replace(/\r/g, '\n');
  // rozdelenie slov spojovníkom na konci riadku: „sladid-\nlo“ → „sladidlo“
  t = t.replace(/(\p{L})-\n\s*(\p{L})/gu, '$1$2');
  t = t.replace(/\n+/g, ' ').replace(/[“”„"]/g, '').replace(/\s+/g, ' ').trim();
  const h = HLAVICKA.exec(t);
  if (h) t = t.slice(h[0].length);
  else {
    const i = t.search(/(?:zlo[zž]enie|ingredienty|ingredients?)\s*:/i);
    if (i >= 0) t = t.slice(i).replace(HLAVICKA, '');
  }
  return t;
}

/** Oddelí zloženie od stôp alergénov a ostatného textu. */
export function rozdelText(vstup: string): { zlozenie: string; stopy: string; alergenInfo: string } {
  let t = vycistiText(vstup);
  let stopy = '';
  let alergenInfo = '';
  const kon = KONIEC.exec(t);
  if (kon && kon.index > 3) t = t.slice(0, kon.index);
  const reStopy = /(?:m[oô][zž]e\s+obsahova[tť]|obsahuje\s+stopy|stopy|may\s+contain|traces\s+of|m[uů][zž]e\s+obsahovat|vyroben[eé]\s+v\s+prev[aá]dzke[^.]*?(?:spracúva|spracuva|spracov[aá]va)|spracov[aá]va\s+sa)/i;
  const m = reStopy.exec(t);
  if (m) {
    const zvysok = t.slice(m.index);
    const bodka = zvysok.search(/\.\s+(?=[A-ZÁČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ])/);
    stopy = bodka >= 0 ? zvysok.slice(0, bodka) : zvysok;
    t = t.slice(0, m.index) + (bodka >= 0 ? ' ' + zvysok.slice(bodka + 1) : '');
  }
  const a = /(?:alerg[eé]ny?\s+(?:s[uú]|je|sú)\s+(?:zv[yý]raznen[eé]|vyzna[cč]en[eé])|alerg[eé]ny\s*:|pre\s+alergikov|allergens?\s*:)/i.exec(t);
  if (a) { alergenInfo = t.slice(a.index); t = t.slice(0, a.index); }
  t = t.replace(/[.\s;,]+$/, '').trim();
  return { zlozenie: t, stopy, alergenInfo };
}

const OTV = '([{';
const ZAT = ')]}';

/** Rozdelí na najvyššej úrovni čiarkami/bodkočiarkami; desatinná čiarka v čísle (12,5) nedelí. */
export function delNaUrovni(t: string): string[] {
  const out: string[] = [];
  let hl = 0, zac = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (OTV.includes(c)) hl++;
    else if (ZAT.includes(c)) hl = Math.max(0, hl - 1);
    else if ((c === ',' || c === ';') && hl === 0) {
      if (c === ',' && /\d/.test(t[i - 1] ?? '') && /\d/.test(t[i + 1] ?? '')) continue;
      out.push(t.slice(zac, i)); zac = i + 1;
    }
  }
  out.push(t.slice(zac));
  return out.map((x) => x.trim()).filter(Boolean);
}

const RE_PERC = /(?:min\.?|max\.?|aspo[nň]|viac\s+ako|menej\s+ako|cca\.?|[~≈])?\s*(\d{1,3}(?:[.,]\d{1,2})?)\s*%/i;

export function parsujUzol(token: string): Uzol {
  let t = token.trim();
  let percento: number | undefined;
  let deti: Uzol[] = [];
  // obsah zátvorky (posledná vonkajšia)
  const i = t.search(/[([{]/);
  if (i >= 0) {
    const otv = t[i];
    const zat = ZAT[OTV.indexOf(otv)];
    let hl = 0, j = i;
    for (; j < t.length; j++) {
      if (OTV.includes(t[j])) hl++;
      else if (ZAT.includes(t[j])) { hl--; if (hl === 0) break; }
    }
    const vnutro = t.slice(i + 1, j >= t.length ? undefined : j);
    const po = j < t.length ? t.slice(j + 1) : '';
    const pred = t.slice(0, i);
    // zátvorka je len percento: „mäso (60 %)“
    const mp = RE_PERC.exec(vnutro);
    if (mp && vnutro.replace(RE_PERC, '').replace(/[\s,.;]/g, '') === '') {
      percento = Number(mp[1].replace(',', '.'));
      t = (pred + ' ' + po).trim();
    } else {
      void zat;
      const casti = delNaUrovni(vnutro);
      deti = casti.map(parsujUzol);
      t = (pred + ' ' + po).trim();
    }
  }
  const m = RE_PERC.exec(t);
  if (m) {
    if (percento === undefined) percento = Number(m[1].replace(',', '.'));
    t = t.replace(m[0], ' ');
  }
  t = t.replace(/^\s*(?:a|and|und|a\/alebo|and\/or)\s+/i, '').replace(/[:.\s]+$/g, '').replace(/^[\s:.\-–•*]+/, '').replace(/\s+/g, ' ').trim();
  // „farbivo: E150d“ → názov „farbivo“, dieťa E150d
  const d = t.indexOf(':');
  if (d > 0 && !deti.length) {
    const hlava = t.slice(0, d).trim(), chvost = t.slice(d + 1).trim();
    if (chvost) { deti = delNaUrovni(chvost).map(parsujUzol); t = hlava; }
  }
  return { text: t, percento, deti };
}

export function parsujZlozenie(zlozenie: string): Uzol[] {
  return delNaUrovni(zlozenie).map(parsujUzol).filter((u) => u.text || u.deti.length);
}

/** Pomocné: počet zložiek (listy stromu). */
export function listy(u: Uzol[]): Uzol[] {
  return u.flatMap((x) => (x.deti.length ? listy(x.deti) : [x]));
}
export { norm };
