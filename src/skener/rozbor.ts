/** Rozbor zloženia: parser + databázy → zoznam rozpoznaných zložiek, alergény a stopy. */
import { rozdelText, parsujZlozenie, type Uzol } from './parser';
import { norm, kluc, levenshtein, tolerancia } from './normalizacia';
import { najdiPodlaE, najdiPodlaNazvu, vytiahniE, zakladnyE, TRIEDY_SK, ADITIVUM, type Aditivum } from './aditiva';
import { najdiZlozku, zlozkaPodlaId, VZORY_IDX } from './zlozky';
import { alergenyVTexte } from './alergeny';
import type { Rozbor, Zlozka, PriznakZlozky, Doplnok, Spolahlivost } from './typy';
import type { Alergen } from '../data/types';

/** Slová označujúce funkciu (pred zátvorkou so zložkami): „farbivo (E102, E110)“. */
const FUNKCIE: [RegExp, string][] = [
  [/^(farbiv|colou?r)/, 'farbivo'], [/^(konzerv|preserv)/, 'konzervant'], [/^emulgat/, 'emulgátor'], [/^regulator kysl|^regulatory kysl|^acidity/, 'regulátor kyslosti'],
  [/^antioxid/, 'antioxidant'], [/^stabiliz/, 'stabilizátor'], [/^zahust|^thicken/, 'zahusťovadlo'], [/^sladidl|^sweeten/, 'sladidlo'],
  [/^zvyraznovac chuti|^flavour enhanc|^flavor enhanc/, 'zvýrazňovač chuti'], [/^latka na upravu muky|^flour treatment/, 'látka na úpravu múky'],
  [/^kypriac|^prasok do pecenia|^raising/, 'kypriaca látka'], [/^gelotvorn|^zelirujuc|^gelling/, 'želírujúca látka'], [/^kyselin(a|y)? *$/, 'kyselina'], [/^latka proti spekav|^anti-?caking/, 'látka proti spekavosti'],
  [/^vitam[ií]n/, 'vitamín'], [/^mineral/, 'minerálna látka'], [/^modifikovan|^upraven/, ''],
];
function funkcia(textNorm: string): string | undefined {
  if (/^(modifikovan|upraven)/.test(textNorm)) return undefined;
  for (const [re, n] of FUNKCIE) if (n && re.test(textNorm)) return n;
  return undefined;
}

const VOVNUTRI_ALERGEN: Record<string, Alergen> = { E1105: 'vajcia' };

function zAditiva(a: Aditivum, povodny: string, poradie: number, hlbka: number, rodic: string | undefined, fuzzy: boolean, percento?: number, funk?: string): Zlozka {
  const priznaky: PriznakZlozky[] = [];
  if (a.kozmeticke) priznaky.push('ultra');
  if (a.triedy.includes('sweetener')) priznaky.push(/^E(420|421|953|96[4-7]|968)$/.test(a.zaklad) ? 'polyol' : 'intenzivne-sladidlo');
  if (a.triedy.includes('flavour')) priznaky.push('aroma');
  const al: Alergen[] = [];
  if (/^E22[0-8]$/.test(a.zaklad)) al.push('siricitany');
  if (VOVNUTRI_ALERGEN[a.zaklad]) al.push(VOVNUTRI_ALERGEN[a.zaklad]);
  return {
    povodny, nazov: a.nazov, typ: 'aditivum', poradie, hlbka, rodic, percento, e: a.zaklad === a.id ? a.id : a.id, id: a.id,
    funkcia: funk ?? (a.triedy[0] ? TRIEDY_SK[a.triedy[0]] ?? a.triedy[0] : undefined),
    priznaky, hodnotenie: a.hodnotenie, fuzzy: fuzzy || undefined, alergeny: al,
  };
}

function vyzeraNezmyselne(t: string): boolean {
  const k = kluc(t);
  if (k.length < 3) return true;
  if (!/[aeiouy]/.test(k)) return true;
  const pismena = (t.match(/\p{L}/gu) ?? []).length;
  return pismena / Math.max(1, t.length) < 0.6;
}

const KLUCOVE = [...new Set(VZORY_IDX.map((x) => x.v.split(' ')[0]).filter((v) => v.length >= 6))].map((v) => ({ v, z: VZORY_IDX.find((x) => x.v.startsWith(v))!.z }));

function fuzzyZlozka(textNorm: string) {
  for (const w of textNorm.split(/[^a-z0-9]+/).filter((x) => x.length >= 6)) {
    for (const { v, z } of KLUCOVE) {
      const t = tolerancia(v.length);
      if (!t) continue;
      if (levenshtein(w.slice(0, v.length), v, t) <= t) return z;
    }
  }
  return undefined;
}

function rozpoznaj(povodny: string, poradie: number, hlbka: number, rodic: string | undefined, percento: number | undefined, funk: string | undefined): Zlozka {
  const t = povodny.trim();
  const n = norm(t);
  const zaklad = { povodny: t, poradie, hlbka, rodic, percento, alergeny: alergenyVTexte(t) };
  // 1. E-číslo
  const e = vytiahniE(t);
  if (e) {
    const a = najdiPodlaE(e.e);
    if (a) return { ...zAditiva(a, t, poradie, hlbka, rodic, e.oprava, percento, funk), alergeny: [...new Set([...zAditiva(a, t, poradie, hlbka, rodic, false).alergeny, ...zaklad.alergeny])] };
    return { ...zaklad, nazov: t, typ: 'neznama', e: e.e, priznaky: [], fuzzy: true };
  }
  // 2. presný názov aditíva
  const presne = najdiPodlaNazvu(t, false);
  if (presne) return zAditiva(presne.a, t, poradie, hlbka, rodic, false, percento, funk);
  // 3. naša databáza zložiek
  const z = najdiZlozku(n);
  if (z) return { ...zaklad, nazov: z.id === 'bezna' ? t : z.nazov, typ: 'zlozka', id: z.id, priznaky: [...z.priznaky], hodnotenie: z.hodnotenie };
  // 4. slová v texte: „sójový lecitín“ → lecitín
  for (const w of n.split(/[^a-z0-9]+/).filter((x) => x.length >= 6)) {
    const p = najdiPodlaNazvu(w, false);
    if (p) return { ...zAditiva(p.a, t, poradie, hlbka, rodic, false, percento, funk), alergeny: [...new Set([...zaklad.alergeny])] };
  }
  // 5. preklepy z OCR
  const f = najdiPodlaNazvu(t, true);
  if (f) return zAditiva(f.a, t, poradie, hlbka, rodic, true, percento, funk);
  const fz = fuzzyZlozka(n);
  if (fz) return { ...zaklad, nazov: fz.nazov, typ: 'zlozka', id: fz.id, priznaky: [...fz.priznaky], hodnotenie: fz.hodnotenie, fuzzy: true };
  return { ...zaklad, nazov: t, typ: 'neznama', priznaky: [], podozrivy: vyzeraNezmyselne(t) };
}

const PREFIX_FUNKCIE = /^(?:farbiv[oa]|konzervant(?:y)?|emulgator(?:y)?|regulator(?:y)? kyslosti|antioxidant(?:y)?|stabilizator(?:y)?|zahustovadl[oa]|sladidl[oa]|zvyraznovac(?:e)? chuti|latka na upravu muky|kypriac[a-z]* latka)\s+/;

const UPRESNENIE = new Set(['olej', 'aroma']);

function spracuj(uzly: Uzol[], out: Zlozka[], hlbka = 0, rodic?: string, poradieRodica?: number, funkRodica?: string) {
  uzly.forEach((u, i) => {
    const poradie = poradieRodica ?? i;
    const n = norm(u.text);
    if (u.deti.length) {
      const f = funkcia(n);
      if (!f && u.text) {
        // zložená zložka (čokoláda (cukor, …)): vyhodnotíme aj samotný názov, potom podzložky
        const z = rozpoznaj(u.text, poradie, hlbka, rodic, u.percento, funkRodica);
        // všeobecná zložka s upresnením v zátvorke (vegetable fat (palm), flavouring (vanillin)) = jedna zložka
        if (z.typ === 'zlozka' && z.id && UPRESNENIE.has(z.id)) {
          const dieta: Zlozka[] = [];
          spracuj(u.deti, dieta, hlbka, u.text, poradie, funkRodica);
          const presnejsia = dieta.find((d) => d.typ === 'zlozka' && d.id && d.id !== z.id);
          if (presnejsia) out.push(...dieta.map((d) => ({ ...d, povodny: `${u.text} (${d.povodny})` })));
          else out.push({ ...z, povodny: `${u.text} (${u.deti.map((d) => d.text).join(', ')})`, alergeny: [...new Set([...z.alergeny, ...dieta.flatMap((d) => d.alergeny)])] });
          return;
        }
        out.push(z);
      }
      spracuj(u.deti, out, hlbka + (f ? 0 : 1), f ? (rodic ?? u.text) : u.text, poradie, f ?? funkRodica);
    } else if (u.text) {
      // „regulátor kyslosti kyselina citrónová“ (bez dvojbodky): funkcia + látka
      const m = PREFIX_FUNKCIE.exec(n);
      if (m && m[0].length < n.length - 3) {
        const zv = u.text.slice(Math.min(u.text.length, m[0].length)).replace(/^[\s:\-]+/, '');
        const f2 = funkcia(m[0].trim());
        out.push(rozpoznaj(zv || u.text, poradie, hlbka, rodic, u.percento, f2 ?? funkRodica));
        return;
      }
      out.push(rozpoznaj(u.text, poradie, hlbka, rodic, u.percento, funkRodica));
    }
  });
}

/** Tag OFF „en:e322i“ → aditívum z našej databázy (E322i → E322(i) → E322). */
function aditivumZTagu(tag: string): Aditivum | undefined {
  const m = /^(?:[a-z]{2}:)?e(\d{3,4})([a-z]?)$/i.exec(tag.trim());
  if (!m) return undefined;
  const cislo = m[1], pis = m[2].toLowerCase();
  const rimske: Record<string, string> = { i: '(i)', v: '(v)', x: '(x)' };
  return najdiPodlaE(`E${cislo}${pis}`) ?? (rimske[pis] ? najdiPodlaE(`E${cislo}${rimske[pis]}`) : undefined) ?? najdiPodlaE(`E${cislo}`);
}

/** Nerozpoznané zložky nesmú pôsobiť ako neutrálne: nad ~30 % alebo medzi prvými tromi = nízka spoľahlivosť. */
export const PRAH_NEROZPOZNANYCH = 0.3;
export function spolahlivostRozboru(zlozky: Zlozka[]): Spolahlivost {
  const nezn = zlozky.filter((z) => z.typ === 'neznama');
  const podiel = zlozky.length ? nezn.length / zlozky.length : 0;
  const naPrvych = nezn.some((z) => z.hlbka === 0 && z.poradie < 3);
  const nizka = zlozky.length > 0 && (podiel > PRAH_NEROZPOZNANYCH || naPrvych);
  return {
    nizka, nerozpoznane: nezn.length, podiel, zoznam: nezn.map((z) => z.povodny),
    dovod: nizka ? (podiel > PRAH_NEROZPOZNANYCH ? `Nerozpoznali sme ${nezn.length} z ${zlozky.length} zložiek.` : 'Nerozpoznali sme niektorú z prvých troch (najväčších) zložiek.') : undefined,
  };
}

/** Zloží rozbor textu s údajmi z databázy (E-čísla, alergény, pridaný cukor, palmový olej) bez duplicít. */
function zlucDoplnok(zlozky: Zlozka[], d: Doplnok) {
  const koniec = () => zlozky.reduce((a, z) => Math.max(a, z.poradie), -1) + 1;
  const mamE = new Set(zlozky.filter((z) => z.typ === 'aditivum' && z.id).map((z) => zakladnyE(z.id!).replace(/[a-z]$/, '')));
  for (const tag of d.e ?? []) {
    const a = aditivumZTagu(tag);
    if (!a) continue;
    const zaklad = zakladnyE(a.id).replace(/[a-z]$/, '');
    if (mamE.has(zaklad)) continue;
    mamE.add(zaklad);
    const z = zAditiva(a, `${a.id} (z údajov databázy)`, koniec(), 0, undefined, false);
    zlozky.push({ ...z, zTagov: true });
  }
  const pridajZlozku = (id: string, popis: string, poradie: number) => {
    const db = zlozkaPodlaId(id);
    if (!db) return;
    zlozky.push({ povodny: popis, nazov: db.nazov, typ: 'zlozka', poradie, hlbka: 0, id: db.id, priznaky: [...db.priznaky], hodnotenie: db.hodnotenie, alergeny: [], zTagov: true });
  };
  if (d.cukor && !zlozky.some((z) => z.priznaky.includes('cukor'))) pridajZlozku('cukor', 'pridaný cukor (z údajov databázy)', Math.min(koniec(), 2));
  if (d.palma && !zlozky.some((z) => z.priznaky.includes('palmovy-tuk'))) pridajZlozku('palmovy-tuk', 'palmový olej (z údajov databázy)', Math.min(koniec(), 3));
}

export function rozbor(vstup: string, doplnok?: Doplnok): Rozbor {
  const { zlozenie, stopy, alergenInfo } = rozdelText(vstup);
  const strom = parsujZlozenie(zlozenie);
  const zlozky: Zlozka[] = [];
  spracuj(strom, zlozky);
  if (doplnok) zlucDoplnok(zlozky, doplnok);
  const alergeny = [...new Set([...zlozky.flatMap((z) => z.alergeny), ...(doplnok?.alergeny ?? [])])];
  const stopyA = [...new Set([...alergenyVTexte(stopy.replace(/^[^:]*?(?:obsahova[tť]|stopy|contain|traces of)/i, '')), ...(doplnok?.stopy ?? [])])].filter((a) => !alergeny.includes(a));
  void alergenInfo;
  return { zlozky, alergeny, stopy: stopyA, stopyText: stopy.trim(), pocetZloziek: zlozky.length, text: zlozenie, spolahlivost: spolahlivostRozboru(zlozky) };
}

export { ADITIVUM };
