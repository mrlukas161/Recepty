import { useMemo, useState } from 'preact/hooks';
import { INFOS, TYP_NAZOV } from '../ctx';
import { SUROVINA } from '../data';
import { useStav, nastav, dnesKluc } from '../store';
import { dietyOk, vylucene } from '../engine/filtre';
import { Hlavicka, KartaReceptu, Zalozky } from './kom';
import { kluc } from '../engine/planner';

export function Ruleta() {
  const s = useStav();
  const n = s.nastavenia;
  const [typ, setTyp] = useState<string>('obed');
  const [uhol, setUhol] = useState(0);
  const [vyber, setVyber] = useState<string | null>(null);
  const [toci, setToci] = useState(false);
  const [emoji, setEmoji] = useState('🎰');
  const pool = useMemo(() => INFOS.filter((i) => (typ === 'vsetko' || i.r.typ === typ) && !vylucene(i, n) && dietyOk(i, n, SUROVINA) && s.hodnotenie[i.r.id] !== -1), [typ, JSON.stringify(n)]);
  const tocit = () => {
    if (!pool.length || toci) return;
    setToci(true); setVyber(null);
    const i = pool[Math.floor(Math.random() * pool.length)];
    setUhol(uhol + 1080 + Math.floor(Math.random() * 360));
    if (n.vibracia) navigator.vibrate?.(30);
    const t = setInterval(() => setEmoji(pool[Math.floor(Math.random() * pool.length)].r.ilustracia), 120);
    setTimeout(() => { clearInterval(t); setEmoji(i.r.ilustracia); setVyber(i.r.id); setToci(false); if (n.vibracia) navigator.vibrate?.([60, 40, 60]); }, 3200);
  };
  const v = INFOS.find((i) => i.r.id === vyber);
  return (
    <>
      <Hlavicka nazov="Ruleta" />
      <Zalozky hodnoty={[{ id: 'ranajky', nazov: 'Raňajky' }, { id: 'obed', nazov: 'Obed' }, { id: 'vecera', nazov: 'Večera' }, { id: 'vsetko', nazov: 'Všetko' }]} vybrane={typ} zmen={setTyp} />
      <p class="maly">Rešpektuje tvoje vylúčenia, alergie a diétu. Na výber: {pool.length} receptov.</p>
      <div class="sipka" aria-hidden="true">▼</div>
      <div class="koleso" style={`transform:rotate(${uhol}deg)`} aria-hidden="true"><div class="stred" style={`transform:rotate(${-uhol}deg)`}>{emoji}</div></div>
      {!pool.length && <p class="upoz">Žiadne recepty nevyhovujú tvojim nastaveniam (alergie, vylúčenia, diéty). <a href="#/nastavenia">Nastavenia</a> · <a href="#/diety">Diéty</a></p>}
      <div class="rad" style="justify-content:center"><button class="hl" onClick={tocit} disabled={toci || !pool.length} style="min-height:56px;font-size:1.15rem">{toci ? 'Točí sa…' : '🎰 Roztočiť'}</button></div>
      <div aria-live="polite">
        {v && (
          <>
            <h2>Recept dňa: {TYP_NAZOV[v.r.typ]}</h2>
            <KartaReceptu i={v} />
            <div class="rad">
              <button class="hl" onClick={() => nastav((x) => { const d = (new Date().getDay() + 6) % 7; const t = v.r.typ === 'polievka' ? 'obed' : v.r.typ === 'dezert' ? 'desiata' : v.r.typ; x.jedalnicek[kluc(d, t)] = v.r.id; (x.dnes[dnesKluc()] ??= []).push(v.r.id); })}>✓ Prijať do dnešného jedálnička</button>
              <button onClick={tocit}>Roztočiť znova</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
