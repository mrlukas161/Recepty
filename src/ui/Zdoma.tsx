import { useMemo, useState } from 'preact/hooks';
import { SUROVINA } from '../data';
import { useStav, nastav, nastavNastavenia } from '../store';
import { KartaReceptu } from './kom';
import type { Info } from '../engine/filtre';
import { kluc } from '../engine/planner';

/** Rýchle jedlo z toho, čo je doma: zásoby sa pridávajú ťuknutím, návrhy sú zoradené podľa toho, koľko chýba. */
export function Zdoma({ kandidati }: { kandidati: Info[] }) {
  const s = useStav();
  const doma = s.nastavenia.mamDoma;
  const [q, setQ] = useState('');
  const najdene = q.length > 1 ? Array.from(SUROVINA.values()).filter((x) => x.nazov.toLowerCase().includes(q.toLowerCase()) && !doma.includes(x.id)).slice(0, 6) : [];
  const navrhy = useMemo(() => {
    if (doma.length < 2) return [];
    const set = new Set(doma);
    return kandidati
      .map((i) => {
        const potrebne = i.r.suroviny.filter((x) => !x.volitelna);
        const chyba = potrebne.filter((x) => !set.has(x.id)).map((x) => SUROVINA.get(x.id)?.nazov ?? x.id);
        return { i, chyba, mam: potrebne.length - chyba.length };
      })
      .filter((x) => x.mam >= 2 && x.chyba.length <= 3)
      .sort((a, b) => a.chyba.length - b.chyba.length || b.mam - a.mam || b.i.skore.celkom - a.i.skore.celkom)
      .slice(0, 4);
  }, [doma.join(), kandidati]);
  return (
    <section data-sekcia="z-domaca" aria-label="Z toho, čo mám doma">
      <h2>Z toho, čo mám doma</h2>
      <p class="maly">Pridaj, čo máš v chladničke a špajzi. Ukážem jedlá, kde chýba najmenej (soľ, voda a drobnosti sa nepočítajú).</p>
      <input type="text" placeholder="Pridať surovinu (napr. vajcia, cuketa)…" aria-label="Pridať, čo mám doma" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
      {najdene.length > 0 && <div class="cipy" style="margin-top:6px">{najdene.map((x) => <button class="chip" onClick={() => { nastavNastavenia({ mamDoma: [...doma, x.id] }); setQ(''); }}>＋ {x.nazov}</button>)}</div>}
      {doma.length > 0 && <div class="cipy-vyber" style="display:flex;flex-wrap:wrap;gap:6px">{doma.map((id) => <button class="chip" aria-pressed="true" aria-label={`Odobrať ${SUROVINA.get(id)?.nazov ?? id}`} onClick={() => nastavNastavenia({ mamDoma: doma.filter((x) => x !== id) })}>✕ {SUROVINA.get(id)?.nazov ?? id}</button>)}</div>}
      {doma.length < 2 && <p class="maly">Pridaj aspoň dve suroviny.</p>}
      {navrhy.map(({ i, chyba }) => (
        <div key={i.r.id}>
          <KartaReceptu i={i} dovod={[chyba.length ? `chýba: ${chyba.join(', ')}` : 'máš všetko']} />
        </div>
      ))}
      {doma.length >= 2 && !navrhy.length && <p class="maly">Z týchto surovín zatiaľ nič nesedí. Pridaj ďalšie.</p>}
    </section>
  );
}

/** Jedno ťuknutie: recept na dnes do jedálnička. */
export function NaDnes({ i, typ }: { i: Info; typ: 'ranajky' | 'obed' | 'vecera' }) {
  const s = useStav();
  const den = (new Date().getDay() + 6) % 7;
  const k = kluc(den, typ);
  const je = s.jedalnicek[k] === i.r.id;
  return (
    <button class="male na-dnes" aria-pressed={je} onClick={() => nastav((x) => { x.jedalnicek[k] = je ? null : i.r.id; })}>
      {je ? '✓ V jedálničku na dnes' : '＋ Do jedálnička na dnes'}
    </button>
  );
}
