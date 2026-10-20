/**
 * Jeden zdroj pravdy pre popisy „prečo to škodí“ – rovnaký text sa ukazuje pri skenovanom výrobku, pri recepte aj na karte suroviny.
 * Každý popis má päť častí (a–e); zdroje sú id zo `src/data/zdroje` (úroveň overenia sa zobrazí pri každom).
 * Tón: dávka, nie strašenie. Úroveň dôkazov je pri každom popise výslovne uvedená; rada „čo namiesto“ je často prax, nie dôkaz.
 */
export type UrovenPreco = 'silné' | 'stredné' | 'slabé' | 'prax' | 'odhad';

export interface PrecoSkodi {
  id: string;
  nazov: string;
  /** (a) čo to je a prečo to škodí – mechanizmus jednoducho */
  co: string;
  /** (b) pri akom množstve a ako často to vadí */
  davka: string;
  /** (c) komu viac, najmä deťom */
  komu: string;
  /** (d) čo urobiť namiesto toho */
  namiesto: string;
  /** (e) úroveň dôkazov (slovom) a stručne, na čom stojí */
  dokaz: { uroven: UrovenPreco; text: string };
  zdroje: string[];
}

export const PRECO_ID = [
  'psenicna-muka', 'rafinovany-cukor', 'udeniny', 'dusitany', 'bez-e-zelenina', 'vyprazane', 'nitrozaminy', 'benzen-e211', 'akrylamid', 'hca-pah',
] as const;
export type PrecoId = (typeof PRECO_ID)[number];

export const UROVEN_PRECO_TEXT: Record<UrovenPreco, string> = {
  'silné': 'dôkazy: silné', 'stredné': 'dôkazy: stredné', 'slabé': 'dôkazy: slabé', prax: 'prax, nie dôkaz', odhad: 'odhad',
};

export const PRECO: Record<PrecoId, PrecoSkodi> = {
  'psenicna-muka': {
    id: 'psenicna-muka', nazov: 'Pšeničná múka a pečivo',
    co: 'Biela pšeničná múka je zomletá bez otrúb a klíčka, takže z nej ostáva hlavne škrob. Chlieb, rožky, cestoviny, halušky či knedle z nej zasýtia nakrátko, majú málo vlákniny a cukor v krvi stúpa rýchlejšie než pri celých potravinách. Pšenica navyše obsahuje lepok a fruktány, ktoré citlivejšiemu črevu môžu robiť ťažkosti. Nie je to jed – problém je, že bieleho pečiva býva v strave veľa a vytláča zeleninu, strukoviny a celé zrno.',
    davka: 'Pevný prah nepoznáme. Pozorovacie štúdie spájajú viac celozrnných výrobkov s nižším rizikom chorôb; rafinované zrná takú súvislosť nevykazovali. Naše pravidlo v appke: jedlo s pšeničnou múkou alebo pečivom najviac 1–2× týždenne (je to naše pravidlo, nie lekárska norma).',
    komu: 'Pri celiakii a alergii na pšenicu je pšenica vylúčená (rozhodne lekár). Pri cukrovke sa poraď s lekárom alebo nutričným terapeutom. Deti: nejde o zákaz, len aby biele pečivo nenahrádzalo zeleninu, strukoviny a celozrnné.',
    namiesto: 'Jedlo úplne bez múky: vajcia, zelenina (cuketa, karfiol, kaleráb, zeler), celé strukoviny, zemiaky, ovsené vločky. Iné múky (pohánková, ovsená, mandľová, cícerová) nie sú automatická náhrada – posudzuje ich skóre. Ak pečivo, tak celozrnné a menej často.',
    dokaz: { uroven: 'stredné', text: 'Pozorovacie metaanalýzy (celozrnné vs. rafinované); príčinnosť nie je dokázaná. Pravidlo 1–2× týždenne je náš odhad.' },
    zdroje: ['aune-2016', 'reynolds-2019', 'skodje-2018'],
  },
  'rafinovany-cukor': {
    id: 'rafinovany-cukor', nazov: 'Rafinovaný cukor',
    co: 'Biely cukor je energia bez vlákniny, vitamínov a minerálov. Rýchlo zdvihne cukor v krvi, ľahko sa ho zje veľa (hlavne v nápojoch a sladkostiach) a podporuje zubný kaz. Sladené nápoje súvisia s vyšším rizikom cukrovky 2. typu a priberania.',
    davka: 'WHO odporúča držať voľné cukry pod 10 % energie, ešte lepšie pod 5 % (asi 25 g denne u dospelého). Do voľných cukrov WHO počíta aj med, sirupy a ovocné šťavy – med je teda lepší na chuť, ale s mierou. Cukor v celom čerstvom ovocí sa nepočíta.',
    komu: 'Najmä deti: zuby a chuťové návyky; ESPGHAN odporúča od 2 rokov pod 5 % energie a do 2 rokov čo najmenej. Med deťom do 1 roka nikdy (botulizmus); od 1 roka je bezpečný, ale stále je to voľný cukor. Pri cukrovke sa poraď s lekárom.',
    namiesto: 'Ovocie (banán, datle, jablko) na osladenie, vo vhodných receptoch lyžička medu; nesladené nápoje a voda. Appka sama nenavrhuje recepty s rafinovaným cukrom.',
    dokaz: { uroven: 'silné', text: 'Odporúčanie WHO (2015); súvislosť sladených nápojov s cukrovkou je z pozorovacích štúdií (stredné). Vek pre med: CDC a ANSES uvádzajú 12 mesiacov; „od 2 rokov“ sme v zdrojoch nenašli, ide o hranicu ESPGHAN pre voľné cukry vo všeobecnosti.' },
    zdroje: ['who-cukry-2015', 'espghan-cukor-2017', 'malik-2010', 'cdc-med-botulizmus', 'anses-med-12-mesiacov'],
  },
  udeniny: {
    id: 'udeniny', nazov: 'Údeniny a spracované mäso',
    co: 'Šunka, saláma, klobása, párky a slanina sú mäso konzervované solením, údením alebo dusitanmi. Majú veľa soli a pri ich výrobe a úprave vznikajú látky (napr. nitrozamíny), ktoré sa pri vyšších dávkach spájajú s rakovinou hrubého čreva.',
    davka: 'IARC zaradila spracované mäso do skupiny 1 – to znamená, že dôkaz súvislosti je silný, nie že riziko je veľké. Pri každých 50 g denne je podľa zhrnutia IARC riziko rakoviny hrubého čreva o 18 % vyššie (relatívne; absolútne riziko ostáva malé). Záleží na častosti: občas malá porcia je iné než denne.',
    komu: 'Deti: veľa soli (WHO odporúča dospelým pod 5 g soli denne, deťom menej) a párky či koliesky malým deťom hrozia udusením – krájať pozdĺžne.',
    namiesto: 'Čerstvé pečené alebo varené mäso, vajcia, strukoviny, domáce nátierky. Ak údenina, tak malá porcia, nepripaľovať, k tomu zelenina.',
    dokaz: { uroven: 'stredné', text: 'Pozorovacie štúdie (IARC 2015); panel NutriRECS (2019) ich vyhodnotil s nízkou istotou – odborníci sa nezhodujú v sile odporúčania.' },
    zdroje: ['bouvard-2015', 'johnston-2019', 'who-sodik-2012', 'aap-dusenie-2010'],
  },
  dusitany: {
    id: 'dusitany', nazov: 'Dusitany a dusičnany (E249–E252)',
    co: 'Konzervanty v údeninách: bránia množeniu baktérií (aj botulizmu) a dávajú mäsu ružovú farbu. Z dusitanu a bielkovín môžu vznikať nitrozamíny – niektoré z nich sú v pokusoch karcinogénne.',
    davka: 'EFSA (2017) stanovila prijateľný denný príjem dusitanu 0,07 mg/kg telesnej hmotnosti a pre nitrozamíny už prítomné v mäsových výrobkoch našla pri vysokom príjme malú bezpečnostnú rezervu. Bežná občasná porcia nie je dôvod na paniku; dôležité je, ako často a ako sa údenina upravuje.',
    komu: 'Deti, dojčatá a tehotné opatrnejšie – deti prijímajú viac na kilogram váhy. Dusičnany z celej zeleniny sú iná vec: zelenina je prospešná.',
    namiesto: 'Čerstvé mäso namiesto údeniny. Údeninu neopekať do chrumkava ani pri vysokej teplote (zlatistá, nie hnedá; nižšia teplota) a jesť so zeleninou. Výrobcovia pridávajú vitamín C (E300/E301) aj na potlačenie vzniku nitrozamínov – toto tvrdenie sme zdrojom nepotvrdili, berte ho ako prax, nie dôkaz.',
    dokaz: { uroven: 'silné', text: 'Hodnotenie rizika EFSA (2017, 2023). Vplyv teploty a vitamínu C na tvorbu nitrozamínov v domácej kuchyni sme v našich zdrojoch nepotvrdili – ide o prax.' },
    zdroje: ['efsa-dusitany-nitrozaminy-2017', 'efsa-nitrozaminy-2023', 'efsa-dusicnany-2017'],
  },
  'bez-e-zelenina': {
    id: 'bez-e-zelenina', nazov: '„Bez É“ / „bez dusitanov“ so zeleninovým extraktom',
    co: 'Zeleninový extrakt, prášok alebo koncentrát zo zeleru, špenátu, repy, mangoldu či acerolu je koncentrovaný zdroj dusičnanov. Baktérie ich v mäse premenia na dusitan – je to rovnaká chémia ako pri E249–E252, len pod iným názvom. Preto „bez éčok“ alebo „bez pridaných dusitanov“ neznamená, že výrobok dusitan neobsahuje.',
    davka: 'Množstvo dusitanu závisí od výrobku a recepty sú rôzne. Úrady v USA takéto výrobky povinne označujú „uncured“ a „bez pridaných dusičnanov/dusitanov (okrem tých v zelerovom prášku)“; tvrdenie spotrebiteľských skupín, že dusitanu majú podobne, sme nepreverili. Pre bežnú porciu platí to isté ako pri údeninách: občas áno, denne radšej nie.',
    komu: 'Rovnako ako pri dusitanoch: deti, dojčatá a tehotné opatrnejšie.',
    namiesto: 'Čítaj zloženie, nie reklamu: zeleninový extrakt v mäsovom výrobku ber ako dusitanový. Čerstvé mäso, vajcia alebo strukoviny sú jednoduchšia voľba; nepripaľovať.',
    dokaz: { uroven: 'stredné', text: 'Odborné prehľady a úradné označovanie popisujú premenu dusičnanu na dusitan pri „prirodzenom“ kurovaní; priame meranie v konkrétnych výrobkoch nemáme.' },
    zdroje: ['prirodzene-kurenie-zelenina', 'fsis-uncured-oznacenie', 'efsa-dusicnany-2017'],
  },
  vyprazane: {
    id: 'vyprazane', nazov: 'Vyprážané jedlá',
    co: 'Pri vyprážaní jedlo nasiakne tukom, takže má veľa kalórií a nasýtených tukov. Pri vysokej teplote z škrobových jedál (hranolky, obaľované rezne) vzniká aj akrylamid.',
    davka: 'Metaanalýza pozorovacích štúdií: pri najvyššom príjme vyprážaných jedál bolo vyššie riziko srdcovocievnych príhod (o 28 % v porovnaní s najnižším). Občas nie je problém; v appke je limit 1× týždenne.',
    komu: 'Deti a ľudia s vysokým cholesterolom alebo tlakom; malým deťom hrozí popálenie a udusenie pri tvrdých obaloch.',
    namiesto: 'Pečenie v rúre alebo airfryeri, dusenie, panvica s lyžicou oleja; obal z ovsených vločiek namiesto strúhanky.',
    dokaz: { uroven: 'stredné', text: 'Pozorovacia metaanalýza (Qin 2021); príčinnosť nie je dokázaná. Trans-tuky z priemyselných olejov WHO odporúča držať pod 1 % energie.' },
    zdroje: ['qin-2021', 'who-replace-2018'],
  },
  nitrozaminy: {
    id: 'nitrozaminy', nazov: 'Nitrozamíny',
    co: 'Nitrozamíny vznikajú, keď sa dusitan stretne s bielkovinami (amínmi), najmä pri vysokej teplote a v kyslom prostredí. Niektoré z nich poškodzujú DNA a v pokusoch na zvieratách spôsobujú nádory.',
    davka: 'EFSA (2023) posúdila 10 nitrozamínov a pri vysokom príjme zistila bezpečnostnú rezervu pod 10 000, čo označuje obavu; neznamená to, že pri bežnej občasnej porcii vznikne škoda. Najviac ich prináša spracované mäso, ktoré sa často jedáva.',
    komu: 'Deti a tehotné opatrnejšie (viac na kilogram váhy, rastúci organizmus).',
    namiesto: 'Menej údenín, čerstvé mäso; ak údenina, tak nepripálená a nie často; zelenina s vitamínom C ako súčasť jedla je dobrá prax (nie dôkaz).',
    dokaz: { uroven: 'stredné', text: 'Hodnotenie rizika EFSA; dôkazy sú zo zvieracích pokusov a odhadov príjmu, u ľudí je súvislosť nepriama.' },
    zdroje: ['efsa-nitrozaminy-2023', 'efsa-dusitany-nitrozaminy-2017'],
  },
  'benzen-e211': {
    id: 'benzen-e211', nazov: 'Benzoan (E211) + vitamín C (E300) v nápojoch → benzén',
    co: 'Ak sú v nápoji spolu benzoan sodný (E211, konzervant) a kyselina askorbová (E300, vitamín C), môže vzniknúť stopové množstvo benzénu – najmä keď je nápoj teplý alebo na svetle. Benzén je karcinogén (IARC skupina 1), no dôkaz pochádza z pracovnej expozície, nie z nápojov.',
    davka: 'Úradný prieskum FDA z roku 2006 (takmer 200 nápojov) našiel vo väčšine nápojov benzén nezistiteľný alebo pod 5 ppb a po úprave receptúr bolo pod 1,5 ppb. Úrady riziko neoznačili za vysoké. Pri bežnom pití je to stopa; ide o rozumnú opatrnosť.',
    komu: 'Deti pijú viac na kilogram váhy; sladené ochutené nápoje s konzervantmi sú pre ne zbytočné.',
    namiesto: 'Voda, nesladený čaj, ovocie. Ak ochutený nápoj, tak bez kombinácie E211 + E300; neskladovať teplé ani na slnku.',
    dokaz: { uroven: 'stredné', text: 'Úradné prieskumy výskytu (FDA, Health Canada) a hodnotenie IARC; zdravotný účinok pri týchto stopách sa nepreukázal.' },
    zdroje: ['fda-benzen-napoje-2006', 'healthcanada-benzen-napoje-2006', 'iarc-benzen-2012'],
  },
  akrylamid: {
    id: 'akrylamid', nazov: 'Akrylamid (škrobové jedlá pri vysokej teplote)',
    co: 'Pri pečení, opekaní a vyprážaní škrobových jedál nad približne 120 °C (hranolky, chipsy, opekaný chlieb, sušienky) reaguje aminokyselina asparagín s cukrami a vzniká akrylamid. V pokusoch na zvieratách je karcinogénny (IARC skupina 2A).',
    davka: 'EFSA (2015) považuje dnešný príjem za obavu pre všetky vekové skupiny, no štúdie na ľuďoch akrylamid ako ľudský karcinogén zatiaľ nepreukázali. Čím tmavšie a chrumkavejšie, tým viac; v EÚ platia pravidlá pre výrobcov (nariadenie 2017/2158).',
    komu: 'Deti – na kilogram váhy prijímajú najviac.',
    namiesto: 'Pečiť do zlatista, nie do hneda; nižšia teplota a dlhšie; zemiaky neskladovať v chladničke; hranolky z rúry, nie vyprážané.',
    dokaz: { uroven: 'stredné', text: 'Hodnotenie EFSA (zvieracie dáta); u ľudí nepreukázané. Domáce rady vychádzajú z odporúčaní FDA (prax).' },
    zdroje: ['efsa-akrylamid-2015', 'iarc-akrylamid-1994', 'fda-akrylamid-varenie'],
  },
  'hca-pah': {
    id: 'hca-pah', nazov: 'Grilované a pečené mäso pri vysokej teplote (HCA a PAH)',
    co: 'Pri vysokej teplote vznikajú v mäse heterocyklické amíny (HCA) a pri grilovaní nad plameňom aj polycyklické aromatické uhľovodíky (PAH) z dymu a z tuku kvapkajúceho na uhlie. V laboratórnych pokusoch poškodzujú DNA.',
    davka: 'Limity príjmu nie sú stanovené; pokusy na zvieratách používali dávky mnohonásobne vyššie než bežná strava a príčinná súvislosť u ľudí nie je preukázaná. Platí: čím vyššia teplota, čím dlhšie a čím viac spáleného povrchu, tým viac. Rozhoduje častosť, nie jedno grilovanie.',
    komu: 'Deti a tehotné opatrnejšie; EFSA odporúča PAH držať tak nízko, ako je rozumne dosiahnuteľné.',
    namiesto: 'Nižšia až stredná teplota, mäso otáčať, nepripaľovať a odrezať zuhoľnatené, tuk nenechať kvapkať na uhlie, k mäsu zelenina. Marináda môže pomôcť, no pokusy sú rozporné (prax).',
    dokaz: { uroven: 'slabé', text: 'Laboratórne a zvieracie dáta, nepriame ľudské dôkazy (NCI); EFSA hodnotenie PAH (2008).' },
    zdroje: ['nci-hca-pah-maso', 'efsa-pah-2008'],
  },
};
