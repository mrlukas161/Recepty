import { Ilustracia } from './ilustracia';
import { useState } from 'preact/hooks';
import { INFOS, INFO, TYP_NAZOV } from '../ctx';
import { SUROVINA } from '../data';
import { useStav, nastav, nastavNastavenia } from '../store';
import { DNI, kluc, generujJedalnicek, suhrn, jeZvysok } from '../engine/planner';
import { nazovPreDomacnost } from '../engine/obmedzene';
import { casNaDen } from '../engine/types';
import { KATEGORIE } from '../engine/types';
import { Hlavicka } from './kom';
import { vylucene, dietyOk } from '../engine/filtre';
import { nechutilo } from '../engine/hviezdy';

export function Jedalnicek() {
  const s = useStav();
  const n = s.nastavenia;
  const [seed, setSeed] = useState(Date.now() % 100000);
  const [menit, setMenit] = useState<string | null>(null);
  const gen = () => {
    const sd = Math.floor(Math.random() * 1e6); setSeed(sd);
    const zam: Record<string, string | null> = {};
    for (const k of s.zamknute) zam[k] = s.jedalnicek[k] ?? null;
    nastav((x) => { x.jedalnicek = generujJedalnicek({ infos: INFOS, n, db: SUROVINA, zamknute: zam, seed: sd, pridane: s.pridaneVolitelne, hodnotenia: s }); });
  };
  const sh = suhrn(s.jedalnicek, INFO, SUROVINA, s.pridaneVolitelne);
  const alt = (k: string) => {
    const typ = k.split(':')[1];
    return INFOS.filter((i) => (typ === 'obed' ? i.r.typ === 'obed' : i.r.typ === typ) && !vylucene(i, n) && dietyOk(i, n, SUROVINA) && !nechutilo(s, i.r.id)).sort((a, b) => b.skore.celkom - a.skore.celkom).slice(0, 25);
  };
  return (
    <>
      <Hlavicka nazov="Jedálniček" />
      <div class="rad">
        <button class="hl" onClick={gen}>{Object.keys(s.jedalnicek).length ? '🔀 Zamiešať' : '✨ Vygenerovať týždeň'}</button>
        <button onClick={() => { nastav((x) => { x.nakupRecepty = Object.values(x.jedalnicek).filter(Boolean) as string[]; }); location.hash = '#/nakup'; }}>🛒 Nákup z jedálnička</button>
        <button onClick={() => nastav((x) => { x.jedalnicek = {}; x.zamknute = []; })}>Vymazať</button>
      </div>
      <p class="maly">Zamiešať uprednostní recepty s 4–5★ a nikdy nedá recept s 1★ (nechutilo). Zamknuté jedlá ostanú.</p>
      <label class="pol"><input type="checkbox" checked={n.varimNa2Dni} onChange={(e) => nastavNastavenia({ varimNa2Dni: (e.target as HTMLInputElement).checked })} /> Varím na 2 dni (večera → obed na ďalší deň)</label>
      {DNI.map((d, di) => (
        <div class="karta" key={d}>
          <h3>{d}</h3>
          {n.jedla.map((typ) => {
            const k = kluc(di, typ);
            const id = s.jedalnicek[k];
            const i = id ? INFO.get(id) : undefined;
            const zam = s.zamknute.includes(k);
            return (
              <div class="slot" key={typ}>
                <Ilustracia typ={typ} velkost={22} />
                <div class="rozt">
                  <div class="maly">{TYP_NAZOV[typ]}{i && jeZvysok(s.jedalnicek, di, typ, n) ? ' · zvyšky z včerajšej večere (nevarí sa)' : i && (typ === 'obed' || typ === 'vecera') && i.cas > casNaDen(n, di) ? ` · ${i.cas} min, dlhšie ako tvoj limit` : ''}</div>
                  {i ? <a href={`#/recept/${i.r.id}`}>{nazovPreDomacnost(i.r, n, SUROVINA, s.pridaneVolitelne[i.r.id])}</a> : <span class="maly">— prázdne —</span>}
                </div>
                {i && <span class={`maly s-${i.skore.pasmo}`}><strong>{i.skore.celkom}</strong></span>}
                <button class="male" aria-pressed={zam} aria-label={zam ? 'Odomknúť' : 'Zamknúť'} onClick={() => nastav((x) => { x.zamknute = zam ? x.zamknute.filter((y) => y !== k) : [...x.zamknute, k]; })}>{zam ? '🔒' : '🔓'}</button>
                <button class="male" aria-label="Vymeniť" onClick={() => setMenit(menit === k ? null : k)}>⇄</button>
              </div>
            );
          })}
          {n.jedla.some((t) => menit === kluc(di, t)) && menit && (
            <select aria-label="Vybrať recept" onChange={(e) => { const v = (e.target as HTMLSelectElement).value; if (v) nastav((x) => { x.jedalnicek[menit] = v; }); setMenit(null); }}>
              <option value="">Vyber náhradu…</option>
              {alt(menit).map((i) => <option value={i.r.id}>{nazovPreDomacnost(i.r, n, SUROVINA, s.pridaneVolitelne[i.r.id])} ({i.skore.celkom})</option>)}
            </select>
          )}
        </div>
      ))}
      {Object.keys(s.jedalnicek).length > 0 && Object.values(s.jedalnicek).every((v) => !v) && <p class="upoz">Žiadne recepty nevyhovujú nastaveniam (alergie, vylúčenia, diéty). <a href="#/nastavenia">Nastavenia</a> · <a href="#/diety">Diéty</a></p>}
      <h2>Súhrn týždňa</h2>
      <div class="karta">
        {KATEGORIE.map((k) => <div key={k.id} class="riadok" style="justify-content:space-between"><span>{k.nazov}</span><strong class={n.obmedzenia[k.id] === 'obmedzit' && sh.kat[k.id] > n.maxTyzdenne[k.id] ? 'minus' : ''}>{sh.kat[k.id]}× {n.obmedzenia[k.id] === 'obmedzit' ? `(limit ${n.maxTyzdenne[k.id]})` : ''}</strong></div>)}
        <div class="riadok" style="justify-content:space-between"><span>Rôznych rastlinných surovín</span><strong>{sh.rastliny}</strong></div>
        <div class="riadok" style="justify-content:space-between"><span>Vláknina (odhad, na jedlo)</span><strong>{sh.vlakninaPriemer.toFixed(1)} g</strong></div>
        <div class="riadok" style="justify-content:space-between"><span>Jedlá s rybou</span><strong>{sh.ryby}</strong></div>
      </div>
      <p class="maly">Generátor nerobí dva rovnaké recepty v týždni, drží limity a striedá bielkoviny. Čas na varenie (cez týždeň a cez víkend) a voľba „varím na 2 dni“ sa dajú nastaviť v Nastaveniach; ak sa nenájde recept v limite, generátor vyberie najbližší možný. Ak je zapnuté varenie na 2 dni, nákup počíta večeru aj zvyšky z nej dvojnásobne v jednom riadku.</p>
    </>
  );
}
