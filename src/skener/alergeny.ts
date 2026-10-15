/** 14 alergénov EÚ – rozpoznanie podľa slov v zložení (sk, cs, en). Hľadá sa na začiatku slova v normalizovanom texte. */
import type { Alergen } from '../data/types';
import { norm } from './normalizacia';

export const ALERGEN_NAZOV: Record<Alergen, string> = {
  lepok: 'Obilniny s lepkom', korovce: 'Kôrovce', vajcia: 'Vajcia', ryby: 'Ryby', arasidy: 'Arašidy', soja: 'Sója', mlieko: 'Mlieko',
  orechy: 'Orechy (škrupinové plody)', zeler: 'Zeler', horcica: 'Horčica', sezam: 'Sezam', siricitany: 'Oxid siričitý a siričitany',
  vlcibob: 'Vlčí bôb', makkyse: 'Mäkkýše',
};

const VZORY: Record<Alergen, string[]> = {
  lepok: ['psenic', 'psenice', 'wheat', 'raz ', 'razn', 'jacmen', 'jecmen', 'barley', 'ovos', 'ovsen', 'ovs', 'oat', 'spalda', 'spelt', 'kamut', 'lepok', 'lepk', 'glutén', 'gluten', 'seitan', 'bulgur', 'krupica', 'semolin', 'cirok', 'rye', 'pivovarsk', 'sladov', 'slad '],
  korovce: ['korovc', 'kreve', 'krab', 'languste', 'langust', 'homar', 'raky', 'rak ', 'shrimp', 'prawn', 'crab', 'lobster', 'krill'],
  vajcia: ['vajc', 'vajec', 'vaje', 'vejce', 'egg', 'albumin', 'ovalbumin'],
  ryby: ['ryb', 'losos', 'tuniak', 'treska', 'sardink', 'sardel', 'ancov', 'makrel', 'pstruh', 'fish', 'rybi'],
  arasidy: ['arasid', 'arasidy', 'burak', 'peanut', 'arašíd'],
  soja: ['soj', 'soy', 'edamame', 'tofu', 'tempeh', 'miso'],
  mlieko: ['mlie', 'mlec', 'srvat', 'laktoz', 'smetan', 'smotan', 'maslo', 'maslov', 'syr', 'tvaroh', 'kazein', 'jogurt', 'kefir', 'milk', 'whey', 'butter', 'cheese', 'cream', 'casein', 'lactose', 'mleko', 'sladk srvatk'],
  orechy: ['mandl', 'lieskov', 'vlasske', 'vlassk', 'kesu', 'pekan', 'para orech', 'pistac', 'makadam', 'orech', 'orechy', 'almond', 'hazelnut', 'walnut', 'cashew', 'pecan', 'pistach', 'nut ', 'nuts'],
  zeler: ['zeler', 'celer', 'celery'],
  horcica: ['horcic', 'mustard', 'horcice'],
  sezam: ['sezam', 'sesame', 'tahini'],
  siricitany: ['oxid siricit', 'siricitan', 'sulfit', 'sulphite', 'sulfite', 'siricit', 'sulphur dioxide'],
  vlcibob: ['vlci bob', 'vlciho bob', 'vlcibob', 'lupin'],
  makkyse: ['makky', 'slimak', 'musl', 'ustric', 'kalamar', 'chobotnic', 'sepia', 'molluscs', 'mollusc', 'oyster', 'squid', 'mussel', 'snail'],
};

/** Slová, ktoré vyzerajú ako alergén, ale nie sú (napr. „kakaové maslo“ nie je mlieko, „muškátový orech“ nie je orech, „kokos“). */
const VYNIMKY = [/kakaov\w* maslo/g, /kakaov\w* masla/g, /muskatov\w* orech/g, /kokosov\w* mlie\w*/g, /kokosov\w* smet\w*/g, /mandlov\w* mlie\w*/g, /ryzov\w* mlie\w*/g, /ovsen\w* mlie\w*/g, /sojov\w* mlie\w*/g, /bezlepkov\w*/g, /syrup\w*/g, /sans gluten/g, /gluten[ -]free/g, /free from gluten/g, /bez glutenu/g, /glutenfrei/g, /sin gluten/g, /bez lepku/g, /mak\b/g, /ceresn\w*/g];

export interface NajdeneAlergeny { alergeny: Alergen[]; kluce: Record<string, Alergen[]> }

export function alergenyVTexte(text: string): Alergen[] {
  let t = ' ' + norm(text) + ' ';
  for (const v of VYNIMKY) t = t.replace(v, ' ');
  const out: Alergen[] = [];
  for (const [a, vzory] of Object.entries(VZORY) as [Alergen, string[]][]) {
    for (const v of vzory) {
      const hladany = v.endsWith(' ') ? ' ' + v : ' ' + v;
      if (t.includes(hladany)) { out.push(a); break; }
    }
  }
  return out;
}
