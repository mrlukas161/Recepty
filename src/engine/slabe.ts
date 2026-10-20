import type { Surovina } from '../data/types';
import { KARTY_SUROVIN } from '../data/karty-surovin';

export interface Slabost { dovod: string; nahrady: string[]; kategoria: 'muka' | 'udeniny' | 'cukor' | 'ine' }

const MUKY = ['vajce-slepacie', 'zemiaky', 'ovsene-vlocky'];
const PO_SKUPINACH: Record<string, string[]> = {
  'muky-obilniny': MUKY, pecivo: ['vajce-slepacie', 'ovsene-vlocky', 'zemiaky'], cestoviny: ['cuketa', 'karfiol', 'ryza-natur'],
};

/** Je surovina „slabá“ (rafinovaná múka, údenina, pridaný cukor…)? Vráti krátky dôvod a zoznam náhrad (id surovín). */
export function slabaSurovina(s: Surovina): Slabost | null {
  const k = KARTY_SUROVIN[s.id];
  const p = s.priznaky;
  const kategoria: Slabost['kategoria'] = p.includes('rafinovana-muka') || (k && (k.verdikt === 'horsie' || k.verdikt === 'podobne')) ? 'muka' : p.includes('spracovane-maso') ? 'udeniny' : p.includes('pridany-cukor') ? 'cukor' : 'ine';
  if (k && (k.verdikt === 'horsie' || k.verdikt === 'podobne')) return { dovod: k.kratko, nahrady: k.nahrady, kategoria };
  if (p.includes('rafinovana-muka')) {
    const nahr = s.id.startsWith('strouhanka') || s.id === 'struhanka' ? ['ovsene-vlocky', 'lan-semienka'] : PO_SKUPINACH[s.skupina] ?? PO_SKUPINACH['muky-obilniny'];
    return { dovod: 'Rafinovaná múka: bez otrúb, málo vlákniny.', nahrady: nahr, kategoria };
  }
  if (p.includes('spracovane-maso')) return { dovod: 'Údenina: spracované mäso, zvyčajne veľa soli.', nahrady: ['kuracie-prsia', 'vajce-slepacie', 'tofu-natur'], kategoria };
  if (p.includes('pridany-cukor')) return { dovod: 'Obsahuje pridaný cukor.', nahrady: ['banan', 'jablko', 'skorica'], kategoria };
  return null;
}

/** Automatické „prečo“ podľa príznakov v databáze (úroveň: tabuľka / naše zaradenie). */
export function dovodyAuto(s: Surovina): string[] {
  const p = s.priznaky, o: string[] = [];
  if (p.includes('rafinovana-muka')) o.push('Rafinovaná múka alebo výrobok z nej: bez otrúb a klíčkov, málo vlákniny.');
  if (p.includes('celozrnne')) o.push('Celozrnné: obsahuje celé zrno, viac vlákniny.');
  if (p.includes('lepok') || s.alergeny.includes('lepok')) o.push('Obsahuje lepok (alebo ho môže obsahovať ako stopu) – pri celiakii nie.');
  if (p.includes('spracovane-maso')) o.push('Spracované mäso (údenina): bežne veľa soli.');
  if (p.includes('pridany-cukor')) o.push('Obsahuje pridaný cukor.');
  if (p.includes('vysoky-fodmap')) o.push('Vyšší obsah FODMAP: pri citlivom čreve môže nadúvať.');
  if (p.includes('strukovina')) o.push('Strukovina: bielkoviny aj vláknina.');
  if (p.includes('zelenina') || p.includes('ovocie')) o.push('Zelenina alebo ovocie: dobrý základ jedla.');
  if (s.nova === 4) o.push('Ultraspracovaná potravina (NOVA 4, naše zaradenie).');
  if (p.includes('riziko-dusenia')) o.push('Malým deťom (do 4 rokov) hrozí udusenie – upraviť (rozdrviť, nastrúhať).');
  if (s.gi) o.push(`Glykemický index: ${s.gi === 'nizky' ? 'nízky' : s.gi === 'stredny' ? 'stredný' : 'vysoký'} (naše zaradenie, odhad).`);
  return o;
}
