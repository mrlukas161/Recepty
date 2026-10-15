import { useEffect, useState } from 'preact/hooks';
import { PREDVOLENE, type UlozenyStav, type Nastavenia } from './engine/types';

const KEY = 'recepty-v1';
const prazdny = (): UlozenyStav => ({
  nastavenia: structuredClone(PREDVOLENE), oblubene: [], hodnotenie: {}, historia: [], jedalnicek: {}, zamknute: [],
  nakupOdskrtnute: [], nakupVlastne: [], nakupRecepty: [], dnes: {},
});

function nacitaj(): UlozenyStav {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return zluc(JSON.parse(raw));
  } catch { /* poškodené alebo nedostupné */ }
  return prazdny();
}
export function zluc(x: Partial<UlozenyStav>): UlozenyStav {
  const p = prazdny();
  return { ...p, ...x, nastavenia: { ...p.nastavenia, ...(x.nastavenia ?? {}), obmedzenia: { ...p.nastavenia.obmedzenia, ...(x.nastavenia?.obmedzenia ?? {}) }, maxTyzdenne: { ...p.nastavenia.maxTyzdenne, ...(x.nastavenia?.maxTyzdenne ?? {}) } } };
}

let stav: UlozenyStav = nacitaj();
const poslucha = new Set<() => void>();
export const dajStav = () => stav;
export function nastav(f: (s: UlozenyStav) => UlozenyStav | void) {
  const novy = f(structuredClone(stav)) ?? stav;
  stav = novy;
  try { localStorage.setItem(KEY, JSON.stringify(stav)); } catch { /* bez ukladania */ }
  poslucha.forEach((p) => p());
}
export function nastavNastavenia(p: Partial<Nastavenia>) { nastav((s) => { s.nastavenia = { ...s.nastavenia, ...p }; }); }
export function resetuj() { stav = prazdny(); try { localStorage.removeItem(KEY); } catch { /* */ } poslucha.forEach((p) => p()); }
export function importuj(json: string) { const x = zluc(JSON.parse(json)); nastav(() => x); }
export function exportuj(): string { return JSON.stringify(stav, null, 2); }
export function useStav(): UlozenyStav {
  const [, r] = useState(0);
  useEffect(() => { const f = () => r((x) => x + 1); poslucha.add(f); return () => { poslucha.delete(f); }; }, []);
  return stav;
}
export const dnesKluc = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
