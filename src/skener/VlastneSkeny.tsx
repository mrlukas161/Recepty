/** Zoznam vlastných skenov (zloženie uložené pod čiarovým kódom) s mazaním – v histórii potravín aj kozmetiky. */
import { useState } from 'preact/hooks';
import { oznacenieVlastneho, type UlozisteVlastnych, type VlastnySken } from './vlastne-skeny';

export function VlastneSkenyZoznam({ uloziste, otvor, zmena }: { uloziste: UlozisteVlastnych; otvor: (v: VlastnySken) => void; zmena?: () => void }) {
  const [zoznam, setZoznam] = useState(() => uloziste.nacitaj());
  if (!zoznam.length) return null;
  return (
    <section aria-label="Vlastné skeny" class="vlastne-skeny">
      <h3>Moje vlastné skeny ({zoznam.length})</h3>
      <p class="maly">Zloženie, ktoré si uložil k čiarovému kódu. Majú prednosť pred databázou a nájdu sa aj bez internetu.</p>
      {zoznam.map((v) => (
        <div class="karta" key={v.kod} style="animation:none">
          <h3 style="margin:0">{v.nazov}</h3>
          <div class="maly">{oznacenieVlastneho(v.ulozene)} · kód {v.kod}</div>
          <div class="rad">
            <button class="male" onClick={() => otvor(v)}>Otvoriť</button>
            <button class="male" onClick={() => { uloziste.zmaz(v.kod); setZoznam(uloziste.nacitaj()); zmena?.(); }}>Zmazať vlastný sken</button>
          </div>
        </div>
      ))}
    </section>
  );
}
