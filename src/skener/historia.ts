/** História skenov – len lokálne (localStorage), bez fotiek. */
import type { Vyziva, Doplnok } from './typy';

const KEY = 'recepty-skener-v1';
export interface Zaznam {
  id: string;
  cas: string;
  nazov: string;
  text: string;
  skore: number;
  pasmo: string;
  vyziva?: Vyziva;
  kod?: string;
  /** údaje z tagov databázy (E-čísla, alergény…) */
  doplnok?: Doplnok;
  /** jazyk textu zloženia z databázy */
  jazyk?: string;
  /** značka „kupujem“ – obľúbený výrobok, ktorý kupujeme */
  kupujem?: boolean;
}

/** Migrácia: staré záznamy (bez novších polí) sa načítajú bez straty; poškodené záznamy sa preskočia. */
export function upravZaznam(x: unknown): Zaznam | null {
  const z = x as Partial<Zaznam> | null;
  if (!z || typeof z !== 'object' || typeof z.text !== 'string') return null;
  return {
    ...z,
    id: typeof z.id === 'string' && z.id ? z.id : `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    cas: typeof z.cas === 'string' ? z.cas : new Date(0).toISOString(),
    nazov: typeof z.nazov === 'string' && z.nazov ? z.nazov : 'Výrobok',
    text: z.text,
    skore: typeof z.skore === 'number' ? z.skore : 0,
    pasmo: typeof z.pasmo === 'string' ? z.pasmo : 'obcas',
    kupujem: z.kupujem === true ? true : undefined,
  };
}
export function nacitajHistoriu(): Zaznam[] {
  try { const x = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(x) ? x.map(upravZaznam).filter((z): z is Zaznam => !!z) : []; } catch { return []; }
}
/** Limit 40 záznamov; výrobky so značkou „kupujem“ sa nikdy neodrezávajú. */
const LIMIT = 40;
function uloz(z: Zaznam[]) {
  const oblubene = z.filter((x) => x.kupujem);
  const ostatne = z.filter((x) => !x.kupujem).slice(0, Math.max(0, LIMIT - oblubene.length));
  const povolene = new Set([...oblubene, ...ostatne].map((x) => x.id));
  try { localStorage.setItem(KEY, JSON.stringify(z.filter((x) => povolene.has(x.id)))); } catch { /* bez ukladania */ }
}
export function pridajDoHistorie(z: Omit<Zaznam, 'id' | 'cas'>): Zaznam {
  const novy: Zaznam = { ...z, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, cas: new Date().toISOString() };
  uloz([novy, ...nacitajHistoriu()]);
  return novy;
}
export function zmazZaznam(id: string) { uloz(nacitajHistoriu().filter((z) => z.id !== id)); }
export function vymazHistoriu() { uloz([]); }
export function prepniKupujem(id: string) { uloz(nacitajHistoriu().map((z) => (z.id === id ? { ...z, kupujem: z.kupujem ? undefined : true } : z))); }
