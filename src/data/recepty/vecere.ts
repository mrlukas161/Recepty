import type { Recept, SurovinaVRecepte, Uprava } from '../types';

type J = 'g' | 'ml' | 'ks' | 'lyzica' | 'lyzicka';
/** nevyhnutná surovina */
const N = (id: string, mnozstvo: number, jednotka: J = 'g', alternativy?: string[]): SurovinaVRecepte =>
  ({ id, mnozstvo, jednotka, nevyhnutna: true, ...(alternativy ? { alternativy } : {}) });
/** bežná surovina */
const S = (id: string, mnozstvo: number, jednotka: J = 'g', alternativy?: string[]): SurovinaVRecepte =>
  ({ id, mnozstvo, jednotka, ...(alternativy ? { alternativy } : {}) });
/** voliteľná surovina */
const V = (id: string, mnozstvo: number, jednotka: J = 'g', alternativy?: string[]): SurovinaVRecepte =>
  ({ id, mnozstvo, jednotka, volitelna: true, ...(alternativy ? { alternativy } : {}) });
const P = (popis: string, na: string, mnozstvo?: number, jednotka?: 'g' | 'ml' | 'ks'): Uprava =>
  ({ typ: 'pridat', popis, na, ...(mnozstvo ? { mnozstvo } : {}), ...(jednotka ? { jednotka } : {}) });
const M = (popis: string, z: string, na: string): Uprava => ({ typ: 'vymenit', popis, z, na });

export const receptyVecere: Recept[] = [
  // ---------- Omelety a frittaty ----------
  {
    id: 'omeleta-spenat-feta', nazov: 'Omeleta so špenátom a fetou', typ: 'vecera', kuchyna: 'stredomorská',
    casPripravy: 5, casVarenia: 10, narocnost: 1, porcie: 2,
    suroviny: [
      N('vajce-slepacie', 4, 'ks'), N('spenat', 100, 'g'), S('feta', 60, 'g', ['cottage', 'mozzarella']),
      S('olej-olivovy', 1, 'lyzica'), V('cesnak', 1, 'ks'), S('sol', 0.25, 'lyzicka'), V('korenie-cierne', 0.25, 'lyzicka'),
    ],
    postup: [
      'Čerstvý špenát prepláchni a hrubšie stonky odstráň. Cesnak, ak ho dávaš, nakrájaj nadrobno.',
      'Na nepriľnavej panvici rozohrej olej na strednom ohni, pridaj cesnak a špenát. Za minútu-dve zvädne; prebytočnú vodu odlej.',
      'Vajcia rozšľahaj vidličkou so soľou a korením.',
      'Vajcia vlej na panvicu k špenátu, nechaj 2 minúty tuhnúť a okraje opatrne nadvihni, aby natiekla tekutá časť.',
      'Posyp rozdrobenou fetou (je slaná, soľ preto dávaj opatrne), prikry pokrievkou a nechaj 3 minúty na slabom ohni, kým vajce nestuhne úplne.',
      'Preložiť na polovicu a podávaj hneď, najlepšie s kúskom celozrnného chleba.',
    ],
    tagy: ['rychle', 'bezmasite', 'bez-peciva', 'bezlepkove', 'detske'], vybavenie: ['panvica'],
    upravy: [P('Pridaj hrsť nakrájaných paradajok.', 'paradajka', 100, 'g'), M('Namiesto fety daj cottage syr (menej solí).', 'feta', 'cottage'), P('Posyp slnečnicovými semienkami.', 'slnecnicove-semienka', 10, 'g')],
    skladovanie: 'Najlepšia čerstvá; zvyšok do dňa v chladničke, na obed studená v krabičke.',
    deti: 'Pre malé deti soľ vynechaj, feta je už slaná.', ilustracia: '🍳',
  },
  {
    id: 'omeleta-cuketa-paradajka', nazov: 'Omeleta s cuketou a paradajkou', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 8, casVarenia: 10, narocnost: 1, porcie: 2,
    suroviny: [
      N('vajce-slepacie', 4, 'ks'), N('cuketa', 200, 'g'), S('paradajka', 1, 'ks'), S('syr-eidam', 40, 'g'),
      S('olej-repkovy', 1, 'lyzica'), V('bazalka', 1, 'lyzicka'), S('sol', 0.25, 'lyzicka'),
    ],
    postup: [
      'Cuketu nastrúhaj na hrubo, posoľ štipkou soli a nechaj 5 minút odpočinúť. Potom ju rukou vytlač.',
      'Paradajku nakrájaj na kocky, syr nastrúhaj.',
      'Na panvici rozohrej olej, cuketu opekaj 3 minúty, kým zmäkne.',
      'Vajcia rozšľahaj s troškou soli, prilej na panvicu a pridaj paradajku.',
      'Na miernom ohni nechaj 4–5 minút tuhnúť, potom posyp syrom a prikry na ďalšiu minútu.',
      'Posyp bazalkou, preložiť a podávaj.',
    ],
    tagy: ['rychle', 'bezmasite', 'bez-peciva', 'bezlepkove', 'detske', 'lacne'], vybavenie: ['panvica'],
    upravy: [P('Pridaj hrsť špenátu.', 'spenat', 50, 'g'), M('Namiesto eidamu daj mozzarellu.', 'syr-eidam', 'mozzarella'), P('Podávaj s kúskom celozrnného chleba.', 'chlieb-celozrnny', 2, 'ks')],
    skladovanie: 'Do 24 hodín v chladničke.', deti: 'Mäkká konzistencia sa deťom zvyčajne darí.', ilustracia: '🍳',
  },
  {
    id: 'frittata-zemiaky-paprika', nazov: 'Frittata so zemiakmi a paprikou', typ: 'vecera', kuchyna: 'španielska',
    casPripravy: 10, casVarenia: 15, narocnost: 1, porcie: 4,
    suroviny: [
      N('vajce-slepacie', 8, 'ks'), N('zemiaky', 400, 'g'), S('paprika-cervena', 1, 'ks'), S('cibula', 1, 'ks'),
      S('olej-olivovy', 2, 'lyzica'), S('sol', 0.5, 'lyzicka'), V('petrzlenova-vnat', 1, 'lyzica'),
    ],
    postup: [
      'Zemiaky uvar v šupke do mäkka (zvyšky z obeda stačí len nakrájať). Ochladené ošúpaj a nakrájaj na kolieska.',
      'Cibuľu nakrájaj nadrobno, papriku na prúžky.',
      'Na veľkej panvici s rúrou odolnou rúčkou rozohrej olej, na ňom 4 minúty smaž cibuľu a papriku.',
      'Pridaj zemiaky a ďalšie 3 minúty ich zľahka opeč.',
      'Vajcia rozšľahaj so soľou, zalej zeleninu a na slabom ohni nechaj 5 minút tuhnúť.',
      'Panvicu vlož do rúry vyhriatej na 200 °C na 5–6 minút, kým vrch nestuhne a mierne zozlatne.',
      'Posyp petržlenovou vňaťou, nakrájaj na kliny a podávaj.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove', 'vyvarene-z-zvyskov', 'lacne', 'detske'], vybavenie: ['panvica', 'rura'],
    upravy: [P('Pridaj hrášok.', 'hrasok-mrazeny', 80, 'g'), M('Namiesto zemiakov použi sladké zemiaky.', 'zemiaky', 'sladke-zemiaky'), P('Pridaj hrsť špenátu.', 'spenat', 60, 'g')],
    skladovanie: 'V chladničke 2 dni; výborná aj studená do krabičky.',
    deti: 'Nakrájaj na menšie kúsky; dobre sa drží v ruke.', ilustracia: '🥘',
  },
  {
    id: 'frittata-brokolica-syr', nazov: 'Frittata z brokolice a syra', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 10, casVarenia: 15, narocnost: 1, porcie: 4,
    suroviny: [
      N('vajce-slepacie', 8, 'ks'), N('brokolica', 300, 'g'), S('syr-eidam-45', 80, 'g', ['mozzarella', 'parmezan']),
      S('cibula', 1, 'ks'), S('olej-repkovy', 1, 'lyzica'), S('sol', 0.5, 'lyzicka'), V('korenie-cierne', 0.25, 'lyzicka'),
    ],
    postup: [
      'Brokolicu rozdeľ na ružičky a 3 minúty ju vari vo vriacej osolenej vode (zvyšky uvarenej brokolice stačí rozdeliť).',
      'Cibuľu nakrájaj nadrobno a na panvici s rúrou odolnou rúčkou opekaj na oleji 3 minúty.',
      'Pridaj scedenú brokolicu, premiešaj a rozlož po dne.',
      'Vajcia rozšľahaj so soľou, korením a polovicou nastrúhaného syra, vlej na panvicu.',
      'Nechaj 4 minúty na slabom ohni tuhnúť, posyp zvyšným syrom.',
      'Vlož do rúry vyhriatej na 200 °C na 8 minút, kým nezozlatne a nestuhne v strede.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove', 'vyvarene-z-zvyskov', 'detske'], vybavenie: ['panvica', 'rura', 'hrniec'],
    upravy: [P('Pridaj nakrájané sušené paradajky alebo čerstvú paradajku.', 'paradajka', 100, 'g'), M('Namiesto brokolice daj karfiol.', 'brokolica', 'karfiol'), P('Pridaj hrsť rukoly po upečení.', 'rukola', 30, 'g')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Brokolicu nakrájaj na menšie kúsky.', ilustracia: '🥦',
  },
  {
    id: 'miesane-tofu-zelenina', nazov: 'Miešané tofu so zeleninou', typ: 'vecera', kuchyna: 'moderná',
    casPripravy: 8, casVarenia: 12, narocnost: 1, porcie: 2,
    suroviny: [
      N('tofu-natur', 200, 'g'), S('paprika-cervena', 1, 'ks'), S('sampinony', 150, 'g'), S('cibula', 0.5, 'ks'),
      S('olej-repkovy', 1, 'lyzica'), S('kurkuma', 0.5, 'lyzicka'), S('sojova-omacka', 1, 'lyzica'), V('pazitka', 1, 'lyzica'),
    ],
    postup: [
      'Tofu vyber z obalu, osuš utierkou a rozmrvi prstami na hrubé kúsky.',
      'Cibuľu, papriku a šampiňóny nakrájaj na menšie kúsky.',
      'Na panvici rozohrej olej a smaž cibuľu so šampiňónmi 5 minút, kým sa odparí voda z húb.',
      'Pridaj papriku a ďalšie 2 minúty smaž.',
      'Vsyp tofu, kurkumu a sójovú omáčku. Miešaj 4–5 minút, kým sa tofu prehreje a sfarbí.',
      'Posyp pažítkou a podávaj s chlebom alebo samotné.',
    ],
    tagy: ['rychle', 'bezmasite', 'vegansky', 'bez-peciva'], vybavenie: ['panvica'],
    upravy: [P('Pridaj hrsť špenátu na posledné 2 minúty.', 'spenat', 60, 'g'), P('Podávaj s kúskom celozrnného chleba.', 'chlieb-celozrnny', 2, 'ks'), P('Posyp tekvicovými semienkami.', 'tekvicove-semienka', 10, 'g')],
    skladovanie: 'V chladničke 2 dni, ohrej na panvici.', deti: 'Sójová omáčka je slaná, pre malé deti jej dávaj menej.', ilustracia: '🍳',
  },

  // ---------- Šaláty ----------
  {
    id: 'salat-vajce-uhorka-jogurt', nazov: 'Šalát s vajcom, uhorkou a jogurtovým dresingom', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 10, narocnost: 1, porcie: 2,
    suroviny: [
      N('vajce-slepacie', 4, 'ks'), N('uhorka', 1, 'ks'), S('salat-hlavkovy', 0.5, 'ks'), S('redkovka', 6, 'ks'),
      S('jogurt-biely', 100, 'g'), S('kopor', 1, 'lyzica'), S('sol', 0.25, 'lyzicka'), S('chlieb-celozrnny', 2, 'ks'),
    ],
    postup: [
      'Vajcia uvar natvrdo: vlož do vriacej vody na 10 minút, potom prelej studenou vodou a ošúpaj.',
      'Šalát natrhaj, uhorku a reďkovky nakrájaj na kolieska.',
      'Jogurt zmiešaj s nasekaným kôprom, soľou a lyžičkou vody na dresing.',
      'Zeleninu rozlož na tanier, na ňu daj vajcia nakrájané na štvrtky.',
      'Polej dresingom a podávaj s celozrnným chlebom.',
    ],
    tagy: ['rychle', 'bezmasite', 'lacne', 'detske'], vybavenie: ['hrniec'],
    upravy: [P('Pridaj hrsť rukoly.', 'rukola', 30, 'g'), P('Pridaj nakrájanú paradajku.', 'paradajka', 100, 'g'), M('Jogurt nahraď kyslou smotanou.', 'jogurt-biely', 'smotana-kysla')],
    skladovanie: 'Dresing a zeleninu skladuj oddelene, 1 deň.', deti: 'Vajce rozmačkaj vidličkou a pomiešaj s dresingom.', ilustracia: '🥗',
  },
  {
    id: 'salat-tuniak-fazula', nazov: 'Šalát s tuniakom, fazuľou a cibuľou', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 2,
    suroviny: [
      N('tuniak-konzerva', 120, 'g', ['sardinky-konzerva']), N('fazula-cervena-konzerva', 200, 'g', ['cicer-konzerva']), S('cibula', 0.5, 'ks'),
      S('paradajka', 2, 'ks'), S('petrzlenova-vnat', 1, 'lyzica'), S('olej-olivovy', 2, 'lyzica'), S('citron', 0.5, 'ks'), S('sol', 0.25, 'lyzicka'),
    ],
    postup: [
      'Fazuľu dôkladne scedi a prepláchni na site.',
      'Cibuľu nakrájaj na tenké polkolieska a 5 minút namoč do studenej vody, aby bola jemnejšia.',
      'Paradajky nakrájaj na mesiačiky, petržlenovú vňať nasekaj.',
      'Tuniaka scedi a rozdeľ vidličkou na kúsky.',
      'Všetko spolu zmiešaj, pokvap citrónovou šťavou a olejom, dochuť soľou.',
      'Nechaj 5 minút postáť, aby sa chute spojili, a podávaj.',
    ],
    tagy: ['rychle', 'bez-peciva', 'bezlepkove', 'do-krabicky'], vybavenie: ['miska'],
    upravy: [P('Pridaj hrsť rukoly.', 'rukola', 40, 'g'), P('Pridaj olivy.', 'olivy', 30, 'g'), M('Fazuľu nahraď cícerom.', 'fazula-cervena-konzerva', 'cicer-konzerva')],
    skladovanie: 'V chladničke do 24 hodín.', deti: 'Skontroluj kosti v tuniakovi; cibuľu pre menšie deti vynechaj.', ilustracia: '🥗',
  },
  {
    id: 'salat-cicer-paprika-feta', nazov: 'Cícerový šalát s paprikou a fetou', typ: 'vecera', kuchyna: 'stredomorská',
    casPripravy: 12, casVarenia: 0, narocnost: 1, porcie: 2,
    suroviny: [
      N('cicer-konzerva', 240, 'g'), S('paprika-cervena', 1, 'ks'), S('uhorka', 0.5, 'ks'), S('feta', 70, 'g'),
      S('olej-olivovy', 2, 'lyzica'), S('citron', 0.5, 'ks'), V('oregano', 0.5, 'lyzicka'), V('olivy', 30, 'g'),
    ],
    postup: [
      'Cícer scedi a prepláchni studenou vodou.',
      'Papriku a uhorku nakrájaj na kocky.',
      'Fetu nakrájaj na kocky alebo rozdrob.',
      'Zmiešaj olej s citrónovou šťavou a oregánom.',
      'Všetko zmiešaj v miske, jemne premiešaj, aby sa feta nerozpadla.',
      'Podávaj hneď, alebo daj na 15 minút do chladu.',
    ],
    tagy: ['rychle', 'bezmasite', 'bez-peciva', 'bezlepkove', 'do-krabicky'], vybavenie: ['miska'],
    upravy: [P('Pridaj hrsť špenátu alebo rukoly.', 'rukola', 40, 'g'), P('Pridaj paradajky.', 'paradajka', 120, 'g'), M('Feta za cottage syr (menej soli).', 'feta', 'cottage')],
    skladovanie: 'V chladničke 2 dni, dobrý do krabičky.', deti: 'Cícer pre najmenších trochu rozmačkaj vidličkou.', ilustracia: '🥗',
  },
  {
    id: 'salat-sosovica-repa', nazov: 'Šošovicový šalát s červenou repou', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 22, narocnost: 1, porcie: 3,
    suroviny: [
      N('sosovica-zelena', 150, 'g'), S('repa-cervena', 200, 'g'), S('cibula', 0.5, 'ks'), S('jogurt-grecky', 80, 'g'),
      S('olej-olivovy', 2, 'lyzica'), S('ocot-jablkovy', 1, 'lyzica'), S('sol', 0.5, 'lyzicka'), V('petrzlenova-vnat', 1, 'lyzica'),
    ],
    postup: [
      'Šošovicu prepláchni a vari vo vode asi 20 minút, kým nezmäkne, ale nerozpadne sa. Až na konci posoľ.',
      'Medzitým varenú repu (vákuovanú z obchodu alebo vopred uvarenú) nakrájaj na kocky.',
      'Cibuľu nakrájaj nadrobno.',
      'Teplú scedenú šošovicu zmiešaj s olejom, octom a cibuľou.',
      'Pridaj repu, nechaj vychladnúť a premiešaj s jogurtom a petržlenovou vňaťou.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove', 'do-krabicky', 'na-viac-dni', 'lacne'], vybavenie: ['hrniec'],
    upravy: [P('Pridaj nastrúhanú mrkvu.', 'mrkva', 100, 'g'), P('Posyp vlašskými orechmi (nie pre malé deti nahrubo).', 'vlasske-orechy', 20, 'g'), M('Jogurt nahraď kyslou smotanou.', 'jogurt-grecky', 'smotana-kysla')],
    skladovanie: 'V chladničke 3 dni.', deti: 'Orechy pre deti do 4 rokov nerozdrvené nedávaj.', ilustracia: '🥗',
  },

  // ---------- Zapekané zeleniny ----------
  {
    id: 'zapekana-cuketa-tvaroh', nazov: 'Zapekaná cuketa s tvarohom a syrom', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 12, casVarenia: 20, narocnost: 1, porcie: 3,
    suroviny: [
      N('cuketa', 500, 'g'), N('tvaroh-polotucny', 200, 'g'), S('vajce-slepacie', 2, 'ks'), S('syr-eidam', 60, 'g'),
      S('cesnak', 1, 'ks'), S('olej-repkovy', 1, 'lyzica'), S('sol', 0.5, 'lyzicka'), V('kopor', 1, 'lyzica'),
    ],
    postup: [
      'Rúru vyhrej na 200 °C. Zapekaciu misu vymasti olejom.',
      'Cuketu nakrájaj na 1 cm kolieska a poukladaj do misy.',
      'Tvaroh vymiešaj s vajcami, pretlačeným cesnakom, soľou a kôprom.',
      'Zmes rozotri na cuketu a posyp nastrúhaným syrom.',
      'Peč 20–25 minút, kým vrch nezozlatne a cuketa nezmäkne.',
      'Pred krájaním nechaj 5 minút odstáť.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove', 'lacne', 'detske'], vybavenie: ['rura'],
    upravy: [P('Pridaj plátky paradajky na cuketu.', 'paradajka', 150, 'g'), M('Tvaroh nahraď cottage syrom.', 'tvaroh-polotucny', 'cottage'), P('Podávaj s celozrnným chlebom.', 'chlieb-celozrnny', 3, 'ks')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Cesnak pre menšie deti zmenši na polovicu.', ilustracia: '🥒',
  },
  {
    id: 'zapeceny-karfiol-syr', nazov: 'Zapečený karfiol so syrovou smotanou', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 30, narocnost: 1, porcie: 4,
    suroviny: [
      N('karfiol', 1, 'ks'), S('smotana-na-varenie', 150, 'ml'), S('syr-eidam-45', 100, 'g'), S('vajce-slepacie', 2, 'ks'),
      S('sol', 0.5, 'lyzicka'), V('korenie-cierne', 0.25, 'lyzicka'),
    ],
    postup: [
      'Karfiol rozdeľ na ružičky a 5 minút ich varíme v osolenej vode; musia ostať pevné.',
      'Rúru vyhrej na 190 °C.',
      'Scedený karfiol vlož do vymastenej zapekacej misy.',
      'Smotanu rozmiešaj s vajcami, soľou, korením a polovicou syra a zalej karfiol.',
      'Posyp zvyšným syrom.',
      'Peč 25 minút do zlatista, nechaj 5 minút odstáť a podávaj s čerstvou zeleninou.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove', 'detske'], vybavenie: ['rura', 'hrniec'],
    upravy: [P('Pridaj hrášok.', 'hrasok-mrazeny', 80, 'g'), M('Smotanu nahraď jogurtom.', 'smotana-na-varenie', 'jogurt-biely'), P('Podávaj s tvarohovou nátierkou.', 'tvaroh-makky', 80, 'g')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Zapečený karfiol sa dá nakrájať na malé kúsky.', ilustracia: '🧀',
  },
  {
    id: 'zapekany-baklazan-mozzarella', nazov: 'Zapekaný baklažán s paradajkami a mozzarellou', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 15, casVarenia: 25, narocnost: 2, porcie: 3,
    suroviny: [
      N('baklazan', 2, 'ks'), N('mozzarella', 125, 'g'), S('paradajkova-passata', 300, 'ml'), S('cesnak', 1, 'ks'),
      S('olej-olivovy', 2, 'lyzica'), S('oregano', 1, 'lyzicka'), S('sol', 0.5, 'lyzicka'), V('bazalka', 1, 'lyzica'), V('parmezan', 20, 'g'),
    ],
    postup: [
      'Rúru vyhrej na 210 °C. Baklažány nakrájaj na kolieska hrubé 1 cm.',
      'Kolieska potri olejom, posoľ a poukladaj na plech s papierom; peč 12 minút, jedenkrát obráť.',
      'Medzitým passatu zmiešaj s pretlačeným cesnakom, oregánom a štipkou soli.',
      'Do zapekacej misy poukladaj vrstvy: omáčka, baklažán, omáčka, mozzarella natrhaná na kúsky. Opakuj.',
      'Posyp parmezánom a peč 12–15 minút, kým syr nezačne zlátnuť.',
      'Pred podávaním posyp bazalkou.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove'], vybavenie: ['rura'],
    upravy: [P('Pridaj cuketu medzi vrstvy.', 'cuketa', 150, 'g'), M('Mozzarellu nahraď fetou.', 'mozzarella', 'feta'), P('Podávaj s celozrnnou cestovinou.', 'cestoviny-celozrnne', 120, 'g')],
    skladovanie: 'V chladničke 2 dni; vhodné na zahriatie.', deti: 'Mäkké, vhodné aj pre menšie deti.', ilustracia: '🍆',
  },

  // ---------- Plnené zeleniny ----------
  {
    id: 'plnena-paprika-tvaroh', nazov: 'Plnená paprika tvarohovou plnkou', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 15, casVarenia: 0, narocnost: 1, porcie: 2,
    suroviny: [
      N('paprika-cervena', 2, 'ks'), N('tvaroh-makky', 200, 'g'), S('jogurt-grecky', 50, 'g'), S('pazitka', 2, 'lyzica'),
      S('redkovka', 4, 'ks'), S('sol', 0.25, 'lyzicka'), S('chlieb-celozrnny', 2, 'ks'),
    ],
    postup: [
      'Papriky umy, nareži na polovice pozdĺž stopky a vyber semienka.',
      'Reďkovky nakrájaj nadrobno, pažítku nasekaj.',
      'Tvaroh vymiešaj s jogurtom, soľou, reďkovkami a pažítkou.',
      'Plnku nakopíruj do papríkových lodičiek.',
      'Podávaj hneď s krajcom celozrnného chleba; lodičky sa dajú dať aj na 15 minút do chladu.',
    ],
    tagy: ['rychle', 'bezmasite', 'lacne', 'detske'], vybavenie: ['miska'],
    upravy: [P('Pridaj nastrúhanú mrkvu do plnky.', 'mrkva', 60, 'g'), M('Tvaroh nahraď cottage syrom.', 'tvaroh-makky', 'cottage'), P('Pridaj šunku (kúsky).', 'sunka-kuracia', 30, 'g')],
    skladovanie: 'Plnku skladuj osobitne, 2 dni.', deti: 'Pre menšie deti ponúkni plnku na krajci chleba a papriku na prúžky.', ilustracia: '🫑',
  },
  {
    id: 'plnena-cuketa-mlete', nazov: 'Cuketa plnená morčacím mäsom a syrom', typ: 'vecera', kuchyna: 'stredomorská',
    casPripravy: 15, casVarenia: 25, narocnost: 2, porcie: 3,
    suroviny: [
      N('cuketa', 2, 'ks'), N('morcacie-mlete', 250, 'g', ['kuracie-mlete']), S('cibula', 0.5, 'ks'), S('paradajkovy-pretlak', 1, 'lyzica'),
      S('mozzarella', 80, 'g'), S('olej-olivovy', 1, 'lyzica'), S('oregano', 1, 'lyzicka'), S('sol', 0.5, 'lyzicka'),
    ],
    postup: [
      'Rúru vyhrej na 200 °C. Cukety pozdĺžne prekroj a lyžicou vydlab stred; dužinu nasekaj.',
      'Cibuľu nakrájaj nadrobno a na oleji ju 3 minúty opekaj.',
      'Pridaj mleté mäso a smaž ho 6–7 minút, kým nie je úplne prepečené a sivé (žiadna ružová).',
      'Pridaj dužinu, pretlak, oregano a soľ; duš 3 minúty.',
      'Cukety naplň zmesou, poukladaj na plech, posyp mozzarellou.',
      'Peč 20 minút do mäkka a zlatého syra. Mäso je hotové, ak v strede je horúce a nie ružové.',
    ],
    tagy: ['bez-peciva', 'bezlepkove'], vybavenie: ['panvica', 'rura'],
    upravy: [P('Pridaj strúhanú mrkvu do plnky.', 'mrkva', 80, 'g'), M('Mäso nahraď cícerom.', 'morcacie-mlete', 'cicer-konzerva'), P('Pridaj špenát do plnky.', 'spenat', 60, 'g')],
    skladovanie: 'V chladničke 2 dni; zmes sa dá aj zamraziť.', deti: 'Jemne nasekaj plnku.', ilustracia: '🥒',
  },
  {
    id: 'plnene-sampinony-spenat', nazov: 'Plnené šampiňóny špenátom a syrom', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 12, casVarenia: 20, narocnost: 1, porcie: 2,
    suroviny: [
      N('sampinony', 400, 'g'), S('spenat', 100, 'g'), S('cottage', 100, 'g'), S('syr-eidam', 40, 'g'),
      S('cesnak', 1, 'ks'), S('olej-olivovy', 1, 'lyzica'), S('sol', 0.25, 'lyzicka'), V('tymian', 0.5, 'lyzicka'),
    ],
    postup: [
      'Rúru vyhrej na 200 °C. Šampiňóny očisti, stopky odtrhni a nadrobno nasekaj.',
      'Na panvici na oleji 3 minúty opekaj stopky s cesnakom a špenátom, kým zvädne a odparí sa voda.',
      'Prisyp cottage, soľ a tymián.',
      'Klobúčiky šampiňónov poukladaj na plech dutinou hore a naplň zmesou.',
      'Posyp syrom.',
      'Peč 15–18 minút do mäkka a zlatého vrchu.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove', 'rychle'], vybavenie: ['panvica', 'rura'],
    upravy: [P('Pridaj nasekané vlašské orechy do plnky.', 'vlasske-orechy', 20, 'g'), M('Cottage nahraď tvarohom.', 'cottage', 'tvaroh-makky'), P('Podávaj s celozrnným chlebom.', 'chlieb-celozrnny', 2, 'ks')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Mäkké, dá sa jesť rukou.', ilustracia: '🍄',
  },

  // ---------- Nátierky + zelenina ----------
  {
    id: 'hummus-domaci-zelenina', nazov: 'Domáci hummus so zeleninou a pitou', typ: 'vecera', kuchyna: 'blízkovýchodná',
    casPripravy: 12, casVarenia: 0, narocnost: 1, porcie: 3,
    suroviny: [
      N('cicer-konzerva', 400, 'g'), S('tahini', 2, 'lyzica'), S('citron', 1, 'ks'), S('cesnak', 1, 'ks'),
      S('olej-olivovy', 2, 'lyzica'), S('sol', 0.5, 'lyzicka'), S('mrkva', 2, 'ks'), S('uhorka', 1, 'ks'), S('pita', 2, 'ks'),
    ],
    postup: [
      'Cícer scedi, nechaj si 4 lyžice nálevu.',
      'V mixéri rozmixuj cícer, tahini, šťavu z citróna, cesnak, olej a soľ do hladka; podľa potreby prilievaj nálev.',
      'Mrkvu a uhorku nakrájaj na tyčinky.',
      'Pitu ohrej v toastri alebo na suchej panvici.',
      'Hummus daj do misky, pokvap olejom a podávaj so zeleninou a pitou.',
    ],
    tagy: ['rychle', 'bezmasite', 'vegansky', 'lacne'], vybavenie: ['mixer'],
    upravy: [P('Pridaj papriku na prúžky.', 'paprika-cervena', 1, 'ks'), P('Posyp sezamom.', 'sezam', 5, 'g'), M('Pitu nahraď knäckebrotom.', 'pita', 'knackebrot-razny')],
    skladovanie: 'Hummus v chladničke 4 dni.', deti: 'Surovú mrkvu v tyčinkách malým deťom nedávaj (riziko dusenia); nahraď ju uvarenou.', ilustracia: '🥙',
  },
  {
    id: 'vecera-tvarohova-natierka-redkovka', nazov: 'Tvarohová nátierka s reďkovkou na celozrnnom chlebe', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 3,
    suroviny: [
      N('tvaroh-makky', 250, 'g'), S('redkovka', 8, 'ks'), S('pazitka', 2, 'lyzica'), S('jogurt-biely', 50, 'g'),
      S('sol', 0.25, 'lyzicka'), N('chlieb-celozrnny', 6, 'ks'), S('uhorka', 1, 'ks'), S('paprika-cervena', 1, 'ks'),
    ],
    postup: [
      'Reďkovky nastrúhaj alebo nakrájaj nadrobno, pažítku nasekaj.',
      'Tvaroh vymiešaj s jogurtom, soľou, reďkovkami a pažítkou do hladka.',
      'Chlieb môžeš nechať aj opražiť na suchej panvici.',
      'Nátierku natri na chlieb.',
      'Uhorku a papriku nakrájaj na prúžky a podávaj popri tom.',
    ],
    tagy: ['rychle', 'bezmasite', 'lacne', 'detske'], vybavenie: ['miska'],
    upravy: [P('Pridaj vajce natvrdo do nátierky.', 'vajce-slepacie', 2, 'ks'), M('Tvaroh nahraď cottage.', 'tvaroh-makky', 'cottage'), P('Pridaj nastrúhanú mrkvu.', 'mrkva', 60, 'g')],
    skladovanie: 'Nátierka v chladničke 2 dni.', deti: 'Reďkovku pre najmenších nastrúhaj jemne.', ilustracia: '🥪',
  },
  {
    id: 'natierka-tuniak-avokado', nazov: 'Nátierka z tuniaka a avokáda so zeleninou', typ: 'vecera', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 2,
    suroviny: [
      N('tuniak-konzerva', 120, 'g'), N('avokado', 1, 'ks'), S('citron', 0.5, 'ks'), S('jogurt-grecky', 40, 'g'),
      S('sol', 0.25, 'lyzicka'), S('chlieb-razny-kvaskovy', 4, 'ks'), S('paradajka', 1, 'ks'), S('uhorka', 0.5, 'ks'),
    ],
    postup: [
      'Tuniaka dobre scedi.',
      'Avokádo rozpolť, vyber kôstku a dužinu rozmačkaj vidličkou s citrónovou šťavou.',
      'Pridaj tuniaka, jogurt a soľ a premiešaj.',
      'Chlieb opeč v toastri alebo na panvici.',
      'Natri nátierku, doplň plátkami paradajky a uhorky.',
    ],
    tagy: ['rychle', 'do-krabicky'], vybavenie: ['miska'],
    upravy: [P('Pridaj nasekanú pažítku.', 'pazitka', 5, 'g'), P('Pridaj rukolu na chlieb.', 'rukola', 30, 'g'), M('Chlieb nahraď ryžovými chlebíčkami.', 'chlieb-razny-kvaskovy', 'ryzove-chlebicky')],
    skladovanie: 'Nátierka stmavne; zjedz do 12 hodín.', deti: 'Skontroluj kosti v tuniakovi.', ilustracia: '🥑',
  },
  {
    id: 'natierka-fazulova-zelenina', nazov: 'Fazuľová nátierka so zeleninovými tyčinkami', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 12, casVarenia: 0, narocnost: 1, porcie: 3,
    suroviny: [
      N('fazula-cervena-konzerva', 240, 'g', ['fazula-konzerva']), S('cibula', 0.5, 'ks'), S('cesnak', 1, 'ks'), S('olej-repkovy', 1, 'lyzica'),
      S('majoran', 1, 'lyzicka'), S('sol', 0.5, 'lyzicka'), S('mrkva', 2, 'ks'), S('paprika-cervena', 1, 'ks'), S('chlieb-razny-kvaskovy', 4, 'ks'),
    ],
    postup: [
      'Fazuľu scedi a prepláchni.',
      'Cibuľu nakrájaj nadrobno a opeč ju na oleji 4 minúty do mäkka.',
      'Fazuľu s cibuľou, pretlačeným cesnakom, majoránkou a soľou rozmixuj alebo rozmačkaj do hrubšej nátierky.',
      'Mrkvu a papriku nakrájaj na tyčinky.',
      'Nátierku natri na chlieb a podávaj so zeleninou.',
    ],
    tagy: ['rychle', 'bezmasite', 'vegansky', 'lacne', 'do-krabicky'], vybavenie: ['panvica', 'mixer'],
    upravy: [P('Pridaj štipku chilli.', 'paprika-palivo', 1, 'g'), P('Posyp tekvicovými semienkami.', 'tekvicove-semienka', 10, 'g'), M('Fazuľu nahraď cícerom.', 'fazula-cervena-konzerva', 'cicer-konzerva')],
    skladovanie: 'V chladničke 3 dni.', deti: 'Mrkvu pre malé deti uvar do mäkka.', ilustracia: '🫘',
  },

  // ---------- Pizza ----------
  {
    id: 'pizza-celozrnna-zelenina', nazov: 'Rýchla celozrnná pizza so zeleninou', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 20, casVarenia: 15, narocnost: 2, porcie: 3,
    suroviny: [
      N('psenicna-muka-celozrnna', 300, 'g'), N('kvasnice-sucha', 7, 'g'), S('voda', 180, 'ml'), S('olej-olivovy', 2, 'lyzica'),
      S('sol', 0.5, 'lyzicka'), S('paradajkova-passata', 150, 'ml'), S('mozzarella', 125, 'g'), S('paprika-cervena', 1, 'ks'), S('sampinony', 100, 'g'), V('oregano', 1, 'lyzicka'),
    ],
    postup: [
      'Múku zmiešaj so sušeným droždím a soľou, pridaj vlažnú vodu a olej a vypracuj hladké cesto (asi 5 minút).',
      'Cesto prikryté nechaj v teple kysnúť 20 minút (rýchla verzia, bude tenšie a hutnejšie).',
      'Rúru vyhrej na 230 °C aj s plechom.',
      'Cesto rozvaľkaj do tenkého kruhu alebo obdĺžnika, prenes na papier na pečenie.',
      'Potri passatou s oreganom, poukladaj papriku, šampiňóny a natrhanú mozzarellu.',
      'Peč 12–15 minút, kým okraj nezhnedne a syr sa nerozpustí.',
    ],
    tagy: ['bezmasite', 'detske', 'lacne'], vybavenie: ['rura'],
    upravy: [P('Pridaj hrsť rukoly po upečení.', 'rukola', 30, 'g'), P('Pridaj cuketu na tenké plátky.', 'cuketa', 100, 'g'), M('Mozzarellu nahraď eidamom.', 'mozzarella', 'syr-eidam')],
    skladovanie: 'V chladničke 2 dni, ohrej v rúre.', deti: 'Pizza je vhodná pre deti, zeleninu nakrájaj jemne.', ilustracia: '🍕',
  },
  {
    id: 'pizza-margherita-klasicka', nazov: 'Pizza Margherita z bielej múky', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 20, casVarenia: 12, narocnost: 2, porcie: 3, klasika: true, lepsiaVerzia: [],
    suroviny: [
      N('psenicna-muka-hladka', 300, 'g'), N('kvasnice-sucha', 7, 'g'), S('voda', 180, 'ml'), S('olej-olivovy', 2, 'lyzica'),
      S('sol', 0.5, 'lyzicka'), S('paradajkova-passata', 150, 'ml'), N('mozzarella', 150, 'g'), V('bazalka', 1, 'lyzica'),
    ],
    postup: [
      'Múku zmiešaj s droždím a soľou, pridaj vlažnú vodu a olej a vypracuj hladké cesto.',
      'Nechaj kysnúť na teplom mieste 30 minút, kým sa nezväčší.',
      'Rúru vyhrej na 240 °C aj s plechom.',
      'Cesto rozvaľkaj na tenký kruh, prenes na papier na pečenie.',
      'Potri passatou posolenou štipkou soli, pridaj natrhanú mozzarellu.',
      'Peč 10–12 minút, kým okraj nezozlatne; na záver pridaj bazalku.',
    ],
    tagy: ['bezmasite', 'detske'], vybavenie: ['rura'],
    upravy: [M('Polovicu múky nahraď celozrnnou (cesto bude hutnejšie).', 'psenicna-muka-hladka', 'psenicna-muka-celozrnna'), P('Pridaj rukolu po upečení.', 'rukola', 30, 'g'), P('Pridaj paradajky.', 'paradajka', 100, 'g')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Klasika, ktorú deti majú rady.', ilustracia: '🍕',
  },
  {
    id: 'placka-karfiol-pizza', nazov: 'Pizza-placka z karfiolu', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 20, casVarenia: 25, narocnost: 2, porcie: 2,
    suroviny: [
      N('karfiol', 400, 'g'), N('vajce-slepacie', 1, 'ks'), S('parmezan', 30, 'g'), S('mozzarella', 100, 'g'),
      S('paradajkova-passata', 80, 'ml'), S('oregano', 1, 'lyzicka'), S('sol', 0.25, 'lyzicka'), S('paprika-cervena', 0.5, 'ks'),
    ],
    postup: [
      'Karfiol rozdeľ na malé ružičky a nastrúhaj ho na jemno alebo ho rozmixuj na zrnká ako ryža.',
      'Zrnká karfiolu uvar v mikrovlnke alebo v pare 5 minút. Nechaj vychladnúť a potom vytlač v utierke všetku vodu; to je kľúč.',
      'Rúru vyhrej na 210 °C.',
      'Karfiol zmiešaj s vajcom, parmezánom, oregánom a soľou. Na plechu s papierom vytvor plochý kruh hrubý 5 mm.',
      'Peč 15 minút, kým okraje nehnednú.',
      'Potri passatou, pridaj papriku a mozzarellu; peč ďalších 8–10 minút.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'bezlepkove'], vybavenie: ['rura', 'mixer'],
    upravy: [P('Pridaj hrsť špenátu.', 'spenat', 40, 'g'), M('Parmezán za eidam.', 'parmezan', 'syr-eidam'), P('Pridaj olivy.', 'olivy', 30, 'g')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Je jemnejšia než bežná pizza, ale chuťovo odlišná.', ilustracia: '🍕',
  },
  {
    id: 'placka-cuketa-pizza', nazov: 'Pizza-placky z cukety', typ: 'vecera', kuchyna: 'talianska',
    casPripravy: 15, casVarenia: 25, narocnost: 2, porcie: 2,
    suroviny: [
      N('cuketa', 500, 'g'), N('vajce-slepacie', 2, 'ks'), S('ovsene-vlocky', 40, 'g'), S('parmezan', 30, 'g'),
      S('paradajkova-passata', 80, 'ml'), S('mozzarella', 100, 'g'), S('sol', 0.5, 'lyzicka'), V('bazalka', 1, 'lyzica'),
    ],
    postup: [
      'Cuketu nastrúhaj na jemno, posoľ a nechaj 10 minút. Potom ju silno vytlač.',
      'Rúru vyhrej na 200 °C.',
      'Cuketu zmiešaj s vajcami, jemne pomletými ovsenými vločkami a parmezánom.',
      'Na plech s papierom vytvor 4 okrúhle placky hrubé asi 5 mm.',
      'Peč 15 minút, kým okraje nezhnednú.',
      'Na každú dones passatu a mozzarellu; peč ďalších 8 minút a posyp bazalkou.',
    ],
    tagy: ['bezmasite', 'bez-peciva', 'lacne', 'detske'], vybavenie: ['rura'],
    upravy: [P('Pridaj šampiňóny na placky.', 'sampinony', 80, 'g'), M('Ovsené vločky za špaldovú múku.', 'ovsene-vlocky', 'spaldova-muka-celozrnna'), P('Pridaj paradajky.', 'paradajka', 100, 'g')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Veľkosť placky prispôsob pre malé ruky.', ilustracia: '🍕',
  },

  // ---------- Krémové polievky ----------
  {
    id: 'krem-brokolica-syr', nazov: 'Krémová brokolicová polievka so syrom', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 20, narocnost: 1, porcie: 4,
    suroviny: [
      N('brokolica', 500, 'g'), S('zemiaky', 200, 'g'), S('cibula', 1, 'ks'), S('cesnak', 1, 'ks'), S('olej-repkovy', 1, 'lyzica'),
      S('voda', 800, 'ml'), S('vyvar-kocka', 1, 'ks'), S('smotana-na-varenie', 100, 'ml'), V('syr-taviaci', 36, 'g'),
    ],
    postup: [
      'Cibuľu nakrájaj nadrobno a na oleji ju v hrnci 3 minúty opekaj s cesnakom.',
      'Pridaj zemiaky na kocky, brokolicu na ružičky, vodu a kocku. Varíme 15 minút do mäkka.',
      'Polievku rozmixuj ponorným mixérom do hladka.',
      'Vlej smotanu a prípadne vlož taviaci syr na rozpustenie.',
      'Prehrej bez varu a dochuť.',
      'Podávaj s celozrnným chlebom alebo opečeným celozrnným rožkom.',
    ],
    tagy: ['bezmasite', 'lacne', 'detske', 'na-viac-dni'], vybavenie: ['hrniec', 'mixer'],
    upravy: [P('Pridaj hrsť špenátu pred mixovaním.', 'spenat', 60, 'g'), M('Smotanu nahraď jogurtom (pridaj mimo varu).', 'smotana-na-varenie', 'jogurt-biely'), P('Posyp tekvicovými semienkami.', 'tekvicove-semienka', 10, 'g')],
    skladovanie: 'V chladničke 3 dni, mrazí sa bez smotany.', deti: 'Pre malé deti kocku vynechaj a polievku nesoľ.', ilustracia: '🥦',
  },
  {
    id: 'krem-mrkva-sosovica', nazov: 'Mrkvová krémová polievka s červenou šošovicou', typ: 'vecera', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 22, narocnost: 1, porcie: 4,
    suroviny: [
      N('mrkva', 500, 'g'), N('sosovica-cervena', 100, 'g'), S('cibula', 1, 'ks'), S('zazvor', 10, 'g'), S('olej-repkovy', 1, 'lyzica'),
      S('voda', 1000, 'ml'), S('kurkuma', 0.5, 'lyzicka'), S('sol', 0.5, 'lyzicka'), V('jogurt-biely', 60, 'g'),
    ],
    postup: [
      'Mrkvu ošúpaj a nakrájaj na kolieska, cibuľu nadrobno, zázvor nastrúhaj.',
      'V hrnci na oleji 3 minúty opekaj cibuľu so zázvorom a kurkumou.',
      'Pridaj mrkvu, prepláchnutú šošovicu a vodu. Varíme 18–20 minút do mäkka.',
      'Posoľ a rozmixuj ponorným mixérom do hladka.',
      'Podľa potreby doplň vodu na hustotu.',
      'Pri podávaní pridaj lyžicu jogurtu.',
    ],
    tagy: ['bezmasite', 'vegansky', 'lacne', 'detske', 'na-viac-dni'], vybavenie: ['hrniec', 'mixer'],
    upravy: [P('Pridaj hrsť špenátu pred mixovaním.', 'spenat', 50, 'g'), P('Posyp tekvicovými semienkami.', 'tekvicove-semienka', 10, 'g'), M('Mrkvu vymeň za tekvicu.', 'mrkva', 'tekvica-maslova')],
    skladovanie: 'V chladničke 4 dni, v mrazničke 3 mesiace.', deti: 'Hladká polievka je vhodná od ranného veku.', ilustracia: '🥕',
  },
  {
    id: 'krem-tekvica-hokkaido', nazov: 'Krém z tekvice hokkaido', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 20, narocnost: 1, porcie: 4,
    suroviny: [
      N('tekvica-hokkaido', 700, 'g'), S('cibula', 1, 'ks'), S('zemiaky', 150, 'g'), S('olej-repkovy', 1, 'lyzica'),
      S('voda', 800, 'ml'), S('vyvar-kocka', 1, 'ks'), S('smotana-na-varenie', 80, 'ml'), V('tekvicove-semienka', 20, 'g'), V('olej-tekvicovy', 1, 'lyzica'),
    ],
    postup: [
      'Tekvicu hokkaido umy, rozpolť, vyber semienka a nakrájaj na kocky; šupka sa nemusí lúpať.',
      'Cibuľu nakrájaj nadrobno a opeč v hrnci na oleji 3 minúty.',
      'Pridaj tekvicu, zemiaky, vodu a kocku; varíme 15 minút do mäkka.',
      'Rozmixuj ponorným mixérom do hladka, prilej smotanu.',
      'Prehrej, nevar. Podávaj s tekvicovými semienkami a olejom.',
    ],
    tagy: ['bezmasite', 'lacne', 'detske', 'na-viac-dni'], vybavenie: ['hrniec', 'mixer'],
    upravy: [P('Pridaj červenú šošovicu pre viac bielkovín.', 'sosovica-cervena', 60, 'g'), M('Smotanu nahraď kokosovým mliekom.', 'smotana-na-varenie', 'mlieko-kokosove'), P('Podávaj s celozrnným chlebom.', 'chlieb-celozrnny', 4, 'ks')],
    skladovanie: 'V chladničke 3 dni.', deti: 'Semienka pre malé deti nahraď olejom.', ilustracia: '🎃',
  },

  // ---------- Fašírky a karbonátky ----------
  {
    id: 'fasirky-morcacie-rura', nazov: 'Pečené morčacie fašírky so zeleninou', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 15, casVarenia: 25, narocnost: 2, porcie: 4,
    suroviny: [
      N('morcacie-mlete', 500, 'g', ['kuracie-mlete']), S('vajce-slepacie', 1, 'ks'), S('ovsene-vlocky', 40, 'g'), S('cibula', 1, 'ks'),
      S('cesnak', 1, 'ks'), S('majoran', 1, 'lyzicka'), S('sol', 1, 'lyzicka'), S('mrkva', 3, 'ks'), S('cuketa', 1, 'ks'), S('olej-repkovy', 1, 'lyzica'),
    ],
    postup: [
      'Rúru vyhrej na 200 °C. Cibuľu nastrúhaj, cesnak pretlač.',
      'Do mäsa pridaj cibuľu, cesnak, vajce, vločky, soľ a majorán; vymiesi.',
      'Z hmoty vytvor 12 menších fašírok.',
      'Mrkvu a cuketu nakrájaj na kúsky, premiešaj s olejom a rozlož po plechu.',
      'Medzi zeleninu ulož fašírky.',
      'Peč 25 minút, jedenkrát obráť. Mäso musí mať v strede aspoň 74 °C a vo vnútri nesmie byť ružové.',
    ],
    tagy: ['detske', 'na-viac-dni', 'do-krabicky'], vybavenie: ['rura'],
    upravy: [P('Pridaj nastrúhanú cuketu do mäsa.', 'cuketa', 100, 'g'), M('Mäso za kuracie.', 'morcacie-mlete', 'kuracie-mlete'), P('Podávaj s jogurtovou omáčkou.', 'jogurt-biely', 80, 'g')],
    skladovanie: 'V chladničke 3 dni, mrazí sa.', deti: 'Menšie fašírky sú dobré do ruky.', ilustracia: '🍖',
  },
  {
    id: 'karbonatky-sosovica-vlocky', nazov: 'Šošovicové karbonátky pečené v rúre', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 15, casVarenia: 25, narocnost: 2, porcie: 4,
    suroviny: [
      N('sosovica-cervena', 200, 'g'), S('ovsene-vlocky', 60, 'g'), S('mrkva', 1, 'ks'), S('cibula', 1, 'ks'), S('vajce-slepacie', 1, 'ks'),
      S('cesnak', 1, 'ks'), S('kurkuma', 0.5, 'lyzicka'), S('sol', 0.75, 'lyzicka'), S('olej-repkovy', 1, 'lyzica'), V('jogurt-biely', 100, 'g'),
    ],
    postup: [
      'Šošovicu prepláchni a vari vo vode 10 minút do mäkka; dobre scedi a nechaj vychladnúť.',
      'Rúru vyhrej na 200 °C.',
      'Cibuľu a mrkvu nastrúhaj, cesnak pretlač.',
      'Zmiešaj šošovicu, zeleninu, vajce, vločky, kurkumu a soľ; zmes by mala držať tvar.',
      'Vytvaruj z nej 10 plochých karbonátkov a polož na plech s papierom, potri olejom.',
      'Peč 25 minút, v polovici obráť. Podávaj s jogurtom.',
    ],
    tagy: ['bezmasite', 'lacne', 'detske', 'na-viac-dni', 'do-krabicky'], vybavenie: ['rura', 'hrniec'],
    upravy: [P('Pridaj hrsť špenátu do zmesi.', 'spenat', 50, 'g'), P('Pridaj sezam do zmesi.', 'sezam', 10, 'g'), M('Vajce vymeň za chia (vegan).', 'vajce-slepacie', 'chia')],
    skladovanie: 'V chladničke 3 dni, mrazí sa.', deti: 'Mäkké, dobré pre deti.', ilustracia: '🧆',
  },
  {
    id: 'karbonatky-cicer-rura', nazov: 'Cícerové karbonátky pečené s tzatziki', typ: 'vecera', kuchyna: 'blízkovýchodná',
    casPripravy: 15, casVarenia: 20, narocnost: 2, porcie: 3,
    suroviny: [
      N('cicer-konzerva', 400, 'g'), S('cibula', 0.5, 'ks'), S('cesnak', 1, 'ks'), S('petrzlenova-vnat', 2, 'lyzica'), S('koriander-mlety', 1, 'lyzicka'),
      S('vajce-slepacie', 1, 'ks'), S('ovsene-vlocky', 40, 'g'), S('sol', 0.5, 'lyzicka'), S('jogurt-biely', 150, 'g'), S('uhorka', 0.5, 'ks'),
    ],
    postup: [
      'Rúru vyhrej na 200 °C. Cícer scedi a dobre osuš.',
      'Cícer rozmixuj nahrubo s cibuľou, cesnakom, petržlenom a korením (nie na pastu).',
      'Primiešaj vajce, vločky a soľ a nechaj 5 minút odstáť.',
      'Z hmoty tvaruj 9 karbonátkov a polož na plech s papierom.',
      'Peč 18–20 minút, v polovici obráť.',
      'Jogurt zmiešaj s nastrúhanou uhorkou a štipkou soli, podávaj k nim.',
    ],
    tagy: ['bezmasite', 'lacne', 'detske', 'na-viac-dni'], vybavenie: ['rura', 'mixer'],
    upravy: [P('Pridaj nastrúhanú mrkvu.', 'mrkva', 60, 'g'), P('Podávaj s pitou.', 'pita', 2, 'ks'), M('Vajce za chia semienka.', 'vajce-slepacie', 'chia')],
    skladovanie: 'V chladničke 3 dni.', deti: 'Mäkká konzistencia.', ilustracia: '🧆',
  },

  // ---------- Rybie prsty ----------
  {
    id: 'rybie-prsty-domace-pecene', nazov: 'Domáce pečené rybie prsty', typ: 'vecera', kuchyna: 'anglická',
    casPripravy: 15, casVarenia: 15, narocnost: 2, porcie: 3,
    suroviny: [
      N('treska', 400, 'g', ['ryba-fileje-mrazene']), S('vajce-slepacie', 1, 'ks'), S('ovsene-vlocky', 50, 'g'), S('sezam', 1, 'lyzica'),
      S('sol', 0.5, 'lyzicka'), S('olej-repkovy', 1, 'lyzica'), S('citron', 0.5, 'ks'), S('jogurt-biely', 100, 'g'), S('mrazena-zmes-zeleniny', 300, 'g'),
    ],
    postup: [
      'Rúru vyhrej na 210 °C. Rybu (rozmrazenú) osuš a nakrájaj na prúžky široké 2 cm.',
      'Vločky nahrubo rozmixuj, zmiešaj so sezamom a soľou.',
      'Vajce rozšľahaj na tanieri.',
      'Každý prúžok namoč do vajca a obaľ vo vločkách; polož na plech s papierom a pokvapni olejom.',
      'Peč 12–15 minút, kým ryba nie je celkom biela a nepriesvitná (aspoň 63 °C).',
      'Zmes zeleniny uvar a jogurt zmiešaj s citrónovou šťavou.',
    ],
    tagy: ['detske', 'rychle'], vybavenie: ['rura', 'mixer', 'hrniec'],
    upravy: [P('Podávaj so šalátom.', 'salat-hlavkovy', 100, 'g'), M('Vločky nahraď strúhankou.', 'ovsene-vlocky', 'strouhanka'), P('Pridaj hrášok.', 'hrasok-mrazeny', 80, 'g')],
    skladovanie: 'V chladničke 1 deň.', deti: 'Skontroluj kosti v rybe.', ilustracia: '🐟',
  },
  {
    id: 'rybie-prsty-zemiaky-hrasok', nazov: 'Rybie prsty z rúry so zemiakovou kašou a hráškom', typ: 'vecera', kuchyna: 'anglická',
    casPripravy: 10, casVarenia: 25, narocnost: 1, porcie: 3,
    suroviny: [
      N('rybie-prsty', 12, 'ks'), N('zemiaky', 600, 'g'), S('hrasok-mrazeny', 200, 'g'), S('mlieko-polotucne', 100, 'ml'),
      S('maslo', 15, 'g'), S('sol', 0.5, 'lyzicka'), V('citron', 0.5, 'ks'),
    ],
    postup: [
      'Rúru vyhrej na 210 °C. Rybie prsty polož na plech s papierom a peč podľa obalu, zvyčajne 15–20 minút, raz obráť.',
      'Zemiaky ošúpaj, nakrájaj a varíme v osolenej vode 15 minút do mäkka.',
      'Hrášok uvar 3 minúty v osobitnom hrnci.',
      'Zemiaky scedi, rozpučte s teplým mliekom a maslom do kaše.',
      'Podávaj kašu s hráškom a rybími prstami s plátkom citróna.',
    ],
    tagy: ['detske', 'lacne', 'rychle'], vybavenie: ['rura', 'hrniec'],
    upravy: [M('Zemiakovú kašu nahraď karfiolovo-zemiakovou.', 'zemiaky', 'karfiol'), P('Pridaj salát z uhorky.', 'uhorka', 100, 'g'), P('Podávaj s jogurtovým dipom.', 'jogurt-biely', 80, 'g')],
    skladovanie: 'Rybie prsty zjedz v ten deň.', deti: 'Obľúbené u detí; soľ šetri.', ilustracia: '🐟',
  },

  // ---------- Quesadilly ----------
  {
    id: 'quesadilla-fazula-syr', nazov: 'Quesadilla s fazuľou, kukuricou a syrom', typ: 'vecera', kuchyna: 'mexická',
    casPripravy: 10, casVarenia: 10, narocnost: 1, porcie: 2,
    suroviny: [
      N('tortilla-psenicna', 4, 'ks'), N('fazula-cervena-konzerva', 200, 'g'), S('kukurica-konzerva', 80, 'g'), S('syr-eidam', 100, 'g'),
      S('paprika-cervena', 0.5, 'ks'), S('paprika-sladka', 0.5, 'lyzicka'), S('olej-repkovy', 1, 'lyzicka'), V('jogurt-grecky', 60, 'g'),
    ],
    postup: [
      'Fazuľu scedi a rozmačkaj vidličkou nahrubo, premiešaj s kukuricou, nakrájanou paprikou a mletou paprikou.',
      'Syr nastrúhaj.',
      'Polovicu tortily potri fazuľovou zmesou a syrom, prekry druhou tortilou.',
      'Na suchej alebo jemne vymastenej panvici opekaj z každej strany 2–3 minúty do zlatista.',
      'Nakrájaj na trojuholníky a podávaj s jogurtom.',
    ],
    tagy: ['rychle', 'bezmasite', 'detske', 'lacne'], vybavenie: ['panvica'],
    upravy: [P('Pridaj hrsť špenátu do náplne.', 'spenat', 40, 'g'), M('Tortillu nahraď kukuričnou.', 'tortilla-psenicna', 'tortilla-kukuricna'), P('Podávaj s paradajkovou salsou.', 'paradajka', 100, 'g')],
    skladovanie: 'V chladničke 1 deň.', deti: 'Mäkká; dobrá do ruky.', ilustracia: '🌮',
  },
  {
    id: 'quesadilla-kuracie-zvysky', nazov: 'Quesadilla zo zvyškov kuracieho mäsa', typ: 'vecera', kuchyna: 'mexická',
    casPripravy: 10, casVarenia: 10, narocnost: 1, porcie: 2,
    suroviny: [
      N('tortilla-psenicna', 4, 'ks'), N('kuracie-prsia', 200, 'g'), S('paprika-cervena', 1, 'ks'), S('syr-eidam-45', 100, 'g'),
      S('cibula', 0.5, 'ks'), S('olej-repkovy', 1, 'lyzica'), S('paprika-sladka', 1, 'lyzicka'), S('jogurt-grecky', 60, 'g'),
    ],
    postup: [
      'Uvarené alebo upečené kuracie zvyšky natrhaj na prúžky (ak nemáš, nakrájaj surové prsia na kocky a opeč 8 minút do prepečenia).',
      'Papriku a cibuľu nakrájaj na prúžky a 4 minúty opekaj na oleji, pridaj kuracie a mletú papriku.',
      'Syr nastrúhaj.',
      'Na tortilu daj zmes a syr, prikry druhou tortilou.',
      'Opekaj na panvici z oboch strán po 2–3 minúty.',
      'Podávaj nakrájané na štvrtiny s jogurtom.',
    ],
    tagy: ['rychle', 'vyvarene-z-zvyskov', 'detske'], vybavenie: ['panvica'],
    upravy: [P('Pridaj kukuricu.', 'kukurica-konzerva', 60, 'g'), M('Tortillu nahraď kukuričnou.', 'tortilla-psenicna', 'tortilla-kukuricna'), P('Pridaj špenát.', 'spenat', 40, 'g')],
    skladovanie: 'V chladničke 1 deň.', deti: 'Papriku nakrájaj jemne.', ilustracia: '🌮',
  },

  // ---------- Ryža, pohánka ----------
  {
    id: 'ryza-jedna-panvica-kuracie', nazov: 'Ryža s kuracím a zeleninou z jednej panvice', typ: 'vecera', kuchyna: 'ázijská',
    casPripravy: 10, casVarenia: 25, narocnost: 1, porcie: 3,
    suroviny: [
      N('kuracie-prsia', 300, 'g'), N('ryza-biela', 180, 'g', ['ryza-natur', 'ryza-basmati']), S('mrazena-zmes-zeleniny', 300, 'g'), S('cibula', 1, 'ks'),
      S('olej-repkovy', 1, 'lyzica'), S('voda', 450, 'ml'), S('sojova-omacka', 1, 'lyzica'), S('kurkuma', 0.5, 'lyzicka'),
    ],
    postup: [
      'Kuracie prsia nakrájaj na kocky, cibuľu nadrobno.',
      'Na hlbokej panvici s pokrievkou opeč na oleji cibuľu a kuracie 5 minút.',
      'Pridaj prepláchnutú ryžu, kurkumu a sójovú omáčku, krátko premiešaj.',
      'Prilej vodu, pridaj zeleninovú zmes a priveď do varu.',
      'Prikry, stiahni oheň na minimum a nechaj 15 minút bez otvárania.',
      'Kuracie musí byť vnútri prepečené (nie ružové); premiešaj a nechaj 5 minút odstáť.',
    ],
    tagy: ['detske', 'na-viac-dni', 'do-krabicky'], vybavenie: ['panvica'],
    upravy: [M('Ryžu nahraď natural ryžou (dlhšie variť).', 'ryza-biela', 'ryza-natur'), P('Pridaj hrášok.', 'hrasok-mrazeny', 80, 'g'), P('Pridaj vajce.', 'vajce-slepacie', 2, 'ks')],
    skladovanie: 'Ryžu rýchlo ochladiť a do chladničky do 1 hodiny; zjedz do 24 hodín a ohrej do horúca.', deti: 'Sójovú omáčku obmedz.', ilustracia: '🍚',
  },
  {
    id: 'ryza-zvysky-zelenina-vajce', nazov: 'Vyprážaná ryža so zeleninou a vajcom (zo zvyškov)', typ: 'vecera', kuchyna: 'ázijská',
    casPripravy: 8, casVarenia: 10, narocnost: 1, porcie: 2,
    suroviny: [
      N('ryza-biela', 250, 'g'), N('vajce-slepacie', 3, 'ks'), S('mrazena-zmes-zeleniny', 200, 'g'), S('sojova-omacka', 1, 'lyzica'),
      S('olej-repkovy', 1, 'lyzica'), S('cesnak', 1, 'ks'), V('pazitka', 1, 'lyzica'),
    ],
    postup: [
      'Použi uvarenú ryžu z predchádzajúceho dňa, ktorá bola do hodiny po uvarení uložená v chladničke (nie dlho odstátu na stole).',
      'Na veľkej panvici rozohrej olej, pridaj zeleninu a cesnak a smaž 4 minúty.',
      'Zeleninu odsuň, vlej rozšľahané vajcia a miešaj 1–2 minúty, kým nestuhnú.',
      'Pridaj ryžu a smaž 4 minúty, kým nie je horúca po celom objeme.',
      'Dochuť sójovou omáčkou, posyp pažítkou.',
    ],
    tagy: ['rychle', 'bezmasite', 'vyvarene-z-zvyskov', 'lacne'], vybavenie: ['panvica'],
    upravy: [P('Pridaj hrášok.', 'hrasok-mrazeny', 80, 'g'), M('Ryžu nahraď natural ryžou.', 'ryza-biela', 'ryza-natur'), P('Pridaj kocky tofu.', 'tofu-natur', 100, 'g')],
    skladovanie: 'Ryža varená sa skladuje maximálne 1 deň; ohrej do horúca.', deti: 'Ryža musí byť po uvarení rýchlo ochladená.', ilustracia: '🍚',
  },
  {
    id: 'pohanka-huby-vajce', nazov: 'Pohánka so šampiňónmi a vajcom na panvici', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 8, casVarenia: 20, narocnost: 1, porcie: 3,
    suroviny: [
      N('pohanka', 200, 'g'), S('sampinony', 300, 'g'), S('cibula', 1, 'ks'), S('vajce-slepacie', 3, 'ks'),
      S('olej-repkovy', 1, 'lyzica'), S('voda', 400, 'ml'), S('sol', 0.5, 'lyzicka'), V('petrzlenova-vnat', 1, 'lyzica'),
    ],
    postup: [
      'Pohánku prepláchni, zalej vodou, posoľ a varíme 12–15 minút do mäkka pod pokrievkou.',
      'Cibuľu nakrájaj nadrobno, šampiňóny na plátky.',
      'Na veľkej panvici na oleji 3 minúty opekaj cibuľu, pridaj šampiňóny a smaž 5–6 minút, kým sa odparí voda.',
      'Pridaj uvarenú pohánku a premiešaj.',
      'Urob do zmesi 3 jamky a rozbi do nich vajcia; prikry a nechaj 4–5 minút, kým bielok nestuhne.',
      'Posyp petržlenom.',
    ],
    tagy: ['bezmasite', 'bezlepkove', 'bez-peciva', 'lacne'], vybavenie: ['panvica', 'hrniec'],
    upravy: [P('Pridaj špenát.', 'spenat', 60, 'g'), P('Posyp syrom.', 'syr-eidam', 40, 'g'), M('Šampiňóny nahraď hlivou.', 'sampinony', 'hliva-ustricova')],
    skladovanie: 'V chladničke 2 dni (bez vajec).', deti: 'Vajce prepeč, nie tekuté.', ilustracia: '🍳',
  },
  {
    id: 'pohanka-cuketa-tofu', nazov: 'Pohánka s cuketou a tofu z jednej panvice', typ: 'vecera', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 20, narocnost: 1, porcie: 3,
    suroviny: [
      N('pohanka', 180, 'g'), N('tofu-natur', 200, 'g'), S('cuketa', 1, 'ks'), S('paprika-cervena', 1, 'ks'), S('cibula', 1, 'ks'),
      S('olej-repkovy', 1, 'lyzica'), S('sojova-omacka', 1, 'lyzica'), S('voda', 400, 'ml'), V('kurkuma', 0.5, 'lyzicka'),
    ],
    postup: [
      'Tofu osuš a nakrájaj na kocky, zeleninu nakrájaj na menšie kúsky.',
      'Na panvici opeč tofu na oleji 5 minút do zlatista, vyber.',
      'Do panvice daj cibuľu, papriku a cuketu a smaž 4 minúty.',
      'Pridaj prepláchnutú pohánku, vodu a sójovú omáčku, priveď do varu.',
      'Prikry a nechaj 12 minút na slabom ohni.',
      'Vráť tofu, premiešaj a podávaj.',
    ],
    tagy: ['bezmasite', 'vegansky', 'bez-peciva', 'lacne', 'na-viac-dni'], vybavenie: ['panvica'],
    upravy: [P('Pridaj hrášok.', 'hrasok-mrazeny', 80, 'g'), P('Pridaj hrsť špenátu.', 'spenat', 50, 'g'), M('Tofu za cícer.', 'tofu-natur', 'cicer-konzerva')],
    skladovanie: 'V chladničke 3 dni.', deti: 'Soľ a sójovú omáčku šetri.', ilustracia: '🥘',
  },

  // ---------- Údeniny pre kontrast ----------
  {
    id: 'teple-sunkove-sendvice', nazov: 'Teplé šunkové sendviče so syrom', typ: 'vecera', kuchyna: 'americká',
    casPripravy: 8, casVarenia: 10, narocnost: 1, porcie: 2, klasika: true, lepsiaVerzia: [],
    suroviny: [
      N('toastovy-chlieb', 8, 'ks'), N('sunka-bravcova', 8, 'ks'), S('syr-eidam-45', 100, 'g'), S('maslo', 15, 'g'), S('kecup', 1, 'lyzica'), S('paradajka', 1, 'ks'),
    ],
    postup: [
      'Syr nakrájaj na plátky, paradajku na kolieska.',
      'Na 4 krajce toastu daj šunku, syr a paradajku.',
      'Prikry ďalšími 4 krajcami.',
      'Vonkajšie strany potri maslom.',
      'Opekaj na panvici alebo v sendvičovači z oboch strán po 3–4 minúty, kým chlieb nezozlatne a syr sa nerozpustí.',
      'Nakrájaj na polovice a podávaj s kečupom.',
    ],
    tagy: ['rychle', 'detske'], vybavenie: ['panvica'],
    upravy: [M('Toast nahraď celozrnným chlebom.', 'toastovy-chlieb', 'chlieb-celozrnny'), M('Bravčovú šunku vymeň za kuraciu.', 'sunka-bravcova', 'sunka-kuracia'), P('Pridaj listy špenátu.', 'spenat', 30, 'g')],
    skladovanie: 'Najlepšie čerstvé.', deti: 'Klasika; slaná, preto neprehrávať.', ilustracia: '🥪',
  },
  {
    id: 'sunkofleky-klasicke', nazov: 'Šunkofleky', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 20, narocnost: 1, porcie: 4, klasika: true, lepsiaVerzia: [],
    suroviny: [
      N('cestoviny-vajecne', 300, 'g'), N('sunka-dedinska', 200, 'g'), S('vajce-slepacie', 3, 'ks'), S('smotana-na-varenie', 150, 'ml'),
      S('syr-eidam', 80, 'g'), S('maslo', 15, 'g'), S('sol', 0.5, 'lyzicka'),
    ],
    postup: [
      'Cestoviny uvar v osolenej vode podľa obalu, scedi.',
      'Rúru vyhrej na 190 °C. Šunku nakrájaj na kocky.',
      'Vajcia vymiešaj so smotanou a soľou.',
      'Cestoviny zmiešaj so šunkou a vlož do vymastenej zapekacej misy; zalej smotanovou zmesou.',
      'Posyp syrom.',
      'Peč 20 minút, kým vrch nezozlatne.',
    ],
    tagy: ['detske', 'lacne'], vybavenie: ['rura', 'hrniec'],
    upravy: [M('Cestoviny nahraď celozrnnými.', 'cestoviny-vajecne', 'cestoviny-celozrnne'), P('Pridaj hrášok.', 'hrasok-mrazeny', 100, 'g'), M('Šunku nahraď kuracou.', 'sunka-dedinska', 'sunka-kuracia')],
    skladovanie: 'V chladničke 2 dni.', deti: 'Obľúbené, ale slané.', ilustracia: '🍝',
  },
  {
    id: 'zemiaky-slanina-vajce-panvica', nazov: 'Zemiaky so slaninou a vajcom na panvici', typ: 'vecera', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 20, narocnost: 1, porcie: 3,
    suroviny: [
      N('zemiaky', 600, 'g'), N('slanina-udena', 80, 'g'), S('vajce-slepacie', 3, 'ks'), S('cibula', 1, 'ks'),
      S('sol', 0.5, 'lyzicka'), S('petrzlenova-vnat', 1, 'lyzica'), S('kysle-uhorky', 2, 'ks'),
    ],
    postup: [
      'Zemiaky ošúpaj, nakrájaj na kocky a varíme 8 minút v osolenej vode; zvyšok z obeda stačí len nakrájať.',
      'Slaninu nakrájaj na kocky a vypeč ju na suchej panvici do chrumkava.',
      'Pridaj cibuľu a scedené zemiaky a opekaj 8 minút dozlatista.',
      'Urob jamky, rozbi do nich vajcia, prikry a nechaj 4 minúty.',
      'Posyp petržlenom a podávaj s kyslými uhorkami.',
    ],
    tagy: ['lacne', 'vyvarene-z-zvyskov', 'bezlepkove'], vybavenie: ['panvica', 'hrniec'],
    upravy: [P('Pridaj papriku.', 'paprika-cervena', 1, 'ks'), M('Slaninu nahraď šunkou.', 'slanina-udena', 'sunka-bravcova'), P('Podávaj so šalátom z uhorky.', 'uhorka', 150, 'g')],
    skladovanie: 'Zjedz v ten deň.', deti: 'Slanina je slaná; vajce prepeč.', ilustracia: '🥔',
  },
];
