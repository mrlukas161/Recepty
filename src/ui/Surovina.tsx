import { useMemo, useState } from 'preact/hooks';
import { SUROVINA, SUROVINY } from '../data';
import type { Surovina } from '../data/types';
import { RECEPTY } from '../ctx';
import { KARTY_SUROVIN, VERDIKT_TEXT } from '../data/karty-surovin';
import { slabaSurovina, dovodyAuto } from '../engine/slabe';
import { cislo } from '../engine/score';
import { bezDiakritiky } from '../engine/filtre';
import { ZDROJE, ZDROJ, zdrojePre } from '../data/zdroje';
import { ZdrojKarta } from './Zdroje';
import { Hlavicka, Upozornenie } from './kom';

const UROVEN_TEXT = { tabulka: 'z výživových tabuliek a zloženia', prax: 'kuchárska prax, nie dôkaz', odhad: 'naše zhodnotenie (odhad)' } as const;
const zdrojTabulky = (z: string) => z.startsWith('ciqual:') ? `Ciqual 2025, kód ${z.slice(7)}` : z.startsWith('fdc:') ? `USDA FoodData Central, ID ${z.slice(4)}` : 'typická hodnota (odhad)';

export function NahradaChip({ id }: { id: string }) {
  const s = SUROVINA.get(id);
  return s ? <a class="chip nahrada-chip" href={`#/surovina/${id}`} style="text-decoration:none;color:inherit">{s.nazov}</a> : null;
}

/** Krátky riadok pri surovine v recepte: dôvod + hneď náhrada (ťuk = karta suroviny). */
export function SlabaPoznamka({ id }: { id: string }) {
  const s = SUROVINA.get(id);
  const w = s && slabaSurovina(s);
  if (!s || !w) return null;
  const nahr = w.nahrady.filter((x) => SUROVINA.has(x)).slice(0, 3);
  return (
    <div class="slaba maly" data-slaba={id}>
      <a href={`#/surovina/${id}`} style="color:var(--zle)">{w.dovod}</a>{' '}
      {nahr.length > 0 && <>Lepšie: {nahr.map((n, k) => <span key={n}>{k ? ', ' : ''}<a href={`#/surovina/${n}`}>{SUROVINA.get(n)!.nazov}</a></span>)}</>}
    </div>
  );
}

export function SurovinaKarta({ id }: { id: string }) {
  const s = SUROVINA.get(id);
  if (!s) return <p>Surovina sa nenašla. <a href="#/suroviny">Späť na suroviny</a></p>;
  const k = KARTY_SUROVIN[id];
  const w = slabaSurovina(s);
  const base = SUROVINA.get('psenicna-muka-hladka')!;
  const nahrady = (k?.nahrady ?? w?.nahrady ?? []).filter((x) => SUROVINA.has(x));
  const pouzite = useMemo(() => RECEPTY.filter((r) => r.suroviny.some((x) => x.id === id)), [id]);
  const zdroje = useMemo(() => {
    const m = new Map<string, (typeof ZDROJE)[number]>();
    for (const z of k?.zdroje ?? []) { const x = ZDROJ.get(z); if (x) m.set(x.id, x); }
    for (const t of k?.temy ?? []) for (const x of zdrojePre('karty', t)) m.set(x.id, x);
    return [...m.values()];
  }, [id]);
  const rad = (nz: string, a: Surovina) => <tr><td>{nz}</td><td>{Math.round(a.na100.kcal)}</td><td>{cislo(a.na100.bielk)}</td><td>{cislo(a.na100.sach)}</td><td>{cislo(a.na100.vlak)}</td></tr>;
  return (
    <>
      <a href="#/suroviny" class="maly">← Suroviny</a>
      <h1>{s.nazov}</h1>
      {k && <p><span class={`tag ${k.verdikt === 'lepsie' ? '' : 'war'}`} data-verdikt={k.verdikt}><strong>{VERDIKT_TEXT[k.verdikt]}</strong></span> <span class="tag">úroveň: {UROVEN_TEXT[k.uroven]}</span></p>}
      {k ? <p style="font-size:1.05rem">{k.kratko}</p> : w ? <p class="minus">{w.dovod}</p> : null}
      <div class="karta" style="animation:none">
        <h3>Prečo áno alebo nie</h3>
        <ul>{(k ? k.preco : []).map((x) => <li key={x}>{x}</li>)}{dovodyAuto(s).map((x) => <li key={x} class="maly" style="color:var(--text)">{x}</li>)}</ul>
        <p class="maly">Podľa príznakov v databáze surovín – naše zaradenie (odhad), ak nie je uvedený zdroj.</p>
      </div>
      {k && (
        <>
          <div class="karta" style="animation:none"><h3>Kedy áno</h3><ul>{k.kedyAno.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div class="karta" style="animation:none"><h3>Kedy nie</h3><ul>{k.kedyNie.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </>
      )}
      {nahrady.length > 0 && <><h2>Čím nahradiť</h2><div class="cipy">{nahrady.map((n) => <NahradaChip key={n} id={n} />)}</div></>}
      <h2>Výživa na 100 g</h2>
      <table class="tabulka"><thead><tr><th></th><th>kcal</th><th>bielk. g</th><th>sach. g</th><th>vláknina g</th></tr></thead>
        <tbody>{rad(s.nazov, s)}{id !== base.id && rad('Biela múka hladká', base)}</tbody></table>
      <p class="maly">Zdroj hodnôt: {s.odhad ? 'typická hodnota (odhad)' : zdrojTabulky(s.zdrojNutr)}{s.priblizne ? ' – približné' : ''}. Biela múka: {base.odhad ? 'odhad' : zdrojTabulky(base.zdrojNutr)}. Sacharidy sú bez vlákniny.{s.poznamkaNutr ? ` ${s.poznamkaNutr}.` : ''}</p>
      <h2>Zdroje</h2>
      {zdroje.length ? zdroje.map((z) => <ZdrojKarta key={z.id} z={z} />) : <p class="maly">K tomuto tvrdeniu nemáme štúdiu – ide o výživové tabuľky, zloženie alebo kuchársku prax ({k ? UROVEN_TEXT[k.uroven] : 'odhad'}).</p>}
      {pouzite.length > 0 && <><h2>Recepty s touto surovinou ({pouzite.length})</h2><ul>{pouzite.slice(0, 8).map((r) => <li key={r.id}><a href={`#/recept/${r.id}`} style="display:inline-block;padding:8px 0">{r.nazov}</a></li>)}</ul></>}
      <Upozornenie />
    </>
  );
}

export function Suroviny() {
  const [q, setQ] = useState('');
  const hl = bezDiakritiky(q.trim());
  const najdene = hl.length > 1 ? SUROVINY.filter((x) => bezDiakritiky(x.nazov).includes(hl)).slice(0, 30) : [];
  const skupiny: [string, string, (a: string) => boolean][] = [
    ['Lepšie než biela múka', 'Celé zrná, bezlepkové a strukovinové múky a prílohy.', (v) => KARTY_SUROVIN[v].verdikt === 'lepsie'],
    ['Nie je zlepšenie (pozor na marketing)', 'Tapioka, škroby, kuskus, bulgur, biele pečivo a cestoviny.', (v) => KARTY_SUROVIN[v].verdikt === 'podobne' || KARTY_SUROVIN[v].verdikt === 'horsie'],
    ['Iná úloha než múka', 'Chia, psyllium, tofu, tempeh.', (v) => KARTY_SUROVIN[v].verdikt === 'ina-uloha'],
  ];
  return (
    <>
      <Hlavicka nazov="Suroviny" />
      <p>Ťukni na surovinu: prečo áno alebo nie, čím nahradiť a zdroje. Hlavný smer appky je <strong>menej múky</strong>.</p>
      <input type="search" aria-label="Hľadať surovinu" placeholder="Hľadať surovinu…" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
      {najdene.length > 0 && <div class="cipy" style="margin-top:8px">{najdene.map((x) => <NahradaChip key={x.id} id={x.id} />)}</div>}
      {skupiny.map(([nz, pop, f]) => (
        <section key={nz} data-skupina={nz}>
          <h2>{nz}</h2><p class="maly">{pop}</p>
          <div class="cipy">{Object.keys(KARTY_SUROVIN).filter(f).map((v) => <NahradaChip key={v} id={v} />)}</div>
        </section>
      ))}
    </>
  );
}
