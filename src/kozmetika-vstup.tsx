/** Integračný bod pre skener kozmetiky: modul src/kozmetika/** sa načíta až pri otvorení trasy #/kozmetika. */
import { useEffect, useState } from 'preact/hooks';
import type { ComponentType } from 'preact';

export function KozmetikaTrasa() {
  const [K, setK] = useState<ComponentType | null>(null);
  useEffect(() => { import('./kozmetika/index').then((m) => setK(() => m.Kozmetika)); }, []);
  return K ? <K /> : <p>Načítavam skener kozmetiky…</p>;
}
