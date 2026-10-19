import { FotoReceptu } from './ilustracia';
import type { ComponentChildren } from 'preact';
import type { Info } from '../engine/filtre';
import { PASMO_TEXT } from '../engine/score';
import { TYP_NAZOV, SUROVINA } from '../ctx';
import { useMemo } from 'preact/hooks';
import { nazovPreDomacnost, vynechaneVolitelne } from '../engine/obmedzene';
import { vypocitajSkore } from '../engine/score';
import { aplikujUpravy, ZIADNE_UPRAVY } from '../engine/upravy';
import { useStav, nastav, nastavHviezdy } from '../store';
import { dajHviezdy, HVIEZDY_TEXT } from '../engine/hviezdy';
import { DIETA } from '../data/diety';

export function Pecat({ skore, pasmo }: { skore: number; pasmo: keyof typeof PASMO_TEXT }) {
  return (
    <div class={`pecat s-${pasmo}`} role="img" aria-label={`Skóre ${skore} zo 100, ${PASMO_TEXT[pasmo]}`}>
      {skore}
      <small>{PASMO_TEXT[pasmo]}</small>
    </div>
  );
}

/** Hodnotenie receptu 1–5 hviezdičkami (1★ = nechutilo → recept zmizne z návrhov, rulety a jedálnička). */
export function Hviezdicky({ id }: { id: string }) {
  const s = useStav();
  const h = dajHviezdy(s, id);
  return (
    <div class="hviezdicky" role="group" aria-label="Hodnotenie receptu hviezdičkami">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" class="hviezda" aria-pressed={h === n} aria-label={`${n} z 5 – ${HVIEZDY_TEXT[n]}`} data-hviezda={n} onClick={() => nastavHviezdy(id, n)}>{n <= h ? '★' : '☆'}</button>
      ))}
      <span class="maly hviezdy-text">{h ? `${h}★ ${HVIEZDY_TEXT[h]}` : 'Nehodnotené'}{h === 1 ? ' – nebude sa navrhovať' : ''}</span>
    </div>
  );
}

export function KartaReceptu({ i, dovod }: { i: Info; dovod?: string[] }) {
  const s = useStav();
  const fav = s.oblubene.includes(i.r.id);
  const hv = dajHviezdy(s, i.r.id);
  // skóre karty zohľadní vynechané voliteľné obmedzované suroviny (rovnako ako Detail)
  const vyn = vynechaneVolitelne(i.r, s.nastavenia, SUROVINA, s.pridaneVolitelne[i.r.id]);
  const sk = useMemo(() => (vyn.length ? vypocitajSkore(i.r, aplikujUpravy(i.r, { ...ZIADNE_UPRAVY, odobrane: vyn }), SUROVINA) : i.skore), [i, vyn.join()]);
  return (
    <a class="karta" href={`#/recept/${i.r.id}`}>
      <div class="riadok">
        <div class="emoji" aria-hidden="true"><FotoReceptu r={i.r} velkost={50} /></div>
        <div class="rozt">
          <h3 style="margin:0">{fav ? '★ ' : ''}{nazovPreDomacnost(i.r, s.nastavenia, SUROVINA, s.pridaneVolitelne[i.r.id])}</h3>
          <div class="maly">{TYP_NAZOV[i.r.typ]} · {i.cas} min · {'●'.repeat(i.r.narocnost)}{'○'.repeat(3 - i.r.narocnost)}</div>
          {i.kat.muka ? <span class="tag war">s múkou</span> : <span class="tag">bez múky</span>}
          {hv > 0 && <span class="tag" aria-label={`${hv} hviezdičiek`}>{'★'.repeat(hv)}</span>}
          {i.r.klasika && <span class="tag war">klasika</span>}
          {i.r.vlastny && <span class="tag">vlastný</span>}
          {(dovod ?? []).map((d) => <span class="tag">{d}</span>)}
        </div>
        <Pecat skore={sk.celkom} pasmo={sk.pasmo} />
      </div>
    </a>
  );
}

export function Zalozky<T extends string>({ hodnoty, vybrane, zmen }: { hodnoty: { id: T; nazov: ComponentChildren }[]; vybrane: T; zmen: (v: T) => void }) {
  return (
    <div class="zalozky" role="group">
      {hodnoty.map((h) => (
        <button key={h.id} aria-pressed={vybrane === h.id} onClick={() => zmen(h.id)}>{h.nazov}</button>
      ))}
    </div>
  );
}

/** Výber jednej možnosti ako čipy (namiesto rozbaľovacieho zoznamu). */
export function Cipy<T extends string | number>({ hodnoty, vybrane, zmen, popis, trieda = '' }: { hodnoty: { id: T; nazov: ComponentChildren }[]; vybrane: T; zmen: (v: T) => void; popis: string; trieda?: string }) {
  return (
    <div class={`cipy cipy-vyber ${trieda}`} role="group" aria-label={popis}>
      {hodnoty.map((h) => <button type="button" key={String(h.id)} class="chip" aria-pressed={vybrane === h.id} onClick={() => zmen(h.id)}>{h.nazov}</button>)}
    </div>
  );
}

export function Hlavicka({ nazov, vpravo }: { nazov: ComponentChildren; vpravo?: ComponentChildren }) {
  return <div class="horna"><h1>{nazov}</h1>{vpravo}</div>;
}

export function AktivneDiety() {
  const s = useStav();
  const d = s.nastavenia.diety;
  if (!d.length) return null;
  return <p class="upoz">Aktívne diéty: <strong>{d.map((x) => DIETA.get(x)?.nazov ?? x).join(', ')}</strong> · <a href="#/nastavenia" class="odkaz">zmeniť</a>. Ak sa diéty vylučujú, zostane málo receptov.</p>;
}

export const Upozornenie = () => (
  <p class="upoz">Nie je to lekárska rada. Pri deťoch, tehotenstve, celiakii, cukrovke a iných chorobách sa poraď s lekárom alebo nutričným terapeutom. Skóre je naša heuristika (odhad).</p>
);

export function prepniOblubene(id: string) {
  nastav((s) => { s.oblubene = s.oblubene.includes(id) ? s.oblubene.filter((x) => x !== id) : [...s.oblubene, id]; });
}
