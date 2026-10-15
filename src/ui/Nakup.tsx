import { useState } from 'preact/hooks';
import { RECEPT, SUROVINA } from '../ctx';
import { useStav, nastav } from '../store';
import { zostavNakup, zoskupRecepty, ODDELENIA, SKONTROLUJ, SKONTROLUJ_NAZOV } from '../engine/nakup';
import { POZNAMKA_BALENI } from '../engine/baleni';
import { nazovPreDomacnost } from '../engine/obmedzene';
import { kolkoPorcii } from '../engine/filtre';
import { Hlavicka } from './kom';

export function Nakup() {
  const s = useStav();
  const [nova, setNova] = useState('');
  const recepty = zoskupRecepty(s.nakupRecepty, (id) => RECEPT.get(id));
  const volne = [...new Set(recepty.flatMap(({ r }) => r.volne ?? []))];
  const por = kolkoPorcii(s.nastavenia);
  const sk = zostavNakup(recepty, por, SUROVINA, new Set(s.nastavenia.mamDoma), { pridane: s.pridaneVolitelne });
  const nazovO = (o: string) => (o === SKONTROLUJ ? SKONTROLUJ_NAZOV : ODDELENIA[o as keyof typeof ODDELENIA]);
  const skupiny = Object.entries(sk).sort(([a], [b]) => (a === SKONTROLUJ ? 1 : 0) - (b === SKONTROLUJ ? 1 : 0));
  const text = () => skupiny.map(([o, p]) => `${nazovO(o)}:\n` + p.map((x) => `- ${x.nazov}${x.text ? ' ' + x.text : ''}${x.potreba ? ` (${x.potreba})` : ''}`).join('\n')).join('\n\n') + (volne.length ? '\n\nZ vlastných receptov (bez presného množstva):\n' + volne.map((x) => '- ' + x).join('\n') : '') + (s.nakupVlastne.length ? '\n\nĎalšie:\n' + s.nakupVlastne.map((x) => '- ' + x).join('\n') : '');
  const zdielaj = async () => {
    try { if (navigator.share) { await navigator.share({ title: 'Nákup', text: text() }); return; } } catch { /* zrušené */ }
    try { await navigator.clipboard.writeText(text()); alert('Skopírované'); } catch { alert(text()); }
  };
  const tog = (k: string) => nastav((x) => { x.nakupOdskrtnute = x.nakupOdskrtnute.includes(k) ? x.nakupOdskrtnute.filter((y) => y !== k) : [...x.nakupOdskrtnute, k]; });
  return (
    <>
      <Hlavicka nazov="Nákup" />
      {recepty.length > 0 && <p class="maly">{recepty.reduce((a, x) => a + x.krat, 0)} jedál · prepočítané na {por} dospelých porcií · zásoby „mám doma“ (Nastavenia) sa odpočítavajú. Množstvá sú zaokrúhlené na bežné balenia. {POZNAMKA_BALENI} Voda sa nenakupuje.</p>}
      <div class="rad"><button onClick={zdielaj}>📤 Zdieľať / kopírovať</button><button onClick={() => nastav((x) => { x.nakupRecepty = []; x.nakupOdskrtnute = []; x.nakupVlastne = []; })}>Vyčistiť</button></div>
      {recepty.length > 0 && <details><summary style="min-height:44px;display:flex;align-items:center">Recepty v nákupe</summary>{recepty.map(({ r, krat }) => <div class="slot" key={r.id}><span class="rozt">{nazovPreDomacnost(r, s.nastavenia, SUROVINA, s.pridaneVolitelne[r.id])}{krat > 1 ? ` (${krat}×, varené naraz)` : ''}</span><button class="male" aria-label={`Odobrať ${r.nazov}`} onClick={() => nastav((x) => { x.nakupRecepty = x.nakupRecepty.filter((y) => y !== r.id); })}>✕</button></div>)}</details>}
      {!recepty.length && !s.nakupVlastne.length && <p>Zoznam je prázdny. Pridaj recept tlačidlom „Do nákupu“ alebo vytvor <a href="#/jedalnicek">jedálniček</a>.</p>}
      {skupiny.map(([o, p]) => (
        <div class="karta" key={o}>
          <h3>{nazovO(o)}</h3>
          {o === SKONTROLUJ && <p class="maly" style="margin-top:0">Soľ, koreniny a drobnosti (pod ~10 g): zvyčajne ich máš. Zaškrtni, čo treba dokúpiť.</p>}
          {p.map((x) => (
            <div class={`nakup-pol ${s.nakupOdskrtnute.includes(x.id) ? 'hotovo' : ''}`} key={x.id}>
              <label><input type="checkbox" checked={s.nakupOdskrtnute.includes(x.id)} onChange={() => tog(x.id)} /><span>{x.nazov}{x.text && <> – <strong>{x.text}</strong></>}{x.potreba && <span class="maly"> ({x.potreba})</span>}</span></label>
            </div>
          ))}
        </div>
      ))}
      {volne.length > 0 && (
        <div class="karta">
          <h3>Z vlastných receptov</h3>
          <p class="maly" style="margin-top:0">Suroviny zapísané voľným textom (nepočítame ich do množstiev).</p>
          {volne.map((x) => (
            <div class={`nakup-pol ${s.nakupOdskrtnute.includes('f:' + x) ? 'hotovo' : ''}`} key={x}>
              <label><input type="checkbox" checked={s.nakupOdskrtnute.includes('f:' + x)} onChange={() => tog('f:' + x)} /><span>{x}</span></label>
            </div>
          ))}
        </div>
      )}
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
