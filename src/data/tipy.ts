/** Denné tipy (rotácia bez opakovania, kým neprejdú všetky). `uroven`: kde sa dá tvrdenie overiť. Žiadny tip netvrdí liečebný účinok. */
export interface Tip { id: string; text: string; uroven: 'prax' | 'tabulka' | 'odhad' | 'zdroj'; odkaz?: string }
export const TIPY: Tip[] = [
  { id: 'muka-polovica', text: 'Do placiek a lievancov skús dať polovicu múky celozrnnej alebo ovsenej – cesto bude hustejšie, ale nasýti viac.', uroven: 'prax', odkaz: '#/surovina/ovsena-muka' },
  { id: 'tapioka', text: 'Tapioka je čistý škrob. Je bez lepku, ale nie je zdravšia než biela múka – ak chceš menej múky, nepomôže.', uroven: 'tabulka', odkaz: '#/surovina/tapioka-skrob' },
  { id: 'bulgur-kuskus', text: 'Bulgur a kuskus sú pšenica a majú lepok. Namiesto nich môže byť pohánka, pšeno alebo quinoa.', uroven: 'tabulka', odkaz: '#/surovina/kuskus' },
  { id: 'psyllium', text: 'Psyllium nie je múka, ale spojivo – v bezlepkovom pečive drží cesto. Pridávaj ho po lyžičkách a pi viac vody.', uroven: 'prax', odkaz: '#/surovina/psyllium' },
  { id: 'ranajky-bez-peciva', text: 'Raňajky bez pečiva: vajcia so zeleninou, kaša z vločiek alebo biely jogurt s ovocím. Bez múky a zasýtia.', uroven: 'prax', odkaz: '#/nahrady' },
  { id: 'strouhanka', text: 'Namiesto strúhanky do karbonátkov použi ovsené vločky – menej múky a viac vlákniny.', uroven: 'prax', odkaz: '#/surovina/ovsene-vlocky' },
  { id: 'zahustenie', text: 'Polievku a omáčku zahusti uvarenými zemiakmi alebo červenou šošovicou namiesto zápražky z múky.', uroven: 'prax', odkaz: '#/surovina/zemiaky' },
  { id: 'celozrnne-nazov', text: 'Tmavý chlieb nemusí byť celozrnný, môže byť len zafarbený. Pozri zloženie – celozrnná múka má byť prvá.', uroven: 'prax', odkaz: '#/surovina/chlieb-celozrnny' },
  { id: 'cestoviny-strukoviny', text: 'Cestoviny z cíceru alebo šošovice majú v tabuľke viac bielkovín a vlákniny než pšeničné. Varia sa kratšie.', uroven: 'tabulka', odkaz: '#/surovina/cestoviny-cicerove' },
  { id: 'cuketove-cestoviny', text: 'Z cukety sa dá nastrúhať alebo nakrájať „cestovina“ – rýchlo, bez múky, k omáčke z paradajok.', uroven: 'prax', odkaz: '#/surovina/cuketa' },
  { id: 'celozrnne-pozorovanie', text: 'Pozorovacie štúdie spájajú viac celozrnných výrobkov s nižším rizikom chorôb. Je to súvislosť, nie dôkaz príčiny.', uroven: 'zdroj', odkaz: '#/vedomosti' },
  { id: 'pohanka-lepok', text: 'Pohánka nie je obilnina a lepok neobsahuje. Dá sa použiť ako príloha aj kaša.', uroven: 'tabulka', odkaz: '#/surovina/pohanka' },
  { id: 'psenicna-specka', text: 'Špalda je druh pšenice – svetlá špaldová múka nie je výrazne zdravšia než bežná biela.', uroven: 'tabulka', odkaz: '#/surovina/spaldova-muka-biela' },
  { id: 'mandlova', text: 'Mandľová múka má málo sacharidov, ale veľa tuku a kalórií. Pozor na alergiu na orechy.', uroven: 'tabulka', odkaz: '#/surovina/mandlova-muka' },
  { id: 'kokosova', text: 'Kokosová múka je veľmi savá – nenahrádza pšeničnú 1:1. Pridaj viac tekutiny a vajec.', uroven: 'prax', odkaz: '#/surovina/kokosova-muka' },
  { id: 'chia-gel', text: 'Chia po namočení vytvorí gél. Hodí sa na puding alebo ako spojivo, nie ako náhrada múky.', uroven: 'prax', odkaz: '#/surovina/chia' },
  { id: 'cukor-who', text: 'WHO odporúča držať voľné cukry pod 10 % energie. Ovocie v celku sa nepočíta, džús áno.', uroven: 'zdroj', odkaz: '#/vedomosti' },
  { id: 'cukor-jogurt', text: 'Ochutený jogurt často obsahuje pridaný cukor. Biely jogurt s ovocím ho má menej.', uroven: 'prax', odkaz: '#/nahrady' },
  { id: 'udeniny-vajce', text: 'Namiesto šunky na raňajky skús vajce alebo pečené kuracie plátky – menej soli.', uroven: 'prax', odkaz: '#/nahrady' },
  { id: 'vyprazane-rura', text: 'Rezne a hranolky z rúry alebo airfryera majú podobnú chrumkavosť s menej oleja.', uroven: 'prax', odkaz: '#/nahrady' },
  { id: 'strukoviny-namacat', text: 'Strukoviny namočené cez noc a dôkladne uvarené nenadúvajú tak veľmi.', uroven: 'prax', odkaz: '#/vedomosti' },
  { id: 'sol-bylinky', text: 'Dochucuj bylinkami a citrónom namiesto soli. Deťom solíme menej než dospelým.', uroven: 'zdroj', odkaz: '#/vedomosti' },
  { id: 'etiketa-lepok', text: 'Slovo „bezlepkové“ neznamená zdravšie. Bezlepkové pečivo býva z čistých škrobov – pozri vlákninu.', uroven: 'odhad', odkaz: '#/skener' },
  { id: 'ovos-lepok', text: 'Ovos je prirodzene bez lepku, ale často sa znečistí pšenicou – pri celiakii hľadaj označenie „bezlepkový“.', uroven: 'prax', odkaz: '#/surovina/ovsene-vlocky' },
  { id: 'vlaknina-postupne', text: 'Vlákninu zvyšuj postupne a pi dosť vody – inak môže nadúvať.', uroven: 'prax', odkaz: '#/vedomosti' },
  { id: 'jedalnicek-plan', text: 'Vygeneruj si jedálniček na týždeň a pozri súhrn – uvidíš, koľkokrát vychádza múka.', uroven: 'prax', odkaz: '#/jedalnicek' },
  { id: 'hviezdicky', text: 'Dávaj receptom hviezdičky. Jedna hviezdička znamená „nechutilo“ a recept sa prestane ponúkať.', uroven: 'prax', odkaz: '#/recepty' },
  { id: 'palacinky-ovos', text: 'Placky z rozmixovaných ovsených vločiek, banánu a vajca nepotrebujú žiadnu múku.', uroven: 'prax', odkaz: '#/recepty' },
  { id: 'ryza-natur', text: 'Hnedá ryža má v tabuľke viac vlákniny než biela, ale varí sa dlhšie.', uroven: 'tabulka', odkaz: '#/surovina/ryza-natur' },
  { id: 'pseno', text: '„Pšeno“ je lúpané proso, nie pšenica: neobsahuje lepok. Hodí sa na kašu aj ako príloha.', uroven: 'tabulka', odkaz: '#/surovina/jahly-proso' },
  { id: 'tofu-tempeh', text: 'Tofu a tempeh nenahrádzajú múku, ale mäso a údeniny. Sója je alergén.', uroven: 'tabulka', odkaz: '#/surovina/tempeh' },
];
export const dnesCislo = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
/** Tip dňa: pevné pomiešané poradie (seed), takže sa tip nezopakuje, kým neprejdú všetky; `posun` = „ďalší tip“. */
export function tipDna(d: Date, posun = 0): Tip {
  const n = TIPY.length;
  const poradie = TIPY.map((_, i) => i);
  let s = 20261019;
  for (let i = n - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [poradie[i], poradie[j]] = [poradie[j], poradie[i]]; }
  return TIPY[poradie[(((dnesCislo(d) + posun) % n) + n) % n]];
}
