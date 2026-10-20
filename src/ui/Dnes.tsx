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
import { tyzdenMuky } from '../engine/muka';
import { tipDna } from '../data/tipy';
import { navrhnutelny } from '../engine/navrh';
import { dajHviezdy, nechutilo, bonusHviezd } from '../engine/hviezdy';

export function Dnes() {
  const s = useStav();
  const n = s.nastavenia;
  const [typ, setTyp] = useState<'ranajky' | 'obed' | 'vecera'>(typPodlaCasu());
  const [strana, setStrana] = useState(0);
  const [posunTipu, setPosunTipu] = useState(0);
  const tip = tipDna(new Date(), posunTipu);
  const navrhy = useMemo(() => {
    const kand = INFOS.filter((i) => i.r.typ === typ && !vylucene(i, n) && navrhnutelny(i, n) && dietyOk(i, n, SUROVINA) && !nechutilo(s, i.r.id));
    return kand
      .map((i) => {
        let b = i.skore.celkom;
        if (s.oblubene.includes(i.r.id)) b += 6;
        b += bonusHviezd(dajHviezdy(s, i.r.id));
        if (i.cas > casNaDen(n, (new Date().getDay() + 6) % 7)) b -= 8;
        for (const k of Object.keys(i.kat) as (keyof typeof i.kat)[]) if (i.kat[k] && n.obmedzenia[k] === 'obmedzit') b -= 6;
        return { i, b };
      })
      .sort((a, c) => c.b - a.b)
      .map((x) => x.i);
  }, [typ, JSON.stringify(n), s.oblubene.length, JSON.stringify(s.hviezdicky), JSON.stringify(s.hodnotenie), vlastnaVerzia()]);
  const okno = 6;
  const zacni = (strana * okno) % Math.max(1, navrhy.length);
  const vyber = navrhy.slice(zacni, zacni + okno).concat(zacni + okno > navrhy.length ? navrhy.slice(0, zacni + okno - navrhy.length).slice(0, okno) : []).slice(0, okno);
  const muka = tyzdenMuky(s, INFO);
  const bezMuky = navrhy.filter((i) => !i.kat.muka).slice(0, 3);
  const tyzden = suhrn(s.jedalnicek, INFO, SUROVINA);
  const dovody = (i: (typeof INFOS)[number]) => [...i.skore.prinosy.slice(0, 1), ...(i.skore.slabiny.length ? [] : [])];
  return (
    <>
      <Hlavicka nazov={<span style="display:inline-flex;align-items:center;gap:8px"><Ilustracia typ={typ} velkost={34} />{TYP_NAZOV[typ]}</span>} vpravo={<span class="maly">{new Date().toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}</span>} />
      <Zalozky hodnoty={[{ id: 'ranajky', nazov: 'Raňajky' }, { id: 'obed', nazov: 'Obed' }, { id: 'vecera', nazov: 'Večera' }]} vybrane={typ} zmen={(t) => { setTyp(t); setStrana(0); }} />
      <AktivneDiety />
      <MukaTyzden m={muka} />
      <div class="karta tip-dna" style="animation:none">
        <div class="maly"><strong>Tip dňa</strong> · {tip.uroven === 'zdroj' ? 'podložené zdrojom' : tip.uroven === 'tabulka' ? 'z výživových tabuliek' : tip.uroven === 'prax' ? 'prax, nie dôkaz' : 'odhad'}</div>
        <p style="margin:4px 0">{tip.text}</p>
        <div class="rad">{tip.odkaz && <a class="maly" href={tip.odkaz}>Viac</a>}<button class="male" onClick={() => setPosunTipu(posunTipu + 1)}>Ďalší tip</button></div>
      </div>
      <p class="maly">Zoradené podľa skóre zdravosti (naša heuristika) a tvojich preferencií.</p>
      {bezMuky.length > 0 && (
        <section data-sekcia="bez-muky">
          <h2>Bez múky na {TYP_NAZOV[typ].toLowerCase()}</h2>
          {bezMuky.map((i) => <KartaReceptu key={i.r.id} i={i} />)}
        </section>
      )}
      <h2>Ďalšie návrhy</h2>
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

export function MukaTyzden({ m }: { m: ReturnType<typeof tyzdenMuky> }) {
  const farba = m.stav === 'nad-limitom' ? 'minus' : m.stav === 'ok' ? 'plus' : '';
  const vyssie = Math.max(m.vareneSMukou, m.planovaneSMukou);
  return (
    <div class="karta muka-tyzden" style="animation:none">
      <h3 style="margin:0 0 4px">Pšeničná múka a pečivo tento týždeň</h3>
      <div>Uvarené: <strong>{m.vareneSMukou}</strong> z {m.varene} jedál s múkou · Naplánované: <strong>{m.planovaneSMukou}</strong> z {m.planovane}</div>
      <div class={`maly ${farba}`} data-limit-muky>
        {m.limit === null ? 'Múku zatiaľ neobmedzuješ (Viac → Nastavenia → Čo obmedziť).' : m.vylucena ? 'Múku máš vylúčenú – jedlá s múkou sa nenavrhujú a nepatria do plánu.' : m.stav === 'nad-limitom' ? `Nad limitom ${m.limit}× za týždeň (máš ${vyssie}×) – ďalšie jedlo urob bez múky.` : `Limit ${m.limit}× za týždeň – vybrané ${vyssie}×, ostáva ${m.ostava}×.`}
      </div>
      <div class="maly">Jedlá s múkou a pečivom ti appka sama nenavrhne – nájdeš ich len vyhľadaním v Receptoch, hneď s verziou bez múky.</div>
      <a class="maly" href="#/nahrady">Čím nahradiť múku</a>
    </div>
  );
}
