import type { Recept, SurovinaVRecepte } from '../types';

type J = SurovinaVRecepte['jednotka'];
const s = (id: string, mnozstvo: number, jednotka: J, extra: Partial<SurovinaVRecepte> = {}): SurovinaVRecepte => ({ id, mnozstvo, jednotka, ...extra });

export const receptyDezerty: Recept[] = [
  {
    id: 'ovocna-misa-s-jogurtom', nazov: 'Ovocná misa s jogurtom a orechmi', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 4,
    suroviny: [
      s('jablko', 2, 'ks', { nevyhnutna: true }), s('banan', 2, 'ks'), s('kiwi', 2, 'ks'), s('pomaranc', 1, 'ks'), s('jogurt-biely', 300, 'g', { nevyhnutna: true, alternativy: ['jogurt-grecky'] }),
      s('vlasske-orechy', 30, 'g', { volitelna: true }), s('med', 1, 'lyzica', { volitelna: true }), s('skorica', 0.5, 'lyzicka', { volitelna: true }),
    ],
    postup: [
      'Ovocie umyte; jablko, banán a kiwi nakrájajte na kocky, pomaranč ošúpte a rozdeľte na mesiačiky.',
      'Jablko hneď zmiešajte s pomarančom (šťava zabráni hnednutiu).',
      'Ovocie rozdeľte do štyroch misiek, pridajte do každej asi 75 g jogurtu.',
      'Posypte nahrubo nasekanými vlašskými orechmi, škoricou a podľa chuti zakvapkajte medom.',
    ],
    tagy: ['bezmasite', 'rychle', 'sladke', 'detske', 'bez-peciva'], vybavenie: [],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj lyžicu chia semienok', na: 'chia', mnozstvo: 10, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Biely jogurt nahraď gréckym jogurtom', z: 'jogurt-biely', na: 'jogurt-grecky' },
    ],
    skladovanie: 'Najlepšie čerstvé; v chladničke 1 deň.', deti: 'Orechy deťom do 4 rokov len jemne drvené alebo vynechať; hrozno krájať. Med deťom do 1 roka nedávať.', ilustracia: '🍓',
  },
  {
    id: 'pecene-jablka', nazov: 'Pečené jablká s orechmi a škoricou', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 30, narocnost: 1, porcie: 4,
    suroviny: [
      s('jablko', 4, 'ks', { nevyhnutna: true }), s('vlasske-orechy', 40, 'g'), s('hrozienka', 30, 'g'), s('skorica', 1, 'lyzicka'), s('med', 2, 'lyzicka', { volitelna: true }),
      s('maslo', 10, 'g', { volitelna: true }), s('voda', 50, 'ml'),
    ],
    postup: [
      'Rúru predhrejte na 180 °C. Jablká umyte a vykrojte jadrovníkom jadrá tak, aby spodok zostal celý.',
      'Orechy nahrubo nasekajte a zmiešajte s hrozienkami a škoricou.',
      'Jablká dajte do zapekacej misy, naplňte ich zmesou a na vrch dajte kúsok masla; zakvapkajte medom.',
      'Na dno misy nalejte 50 ml vody.',
      'Pečte 25 až 30 minút, kým nie sú jablká mäkké a kôra popraská.',
      'Podávajte teplé, prípadne s lyžicou jogurtu.',
    ],
    tagy: ['bezmasite', 'sladke', 'bezlepkove', 'detske'], vybavenie: ['rura'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj lyžicu ovsených vločiek do náplne', na: 'ovsene-vlocky', mnozstvo: 20, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Vlašské orechy nahraď tekvicovými semienkami', z: 'vlasske-orechy', na: 'tekvicove-semienka' },
    ],
    skladovanie: 'V chladničke 2 dni, ohrejte v rúre alebo mikrovlnke.', deti: 'Orechy pre malé deti jemne zomelte alebo vynechajte; hrozienka nakrájajte.', ilustracia: '🍎',
  },
  {
    id: 'ovsene-susienky-s-ovocim', nazov: 'Ovsené sušienky s banánom a hrozienkami', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 15, casVarenia: 15, narocnost: 1, porcie: 4,
    suroviny: [
      s('ovsene-vlocky', 200, 'g', { nevyhnutna: true }), s('banan', 2, 'ks', { nevyhnutna: true }), s('hrozienka', 50, 'g'), s('vajce-slepacie', 1, 'ks'),
      s('olej-kokosovy', 2, 'lyzica'), s('skorica', 1, 'lyzicka'), s('prasok-do-peciva', 0.5, 'lyzicka'), s('med', 1, 'lyzica', { volitelna: true }),
    ],
    postup: [
      'Rúru predhrejte na 180 °C a plech vyložte papierom na pečenie.',
      'Banány rozmačkajte vidličkou na kašu.',
      'Pridajte vajce, roztopený kokosový olej, med a premiešajte.',
      'Vmiešajte vločky, škoricu, prášok do pečiva a hrozienka; nechajte 5 minút odstáť, aby vločky nasiakli.',
      'Z cesta formujte lyžicou kôpky (cca 12 kusov), na plechu mierne sploštite.',
      'Pečte 13 až 15 minút dozlatista; nechajte vychladnúť na plechu.',
    ],
    tagy: ['bezmasite', 'sladke', 'detske', 'do-krabicky', 'lacne'], vybavenie: ['rura'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj 2 lyžice mletých ľanových semienok', na: 'lan-semienka', mnozstvo: 15, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Hrozienka nahraď nasekanými sušenými slivkami', z: 'hrozienka', na: 'slivky-susene' },
    ],
    skladovanie: 'V dóze 3 dni, v chladničke 5 dní.', deti: 'Mäkké, vhodné pre deti; hrozienka pre malé deti nakrájať.', ilustracia: '🍪',
  },
  {
    id: 'avokadovy-cokoladovy-puding', nazov: 'Čokoládový puding z avokáda', typ: 'dezert', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 4,
    suroviny: [
      s('avokado', 2, 'ks', { nevyhnutna: true }), s('kakao', 3, 'lyzica', { nevyhnutna: true }), s('datle', 6, 'ks'), s('mlieko-sojove', 120, 'ml'), s('sol', 0.25, 'lyzicka'), s('maliny', 80, 'g', { volitelna: true }),
    ],
    postup: [
      'Datle na 10 minút zalejte horúcou vodou, aby zmäkli, potom scedte.',
      'Avokádo rozpolte, vyberte kôstku a dužinu vyberte lyžicou; musí byť zrelé, inak bude puding horký a hrudkovitý.',
      'Dajte do mixéra avokádo, datle, kakao, mlieko a soľ.',
      'Mixujte 1 až 2 minúty do hladka, v prípade potreby pridajte lyžicu mlieka.',
      'Rozdeľte do štyroch pohárov, aspoň 30 minút nechajte vychladiť v chladničke.',
      'Pred podávaním ozdobte malinami.',
    ],
    tagy: ['bezmasite', 'vegansky', 'bezlepkove', 'sladke', 'rychle'], vybavenie: ['mixer'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj lyžicu arašidového masla pre sýtosť', na: 'arasidove-maslo', mnozstvo: 15, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Sójové mlieko nahraď kokosovým mliekom', z: 'mlieko-sojove', na: 'mlieko-kokosove' },
    ],
    skladovanie: 'V chladničke 2 dni, v uzavretom pohári (tmavne).', deti: 'Obsahuje kakao, ktoré obsahuje malé množstvo kofeínu; malým deťom jednu menšiu porciu.', ilustracia: '🍫',
  },
  {
    id: 'jogurtova-zmrzlina', nazov: 'Jogurtová zmrzlina z malín', typ: 'dezert', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 4,
    suroviny: [
      s('jogurt-grecky', 400, 'g', { nevyhnutna: true }), s('maliny', 300, 'g', { nevyhnutna: true }), s('med', 2, 'lyzica', { volitelna: true }),
      s('citron', 0.5, 'ks', { volitelna: true }),
    ],
    postup: [
      'Maliny použite mrazené (čerstvé najprv na hodinu zmrazte na plechu).',
      'Do výkonného mixéra dajte mrazené maliny, jogurt, med a citrónovú šťavu.',
      'Mixujte 1 až 2 minúty, občas pretlačte hmotu k nožom, kým nie je hustá ako mäkká zmrzlina.',
      'Podávajte hneď; ak chcete pevnejšiu, nechajte 1 hodinu v mrazničke.',
    ],
    tagy: ['bezmasite', 'bezlepkove', 'sladke', 'rychle'], vybavenie: ['mixer'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj hrsť čučoriedok', na: 'cucoriedky', mnozstvo: 80, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Maliny nahraď mrazeným mangom', z: 'maliny', na: 'mango' },
    ],
    skladovanie: 'V mrazničke 1 týždeň; pred podávaním nechajte 10 minút zmäknúť.', deti: 'Maliny majú drobné zrniečka; menším deťom môžu prekážať. Med deťom do 1 roka nedávať.', ilustracia: '🍦',
  },
  {
    id: 'ovocne-tycinky', nazov: 'Domáce ovocné tyčinky z datlí', typ: 'dezert', kuchyna: 'moderná',
    casPripravy: 20, casVarenia: 0, narocnost: 1, porcie: 8,
    suroviny: [
      s('datle-susene', 200, 'g', { nevyhnutna: true }), s('ovsene-vlocky', 100, 'g'), s('mandle', 60, 'g'), s('marhule-susene', 80, 'g'), s('kokos-struhany', 20, 'g', { volitelna: true }),
      s('olej-kokosovy', 1, 'lyzica'), s('skorica', 0.5, 'lyzicka', { volitelna: true }),
    ],
    postup: [
      'Datle bez kôstok zalejte horúcou vodou na 10 minút, potom scedte a vodu zlejte.',
      'Mandle nahrubo nasekajte, marhule nakrájajte na malé kúsky.',
      'V mixéri rozmixujte datle s olejom na hrubú pastu.',
      'V miske zmiešajte pastu s vločkami, mandľami, marhuľami a škoricou; hmota musí držať pohromade.',
      'Pevne natlačte do formy vyloženej papierom (cca 18 x 18 cm) a posypte kokosom.',
      'Nechajte aspoň 2 hodiny stuhnúť v chladničke, potom nakrájajte na 8 tyčiniek.',
    ],
    tagy: ['bezmasite', 'vegansky', 'sladke', 'do-krabicky', 'bez-peciva'], vybavenie: ['mixer'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj tekvicové semienka', na: 'tekvicove-semienka', mnozstvo: 30, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Mandle nahraď slnečnicovými semienkami (bez orechov)', z: 'mandle', na: 'slnecnicove-semienka' },
    ],
    skladovanie: 'V chladničke 7 dní, v mrazničke 2 mesiace.', deti: 'Obsahuje drvené orechy, pre deti do 4 rokov ich nahraďte semienkami; sú lepkavé.', ilustracia: '🍫',
  },
  {
    id: 'jablkovy-kolac-s-ovsom', nazov: 'Jablkový koláč s ovsenou drobenkou', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 25, casVarenia: 40, narocnost: 2, porcie: 8,
    suroviny: [
      s('jablko', 6, 'ks', { nevyhnutna: true }), s('ovsene-vlocky', 150, 'g'), s('spaldova-muka-celozrnna', 150, 'g', { nevyhnutna: true }), s('maslo', 80, 'g'),
      s('med', 3, 'lyzica'), s('vajce-slepacie', 1, 'ks'), s('prasok-do-peciva', 1, 'lyzicka'), s('skorica', 2, 'lyzicka'), s('citron', 0.5, 'ks'),
      s('mlieko-polotucne', 80, 'ml'),
    ],
    postup: [
      'Rúru predhrejte na 180 °C. Formu (cca 22 cm) vymastite maslom.',
      'Jablká ošúpte, nastrúhajte na hrubo, zmiešajte so škoricou a citrónovou šťavou.',
      'Múku zmiešajte s polovicou vločiek a práškom do pečiva, pridajte 50 g studeného masla na kocky a vajce, mlieko a 1 lyžicu medu; vypracujte cesto.',
      'Cesto rozložte na dno formy, naň rozložte jablká.',
      'Drobenku: zvyšné vločky, 30 g masla a 2 lyžice medu premiešajte prstami; posypte na jablká.',
      'Pečte 35 až 40 minút dozlatista; skúška: špajľa zapichnutá do cesta vyjde suchá.',
      'Pred krájaním nechajte vychladnúť aspoň 30 minút.',
    ],
    tagy: ['bezmasite', 'sladke', 'detske', 'na-viac-dni'], vybavenie: ['rura'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj hrsť nasekaných vlašských orechov do drobenky', na: 'vlasske-orechy', mnozstvo: 30, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Med nahraď javorovým sirupom', z: 'med', na: 'javorovy-sirup' },
    ],
    skladovanie: 'Pri izbovej teplote 2 dni, v chladničke 4 dni.', deti: 'Mäkký koláč, vhodný aj pre malé deti.', ilustracia: '🥧',
  },
  {
    id: 'bananove-ovsene-palacinky', nazov: 'Banánové palacinky z ovsených vločiek', typ: 'dezert', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 15, narocnost: 1, porcie: 4,
    suroviny: [
      s('ovsene-vlocky', 120, 'g', { nevyhnutna: true }), s('banan', 2, 'ks', { nevyhnutna: true }), s('vajce-slepacie', 2, 'ks'), s('mlieko-polotucne', 150, 'ml'),
      s('prasok-do-peciva', 1, 'lyzicka'), s('olej-repkovy', 1, 'lyzica'), s('skorica', 0.5, 'lyzicka', { volitelna: true }), s('jogurt-biely', 150, 'g', { volitelna: true }),
      s('maliny', 100, 'g', { volitelna: true }),
    ],
    postup: [
      'Do mixéra dajte vločky, banány na kúsky, vajcia, mlieko, prášok do pečiva a škoricu.',
      'Mixujte do hladkého cesta a nechajte 5 minút odpočinúť.',
      'Panvicu zľahka potrite olejom a rozohrejte na strednom ohni.',
      'Nalievajte po naberačke cesta a pečte 2 až 3 minúty z každej strany, kým sú povrchy zlatohnedé a vajcia úplne prepečené.',
      'Podávajte s jogurtom a malinami.',
    ],
    tagy: ['bezmasite', 'sladke', 'detske', 'rychle'], vybavenie: ['mixer', 'panvica'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj lyžicu ľanových semienok do cesta', na: 'lan-semienka', mnozstvo: 10, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Polotučné mlieko nahraď ovseným', z: 'mlieko-polotucne', na: 'mlieko-ovsene' },
    ],
    skladovanie: 'Upečené v chladničke 2 dni; ohrejte na panvici.', deti: 'Obľúbené u detí, dobre sa držia v ruke.', ilustracia: '🥞',
  },
  {
    id: 'chia-puding-s-ovocim', nazov: 'Chia puding s ovocím', typ: 'dezert', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 4,
    suroviny: [
      s('chia', 50, 'g', { nevyhnutna: true }), s('mlieko-polotucne', 400, 'ml', { nevyhnutna: true, alternativy: ['mlieko-ovsene', 'mlieko-sojove'] }), s('med', 2, 'lyzica', { volitelna: true }), s('jahody', 200, 'g'), s('banan', 1, 'ks'),
    ],
    postup: [
      'V miske zmiešajte chia, mlieko a med.',
      'Po 5 minútach znova prešľahajte, aby sa semienka nezlepili.',
      'Prikryte a nechajte v chladničke aspoň 3 hodiny, najlepšie cez noc.',
      'Jahody a banán nakrájajte na kúsky.',
      'Puding rozdeľte do pohárov a navrch dajte ovocie.',
    ],
    tagy: ['bezmasite', 'bezlepkove', 'sladke', 'do-krabicky', 'rychle'], vybavenie: [],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj lyžicu kakaa do pudingu', na: 'kakao', mnozstvo: 10, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Polotučné mlieko nahraď sójovým pre vegánsku verziu', z: 'mlieko-polotucne', na: 'mlieko-sojove' },
    ],
    skladovanie: 'V chladničke 3 dni bez ovocia.', deti: 'Chia semienka nechajte vždy v mlieku napučať (suché hrozia zadusením).', ilustracia: '🍓',
  },
  {
    id: 'bananova-zmrzlina', nazov: 'Banánová zmrzlina s kakaom', typ: 'dezert', kuchyna: 'moderná',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 4,
    suroviny: [
      s('banan', 5, 'ks', { nevyhnutna: true }), s('kakao', 2, 'lyzica'), s('mlieko-sojove', 50, 'ml'), s('arasidove-maslo', 1, 'lyzica', { volitelna: true }),
    ],
    postup: [
      'Banány ošúpte, nakrájajte na kolieska a dajte aspoň na 4 hodiny do mrazničky na tácke.',
      'Zmrazené kolieska dajte do výkonného mixéra s kakaom a mliekom.',
      'Mixujte, kým hmota nie je hladká ako zmrzlina; zoškrabujte steny podľa potreby.',
      'Prípadne vmiešajte arašidové maslo, podávajte hneď.',
    ],
    tagy: ['bezmasite', 'vegansky', 'bezlepkove', 'sladke', 'rychle'], vybavenie: ['mixer'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj hrsť nasekaných lieskových orechov na posyp', na: 'liesikove-orechy', mnozstvo: 20, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Kakao nahraď mrazenými malinami na ovocnú verziu', z: 'kakao', na: 'maliny', mnozstvo: 100, jednotka: 'g' },
    ],
    skladovanie: 'Najlepšie hneď; zvyšok v mrazničke 3 dni, pred podávaním nechajte 10 minút zmäknúť.', deti: 'Veľmi sladká od banánov, ale bez pridaného cukru.', ilustracia: '🍌',
  },
  {
    id: 'tvarohovy-krem-s-ovocim', nazov: 'Tvarohový krém s ovocím', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 0, narocnost: 1, porcie: 4,
    suroviny: [
      s('tvaroh-makky', 250, 'g', { nevyhnutna: true }), s('jogurt-biely', 150, 'g'), s('maliny', 200, 'g', { alternativy: ['jahody', 'cucoriedky'] }), s('med', 1, 'lyzica', { volitelna: true }), s('ovsene-vlocky', 30, 'g', { volitelna: true }),
    ],
    postup: [
      'Tvaroh vymiešajte s jogurtom, vanilkou a medom, kým nie je hladký.',
      'Polovicu malín rozmačkajte vidličkou, druhú nechajte celú.',
      'Do pohárov vrstvite tvarohový krém a maliny.',
      'Navrch posypte opražené ovsené vločky (2 minúty na suchej panvici).',
    ],
    tagy: ['bezmasite', 'sladke', 'rychle', 'detske'], vybavenie: ['panvica'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj lyžicu chia semienok', na: 'chia', mnozstvo: 10, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Maliny nahraď jahodami', z: 'maliny', na: 'jahody' },
    ],
    skladovanie: 'V chladničke 2 dni.', deti: 'Med deťom do 1 roka nedávať.', ilustracia: '🍨',
  },
  {
    id: 'cucoriedkove-muffiny', nazov: 'Špaldové muffiny s čučoriedkami', typ: 'dezert', kuchyna: 'moderná',
    casPripravy: 15, casVarenia: 22, narocnost: 2, porcie: 6,
    suroviny: [
      s('spaldova-muka-biela', 200, 'g', { nevyhnutna: true }), s('cucoriedky', 150, 'g'), s('jogurt-biely', 150, 'g'), s('vajce-slepacie', 2, 'ks'), s('olej-repkovy', 4, 'lyzica'),
      s('med', 3, 'lyzica'), s('prasok-do-peciva', 2, 'lyzicka'), s('sol', 0.25, 'lyzicka'),
    ],
    postup: [
      'Rúru predhrejte na 180 °C a formu na 6 až 8 muffinov vyložte košíčkami.',
      'Vajcia vyšľahajte s medom, olejom, jogurtom a vanilkou.',
      'Múku zmiešajte s práškom do pečiva a soľou, vsypte do mokrej zmesi a premiešajte len, kým zmizne suchá múka.',
      'Opatrne vmiešajte čučoriedky.',
      'Naplňte košíčky do 2/3 a pečte 20 až 22 minút; špajľa musí vyjsť suchá.',
      'Nechajte 10 minút v forme, potom preložte na mriežku.',
    ],
    tagy: ['bezmasite', 'sladke', 'detske', 'do-krabicky'], vybavenie: ['rura'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj nastrúhané jablko', na: 'jablko', mnozstvo: 100, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Špaldovú múku svetlú nahraď celozrnnou', z: 'spaldova-muka-biela', na: 'spaldova-muka-celozrnna' },
    ],
    skladovanie: 'Pri izbovej teplote 2 dni, v mrazničke 2 mesiace.', deti: 'Mäkké, vhodné pre deti.', ilustracia: '🧁',
  },
  {
    id: 'kompot-z-jablk-a-sliviek', nazov: 'Jablkovo-slivkový kompót bez cukru', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 10, casVarenia: 15, narocnost: 1, porcie: 4,
    suroviny: [
      s('jablko', 4, 'ks', { nevyhnutna: true }), s('slivky-susene', 80, 'g'), s('skorica', 1, 'lyzicka'), s('citron', 0.5, 'ks'), s('voda', 300, 'ml'),
      s('jogurt-grecky', 120, 'g', { volitelna: true }),
    ],
    postup: [
      'Jablká ošúpte, zbavte jadrovníkov a nakrájajte na kúsky.',
      'Slivky nakrájajte na štvrtiny.',
      'V hrnci dajte jablká, slivky, vodu, škoricu a citrónovú šťavu.',
      'Varte pod pokrievkou 12 až 15 minút na miernom ohni, kým jablká zmäknú.',
      'Podávajte teplé alebo vychladené, s lyžicou gréckeho jogurtu.',
    ],
    tagy: ['bezmasite', 'bezlepkove', 'sladke', 'detske', 'lacne'], vybavenie: ['hrniec'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj hrsť ovsených vločiek na raňajkovú verziu', na: 'ovsene-vlocky', mnozstvo: 30, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Sušené slivky nahraď hruškami', z: 'slivky-susene', na: 'hruska', mnozstvo: 170, jednotka: 'g' },
    ],
    skladovanie: 'V chladničke 4 dni v uzavretej nádobe.', deti: 'Mäkký, bez pridaného cukru.', ilustracia: '🍐',
  },
  // ---- Klasiky: verne, s bežným množstvom cukru ----
  {
    id: 'makovy-zavin', nazov: 'Makový závin', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 120, casVarenia: 40, narocnost: 3, porcie: 10,
    suroviny: [
      s('psenicna-muka-hladka', 500, 'g', { nevyhnutna: true }), s('kvasnice-sucha', 1, 'ks'), s('mlieko-plnotucne', 400, 'ml'), s('maslo', 80, 'g'), s('med', 110, 'g'),
      s('vajce-slepacie', 2, 'ks'), s('sol', 0.5, 'lyzicka'), s('mak', 200, 'g', { nevyhnutna: true }), s('hrozienka', 50, 'g', { volitelna: true }), s('skorica', 0.5, 'lyzicka', { volitelna: true }),
    ],
    postup: [
      'Droždie rozmiešajte v 100 ml vlažného mlieka s lyžičkou medu z celkového množstva; nechajte 10 minút, kým sa spení.',
      'Múku zmiešajte so soľou, 1 vajcom, zvyšnými 150 ml mlieka, 60 g mäkkého masla, polovicou medu a vzídeným droždím; vypracujte hladké cesto (cca 10 minút).',
      'Nechajte kysnúť na teplom mieste 1 hodinu, kým nezväčší objem.',
      'Mak zomelte, spolu so 150 ml mlieka, zvyšným medom a zvyšnými 20 g masla krátko povarte (5 až 8 minút) do zhustnutia, pridajte škoricu a hrozienka, nechajte vychladnúť.',
      'Cesto rozvaľkajte na obdĺžnik cca 30 x 40 cm, natrite makovou plnkou a zrolujte, kraje dobre zaštipnite.',
      'Závin dajte na plech s papierom, nechajte 20 minút kysnúť, potrite rozšľahaným vajcom.',
      'Pečte pri 180 °C 35 až 40 minút dozlatista. Nechajte chladnúť pod utierkou.',
    ],
    tagy: ['sladke', 'bezmasite'], vybavenie: ['rura'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj do plnky nastrúhané jablko', na: 'jablko', mnozstvo: 100, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Časť bielej múky nahraď špaldovou celozrnnou', z: 'psenicna-muka-hladka', na: 'spaldova-muka-celozrnna' },
    ],
    skladovanie: 'V uzavretej nádobe 3 dni; krájané plátky sa dajú zamraziť.', deti: 'Klasika na slávnostné chvíle; dojčatám sa mak neodporúča (poraďte sa s pediatrom). Pre menšie deti porcie malé.', klasika: true, lepsiaVerzia: [], ilustracia: '🥮',
  },
  {
    id: 'sisky', nazov: 'Šišky s jablkovou plnkou', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 100, casVarenia: 25, narocnost: 3, porcie: 8,
    suroviny: [
      s('psenicna-muka-hladka', 500, 'g', { nevyhnutna: true }), s('kvasnice-sucha', 2, 'ks'), s('mlieko-plnotucne', 250, 'ml'), s('maslo', 60, 'g'), s('med', 40, 'g'),
      s('vajce-zltok', 3, 'ks'), s('sol', 0.5, 'lyzicka'), s('jablko', 200, 'g', { nevyhnutna: true }), s('olej-repkovy', 800, 'ml'),
    ],
    postup: [
      'Mlieko zohrejte na vlažné, rozmiešajte v ňom droždie s lyžičkou medu; nechajte 10 minút vzísť.',
      'Múku zmiešajte so soľou, zvyšným medom, žĺtkami, maslom a droždím; vypracujte hladké cesto.',
      'Nechajte kysnúť 1 hodinu na teplom mieste.',
      'Cesto rozvaľkajte na hrúbku cca 1,5 cm, vykrajujte kolieska (cca 7 cm). Na polovicu dajte lyžičku jablkovej plnky (nastrúhané jablko 10 minút povarené bez cukru), prikryte druhým koliesom a okraje zlepte.',
      'Šišky nechajte 20 minút kysnúť, potom smažte v oleji zohriatom na 170 °C po 2,5 až 3 minúty z každej strany, pod pokrievkou, aby mali obvod svetlý.',
      'Osušte na papierovej utierke a podávajte posypané škoricou. Teplotu oleja držte stálu; príliš horúci olej ich spáli zvonka a vnútri ostanú surové.',
    ],
    tagy: ['sladke', 'bezmasite'], vybavenie: ['hrniec'],
    upravy: [
      { typ: 'pridat', popis: 'Naplň aj trochou tvarohu s citrónom', na: 'tvaroh-makky', mnozstvo: 100, jednotka: 'g' },
    ],
    skladovanie: 'Najlepšie čerstvé v ten istý deň, 1 deň v uzavretej nádobe.', deti: 'Horúci olej; nepribližovať deti. Vyprážané a sladké – skôr výnimočne.', klasika: true, vyprazane: true, lepsiaVerzia: [], ilustracia: '🍩',
  },
  {
    id: 'pernik', nazov: 'Medový perník', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 25, casVarenia: 45, narocnost: 2, porcie: 12,
    suroviny: [
      s('psenicna-muka-polohruba', 400, 'g', { nevyhnutna: true }), s('med', 230, 'g', { nevyhnutna: true }), s('maslo', 80, 'g'), s('vajce-slepacie', 2, 'ks'),
      s('mlieko-plnotucne', 150, 'ml'), s('kakao', 2, 'lyzica'), s('skorica', 2, 'lyzicka'), s('zazvor', 15, 'g'), s('soda-bikarbona', 1, 'lyzicka'),
      s('cokolada-horka', 50, 'g', { volitelna: true }),
    ],
    postup: [
      'Med, maslo a mlieko zohrejte v hrnci, kým sa maslo nerozpustí (nevarte); nechajte vychladnúť do vlažna.',
      'Múku zmiešajte s kakaom, škoricou, strúhaným zázvorom a sódou bikarbónou.',
      'Do vlažnej zmesi vmiešajte vajcia, potom suché suroviny; vznikne lejavé cesto.',
      'Vylejte do vymastenej a múkou vysypanej formy (cca 28 x 18 cm).',
      'Pečte pri 170 °C 40 až 45 minút; špajľa musí vyjsť suchá.',
      'Nechajte vychladnúť, prípadne pozdĺžne prekrojte, natrite džemom a polejte roztopenou čokoládou.',
    ],
    tagy: ['sladke', 'bezmasite', 'na-viac-dni'], vybavenie: ['rura', 'hrniec'],
    upravy: [
      { typ: 'pridat', popis: 'Pridaj nahrubo nasekané vlašské orechy', na: 'vlasske-orechy', mnozstvo: 50, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Časť polohrubej múky nahraď celozrnnou', z: 'psenicna-muka-polohruba', na: 'psenicna-muka-celozrnna' },
    ],
    skladovanie: 'V dóze 5 dní, na druhý deň je mäkší.', deti: 'Obsahuje med; deťom do 1 roka nedávať.', klasika: true, lepsiaVerzia: [], ilustracia: '🍫',
  },
  {
    id: 'tvarohovy-kolac', nazov: 'Tvarohový koláč', typ: 'dezert', kuchyna: 'slovenská',
    casPripravy: 40, casVarenia: 55, narocnost: 2, porcie: 12,
    suroviny: [
      s('psenicna-muka-hladka', 250, 'g', { nevyhnutna: true }), s('maslo', 125, 'g'), s('med', 40, 'g'), s('vajce-slepacie', 4, 'ks'),
      s('tvaroh-makky', 500, 'g', { nevyhnutna: true }), s('med', 80, 'g'), s('kukuricny-skrob', 25, 'g'), s('smotana-kysla', 150, 'g'), s('citron', 1, 'ks'), s('hrozienka', 50, 'g', { volitelna: true }),
    ],
    postup: [
      'Cesto: múku, studené maslo na kocky, med a 1 vajce rýchlo vypracujte, zabaľte do fólie a nechajte 30 minút v chladničke.',
      'Rúru predhrejte na 170 °C. Cesto rozotrite na dno a po okraj formy (cca 24 cm) a niekoľkokrát prepichnite vidličkou.',
      'Plnka: tvaroh pretlačte cez sito, vymiešajte s medom, 3 vajcami, kukuričným škrobom, smotanou, vanilkou a citrónovou kôrou a šťavou.',
      'Vmiešajte hrozienka, plnku nalejte na cesto.',
      'Pečte 50 až 55 minút, kým nie je okraj pevný a stred sa len mierne chveje.',
      'Rúru vypnite, otvorte dvierka a nechajte koláč 15 minút odpočívať, potom ho nechajte vychladnúť (praskliny sa tým obmedzia).',
      'Pred krájaním nechajte aspoň 4 hodiny v chladničke.',
    ],
    tagy: ['sladke', 'bezmasite'], vybavenie: ['rura'],
    upravy: [
      { typ: 'pridat', popis: 'Navrch dajte čerstvé maliny', na: 'maliny', mnozstvo: 150, jednotka: 'g' },
      { typ: 'vymenit', popis: 'Kyslú smotanu nahraď gréckym jogurtom', z: 'smotana-kysla', na: 'jogurt-grecky' },
    ],
    skladovanie: 'V chladničke 4 dni, obsahuje vajcia a tvaroh, nenechávajte vonku dlhšie ako 2 hodiny.', deti: 'Sladené medom (voľný cukor podľa WHO), stále sladké; dieťaťu stačí malý kúsok.', klasika: true, lepsiaVerzia: [], ilustracia: '🍰',
  },
];
