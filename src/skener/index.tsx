/** Skener zloženia výrobkov – obrazovka. Integrácia: src/skener-vstup.tsx načíta tento súbor (export Skener). */
import { useEffect, useMemo, useState } from 'preact/hooks';
import './skener.css';
import { useStav } from '../store';
import { Hlavicka, Zalozky, Upozornenie } from '../ui/kom';
import { Vysledok } from './Vysledok';
import { rozbor } from './rozbor';
import { vypocitajSkoreVyrobku } from './skore';
import { nacitajHistoriu, pridajDoHistorie, zmazZaznam, vymazHistoriu, type Zaznam } from './historia';
import { Porovnanie } from './Porovnanie';
import { Foto } from './Foto';
import { Kod } from './Kod';
import type { OffVyrobok } from './off';
import type { Vyziva } from './typy';
import { PASMO_TEXT } from '../engine/score';

const PRIKLAD = 'Zloženie: pšeničná múka, cukor, palmový tuk, glukózo-fruktózový sirup, kakao 4,5 %, sójový lecitín, emulgátor (E 471), farbivo (E102), aróma, soľ, kyselina citrónová. Môže obsahovať stopy orechov a mlieka.';

type Zalozka = 'sken' | 'historia' | 'porovnat';
const ciselne: (keyof Vyziva)[] = ['cukry', 'sol', 'nasyt', 'vlak'];
const NAZ_VYZ: Record<string, string> = { cukry: 'Cukry (g/100 g)', sol: 'Soľ (g/100 g)', nasyt: 'Nasýtené tuky (g/100 g)', vlak: 'Vláknina (g/100 g)' };

export function Skener() {
  const s = useStav();
  const [zal, setZal] = useState<Zalozka>('sken');
  const [text, setText] = useState('');
  const [hotovy, setHotovy] = useState<string | null>(null);
  const [nazov, setNazov] = useState('');
  const [vyziva, setVyziva] = useState<Vyziva>({});
  const [hist, setHist] = useState<Zaznam[]>(() => nacitajHistoriu());
  const [ulozene, setUlozene] = useState(false);
  const [off, setOff] = useState<OffVyrobok | null>(null);
  const deti = s.nastavenia.deti.length > 0;

  const vyhodnotenie = useMemo(() => {
    if (hotovy === null) return null;
    const r = rozbor(hotovy);
    const vz = Object.values(vyziva).some((x) => x !== undefined) ? vyziva : undefined;
    return { r, sk: vypocitajSkoreVyrobku(r, { nastavenia: s.nastavenia, vyziva: vz }) };
  }, [hotovy, vyziva, s.nastavenia]);

  useEffect(() => { if (hotovy) document.getElementById('sk-vysledok')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, [hotovy]);
  const vyhodnot = () => { setHotovy(text); setUlozene(false); };
  const uloz = () => {
    if (!vyhodnotenie) return;
    pridajDoHistorie({ nazov: nazov.trim() || `Výrobok ${new Date().toLocaleDateString('sk-SK')}`, text: hotovy ?? '', skore: vyhodnotenie.sk.celkom, pasmo: vyhodnotenie.sk.pasmo, vyziva: Object.keys(vyziva).length ? vyziva : undefined });
    setHist(nacitajHistoriu()); setUlozene(true);
  };

  return (
    <>
      <Hlavicka nazov="Skener zloženia" />
      <Zalozky hodnoty={[{ id: 'sken', nazov: '📷 Skenovať' }, { id: 'historia', nazov: `🕘 História${hist.length ? ` ${hist.length}` : ''}` }, { id: 'porovnat', nazov: '⚖️ Porovnať' }]} vybrane={zal} zmen={setZal} />

      {zal === 'sken' && (
        <>
          <Kod naVyrobok={(v) => { setOff(v); setNazov([v.znacka, v.nazov].filter(Boolean).join(' – ')); setVyziva(v.vyziva); setText(v.zlozenie); setHotovy(v.zlozenie || null); setUlozene(false); }} />
          <Foto naText={(t) => { setText(t); setHotovy(null); setUlozene(false); }} />
          <p class="maly">Alebo vlož či napíš zloženie z obalu (rozpoznaný text sa dá opraviť). Všetko sa vyhodnotí len v tvojom mobile.</p>
          <label for="sk-text"><b>Zloženie výrobku</b></label>
          <textarea id="sk-text" class="sk-text" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} placeholder="Napr.: múka pšeničná, cukor, palmový tuk, emulgátor (E 322)…" />
          <div class="rad">
            <button class="hl" onClick={vyhodnot} disabled={!text.trim()}>Vyhodnotiť</button>
            <button onClick={() => { setText(PRIKLAD); setHotovy(PRIKLAD); setUlozene(false); }}>Ukáž príklad</button>
            {text && <button onClick={() => { setText(''); setHotovy(null); }}>Vymazať</button>}
          </div>
          <details>
            <summary style="min-height:44px;display:flex;align-items:center;font-weight:700">Výživové hodnoty (voliteľné)</summary>
            <p class="maly">Ak ich zadáš z tabuľky na obale (na 100 g), skóre ich zohľadní.</p>
            <div class="sk-sloupec">
              {ciselne.map((k) => (
                <label key={k} class="maly">{NAZ_VYZ[k]}
                  <input type="number" inputMode="decimal" min="0" step="0.1" value={vyziva[k] ?? ''} onInput={(e) => { const v = (e.target as HTMLInputElement).value; setVyziva({ ...vyziva, [k]: v === '' ? undefined : Number(v.replace(',', '.')) }); }} />
                </label>
              ))}
            </div>
          </details>

          {vyhodnotenie && (
            <div id="sk-vysledok" style="scroll-margin-top:8px">
              <div class="karta" style="animation:none;margin-top:14px">
                <label for="sk-nazov" class="maly">Názov výrobku (do histórie)</label>
                <input id="sk-nazov" type="text" value={nazov} onInput={(e) => setNazov((e.target as HTMLInputElement).value)} placeholder="napr. Müsli čokoládové" />
                <div class="rad"><button class="male" onClick={uloz} disabled={ulozene}>{ulozene ? '✓ Uložené' : '💾 Uložiť do histórie'}</button></div>
              </div>
              {off && off.zlozenie && (
                <div class="upoz">
                  <b>{off.nazov}</b>{off.znacka ? ` (${off.znacka})` : ''} – údaje z Open Food Facts (ODbL), <a href={off.url} target="_blank" rel="noopener noreferrer">karta výrobku</a>.
                  {off.nutriscore && <> Nutri-Score {off.nutriscore}.</>}{off.nova && <> NOVA {off.nova}.</>}
                  <span class="maly"> Nutri-Score a NOVA sú údaje z databázy, nie naše skóre; zloženie od používateľov môže byť zastarané – porovnaj s obalom.</span>
                </div>
              )}
              <Vysledok r={vyhodnotenie.r} s={vyhodnotenie.sk} deti={deti} nazov={nazov} />
            </div>
          )}
        </>
      )}

      {zal === 'historia' && (
        <>
          {!hist.length && <p>Zatiaľ nič uložené. Vyhodnoť zloženie a ulož ho do histórie.</p>}
          {hist.map((h) => (
            <div class="karta" key={h.id} style="animation:none">
              <div class="riadok">
                <div class="rozt"><h3 style="margin:0">{h.nazov}</h3><div class="maly">{new Date(h.cas).toLocaleString('sk-SK')} · {PASMO_TEXT[h.pasmo as keyof typeof PASMO_TEXT]} {h.skore}/100</div></div>
              </div>
              <div class="rad">
                <button class="male" onClick={() => { setText(h.text); setHotovy(h.text); setVyziva(h.vyziva ?? {}); setNazov(h.nazov); setUlozene(true); setZal('sken'); }}>Otvoriť</button>
                <button class="male" onClick={() => { zmazZaznam(h.id); setHist(nacitajHistoriu()); }}>Zmazať</button>
              </div>
            </div>
          ))}
          {hist.length > 0 && <button class="male" onClick={() => { if (confirm('Zmazať celú históriu skenov?')) { vymazHistoriu(); setHist([]); } }}>Zmazať celú históriu</button>}
        </>
      )}

      {zal === 'porovnat' && <Porovnanie hist={hist} nastavenia={s.nastavenia} />}

      <div class="upoz sk-pozn">
        <b>Zdroje a licencie.</b> Zoznam prídavných látok a ich názvy: taxonómia aditív Open Food Facts (licencia ODbL), odkazy na hodnotenia EFSA. Naše hodnotenia látok majú pri každej zložke zdroj a úroveň dôkazov; zdroje sú overené vyhľadávaním, originály sme nečítali. Hodnotenia z iných aplikácií nepreberáme.
      </div>
      <Upozornenie />
    </>
  );
}
