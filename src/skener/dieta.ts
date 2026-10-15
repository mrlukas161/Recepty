/** Dôkladnejšie upozornenia pre diétu Bezlepková, Bez laktózy a pre alergie (lepok, mlieko).
 *  Rozpoznanie podľa slov v zložení; každé upozornenie má zdroj a úroveň dôkazov (alebo je označené ako prax). */
import { alergenyVTexte } from './alergeny';
import { norm } from './normalizacia';
import type { Rozbor, Zlozka } from './typy';
import type { Alergen } from '../data/types';

export type ZavaznostUpozornenia = 'vysoka' | 'stredna' | 'info';
export interface UpozornenieDiety {
  tema: 'lepok' | 'laktoza' | 'mlieko';
  zavaznost: ZavaznostUpozornenia;
  text: string;
  /** id zdrojov v src/data/zdroje/skener.json */
  zdroje: string[];
  /** úroveň dôkazov alebo „prax, nie dôkaz“ */
  uroven: string;
}
export interface NastaveniaDiety { diety?: string[]; alergie?: Alergen[] }

const BEZ_LEPKU = /bezlepkov|bez lepku|gluten[ -]free|free from gluten|sans gluten|bez glutenu|glutenfrei|sin gluten/;
const BEZ_LAKTOZY = /bez laktoz|lactose[ -]free|sans lactose|laktosefrei|bez laktozy/;

interface Vzor { re: RegExp; nazov: string; kriz?: boolean }
const LEPOK: Vzor[] = [
  { re: /\bpsenic|\bwheat|\bpsenic/, nazov: 'pšenica' },
  { re: /\braz\b|\brazn|\brye\b/, nazov: 'raž' },
  { re: /\bjacmen|\bjecmen|\bbarley/, nazov: 'jačmeň' },
  { re: /\bspald|\bspelt/, nazov: 'špalda' },
  { re: /\bkamut|\bkhorasan/, nazov: 'kamut' },
  { re: /\bovos|\bovsen|\boat/, nazov: 'ovos', kriz: true },
  { re: /\bslad(ov\w*)?\b|\bmalt\b|\bmalt extract|\bsladov/, nazov: 'sladový výťažok / slad' },
  { re: /\bseitan|\bbulgur|\bkuskus|\bcouscous|\bsemolin|\bdurum/, nazov: 'pšeničný výrobok (kuskus, bulgur, seitan, krupica)' },
  { re: /\bkrupic/, nazov: 'krupica (zvyčajne pšeničná)' },
];
const PSENO = /\bpseno\b|\bpsenka\b/;
/** Pšeničný glukózový sirup, dextróza, maltodextrín: výnimky z označovania alergénov podľa prílohy II. */
const VYNIMKA_PSENICA = /psenic\w* (glukozov|dextroz|maltodextr)|wheat (glucose|dextrose|maltodextrin)/;

const MLIEKO: Vzor[] = [
  { re: /\bsyr\b|\bsyra\b|\bsyry\b|\bsyrov|\bcheese|\btvaroh|\bparmezan|\bmozzarel|\bcheddar|\bgouda|\bhermelin|\bfeta|\bbryndz|\bcottage|\bricotta|\bmascarpone/, nazov: 'syr', kriz: true },
  { re: /\bsmetan|\bsmotan|\bcream/, nazov: 'smotana' },
  { re: /\bmaslo\b|\bmasla\b|\bmaslov|\bbutter/, nazov: 'maslo' },
  { re: /\bsrvat|\bwhey|\blactoserum/, nazov: 'srvátka' },
  { re: /\bkazein|\bcasein|\bmliecn\w* bielkov|\bmilk protein/, nazov: 'mliečna bielkovina' },
  { re: /\blaktoz|\blactose/, nazov: 'laktóza' },
  { re: /\bjogurt|\bkefir|\byogurt|\bpodmasl|\bacidofil/, nazov: 'kyslomliečny výrobok' },
  { re: /\bmlie|\bmlec|\bmilk|\bmlek|\blait\b/, nazov: 'mlieko' },
];

const skus = (vzory: Vzor[], t: string) => vzory.find((v) => v.re.test(t));

export function upozorneniaDiety(r: Rozbor, n: NastaveniaDiety): UpozornenieDiety[] {
  const out: UpozornenieDiety[] = [];
  const diety = n.diety ?? [];
  const alergie = n.alergie ?? [];
  const bezLepku = diety.includes('bezlepkova') || alergie.includes('lepok');
  const bezLaktozy = diety.includes('bez-laktozy');
  const alMlieko = alergie.includes('mlieko');
  const celyText = norm(r.text);
  const oznacenyBezLepku = BEZ_LEPKU.test(celyText);
  const oznacenyBezLaktozy = BEZ_LAKTOZY.test(celyText);
  const kdeMeno = (z: Zlozka) => (z.povodny.length > 40 ? z.povodny.slice(0, 40) + '…' : z.povodny);

  if (bezLepku) {
    const najdene = new Map<string, { vzor: Vzor; zlozky: string[] }>();
    const vynimky: string[] = [];
    for (const z of r.zlozky) {
      const t = norm(z.povodny).replace(BEZ_LEPKU, ' ').replace(PSENO, ' ');
      if (VYNIMKA_PSENICA.test(t)) { vynimky.push(kdeMeno(z)); continue; }
      const v = skus(LEPOK, t);
      if (!v) continue;
      const e = najdene.get(v.nazov) ?? { vzor: v, zlozky: [] };
      e.zlozky.push(kdeMeno(z));
      najdene.set(v.nazov, e);
    }
    for (const { vzor, zlozky } of najdene.values()) {
      const kde = [...new Set(zlozky)].slice(0, 3).join(', ');
      if (vzor.kriz) {
        out.push(oznacenyBezLepku
          ? { tema: 'lepok', zavaznost: 'info', text: `Obsahuje ovos (${kde}), no výrobok je označený ako bezlepkový – ovos v takom výrobku musí byť vyrobený tak, aby ho nekontaminovala pšenica, raž ani jačmeň (limit 20 mg lepku/kg).`, zdroje: ['eu-828-2014'], uroven: 'dôkazy: silné (právny predpis)' }
          : { tema: 'lepok', zavaznost: 'vysoka', text: `Obsahuje ovos (${kde}). Ovos je v EÚ zozname obilnín s lepkom a pri zbere, preprave a spracovaní ho môže kontaminovať pšenica, raž či jačmeň (dôvod pre pravidlá o bezlepkovom ovse) – bez označenia „bezlepkový“ ho pri bezlepkovej diéte nepovažuj za bezpečný.`, zdroje: ['eu-1169-2011-ii', 'eu-828-2014'], uroven: 'dôkazy: silné (právne predpisy)' });
      } else {
        out.push({ tema: 'lepok', zavaznost: oznacenyBezLepku ? 'stredna' : 'vysoka', text: `Lepok: ${vzor.nazov} (${kde}).${oznacenyBezLepku ? ' Na obale je zároveň „bezlepkový“ – over to na samotnom obale, rozpor je podozrivý.' : ''}`, zdroje: ['eu-1169-2011-ii'], uroven: 'dôkazy: silné (zoznam alergénov EÚ)' });
      }
    }
    if (vynimky.length) out.push({ tema: 'lepok', zavaznost: 'info', text: `Pšeničný glukózový sirup, dextróza alebo maltodextrín (${[...new Set(vynimky)].slice(0, 3).join(', ')}) majú v EÚ výnimku z povinného označovania ako alergén. Pri celiakii je istejšie výrobok s označením „bezlepkový“.`, zdroje: ['eu-1169-2011-ii', 'eu-828-2014'], uroven: 'dôkazy: silné (právny predpis)' });
    if (r.stopy.includes('lepok')) out.push({ tema: 'lepok', zavaznost: 'vysoka', text: 'Môže obsahovať stopy lepku (krížová kontaminácia vo výrobe). Pri celiakii sa nespoliehaj na neprítomnosť varovania – označenie „môže obsahovať“ je dobrovoľné; istotu dáva označenie „bezlepkový“.', zdroje: ['aoecs-pal', 'eu-828-2014'], uroven: 'dôkazy: slabé (vyhľadávanie, tlačová správa AOECS)' });
    else if (!oznacenyBezLepku && r.zlozky.length) out.push({ tema: 'lepok', zavaznost: 'info', text: 'Výrobok nie je označený ako bezlepkový. Aj bez lepku v zložení môže byť vo výrobe prímes (stopy); „môže obsahovať“ je dobrovoľné označenie, preto pri celiakii vyberaj výrobky s označením „bezlepkový“ (limit 20 mg/kg).', zdroje: ['eu-828-2014', 'aoecs-pal'], uroven: 'dôkazy: silné (limit), slabé (dobrovoľnosť označenia)' });
  }

  if (bezLaktozy || alMlieko) {
    const najdene = new Map<string, { vzor: Vzor; zlozky: string[] }>();
    for (const z of r.zlozky) {
      if (!alergenyVTexte(z.povodny).includes('mlieko') && !z.alergeny.includes('mlieko')) continue;
      const t = norm(z.povodny).replace(BEZ_LAKTOZY, ' ');
      const v = skus(MLIEKO, t) ?? { re: /./, nazov: 'mliečna zložka' };
      const e = najdene.get(v.nazov) ?? { vzor: v, zlozky: [] };
      e.zlozky.push(kdeMeno(z));
      najdene.set(v.nazov, e);
    }
    if (!najdene.size && r.alergeny.includes('mlieko')) najdene.set('mlieko', { vzor: { re: /./, nazov: 'mlieko' }, zlozky: ['(podľa údajov o alergénoch)'] });
    for (const { vzor, zlozky } of najdene.values()) {
      const kde = [...new Set(zlozky)].slice(0, 3).join(', ');
      if (alMlieko) { out.push({ tema: 'mlieko', zavaznost: 'vysoka', text: `ALERGIA NA MLIEKO: ${vzor.nazov} (${kde}). Pri alergii na mliečnu bielkovinu nepomôže ani „bez laktózy“ – také výrobky mliečnu bielkovinu stále obsahujú.`, zdroje: ['eu-1169-2011-ii'], uroven: 'dôkazy: silné (zoznam alergénov EÚ)' }); continue; }
      if (vzor.nazov === 'syr') out.push({ tema: 'laktoza', zavaznost: 'stredna', text: `Syr (${kde}): čerstvé syry (tvaroh, mozzarella, cottage) laktózu obsahujú; dlho vyzreté tvrdé syry jej majú zvyčajne málo, ale údaje o množstve sa v zdrojoch výrazne rozchádzajú – skús opatrne a podľa vlastnej tolerancie.`, zdroje: [], uroven: 'prax, nie dôkaz' });
      else if (vzor.nazov === 'maslo') out.push({ tema: 'laktoza', zavaznost: 'stredna', text: `Maslo (${kde}) je takmer čistý mliečny tuk a laktózy obsahuje málo; pri citlivej intolerancii však pozor na menšie množstvá.`, zdroje: [], uroven: 'prax, nie dôkaz' });
      else if (vzor.nazov === 'mliečna bielkovina') out.push({ tema: 'laktoza', zavaznost: 'stredna', text: `Mliečna bielkovina / kazeín (${kde}) je bielkovina, nie cukor laktóza; stopy laktózy v nej však môžu zostať. Pri intolerancii laktózy je to menší problém než mlieko či srvátka, pri alergii na mlieko je to alergén.`, zdroje: ['eu-1169-2011-ii'], uroven: 'prax, nie dôkaz (rozdiel laktóza vs. bielkovina: príloha II)' });
      else out.push({ tema: 'laktoza', zavaznost: vzor.nazov === 'kyslomliečny výrobok' ? 'stredna' : 'vysoka', text: `Laktóza: ${vzor.nazov} (${kde}) obsahuje mliečny cukor.${vzor.nazov === 'srvátka' ? ' Srvátkový prášok býva bohatý na laktózu.' : ''}`, zdroje: ['eu-1169-2011-ii'], uroven: 'dôkazy: silné (mlieko vrátane laktózy je v zozname alergénov EÚ)' });
    }
    if (r.stopy.includes('mlieko')) out.push({ tema: alMlieko ? 'mlieko' : 'laktoza', zavaznost: alMlieko ? 'vysoka' : 'info', text: alMlieko ? 'Môže obsahovať stopy mlieka – pri alergii je to varovanie, ktoré netreba ignorovať (označenie je dobrovoľné, jeho absencia nie je záruka).' : 'Môže obsahovať stopy mlieka. Pri intolerancii laktózy zvyčajne ide o malé množstvá; pri alergii na mlieko je to varovanie.', zdroje: ['aoecs-pal'], uroven: 'dôkazy: slabé (vyhľadávanie)' });
    if (!alMlieko && oznacenyBezLaktozy) out.push({ tema: 'laktoza', zavaznost: 'info', text: 'Výrobok je označený ako „bez laktózy“ – laktóza je rozložená alebo odstránená, ale mliečna bielkovina v ňom ostáva (nevhodné pri alergii na mlieko).', zdroje: [], uroven: 'prax, nie dôkaz' });
  }
  return out;
}

/** Penalizácia v skóre „Tvoje nastavenia“. */
export const PENALIZACIA_DIETY: Record<ZavaznostUpozornenia, number> = { vysoka: 60, stredna: 20, info: 0 };
