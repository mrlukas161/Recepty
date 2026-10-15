import { Ilustracia } from './ilustracia';
import { useState } from 'preact/hooks';
import { INFOS, INFO, TYP_NAZOV } from '../ctx';
import { SUROVINA } from '../data';
import { useStav, nastav } from '../store';
import { DNI, kluc, generujJedalnicek, suhrn } from '../engine/planner';
import { KATEGORIE } from '../engine/types';
import { Hlavicka } from './kom';
import { vylucene, dietyOk } from '../engine/filtre';

export function Jedalnicek() {
  const s = useStav();
  const n = s.nastavenia;
  const [seed, setSeed] = useState(Date.now() % 100000);
  const [menit, setMenit] = useState<string | null>(null);
  const gen = () => {
    const sd = Math.floor(Math.random() * 1e6); setSeed(sd);
    const zam: Record<string, string | null> = {};
    for (const k of s.zamknute) zam[k] = s.jedalnicek[k] ?? null;
    nastav((x) => { x.jedalnicek = generujJedalnicek({ infos: INFOS, n, db: SUROVINA, zamknute: zam, seed: sd }); });
  };
  const sh = suhrn(s.jedalnicek, INFO, SUROVINA);
  const alt = (k: string) => {
    const typ = k.split(':')[1];
    return INFOS.filter((i) => (typ === 'obed' ? i.r.typ === 'obed' : i.r.typ === typ) && !vylucene(i, n) && dietyOk(i, n, SUROVINA)).sort((a, b) => b.skore.celkom - a.skore.celkom).slice(0, 25);
  };
  return (
    <>
      <Hlavicka nazov="Jedálniček" />
      <div class="rad">
        <button class="hl" onClick={gen}>✨ {Object.keys(s.jedalnicek).length ? 'Pregenerovať' : 'Vygenerovať týždeň'}</button>
        <button onClick={() => { nastav((x) => { x.nakupRecepty = Array.from(new Set(Object.values(x.jedalnicek).filter(Boolean) as string[])); }); location.hash = '#/nakup'; }}>🛒 Nákup z jedálnička</button>
        <button onClick={() => nastav((x) => { x.jedalnicek = {}; x.zamknute = []; })}>Vymazať</button>
      </div>
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
                  <div class="maly">{TYP_NAZOV[typ]}</div>
                  {i ? <a href={`#/recept/${i.r.id}`}>{i.r.nazov}</a> : <span class="maly">— prázdne —</span>}
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
              {alt(menit).map((i) => <option value={i.r.id}>{i.r.nazov} ({i.skore.celkom})</option>)}
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
      <p class="maly">Generátor nerobí dva rovnaké recepty v týždni, drží limity a striedá bielkoviny. Zvyšky a čas cez týždeň sú zohľadnené len približne.</p>
    </>
  );
}
