/** Integračný bod pre skener zloženia (modul src/skener/** stavia samostatný agent).
 *  Ak existuje `src/skener/index.tsx` s exportom `Skener` (Preact komponent), zobrazí sa; inak sa ukáže informácia. */
import { useEffect, useState } from 'preact/hooks';
import type { ComponentType } from 'preact';

const moduly = import.meta.glob('./skener/index.tsx');

export function SkenerTrasa() {
  const [K, setK] = useState<ComponentType | null>(null);
  const nacitaj = Object.values(moduly)[0];
  useEffect(() => { nacitaj?.().then((m) => setK(() => (m as { Skener: ComponentType }).Skener)); }, []);
  if (K) return <K />;
  return Object.keys(moduly).length ? <p>Načítavam skener…</p> : <><h1>Skener zloženia</h1><p>Skener sa ešte stavia. Pozri sa sem neskôr.</p></>;
}
