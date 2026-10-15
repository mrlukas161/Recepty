import { useMemo, useState } from 'preact/hooks';
import { INFOS } from '../ctx';
import { SUROVINA } from '../data';
import { DIETY } from '../data/diety';
import { useStav } from '../store';
import { filtruj, FILTRE0, type FiltreRecept, type Zoradenie } from '../engine/filtre';
import { KartaReceptu, Hlavicka, AktivneDiety } from './kom';

let ulozeneFiltre: FiltreRecept = { ...FILTRE0 };

export function Recepty() {
  const s = useStav();
  const [f, setF] = useState<FiltreRecept>(ulozeneFiltre);
  const [ukaz, setUkaz] = useState(false);
  const [limit, setLimit] = useState(80);
  const zmen = (p: Partial<FiltreRecept>) => { ulozeneFiltre = { ...f, ...p }; setF(ulozeneFiltre); };
  const zoznam = useMemo(() => filtruj(INFOS, f, s.nastavenia, SUROVINA, s.oblubene), [JSON.stringify(f), JSON.stringify(s.nastavenia), s.oblubene.length]);
  return (
    <>
      <Hlavicka nazov="Recepty" vpravo={<span class="maly">{zoznam.length} z {INFOS.length}</span>} />
      <AktivneDiety />
      <input type="search" placeholder="Hľadať recept alebo surovinu…" aria-label="Hľadať" value={f.hladat} onInput={(e) => zmen({ hladat: (e.target as HTMLInputElement).value })} />
      <div class="rad">
        <button class="male" onClick={() => setUkaz(!ukaz)} aria-expanded={ukaz}>⚙ Filtre a zoradenie</button>
        <select aria-label="Zoradenie" value={f.zoradenie} onChange={(e) => zmen({ zoradenie: (e.target as HTMLSelectElement).value as Zoradenie })}>
          <option value="skore">Podľa skóre</option><option value="cas">Podľa času</option><option value="suroviny">Počet surovín</option><option value="oblubene">Obľúbené</option><option value="nahodne">Náhodne</option>
        </select>
      </div>
      {ukaz && (
        <div class="karta">
          <div class="rad">
            <select aria-label="Typ jedla" value={f.typ} onChange={(e) => zmen({ typ: (e.target as HTMLSelectElement).value })}>
              <option value="">Všetky jedlá</option><option value="ranajky">Raňajky</option><option value="obed">Obed</option><option value="vecera">Večera</option><option value="polievka">Polievky</option><option value="desiata">Desiaty</option><option value="dezert">Dezerty</option>
            </select>
            <select aria-label="Čas" value={f.maxCas} onChange={(e) => zmen({ maxCas: +(e.target as HTMLSelectElement).value })}>
              <option value="0">Akýkoľvek čas</option><option value="15">do 15 min</option><option value="30">do 30 min</option><option value="45">do 45 min</option><option value="60">do 60 min</option>
            </select>
            <select aria-label="Náročnosť" value={f.narocnost} onChange={(e) => zmen({ narocnost: +(e.target as HTMLSelectElement).value })}>
              <option value="0">Akákoľvek náročnosť</option><option value="1">Ľahké</option><option value="2">Stredné</option>
            </select>
            <select aria-label="Diéta" value={f.diety[0] ?? ''} onChange={(e) => { const v = (e.target as HTMLSelectElement).value; zmen({ diety: v ? [v] : [] }); }}>
              <option value="">Bez diéty</option>{DIETY.map((d) => <option value={d.id}>{d.nazov}</option>)}
            </select>
          </div>
          <label class="pol"><input type="checkbox" checked={f.detske} onChange={(e) => zmen({ detske: (e.target as HTMLInputElement).checked })} /> Detské</label>
          <label class="pol"><input type="checkbox" checked={f.bezVylucenych} onChange={(e) => zmen({ bezVylucenych: (e.target as HTMLInputElement).checked })} /> Bez vylúčených surovín a alergénov</label>
          <label class="pol"><input type="checkbox" checked={f.mamDoma} onChange={(e) => zmen({ mamDoma: (e.target as HTMLInputElement).checked })} /> Mám doma (nastav v Nastaveniach)</label>
          <button class="male" onClick={() => { ulozeneFiltre = { ...FILTRE0 }; setF(ulozeneFiltre); }}>Zrušiť filtre</button>
        </div>
      )}
      {zoznam.slice(0, limit).map((i) => <KartaReceptu key={i.r.id} i={i} />)}
      {zoznam.length > limit && <button onClick={() => setLimit(limit + 80)}>Zobraziť ďalších 80</button>}
      {!zoznam.length && <div><p>Nič sa nenašlo. Skús zrušiť filtre alebo vypnúť „Bez vylúčených surovín a alergénov“ (aktívne diéty a alergie tiež zužujú výber).</p><button onClick={() => { ulozeneFiltre = { ...FILTRE0 }; setF(ulozeneFiltre); }}>Zrušiť filtre</button></div>}
    </>
  );
}
