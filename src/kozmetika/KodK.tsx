import { useState } from 'preact/hooks';
import { nacitajObf, platnyKod, obfPridatUrl } from './obf';
import { KodPanel } from '../skener/KodPanel';
import { PridatDoDb } from '../skener/PridatDoDb';
import type { VyrobokObf } from './ulozisko';

export interface KodSkenK { kod: string; vyrobok: VyrobokObf | null }

export function KodK({ naVyrobok, naKod }: { naVyrobok: (v: VyrobokObf) => void; naKod: (s: KodSkenK) => void }) {
  const [stav, setStav] = useState('');
  const [chyba, setChyba] = useState('');
  const [bezi, setBezi] = useState(false);
  const [pridat, setPridat] = useState('');

  const hladaj = async (k: string) => {
    setChyba(''); setStav(''); setPridat('');
    if (!platnyKod(k)) { setChyba('Kód nie je platný (EAN-13, EAN-8 alebo UPC). Skontroluj čísla pod čiarovým kódom.'); return; }
    setBezi(true); setStav('Hľadám výrobok…');
    try {
      const v = await nacitajObf(k);
      naKod({ kod: k, vyrobok: v });
      if (!v) { setChyba('Výrobok sa nenašiel (ani v tvojich skenoch, ani v Open Beauty Facts). Odfoť alebo vpíš zloženie a ulož si ho pod tento kód.'); setPridat(k); }
      else if (!v.zlozenie) { setChyba('Výrobok sa našiel, ale nemá zadané zloženie. Odfoť alebo vpíš zloženie z obalu – môžeš si ho uložiť pod tento kód.'); setPridat(k); naVyrobok(v); }
      else { setStav(''); naVyrobok(v); }
    } catch {
      naKod({ kod: k, vyrobok: null });
      setChyba('Nepodarilo sa spojiť s Open Beauty Facts (bez internetu?) a výrobok nemáme uložený v mobile. Odfoť alebo vpíš zloženie – to funguje aj offline a môžeš si ho uložiť pod tento kód.');
      setPridat(k);
    } finally { setBezi(false); setStav(''); }
  };

  return (
    <KodPanel pred="kz" ariaKod="Čiarový kód kozmetiky (čísla)" placeholder="napr. 3600550000000" bezi={bezi} stav={stav} chyba={chyba} naKod={hladaj}
      popis="Najprv hľadáme medzi tvojimi vlastnými skenmi, potom (keď máš internet) v Open Beauty Facts (licencia ODbL). Nájdené výrobky sa uložia v mobile a nájdu sa aj bez internetu. Bez nálezu odfoť zloženie a ulož si ho pod kód."
    >
      {pridat && <PridatDoDb id="kz-pridat-obf" href={obfPridatUrl(pridat)} nazov="Open Beauty Facts" />}
    </KodPanel>
  );
}
