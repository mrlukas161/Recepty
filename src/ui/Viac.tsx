import { useState } from 'preact/hooks';
import { NAHRADY, CHUT_NA } from '../data/nahrady';
import { DIETY, DIETA } from '../data/diety';
import { VEDOMOSTI, OVERENIE_POZNAMKA } from '../data/vedomosti';
import { SUROVINA } from '../data';
import { useStav, nastavNastavenia, nastav, exportuj, importuj, resetuj } from '../store';
import { KATEGORIE, type Kategoria, type Uroven } from '../engine/types';
import { Hlavicka, Upozornenie, Zalozky } from './kom';
import type { Alergen } from '../data/types';
import { ZdrojeK, VsetkyZdroje } from './Zdroje';

export function Viac() {
  const odk = [
    ['#/nahrady', '🔁', 'Náhrady', 'Čím nahradiť múku, cukor, údeniny…'],
    ['#/diety', '🥗', 'Diéty', 'Popisy a tlačidlo „Použiť“'],
    ['#/vedomosti', '📚', 'Vedomosti', 'Krátke karty a stav zdrojov'],
    ['#/skener', '📷', 'Skener zloženia', 'Odfoť zloženie výrobku a získaj hodnotenie'],
    ['#/ruleta', '🎰', 'Ruleta', 'Náhodný recept dňa'],
    ['#/nastavenia', '⚙️', 'Nastavenia', 'Domácnosť, obmedzenia, téma, export'],
  ];
  return (
    <>
      <Hlavicka nazov="Viac" />
      {odk.map(([h, i, n, p]) => <a class="karta" href={h} key={h}><div class="riadok"><div class="emoji">{i}</div><div class="rozt"><h3 style="margin:0">{n}</h3><div class="maly">{p}</div></div></div></a>)}
      <Upozornenie />
    </>
  );
}

export function Nahrady() {
  const [sk, setSk] = useState(NAHRADY[0].id);
  const g = NAHRADY.find((x) => x.id === sk)!;
  return (
    <>
      <Hlavicka nazov="Náhrady" />
      <Zalozky hodnoty={NAHRADY.map((x) => ({ id: x.id, nazov: `${x.ikona} ${x.nazov}` }))} vybrane={sk} zmen={setSk} />
      <p>{g.uvod}</p>
      {g.nahrady.map((n) => (
        <div class="karta" key={n.za}>
          <h3>{n.za}</h3><div class="maly">{n.kontext}</div>
          <p class="plus" style="margin:6px 0 0">＋ {n.zisk}</p>
          <p class="minus" style="margin:0">－ {n.strata}</p>
          {n.ides && <p class="maly" style="margin:4px 0 0">Suroviny: {n.ides.map((i) => SUROVINA.get(i)?.nazov).filter(Boolean).join(', ')}</p>}
        </div>
      ))}
      <p class="upoz">Všetky tipy sú praktické odhady (kuchárska prax a výživová logika), nie citované dôkazy.</p>
      <h2>Chuť na…?</h2>
      {CHUT_NA.map((c) => <div class="karta" key={c.chut}><h3>{c.chut}</h3><p class="maly" style="margin:0">Klasika: {c.klasika}</p><p style="margin:0">Skús: {c.skus}</p></div>)}
      <a href="#/recepty">Pozri recepty</a>
    </>
  );
}

export function Diety({ id }: { id?: string }) {
  const s = useStav();
  if (id) {
    const d = DIETA.get(id);
    if (!d) return <p>Diéta sa nenašla.</p>;
    const aktivna = s.nastavenia.diety.includes(d.id);
    const konflikt = s.nastavenia.diety.filter((x) => x !== d.id && ((x === 'vegansku' || x === 'veganska') && d.id === 'ketogenna' || (d.id === 'veganska' && x === 'ketogenna') || (d.id === 'ketogenna' && x === 'veganska')));
    const L = ({ t, a }: { t: string; a: string[] }) => a.length ? <><h3>{t}</h3><ul>{a.map((x) => <li>{x}</li>)}</ul></> : null;
    return (
      <>
        <a href="#/diety" class="maly">← Diéty</a>
        <h1>{d.nazov}</h1><p>{d.popis}</p>
        <L t="Zahŕňa" a={d.zahrna} /><L t="Obmedzuje" a={d.obmedzuje} /><L t="Vylučuje" a={d.vylucuje} />
        <div class="karta"><strong>Pre koho:</strong> {d.preKoho}<br /><strong>Pre koho nie:</strong> {d.neVhodne}</div>
        <div class="upoz"><strong>Čo hovoria dôkazy:</strong> {d.dokazy}</div>
        <ZdrojeK kind="diety" id={d.id} />
        <L t="Praktické tipy" a={d.tipy} />
        <p class="maly">{d.tvrda ? 'Po použití appka zobrazí len recepty vyhovujúce tejto diéte.' : 'Táto diéta je vzorec stravy – appka uprednostní recepty s vyšším skóre bez údenín.'}</p>
        {konflikt.length > 0 && <p class="upoz">Pozor: táto kombinácia diét môže byť príliš reštriktívna alebo protichodná.</p>}
        <button class="hl" onClick={() => nastavNastavenia({ diety: aktivna ? s.nastavenia.diety.filter((x) => x !== d.id) : [...s.nastavenia.diety, d.id] })}>{aktivna ? 'Prestať používať' : 'Použiť'}</button>
        <p class="maly">Diéty sa dajú kombinovať; ak sa vylučujú, zostane málo receptov.</p>
        <Upozornenie />
      </>
    );
  }
  return (
    <>
      <Hlavicka nazov="Diéty" />
      {DIETY.map((d) => (
        <a class="karta" key={d.id} href={`#/diety/${d.id}`}>
          <h3 style="margin:0">{s.nastavenia.diety.includes(d.id) ? '✓ ' : ''}{d.nazov}</h3>
          <div class="maly">{d.popis}</div>
        </a>
      ))}
    </>
  );
}

export function Vedomosti() {
  return (
    <>
      <Hlavicka nazov="Vedomosti" />
      <p class="upoz">{OVERENIE_POZNAMKA}</p>
      {VEDOMOSTI.map((k) => (
        <details class="karta" key={k.id}>
          <summary style="min-height:44px;display:flex;align-items:center;gap:8px;font-weight:700"><span aria-hidden="true">{k.ikona}</span>{k.nazov}<span class="tag war" style="margin-left:auto">úroveň: {k.uroven}</span></summary>
          {k.text.map((t) => <p>{t}</p>)}
          <ZdrojeK kind="karty" id={k.id} />
        </details>
      ))}
      <h2>Zdroje</h2>
      <VsetkyZdroje />
    </>
  );
}

const ALERGENY: [Alergen, string][] = [['lepok', 'Lepok'], ['mlieko', 'Mlieko'], ['vajcia', 'Vajcia'], ['orechy', 'Orechy'], ['arasidy', 'Arašidy'], ['soja', 'Sója'], ['ryby', 'Ryby'], ['sezam', 'Sezam'], ['korovce', 'Kôrovce'], ['zeler', 'Zeler'], ['horcica', 'Horčica'], ['siricitany', 'Siričitany'], ['vlcibob', 'Vlčí bôb'], ['makkyse', 'Mäkkýše']];
const VYBAVENIE: [string, string][] = [['rura', 'Rúra'], ['panvica', 'Panvica'], ['hrniec', 'Hrniec'], ['mixer', 'Mixér'], ['airfryer', 'Airfryer'], ['pomaly-hrniec', 'Pomalý hrniec'], ['tlakovy-hrniec', 'Tlakový hrniec']];

export function Nastavenia({ uvod }: { uvod?: boolean }) {
  const s = useStav();
  const n = s.nastavenia;
  const [hladaj, setHladaj] = useState('');
  const [sprava, setSprava] = useState('');
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const najdene = hladaj.length > 1 ? Array.from(SUROVINA.values()).filter((x) => x.nazov.toLowerCase().includes(hladaj.toLowerCase())).slice(0, 8) : [];
  const [hladajDoma, setHladajDoma] = useState('');
  const najdeneDoma = hladajDoma.length > 1 ? Array.from(SUROVINA.values()).filter((x) => x.nazov.toLowerCase().includes(hladajDoma.toLowerCase())).slice(0, 8) : [];
  const celaObrazovka = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); };
  return (
    <>
      <Hlavicka nazov={uvod ? 'Vitaj v Receptoch' : 'Nastavenia'} />
      {uvod && <p>Pár otázok, aby návrhy sedeli rodine. Všetko sa dá zmeniť neskôr, alebo to preskoč.</p>}
      <h2>Domácnosť</h2>
      <div class="karta">
        <label class="pol">Dospelí: <input type="number" min="1" max="10" value={n.dospeli} style="width:80px" onChange={(e) => nastavNastavenia({ dospeli: Math.max(1, +(e.target as HTMLInputElement).value || 1) })} /></label>
        <p class="maly" style="margin:4px 0">Deti (vek v rokoch):</p>
        {n.deti.map((v, k) => (
          <div class="rad" key={k} style="align-items:center">
            <input type="number" min="0" max="17" aria-label={`Vek dieťaťa ${k + 1}`} value={v} style="width:80px" onChange={(e) => { const d = [...n.deti]; d[k] = Math.max(0, +(e.target as HTMLInputElement).value || 0); nastavNastavenia({ deti: d }); }} />
            <button class="male" onClick={() => nastavNastavenia({ deti: n.deti.filter((_, j) => j !== k) })} aria-label="Odobrať dieťa">✕</button>
          </div>
        ))}
        <button class="male" onClick={() => nastavNastavenia({ deti: [...n.deti, 4] })}>＋ Pridať dieťa</button>
      </div>
      <h2>Čo obmedziť</h2>
      <div class="karta">
        {KATEGORIE.map((k) => (
          <div key={k.id} style="margin-bottom:12px">
            <strong>{k.nazov}</strong> <span class="maly">{k.popis}</span>
            <div class="rad">
              <select aria-label={k.nazov} value={n.obmedzenia[k.id]} onChange={(e) => nastavNastavenia({ obmedzenia: { ...n.obmedzenia, [k.id]: (e.target as HTMLSelectElement).value as Uroven } })}>
                <option value="bez">Bez obmedzenia</option><option value="obmedzit">Obmedziť</option><option value="vylucit">Vylúčiť</option>
              </select>
              {n.obmedzenia[k.id] === 'obmedzit' && <label class="pol">max <input type="number" min="0" max="21" style="width:70px" value={n.maxTyzdenne[k.id]} onChange={(e) => nastavNastavenia({ maxTyzdenne: { ...n.maxTyzdenne, [k.id as Kategoria]: Math.max(0, +(e.target as HTMLInputElement).value || 0) } })} /> × týždenne</label>}
            </div>
          </div>
        ))}
      </div>
      <h2>Alergie</h2>
      <div class="cipy">{ALERGENY.map(([id, nz]) => <button class="chip" aria-pressed={n.alergie.includes(id)} onClick={() => nastavNastavenia({ alergie: toggle(n.alergie, id) })}>{nz}</button>)}</div>
      <h2>Čo nejeme</h2>
      <input type="text" placeholder="Hľadať surovinu…" aria-label="Hľadať surovinu, ktorú nejeme" value={hladaj} onInput={(e) => setHladaj((e.target as HTMLInputElement).value)} />
      <div class="cipy" style="margin-top:6px">{najdene.map((x) => <button class="chip" onClick={() => { nastavNastavenia({ nejem: Array.from(new Set([...n.nejem, x.id])) }); setHladaj(''); }}>＋ {x.nazov}</button>)}</div>
      <div class="cipy" style="margin-top:6px">{n.nejem.map((id) => <button class="chip" aria-pressed="true" onClick={() => nastavNastavenia({ nejem: n.nejem.filter((x) => x !== id) })}>✕ {SUROVINA.get(id)?.nazov ?? id}</button>)}</div>
      <h2>Diéta</h2>
      <div class="cipy">{DIETY.map((d) => <button class="chip" aria-pressed={n.diety.includes(d.id)} onClick={() => nastavNastavenia({ diety: toggle(n.diety, d.id) })}>{d.nazov}</button>)}</div>
      <p class="maly"><a href="#/diety">Popisy diét</a></p>
      <h2>Jedlá v jedálničku</h2>
      <div class="cipy">{([['ranajky', 'Raňajky'], ['desiata', 'Desiata'], ['obed', 'Obed'], ['vecera', 'Večera']] as const).map(([id, nz]) => <button class="chip" aria-pressed={n.jedla.includes(id)} onClick={() => { const poradie = ['ranajky', 'desiata', 'obed', 'vecera']; const novy = n.jedla.includes(id) ? n.jedla.filter((x) => x !== id) : [...n.jedla, id]; nastavNastavenia({ jedla: novy.sort((a, b) => poradie.indexOf(a) - poradie.indexOf(b)) }); }}>{nz}</button>)}</div>
      <h2>Čas a vybavenie</h2>
      <div class="karta">
        <label class="pol">Čas na varenie cez týždeň (po–pi): <input type="number" min="10" max="180" step="5" style="width:90px" value={n.casTyzden} onChange={(e) => nastavNastavenia({ casTyzden: Math.max(10, +(e.target as HTMLInputElement).value || 45) })} /> min</label>
        <label class="pol">Čas na varenie cez víkend (so–ne): <input type="number" min="10" max="240" step="5" style="width:90px" value={n.casVikend} onChange={(e) => nastavNastavenia({ casVikend: Math.max(10, +(e.target as HTMLInputElement).value || 90) })} /> min</label>
        <label class="pol"><input type="checkbox" checked={n.varimNa2Dni} onChange={(e) => nastavNastavenia({ varimNa2Dni: (e.target as HTMLInputElement).checked })} /> Varím na 2 dni (večera sa uvarí dvojnásobne a na ďalší deň je z nej obed)</label>
        <p class="maly" style="margin:4px 0">Čas = príprava + varenie. Jedálniček ho drží pri obedoch a večerách (zvyšky sa nevaria, tam sa limit nepoužije). Na viac dní sa hodia recepty so značkou „Na viac dní“.</p>
        <div class="cipy">{VYBAVENIE.map(([v, nz]) => <button class="chip" aria-pressed={n.vybavenie.includes(v)} onClick={() => nastavNastavenia({ vybavenie: toggle(n.vybavenie, v) })}>{nz}</button>)}</div>
      </div>
      {!uvod && (
        <>
          <h2>Mám doma</h2>
          <input type="text" placeholder="Pridať surovinu na sklade…" aria-label="Mám doma" value={hladajDoma} onInput={(e) => setHladajDoma((e.target as HTMLInputElement).value)} />
          <div class="cipy" style="margin-top:6px">{najdeneDoma.map((x) => <button class="chip" onClick={() => { nastavNastavenia({ mamDoma: Array.from(new Set([...n.mamDoma, x.id])) }); setHladajDoma(''); }}>＋ {x.nazov}</button>)}</div>
          <div class="cipy" style="margin-top:6px">{n.mamDoma.map((id) => <button class="chip" aria-pressed="true" onClick={() => nastavNastavenia({ mamDoma: n.mamDoma.filter((x) => x !== id) })}>✕ {SUROVINA.get(id)?.nazov ?? id}</button>)}</div>
          <h2>Vzhľad</h2>
          <div class="rad">
            <select aria-label="Téma" value={n.tema} onChange={(e) => nastavNastavenia({ tema: (e.target as HTMLSelectElement).value as 'auto' })}><option value="auto">Automaticky</option><option value="svetla">Svetlá</option><option value="tmava">Tmavá</option></select>
            <button onClick={celaObrazovka}>⛶ Na celú obrazovku</button>
          </div>
          <label class="pol"><input type="checkbox" checked={n.vibracia} onChange={(e) => nastavNastavenia({ vibracia: (e.target as HTMLInputElement).checked })} /> Vibrácia pri rulete</label>
          <h2>Údaje</h2>
          <div class="rad">
            <button onClick={() => { const b = new Blob([exportuj()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'recepty-zaloha.json'; a.click(); }}>⬇ Export JSON</button>
            <label class="tlacidlo" style="display:inline-flex;align-items:center">⬆ Import JSON<input type="file" accept="application/json" hidden onChange={async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; try { importuj(await f.text()); setSprava('Import hotový.'); } catch { setSprava('Súbor sa nepodarilo načítať.'); } }} /></label>
            <button onClick={() => { if (confirm('Naozaj zmazať všetky údaje v tejto appke?')) resetuj(); }}>Reset</button>
          </div>
          <p role="status">{sprava}</p>
          <h2>O appke</h2>
          <OAppke />
          <Upozornenie />
        </>
      )}
      {uvod && <div class="rad"><button class="hl" onClick={() => { nastavNastavenia({ hotovo: true }); location.hash = '#/'; }}>Hotovo, ukáž návrhy</button><button onClick={() => { nastavNastavenia({ hotovo: true }); location.hash = '#/'; }}>Preskočiť</button></div>}
    </>
  );
}

function OAppke() {
  const [stav, setStav] = useState('');
  const skontroluj = async () => {
    setStav('Kontrolujem…');
    try {
      const r = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
      const v = (await r.json()) as { sha: string };
      if (v.sha === __SHA__) { setStav('Máš najnovšiu verziu.'); return; }
      setStav('Je nová verzia, sťahujem…');
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
      setTimeout(() => setStav('Nová verzia je pripravená – zavri a znova otvor appku (alebo obnov stránku).'), 4000);
    } catch { setStav('Kontrola sa nepodarila (si offline?).'); }
  };
  return (
    <>
      <p class="maly">Verzia: <code>{__SHA__.slice(0, 7)}</code> · zostavené {__CAS__.slice(0, 16).replace('T', ' ')} UTC ({new Date(__CAS__).toLocaleString('sk-SK')} tvoj čas)</p>
      <p class="maly">Nové verzie sa sťahujú samy pri otvorení appky a pri návrate z pozadia.</p>
      <button class="male" onClick={skontroluj}>🔄 Skontrolovať aktualizáciu</button>
      <p role="status" class="maly">{stav}</p>
    </>
  );
}
