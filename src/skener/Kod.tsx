import { useState } from 'preact/hooks';
import { nacitajOff, platnyKod, offPridatUrl, type OffVyrobok } from './off';
import { KodPanel } from './KodPanel';
import { PridatDoDb } from './PridatDoDb';

export interface KodSken { kod: string; vyrobok: OffVyrobok | null }

/** `naVyrobok` – výrobok sa našiel; `naKod` – kód sa načítal (aj keď výrobok nie je v databáze, aby sa zloženie dalo uložiť pod kód). */
export function Kod({ naVyrobok, naKod }: { naVyrobok: (v: OffVyrobok) => void; naKod: (s: KodSken) => void }) {
  const [stav, setStav] = useState('');
  const [chyba, setChyba] = useState('');
  const [bezi, setBezi] = useState(false);
  const [pridat, setPridat] = useState('');

  const hladaj = async (k: string) => {
    setChyba(''); setStav(''); setPridat('');
    if (!platnyKod(k)) { setChyba('Kód nie je platný (EAN-13, EAN-8 alebo UPC). Skontroluj čísla pod čiarovým kódom.'); return; }
    setBezi(true); setStav('Hľadám výrobok…');
    try {
      const v = await nacitajOff(k);
      naKod({ kod: k, vyrobok: v });
      if (!v) { setChyba('Výrobok sa nenašiel (ani v tvojich skenoch, ani v balíku, ani v Open Food Facts). Odfoť alebo vpíš zloženie a ulož si ho pod tento kód.'); setPridat(k); }
      else if (!v.zlozenie) { setChyba('Výrobok sa našiel, ale nemá zadané zloženie. Odfoť alebo vpíš zloženie z obalu – môžeš si ho uložiť pod tento kód.'); setPridat(k); naVyrobok(v); }
      else { setStav(''); naVyrobok(v); }
    } catch {
      naKod({ kod: k, vyrobok: null });
      setChyba('Nepodarilo sa spojiť s Open Food Facts (bez internetu?) a výrobok nemáme uložený v mobile. Odfoť alebo vpíš zloženie – to funguje aj offline a môžeš si ho uložiť pod tento kód.');
      setPridat(k);
    } finally { setBezi(false); setStav(''); }
  };

  return (
    <KodPanel pred="sk" ariaKod="Čiarový kód (čísla)" placeholder="napr. 5900000000000" bezi={bezi} stav={stav} chyba={chyba} naKod={hladaj}
      popis="Najprv hľadáme medzi tvojimi vlastnými skenmi, potom v balíku slovenských výrobkov a (keď máš internet) v Open Food Facts. Nájdené výrobky sa uložia v mobile a nájdu sa aj bez internetu. Bez nálezu odfoť zloženie a ulož si ho pod kód."
    >
      {pridat && <PridatDoDb id="sk-pridat-off" href={offPridatUrl(pridat)} nazov="Open Food Facts" />}
    </KodPanel>
  );
}
