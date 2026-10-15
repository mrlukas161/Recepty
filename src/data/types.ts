export type Skupina =
  | 'muky-obilniny' | 'pecivo' | 'cestoviny' | 'prilohy' | 'strukoviny' | 'zelenina' | 'ovocie'
  | 'maso' | 'ryby' | 'udeniny' | 'mliecne' | 'vajcia' | 'tuky-oleje' | 'orechy-semienka'
  | 'korenie-bylinky' | 'sladidla' | 'polotovary' | 'napoje' | 'ostatne';

export type Oddelenie =
  | 'ovocie-zelenina' | 'pecivo' | 'maso-ryby' | 'udeniny' | 'mliecne-vajcia' | 'trvanlive'
  | 'obilniny-muky' | 'strukoviny-konzervy' | 'koreniny' | 'oleje-tuky' | 'sladkosti-sladidla' | 'mrazene' | 'napoje' | 'ine';

/** Príznaky suroviny (kľúče sú pevné – používa ich skóre aj filtre). */
export type Priznak =
  | 'rafinovana-muka' | 'celozrnne' | 'lepok' | 'laktoza' | 'spracovane-maso' | 'cervene-maso'
  | 'pridany-cukor' | 'vysoky-fodmap' | 'strukovina' | 'zelenina' | 'ovocie' | 'ryba' | 'maso'
  | 'vajce' | 'mliecne' | 'orechy' | 'semienka' | 'riziko-dusenia' | 'vyprazane' | 'fermentovane'
  | 'rastlinne' | 'tucna-ryba' | 'med' | 'surove-zivocisne';

export type Alergen =
  | 'lepok' | 'korovce' | 'vajcia' | 'ryby' | 'arasidy' | 'soja' | 'mlieko' | 'orechy'
  | 'zeler' | 'horcica' | 'sezam' | 'siricitany' | 'vlcibob' | 'makkyse';

export interface Surovina {
  id: string;                    // kebab-case bez diakritiky, napr. 'psenicna-muka-hladka'
  nazov: string;                 // po slovensky, napr. 'Pšeničná múka hladká'
  skupina: Skupina;
  oddelenie: Oddelenie;
  /** gramy na 1 jednotku: ks (kus), lyzica (polievková), lyzicka (čajová), hrncek (250 ml), strucka, ml (g na 1 ml; default 1) */
  jednotky: { ks?: number; lyzica?: number; lyzicka?: number; hrncek?: number; ml?: number };
  /** na 100 g jedlej časti (surová, ak nie je uvedené inak) */
  na100: { kcal: number; bielk: number; tuky: number; nasyt: number; sach: number; cukry: number; vlak: number; sol: number };
  zdrojNutr: string;             // napr. 'USDA FDC 168878' alebo 'typická hodnota (odhad)'
  odhad: boolean;                // true ak hodnoty neboli overené v tabuľke
  gi?: 'nizky' | 'stredny' | 'vysoky';
  nova: 1 | 2 | 3 | 4;
  /** zápalový potenciál potraviny: -2 (výrazne protizápalová) .. +2 (výrazne prozápalová) – odhad podľa EDIP/DII logiky */
  zapal: -2 | -1 | 0 | 1 | 2;
  priznaky: Priznak[];
  alergeny: Alergen[];
  poznamkaDeti?: string;
}

export type Typ = 'ranajky' | 'obed' | 'vecera' | 'polievka' | 'desiata' | 'dezert';

export interface SurovinaVRecepte {
  id: string;                    // id suroviny
  mnozstvo: number;              // pre `porcie` dospelých dokopy
  jednotka: 'g' | 'ml' | 'ks' | 'lyzica' | 'lyzicka';
  nevyhnutna?: boolean;          // bez nej sa to nedá
  volitelna?: boolean;           // dá sa vynechať
  alternativy?: string[];        // id surovín, ktoré ju môžu nahradiť
}

export interface Uprava {
  typ: 'pridat' | 'vymenit';
  popis: string;                 // napr. 'Pridaj hrsť špenátu'
  z?: string;                    // vymeniť: id pôvodnej suroviny v recepte
  na?: string;                   // id novej suroviny (pridať aj vymeniť)
  mnozstvo?: number;             // g/ml/ks nová surovina (default = pôvodné)
  jednotka?: 'g' | 'ml' | 'ks';
}

export interface Recept {
  id: string;
  nazov: string;
  typ: Typ;
  kuchyna: string;               // 'slovenská', 'talianska', ...
  casPripravy: number;           // minúty
  casVarenia: number;            // minúty
  narocnost: 1 | 2 | 3;
  porcie: number;                // počet dospelých porcií (dieťa 2–6 r. ≈ 0,5)
  suroviny: SurovinaVRecepte[];
  postup: string[];
  tagy: string[];                // 'detske','rychle','do-krabicky','lacne','bezmasite','bez-peciva' ...
  vybavenie: string[];           // 'rura','mixer','airfryer','hrniec','panvica' ...
  upravy: Uprava[];
  skladovanie?: string;
  deti?: string;                 // poznámka pre deti
  klasika?: boolean;             // klasické múčne/ťažké jedlo – referencia
  lepsiaVerzia?: string[];       // id lepších receptov (len pre klasiku)
  vyprazane?: boolean;           // jedlo sa vyprážané/smažené vo veľkom množstve tuku
  ilustracia: string;            // jedno emoji
  vlastny?: boolean;             // recept vytvorený používateľom (localStorage)
  volne?: string[];              // suroviny voľným textom (nie sú v skóre ani v gramovom nákupe)
}

export interface Zdroj {
  id: string; citacia: string; doi: string | null; url: string;
  uroven: 'silné' | 'stredné' | 'slabé' | 'prax';
  tvrdenie: string; cisla: string; overene: string;
  overenie: 'original' | 'vyhladavanie';
  faktory?: string[]; karty?: string[]; diety?: string[];
}
