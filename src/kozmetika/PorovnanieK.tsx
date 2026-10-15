import { useState } from 'preact/hooks';
import { Pecat } from '../ui/kom';
import { parsujInci } from './parser';
import { vypocitajSkoreKozmetiky } from './skore';
import type { Nastavenia } from './typy';
import type { ZaznamK } from './ulozisko';

export function PorovnanieK({ hist, nast }: { hist: ZaznamK[]; nast: Nastavenia }) {
  const [a, setA] = useState(hist[0]?.id ?? '');
  const [b, setB] = useState(hist[1]?.id ?? '');
  if (hist.length < 2) return <p>Na porovnanie ulož aspoň dva výrobky do histórie.</p>;
  const vyp = (id: string) => { const z = hist.find((h) => h.id === id); return z ? { z, s: vypocitajSkoreKozmetiky(parsujInci(z.text), nast) } : null; };
  const A = vyp(a), B = vyp(b);
  const lepsi = A && B && A.s.celkom !== B.s.celkom ? (A.s.celkom > B.s.celkom ? A : B) : null;
  const vyber = (h: string, zmen: (v: string) => void, nazov: string) => (
    <select aria-label={nazov} value={h} onChange={(e) => zmen((e.target as HTMLSelectElement).value)} style="width:100%">
      {hist.map((x) => <option key={x.id} value={x.id}>{x.nazov}</option>)}
    </select>
  );
  const stlpec = (x: NonNullable<typeof A>) => (
    <div class="karta" style="animation:none">
      <Pecat skore={x.s.celkom} pasmo={x.s.pasmo} />
      <h3 style="margin-top:14px">{x.z.nazov}</h3>
      {x.s.faktory.map((f) => <div class="maly" key={f.id}>{f.nazov}: <b>{f.body ? `−${f.body}` : '0'}</b>{f.polozky.length ? <> ({f.polozky.map((p) => p.nazov.replace(/ \(.*\)$/, '')).slice(0, 3).join(', ')}{f.polozky.length > 3 ? '…' : ''})</> : null}</div>)}
    </div>
  );
  return (
    <>
      <div class="sk-sloupec">{vyber(a, setA, 'Výrobok A')}{vyber(b, setB, 'Výrobok B')}</div>
      {A && B && (
        <>
          <p class="sk-stav" role="status">{lepsi ? `Lepšie vychádza: ${lepsi.z.nazov} (${lepsi.s.celkom} vs. ${(lepsi === A ? B : A).s.celkom})` : 'Skóre je rovnaké.'}</p>
          <div class="sk-sloupec">{stlpec(A)}{stlpec(B)}</div>
          <p class="maly">Porovnávame len prítomnosť látok, nie ich dávku.</p>
        </>
      )}
    </>
  );
}
