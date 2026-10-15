import type {Surovina} from '../types';

type Sk = Surovina['skupina'];
type Od = Surovina['oddelenie'];
type Gi = Surovina['gi'];
type Pr = Surovina['priznaky'];
type Al = Surovina['alergeny'];
type Zp = Surovina['zapal'];
type Nova = Surovina['nova'];
type J = Surovina['jednotky'];

/** Pomocná funkcia: hodnoty na 100 g = [kcal, bielk, tuky, nasyt, sach, cukry, vlak, sol]. Všetko sú typické hodnoty (odhad). */
function s(
  id: string, nazov: string, skupina: Sk, oddelenie: Od, jednotky: J,
  v: [number, number, number, number, number, number, number, number],
  gi: Gi, nova: Nova, zapal: Zp, priznaky: Pr, alergeny: Al, poznamkaDeti?: string,
): Surovina {
  const [kcal, bielk, tuky, nasyt, sach, cukry, vlak, sol] = v;
  const r: Surovina = {
    id, nazov, skupina, oddelenie, jednotky,
    na100: {kcal, bielk, tuky, nasyt, sach, cukry, vlak, sol},
    zdrojNutr: 'typická hodnota (odhad)', odhad: true, gi, nova, zapal, priznaky, alergeny,
  };
  if (poznamkaDeti) r.poznamkaDeti = poznamkaDeti;
  return r;
}

const M: Sk = 'muky-obilniny';
const OM: Od = 'obilniny-muky';
const OZ: Od = 'ovocie-zelenina';

export const surovinyA: Surovina[] = [
  // ---------- Múky a obilniny ----------
  s('psenicna-muka-hladka', 'Pšeničná múka hladká', M, OM, {lyzica: 10, hrncek: 130}, [340, 10, 1, 0.2, 73, 0.5, 3, 0], 'vysoky', 2, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok'], 'Surová múka sa nejedáva (riziko baktérií) – vždy tepelne spracovať.'),
  s('psenicna-muka-polohruba', 'Pšeničná múka polohrubá', M, OM, {lyzica: 12, hrncek: 140}, [340, 10, 1, 0.2, 72, 0.5, 3, 0], 'vysoky', 2, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('psenicna-muka-hruba', 'Pšeničná múka hrubá', M, OM, {lyzica: 13, hrncek: 150}, [340, 10, 1, 0.2, 72, 0.5, 3, 0], 'vysoky', 2, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('psenicna-muka-celozrnna', 'Pšeničná múka celozrnná', M, OM, {lyzica: 10, hrncek: 130}, [335, 13, 2, 0.3, 62, 1, 10, 0], 'stredny', 1, -1, ['celozrnne', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('spaldova-muka-biela', 'Špaldová múka svetlá', M, OM, {lyzica: 10, hrncek: 130}, [340, 11, 2, 0.3, 68, 1, 4, 0], 'vysoky', 2, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok'], 'Špalda je druh pšenice – obsahuje lepok.'),
  s('spaldova-muka-celozrnna', 'Špaldová múka celozrnná', M, OM, {lyzica: 10, hrncek: 130}, [335, 14, 2.5, 0.4, 62, 1, 9, 0], 'stredny', 1, -1, ['celozrnne', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('razna-muka', 'Ražná múka celozrnná', M, OM, {lyzica: 10, hrncek: 120}, [335, 9, 1.5, 0.2, 70, 1, 6, 0], 'stredny', 1, -1, ['celozrnne', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('ovsena-muka', 'Ovsená múka', M, OM, {lyzica: 8, hrncek: 100}, [380, 13, 7, 1.2, 65, 1, 9, 0], 'stredny', 2, -1, ['celozrnne', 'lepok', 'rastlinne'], ['lepok'], 'Ovos sa v EÚ označuje ako obilnina s lepkom (kontaminácia pšenicou).'),
  s('ovsene-vlocky', 'Ovsené vločky', M, OM, {lyzica: 8, hrncek: 90}, [370, 13, 7, 1.2, 60, 1, 10, 0], 'stredny', 2, -1, ['celozrnne', 'lepok', 'rastlinne'], ['lepok'], 'Jemné vločky sú vhodné aj pre menšie deti v kaši.'),
  s('ovsene-otruby', 'Ovsené otruby', M, OM, {lyzica: 7, hrncek: 90}, [245, 17, 7, 1.2, 66, 1, 15, 0], 'nizky', 1, -1, ['celozrnne', 'lepok', 'rastlinne'], ['lepok']),
  s('pohanka', 'Pohánka lúpaná', M, OM, {lyzica: 15, hrncek: 170}, [343, 13, 3.4, 0.7, 72, 2, 10, 0], 'nizky', 1, -1, ['celozrnne', 'rastlinne'], [], 'Bez lepku (pri celiakii hľadať certifikovanú bezlepkovú).'),
  s('pohankova-muka', 'Pohánková múka', M, OM, {lyzica: 9, hrncek: 120}, [340, 12, 3, 0.7, 70, 2, 10, 0], 'nizky', 2, -1, ['celozrnne', 'rastlinne'], []),
  s('jahly-proso', 'Jahly (proso lúpané)', M, OM, {lyzica: 15, hrncek: 190}, [378, 11, 4, 0.7, 73, 0.5, 8.5, 0], 'stredny', 1, 0, ['rastlinne'], [], 'Mäkká, ľahko stráviteľná kaša vhodná pre deti.'),
  s('ryza-biela', 'Ryža biela dlhozrnná', M, OM, {lyzica: 15, hrncek: 190}, [350, 7, 0.6, 0.2, 78, 0.1, 1.3, 0], 'vysoky', 1, 0, ['rastlinne'], []),
  s('ryza-natur', 'Ryža natural (hnedá)', M, OM, {lyzica: 15, hrncek: 190}, [350, 7.5, 2.7, 0.5, 74, 0.8, 3.5, 0], 'stredny', 1, -1, ['celozrnne', 'rastlinne'], []),
  s('ryza-basmati', 'Ryža basmati', M, OM, {lyzica: 15, hrncek: 190}, [350, 8, 0.7, 0.2, 77, 0.1, 1.5, 0], 'stredny', 1, 0, ['rastlinne'], []),
  s('ryzova-muka', 'Ryžová múka', M, OM, {lyzica: 10, hrncek: 140}, [360, 6, 1.4, 0.4, 80, 0.2, 2.4, 0], 'vysoky', 2, 1, ['rafinovana-muka', 'rastlinne'], [], 'Bez lepku, ale ako biela múka glykemicky rýchla.'),
  s('kuskus', 'Kuskus pšeničný', M, OM, {lyzica: 12, hrncek: 160}, [365, 13, 0.6, 0.1, 77, 0.5, 5, 0], 'stredny', 3, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('bulgur', 'Bulgur', M, OM, {lyzica: 12, hrncek: 160}, [340, 12, 1.3, 0.2, 64, 0.4, 12, 0], 'nizky', 2, -1, ['celozrnne', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('kukuricna-muka', 'Kukuričná múka', M, OM, {lyzica: 9, hrncek: 120}, [360, 7, 3.9, 0.5, 77, 1, 7, 0], 'stredny', 2, 0, ['rastlinne'], []),
  s('kukuricna-krupica', 'Kukuričná krupica (polenta)', M, OM, {lyzica: 12, hrncek: 160}, [360, 8, 1.5, 0.2, 78, 1, 3, 0], 'stredny', 2, 0, ['rastlinne'], []),
  s('jacmenne-kroupy', 'Jačmenné kroupy', M, OM, {lyzica: 15, hrncek: 200}, [350, 10, 1.2, 0.3, 73, 1, 15, 0], 'nizky', 2, -1, ['lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('psenicna-krupica', 'Pšeničná krupica', M, OM, {lyzica: 12, hrncek: 160}, [360, 11, 1, 0.2, 73, 1, 3.9, 0], 'vysoky', 2, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok'], 'Klasická detská krupicová kaša.'),
  s('quinoa', 'Quinoa', M, OM, {lyzica: 12, hrncek: 170}, [370, 14, 6, 0.7, 64, 2, 7, 0], 'stredny', 1, -1, ['rastlinne'], []),
  s('amarant', 'Amarant', M, OM, {lyzica: 12, hrncek: 190}, [370, 14, 7, 1.5, 65, 1.7, 7, 0], 'stredny', 1, -1, ['rastlinne'], []),
  s('cicerova-muka', 'Cícerová múka', M, OM, {lyzica: 8, hrncek: 110}, [380, 22, 6, 0.7, 58, 10, 11, 0], 'nizky', 2, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('sosovicova-muka', 'Šošovicová múka', M, OM, {lyzica: 8, hrncek: 110}, [350, 25, 1, 0.2, 60, 2, 11, 0], 'nizky', 2, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('mandlova-muka', 'Mandľová múka', M, OM, {lyzica: 7, hrncek: 100}, [600, 21, 53, 4, 10, 4, 10, 0], 'nizky', 2, -1, ['orechy', 'rastlinne'], ['orechy'], 'Alergén – orechy. Nepoužívať, ak je v rodine alergia.'),
  s('kokosova-muka', 'Kokosová múka', M, OM, {lyzica: 8, hrncek: 110}, [400, 18, 14, 12, 60, 9, 38, 0.1], 'nizky', 2, 0, ['vysoky-fodmap', 'rastlinne'], [], 'Veľmi savá – v receptoch nahrádza len malú časť múky.'),
  s('kukurica-pukancova', 'Kukurica na pukance (zrno)', M, OM, {lyzica: 15}, [375, 12, 4, 0.5, 74, 1, 15, 0], 'stredny', 1, 0, ['celozrnne', 'riziko-dusenia', 'rastlinne'], [], 'Pukance a nerozpukané zrná sú riziko dusenia – nie pre deti do 4 rokov.'),

  // ---------- Pečivo ----------
  s('rozok-biely', 'Rožok biely', 'pecivo', 'pecivo', {ks: 45}, [270, 9, 2, 0.5, 52, 3, 2.5, 1.2], 'vysoky', 3, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('chlieb-psenicno-razny', 'Chlieb pšenično-ražný (konzumný)', 'pecivo', 'pecivo', {ks: 40}, [250, 8, 1.3, 0.3, 48, 3, 4, 1.2], 'vysoky', 3, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok'], 'Plátok chleba: ≈ 40 g.'),
  s('chlieb-celozrnny', 'Chlieb celozrnný pšeničný', 'pecivo', 'pecivo', {ks: 45}, [250, 10, 3, 0.6, 42, 4, 7, 1], 'stredny', 3, -1, ['celozrnne', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('chlieb-razny-kvaskovy', 'Chlieb ražný kváskový tmavý', 'pecivo', 'pecivo', {ks: 45}, [230, 7, 1.3, 0.2, 45, 2, 8, 1.2], 'nizky', 3, -1, ['celozrnne', 'lepok', 'fermentovane', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('toastovy-chlieb', 'Toastový chlieb', 'pecivo', 'pecivo', {ks: 25}, [265, 8, 3.5, 0.8, 49, 5, 2.5, 1.1], 'vysoky', 4, 1, ['rafinovana-muka', 'pridany-cukor', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('bageta', 'Bageta', 'pecivo', 'pecivo', {ks: 250}, [270, 9, 1, 0.2, 55, 2, 2.5, 1.4], 'vysoky', 3, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('tortilla-psenicna', 'Tortilla pšeničná', 'pecivo', 'pecivo', {ks: 60}, [310, 8, 8, 2, 50, 2, 3, 1.3], 'vysoky', 4, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('tortilla-kukuricna', 'Tortilla kukuričná', 'pecivo', 'pecivo', {ks: 30}, [220, 5.7, 2.9, 0.4, 44, 1, 5, 0.1], 'stredny', 3, 0, ['rastlinne'], []),
  s('pita', 'Pita chlieb', 'pecivo', 'pecivo', {ks: 60}, [275, 9, 1.2, 0.2, 56, 1.3, 2.2, 1.1], 'vysoky', 3, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('knackebrot-razny', 'Chrumkavý chlebíček ražný', 'pecivo', 'pecivo', {ks: 10}, [330, 10, 2, 0.3, 65, 2, 14, 1], 'stredny', 3, -1, ['celozrnne', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('ryzove-chlebicky', 'Ryžové chlebíčky (nadúvané)', 'pecivo', 'trvanlive', {ks: 9}, [380, 8, 3, 0.7, 81, 0.5, 3, 0.1], 'vysoky', 4, 1, ['riziko-dusenia', 'rastlinne'], [], 'Rozpadavé kúsky môžu uviaznuť v hrdle – malým deťom len pod dohľadom.'),
  s('strouhanka', 'Strúhanka', 'pecivo', 'pecivo', {lyzica: 8, hrncek: 120}, [395, 13, 5, 1, 72, 5, 4, 1.5], 'vysoky', 3, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),

  // ---------- Cestoviny ----------
  s('cestoviny-psenicne', 'Cestoviny pšeničné sušené', 'cestoviny', OM, {hrncek: 100}, [360, 13, 1.5, 0.3, 72, 3, 3, 0.02], 'stredny', 3, 1, ['rafinovana-muka', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('cestoviny-celozrnne', 'Cestoviny celozrnné sušené', 'cestoviny', OM, {hrncek: 100}, [340, 13, 2.5, 0.5, 63, 3, 8, 0.02], 'stredny', 3, -1, ['celozrnne', 'lepok', 'rastlinne', 'vysoky-fodmap'], ['lepok']),
  s('cestoviny-vajecne', 'Cestoviny vaječné sušené', 'cestoviny', OM, {hrncek: 100}, [370, 14, 3, 0.8, 71, 3, 3, 0.05], 'stredny', 3, 1, ['rafinovana-muka', 'lepok', 'vajce', 'rastlinne', 'vysoky-fodmap'], ['lepok', 'vajcia']),
  s('cestoviny-ryzove', 'Cestoviny ryžové sušené', 'cestoviny', OM, {hrncek: 100}, [360, 7, 0.6, 0.1, 80, 0.5, 2, 0.02], 'stredny', 3, 1, ['rastlinne', 'rafinovana-muka'], []),
  s('cestoviny-cicerove', 'Cestoviny cícerové sušené', 'cestoviny', OM, {hrncek: 90}, [350, 21, 6, 0.7, 50, 5, 10, 0.02], 'nizky', 3, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('cestoviny-sosovicove', 'Cestoviny šošovicové sušené', 'cestoviny', OM, {hrncek: 90}, [340, 25, 2, 0.4, 50, 3, 10, 0.02], 'nizky', 3, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),

  // ---------- Prílohy ----------
  s('zemiaky', 'Zemiaky', 'prilohy', OZ, {ks: 120}, [77, 2, 0.1, 0, 17, 1, 2, 0.01], 'vysoky', 1, 0, ['rastlinne'], [], 'Zelené časti a klíčky sú jedovaté – odstrániť.'),
  s('zemiaky-nove', 'Zemiaky nové', 'prilohy', OZ, {ks: 60}, [70, 2, 0.1, 0, 16, 1, 2, 0.01], 'stredny', 1, 0, ['rastlinne'], []),
  s('sladke-zemiaky', 'Sladké zemiaky (batáty)', 'prilohy', OZ, {ks: 200}, [86, 1.6, 0.1, 0, 20, 4, 3, 0.1], 'stredny', 1, -1, ['rastlinne'], []),
  s('topinambur', 'Topinambur', 'prilohy', OZ, {ks: 60}, [73, 2, 0, 0, 17, 10, 2, 0.01], 'nizky', 1, -1, ['vysoky-fodmap', 'rastlinne'], [], 'Inulín môže nadúvať – začať malým množstvom.'),

  // ---------- Strukoviny ----------
  s('sosovica-cervena', 'Šošovica červená sušená', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [350, 25, 1, 0.2, 60, 2, 11, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], [], 'Rýchlo sa rozvarí, vhodná pre deti.'),
  s('sosovica-zelena', 'Šošovica zelená/hnedá sušená', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [350, 25, 1.1, 0.2, 60, 2, 11, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('cicer-suseny', 'Cícer sušený', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [364, 19, 6, 0.6, 61, 11, 17, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('cicer-konzerva', 'Cícer konzervovaný (scedený)', 'strukoviny', 'strukoviny-konzervy', {lyzica: 12, hrncek: 160}, [120, 7, 2.5, 0.3, 18, 3, 6, 0.6], 'nizky', 3, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], [], 'Celé zrná pre najmenšie deti radšej roztlačiť.'),
  s('fazula-biela', 'Fazuľa biela sušená', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [330, 22, 1, 0.2, 60, 2, 15, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], [], 'Surová fazuľa je jedovitá – vždy namočiť a dobre uvariť.'),
  s('fazula-cervena', 'Fazuľa červená sušená', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [335, 23, 1, 0.2, 60, 2, 15, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], [], 'Surová fazuľa je jedovitá – vždy namočiť a dobre uvariť.'),
  s('fazula-cervena-konzerva', 'Fazuľa červená konzervovaná (scedená)', 'strukoviny', 'strukoviny-konzervy', {lyzica: 12, hrncek: 170}, [100, 7, 0.5, 0.1, 15, 1, 6, 0.6], 'nizky', 3, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('fazula-cierna', 'Fazuľa čierna sušená', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [340, 22, 1.4, 0.4, 60, 2, 15, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('hrach-suseny', 'Hrach lúpaný sušený', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [340, 25, 1.2, 0.2, 60, 8, 25, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('hrasok-mrazeny', 'Hrášok zelený mrazený', 'strukoviny', 'mrazene', {lyzica: 12, hrncek: 150}, [80, 5, 0.4, 0.1, 14, 5, 5, 0.02], 'nizky', 1, -1, ['strukovina', 'zelenina', 'vysoky-fodmap', 'rastlinne', 'riziko-dusenia'], [], 'Celé guľôčky môžu malé deti zadusiť – radšej roztlačiť.'),
  s('mungo-fazula', 'Fazuľa mungo sušená', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 200}, [347, 24, 1.2, 0.3, 63, 7, 16, 0.02], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], []),
  s('sojove-boby', 'Sójové bôby sušené', 'strukoviny', 'strukoviny-konzervy', {lyzica: 15, hrncek: 190}, [450, 36, 20, 3, 30, 7, 9, 0.03], 'nizky', 1, -1, ['strukovina', 'vysoky-fodmap', 'rastlinne'], ['soja']),
  s('tofu-natur', 'Tofu natural', 'strukoviny', 'ine', {ks: 200}, [80, 8, 5, 0.8, 2, 0.5, 1, 0.02], 'nizky', 3, -1, ['strukovina', 'rastlinne'], ['soja'], 'Mäkká textúra, vhodné pre deti (soja je alergén).'),
  s('tempeh', 'Tempeh', 'strukoviny', 'ine', {ks: 200}, [192, 20, 11, 2.2, 8, 0, 5, 0.02], 'nizky', 3, -1, ['strukovina', 'fermentovane', 'rastlinne'], ['soja']),
  s('edamame-mrazene', 'Edamame mrazené (bôby)', 'strukoviny', 'mrazene', {hrncek: 150}, [120, 12, 5, 0.6, 9, 2, 5, 0.01], 'nizky', 1, -1, ['strukovina', 'rastlinne'], ['soja'], 'Pre najmenšie deti zrná roztlačiť.'),

  // ---------- Zelenina ----------
  s('mrkva', 'Mrkva', 'zelenina', OZ, {ks: 80}, [41, 0.9, 0.2, 0, 10, 5, 2.8, 0.07], 'nizky', 1, -1, ['zelenina', 'rastlinne', 'riziko-dusenia'], [], 'Surová mrkva je tvrdá – deťom do 4 rokov strúhať alebo variť (riziko dusenia).'),
  s('cibula', 'Cibuľa', 'zelenina', OZ, {ks: 100}, [40, 1.1, 0.1, 0, 9, 4, 1.7, 0.01], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], []),
  s('cesnak', 'Cesnak', 'zelenina', OZ, {ks: 4, lyzicka: 3}, [150, 6.4, 0.5, 0.1, 33, 1, 2, 0.02], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], [], 'Jednotka ks = jeden strúčik.'),
  s('por', 'Pór', 'zelenina', OZ, {ks: 150}, [61, 1.5, 0.3, 0, 14, 4, 1.8, 0.04], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], []),
  s('paradajka', 'Paradajka', 'zelenina', OZ, {ks: 120}, [18, 0.9, 0.2, 0, 3.9, 2.6, 1.2, 0.01], 'nizky', 1, -1, ['zelenina', 'rastlinne'], [], 'Cherry paradajky malým deťom prekrojiť (riziko dusenia).'),
  s('uhorka', 'Uhorka šalátová', 'zelenina', OZ, {ks: 300}, [15, 0.7, 0.1, 0, 3.6, 1.7, 0.5, 0.01], 'nizky', 1, 0, ['zelenina', 'rastlinne'], []),
  s('paprika-cervena', 'Paprika červená', 'zelenina', OZ, {ks: 150}, [31, 1, 0.3, 0, 6, 4.2, 2.1, 0.01], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('cuketa', 'Cuketa', 'zelenina', OZ, {ks: 250}, [17, 1.2, 0.3, 0.1, 3.1, 2.5, 1, 0.02], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('baklazan', 'Baklažán', 'zelenina', OZ, {ks: 300}, [25, 1, 0.2, 0, 6, 3.5, 3, 0.01], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('brokolica', 'Brokolica', 'zelenina', OZ, {ks: 350}, [34, 2.8, 0.4, 0.1, 7, 1.7, 2.6, 0.08], 'nizky', 1, -2, ['zelenina', 'rastlinne'], []),
  s('karfiol', 'Karfiol', 'zelenina', OZ, {ks: 600}, [25, 1.9, 0.3, 0.1, 5, 2, 2, 0.08], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], []),
  s('kapusta-biela', 'Kapusta biela', 'zelenina', OZ, {ks: 1000}, [25, 1.3, 0.1, 0, 6, 3.2, 2.5, 0.05], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], []),
  s('kapusta-cervena', 'Kapusta červená', 'zelenina', OZ, {ks: 1000}, [31, 1.4, 0.2, 0, 7, 4, 2.1, 0.07], 'nizky', 1, -2, ['zelenina', 'rastlinne'], []),
  s('kel', 'Kel kučeravý', 'zelenina', OZ, {hrncek: 60}, [35, 2.9, 0.6, 0.1, 5, 2, 4, 0.1], 'nizky', 1, -2, ['zelenina', 'rastlinne'], []),
  s('ruzickovy-kel', 'Kel ružičkový', 'zelenina', OZ, {ks: 20}, [43, 3.4, 0.3, 0.1, 9, 2.2, 3.8, 0.06], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], []),
  s('spenat', 'Špenát', 'zelenina', OZ, {hrncek: 30}, [23, 2.9, 0.4, 0.1, 3.6, 0.4, 2.2, 0.2], 'nizky', 1, -2, ['zelenina', 'rastlinne'], [], 'Mrazený špenát je rovnako vhodný.'),
  s('salat-hlavkovy', 'Šalát hlávkový', 'zelenina', OZ, {ks: 300}, [14, 1.4, 0.2, 0, 2.2, 0.8, 1.3, 0.02], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('rukola', 'Rukola', 'zelenina', OZ, {hrncek: 20}, [25, 2.6, 0.7, 0.1, 3.7, 2, 1.6, 0.02], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('kalerab', 'Kaleráb', 'zelenina', OZ, {ks: 250}, [27, 1.7, 0.1, 0, 6.2, 2.6, 3.6, 0.05], 'nizky', 1, -1, ['zelenina', 'rastlinne'], [], 'Surový tvrdý – deťom strúhať.'),
  s('repa-cervena', 'Repa červená', 'zelenina', OZ, {ks: 150}, [43, 1.6, 0.2, 0, 10, 7, 2.8, 0.2], 'stredny', 1, -1, ['zelenina', 'rastlinne'], []),
  s('zeler-bulvovy', 'Zeler buľvový', 'zelenina', OZ, {ks: 400}, [42, 1.5, 0.3, 0.1, 9, 1.6, 1.8, 0.2], 'nizky', 1, -1, ['zelenina', 'rastlinne'], ['zeler'], 'Alergén – zeler.'),
  s('petrzlen-korenovy', 'Petržlen koreňový', 'zelenina', OZ, {ks: 80}, [55, 2, 0.5, 0.1, 12, 4, 4, 0.1], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('pastinak', 'Pastinák', 'zelenina', OZ, {ks: 120}, [75, 1.2, 0.3, 0.1, 18, 4.8, 4.9, 0.03], 'stredny', 1, -1, ['zelenina', 'rastlinne'], []),
  s('tekvica-hokkaido', 'Tekvica hokkaido', 'zelenina', OZ, {ks: 1000}, [40, 1, 0.1, 0, 9, 5, 2, 0.01], 'stredny', 1, -1, ['zelenina', 'rastlinne'], []),
  s('tekvica-maslova', 'Tekvica maslová', 'zelenina', OZ, {ks: 1000}, [45, 1, 0.1, 0, 12, 2, 2, 0.01], 'stredny', 1, -1, ['zelenina', 'rastlinne'], []),
  s('kukurica-sladka', 'Kukurica sladká (zrná)', 'zelenina', OZ, {lyzica: 15, hrncek: 160}, [96, 3.4, 1.5, 0.2, 21, 4.5, 2.4, 0.02], 'stredny', 1, 0, ['zelenina', 'riziko-dusenia', 'rastlinne'], [], 'Zrná sú pre malé deti riziko dusenia – podávať rozmixované alebo roztlačené.'),
  s('fazulove-struky', 'Fazuľové struky', 'zelenina', OZ, {hrncek: 110}, [31, 1.8, 0.2, 0, 7, 3.3, 3.4, 0.01], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('spargla', 'Špargľa', 'zelenina', OZ, {ks: 20}, [20, 2.2, 0.1, 0, 3.9, 1.9, 2.1, 0.01], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], []),
  s('redkovka', 'Reďkovka', 'zelenina', OZ, {ks: 15}, [16, 0.7, 0.1, 0, 3.4, 1.9, 1.6, 0.04], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('fenikel', 'Fenikel (buľva)', 'zelenina', OZ, {ks: 250}, [31, 1.2, 0.2, 0, 7, 4, 3.1, 0.2], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('kvasena-kapusta', 'Kapusta kvasená', 'zelenina', 'strukoviny-konzervy', {lyzica: 20, hrncek: 150}, [19, 0.9, 0.1, 0, 4.3, 1.8, 2.9, 1.6], 'nizky', 3, -1, ['zelenina', 'fermentovane', 'rastlinne'], [], 'Slaná – deťom v menších množstvách.'),
  s('kysle-uhorky', 'Uhorky kyslé nakladané', 'zelenina', 'strukoviny-konzervy', {ks: 60}, [15, 0.5, 0.2, 0, 2.3, 1.2, 1, 1.8], 'nizky', 3, 0, ['zelenina', 'rastlinne'], [], 'Vysoký obsah soli.'),
  s('sampinony', 'Šampiňóny', 'zelenina', OZ, {ks: 20}, [22, 3.1, 0.3, 0, 3.3, 2, 1, 0.01], 'nizky', 1, -1, ['zelenina', 'vysoky-fodmap', 'rastlinne'], []),
  s('hliva-ustricova', 'Hliva ustricová', 'zelenina', OZ, {ks: 30}, [33, 3.3, 0.4, 0.1, 6, 1, 2.3, 0.02], 'nizky', 1, -1, ['zelenina', 'rastlinne'], []),
  s('paradajky-konzervovane', 'Paradajky krájané konzervované', 'zelenina', 'strukoviny-konzervy', {ml: 1, hrncek: 250}, [20, 1, 0.2, 0, 4, 3, 1.2, 0.3], 'nizky', 3, -1, ['zelenina', 'rastlinne'], []),

  // ---------- Ovocie ----------
  s('jablko', 'Jablko', 'ovocie', OZ, {ks: 180}, [52, 0.3, 0.2, 0, 14, 10, 2.4, 0], 'nizky', 1, -1, ['ovocie', 'vysoky-fodmap', 'rastlinne'], [], 'Tvrdé kúsky deťom do 4 rokov strúhať alebo tenko krájať.'),
  s('hruska', 'Hruška', 'ovocie', OZ, {ks: 170}, [57, 0.4, 0.1, 0, 15, 10, 3.1, 0], 'nizky', 1, -1, ['ovocie', 'vysoky-fodmap', 'rastlinne'], []),
  s('banan', 'Banán', 'ovocie', OZ, {ks: 120}, [89, 1.1, 0.3, 0.1, 23, 12, 2.6, 0], 'stredny', 1, -1, ['ovocie', 'rastlinne'], []),
  s('pomaranc', 'Pomaranč', 'ovocie', OZ, {ks: 200}, [47, 0.9, 0.1, 0, 12, 9, 2.4, 0], 'nizky', 1, -1, ['ovocie', 'rastlinne'], []),
  s('mandarinka', 'Mandarínka', 'ovocie', OZ, {ks: 80}, [53, 0.8, 0.3, 0, 13, 11, 1.8, 0], 'nizky', 1, -1, ['ovocie', 'rastlinne'], [], 'Odstrániť biele vlákna a pecky.'),
  s('citron', 'Citrón', 'ovocie', OZ, {ks: 100, lyzica: 15}, [29, 1.1, 0.3, 0.1, 9, 2.5, 2.8, 0], 'nizky', 1, -1, ['ovocie', 'rastlinne'], []),
  s('jahody', 'Jahody', 'ovocie', OZ, {hrncek: 150, ks: 15}, [32, 0.7, 0.3, 0, 8, 4.9, 2, 0], 'nizky', 1, -2, ['ovocie', 'rastlinne'], []),
  s('maliny', 'Maliny', 'ovocie', OZ, {hrncek: 125}, [52, 1.2, 0.7, 0, 12, 4.4, 6.5, 0], 'nizky', 1, -2, ['ovocie', 'rastlinne'], []),
  s('cucoriedky', 'Čučoriedky', 'ovocie', OZ, {hrncek: 150}, [57, 0.7, 0.3, 0, 14, 10, 2.4, 0], 'nizky', 1, -2, ['ovocie', 'rastlinne'], [], 'Celé bobule malým deťom rozpučiť (riziko dusenia).'),
  s('ribezle-cierne', 'Ríbezle čierne', 'ovocie', OZ, {hrncek: 120}, [63, 1.4, 0.4, 0, 15, 8, 4.3, 0], 'nizky', 1, -2, ['ovocie', 'rastlinne'], []),
  s('slivky', 'Slivky', 'ovocie', OZ, {ks: 40}, [46, 0.7, 0.3, 0, 11, 10, 1.4, 0], 'nizky', 1, -1, ['ovocie', 'vysoky-fodmap', 'rastlinne'], [], 'Pozor na kôstku.'),
  s('marhule', 'Marhule', 'ovocie', OZ, {ks: 45}, [48, 1.4, 0.4, 0, 11, 9, 2, 0], 'nizky', 1, -1, ['ovocie', 'vysoky-fodmap', 'rastlinne'], [], 'Pozor na kôstku.'),
  s('broskyna', 'Broskyňa', 'ovocie', OZ, {ks: 150}, [39, 0.9, 0.3, 0, 10, 8, 1.5, 0], 'nizky', 1, -1, ['ovocie', 'vysoky-fodmap', 'rastlinne'], [], 'Pozor na kôstku.'),
  s('ceresne', 'Čerešne', 'ovocie', OZ, {ks: 8, hrncek: 140}, [63, 1.1, 0.2, 0, 16, 13, 2.1, 0], 'nizky', 1, -1, ['ovocie', 'vysoky-fodmap', 'riziko-dusenia', 'rastlinne'], [], 'Kôstky a celé plody – riziko dusenia; deťom vykôstkovať a prekrojiť.'),
  s('hrozno', 'Hrozno', 'ovocie', OZ, {ks: 5, hrncek: 150}, [69, 0.7, 0.2, 0.1, 18, 15, 0.9, 0], 'stredny', 1, -1, ['ovocie', 'riziko-dusenia', 'rastlinne'], [], 'Celé bobule sú riziko dusenia – deťom do 4 rokov pozdĺžne rozkrojiť.'),
  s('melon-vodovy', 'Melón vodový', 'ovocie', OZ, {hrncek: 150}, [30, 0.6, 0.2, 0, 8, 6, 0.4, 0], 'vysoky', 1, 0, ['ovocie', 'vysoky-fodmap', 'rastlinne'], [], 'Vyberať semienka.'),
  s('kiwi', 'Kiwi', 'ovocie', OZ, {ks: 75}, [61, 1.1, 0.5, 0, 15, 9, 3, 0], 'nizky', 1, -1, ['ovocie', 'rastlinne'], []),
  s('ananas', 'Ananás', 'ovocie', OZ, {hrncek: 165}, [50, 0.5, 0.1, 0, 13, 10, 1.4, 0], 'stredny', 1, -1, ['ovocie', 'rastlinne'], []),
  s('mango', 'Mango', 'ovocie', OZ, {ks: 200}, [60, 0.8, 0.4, 0.1, 15, 14, 1.6, 0], 'stredny', 1, -1, ['ovocie', 'rastlinne'], []),
  s('avokado', 'Avokádo', 'ovocie', OZ, {ks: 150}, [160, 2, 15, 2.1, 9, 0.7, 7, 0.01], 'nizky', 1, -1, ['ovocie', 'rastlinne'], [], 'Kôstka – nedávať deťom.'),
  s('hrozienka', 'Hrozienka sušené', 'ovocie', 'trvanlive', {lyzica: 12}, [300, 3, 0.5, 0.1, 79, 59, 3.7, 0.03], 'stredny', 2, 0, ['ovocie', 'vysoky-fodmap', 'riziko-dusenia', 'rastlinne'], [], 'Lepkavé, riziko dusenia – deťom do 4 rokov len nasekané alebo v jedle.'),
  s('datle-susene', 'Datle sušené', 'ovocie', 'trvanlive', {ks: 8}, [280, 2.5, 0.2, 0, 75, 63, 8, 0.01], 'stredny', 2, 0, ['ovocie', 'vysoky-fodmap', 'riziko-dusenia', 'rastlinne'], [], 'Lepkavé, kôstku vyberať; deťom nasekať alebo rozmixovať.'),
  s('slivky-susene', 'Slivky sušené', 'ovocie', 'trvanlive', {ks: 10}, [240, 2.2, 0.4, 0, 64, 38, 7, 0.01], 'nizky', 2, -1, ['ovocie', 'vysoky-fodmap', 'riziko-dusenia', 'rastlinne'], [], 'Lepkavé, riziko dusenia – deťom nasekať. Môžu preháňať.'),
  s('marhule-susene', 'Marhule sušené', 'ovocie', 'trvanlive', {ks: 8}, [240, 3.4, 0.5, 0, 63, 53, 7, 0.03], 'stredny', 2, 0, ['ovocie', 'vysoky-fodmap', 'riziko-dusenia', 'rastlinne'], ['siricitany'], 'Často sírené (siričitany) – hľadať nesírené; lepkavé, deťom nasekať.'),
  s('figy-susene', 'Figy sušené', 'ovocie', 'trvanlive', {ks: 15}, [250, 3.3, 0.9, 0.2, 64, 48, 10, 0.07], 'stredny', 2, 0, ['ovocie', 'vysoky-fodmap', 'riziko-dusenia', 'rastlinne'], [], 'Lepkavé, deťom nasekať.'),
];
