/** Skóre kozmetiky 0–100 – NAŠA HEURISTIKA. Hodnotí PRÍTOMNOSŤ látky podľa INCI, nie dávku (koncentrácie na obale nie sú).
 *  Váhy a prahy sú odhad; zdroje podporujú len zaradenie látky (predpis, stanovisko SCCS), nie výšku odpočtu. */
import { pasmo, PASMO_TEXT } from '../engine/score';
import type { Latka, Nastavenia, Os, Parsovane, Polozka } from './typy';
import { hranica1Percento } from './parser';

export type Pasmo = ReturnType<typeof pasmo>;
export type KategoriaId = 'zakazane' | 'obmedzene' | 'alergeny' | 'draziva' | 'konzervanty' | 'uv' | 'mikroc';
export const KATEGORIE: { id: KategoriaId; nazov: string; popis: string; cap: number }[] = [
  { id: 'zakazane', nazov: 'Zakázané látky', popis: 'Látky z Prílohy II, ktoré sa v kozmetike v EÚ nesmú vyskytovať.', cap: 80 },
  { id: 'obmedzene', nazov: 'Obmedzené a diskutované látky', popis: 'Povolené len s podmienkami alebo látky, o ktorých prebieha odborná diskusia (vrátane siloxanov D4/D5/D6).', cap: 24 },
  { id: 'alergeny', nazov: 'Alergény vôní', popis: 'Parfum a vonné látky, ktoré musí obal uvádzať samostatne.', cap: 18 },
  { id: 'draziva', nazov: 'Dráždivé a citlivé zložky', popis: 'Zložky, ktoré môžu dráždiť citlivú pokožku (časť je naša prax, nie dôkaz – pri každej je to napísané).', cap: 12 },
  { id: 'konzervanty', nazov: 'Konzervanty', popis: 'Konzervanty sú potrebné; odpočet je malý a rastie pri tých s diskusiou (uvoľňovače formaldehydu, MIT, parabény s nízkym limitom).', cap: 16 },
  { id: 'uv', nazov: 'UV filtre', popis: 'Povolené len filtre z Prílohy VI; odpočet majú len filtre s odbornou diskusiou.', cap: 12 },
  { id: 'mikroc', nazov: 'Mikročastice', popis: 'Syntetické polyméry, ktoré môžu byť mikroplasty (nar. 2023/2055).', cap: 10 },
];
const KAT_TRIEDY: Record<string, KategoriaId> = { zakazana: 'zakazane', obmedzena: 'obmedzene', siloxan: 'obmedzene', alergen: 'alergeny', vona: 'alergeny', draziva: 'draziva', konzervant: 'konzervanty', uv: 'uv', mikroc: 'mikroc' };
const ODPOCET: Record<Latka['s'], number> = { zakazana: 40, diskusia: 6, obmedzena: 1, pozor: 3, ok: 0 };
const OSOBNE_ODPOCET: Record<Os, number> = { citliva: 4, vona: 6, tehotenstvo: 20, deti: 8 };
const OSOBNE_CAP = 40;
const PRAH_ROZPOZNANIA = 0.4;
const STROP_NIZKA_SPOLAHLIVOST = 79;

export const POZNAMKA_SKORE_K =
  'Skóre je naša heuristika (odhad), nie úradné ani lekárske hodnotenie. Hodnotíme len PRÍTOMNOSŤ látky v zozname INCI: koncentrácie na obale nie sú, takže nevieme, či je látky veľa alebo málo. Zaradenie látok vychádza z predpisov EÚ a stanovísk SCCS (pri každej látke je zdroj a úroveň); váhy odpočtov sú naše.';

export interface PolozkaSkore { nazov: string; id?: string; body: number; poradie: number }
export interface FaktorK { id: KategoriaId | 'osobne'; nazov: string; popis: string; body: number; polozky: PolozkaSkore[]; orezane: boolean }
export interface SkoreKoz {
  celkom: number; pasmo: Pasmo; pasmoText: string;
  faktory: FaktorK[];
  rozpoznane: number; spolu: number; nizkaSpolahlivost: boolean; spolahlivostText?: string;
  /** upozornenia, ktoré nezmenia skóre, ale patria k zloženiu (nano, mikročastice, nízky počet zložiek…) */
  poznamky: string[];
  hranica1: number;
}

const jeCI = (p: Polozka) => !!p.ci;

export function vypocitajSkoreKozmetiky(r: Parsovane, nast: Nastavenia): SkoreKoz {
  const faktory: FaktorK[] = [];
  const videne = new Set<string>();
  const hodnotene = r.polozky.filter((p) => p.latka && !videne.has(p.latka.id) && (videne.add(p.latka.id), true));
  for (const k of KATEGORIE) {
    const polozky: PolozkaSkore[] = [];
    for (const p of hodnotene) {
      const l = p.latka!;
      if (KAT_TRIEDY[l.t] !== k.id) continue;
      const b = ODPOCET[l.s];
      if (b > 0 || l.s === 'obmedzena') polozky.push({ nazov: l.m[0], id: l.id, body: b, poradie: p.poradie });
    }
    const suma = polozky.reduce((a, x) => a + x.body, 0);
    faktory.push({ id: k.id, nazov: k.nazov, popis: k.popis, body: Math.min(suma, k.cap), polozky, orezane: suma > k.cap });
  }

  // osobné nastavenia
  const os: PolozkaSkore[] = [];
  for (const p of hodnotene) {
    const l = p.latka!;
    for (const f of l.o ?? []) {
      if (!nast[f]) continue;
      const b = f === 'vona' && l.id === 'parfum' ? 20 : f === 'tehotenstvo' ? 20 : OSOBNE_ODPOCET[f];
      os.push({ nazov: `${l.m[0]} (${{ citliva: 'citlivá pokožka', vona: 'alergia na vône', tehotenstvo: 'tehotenstvo', deti: 'deti' }[f]})`, id: l.id, body: b, poradie: p.poradie });
    }
  }
  const sumaOs = os.reduce((a, x) => a + x.body, 0);
  if (os.length) faktory.push({ id: 'osobne', nazov: 'Tvoje nastavenia', popis: 'Dodatočný odpočet podľa citlivej pokožky, alergie na vône, tehotenstva alebo detí.', body: Math.min(sumaOs, OSOBNE_CAP), polozky: os, orezane: sumaOs > OSOBNE_CAP });

  let celkom = Math.max(0, Math.round(100 - faktory.reduce((a, f) => a + f.body, 0)));

  const spolu = r.polozky.length;
  const rozpoznane = r.polozky.filter((p) => p.latka || jeCI(p)).length;
  const nizka = spolu === 0 || rozpoznane / spolu < PRAH_ROZPOZNANIA || (spolu < 3);
  let spolahlivostText: string | undefined;
  if (nizka) {
    celkom = Math.min(celkom, STROP_NIZKA_SPOLAHLIVOST);
    spolahlivostText = spolu < 3 ? 'Zoznam je veľmi krátky' : `Rozpoznali sme len ${rozpoznane} z ${spolu} zložiek`;
  }

  const poznamky: string[] = [];
  const nano = r.polozky.filter((p) => p.nano);
  if (nano.length) poznamky.push(`Nanoformy: ${nano.map((p) => p.latka?.m[0] ?? p.nazov).join(', ')}. Pre nanomateriály platia v EÚ osobitné podmienky a povinné označenie „(nano)“.`);
  const mikro = hodnotene.filter((p) => p.latka!.t === 'mikroc');
  if (mikro.length) poznamky.push('Niektoré polyméry v zložení môžu byť mikroplasty – z INCI sa to nedá zistiť.');
  if (r.moze.length) poznamky.push(`Za „may contain“ / „+/-“ je ${r.moze.length} zložiek (farbivá, ktoré výrobca používa v rôznych odtieňoch); do skóre ich nepočítame.`);

  return { celkom, pasmo: pasmo(celkom), pasmoText: PASMO_TEXT[pasmo(celkom)], faktory, rozpoznane, spolu, nizkaSpolahlivost: nizka, spolahlivostText, poznamky, hranica1: hranica1Percento(r) };
}
