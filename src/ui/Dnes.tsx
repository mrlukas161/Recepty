import { Ilustracia } from './ilustracia';
import { useMemo, useState } from 'preact/hooks';
import { INFOS, vlastnaVerzia, typPodlaCasu, TYP_NAZOV } from '../ctx';
import { SUROVINA } from '../data';
import { useStav, dnesKluc } from '../store';
import { dietyOk, vylucene } from '../engine/filtre';
import { KartaReceptu, Hlavicka, Zalozky, Upozornenie, AktivneDiety } from './kom';
import { KATEGORIE, casNaDen } from '../engine/types';
import { suhrn } from '../engine/planner';
import { INFO } from '../ctx';

export function Dnes() {
  const s = useStav();
  const n = s.nastavenia;
  const [typ, setTyp] = useState<'ranajky' | 'obed' | 'vecera'>(typPodlaCasu());
  const [strana, setStrana] = useState(0);
  const navrhy = useMemo(() => {
    const kand = INFOS.filter((i) => i.r.typ === typ && !vylucene(i, n) && dietyOk(i, n, SUROVINA) && !s.hodnotenie[i.r.id]?.toString().startsWith('-'));
    return kand
      .map((i) => {
        let b = i.skore.celkom;
        if (s.oblubene.includes(i.r.id)) b += 6;
        if (s.hodnotenie[i.r.id] === -1) b -= 40;
        if (i.cas > casNaDen(n, (new Date().getDay() + 6) % 7)) b -= 8;
        for (const k of Object.keys(i.kat) as (keyof typeof i.kat)[]) if (i.kat[k] && n.obmedzenia[k] === 'obmedzit') b -= 6;
        return { i, b };
      })
      .sort((a, c) => c.b - a.b)
      .map((x) => x.i);
  }, [typ, JSON.stringify(n), s.oblubene.length, vlastnaVerzia()]);
  const okno = 6;
  const zacni = (strana * okno) % Math.max(1, navrhy.length);
  const vyber = navrhy.slice(zacni, zacni + okno).concat(zacni + okno > navrhy.length ? navrhy.slice(0, zacni + okno - navrhy.length).slice(0, okno) : []).slice(0, okno);
  const tyzden = suhrn(s.jedalnicek, INFO, SUROVINA);
  const dovody = (i: (typeof INFOS)[number]) => [...i.skore.prinosy.slice(0, 1), ...(i.skore.slabiny.length ? [] : [])];
  return (
    <>
      <Hlavicka nazov={<span style="display:inline-flex;align-items:center;gap:8px"><Ilustracia typ={typ} velkost={34} />{TYP_NAZOV[typ]}</span>} vpravo={<span class="maly">{new Date().toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}</span>} />
      <Zalozky hodnoty={[{ id: 'ranajky', nazov: 'Raňajky' }, { id: 'obed', nazov: 'Obed' }, { id: 'vecera', nazov: 'Večera' }]} vybrane={typ} zmen={(t) => { setTyp(t); setStrana(0); }} />
      <AktivneDiety />
      <p class="maly">Zoradené podľa skóre zdravosti (naša heuristika) a tvojich preferencií.</p>
      {vyber.map((i) => <KartaReceptu key={i.r.id} i={i} dovod={dovody(i)} />)}
      {!vyber.length && <p>Žiadne recepty nevyhovujú nastaveniam. Skús uvoľniť obmedzenia v Nastaveniach.</p>}
      <div class="rad">
        <button onClick={() => setStrana(strana + 1)}>🔄 Iné návrhy</button>
        <a class="tlacidlo hl" href="#/ruleta" style="text-decoration:none;display:inline-flex;align-items:center">🎰 Ruleta</a>
      </div>
      <h2 style="margin-top:20px">Tento týždeň</h2>
      {tyzden.pocetJedal === 0 ? <p class="maly">Jedálniček je prázdny. <a href="#/jedalnicek" style="display:inline-block;padding:12px 4px">Vygenerovať</a></p> : (
        <div class="karta">
          {KATEGORIE.map((k) => (
            <div key={k.id} class="riadok" style="justify-content:space-between">
              <span>{k.nazov}</span>
              <span>{tyzden.kat[k.id]}× {n.obmedzenia[k.id] === 'obmedzit' ? `z ${n.maxTyzdenne[k.id]}` : n.obmedzenia[k.id] === 'vylucit' ? '(vylúčené)' : ''}</span>
            </div>
          ))}
        </div>
      )}
      <Upozornenie />
    </>
  );
}
