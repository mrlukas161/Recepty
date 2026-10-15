/** Naše hodnotenia prídavných látok. Každé má dôvod, zdroje (id v src/data/zdroje/skener.json) a úroveň dôkazov.
 *  Zásada: povolená látka nie je automaticky „jed“; preventívne obavy sú označené `preventivne`.
 *  Látky bez vlastného hodnotenia dostanú predvolenú hodnotu (`predvolene`). */
import type { Hodnotenie, Stupen, UrovenDokazov } from './typy';

export type HodnotenieAd = Hodnotenie & { ultra?: boolean };

function h(stupen: Stupen, dovod: string, zdroje: string[], uroven: UrovenDokazov, extra: Partial<HodnotenieAd> = {}): HodnotenieAd {
  return { stupen, dovod, zdroje, uroven, ...extra };
}
const rad = (cisla: string[], x: HodnotenieAd, o: Record<string, HodnotenieAd>) => { for (const c of cisla) o[c] = x; };

export const KOZMETICKE_TRIEDY = ['colour', 'emulsifier', 'flavour-enhancer', 'sweetener', 'thickener', 'stabiliser', 'glazing-agent', 'bulking-agent', 'foaming-agent', 'humectant'];

export const PREDVOLENE_TRIEDY: Record<string, Hodnotenie> = {
  default: {
    stupen: 'v-poriadku', predvolene: true, uroven: 'odhad', zdroje: ['eu-1333-2008'],
    dovod: 'Povolená v EÚ po hodnotení bezpečnosti pre dané použitie. Vlastné posúdenie tejto látky sme zatiaľ nespísali – ide o predvolenú hodnotu podľa funkcie (odhad), nie o zdravotný prínos.',
  },
};

export const HODNOTENIA: Record<string, HodnotenieAd> = {};
const H = HODNOTENIA;

// ---- bežné látky, známe z kuchyne ----
rad(['E330', 'E331', 'E332', 'E333', 'E296', 'E270', 'E300', 'E301', 'E306', 'E290', 'E500', 'E501', 'E101', 'E100', 'E160a', 'E440', 'E406', 'E322', 'E334', 'E375'],
  h('bez-vyhrad', 'Látka, ktorá sa bežne nachádza v potravinách alebo sa používa aj v domácej kuchyni (napr. kyselina citrónová, vitamín C, pektín, lecitín, sóda). Povolená po hodnotení bezpečnosti; nie sú nám známe obavy pri bežnom príjme. Vlastné hodnotenie – odhad.', ['eu-1333-2008'], 'odhad', { ultra: false }), H);

// ---- farbivá ----
rad(['E102', 'E104', 'E110', 'E122', 'E124', 'E129'],
  h('obmedzit', 'EÚ vyžaduje na obale text „môže nepriaznivo ovplyvňovať aktivitu a pozornosť detí“. Podkladom je RCT na deťoch (zmes farbív a benzoanu sodného zvýšila hyperaktivitu); účinok je malý a nedá sa pripísať jednej látke. Pre deti radšej vynechať.', ['mccann-2007'], 'stredné', { deti: 'vyhnut-sa', ultra: true }), H);
H.E133 = h('v-poriadku', 'EFSA znížila ADI; pri vysokom príjme (napr. farebné sladkosti a nápoje) sa u detí môže prekračovať. Pre deti striedmo.', ['efsa-2010-e133'], 'stredné', { deti: 'obmedzit', ultra: true });
rad(['E150a', 'E150b', 'E150c', 'E150d'], h('v-poriadku', 'Karamelové farbivo: EFSA nenašla genotoxicitu ani karcinogenitu, ale vysokí konzumenti môžu skupinovú ADI pri maximálnych úrovniach použitia prekročiť. Najmä marker ultraspracovaného výrobku (farbí, aby výrobok vyzeral inak).', ['efsa-2011-karamel'], 'stredné', { ultra: true }), H);
H.E171 = h('vyhnut-sa', 'EFSA v roku 2021 uviedla, že E171 sa nedá považovať za bezpečný, lebo genotoxicitu nemožno vylúčiť. V EÚ je zakázaný od 2022 – ak ho vidíš na výrobku, ide o dovoz alebo starú zásobu. Preventívna obava, nie preukázaná škoda u ľudí.', ['efsa-2021-tio2'], 'slabé', { preventivne: true, ultra: true });

// ---- konzervanty ----
rad(['E249', 'E250', 'E251', 'E252'],
  h('obmedzit', 'Dusitany a dusičnany sa používajú v údeninách. EFSA stanovila ADI pre dusitany (0,07 mg/kg/deň), pričom sa prekračuje hlavne pri započítaní všetkých zdrojov. Spracované mäso samotné IARC zaradila do skupiny 1 (súvis s rakovinou hrubého čreva) – nejde však izolovane o dusitany. Absolútne riziko pre jednotlivca je malé; stačí údeniny obmedziť.', ['efsa-2017-dusitany', 'iarc-2015-maso'], 'stredné', { deti: 'obmedzit' }), H);
rad(['E200', 'E202', 'E201', 'E203'], h('v-poriadku', 'Sorbany: od roku 2019 platí vyššia ADI (11 mg/kg/deň) pre sorbovú kyselinu a sorban draselný.', ['efsa-2019-sorbany'], 'stredné'), H);
rad(['E210', 'E211', 'E212', 'E213'], h('v-poriadku', 'Benzoany: bez obavy z genotoxicity, ale pri ochutených nápojoch sa ADI môže u batoliat a detí prekračovať. Pre deti radšej nápoje bez benzoanu.', ['efsa-2016-benzoany'], 'stredné', { deti: 'obmedzit' }), H);
rad(['E220', 'E221', 'E222', 'E223', 'E224', 'E226', 'E227', 'E228'], h('obmedzit', 'Siričitany: EFSA v roku 2022 starú ADI nepotvrdila pre nedostatok údajov a pri maximálnych povolených hladinách je bezpečnostná rezerva nízka. Oxid siričitý a siričitany patria medzi 14 alergénov EÚ (citlivé osoby, astmatici).', ['efsa-2022-sulfity'], 'stredné'), H);

// ---- antioxidanty ----
H.E320 = h('v-poriadku', 'BHA: EFSA stanovila ADI 1,0 mg/kg/deň a nenašla obavu z genotoxicity. Syntetický antioxidant do tukov a žuvačiek.', ['efsa-2011-bha'], 'stredné');

// ---- sladidlá ----
const SLAD = 'WHO (2023) podmienečne odporúča nepoužívať nesacharidové sladidlá na kontrolu hmotnosti ani na zníženie rizika chorôb – nenašli trvalý prínos a observačné štúdie ukazujú súvis s vyšším rizikom (môže ísť o skreslenie). Preventívne obmedziť, najmä pre deti.';
H.E951 = h('obmedzit', `Aspartám: IARC (2023) ho zaradila do 2B (možný karcinogén, obmedzené dôkazy – hazard, nie miera rizika); JECFA ponechala ADI 40 mg/kg/deň a EFSA (2013) pri nej obavu nenašla. ${SLAD} Nevhodný pri fenylketonúrii.`, ['iarc-2023-aspartam', 'who-2023-sladidla'], 'slabé', { preventivne: true, deti: 'obmedzit', ultra: true });
rad(['E950', 'E952', 'E954', 'E955', 'E957', 'E959', 'E961', 'E962', 'E969'], h('obmedzit', SLAD, ['who-2023-sladidla'], 'slabé', { preventivne: true, deti: 'obmedzit', ultra: true }), H);
H.E960 = h('obmedzit', `Steviolglykozidy: EFSA stanovila ADI 4 mg/kg/deň (ako steviol). ${SLAD}`, ['efsa-2010-steviol', 'who-2023-sladidla'], 'slabé', { preventivne: true, ultra: true });
rad(['E420', 'E421', 'E953', 'E965', 'E966', 'E967', 'E964'], h('v-poriadku', 'Polyoly (cukrové alkoholy): EÚ vyžaduje pri viac ako 10 % pridaných polyolov upozornenie, že nadmerná konzumácia môže mať preháňavé účinky. Pre deti a citlivé črevo opatrne (vysoký FODMAP).', ['eu-1169-polyoly'], 'prax', { deti: 'obmedzit', ultra: true }), H);
H.E968 = h('v-poriadku', 'Erytritol: EFSA (2023) upozornila, že vyššie dávky môžu spôsobiť hnačku. Observačná štúdia (Witkowski 2023) spojila vyššiu hladinu erytritolu v krvi s kardiovaskulárnymi príhodami – dôkaz je slabý, príčinnosť nie je dokázaná; ide len o preventívnu poznámku.', ['efsa-2023-erytritol', 'witkowski-2023'], 'slabé', { preventivne: true, deti: 'obmedzit', ultra: true });

// ---- zvýrazňovače chuti, fosfáty, emulgátory ----
rad(['E620', 'E621', 'E622', 'E623', 'E624', 'E625'], h('v-poriadku', 'Glutamáty: EFSA (2017) stanovila skupinovú ADI 30 mg/kg/deň a nenašla obavu z genotoxicity; odhady príjmu u niektorých skupín ADI prekračujú. Hlavne marker ultraspracovaného výrobku (dochucuje).', ['efsa-2017-glutamany'], 'stredné', { ultra: true }), H);
rad(['E338', 'E339', 'E340', 'E341', 'E343', 'E450', 'E451', 'E452'], h('v-poriadku', 'Fosfáty: EFSA (2019) stanovila skupinovú ADI 40 mg/kg/deň (najcitlivejší koncový bod sú obličky); u detí sa ADI prekračuje. Ľudia s poruchou obličiek by ich mali obmedziť po porade s lekárom.', ['efsa-2019-fosfaty'], 'stredné', { deti: 'obmedzit' }), H);
rad(['E466', 'E433'], h('v-poriadku', 'Emulgátor (CMC, polysorbát 80): v pokusoch na myšiach nízke dávky menili črevnú mikrobiotu a podporovali zápal. Dôkaz u ľudí chýba – ide o preventívnu obavu. Marker ultraspracovaného výrobku.', ['chassaing-2015', 'monteiro-2019'], 'slabé', { preventivne: true, ultra: true }), H);
for (let n = 1404; n <= 1452; n++) H[`E${n}`] = h('v-poriadku', 'Modifikovaný škrob: EFSA (2017) nenašla pri hlásených použitiach bezpečnostnú obavu. „Chemicky upravený“ neznamená škodlivý; je to však marker ultraspracovaného výrobku (NOVA).', ['efsa-2017-skroby', 'monteiro-2019'], 'stredné', { ultra: true });
