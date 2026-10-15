import type { Surovina } from '../data/types';

/**
 * Tabuľka bežných balení v obchode. Je to ODHAD (typické veľkosti v slovenských obchodoch),
 * nie údaj od konkrétneho predajcu – appka to hovorí aj používateľovi. Slúži len na to,
 * aby zoznam nevyzeral ako „732 g múky“, ale ako „1 kg“.
 */
export interface Balenie {
  velkost: number;                 // g alebo ml jedného balenia
  jednotka: 'g' | 'ml';
  kus?: string;                    // „konzerva“, „kelímok“ … → zobrazí sa „2 × konzerva 400 g“
}
const g = (velkost: number, kus?: string): Balenie => ({ velkost, jednotka: 'g', kus });
const ml = (velkost: number, kus?: string): Balenie => ({ velkost, jednotka: 'ml', kus });

export const POZNAMKA_BALENI = 'Veľkosti balení sú len odhad typických obchodných balení, nie údaj z konkrétneho obchodu.';

const PODLA_ID: Record<string, Balenie> = {
  'ovsene-vlocky': g(500), 'ovsena-muka': g(500), 'pohankova-muka': g(500), 'cicerova-muka': g(500),
  'strouhanka': g(500), 'kokos-struhany': g(100), 'mak': g(100), 'chia': g(200), 'lan-semienka': g(250), 'sezam': g(100),
  'vlasske-orechy': g(200), 'liesikove-orechy': g(200), 'mandle': g(200), 'slnecnicove-semienka': g(250), 'tekvicove-semienka': g(200),
  'arasidove-maslo': g(350, 'pohár'), 'tahini': g(250, 'pohár'),
  'hrozienka': g(200), 'datle-susene': g(250), 'datle': g(250), 'slivky-susene': g(200), 'marhule-susene': g(200),
  'cicer-konzerva': g(240, 'konzerva'), 'fazula-cervena-konzerva': g(240, 'konzerva'), 'tuniak-konzerva': g(120, 'konzerva'),
  'kukurica-konzerva': g(285, 'konzerva'), 'paradajky-konzervovane': g(400, 'konzerva'), 'paradajky-krajane-konzerva': g(400, 'konzerva'),
  'kvasena-kapusta': g(500), 'olivy': g(300, 'pohár'), 'kysle-uhorky': g(720, 'pohár'),
  'hrasok-mrazeny': g(450), 'edamame-mrazene': g(400), 'mrazena-zmes-zeleniny': g(450), 'rybie-prsty': g(450),
  'tofu-natur': g(200),
  'mlieko-polotucne': ml(1000), 'mlieko-plnotucne': ml(1000), 'mlieko-bezlaktozove': ml(1000),
  'mlieko-ovsene': ml(1000), 'mlieko-sojove': ml(1000), 'mlieko-mandlove': ml(1000), 'mlieko-kokosove': ml(400, 'konzerva'),
  'kefir': ml(450, 'téglik'), 'smotana-na-varenie': ml(200, 'téglik'), 'smotana-kysla': g(180, 'téglik'),
  'jogurt-biely': g(150, 'téglik'), 'jogurt-grecky': g(140, 'téglik'),
  'tvaroh-makky': g(250), 'tvaroh-polotucny': g(250), 'cottage': g(180, 'téglik'), 'bryndza': g(125), 'feta': g(200), 'mozzarella': g(125),
  'parmezan': g(100), 'syr-eidam': g(100), 'syr-eidam-45': g(100), 'syr-taviaci': g(140), 'hummus': g(200, 'téglik'),
  'maslo': g(250), 'maslo-pomazankove': g(250), 'mast-bravcova': g(250),
  'olej-repkovy': ml(1000), 'olej-slnecnicovy': ml(1000), 'olej-olivovy': ml(500), 'olej-lanovy': ml(250),
  'olej-kokosovy': ml(250, 'pohár'), 'olej-tekvicovy': ml(250),
  'cukor-biely': g(1000), 'cukor-pudrovy': g(500), 'vanilkovy-cukor': g(40), 'med': g(250, 'pohár'), 'javorovy-sirup': ml(250),
  'datlovy-sirup': ml(250), 'kakao': g(100), 'dzem': g(300, 'pohár'), 'cokolada-horka': g(100, 'tabuľka'),
  'kecup': g(500), 'horcica': g(250), 'sojova-omacka': ml(150), 'paradajkovy-pretlak': g(140, 'tuba'), 'paradajkova-passata': ml(680),
  'ocot-jablkovy': ml(500), 'vyvar-kocka': g(110, 'balenie'), 'puding-prasok': g(80, 'balenie'),
  'sunka-kuracia': g(100), 'sunka-bravcova': g(100),
};

/** Balenie pre surovinu alebo `undefined`, ak sa kupuje „na váhu“ (zelenina, mäso, údeniny). */
export function balenie(s: Surovina): Balenie | undefined {
  if (PODLA_ID[s.id]) return PODLA_ID[s.id];
  if (s.skupina === 'muky-obilniny') return s.id.includes('muka') ? g(1000) : g(500);
  if (s.skupina === 'cestoviny') return g(500);
  if (s.skupina === 'strukoviny' && s.oddelenie === 'strukoviny-konzervy') return g(500);
  return undefined;
}

/** Vajcia sa kupujú po 10 (v odhade; sú aj po 6, 15, 30). */
export const VAJCIA_V_BALENI = 10;
