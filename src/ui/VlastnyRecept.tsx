import { useState } from 'preact/hooks';
import { SUROVINA } from '../ctx';
import { SUROVINY } from '../data';
import type { SurovinaVRecepte, Typ } from '../data/types';
import { useStav, nastav, ulozVlastny, zmazVlastny, duplikujVlastny } from '../store';
import {
  TYPY, TAGY_VLASTNE, noveId, istotaSkore, skoreVlastneho, navrhniSuroviny, rozborRiadku,
  exportVlastne, parseVlastne, zlucVlastne, type VlastnyRecept,
} from '../engine/vlastne';
import { TYP_NAZOV } from '../ctx';
import { Hlavicka, Pecat, Upozornenie } from './kom';

const JEDNOTKA_NAZOV: Record<SurovinaVRecepte['jednotka'], string> = { g: 'g', ml: 'ml', ks: 'ks', lyzica: 'PL (lyžica)', lyzicka: 'ČL (lyžička)' };
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface Riadok { id: string; mn: string; j: SurovinaVRecepte['jednotka'] }
interface Navrh {
  nazov: string; typ: Typ; cp: string; cv: string; porcie: string;
  sur: Riadok[]; volne: string[]; postup: string; tagy: string[];
}
const cisloZ = (t: string) => { const n = parseFloat(t.replace(',', '.')); return Number.isFinite(n) ? n : 0; };

function zNavrhu(d: Navrh, povodny?: VlastnyRecept): VlastnyRecept {
  const teraz = new Date().toISOString();
  return {
    id: povodny?.id ?? noveId(), nazov: d.nazov.trim(), typ: d.typ,
    casPripravy: Math.max(0, Math.round(cisloZ(d.cp))), casVarenia: Math.max(0, Math.round(cisloZ(d.cv))), porcie: Math.max(0.25, cisloZ(d.porcie) || 2),
    suroviny: d.sur.map((s) => ({ id: s.id, mnozstvo: Math.max(0, cisloZ(s.mn)), jednotka: s.j })),
    volne: d.volne.map((t) => t.trim()).filter(Boolean),
    postup: d.postup.split('\n').map((p) => p.trim()).filter(Boolean), tagy: d.tagy,
    vytvorene: povodny?.vytvorene ?? teraz, upravene: teraz,
  };
}
function naNavrh(v?: VlastnyRecept): Navrh {
  if (!v) return { nazov: '', typ: 'obed', cp: '15', cv: '20', porcie: '4', sur: [], volne: [], postup: '', tagy: [] };
  return {
    nazov: v.nazov, typ: v.typ, cp: String(v.casPripravy), cv: String(v.casVarenia), porcie: String(v.porcie),
    sur: v.suroviny.map((s) => ({ id: s.id, mn: s.mnozstvo > 0 ? String(s.mnozstvo) : '', j: s.jednotka })), volne: [...v.volne], postup: v.postup.join('\n'), tagy: [...v.tagy],
  };
}

/** Text o spoľahlivosti skóre vlastného receptu. */
export function IstotaSkore({ v }: { v: VlastnyRecept }) {
  const i = istotaSkore(v);
  return <p class={`upoz ${i.uroven === 'vysoka' ? '' : 'minus'}`} role="note" data-istota={i.uroven} style={i.uroven === 'vysoka' ? '' : 'color:var(--text)'}><strong>Istota skóre: {i.uroven === 'vysoka' ? 'vysoká' : i.uroven === 'stredna' ? 'stredná' : i.uroven === 'nizka' ? 'nízka' : 'žiadna'} (odhad).</strong> {i.text}</p>;
}

/** Ovládanie na detaile vlastného receptu (upraviť, duplikovať, zmazať) + istota skóre. */
export function OvladanieVlastneho({ id }: { id: string }) {
  const s = useStav();
  const v = s.vlastne.find((x) => x.id === id);
  if (!v) return null;
  return (
    <div class="karta">
      <span class="tag">vlastný recept</span>
      <IstotaSkore v={v} />
      <div class="rad">
        <a class="tlacidlo" href={`#/vlastny/${id}`} style="text-decoration:none;display:inline-flex;align-items:center">✏️ Upraviť</a>
        <button onClick={() => { const n = duplikujVlastny(id); if (n) location.hash = `#/vlastny/${n}`; }}>⧉ Duplikovať</button>
        <button onClick={() => { if (confirm(`Zmazať recept „${v.nazov}“? Odstráni sa aj z jedálnička a nákupu.`)) { zmazVlastny(id); location.hash = '#/recepty'; } }}>🗑 Zmazať</button>
      </div>
    </div>
  );
}

export function VlastnyReceptForm({ id }: { id?: string }) {
  const s = useStav();
  const povodny = id ? s.vlastne.find((x) => x.id === id) : undefined;
  const [d, setD] = useState<Navrh>(() => naNavrh(povodny));
  const [hladaj, setHladaj] = useState('');
  const [chyba, setChyba] = useState('');
  const zm = (p: Partial<Navrh>) => setD({ ...d, ...p });
  const v = zNavrhu(d, povodny);
  const ma = d.sur.length > 0 || d.volne.length > 0;
  const skore = ma && v.suroviny.some((x) => x.mnozstvo > 0) ? skoreVlastneho(v) : null;
  const q = norm(hladaj.trim());
  const nalezy = q.length < 2 ? [] : [...new Map([...navrhniSuroviny(hladaj, SUROVINA, 6), ...SUROVINY.filter((x) => norm(x.nazov).includes(q))].map((x) => [x.id, x])).values()].filter((x) => !d.sur.some((r) => r.id === x.id)).slice(0, 6);
  const pridajSur = (sid: string, mn = '', j: SurovinaVRecepte['jednotka'] = 'g') => zm({ sur: [...d.sur, { id: sid, mn, j }] });
  const uloz = (e: Event) => {
    e.preventDefault();
    if (!d.nazov.trim()) return setChyba('Doplň názov receptu.');
    if (!ma) return setChyba('Pridaj aspoň jednu surovinu (z databázy alebo voľným textom).');
    if (!v.postup.length) return setChyba('Napíš aspoň jeden krok postupu.');
    ulozVlastny(v);
    location.hash = `#/recept/${v.id}`;
  };
  return (
    <form onSubmit={uloz} noValidate>
      <a href={povodny ? `#/recept/${povodny.id}` : '#/recepty'} class="maly">← Späť</a>
      <Hlavicka nazov={povodny ? 'Upraviť recept' : 'Nový vlastný recept'} />
      <div class="karta">
        <label for="vr-nazov"><strong>Názov</strong></label>
        <input id="vr-nazov" type="text" aria-label="Názov receptu" maxLength={120} value={d.nazov} onInput={(e) => zm({ nazov: (e.target as HTMLInputElement).value })} />
        <div class="rad">
          <label>Typ jedla<br /><select aria-label="Typ jedla" value={d.typ} onChange={(e) => zm({ typ: (e.target as HTMLSelectElement).value as Typ })}>{TYPY.map((t) => <option value={t}>{TYP_NAZOV[t]}</option>)}</select></label>
          <label>Porcie (dospelí)<br /><input type="number" inputMode="decimal" aria-label="Porcie" min="0.5" step="0.5" style="width:110px" value={d.porcie} onInput={(e) => zm({ porcie: (e.target as HTMLInputElement).value })} /></label>
        </div>
        <div class="rad">
          <label>Príprava (min)<br /><input type="number" inputMode="numeric" aria-label="Čas prípravy" min="0" style="width:120px" value={d.cp} onInput={(e) => zm({ cp: (e.target as HTMLInputElement).value })} /></label>
          <label>Varenie (min)<br /><input type="number" inputMode="numeric" aria-label="Čas varenia" min="0" style="width:120px" value={d.cv} onInput={(e) => zm({ cv: (e.target as HTMLInputElement).value })} /></label>
        </div>
      </div>

      <h2>Suroviny</h2>
      <div class="karta">
        <p class="maly" style="margin-top:0">Množstvo je na celý recept (pre uvedený počet porcií). Suroviny z databázy sa započítajú do skóre; voľný text alebo surovina bez množstva skóre len zneistia.</p>
        {d.sur.map((r, k) => {
          const sv = SUROVINA.get(r.id);
          return (
            <div class="slot" key={r.id + k} style="flex-wrap:wrap;padding:6px 0">
              <div class="rozt" style="min-width:100%"><strong>{sv?.nazov ?? r.id}</strong>{!(cisloZ(r.mn) > 0) && <span class="tag war" style="margin-left:6px">bez množstva</span>}</div>
              <input type="number" inputMode="decimal" aria-label={`Množstvo ${sv?.nazov}`} placeholder="množstvo" min="0" step="any" style="width:110px" value={r.mn} onInput={(e) => zm({ sur: d.sur.map((x, i) => i === k ? { ...x, mn: (e.target as HTMLInputElement).value } : x) })} />
              <select aria-label={`Jednotka ${sv?.nazov}`} value={r.j} onChange={(e) => zm({ sur: d.sur.map((x, i) => i === k ? { ...x, j: (e.target as HTMLSelectElement).value as SurovinaVRecepte['jednotka'] } : x) })}>
                {(Object.keys(JEDNOTKA_NAZOV) as SurovinaVRecepte['jednotka'][]).map((j) => <option value={j}>{JEDNOTKA_NAZOV[j]}</option>)}
              </select>
              <button type="button" class="male" aria-label={`Odstrániť ${sv?.nazov}`} onClick={() => zm({ sur: d.sur.filter((_, i) => i !== k) })}>✕</button>
            </div>
          );
        })}
        {d.volne.map((t, k) => {
          const nav = navrhniSuroviny(t, SUROVINA, 3).filter((x) => !d.sur.some((r) => r.id === x.id));
          return (
            <div class="slot" key={'v' + k} style="flex-wrap:wrap;padding:6px 0">
              <span class="tag">voľný text</span>
              <input type="text" aria-label={`Voľný text suroviny ${k + 1}`} style="flex:1;min-width:140px" value={t} onInput={(e) => zm({ volne: d.volne.map((x, i) => i === k ? (e.target as HTMLInputElement).value : x) })} />
              <button type="button" class="male" aria-label={`Odstrániť voľný text ${t}`} onClick={() => zm({ volne: d.volne.filter((_, i) => i !== k) })}>✕</button>
              {nav.length > 0 && (
                <div class="rozt" style="min-width:100%"><span class="maly">Návrh (odhad podľa názvu): </span>
                  {nav.map((x) => <button type="button" class="male" onClick={() => { const rr = rozborRiadku(t); zm({ volne: d.volne.filter((_, i) => i !== k), sur: [...d.sur, { id: x.id, mn: rr.mnozstvo ? String(Math.round(rr.mnozstvo * 100) / 100) : '', j: rr.jednotka ?? 'g' }] }); }}>Priradiť: {x.nazov}</button>)}
                </div>
              )}
            </div>
          );
        })}
        <label for="vr-hladaj"><strong>Pridať surovinu</strong></label>
        <input id="vr-hladaj" type="search" aria-label="Hľadať surovinu" placeholder="napr. paradajky, olivový olej…" value={hladaj} onInput={(e) => setHladaj((e.target as HTMLInputElement).value)} />
        <div class="rad">
          {nalezy.map((x) => <button type="button" onClick={() => { const rr = rozborRiadku(hladaj); pridajSur(x.id, rr.mnozstvo ? String(Math.round(rr.mnozstvo * 100) / 100) : '', rr.jednotka ?? 'g'); setHladaj(''); }}>+ {x.nazov}</button>)}
          {hladaj.trim().length >= 2 && <button type="button" onClick={() => { zm({ volne: [...d.volne, hladaj.trim()] }); setHladaj(''); }}>+ Pridať ako voľný text: „{hladaj.trim()}“</button>}
        </div>
        {q.length >= 2 && !nalezy.length && <p class="maly">V databáze sme nič nenašli – pridaj to ako voľný text.</p>}
      </div>

      <h2>Postup</h2>
      <textarea aria-label="Postup" rows={6} style="width:100%" placeholder="Každý krok na nový riadok" value={d.postup} onInput={(e) => zm({ postup: (e.target as HTMLTextAreaElement).value })} />

      <h2>Tagy</h2>
      <div class="zalozky">
        {TAGY_VLASTNE.map((t) => <button type="button" key={t.id} aria-pressed={d.tagy.includes(t.id)} onClick={() => zm({ tagy: d.tagy.includes(t.id) ? d.tagy.filter((x) => x !== t.id) : [...d.tagy, t.id] })}>{t.nazov}</button>)}
      </div>

      <h2>Skóre (náhľad)</h2>
      <div class="karta">
        {skore ? <div class="riadok"><Pecat skore={skore.celkom} pasmo={skore.pasmo} /><div class="rozt"><strong>{skore.pasmoText}</strong> <span class="maly">(naša heuristika)</span></div></div> : <p class="maly" style="margin:0">Skóre sa ukáže, keď pridáš aspoň jednu surovinu z databázy s množstvom.</p>}
        {ma && <IstotaSkore v={v} />}
      </div>
      {chyba && <p class="upoz minus" role="alert" style="color:var(--text)">{chyba}</p>}
      <div class="rad">
        <button type="submit" class="hl" style="flex:1;min-height:56px;font-size:1.1rem">Uložiť recept</button>
        <a class="tlacidlo" href={povodny ? `#/recept/${povodny.id}` : '#/recepty'} style="text-decoration:none;display:inline-flex;align-items:center;min-height:56px">Zrušiť</a>
      </div>
      <Upozornenie />
    </form>
  );
}

/** Zoznam vlastných receptov + export/import JSON. */
export function MojeRecepty() {
  const s = useStav();
  const [text, setText] = useState('');
  const [sprava, setSprava] = useState<{ ok: boolean; t: string; chyby: string[] } | null>(null);
  const json = exportVlastne(s.vlastne);
  const stiahni = () => {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      a.download = `vlastne-recepty-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch { /* bez stiahnutia – JSON je v poli nižšie */ }
  };
  const importuj = (t: string) => {
    const r = parseVlastne(t);
    if (!r.ok) { setSprava({ ok: false, t: 'Import sa nepodaril, nič sa nezmenilo.', chyby: r.chyby }); return; }
    const z = zlucVlastne(s.vlastne, r.recepty);
    nastav((x) => { x.vlastne = z.recepty; });
    setSprava({ ok: true, t: `Import hotový: pridané ${z.pridane}, aktualizované ${z.aktualizovane}, bez zmeny ${z.nezmenene}${r.chyby.length ? `, preskočené ${r.chyby.length}` : ''}.`, chyby: r.chyby });
    setText('');
  };
  const zSuboru = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
    try { importuj(await f.text()); } catch { setSprava({ ok: false, t: 'Súbor sa nepodarilo prečítať.', chyby: [] }); }
    (e.target as HTMLInputElement).value = '';
  };
  return (
    <>
      <a href="#/recepty" class="maly">← Recepty</a>
      <Hlavicka nazov="Moje recepty" />
      <div class="rad"><a class="tlacidlo hl" href="#/vlastny" style="text-decoration:none;display:inline-flex;align-items:center;min-height:52px">+ Vlastný recept</a></div>
      {!s.vlastne.length && <p>Zatiaľ nemáš žiadny vlastný recept.</p>}
      {s.vlastne.map((v) => {
        const sk = skoreVlastneho(v);
        return <a class="karta" key={v.id} href={`#/recept/${v.id}`}><div class="riadok"><div class="rozt"><h3 style="margin:0">{v.nazov}</h3><div class="maly">{TYP_NAZOV[v.typ]} · {v.casPripravy + v.casVarenia} min</div></div><Pecat skore={sk.celkom} pasmo={sk.pasmo} /></div></a>;
      })}
      <h2>Export a import</h2>
      <p class="maly">Exportujú sa len vlastné recepty (súbor JSON s verziou formátu). Import ich pridá k existujúcim; pri rovnakom recepte vyhrá novšia úprava. Chybný súbor nič nezmení.</p>
      <div class="rad"><button onClick={stiahni} disabled={!s.vlastne.length}>⬇ Stiahnuť export</button></div>
      <textarea aria-label="Export JSON" readOnly rows={4} style="width:100%;font-size:.8rem" value={s.vlastne.length ? json : ''} />
      <h3>Import</h3>
      <label class="tlacidlo" style="display:inline-flex;align-items:center">⬆ Vybrať súbor<input type="file" accept="application/json,.json" aria-label="Súbor na import" style="display:none" onChange={zSuboru} /></label>
      <textarea aria-label="Import JSON" rows={4} style="width:100%;font-size:.8rem;margin-top:8px" placeholder="…alebo sem vlož obsah exportu" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} />
      <div class="rad"><button class="hl" disabled={!text.trim()} onClick={() => importuj(text)}>Importovať</button></div>
      {sprava && <div class="upoz" role="status" style={sprava.ok ? '' : 'border-left-color:var(--zle)'}>{sprava.t}{sprava.chyby.length > 0 && <ul>{sprava.chyby.slice(0, 8).map((c) => <li>{c}</li>)}</ul>}</div>}
      <Upozornenie />
    </>
  );
}
