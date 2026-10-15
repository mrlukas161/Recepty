export interface Karta { id: string; nazov: string; ikona: string; text: string[]; uroven: 'prax' | 'odhad' }
export const OVERENIE_POZNAMKA = 'V tomto behu sa nepodarilo otvoriť a overiť primárne zdroje (PubMed, WHO a i. boli nedostupné). Preto karty neuvádzajú konkrétne čísla ani citácie. Obsah je všeobecná výživová logika označená ako „odhad“ alebo „prax“, nie ako dôkaz. Zoznam zdrojov na overenie je v repozitári (docs/vyskum/NEOVERENE.md).';
export const VEDOMOSTI: Karta[] = [
  { id: 'muka', nazov: 'Múka', ikona: '🌾', uroven: 'odhad', text: ['Biela múka je zbavená otrúb a klíčka, preto má menej vlákniny než celozrnná.', 'V appke ju preto berieme ako surovinu, ktorej je v bežnej strave veľa – nie ako „zlú“.'] },
  { id: 'celozrnne', nazov: 'Celozrnné', ikona: '🍞', uroven: 'odhad', text: ['Celozrnné produkty obsahujú viac vlákniny. Pri chlebe pozri, či je „celozrnný“ naozaj v zložení na prvom mieste.'] },
  { id: 'cukor', nazov: 'Cukor', ikona: '🍬', uroven: 'odhad', text: ['Voľné cukry (cukor, med, sirupy, džús) je rozumné držať nízko, najmä u detí.', 'Ovocie v celku je lepšie než šťava.'] },
  { id: 'udeniny', nazov: 'Údeniny', ikona: '🥓', uroven: 'odhad', text: ['Údeniny bývajú slané a spracované. Preto ich v appke obmedzujeme na výnimočné použitie.'] },
  { id: 'vyprazane', nazov: 'Vyprážané', ikona: '🍟', uroven: 'prax', text: ['Vyprážané jedlá sú tučnejšie a ťažšie na žalúdok. Pečenie v rúre alebo airfryer znižuje množstvo oleja.'] },
  { id: 'ultraspracovane', nazov: 'Ultraspracované potraviny', ikona: '📦', uroven: 'odhad', text: ['Ide o priemyselné výrobky s dlhým zoznamom prísad (sladené cereálie, instantné polievky, párky). V appke ich odhadom označujeme skupinou NOVA 4.'] },
  { id: 'vlaknina', nazov: 'Vláknina', ikona: '🥦', uroven: 'odhad', text: ['Vláknina je v zelenine, ovocí, strukovinách a celozrnných obilninách. Pomáha zasýtiť a prospieva tráveniu.', 'Zvyšuj ju postupne a pi viac vody.'] },
  { id: 'strukoviny', nazov: 'Strukoviny', ikona: '🫘', uroven: 'odhad', text: ['Šošovica, cícer, fazuľa a hrach dávajú bielkoviny aj vlákninu. Môžu nadúvať – namáčanie a dôkladné uvarenie pomáha.'] },
  { id: 'omega3', nazov: 'Ryby a omega-3', ikona: '🐟', uroven: 'odhad', text: ['Tučné ryby (losos, makrela, sardinky) sú zdroj omega-3 mastných kyselín. Zaraďuj ich 1–2× týždenne.'] },
  { id: 'fermentovane', nazov: 'Fermentované potraviny', ikona: '🥛', uroven: 'odhad', text: ['Kefír, jogurt, kyslá kapusta – tradičné fermentované potraviny. Konkrétny zdravotný účinok netvrdíme.'] },
  { id: 'sol', nazov: 'Soľ', ikona: '🧂', uroven: 'odhad', text: ['Soli sa v strave zvyčajne konzumuje priveľa. Deťom jedlo solíme menej než dospelým. Dochucuj bylinkami.'] },
  { id: 'fodmap', nazov: 'FODMAP a ťažkosť po jedle', ikona: '🫄', uroven: 'prax', text: ['Pri pšenici môžu ťažkosti spôsobovať fruktány (druh sacharidov), nie nutne lepok. Celiakia je ale samostatné ochorenie, ktoré určuje lekár. Tučné jedlá sa trávia dlhšie.'] },
  { id: 'zapal', nazov: 'Zápal v strave', ikona: '🔥', uroven: 'odhad', text: ['„Protizápalová“ strava je zjednodušený pojem: v praxi znamená viac zeleniny, strukovín, rýb a orechov a menej rafinovaných obilnín, cukru a spracovaného mäsa. Zaradenie surovín v appke je náš odhad.'] },
  { id: 'deti', nazov: 'Bezpečnosť detí', ikona: '👶', uroven: 'prax', text: ['Do 4 rokov sa dusenie týka celých orechov, celého hrozna, surovej tvrdej zeleniny (mrkva), tvrdých cukríkov a kúskov párkov – krájaj na pozdĺžne štvrťky alebo strúhaj.', 'Med nedávaj deťom do 1 roka. Pri alergii a podozrení na intoleranciu sa poraď s pediatrom.'] },
];
