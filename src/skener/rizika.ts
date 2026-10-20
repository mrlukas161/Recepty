/**
 * Rizikové látky a kombinácie vo výrobku (podľa textu zloženia a tagov databázy):
 * dusitany/dusičnany E249–E252, skrytý zdroj dusičnanov/dusitanov (zeleninový extrakt v mäsovom výrobku),
 * benzoan E211 + kyselina askorbová E300/E301 (benzén), údeniny. Konkrétny výrobok ani obchod nemenujeme.
 */
import type { PrecoId } from '../data/preco';
import { norm } from './normalizacia';
import type { Doplnok, Rozbor } from './typy';

export interface Riziko { id: string; preco: PrecoId; nadpis: string; text: string; zavaznost: 'info' | 'pozor' }

/** Mäso v zložení (sk, cs, en, de). */
const MASO = /\b(?:maso|masa|masov|masu|sunk|salam|klobas|parek|parky|parku|slanin|spek|sekan|mortadel|prsut|bravcov|hovadz|hovezi|vepro|kuraci|kuracie|kurec|morcac|kruti|kruta|krutie|kachn|husac|telac|jehnec|baranin|zverin|trhane|uden|pastik|tlacenk|jaternic|jelito|schinken|schwein|hahnchen|wurst|speck|lyoner|kassler|puten|rinder|rindfleisch|huhner|hunchen)|(?:fleisch|wurst)\b|\b(?:meat|pork|beef|chicken|turkey|ham|bacon|sausages?|salami|lamb|duck|veal|rind|huhn|pute)\b/;
/** Zeleninové zdroje dusičnanov (sk, cs, en, de). */
const ZELENINA = '\\b(zeler|celer|celery|sellerie|spenat|spinac|spinat|repa|repy|repu|cvikl|cervena repa|rote[ -]?bete|rote[ -]?rube|beet|beetroot|acerol|mangold|chard|swiss chard|mangold)';
/** Forma extraktu/prášku/koncentrátu (sk, cs, en, de). */
const FORMA = '(extrakt|extract|prasok|prasek|prach|koncentrat|concentrate|sava|stava|juice|saft|powder|pulver|konzentrat|pyre|puree|fermentovan|fermented|sirup|syrup|dusicnan|nitrate)';
const VEG_EXTRAKT = new RegExp(`${ZELENINA}[^,;]{0,25}${FORMA}|${FORMA}[^,;]{0,25}${ZELENINA}`);
/** Tvrdenie „bez É / bez dusitanov“ (sk, cs, en, de). */
const BEZ_DUSITANOV = /(bez (pridanych )?(dusitan|dusicnan|ecok|e-cok|konzervant|chemie)|bez (pridanych )?(dusitanu|dusicnanu|ecek|konzervantu)|no (added )?(nitrite|nitrate|preservative)|without (added )?(nitrite|nitrate|preservative)|nitrite[- ]free|nitrate[- ]free|uncured|ohne (zusatz von )?(nitrit|nitrat|pokel|konservierungsstoff)|ohne zugesetzte|no artificial preservative|no e-?numbers|free from e numbers|bez e\b)/;

const maMaso = (t: string, tagy: string[]) => MASO.test(t) || tagy.some((x) => /^(en:)?(meat|pork|beef|chicken|turkey|ham|bacon|sausage|salami|poultry|lamb|veal|duck|cured-meat|meat-products)/.test(x));

export function najdiRizika(r: Rozbor, d?: Doplnok): Riziko[] {
  const out: Riziko[] = [];
  const t = norm(r.text);
  const tagy = (d?.tagy ?? []).map((x) => x.toLowerCase());
  const eCisla = new Set(r.zlozky.map((z) => z.e?.replace(/\(.*\)|[a-z]$/g, '')).filter((x): x is string => !!x));
  const maso = maMaso(t, tagy) || r.zlozky.some((z) => z.priznaky.includes('udenina'));
  const E = (...c: string[]) => c.some((x) => eCisla.has(x));
  // 1. E249–E252
  const sDusitan = E('E249', 'E250', 'E251', 'E252') || tagy.some((x) => /^en:e25[0-2]/.test(x) || x === 'en:e249');
  if (sDusitan) out.push({ id: 'dusitany', preco: 'dusitany', nadpis: 'Dusitany/dusičnany (E249–E252)', zavaznost: 'pozor', text: 'Konzervanty v údeninách. Nitrozamíny môžu vznikať najmä pri opekaní údeniny; jedz občas a nepripaľuj.' });
  // 2. skrytý zdroj: zeleninový extrakt v mäsovom výrobku
  const vegExtrakt = VEG_EXTRAKT.test(t) || tagy.some((x) => /^(en:)?(celery|celery-extract|celery-powder|spinach|spinach-extract|beetroot|beet|beetroot-extract|acerola|acerola-extract|swiss-chard|chard)/.test(x) && /(extract|powder|juice|concentrate|puree)/.test(x));
  const tvrdi = BEZ_DUSITANOV.test(t) || tagy.some((x) => /no-nitrite|no-added-nitrite|without-nitrite|no-preservatives|no-e-numbers|nitrite-free/.test(x));
  if (maso && vegExtrakt && !sDusitan) {
    out.push({
      id: 'skryte-dusicnany', preco: 'bez-e-zelenina', nadpis: 'Skrytý zdroj dusičnanov/dusitanov', zavaznost: 'pozor',
      text: `Mäsový výrobok so zeleninovým extraktom, práškom alebo koncentrátom (zeler, špenát, repa, mangold, acerola). Je to rovnaká chémia ako E249–E252: dusičnan sa premení na dusitan.${tvrdi ? ' Tvrdenie „bez éčok / bez pridaných dusitanov“ preto nič nehovorí o tom, či výrobok dusitan obsahuje.' : ''}`,
    });
  }
  // 3. benzoan + kyselina askorbová
  if (E('E210', 'E211', 'E212', 'E213') && E('E300', 'E301')) {
    out.push({ id: 'benzen', preco: 'benzen-e211', nadpis: 'Benzoan (E211) + vitamín C (E300) v nápoji', zavaznost: 'info', text: 'Táto kombinácia môže pri teple a svetle tvoriť stopy benzénu. Pri bežnom pití ide o stopy; pre deti radšej voda alebo nesladený čaj.' });
  }
  // 4. údeniny (spracované mäso)
  if (r.zlozky.some((z) => z.priznaky.includes('udenina')) || sDusitan) {
    out.push({ id: 'udeniny', preco: 'udeniny', nadpis: 'Spracované mäso (údenina)', zavaznost: 'info', text: 'Údenina: veľa soli a pri vyššom príjme súvislosť s rakovinou hrubého čreva. Nie často a v malých porciách.' });
  }
  // 5. prvé zložky: pšeničná múka / pridaný cukor
  const prve = r.zlozky.filter((z) => z.hlbka === 0 && z.poradie < 3);
  if (prve.some((z) => z.priznaky.includes('rafinovana-muka'))) out.push({ id: 'muka', preco: 'psenicna-muka', nadpis: 'Pšeničná múka medzi prvými zložkami', zavaznost: 'info', text: 'Výrobok je z veľkej časti z bielej múky. Appka sa snaží múku obmedziť na 1–2 jedlá týždenne.' });
  if (prve.some((z) => z.priznaky.includes('cukor') || z.priznaky.includes('sirup'))) out.push({ id: 'cukor', preco: 'rafinovany-cukor', nadpis: 'Cukor medzi prvými zložkami', zavaznost: 'info', text: 'Cukor je medzi najväčšími zložkami – sladký výrobok, voľné cukry treba držať nízko.' });
  return out;
}
