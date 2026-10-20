import { useMemo, useState } from 'preact/hooks';
import { INFOS, vlastnaVerzia } from '../ctx';
import { SUROVINA } from '../data';
import { DIETY } from '../data/diety';
import { useStav } from '../store';
import { filtruj, FILTRE0, type FiltreRecept, type Zoradenie } from '../engine/filtre';
import { KartaReceptu, Hlavicka, AktivneDiety, Cipy, VerziaBezMuky } from './kom';

let ulozeneFiltre: FiltreRecept = { ...FILTRE0 };

export function Recepty() {
  const s = useStav();
  const [f, setF] = useState<FiltreRecept>(ulozeneFiltre);
  const [ukaz, setUkaz] = useState(false);
  const [limit, setLimit] = useState(80);
  const zmen = (p: Partial<FiltreRecept>) => { ulozeneFiltre = { ...f, ...p }; setF(ulozeneFiltre); };
  const zoznam = useMemo(() => filtruj(INFOS, f, s.nastavenia, SUROVINA, s.oblubene), [JSON.stringify(f), JSON.stringify(s.nastavenia), s.oblubene.length, vlastnaVerzia()]);
  return (
    <>
      <Hlavicka nazov="Recepty" vpravo={<span class="maly">{zoznam.length} z {INFOS.length}</span>} />
      <AktivneDiety />
      <div class="rad">
        <a class="tlacidlo hl" href="#/vlastny" style="text-decoration:none;display:inline-flex;align-items:center">+ Vlastný recept</a>
        {s.vlastne.length > 0 && <a class="tlacidlo" href="#/moje" style="text-decoration:none;display:inline-flex;align-items:center">Moje recepty ({s.vlastne.length}) · export</a>}
      </div>
      <input type="search" placeholder="Hľadať recept alebo surovinu…" aria-label="Hľadať" value={f.hladat} onInput={(e) => zmen({ hladat: (e.target as HTMLInputElement).value })} />
      <div class="rad">
        <button class="male" onClick={() => setUkaz(!ukaz)} aria-expanded={ukaz}>⚙ Filtre a zoradenie</button>
        <Cipy popis="Zoradenie" vybrane={f.zoradenie} zmen={(v) => zmen({ zoradenie: v })} hodnoty={[{ id: 'skore', nazov: 'Podľa skóre' }, { id: 'cas', nazov: 'Podľa času' }, { id: 'suroviny', nazov: 'Počet surovín' }, { id: 'oblubene', nazov: 'Obľúbené' }, { id: 'nahodne', nazov: 'Náhodne' }] as { id: Zoradenie; nazov: string }[]} />
      </div>
      {ukaz && (
        <div class="karta">
          <h3>Jedlo</h3>
          <Cipy popis="Typ jedla" vybrane={f.typ} zmen={(v) => zmen({ typ: v })} hodnoty={[{ id: '', nazov: 'Všetky' }, { id: 'ranajky', nazov: 'Raňajky' }, { id: 'desiata', nazov: 'Desiata' }, { id: 'obed', nazov: 'Obed' }, { id: 'olovrant', nazov: 'Olovrant' }, { id: 'vecera', nazov: 'Večera' }, { id: 'polievka', nazov: 'Polievky' }, { id: 'dezert', nazov: 'Dezerty' }]} />
          <h3>Čas</h3>
          <Cipy popis="Čas" vybrane={f.maxCas} zmen={(v) => zmen({ maxCas: v })} hodnoty={[{ id: 0, nazov: 'Akýkoľvek' }, { id: 15, nazov: 'do 15 min' }, { id: 30, nazov: 'do 30 min' }, { id: 45, nazov: 'do 45 min' }, { id: 60, nazov: 'do 60 min' }]} />
          <h3>Náročnosť</h3>
          <Cipy popis="Náročnosť" vybrane={f.narocnost} zmen={(v) => zmen({ narocnost: v })} hodnoty={[{ id: 0, nazov: 'Akákoľvek' }, { id: 1, nazov: 'Ľahké' }, { id: 2, nazov: 'Stredné' }]} />
          <h3>Diéta</h3>
          <Cipy popis="Diéta" vybrane={f.diety[0] ?? ''} zmen={(v) => zmen({ diety: v ? [v] : [] })} hodnoty={[{ id: '', nazov: 'Bez diéty' }, ...DIETY.map((d) => ({ id: d.id, nazov: d.nazov }))]} />
          <label class="pol"><input type="checkbox" checked={f.detske} onChange={(e) => zmen({ detske: (e.target as HTMLInputElement).checked })} /> Detské</label>
          <label class="pol"><input type="checkbox" checked={f.bezVylucenych} onChange={(e) => zmen({ bezVylucenych: (e.target as HTMLInputElement).checked })} /> Bez vylúčených surovín a alergénov</label>
          <label class="pol"><input type="checkbox" checked={f.mamDoma} onChange={(e) => zmen({ mamDoma: (e.target as HTMLInputElement).checked })} /> Mám doma (nastav v Nastaveniach)</label>
          <button class="male" onClick={() => { ulozeneFiltre = { ...FILTRE0 }; setF(ulozeneFiltre); }}>Zrušiť filtre</button>
        </div>
      )}
      {zoznam.slice(0, limit).map((i) => <div key={i.r.id}><KartaReceptu i={i} /><VerziaBezMuky i={i} /></div>)}
      {zoznam.length > limit && <button onClick={() => setLimit(limit + 80)}>Zobraziť ďalších 80</button>}
      {!zoznam.length && <div><p>Nič sa nenašlo. Skús zrušiť filtre alebo vypnúť „Bez vylúčených surovín a alergénov“ (aktívne diéty a alergie tiež zužujú výber).</p><button onClick={() => { ulozeneFiltre = { ...FILTRE0 }; setF(ulozeneFiltre); }}>Zrušiť filtre</button></div>}
    </>
  );
}
