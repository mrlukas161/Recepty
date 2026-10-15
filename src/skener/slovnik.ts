/** Slovník slov zloženia pre opravu OCR: názvy z databázy skenera (aditíva sk/cs/en) + bežné slovenské, české a anglické slová zo zložení.
 *  Porovnáva sa bez diakritiky (norm), zobrazí sa tvar s diakritikou. */
import { ADITIVA } from './aditiva';
import { norm } from './normalizacia';

const SK = `zloženie obsahuje obsahovať môže stopy stopy: pšeničná pšeničnej pšeničný pšeničné pšeničnú pšeničného múka múky múku mlieko mlieka mliečna mliečny mliečne mliečneho srvátka srvátky srvátkový srvátkového prášok prášku odtučnené odtučneného sušené sušeného sušená plnotučné cukor cukru cukry glukóza glukózy glukózový glukózo-fruktózový fruktóza fruktózy sirup sirupu invertný invertného dextróza maltodextrín škrob škrobu modifikovaný modifikovaného kukuričný kukuričného zemiakový ryžový ryžová ryža ryžové ražná ražnej raž jačmeň jačmenný jačmenného jačmenný ovsené ovsených ovsenej ovos vločky vločiek celozrnná celozrnnej celozrnné celozrnný celozrnného špalda špaldová špaldovej kamut slad sladový sladového sladový výťažok výťažku extrakt extraktu palmový palmového palmovej palmový tuk tuky tuku olej oleje oleja olejov rastlinný rastlinného rastlinné rastlinných repkový repkového slnečnicový slnečnicového olivový olivového kokosový kokosového stužený stuženého stužené hydrogenovaný hydrogenovaného masla maslo maslový smotana smotany smotanový syr syry syra tvaroh tvarohu jogurt jogurtu jogurtová kefír vajcia vajec vajce vaječný vaječné vaječného žĺtok žĺtky bielok bielky soľ soli jedlá morská jodidovaná kakao kakaový kakaová kakaové kakaovej kakaového hmota hmoty maslo čokoláda čokolády čokoládová lieskové lieskových lieskovce orechy orechov orech mandle mandlí mandľový arašidy arašidov arašidový sójový sójová sójové sójovej sójových soja sója lecitín lecitíny lecitínu sójový emulgátor emulgátory emulgátorov stabilizátor stabilizátory farbivo farbivá farbív konzervant konzervanty konzervačná antioxidant antioxidanty regulátor regulátory kyslosti kyselina kyseliny kyselín citrónová citrónovej mliečna askorbová octová jablčná fosforečná sorbová benzoová zahusťovadlo zahusťovadlá sladidlo sladidlá sladidiel aspartám sacharín sukralóza acesulfám sorbitol xylitol erytritol aróma arómy aróm prírodná prírodné prírodnej identická umelá vanilín vanilková vanilka korenie korenia škorica papriková paprika horčica horčicové zeler zelerový sezam sezamové sezamový tahini voda vody vodou ovocná ovocné ovocný ovocie ovocia dužina dužiny pretlak šťava šťavy koncentrát koncentrátu jablkový jablkové jablká jablko banán banány jahody jahoda maliny malina čučoriedky pomaranč pomarančový citrón citrónová citrónový paradajky paradajkový paradajkový cibuľa cesnak mrkva zemiaky zemiakov zelenina zeleniny zeleninový hrášok fazuľa šošovica cícer strukoviny strukovín kvasnice kvasníc droždie kypriaci kypriace prášok pečenie pečenia hydrogénuhličitan sodný uhličitan vápenatý vápnik horčík železo vitamín vitamíny vitamínov minerálne látky látka látky látok bielkovina bielkoviny bielkovín izolát hydrolyzát hydrolyzovaná hydrolyzované srvátkové mäso mäsa hovädzie bravčové kuracie morčacie šunka šunky saláma slanina klobása dusitan dusitanová dusitanov údené údená mäsový extrakt bujón kvasený kvasná kultúry kultúra mliečne baktérie živé želatína želírujúca pektín agar karagénan guma gumy xantánová guarová karob múka ľanové ľan semienka semien slnečnicové chia ovsená otruby otrúb pohánka pohánková proso kuskus bulgur krupica cestovina cestoviny cestovín chlieb pečivo kvások kysnutie kyslá kyslé kyslý kyselý nálev ocot octu horčičné hrozienka sušené marhule datle figy rôzne ostatné prímes prímesi zvyšky celkom minimálne najmenej približne podiel množstvo podľa hmotnosť objem objemu výrobok výrobku výrobky`;
const CS = `složení obsahuje může obsahovat stopy pšeničná pšeničné mouka mouky mléko mléka mléčná mléčné syrovátka syrovátky prášek odtučněné sušené cukr cukru sirup škrob škrobu kukuřičný bramborový rýže rýžová žitná ječmen ječný ovesné vločky celozrnná špalda sladový výtažek extrakt palmový tuk oleje olej rostlinný řepkový slunečnicový olivový kokosový ztužený ztužené máslo másla smetana sýr sýry tvaroh jogurt vejce vaječný žloutek bílek sůl soli kakao kakaová kakaové hmota čokoláda lískové ořechy ořech mandle arašídy sójový sójová sója lecitin emulgátor stabilizátor barvivo konzervant antioxidant regulátor kyselosti kyselina citronová zahušťovadlo sladidlo aroma přírodní vanilin vanilka koření hořčice celer sezam voda ovocná ovoce dužina šťáva jablko banán jahody malina citron citronová rajčata cibule česnek mrkev brambory zelenina hrách fazole čočka cizrna kvasnice kypřící prášek do pečiva hydrogenuhličitan sodný vápník hořčík železo vitamin vitaminy minerální látky látka bílkovina bílkoviny izolát maso masa hovězí vepřové kuřecí šunka salám slanina klobása dusitan uzené extrakt želatina želírující pektin karagenan guma xantanová guarová lněná semínka slunečnicová otruby pohanka jáhly kuskus bulgur krupice těstoviny chléb pečivo kvásek ocet nálev rozinky sušené meruňky datle fíky ostatní stopy minimálně nejméně přibližně podíl množství výrobek`;
const EN = `ingredients contains may contain traces wheat flour milk skimmed powder whey sugar glucose fructose syrup starch modified corn potato rice rye barley oat oats flakes wholegrain whole grain spelt malt extract palm oil vegetable fat rapeseed sunflower olive coconut hydrogenated butter cream cheese yogurt yoghurt egg eggs yolk white salt sea cocoa cocoa butter cocoa mass chocolate hazelnuts hazelnut nuts nut almonds peanuts soya soy lecithin lecithins emulsifier stabiliser stabilizer colour color preservative antioxidant acidity regulator citric acid thickener sweetener flavouring flavoring flavour natural vanillin vanilla spices mustard celery sesame water fruit juice concentrate apple banana strawberry raspberry lemon tomato onion garlic carrot potatoes vegetables peas beans lentils chickpeas yeast raising agent baking powder sodium bicarbonate calcium magnesium iron vitamin vitamins minerals protein proteins isolate meat beef pork chicken ham sausage bacon nitrite smoked gelatine gelling pectin carrageenan gum xanthan guar flax seeds sunflower bran buckwheat millet couscous bulgur semolina pasta bread vinegar raisins dried apricots dates figs other minimum approximately`;

type Zaznam = { norm: string; vzor: string };
let slovnik: Map<string, string> | null = null;
let podlaDlzky: Map<number, Zaznam[]> | null = null;

const SLOVO = /[\p{L}]+(?:-[\p{L}]+)*/gu;

function zostav() {
  if (slovnik) return;
  const m = new Map<string, string>();
  const pridaj = (w: string) => {
    for (const x of w.split(/[\s,/()]+/)) {
      const t = x.replace(/^-+|-+$/g, '');
      if (t.length < 3 || /\d/.test(t)) continue;
      const k = norm(t);
      if (!m.has(k) || (/[^\u0000-\u007f]/.test(t) && !/[^\u0000-\u007f]/.test(m.get(k)!))) m.set(k, t.toLowerCase());
    }
  };
  [SK, CS, EN].forEach(pridaj);
  for (const a of ADITIVA) for (const n of a.nazvy) pridaj(n);
  slovnik = m;
  podlaDlzky = new Map();
  for (const [k, v] of m) {
    const s = podlaDlzky.get(k.length) ?? [];
    s.push({ norm: k, vzor: v });
    podlaDlzky.set(k.length, s);
  }
}

export function jeSlovo(w: string): boolean { zostav(); return slovnik!.has(norm(w)); }
export function slovnikVelkost(): number { zostav(); return slovnik!.size; }

/** Najbližšie slovo zo slovníka (Levenshtein s prahom podľa dĺžky); undefined, ak nie je jednoznačné. */
export function najblizsieSlovo(w: string): { vzor: string; vzdialenost: number } | undefined {
  zostav();
  const k = norm(w);
  const presne = slovnik!.get(k);
  if (presne) return { vzor: presne, vzdialenost: 0 };
  const max = k.length < 5 ? 0 : k.length < 10 ? 1 : 2;
  if (!max) return undefined;
  // pri rovnakej vzdialenosti vyhráva náhrada písmena (typická chyba OCR) pred vynechaním/pridaním
  let najlepsie: { vzor: string; vzdialenost: number; skore: number } | undefined;
  let remiza = false;
  for (let d = k.length - max; d <= k.length + max; d++) {
    for (const z of podlaDlzky!.get(d) ?? []) {
      if (z.norm[0] !== k[0]) continue;
      const v = lev(k, z.norm, max);
      if (v > max) continue;
      const skore = v * 10 + Math.abs(z.norm.length - k.length);
      if (!najlepsie || skore < najlepsie.skore) { najlepsie = { vzor: z.vzor, vzdialenost: v, skore }; remiza = false; }
      else if (skore === najlepsie.skore && z.vzor !== najlepsie.vzor) remiza = true;
    }
  }
  return najlepsie && !remiza ? { vzor: najlepsie.vzor, vzdialenost: najlepsie.vzdialenost } : undefined;
}

function lev(a: string, b: string, max: number): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < min) min = v;
    }
    if (min > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const pocetDiakritiky = (x: string) => (x.match(/[^\u0000-\u007f]/g) ?? []).length;
const velke = (o: string, n: string) => (o === o.toUpperCase() && o.length > 2 ? n.toUpperCase() : o[0] === o[0].toUpperCase() && o[0] !== o[0].toLowerCase() ? n[0].toUpperCase() + n.slice(1) : n);

export interface OpravaSlova { z: string; na: string }

/** Slovníková oprava: preklepy (Levenshtein s prahom) a obnovenie diakritiky. Slová s číslicami (E-čísla, percentá) sa nedotýkajú. */
export function opravSlova(t: string): { text: string; opravy: OpravaSlova[] } {
  zostav();
  const opravy: OpravaSlova[] = [];
  const text = t.replace(SLOVO, (w, off: number) => {
    if (w.length < 5 || w.includes('-')) return w;
    const pred = t[off - 1];
    if (pred && /\d/.test(pred)) return w;
    const k = norm(w);
    const presne = slovnik!.get(k);
    if (presne) {
      // chýbajúca diakritika (OCR ju často zahodí) – doplníme z tvaru zo slovníka
      if (w === w.toLowerCase() && pocetDiakritiky(w) < pocetDiakritiky(presne)) { opravy.push({ z: w, na: presne }); return presne; }
      return w;
    }
    const n = najblizsieSlovo(w);
    if (!n || n.vzdialenost === 0) return w;
    const novy = velke(w, n.vzor);
    opravy.push({ z: w, na: novy });
    return novy;
  });
  return { text, opravy };
}

/** Spojí slová rozdelené na konci riadku („sla-\ndidlo“, „sladi\ndlo“). Spojenie bez pomlčky sa urobí len keď je výsledok slovo zo slovníka. */
export function spojRozdeleneSlova(t: string): string {
  zostav();
  return t
    // pomlčka na konci riadku: spoj, ak je výsledok slovo; inak ponechaj zloženinu („glukózo-fruktózový“)
    .replace(/(\p{L}+)-[ \t]*\r?\n[ \t]*(\p{L}+)/gu, (_m, a: string, b: string) => {
      if (jeSlovo(a + b)) return a + b;
      if ((jeSlovo(b) && jeSlovo(a)) || (a.length >= 5 && /o$/.test(a))) return `${a}-${b}`;
      return a + b;
    })
    // zlom bez pomlčky: spoj len keď obe časti nie sú slová a spojenie slovo je
    .replace(/(\p{L}{2,})[ \t]*\r?\n[ \t]*(\p{L}{2,})/gu, (m, a: string, b: string) => (!jeSlovo(a) && !jeSlovo(b) && jeSlovo(a + b) ? a + b : m));
}

/** Podiel slov (od 4 písmen) známych zo slovníka – hrubá miera kvality rozpoznaného textu (0–1). */
export function kvalitaTextu(t: string): number {
  zostav();
  const slova = (t.match(SLOVO) ?? []).filter((w) => w.length >= 4);
  if (!slova.length) return 0;
  return slova.filter((w) => jeSlovo(w) || najblizsieSlovo(w)).length / slova.length;
}

export interface RiadokOcr { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }

/** Pás textu: spoločný obdĺžnik riadkov s dostatočnou istotou a aspoň 3 písmenami (+ okraj). Vráti undefined, ak by orez nič neušetril. */
export function pasmoTextu(riadky: RiadokOcr[], sirka: number, vyska: number, okraj = 0.02): { left: number; top: number; width: number; height: number } | undefined {
  const dobre = riadky.filter((r) => r.confidence >= 55 && (r.text.match(/\p{L}/gu) ?? []).length >= 3);
  if (!dobre.length) return undefined;
  const x0 = Math.min(...dobre.map((r) => r.bbox.x0)), y0 = Math.min(...dobre.map((r) => r.bbox.y0));
  const x1 = Math.max(...dobre.map((r) => r.bbox.x1)), y1 = Math.max(...dobre.map((r) => r.bbox.y1));
  const px = Math.round(sirka * okraj), py = Math.round(vyska * okraj);
  const left = Math.max(0, x0 - px), top = Math.max(0, y0 - py);
  const width = Math.min(sirka, x1 + px) - left, height = Math.min(vyska, y1 + py) - top;
  if (width < 20 || height < 10) return undefined;
  if (width * height > 0.9 * sirka * vyska) return undefined;
  return { left, top, width, height };
}
