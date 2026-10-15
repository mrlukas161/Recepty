import { useEffect, useState } from 'preact/hooks';
import { PREDVOLENE, VERZIA_STAVU, type UlozenyStav, type Nastavenia } from './engine/types';

const KEY = 'recepty-v1';
const prazdny = (): UlozenyStav => ({
  verzia: VERZIA_STAVU,
  nastavenia: structuredClone(PREDVOLENE), oblubene: [], hodnotenie: {}, historia: [], jedalnicek: {}, zamknute: [],
  nakupOdskrtnute: [], nakupVlastne: [], nakupRecepty: [], dnes: {}, pridaneVolitelne: {},
});

function nacitaj(): UlozenyStav {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return zluc(JSON.parse(raw));
  } catch { /* poškodené alebo nedostupné */ }
  return prazdny();
}
/** Zlúči uložený (prípadne starší) stav s predvoleným; migruje staré tvary (v1 → v2: maxCas → casTyzden). */
export function zluc(x: Partial<UlozenyStav>): UlozenyStav {
  const p = prazdny();
  const ns = { ...(x.nastavenia ?? {}) } as Partial<Nastavenia> & { maxCas?: number };
  if (ns.casTyzden === undefined && typeof ns.maxCas === 'number' && ns.maxCas > 0) ns.casTyzden = ns.maxCas;
  delete ns.maxCas;
  return {
    ...p, ...x, verzia: VERZIA_STAVU,
    nastavenia: { ...p.nastavenia, ...ns, obmedzenia: { ...p.nastavenia.obmedzenia, ...(ns.obmedzenia ?? {}) }, maxTyzdenne: { ...p.nastavenia.maxTyzdenne, ...(ns.maxTyzdenne ?? {}) } },
    pridaneVolitelne: { ...(x.pridaneVolitelne ?? {}) },
  };
}

let stav: UlozenyStav = nacitaj();
const poslucha = new Set<() => void>();
export const dajStav = () => stav;
export function nastav(f: (s: UlozenyStav) => UlozenyStav | void) {
  const kopia = structuredClone(stav);
  stav = f(kopia) ?? kopia;
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
