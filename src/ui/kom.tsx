import { IlustraciaReceptu } from './ilustracia';
import type { ComponentChildren } from 'preact';
import type { Info } from '../engine/filtre';
import { PASMO_TEXT } from '../engine/score';
import { TYP_NAZOV, SUROVINA } from '../ctx';
import { useMemo } from 'preact/hooks';
import { nazovPreDomacnost, vynechaneVolitelne } from '../engine/obmedzene';
import { vypocitajSkore } from '../engine/score';
import { aplikujUpravy, ZIADNE_UPRAVY } from '../engine/upravy';
import { useStav, nastav } from '../store';
import { DIETA } from '../data/diety';

export function Pecat({ skore, pasmo }: { skore: number; pasmo: keyof typeof PASMO_TEXT }) {
  return (
    <div class={`pecat s-${pasmo}`} role="img" aria-label={`Skóre ${skore} zo 100, ${PASMO_TEXT[pasmo]}`}>
      {skore}
      <small>{PASMO_TEXT[pasmo]}</small>
    </div>
  );
}

export function KartaReceptu({ i, dovod }: { i: Info; dovod?: string[] }) {
  const s = useStav();
  const fav = s.oblubene.includes(i.r.id);
  // skóre karty zohľadní vynechané voliteľné obmedzované suroviny (rovnako ako Detail)
  const vyn = vynechaneVolitelne(i.r, s.nastavenia, SUROVINA, s.pridaneVolitelne[i.r.id]);
  const sk = useMemo(() => (vyn.length ? vypocitajSkore(i.r, aplikujUpravy(i.r, { ...ZIADNE_UPRAVY, odobrane: vyn }), SUROVINA) : i.skore), [i, vyn.join()]);
  return (
    <a class="karta" href={`#/recept/${i.r.id}`}>
      <div class="riadok">
        <div class="emoji" aria-hidden="true"><IlustraciaReceptu r={i.r} velkost={38} /></div>
        <div class="rozt">
          <h3 style="margin:0">{fav ? '★ ' : ''}{nazovPreDomacnost(i.r, s.nastavenia, SUROVINA, s.pridaneVolitelne[i.r.id])}</h3>
          <div class="maly">{TYP_NAZOV[i.r.typ]} · {i.cas} min · {'●'.repeat(i.r.narocnost)}{'○'.repeat(3 - i.r.narocnost)}</div>
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
