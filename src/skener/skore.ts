/** Skóre výrobku 0–100 – NAŠA HEURISTIKA (váhy a prahy sú odhad, zdroje podporujú len smer). */
import { pasmo, PASMO_TEXT } from '../engine/score';
import type { Nastavenia } from '../engine/types';
import type { Alergen } from '../data/types';
import { ALERGEN_NAZOV } from './alergeny';
import type { Rozbor, Stupen, Vyziva, Zlozka } from './typy';

export type Pasmo = 'vyborne' | 'dobre' | 'obcas' | 'zriedka';
export interface FaktorV {
  id: string; nazov: string; body: number; vaha: number; hodnota: string; preco: string; zdroje: string[];
}
export interface SkoreVyrobku {
  celkom: number; pasmo: Pasmo; pasmoText: string; faktory: FaktorV[];
  pozitiva: string[]; negativa: string[];
  /** osobné upozornenia podľa nastavení (alergie, obmedzenia) */
  osobne: { typ: 'alergen' | 'obmedzenie'; text: string }[];
  /** najproblematickejšie zložky (na zobrazenie hore) */
  najhorsie: Zlozka[];
}
export interface MoznostiSkore {
  nastavenia?: Pick<Nastavenia, 'obmedzenia' | 'alergie' | 'deti'>;
  vyziva?: Vyziva;
}

export const POZNAMKA_SKORE_V =
  'Skóre výrobku je naša heuristika (odhad), nie lekársky ani úradný nástroj. Váhy a prahy sú naše; zdroje pri faktoroch podporujú len smer (menej spracovania, menej cukru a soli). Hodnotenia sú overené len vyhľadávaním, originály sme nečítali.';

const clamp = (x: number, a = 0, b = 100) => Math.max(a, Math.min(b, x));
const lin = (v: number, lo: number, hi: number) => clamp(((v - lo) / (hi - lo)) * 100);

const PENALIZACIA: Record<Stupen, number> = { 'bez-vyhrad': 0, 'v-poriadku': 3, obmedzit: 14, 'vyhnut-sa': 30 };

export function stupenPreDomacnost(z: Zlozka, mameDeti: boolean): Stupen | undefined {
  if (!z.hodnotenie) return undefined;
  return mameDeti && z.hodnotenie.deti ? z.hodnotenie.deti : z.hodnotenie.stupen;
}
const PORADIE_STUPNOV: Stupen[] = ['bez-vyhrad', 'v-poriadku', 'obmedzit', 'vyhnut-sa'];
const horsi = (a: Stupen, b: Stupen) => PORADIE_STUPNOV.indexOf(a) >= PORADIE_STUPNOV.indexOf(b);

export function vypocitajSkoreVyrobku(r: Rozbor, o: MoznostiSkore = {}): SkoreVyrobku {
  const mameDeti = (o.nastavenia?.deti.length ?? 0) > 0;
  const z = r.zlozky;
  const top = z.filter((x) => x.hlbka === 0);
  const faktory: FaktorV[] = [];
  const pozitiva: string[] = [];
  const negativa: string[] = [];
  const mesto = (x: Zlozka) => x.poradie + 1;

  // 1. spracovanosť
  const markery = new Map<string, string>();
  for (const x of z) if (x.priznaky.includes('ultra') || x.priznaky.includes('udenina')) markery.set(x.id ?? x.nazov, x.nazov);
  const m = markery.size;
  const MARK = [100, 70, 55, 42, 30, 20];
  let bSprac = MARK[Math.min(m, 5)];
  const pocet = r.pocetZloziek;
  bSprac -= Math.min(15, Math.max(0, pocet - 8) * 1.5);
  bSprac = clamp(bSprac);
  faktory.push({
    id: 'spracovanost', nazov: 'Spracovanosť', body: Math.round(bSprac), vaha: 30,
    hodnota: m ? `${m} marker${m === 1 ? '' : m < 5 ? 'y' : 'ov'} ultraspracovania · ${pocet} zložiek` : `bez markerov · ${pocet} zložiek`,
    preco: m ? `Markery ultraspracovania a spracovania (NOVA; údeniny sa počítajú sem): ${[...markery.values()].join(', ')}. Čím viac takých látok, tým viac ide o priemyselnú formuláciu, nie o kuchynskú recepturu. Ide o klasifikáciu, nie o dôkaz škodlivosti každej látky.` : 'Nenašli sme žiadnu látku typickú pre ultraspracované potraviny.',
    zdroje: ['monteiro-2019', 'lane-2024'],
  });
  if (!m && pocet > 0 && pocet <= 5) pozitiva.push(`Krátke zloženie (${pocet} zložiek) bez markerov ultraspracovania.`);
  if (m >= 2) negativa.push(`${m} markery ultraspracovania (${[...markery.values()].slice(0, 3).join(', ')}).`);

  // 2. prídavné látky
  const adit = z.filter((x) => x.typ === 'aditivum');
  let pen = 0;
  const pozn: string[] = [];
  const zoradene = adit.map((x) => ({ x, s: stupenPreDomacnost(x, mameDeti) ?? 'v-poriadku' })).sort((a, b) => PENALIZACIA[b.s] - PENALIZACIA[a.s]);
  zoradene.forEach(({ x, s }, i) => { pen += PENALIZACIA[s] * (i === 0 ? 1 : 0.7); if (PENALIZACIA[s] >= 14) pozn.push(`${x.e ?? x.nazov} (${x.nazov}) – ${s === 'vyhnut-sa' ? 'vyhnúť sa' : 'obmedziť'}`); });
  faktory.push({
    id: 'aditiva', nazov: 'Prídavné látky', body: Math.round(clamp(100 - pen)), vaha: 20,
    hodnota: adit.length ? `${adit.length} prídavných látok${pozn.length ? ' · ' + pozn.length + '× obmedziť/vyhnúť sa' : ''}` : 'bez prídavných látok',
    preco: pozn.length ? `Horšie hodnotené: ${pozn.join('; ')}. Povolená látka nie je automaticky „jed“ – pri preventívnych obavách to pri látke uvádzame.` : adit.length ? 'Všetky nájdené látky sú povolené a nemáme voči nim výhrady pri bežnom príjme.' : 'Žiadne E-čísla ani iné prídavné látky.',
    zdroje: ['eu-1333-2008'],
  });
  if (!adit.length && pocet > 0) pozitiva.push('Bez prídavných látok (E-čísel).');
  for (const { x, s } of zoradene.slice(0, 2)) if (s === 'vyhnut-sa') negativa.push(`${x.e ?? ''} ${x.nazov}: ${x.hodnotenie?.preventivne ? 'preventívna obava' : 'vyhnúť sa'}.`);

  // 3. cukor (podľa zloženia)
  const cukry = z.filter((x) => x.priznaky.includes('cukor') && x.hlbka === 0 || (x.priznaky.includes('cukor') && x.rodic !== undefined));
  const druhy = new Set(cukry.map((x) => x.id));
  const prvyCukor = cukry.length ? Math.min(...cukry.map(mesto)) : 0;
  let bCukor = 100;
  if (cukry.length) {
    const podlaPozicie = [0, 8, 25, 40, 55, 68][Math.min(prvyCukor, 5)] ?? 70;
    bCukor = clamp(podlaPozicie + (prvyCukor > 5 ? 5 : 0) - Math.max(0, druhy.size - 1) * 8);
  }
  faktory.push({
    id: 'cukor', nazov: 'Pridaný cukor', body: Math.round(bCukor), vaha: 18,
    hodnota: cukry.length ? `${druhy.size} druh${druhy.size === 1 ? '' : druhy.size < 5 ? 'y' : 'ov'} · najvyššie na ${prvyCukor}. mieste` : 'bez pridaného cukru',
    preco: cukry.length ? 'Zložky sú v poradí podľa množstva – čím vyššie cukor stojí, tým ho je viac. Viac druhov cukru (cukor, glukóza, sirup) znamená, že sa v zozname posunul nižšie. WHO: voľné cukry pod 10 % energie, ideálne pod 5 %.' : 'V zložení sme nenašli cukor ani sirupy.',
    zdroje: ['who-2015-cukry'],
  });
  if (!cukry.length && pocet > 0) pozitiva.push('Bez pridaného cukru v zložení.');
  if (cukry.length && prvyCukor <= 2) negativa.push(`Cukor je na ${prvyCukor}. mieste zloženia (veľký podiel).`);

  // 4. tuky a soľ
  let bTuk = 100;
  const tukPoz: string[] = [];
  if (z.some((x) => x.priznaky.includes('stuzeny-tuk'))) { bTuk -= 55; tukPoz.push('stužený tuk'); negativa.push('Stužený (hydrogenovaný) tuk.'); }
  if (z.some((x) => x.priznaky.includes('palmovy-tuk'))) { bTuk -= 18; tukPoz.push('palmový tuk'); }
  const sol = top.find((x) => x.priznaky.includes('sol'));
  if (sol && mesto(sol) <= 3) { bTuk -= 20; tukPoz.push('soľ na vysokom mieste'); }
  faktory.push({
    id: 'tuky-sol', nazov: 'Tuky a soľ', body: Math.round(clamp(bTuk)), vaha: 8,
    hodnota: tukPoz.length ? tukPoz.join(', ') : 'bez výhrad',
    preco: tukPoz.length ? 'Stužené tuky môžu obsahovať trans-tuky (EÚ limit 2 g / 100 g tuku); palmový tuk je nasýtený a pri rafinácii vznikajú kontaminanty (EFSA). Soľ vysoko v zozname = veľa soli.' : 'Nenašli sme stužený ani palmový tuk a soľ nie je medzi prvými zložkami.',
    zdroje: ['eu-2019-649', 'efsa-2016-glycidyl'],
  });

  // 5. pozitíva
  let bPoz = 50;
  const prva = top[0];
  if (prva?.priznaky.includes('celozrnne')) { bPoz += 30; pozitiva.push('Celozrnná zložka na prvom mieste.'); }
  const hlavne = z.find((x) => x.percento !== undefined && x.percento >= 50 && x.hlbka === 0);
  if (hlavne) { bPoz += 15; pozitiva.push(`Vysoký podiel hlavnej suroviny (${hlavne.nazov} ${hlavne.percento} %).`); }
  if (z.some((x) => x.id === 'olivovy-olej')) { bPoz += 10; pozitiva.push('Olivový olej.'); }
  if (pocet > 0 && pocet <= 5 && !m) bPoz += 20;
  if (!cukry.length && pocet > 0) bPoz += 10;
  if (pocet > 14) bPoz -= 15;
  if (prva?.priznaky.includes('rafinovana-muka')) { bPoz -= 20; negativa.push('Biela (rafinovaná) múka na prvom mieste – menej vlákniny.'); }
  faktory.push({
    id: 'zlozenie', nazov: 'Kvalita zloženia', body: Math.round(clamp(bPoz)), vaha: 6,
    hodnota: pozitiva.length ? `${pozitiva.length} pozitív` : 'neutrálne',
    preco: 'Plusy: celozrnná zložka na prvom mieste, vysoký podiel hlavnej suroviny, krátke zloženie, olivový olej, bez cukru. Dlhý zoznam (nad 14 zložiek) ubúda.',
    zdroje: ['monteiro-2019'],
  });

  // 6. výživové hodnoty (ak sú)
  const v = o.vyziva;
  if (v && (v.cukry !== undefined || v.sol !== undefined || v.nasyt !== undefined)) {
    const casti: number[] = [];
    const popis: string[] = [];
    if (v.cukry !== undefined) { casti.push(100 - lin(v.cukry, 5, 30)); popis.push(`cukry ${v.cukry} g`); }
    if (v.sol !== undefined) { casti.push(100 - lin(v.sol, 0.3, 1.5)); popis.push(`soľ ${v.sol} g`); }
    if (v.nasyt !== undefined) { casti.push(100 - lin(v.nasyt, 1.5, 6)); popis.push(`nasýtené ${v.nasyt} g`); }
    if (v.vlak !== undefined) { casti.push(lin(v.vlak, 1, 6)); popis.push(`vláknina ${v.vlak} g`); }
    const b = casti.reduce((a, c) => a + c, 0) / casti.length;
    faktory.push({
      id: 'vyziva', nazov: 'Výživové hodnoty (na 100 g)', body: Math.round(b), vaha: 10, hodnota: popis.join(' · '),
      preco: 'Prahy (napr. cukry 5–30 g, soľ 0,3–1,5 g, nasýtené tuky 1,5–6 g na 100 g) sú naše odhady podobné farebným semaforom; nie sú to oficiálne limity ani výsledok jednej štúdie.',
      zdroje: ['who-2015-cukry'],
    });
    if ((v.cukry ?? 0) >= 22.5) negativa.push(`Veľa cukrov: ${v.cukry} g na 100 g.`);
    if ((v.sol ?? 0) >= 1.5) negativa.push(`Veľa soli: ${v.sol} g na 100 g.`);
    if ((v.vlak ?? 0) >= 6) pozitiva.push(`Vysoká vláknina: ${v.vlak} g na 100 g.`);
  }

  // 7. osobné upozornenia
  const osobne: SkoreVyrobku['osobne'] = [];
  const ob = o.nastavenia?.obmedzenia;
  let bOs = 100;
  const pridaj = (kat: 'muka' | 'cukor' | 'udeniny', ok: boolean, text: string) => {
    if (!ob || !ok || ob[kat] === 'bez') return;
    bOs -= ob[kat] === 'vylucit' ? 60 : 25;
    osobne.push({ typ: 'obmedzenie', text: `${text} – ${ob[kat] === 'vylucit' ? 'v nastaveniach máš vylúčené' : 'v nastaveniach máš obmedzené'}.` });
  };
  pridaj('muka', z.some((x) => x.priznaky.includes('rafinovana-muka')), 'Obsahuje rafinovanú (bielu) múku');
  pridaj('cukor', cukry.length > 0, 'Obsahuje pridaný cukor alebo sirup');
  pridaj('udeniny', z.some((x) => x.priznaky.includes('udenina')), 'Obsahuje údeninu / spracované mäso');
  const mojeAlergie = new Set<Alergen>(o.nastavenia?.alergie ?? []);
  for (const a of r.alergeny) if (mojeAlergie.has(a)) { bOs = 0; osobne.push({ typ: 'alergen', text: `ALERGÉN: obsahuje ${ALERGEN_NAZOV[a].toLowerCase()} – máš ho v zozname alergií.` }); }
  for (const a of r.stopy) if (mojeAlergie.has(a)) osobne.push({ typ: 'alergen', text: `Môže obsahovať stopy: ${ALERGEN_NAZOV[a].toLowerCase()} – máš to v zozname alergií.` });
  if (ob) faktory.push({
    id: 'osobne', nazov: 'Tvoje nastavenia', body: Math.round(clamp(bOs)), vaha: 8,
    hodnota: osobne.length ? `${osobne.length} upozornen${osobne.length === 1 ? 'ie' : osobne.length < 5 ? 'ia' : 'í'}` : 'bez konfliktu',
    preco: 'Porovnanie so zoznamom obmedzení a alergií z Nastavení (múka, cukor, údeniny, alergény).',
    zdroje: [],
  });

  const sumaVah = faktory.reduce((a, f) => a + f.vaha, 0);
  const priemer = faktory.reduce((a, f) => a + f.body * f.vaha, 0) / sumaVah;
  // veľmi zlý kľúčový faktor (spracovanosť, cukor, prídavné látky) výrazne stiahne celok
  const najhorsi = Math.min(...faktory.filter((f) => ['spracovanost', 'cukor', 'aditiva'].includes(f.id)).map((f) => f.body));
  const celkom = pocet === 0 ? 0 : Math.round(clamp(priemer - 0.3 * Math.max(0, 45 - najhorsi)));
  const p = pasmo(celkom);
  const najhorsie = z.filter((x) => { const s = stupenPreDomacnost(x, mameDeti); return s === 'obmedzit' || s === 'vyhnut-sa'; })
    .sort((a, b) => (horsi(stupenPreDomacnost(a, mameDeti)!, stupenPreDomacnost(b, mameDeti)!) ? -1 : 1)).slice(0, 5);
  return { celkom, pasmo: p, pasmoText: PASMO_TEXT[p], faktory, pozitiva, negativa, osobne, najhorsie };
}
