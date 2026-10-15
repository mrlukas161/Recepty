/** Ďalšie zložky dôležité pre naše limity a zdravie (nie sú prídavné látky): cukry a sirupy, múky, tuky, údeniny, arómy, izoláty…
 *  `vzory` sú normalizované (bez diakritiky, malé písmená), hľadajú sa od začiatku slova; vyhráva najdlhší vzor. */
import type { Hodnotenie, PriznakZlozky } from './typy';

export interface ZlozkaDb {
  id: string;
  nazov: string;
  vzory: string[];
  priznaky: PriznakZlozky[];
  hodnotenie: Hodnotenie;
  /** vzory, ktoré zhodu zrušia (napr. „cukor“ v „bez pridaného cukru“) */
  okrem?: string[];
}

const hz = (stupen: Hodnotenie['stupen'], dovod: string, zdroje: string[], uroven: Hodnotenie['uroven'], extra: Partial<Hodnotenie> = {}): Hodnotenie => ({ stupen, dovod, zdroje, uroven, ...extra });

const CUKOR = hz('obmedzit', 'Pridaný (voľný) cukor. WHO odporúča držať voľné cukry pod 10 % energie, ideálne pod 5 %. Pozor na viac druhov cukru v jednom výrobku – tak sa cukor v zozname posúva nižšie.', ['who-2015-cukry'], 'stredné');
const SIRUP_MARKER = ' Je zároveň marker ultraspracovaného výrobku (NOVA).';

export const ZLOZKY: ZlozkaDb[] = [
  { id: 'cukor', nazov: 'Cukor', vzory: ['cukor', 'cukru', 'sugar', 'sacharoz', 'trstinov cukor', 'trstinovy cukor', 'hnedy cukor', 'kokosov cukor', 'kokosovy cukor', 'karamelizovan', 'melas'], priznaky: ['cukor'], hodnotenie: CUKOR, okrem: ['bez pridaneho cukru', 'bez cukru', 'cukrov', 'cukrovin', 'cukrovar'] },
  { id: 'glukoza', nazov: 'Glukóza / dextróza', vzory: ['glukoz', 'dextroz', 'glucose', 'dextrose', 'hroznovy cukor'], priznaky: ['cukor'], hodnotenie: { ...CUKOR, dovod: CUKOR.dovod + ' Glukóza a dextróza sú len iné názvy pre cukor.' } },
  { id: 'fruktoza', nazov: 'Fruktóza', vzory: ['fruktoz', 'fructose', 'ovocny cukor'], priznaky: ['cukor'], hodnotenie: { ...CUKOR, dovod: CUKOR.dovod + ' Fruktóza ako pridaný cukor sa do voľných cukrov počíta rovnako.' } },
  { id: 'sirup', nazov: 'Sirup (glukózový, glukózo-fruktózový, invertný…)', vzory: ['glukozov sirup', 'glukozovy sirup', 'glukozo-fruktozov', 'glukozofruktozov', 'fruktozo-glukozov', 'fruktozov sirup', 'fruktozovy sirup', 'kukuricny sirup', 'invertny', 'invertn', 'glukozno-fruktozov', 'sirup z', 'glukozno', 'high fructose', 'isoglukoz', 'izoglukoz', 'syrup', 'ryzovy sirup', 'ryzov sirup', 'sirup'], priznaky: ['sirup', 'cukor', 'ultra'], hodnotenie: { ...CUKOR, dovod: CUKOR.dovod + SIRUP_MARKER, zdroje: ['who-2015-cukry', 'monteiro-2019'] } },
  { id: 'med', nazov: 'Med', vzory: ['med ', 'med', 'honey'], priznaky: ['cukor'], hodnotenie: hz('obmedzit', 'Podľa WHO sa med počíta medzi voľné cukry (rovnako ako sirupy a šťavy). Prírodný pôvod z neho nerobí neobmedzenú potravinu.', ['who-2015-cukry'], 'stredné'), okrem: ['medov', 'medun', 'medvedi', 'medium'] },
  { id: 'javorovy-sirup', nazov: 'Javorový / agávový / datľový sirup', vzory: ['javorov', 'agavov', 'datlov sirup', 'datlovy sirup', 'maple', 'agave'], priznaky: ['cukor'], hodnotenie: CUKOR },
  { id: 'maltodextrin', nazov: 'Maltodextrín', vzory: ['maltodextrin', 'maltodextr'], priznaky: ['sirup', 'cukor', 'ultra'], hodnotenie: hz('obmedzit', 'Škrobový hydrolyzát (rýchlo vstrebateľný sacharid) pridávaný ako plnivo či sladidlo. Je to marker ultraspracovaného výrobku (NOVA).', ['monteiro-2019'], 'prax') },
  { id: 'rafinovana-muka', nazov: 'Pšeničná múka (biela)', vzory: ['psenicn muk', 'wheat flour', 'muk', 'muka'], okrem: ['celozrn', 'cele zrno', 'whole', 'razn muk', 'ryzov muk', 'kukuricn muk', 'pohankov muk', 'ovsen muk', 'cicerov muk', 'sojov muk', 'kokosov muk', 'mandlov muk', 'lanov muk'], priznaky: ['rafinovana-muka', 'lepok'], hodnotenie: hz('obmedzit', 'Obyčajná „pšeničná múka“ je zvyčajne biela (rafinovaná) múka bez otrúb a klíčkov; pre nás je to obmedzená položka (menej vlákniny a rýchlejší vzostup cukru v krvi). Na obale hľadaj slovo „celozrnná“.', ['monteiro-2019'], 'odhad') },
  { id: 'ina-muka', nazov: 'Iná múka (ražná, ryžová, pohánková…)', vzory: ['razn muk', 'ryzov muk', 'kukuricn muk', 'pohankov muk', 'ovsen muk', 'cicerov muk', 'sojov muk', 'kokosov muk', 'mandlov muk', 'lanov muk'], okrem: ['celozrn', 'cele zrno', 'whole'], priznaky: [], hodnotenie: hz('v-poriadku', 'Múka z inej plodiny. Či je celozrnná alebo biela, zo zloženia nepoznáme – hľadaj slovo „celozrnná“.', ['monteiro-2019'], 'odhad') },
  { id: 'celozrnne', nazov: 'Celozrnná múka / obilnina', vzory: ['celozrn', 'cele zrno', 'wholegrain', 'whole grain', 'wholemeal', 'ovsen vlock', 'ovsen', 'otrub', 'psenicn klieck', 'pohank'], priznaky: ['celozrnne', 'pozitivum'], hodnotenie: hz('bez-vyhrad', 'Celé zrno (celozrnné, ovsené vločky, pohánka) – viac vlákniny a menej spracovania než pri bielej múke. Je to dobrý znak.', ['monteiro-2019'], 'odhad') },
  { id: 'stuzeny-tuk', nazov: 'Stužený / hydrogenovaný tuk', vzory: ['stuzen', 'hydrogen', 'hydrogenovan', 'castocne stuzen', 'castocne hydrogen', 'partially hydrogenated', 'hardened'], priznaky: ['stuzeny-tuk', 'ultra', 'olej'], hodnotenie: hz('vyhnut-sa', 'Čiastočne hydrogenované tuky môžu obsahovať priemyselné trans-tuky. V EÚ platí limit 2 g trans-tukov na 100 g tuku; aj tak je výrobok so stuženým tukom signálom hlboko spracovanej potraviny.', ['eu-2019-649', 'monteiro-2019'], 'silné') },
  { id: 'interesterifikovany', nazov: 'Interesterifikovaný tuk', vzory: ['interesterif', 'frakcionovan', 'transesterif'], priznaky: ['ultra', 'olej'], hodnotenie: hz('obmedzit', 'Priemyselne upravený tuk – marker ultraspracovaného výrobku (NOVA).', ['monteiro-2019'], 'prax') },
  { id: 'palmovy-tuk', nazov: 'Palmový tuk / olej', vzory: ['palmov', 'palm oil', 'palm fat', 'palmojadr', 'palm kernel', 'palmiste'], priznaky: ['palmovy-tuk', 'olej'], hodnotenie: hz('obmedzit', 'Palmový tuk je bohatý na nasýtené tuky a pri rafinácii olejov vznikajú kontaminanty (glycidylestery, 3-MCPD), ktoré EFSA označila za obavu najmä u malých detí. Ide o kontaminant z rafinácie, nie o vlastnosť palmy ako takej.', ['efsa-2016-glycidyl'], 'stredné') },
  { id: 'olivovy-olej', nazov: 'Olivový olej', vzory: ['olivov', 'olive oil', 'olivy olej'], priznaky: ['olej', 'pozitivum'], hodnotenie: hz('bez-vyhrad', 'Olivový olej je základ stredomorského stravovania. V skener-databáze ho radíme medzi dobré tuky.', ['monteiro-2019'], 'prax') },
  { id: 'olej', nazov: 'Rastlinný olej (repkový, slnečnicový…)', vzory: ['repkov', 'slnecnicov', 'sojov olej', 'olej', 'oleje', 'rastlinny tuk', 'rastlinn tuk', 'rastlinny olej', 'oil', 'vegetable fat', 'kokosov tuk', 'kokosov olej', 'sezamov olej', 'lanov'], priznaky: ['olej'], hodnotenie: hz('v-poriadku', 'Rastlinný olej bez ďalšej špecifikácie (nevieme, ktorý). Vo výrobku je bežný; kvalita závisí od druhu a spracovania (rafinácia).', ['efsa-2016-glycidyl'], 'odhad') },
  { id: 'maslo', nazov: 'Maslo', vzory: ['maslo', 'masla', 'butter', 'maslov'], okrem: ['kakaov', 'arasidov', 'mandlov'], priznaky: [], hodnotenie: hz('v-poriadku', 'Mliečny tuk, tradičná surovina. V porovnaní s rastlinnými olejmi viac nasýtených tukov, preto striedmo.', ['monteiro-2019'], 'odhad') },
  { id: 'sol', nazov: 'Soľ', vzory: ['sol ', 'sol', 'jedla sol', 'morska sol', 'kuchynska sol', 'salt', 'sodna sol'], okrem: ['solanin', 'soli'], priznaky: ['sol'], hodnotenie: hz('v-poriadku', 'Soľ je potrebná, no u detí aj dospelých jej väčšinou jeme priveľa. Čím vyššie je v zozname, tým viac jej výrobok obsahuje.', ['monteiro-2019'], 'odhad') },
  { id: 'aroma', nazov: 'Aróma', vzory: ['aroma', 'arom', 'flavour', 'flavoring', 'flavouring', 'vanilin', 'vanilkov aroma', 'identick s prirodn', 'umela aroma', 'vanillin', 'natural flavour', 'natural flavor'], priznaky: ['aroma', 'ultra'], hodnotenie: hz('v-poriadku', '„Prírodná aróma“ je právna kategória (získaná z prírodného materiálu fyzikálnymi, enzymatickými alebo mikrobiologickými postupmi) a nehovorí nič o zdravotnej hodnote. Prítomnosť arómy je marker ultraspracovaného výrobku (NOVA) – chuť sa dodáva zvonka.', ['eu-1334-2008', 'monteiro-2019'], 'silné') },
  { id: 'upraveny-skrob', nazov: 'Modifikovaný škrob', vzory: ['modifikovan skrob', 'modifikovany skrob', 'upraven skrob', 'upraveny skrob', 'modified starch', 'modifikovan'], priznaky: ['upraveny-skrob', 'ultra'], hodnotenie: hz('v-poriadku', 'EFSA (2017) nenašla pri hlásených použitiach bezpečnostnú obavu, ale modifikovaný škrob je marker ultraspracovaného výrobku (NOVA).', ['efsa-2017-skroby', 'monteiro-2019'], 'stredné') },
  { id: 'skrob', nazov: 'Škrob', vzory: ['skrob', 'starch', 'zemiakov skrob', 'kukuricn skrob'], priznaky: [], hodnotenie: hz('v-poriadku', 'Obyčajný škrob (kukuričný, zemiakový) na zahusťovanie; v kuchyni ho používame aj doma.', ['monteiro-2019'], 'prax') },
  { id: 'izolat', nazov: 'Izolát bielkovín / hydrolyzát', vzory: ['izolat', 'izolatu', 'proteinov izolat', 'bielkovinov izolat', 'protein isolate', 'hydrolyzovan', 'hydrolyzat', 'hydrolysed', 'hydrolyzed', 'texturovan', 'sojov proteinov', 'sojovy protein', 'sojov bielkov', 'koncentrat bielkov', 'koncentrat srvat', 'proteinov koncentr'], priznaky: ['izolat', 'hydrolyzat', 'ultra'], hodnotenie: hz('obmedzit', 'Izolované alebo hydrolyzované bielkoviny sú podľa NOVA marker ultraspracovaného výrobku – v domácej kuchyni sa nepoužívajú. Ide o znak spracovania, nie o dôkaz škodlivosti samotnej látky.', ['monteiro-2019'], 'prax') },
  { id: 'maso-oddelene', nazov: 'Mechanicky oddelené mäso', vzory: ['mechanicky oddelen', 'mechanicky separ', 'moo ', 'mechanically separated'], priznaky: ['maso-oddelene', 'ultra'], hodnotenie: hz('obmedzit', 'Mechanicky oddelené mäso (zvyšky mäsa z kostí) patrí medzi markery ultraspracovaných výrobkov podľa NOVA.', ['monteiro-2019'], 'prax') },
  { id: 'udenina', nazov: 'Údenina / spracované mäso', vzory: ['sunk', 'salam', 'slanin', 'klobas', 'parok', 'uden', 'mortadel', 'ham', 'bacon', 'sausage', 'cabanos', 'tlacenk', 'jaternic', 'jelita', 'pastet'], priznaky: ['udenina'], hodnotenie: hz('obmedzit', 'Spracované mäso (údené, solené, konzervované s dusitanmi). IARC (2015) ho zaradila do skupiny 1: dostatočné dôkazy o súvise s rakovinou hrubého čreva a konečníka; každých 50 g denne ≈ o 18 % vyššie riziko. Skupina vyjadruje silu dôkazu, nie veľkosť rizika; absolútne riziko jednotlivca je malé.', ['iarc-2015-maso'], 'stredné', { deti: 'obmedzit' }) },
  { id: 'bezna', nazov: 'Bežná surovina', vzory: ['hazelnut', 'tahin', 'citronov', 'milk', 'cocoa', 'soy', 'water', 'egg', 'salt', 'oat', 'hrasok', 'kvasnic', 'kmin', 'vitamin', 'kultur', 'extrakt', 'sosovic', 'fazul', 'cicer', 'paradajk', 'mrkv', 'cibul', 'cesnak', 'spenat', 'brokolic', 'tekvic', 'jablk', 'banan', 'jahod', 'malin', 'bobul', 'zemiak', 'ryz', 'cirok', 'pohank', 'ovocn', 'ovocie', 'zeleninov', 'paprik', 'cuketa', 'bazalk', 'oregan', 'petrzlen', 'koren', 'orech', 'mandl', 'lieskov', 'semien', 'slnecnic', 'chia', 'sezam', 'kakao', 'kakaova hmota', 'kakaov', 'mlieko', 'mlek', 'vajc', 'vajec', 'jogurt', 'syr', 'tvaroh', 'voda', 'sukala', 'maso', 'kurac', 'hovadzi', 'bravcov', 'ryba', 'losos', 'tuniak', 'kvasnic', 'kvasky'], priznaky: [], hodnotenie: hz('bez-vyhrad', 'Bežná surovina (potravina), nie prídavná látka.', ['monteiro-2019'], 'odhad') },
];

export interface VzorIdx { v: string; z: ZlozkaDb }
export const VZORY_IDX: VzorIdx[] = ZLOZKY.flatMap((z) => z.vzory.map((v) => ({ v: v.trim(), z }))).sort((a, b) => b.v.length - a.v.length);

/** Vzor → regex: slová sú začiatky slov, oddelené ľubovoľným koncom slova a medzerou. */
function naRegex(v: string): RegExp {
  const casti = v.split(/\s+/).filter(Boolean).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?:^|[^a-z0-9])${casti.join('[a-z0-9]*[ \\-]+')}`);
}
const REGEXY = VZORY_IDX.map((x) => ({ ...x, re: naRegex(x.v) }));

/** Najdlhší zhodný vzor v normalizovanom texte. */
export function najdiZlozku(normText: string): ZlozkaDb | undefined {
  for (const { v, z, re } of REGEXY) {
    if (!re.test(normText)) continue;
    if (z.okrem?.some((o) => naRegex(o).test(normText))) continue;
    void v;
    return z;
  }
  return undefined;
}
