/** Skener kozmetiky – obrazovka. Trasa #/kozmetika (integrácia: src/kozmetika-vstup.tsx). */
import { useEffect, useMemo, useState } from 'preact/hooks';
import '../skener/skener.css';
import { Hlavicka, Zalozky, Upozornenie } from '../ui/kom';
import { PASMO_TEXT } from '../engine/score';
import { parsujInci } from './parser';
import { vypocitajSkoreKozmetiky } from './skore';
import { VysledokK } from './Vysledok';
import { FotoInci } from './FotoInci';
import { KodK } from './KodK';
import { PorovnanieK } from './PorovnanieK';
import { nacitajNastavenia, ulozNastavenia, nacitajHistoriu, pridajDoHistorie, zmazZaznam, vymazHistoriu, type VyrobokObf } from './ulozisko';
import type { Nastavenia } from './typy';
import { datumUlozenia } from '../skener/ulozisko';

const PRIKLAD = 'Aqua, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Parfum, Phenoxyethanol, Methylparaben, Limonene, Linalool, Titanium Dioxide (nano), Sodium Lauryl Sulfate, CI 77891';
type Zalozka = 'sken' | 'historia' | 'porovnat';
const NAST: [keyof Nastavenia, string][] = [['citliva', 'Citlivá pokožka'], ['vona', 'Alergia na vône'], ['tehotenstvo', 'Tehotenstvo'], ['deti', 'Pre dieťa / deti']];

export function Kozmetika() {
  const [zal, setZal] = useState<Zalozka>('sken');
  const [nast, setNast] = useState<Nastavenia>(() => nacitajNastavenia());
  const [text, setText] = useState('');
  const [hotovy, setHotovy] = useState<string | null>(null);
  const [nazov, setNazov] = useState('');
  const [obf, setObf] = useState<VyrobokObf | null>(null);
  const [ulozene, setUlozene] = useState(false);
  const [hist, setHist] = useState(() => nacitajHistoriu());

  const vyhodnotenie = useMemo(() => {
    if (hotovy === null) return null;
    const r = parsujInci(hotovy);
    return { r, s: vypocitajSkoreKozmetiky(r, nast) };
  }, [hotovy, nast]);
  useEffect(() => { if (hotovy) document.getElementById('kz-vysledok')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, [hotovy]);

  const zmenNast = (k: keyof Nastavenia, v: boolean) => { const n = { ...nast, [k]: v }; setNast(n); ulozNastavenia(n); };
  const vymaz = () => { setText(''); setHotovy(null); setObf(null); setUlozene(false); };
  const uloz = () => {
    if (!vyhodnotenie) return;
    pridajDoHistorie({ nazov: nazov.trim() || `Kozmetika ${new Date().toLocaleDateString('sk-SK')}`, text: hotovy ?? '', skore: vyhodnotenie.s.celkom, pasmo: vyhodnotenie.s.pasmo, kod: obf?.kod });
    setHist(nacitajHistoriu()); setUlozene(true);
  };

  return (
    <>
      <Hlavicka nazov="Skener kozmetiky" />
      <Zalozky hodnoty={[{ id: 'sken', nazov: '🧴 Skenovať' }, { id: 'historia', nazov: `🕘 História${hist.length ? ` ${hist.length}` : ''}` }, { id: 'porovnat', nazov: '⚖️ Porovnať' }]} vybrane={zal} zmen={setZal} />
      <div class="upoz"><b>Nie je to lekárska rada.</b> Hodnotíme len <b>prítomnosť</b> látky v zozname INCI. Koncentrácie na obale nie sú, takže nevieme, či je látky veľa alebo málo. Pri alergii, ekzéme, tehotenstve, kojení alebo koži dieťaťa sa poraď s lekárom alebo lekárnikom.</div>

      <details open={nast.citliva || nast.vona || nast.tehotenstvo || nast.deti}>
        <summary style="min-height:44px;display:flex;align-items:center;font-weight:700">⚙️ Moje nastavenia (kozmetika)</summary>
        <div class="karta" style="animation:none">
          {NAST.map(([k, n]) => (
            <label key={k} class="rad" style="align-items:center;min-height:44px"><input type="checkbox" checked={nast[k]} onChange={(e) => zmenNast(k, (e.target as HTMLInputElement).checked)} style="width:auto" /> {n}</label>
          ))}
          <p class="maly">Nastavenia sa ukladajú len v tomto mobile (osobitne od nastavení receptov) a zmenia skóre aj poradie upozornení.</p>
        </div>
      </details>

      {zal === 'sken' && (
        <>
          <KodK naVyrobok={(v) => { setObf(v); setNazov([v.znacka, v.nazov].filter(Boolean).join(' – ')); setText(v.zlozenie); setHotovy(v.zlozenie || null); setUlozene(false); }} />
          <FotoInci naText={(t) => { setText(t); setHotovy(null); setObf(null); setUlozene(false); }} />
          <p class="maly">Alebo vlož či napíš zloženie z obalu (rozpoznaný text sa dá opraviť). Všetko sa vyhodnotí len v tvojom mobile.</p>
          <label for="kz-text"><b>Zloženie (INCI)</b></label>
          <textarea id="kz-text" class="sk-text" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} placeholder="Napr.: Aqua, Glycerin, Parfum, Phenoxyethanol, CI 77891…" />
          <div class="rad">
            <button class="hl" onClick={() => { setHotovy(text); setUlozene(false); }} disabled={!text.trim()}>Vyhodnotiť</button>
            <button onClick={() => { setText(PRIKLAD); setHotovy(PRIKLAD); setObf(null); setUlozene(false); }}>Ukáž príklad</button>
            {text && <button onClick={vymaz}>Vymazať</button>}
          </div>
          {vyhodnotenie && (
            <div id="kz-vysledok" style="scroll-margin-top:8px">
              <div class="karta" style="animation:none;margin-top:14px">
                <label for="kz-nazov" class="maly">Názov výrobku (do histórie)</label>
                <input id="kz-nazov" type="text" value={nazov} onInput={(e) => setNazov((e.target as HTMLInputElement).value)} placeholder="napr. Telové mlieko" />
                <div class="rad"><button class="male" onClick={uloz} disabled={ulozene}>{ulozene ? '✓ Uložené' : '💾 Uložiť do histórie'}</button></div>
              </div>
              {obf && obf.zlozenie && (
                <div class="upoz">
                  <b>{obf.nazov}</b>{obf.znacka ? ` (${obf.znacka})` : ''} – údaje z Open Beauty Facts (ODbL), <a href={obf.url} target="_blank" rel="noopener noreferrer">karta výrobku</a>.
                  {obf.zCache && <> <b>Uložené {datumUlozenia(obf.ulozene)}</b> v tomto mobile (bez internetu) – údaje môžu byť staršie.</>}
                  {obf.jazyk && <> Zloženie je v {obf.jazyk}.</>} <span class="maly">Zloženie od používateľov môže byť zastarané – porovnaj s obalom.</span>
                </div>
              )}
              <VysledokK r={vyhodnotenie.r} s={vyhodnotenie.s} nazov={nazov} />
            </div>
          )}
        </>
      )}

      {zal === 'historia' && (
        <>
          {!hist.length && <p>Zatiaľ nič uložené. Vyhodnoť zloženie a ulož ho do histórie.</p>}
          {hist.map((h) => (
            <div class="karta" key={h.id} style="animation:none">
              <h3 style="margin:0">{h.nazov}</h3>
              <div class="maly">{new Date(h.cas).toLocaleString('sk-SK')} · {PASMO_TEXT[h.pasmo as keyof typeof PASMO_TEXT] ?? h.pasmo} {h.skore}/100 (pri uložení)</div>
              <div class="rad">
                <button class="male" onClick={() => { setText(h.text); setHotovy(h.text); setObf(null); setNazov(h.nazov); setUlozene(true); setZal('sken'); }}>Otvoriť</button>
                <button class="male" onClick={() => { zmazZaznam(h.id); setHist(nacitajHistoriu()); }}>Zmazať</button>
              </div>
            </div>
          ))}
          {hist.length > 0 && <button class="male" onClick={() => { if (confirm('Zmazať celú históriu skenov kozmetiky?')) { vymazHistoriu(); setHist([]); } }}>Zmazať celú históriu</button>}
        </>
      )}

      {zal === 'porovnat' && <PorovnanieK hist={hist} nast={nast} />}

      <div class="upoz sk-pozn">
        <b>Zdroje a licencie.</b> Regulačný rámec: nariadenie (ES) č. 1223/2009 a jeho zmeny, stanoviská SCCS; overené vyhľadávaním, originály sme nečítali (úroveň „overené vyhľadávaním“). Čo sme nepotvrdili, je označené „odhad / prax, nie dôkaz“ a číselný limit pri tom neuvádzame. Funkcie látok sú naše zhrnutie (databáza CosIng nebola dostupná). Výrobky podľa kódu: Open Beauty Facts (ODbL). Hodnotenia iných aplikácií nepreberáme.
      </div>
      <Upozornenie />
    </>
  );
}
