import { useState } from 'preact/hooks';
import { rozbor } from './rozbor';
import { vypocitajSkoreVyrobku } from './skore';
import { Pecat } from '../ui/kom';
import type { Zaznam } from './historia';
import type { Nastavenia } from '../engine/types';

export function Porovnanie({ hist, nastavenia }: { hist: Zaznam[]; nastavenia: Nastavenia }) {
  const [a, setA] = useState(hist[0]?.id ?? '');
  const [b, setB] = useState(hist[1]?.id ?? '');
  if (hist.length < 2) return <p>Na porovnanie ulož aspoň dva výrobky do histórie.</p>;
  const vyp = (id: string) => {
    const z = hist.find((h) => h.id === id);
    if (!z) return null;
    const r = rozbor(z.text);
    return { z, r, s: vypocitajSkoreVyrobku(r, { nastavenia, vyziva: z.vyziva }) };
  };
  const A = vyp(a), B = vyp(b);
  const lepsi = A && B ? (A.s.celkom === B.s.celkom ? null : A.s.celkom > B.s.celkom ? A : B) : null;
  const vyber = (hodn: string, zmen: (v: string) => void, id: string) => (
    <select aria-label={id} value={hodn} onChange={(e) => zmen((e.target as HTMLSelectElement).value)} style="width:100%">
      {hist.map((h) => <option key={h.id} value={h.id}>{h.nazov}</option>)}
    </select>
  );
  const stlpec = (x: NonNullable<typeof A>) => (
    <div class="karta" style="animation:none">
      <Pecat skore={x.s.celkom} pasmo={x.s.pasmo} />
      <h3 style="margin-top:14px">{x.z.nazov}</h3>
      {x.s.faktory.map((f) => <div class="maly" key={f.id}>{f.nazov}: <b>{f.body}</b></div>)}
      {x.s.negativa.slice(0, 2).map((n) => <div class="maly minus" key={n}>✗ {n}</div>)}
      {x.s.pozitiva.slice(0, 2).map((n) => <div class="maly plus" key={n}>✓ {n}</div>)}
    </div>
  );
  return (
    <>
      <div class="sk-sloupec">{vyber(a, setA, 'Výrobok A')}{vyber(b, setB, 'Výrobok B')}</div>
      {A && B && (
        <>
          <p class="sk-stav">{lepsi ? `Lepšie vychádza: ${lepsi.z.nazov} (${lepsi.s.celkom} vs. ${(lepsi === A ? B : A).s.celkom})` : 'Skóre je rovnaké.'}</p>
          <div class="sk-sloupec">{stlpec(A)}{stlpec(B)}</div>
        </>
      )}
    </>
  );
}
