import { useState } from 'preact/hooks';
import { RECEPT, SUROVINA } from '../ctx';
import { useStav, nastav } from '../store';
import { zostavNakup, ODDELENIA } from '../engine/nakup';
import { kolkoPorcii } from '../engine/filtre';
import { Hlavicka } from './kom';

export function Nakup() {
  const s = useStav();
  const [nova, setNova] = useState('');
  const recepty = s.nakupRecepty.map((id) => RECEPT.get(id)).filter(Boolean).map((r) => ({ r: r!, krat: 1 }));
  const por = kolkoPorcii(s.nastavenia);
  const sk = zostavNakup(recepty, por, SUROVINA, new Set(s.nastavenia.mamDoma));
  const text = () => Object.entries(sk).map(([o, p]) => `${ODDELENIA[o as keyof typeof ODDELENIA]}:\n` + p.map((x) => `- ${x.nazov} ${x.text}`).join('\n')).join('\n\n') + (s.nakupVlastne.length ? '\n\nĎalšie:\n' + s.nakupVlastne.map((x) => '- ' + x).join('\n') : '');
  const zdielaj = async () => {
    try { if (navigator.share) { await navigator.share({ title: 'Nákup', text: text() }); return; } } catch { /* zrušené */ }
    try { await navigator.clipboard.writeText(text()); alert('Skopírované'); } catch { alert(text()); }
  };
  const tog = (k: string) => nastav((x) => { x.nakupOdskrtnute = x.nakupOdskrtnute.includes(k) ? x.nakupOdskrtnute.filter((y) => y !== k) : [...x.nakupOdskrtnute, k]; });
  return (
    <>
      <Hlavicka nazov="Nákup" />
      <p class="maly">{recepty.length} receptov · prepočítané na {por} dospelých porcií · zásoby „mám doma“ (Nastavenia) sa odpočítavajú.</p>
      <div class="rad"><button onClick={zdielaj}>📤 Zdieľať / kopírovať</button><button onClick={() => nastav((x) => { x.nakupRecepty = []; x.nakupOdskrtnute = []; x.nakupVlastne = []; })}>Vyčistiť</button></div>
      {recepty.length > 0 && <details><summary style="min-height:44px;display:flex;align-items:center">Recepty v nákupe</summary>{recepty.map(({ r }) => <div class="slot" key={r.id}><span class="rozt">{r.nazov}</span><button class="male" aria-label={`Odobrať ${r.nazov}`} onClick={() => nastav((x) => { x.nakupRecepty = x.nakupRecepty.filter((y) => y !== r.id); })}>✕</button></div>)}</details>}
      {!recepty.length && !s.nakupVlastne.length && <p>Zoznam je prázdny. Pridaj recept tlačidlom „Do nákupu“ alebo vytvor <a href="#/jedalnicek">jedálniček</a>.</p>}
      {Object.entries(sk).map(([o, p]) => (
        <div class="karta" key={o}>
          <h3>{ODDELENIA[o as keyof typeof ODDELENIA]}</h3>
          {p.map((x) => (
            <div class={`nakup-pol ${s.nakupOdskrtnute.includes(x.id) ? 'hotovo' : ''}`} key={x.id}>
              <label><input type="checkbox" checked={s.nakupOdskrtnute.includes(x.id)} onChange={() => tog(x.id)} /><span>{x.nazov} – <strong>{x.text}</strong></span></label>
            </div>
          ))}
        </div>
      ))}
      <div class="karta">
        <h3>Vlastné položky</h3>
        {s.nakupVlastne.map((x, k) => (
          <div class={`nakup-pol ${s.nakupOdskrtnute.includes('v:' + x) ? 'hotovo' : ''}`} key={x + k}>
            <label><input type="checkbox" checked={s.nakupOdskrtnute.includes('v:' + x)} onChange={() => tog('v:' + x)} /><span>{x}</span></label>
            <button class="male" aria-label={`Odstrániť ${x}`} onClick={() => nastav((st) => { st.nakupVlastne = st.nakupVlastne.filter((_, j) => j !== k); })}>✕</button>
          </div>
        ))}
        <form class="rad" onSubmit={(e) => { e.preventDefault(); const t = nova.trim(); if (t) nastav((x) => { x.nakupVlastne.push(t); }); setNova(''); }}>
          <input type="text" aria-label="Nová položka" placeholder="Pridať položku…" value={nova} onInput={(e) => setNova((e.target as HTMLInputElement).value)} style="flex:1" />
          <button type="submit">Pridať</button>
        </form>
      </div>
    </>
  );
}
