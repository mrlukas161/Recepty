import type { Surovina, SurovinaVRecepte, Recept } from '../data/types';
import { naGramy } from './units';

export interface Faktor {
  id: string; nazov: string; body: number; vaha: number; hodnota: string; preco: string;
}
export interface Skore {
  celkom: number; pasmo: 'vyborne' | 'dobre' | 'obcas' | 'zriedka'; pasmoText: string;
  faktory: Faktor[]; prinosy: string[]; slabiny: string[];
  na100porcia: { kcal: number; bielk: number; tuky: number; nasyt: number; sach: number; cukry: number; pridanyCukor: number; vlak: number; sol: number; gramy: number };
}

const clamp = (x: number, a = 0, b = 100) => Math.max(a, Math.min(b, x));
/** lineárne mapovanie: v<=lo → 0, v>=hi → 100 */
const lin = (v: number, lo: number, hi: number) => clamp(((v - lo) / (hi - lo)) * 100);

export const POZNAMKA_SKORE =
  'Skóre je naša heuristika (odhad), nie klinický nástroj. Váhy a prahy sú naše odhady a neboli odvodené z konkrétnej štúdie; zdroje pri faktoroch len podporujú smer (viac vlákniny, menej cukru…), nie presné čísla.';

export function pasmo(s: number): Skore['pasmo'] {
  return s >= 80 ? 'vyborne' : s >= 60 ? 'dobre' : s >= 40 ? 'obcas' : 'zriedka';
}
export const PASMO_TEXT: Record<Skore['pasmo'], string> = {
  vyborne: 'Výborné', dobre: 'Dobré', obcas: 'Občas', zriedka: 'Zriedka',
};

/** Vypočíta skóre jedla na 1 dospelú porciu. `suroviny` už po úpravách. */
export function vypocitajSkore(
  recept: Pick<Recept, 'porcie' | 'vyprazane' | 'klasika'>,
  suroviny: SurovinaVRecepte[],
  db: Map<string, Surovina>,
): Skore {
  const por = Math.max(0.25, recept.porcie);
  let g = 0, kcal = 0, bielk = 0, tuky = 0, nasyt = 0, sach = 0, cukry = 0, vlak = 0, sol = 0, pridany = 0;
  let zapalSum = 0, zapalG = 0, rastG = 0, novaKcal4 = 0, rafG = 0, celoG = 0, mainG = 0;
  for (const r of suroviny) {
    const s = db.get(r.id);
    if (!s) continue;
    const gr = naGramy(s, r.mnozstvo, r.jednotka) / por;
    const k = gr / 100;
    g += gr;
    kcal += s.na100.kcal * k; bielk += s.na100.bielk * k; tuky += s.na100.tuky * k; nasyt += s.na100.nasyt * k;
    sach += s.na100.sach * k; cukry += s.na100.cukry * k; vlak += s.na100.vlak * k; sol += s.na100.sol * k;
    if (s.priznaky.includes('pridany-cukor')) pridany += s.na100.cukry * k;
    if (s.nova === 4) novaKcal4 += s.na100.kcal * k;
    if (s.skupina !== 'korenie-bylinky' && s.skupina !== 'napoje' && gr >= 8) {
      zapalSum += s.zapal * gr; zapalG += gr; mainG += gr;
    }
    if (s.priznaky.some((p) => p === 'zelenina' || p === 'ovocie' || p === 'strukovina')) rastG += gr;
    if (s.priznaky.includes('rafinovana-muka')) rafG += gr;
    if (s.priznaky.includes('celozrnne')) celoG += gr;
  }
  const tot = { kcal, bielk, tuky, nasyt, sach, cukry, pridanyCukor: pridany, vlak, sol, gramy: g };
  const zapalAvg = zapalG > 0 ? zapalSum / zapalG : 0;
  const rastPodiel = mainG > 0 ? rastG / mainG : 0;
  const novaPodiel = kcal > 0 ? novaKcal4 / kcal : 0;
  const f = (id: string, nazov: string, body: number, vaha: number, hodnota: string, preco: string): Faktor => ({ id, nazov, body: Math.round(clamp(body)), vaha, hodnota, preco });

  // glykemická záťaž (hrubý odhad): rafinované sacharidy + pridaný cukor, menej celozrnné/vláknina
  const rafSach = rafG * 0.7 + pridany;
  const glBody = clamp(100 - lin(rafSach + Math.max(0, sach - vlak * 2) * 0.25, 10, 70) + (celoG > 0 ? 5 : 0));
  const tazkostIdx = tuky + (recept.vyprazane ? 15 : 0) + Math.max(0, kcal - 700) / 20;

  const faktory: Faktor[] = [
    f('zapal', 'Zápalový potenciál', 50 - zapalAvg * 25, 14, zapalAvg.toFixed(1),
      zapalAvg < -0.3 ? 'Prevažujú suroviny, ktoré sa bežne radia k protizápalovým (zelenina, strukoviny, ryby, olivový olej…). Odhad podľa nášho zaradenia surovín.' : zapalAvg > 0.3 ? 'Prevažujú suroviny, ktoré sa bežne radia k prozápalovým (rafinované obilniny, spracované mäso, cukor…). Odhad.' : 'Vyvážené zloženie. Odhad podľa nášho zaradenia surovín.'),
    f('gl', 'Cukor v krvi (glykemická záťaž)', glBody, 14, `${Math.round(rafSach)} g rafinovaných sacharidov`,
      'Čím viac bielej múky a pridaného cukru a čím menej vlákniny, tým rýchlejšie sa očakáva stúpnutie cukru v krvi. Hrubý odhad, nie meranie.'),
    f('vlaknina', 'Vláknina', lin(vlak, 2, 10), 14, `${vlak.toFixed(1)} g / porcia`,
      'Vláknina zvyšuje sýtosť a prospieva tráveniu. Cieľ pre dospelého býva okolo 25–30 g denne (odhad: ~8–10 g na jedlo).'),
    f('bielkoviny', 'Bielkoviny a sýtosť', lin(bielk, 6, 28), 10, `${bielk.toFixed(0)} g / porcia`,
      'Bielkoviny a vláknina spolu zvyčajne zasýtia na dlhšie. Odhad.'),
    f('rastliny', 'Zelenina, ovocie, strukoviny', lin(rastPodiel, 0.1, 0.55), 12, `${Math.round(rastPodiel * 100)} % hmotnosti`,
      'Podiel zeleniny, ovocia a strukovín v jedle. Čím viac, tým lepšie skóre.'),
    f('nova', 'Spracovanosť', 100 - lin(novaPodiel, 0.1, 0.7), 8, `${Math.round(novaPodiel * 100)} % energie z ultraspracovaných`,
      'Podiel energie zo surovín, ktoré radíme medzi ultraspracované (skupina NOVA 4).'),
    f('tuky', 'Tuky a vyprážanie', 100 - lin(nasyt + (recept.vyprazane ? 8 : 0), 4, 16), 9, `${nasyt.toFixed(1)} g nasýtených` + (recept.vyprazane ? ', vyprážané' : ''),
      'Veľa nasýtených tukov a vyprážanie vo veľkom množstve oleja sa pokladajú za menej priaznivé.'),
    f('sol', 'Soľ', 100 - lin(sol, 1.5, 4), 5, `${sol.toFixed(1)} g / porcia`,
      'Odporúča sa celkovo menej ako 5 g soli denne; pri deťoch menej.'),
    f('cukor', 'Pridaný cukor', 100 - lin(pridany, 4, 25), 6, `${pridany.toFixed(0)} g / porcia`,
      'Pridané cukry (cukor, med, sirupy, džem) je dobré držať nízko.'),
    f('tazkost', 'Ťažkosť po jedle', 100 - lin(tazkostIdx, 15, 50), 8, `${Math.round(kcal)} kcal, ${tuky.toFixed(0)} g tuku`,
      'Tučné a veľké jedlá sa trávia dlhšie a môžu ťažiť. Odhad.'),
  ];
  const vahySum = faktory.reduce((a, x) => a + x.vaha, 0);
  let celkom = Math.round(faktory.reduce((a, x) => a + x.body * x.vaha, 0) / vahySum);
  // roztiahnutie škály, aby sa bežné jedlá nezhlukli v pásme 70–90 (monotónne, len kalibrácia)
  celkom = Math.round(clamp(58 + (celkom - 66) * 1.3));
  const pm = pasmo(celkom);

  const prinosy: string[] = [];
  const slabiny: string[] = [];
  const get = (id: string) => faktory.find((x) => x.id === id)!;
  if (get('vlaknina').body >= 65) prinosy.push(`Dosť vlákniny (${vlak.toFixed(1)} g)`);
  if (get('rastliny').body >= 65) prinosy.push('Veľa zeleniny, ovocia alebo strukovín');
  if (get('bielkoviny').body >= 65) prinosy.push(`Dobrý zdroj bielkovín (${bielk.toFixed(0)} g)`);
  if (get('zapal').body >= 65) prinosy.push('Skôr protizápalové zloženie (odhad)');
  if (get('nova').body >= 85 && prinosy.length < 4) prinosy.push('Takmer žiadne ultraspracované suroviny');
  if (get('gl').body >= 70 && prinosy.length < 4) prinosy.push('Málo rafinovaných sacharidov');
  if (get('gl').body < 45) slabiny.push('Veľa rafinovanej múky alebo cukru → rýchlejší vzostup cukru v krvi');
  if (get('vlaknina').body < 35) slabiny.push(`Málo vlákniny (${vlak.toFixed(1)} g)`);
  if (get('tuky').body < 45) slabiny.push(recept.vyprazane ? 'Vyprážané – veľa tuku' : 'Veľa nasýtených tukov');
  if (get('sol').body < 45) slabiny.push(`Viac soli (${sol.toFixed(1)} g)`);
  if (get('cukor').body < 45) slabiny.push(`Pridaný cukor (${pridany.toFixed(0)} g)`);
  if (get('nova').body < 45) slabiny.push('Dosť ultraspracovaných surovín (údeniny, polotovary…)');
  if (get('tazkost').body < 40) slabiny.push('Môže byť ťažšie na žalúdok');
  if (get('rastliny').body < 30) slabiny.push('Málo zeleniny');
  return {
    celkom, pasmo: pm, pasmoText: PASMO_TEXT[pm], faktory,
    prinosy: prinosy.slice(0, 4), slabiny: slabiny.slice(0, 4), na100porcia: tot,
  };
}
