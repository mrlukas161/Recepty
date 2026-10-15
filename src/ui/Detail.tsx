import { useMemo, useState, useEffect } from 'preact/hooks';
import { INFO, SUROVINA, TYP_NAZOV, INFOS } from '../ctx';
import { useStav, nastav, dnesKluc } from '../store';
import { vypocitajSkore, POZNAMKA_SKORE } from '../engine/score';
import { aplikujUpravy, ZIADNE_UPRAVY, type StavUprav } from '../engine/upravy';
import { naGramy } from '../engine/units';
import { kolkoPorcii } from '../engine/filtre';
import { DNI, kluc } from '../engine/planner';
import { ZdrojeK } from './Zdroje';
import { Pecat, prepniOblubene, Upozornenie, KartaReceptu } from './kom';

function fmt(g: number, jednotka: string, s?: { jednotky: { ks?: number } }): string {
  if (jednotka === 'ks') return `${Math.round(g * 10) / 10} ks`.replace('.', ',');
  if (jednotka === 'lyzica') return `${Math.round(g * 2) / 2} PL`.replace('.', ',');
  if (jednotka === 'lyzicka') return `${Math.round(g * 2) / 2} ČL`.replace('.', ',');
  if (jednotka === 'ml') return g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} l` : `${Math.round(g / 5) * 5 || Math.round(g)} ml`;
  return g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} kg` : g < 10 ? `${Math.round(g * 10) / 10} g`.replace('.', ',') : `${Math.round(g / 5) * 5} g`;
}

export function Detail({ id }: { id: string }) {
  if (!INFO.get(id)) return <p>Recept sa nenašiel. <a href="#/recepty">Späť</a></p>;
  return <DetailVnutro key={id} id={id} />;
}

function DetailVnutro({ id }: { id: string }) {
  const s = useStav();
  const info = INFO.get(id)!;
  const [st, setSt] = useState<StavUprav>(ZIADNE_UPRAVY);
  const [varenie, setVarenie] = useState<number | null>(null);
  const [porcie, setPorcie] = useState(0);
  const r = info.r;
  const domac = Math.round(kolkoPorcii(s.nastavenia) * 2) / 2;
  const cielPorcie = porcie || domac;
  const sur = useMemo(() => aplikujUpravy(r, st), [id, JSON.stringify(st)]);
  const nove = useMemo(() => vypocitajSkore(r, sur, SUROVINA), [id, JSON.stringify(st)]);
  const rozdiel = nove.celkom - info.skore.celkom;
  const f = cielPorcie / r.porcie;
  const upravene = st.odobrane.length + Object.keys(st.vymenene).length + st.pridane.length > 0;
  const dopl = r.upravy.map((u, idx) => ({ u, idx }));
  const fav = s.oblubene.includes(id);
  const hod = s.hodnotenie[id];
  const poRoz = (() => {
    if (!upravene) return '';
    const dif = nove.faktory.map((x, k) => ({ n: x.nazov, d: x.body - info.skore.faktory[k].body })).filter((x) => Math.abs(x.d) >= 5).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 2);
    return dif.map((x) => `${x.d > 0 ? 'lepšie' : 'horšie'}: ${x.n.toLowerCase()}`).join(', ');
  })();
  const pridajDo = (den: number) => nastav((x) => { x.jedalnicek[kluc(den, r.typ === 'polievka' ? 'obed' : r.typ === 'dezert' ? 'desiata' : r.typ)] = id; });
  const lepsie = (r.lepsiaVerzia ?? []).map((x) => INFO.get(x)).filter(Boolean);
  const podobne = useMemo(() => {
    if (!r.klasika) return [];
    return INFOS.filter((i) => !i.r.klasika && i.r.typ === r.typ && i.skore.celkom > info.skore.celkom && i.r.id !== id).sort((a, b) => b.skore.celkom - a.skore.celkom).slice(0, 3);
  }, [id]);
  const celkomKrokov = r.postup.length;

  if (varenie !== null) {
    return <Varenie postup={r.postup} i={varenie} set={setVarenie} nazov={r.nazov} />;
  }
  return (
    <>
      <a href="#/recepty" class="maly">← Recepty</a>
      <div class="riadok" style="margin:8px 0">
        <div class="emoji" aria-hidden="true">{r.ilustracia}</div>
        <div class="rozt"><h1 style="margin:0">{r.nazov}</h1><div class="maly">{TYP_NAZOV[r.typ]} · {r.kuchyna} · príprava {r.casPripravy} + varenie {r.casVarenia} min</div></div>
      </div>
      <div class="rad">
        <button class="male" aria-pressed={fav} onClick={() => prepniOblubene(id)}>{fav ? '★ Obľúbené' : '☆ Obľúbené'}</button>
        <button class="male" aria-pressed={hod === 1} onClick={() => nastav((x) => { if (x.hodnotenie[id] === 1) delete x.hodnotenie[id]; else x.hodnotenie[id] = 1; })}>👍</button>
        <button class="male" aria-pressed={hod === -1} onClick={() => nastav((x) => { if (x.hodnotenie[id] === -1) delete x.hodnotenie[id]; else x.hodnotenie[id] = -1; })}>👎</button>
      </div>
      {r.tagy.map((t) => <span class="tag">{t}</span>)}
      <div class="karta">
        <div class="riadok">
          <Pecat skore={nove.celkom} pasmo={nove.pasmo} />
          <div class="rozt">
            <strong>{nove.pasmoText}</strong> <span class="maly">(naša heuristika)</span>
            {upravene && <div class={rozdiel >= 0 ? 'plus' : 'minus'}>{rozdiel >= 0 ? '+' : ''}{rozdiel} oproti pôvodnému{poRoz ? ` – ${poRoz}` : ''}</div>}
            <div class="maly">{Math.round(nove.na100porcia.kcal)} kcal · B {nove.na100porcia.bielk.toFixed(0)} g · vláknina {nove.na100porcia.vlak.toFixed(1)} g na dospelú porciu</div>
          </div>
        </div>
        {nove.prinosy.length > 0 && <><h3 style="margin-top:12px">Prínosy</h3><ul>{nove.prinosy.map((p) => <li class="plus">{p}</li>)}</ul></>}
        {nove.slabiny.length > 0 && <><h3>Slabé stránky</h3><ul>{nove.slabiny.map((p) => <li class="minus">{p}</li>)}</ul></>}
        <details>
          <summary style="min-height:44px;display:flex;align-items:center;font-weight:700">Ako sme to spočítali</summary>
          {nove.faktory.map((x) => (
            <div class={`faktor s-${x.body >= 80 ? 'vyborne' : x.body >= 60 ? 'dobre' : x.body >= 40 ? 'obcas' : 'zriedka'}`}>
              <div class="riadok" style="justify-content:space-between"><strong>{x.nazov}</strong><span>{x.body}/100 · váha {x.vaha}</span></div>
              <div class="lista" role="presentation"><i style={`width:${x.body}%`} /></div>
              <div class="maly" style="color:var(--text)">{x.hodnota} – {x.preco}</div>
              <ZdrojeK kind="faktory" id={x.id} nadpis="Zdroje k faktoru" />
            </div>
          ))}
          <p class="upoz">{POZNAMKA_SKORE} Zdroje pri jednotlivých faktoroch ukazujú, čo je podložené; váhy a prahy sú naše odhady.</p>
        </details>
      </div>

      <h2>Suroviny</h2>
      <div class="rad" style="align-items:center">
        <span>Porcií (dospelých):</span>
        <button class="male" onClick={() => setPorcie(Math.max(0.5, cielPorcie - 0.5))} aria-label="Menej porcií">−</button>
        <strong>{cielPorcie}</strong>
        <button class="male" onClick={() => setPorcie(cielPorcie + 0.5)} aria-label="Viac porcií">+</button>
        <button class="male" onClick={() => setPorcie(0)}>domácnosť ({domac})</button>
      </div>
      <div class="karta">
        <ul class="cisty suroviny">
          {r.suroviny.map((x) => {
            const odobrata = st.odobrane.includes(x.id);
            const idNove = st.vymenene[x.id] ?? x.id;
            const sv = SUROVINA.get(idNove);
            const mn = x.mnozstvo * f;
            const volna = x.volitelna && !x.nevyhnutna;
            return (
              <li key={x.id} style={odobrata ? 'opacity:.45;text-decoration:line-through' : ''}>
                <span class="mn">{fmt(mn, x.jednotka)}</span>
                <span class="rozt">
                  {sv?.nazov ?? idNove}{x.nevyhnutna && <span class="tag" style="margin-left:6px">bez tohto to nejde</span>}{volna && <span class="tag" style="margin-left:6px">voliteľné</span>}
                  {x.jednotka !== 'g' && sv && <span class="maly"> (~{Math.round(naGramy(sv, mn, x.jednotka))} g)</span>}
                </span>
                {volna && <button class="male" onClick={() => setSt({ ...st, odobrane: odobrata ? st.odobrane.filter((y) => y !== x.id) : [...st.odobrane, x.id] })}>{odobrata ? 'Vrátiť' : 'Vynechať'}</button>}
              </li>
            );
          })}
          {st.pridane.map((i) => { const u = r.upravy[i]; const sv = u.na ? SUROVINA.get(u.na) : undefined; return <li key={'p' + i}><span class="mn plus">+ {fmt((u.mnozstvo ?? 50) * f, u.jednotka ?? 'g')}</span><span class="rozt">{sv?.nazov}</span></li>; })}
        </ul>
      </div>

      {dopl.length > 0 && (
        <>
          <h2>Úpravy</h2>
          <div class="karta">
            {dopl.map(({ u, idx }) => {
              const aktivna = u.typ === 'pridat' ? st.pridane.includes(idx) : !!(u.z && st.vymenene[u.z] === u.na);
              return (
                <label class="pol" key={idx}>
                  <input type="checkbox" checked={aktivna} onChange={() => {
                    if (u.typ === 'pridat') setSt({ ...st, pridane: aktivna ? st.pridane.filter((y) => y !== idx) : [...st.pridane, idx] });
                    else if (u.z && u.na) { const v = { ...st.vymenene }; if (aktivna) delete v[u.z]; else v[u.z] = u.na; setSt({ ...st, vymenene: v }); }
                  }} />
                  <span>{u.popis}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
      {r.suroviny.some((x) => x.alternativy?.length) && (
        <div class="karta">
          <h3>Čím nahradiť</h3>
          {r.suroviny.filter((x) => x.alternativy?.length).map((x) => (
            <div key={x.id} class="maly" style="color:var(--text);margin-bottom:6px">
              <strong>{SUROVINA.get(x.id)?.nazov}</strong>: {x.alternativy!.map((a) => SUROVINA.get(a)?.nazov ?? a).join(', ')}
              {' '}
              <select aria-label={`Vymeniť ${SUROVINA.get(x.id)?.nazov}`} value={st.vymenene[x.id] ?? ''} onChange={(e) => { const v = (e.target as HTMLSelectElement).value; const m = { ...st.vymenene }; if (v) m[x.id] = v; else delete m[x.id]; setSt({ ...st, vymenene: m }); }}>
                <option value="">pôvodná</option>
                {x.alternativy!.map((a) => <option value={a}>{SUROVINA.get(a)?.nazov ?? a}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <h2>Postup</h2>
      <ol class="postup">{r.postup.map((p) => <li>{p}</li>)}</ol>
      <button class="hl" onClick={() => setVarenie(0)}>👨‍🍳 Režim varenia</button>
      {r.vybavenie.length > 0 && <p class="maly" style="margin-top:8px">Vybavenie: {r.vybavenie.join(', ')}</p>}
      {r.skladovanie && <p class="maly">Skladovanie: {r.skladovanie}</p>}
      {r.deti && <div class="upoz"><strong>Pre deti:</strong> {r.deti}</div>}

      {(podobne.length > 0 || lepsie.length > 0) && (
        <>
          <h2>Chuť na toto? Skús…</h2>
          {[...lepsie.map((x) => x!), ...podobne].slice(0, 3).map((i) => <KartaReceptu key={i.r.id} i={i} />)}
        </>
      )}

      <h2>Plán</h2>
      <div class="rad">
        {DNI.map((d, k) => <button class="male" key={d} onClick={() => pridajDo(k)}>{d.slice(0, 2)}</button>)}
      </div>
      <div class="rad">
        <button onClick={() => nastav((x) => { x.nakupRecepty = x.nakupRecepty.includes(id) ? x.nakupRecepty : [...x.nakupRecepty, id]; })}>🛒 Do nákupu{s.nakupRecepty.includes(id) ? ' ✓' : ''}</button>
        <button onClick={() => nastav((x) => { x.historia.push({ recept: id, den: dnesKluc() }); })}>✅ Uvarené ({s.historia.filter((h) => h.recept === id).length}×)</button>
      </div>
      <p class="maly">Skóre je odhad (heuristika); zdroje k faktorom nájdeš v „Ako sme to spočítali“. Nutričné údaje surovín sú typické hodnoty (odhad).</p>
      <Upozornenie />
    </>
  );
}

function Varenie({ postup, i, set, nazov }: { postup: string[]; i: number; set: (n: number | null) => void; nazov: string }) {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, []);
  return (
    <div class="varenie" role="dialog" aria-label={`Varenie: ${nazov}`}>
      <div class="horna"><strong>{nazov}</strong><button class="male" onClick={() => set(null)}>✕ Zavrieť</button></div>
      <div class="maly">Krok {i + 1} z {postup.length}</div>
      <div class="krok">{postup[i]}</div>
      <div class="rad" style="justify-content:space-between">
        <button disabled={i === 0} onClick={() => set(i - 1)} style="flex:1;min-height:60px">← Späť</button>
        {i < postup.length - 1 ? <button class="hl" onClick={() => set(i + 1)} style="flex:1;min-height:60px">Ďalej →</button> : <button class="hl" onClick={() => set(null)} style="flex:1;min-height:60px">Hotovo 🎉</button>}
      </div>
    </div>
  );
}
