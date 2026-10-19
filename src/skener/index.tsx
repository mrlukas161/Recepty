/** Skener zloženia výrobkov – obrazovka. Integrácia: src/skener-vstup.tsx načíta tento súbor (export Skener). */
import { useEffect, useMemo, useState } from 'preact/hooks';
import './skener.css';
import { useStav } from '../store';
import { Hlavicka, Zalozky, Upozornenie } from '../ui/kom';
import { Vysledok } from './Vysledok';
import { rozbor } from './rozbor';
import { vypocitajSkoreVyrobku } from './skore';
import { nacitajHistoriu, pridajDoHistorie, zmazZaznam, vymazHistoriu, prepniKupujem, type Zaznam } from './historia';
import { nastav } from '../store';
import { Porovnanie } from './Porovnanie';
import { Foto } from './Foto';
import { Kod, type KodSken } from './Kod';
import { VlastneSkenyZoznam } from './VlastneSkeny';
import { vlastneSkenyPotravin, oznacenieVlastneho } from './vlastne-skeny';
import { vlastnyNaVyrobok } from './off';
import { dotiahniCakajuce } from './prenos-skener';
import { datumUlozenia } from './ulozisko';
import { BALIK_ZDROJ } from './balik';
import type { OffVyrobok } from './off';
import { offPridatUrl } from './off';
import { PridatDoDb } from './PridatDoDb';
import type { Vyziva, Doplnok } from './typy';
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
  const [lenKupujem, setLenKupujem] = useState(false);
  const [off, setOff] = useState<OffVyrobok | null>(null);
  /** kód, ktorý sa práve skenoval (aj keď výrobok nie je v databáze) – pod ním sa ukladá história aj vlastný sken */
  const [kodSken, setKodSken] = useState<string | null>(null);
  const [vlastneKluc, setVlastneKluc] = useState(0);
  const [doplnok, setDoplnok] = useState<Doplnok | undefined>(undefined);
  const deti = s.nastavenia.deti.length > 0;

  const vyhodnotenie = useMemo(() => {
    if (hotovy === null) return null;
    const r = rozbor(hotovy, doplnok);
    const vz = Object.values(vyziva).some((x) => x !== undefined) ? vyziva : undefined;
    return { r, sk: vypocitajSkoreVyrobku(r, { nastavenia: s.nastavenia, vyziva: vz }) };
  }, [hotovy, vyziva, doplnok, s.nastavenia]);

  useEffect(() => { if (hotovy) document.getElementById('sk-vysledok')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, [hotovy]);
  const vyhodnot = () => { setHotovy(text); setUlozene(false); };
  const uloz = () => {
    if (!vyhodnotenie) return;
    pridajDoHistorie({ nazov: nazov.trim() || `Výrobok ${new Date().toLocaleDateString('sk-SK')}`, text: hotovy ?? '', skore: vyhodnotenie.sk.celkom, pasmo: vyhodnotenie.sk.pasmo, vyziva: Object.keys(vyziva).length ? vyziva : undefined, doplnok, kod: kodSken ?? off?.kod, jazyk: off?.jazykText });
    setHist(nacitajHistoriu()); setUlozene(true);
  };

  const ulozVlastny = () => {
    if (!kodSken || !hotovy) return;
    const v = vlastneSkenyPotravin.uloz({ kod: kodSken, nazov: nazov.trim() || `Výrobok ${kodSken}`, znacka: off?.znacka, zlozenie: hotovy, vyziva: Object.keys(vyziva).length ? vyziva : off?.vyziva });
    if (v) { setOff(vlastnyNaVyrobok(v)); setVlastneKluc((x) => x + 1); }
  };
  const zmazVlastny = () => {
    if (!off?.vlastny) return;
    vlastneSkenyPotravin.zmaz(off.kod); setOff(null); setVlastneKluc((x) => x + 1);
  };
  useEffect(() => { void dotiahniCakajuce(); }, []);

  return (
    <>
      <Hlavicka nazov="Skener zloženia" />
      <p class="maly">Hodnotíš kozmetiku alebo drogériu? Použi <a href="#/kozmetika">Skener kozmetiky</a> (zloženie INCI).</p>
      <Zalozky hodnoty={[{ id: 'sken', nazov: '📷 Skenovať' }, { id: 'historia', nazov: `🕘 História${hist.length ? ` ${hist.length}` : ''}` }, { id: 'porovnat', nazov: '⚖️ Porovnať' }]} vybrane={zal} zmen={setZal} />

      {zal === 'sken' && (
        <>
          <Kod
            naKod={(k) => { setKodSken(k.kod); if (!k.vyrobok) { setOff(null); setDoplnok(undefined); setHotovy(null); setText(''); setUlozene(false); } }}
            naVyrobok={(v) => { setOff(v); setDoplnok(v.doplnok); setNazov([v.znacka, v.nazov].filter(Boolean).join(' – ')); setVyziva(v.vyziva); setText(v.zlozenie); setHotovy(v.zlozenie || null); setUlozene(false); }}
          />
          <Foto naText={(t) => { setText(t); setHotovy(null); setOff(null); setDoplnok(undefined); setUlozene(false); }} />
          <p class="maly">Alebo vlož či napíš zloženie z obalu (rozpoznaný text sa dá opraviť). Všetko sa vyhodnotí len v tvojom mobile.</p>
          <label for="sk-text"><b>Zloženie výrobku</b></label>
          <textarea id="sk-text" class="sk-text" value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} placeholder="Napr.: múka pšeničná, cukor, palmový tuk, emulgátor (E 322)…" />
          <div class="rad">
            <button class="hl" onClick={vyhodnot} disabled={!text.trim()}>Vyhodnotiť</button>
            <button onClick={() => { setText(PRIKLAD); setHotovy(PRIKLAD); setOff(null); setDoplnok(undefined); setKodSken(null); setUlozene(false); }}>Ukáž príklad</button>
            {text && <button onClick={() => { setText(''); setHotovy(null); setOff(null); setDoplnok(undefined); setKodSken(null); }}>Vymazať</button>}
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
                <div class="rad">
                  <button class="male" onClick={uloz} disabled={ulozene}>{ulozene ? '✓ Uložené' : '💾 Uložiť do histórie'}</button>
                  {kodSken && (!off || !off.zlozenie || off.vlastny) && <button class="male" id="sk-uloz-vlastny" onClick={ulozVlastny}>{off?.vlastny ? '💾 Aktualizovať vlastný sken' : `💾 Zapamätať zloženie pod kód ${kodSken}`}</button>}
                </div>
                {kodSken && (!off || !off.zlozenie) && <p class="maly">Zloženie sa uloží len v tomto mobile pod kód {kodSken}. Nabudúce ho skener nájde aj bez internetu.</p>}
              </div>
              {kodSken && (!off || !off.zlozenie) && <PridatDoDb id="sk-pridat-off-vysledok" href={offPridatUrl(kodSken)} nazov="Open Food Facts" />}
              {off && off.zlozenie && off.vlastny && (
                <div class="upoz" id="sk-vlastny-info">
                  <b>{off.nazov}</b> – <b>{oznacenieVlastneho(off.ulozene)}</b>: zloženie si uložil ty v tomto mobile (kód {off.kod}), nie je z databázy. Má prednosť pred balíkom aj Open Food Facts a nájde sa aj bez internetu. Porovnaj s obalom.
                  <div class="rad"><button class="male" id="sk-zmaz-vlastny" onClick={zmazVlastny}>🗑 Zmazať vlastný sken</button></div>
                </div>
              )}
              {off && off.zlozenie && !off.vlastny && (
                <div class="upoz">
                  <b>{off.nazov}</b>{off.znacka ? ` (${off.znacka})` : ''} – údaje z Open Food Facts (ODbL), <a href={off.url} target="_blank" rel="noopener noreferrer">karta výrobku</a>.
                  {off.zBalika && <> <b>{BALIK_ZDROJ}</b> – balík slovenských výrobkov v appke (funguje aj bez internetu), údaje môžu byť staršie.</>}
                  {off.zCache && <> <b>Uložené {datumUlozenia(off.ulozene)}</b> v tomto mobile (bez internetu) – údaje môžu byť staršie.</>}
                  {off.nutriscore && <> Nutri-Score {off.nutriscore}.</>}{off.nova && <> NOVA {off.nova}.</>}
                  {off.jazykText && <> Zloženie je v {off.jazykText}{off.jazyk === 'povodny' ? ' – rozbor je menej presný, pomáhajú nám aj štruktúrované údaje databázy (E-čísla, alergény)' : ''}.</>}
                  <span class="maly"> Nutri-Score a NOVA sú údaje z databázy, nie naše skóre; zloženie od používateľov môže byť zastarané – porovnaj s obalom.</span>
                </div>
              )}
              <Vysledok r={vyhodnotenie.r} s={vyhodnotenie.sk} deti={deti} nazov={nazov} naOpravu={off ? undefined : () => { const t = document.getElementById('sk-text') as HTMLTextAreaElement | null; t?.scrollIntoView({ block: 'center', behavior: 'smooth' }); t?.focus(); }} />
            </div>
          )}
        </>
      )}

      {zal === 'historia' && (
        <>
          <VlastneSkenyZoznam key={vlastneKluc} uloziste={vlastneSkenyPotravin} zmena={() => setOff((o) => (o?.vlastny ? null : o))} otvor={(v) => { setKodSken(v.kod); setOff(vlastnyNaVyrobok(v)); setNazov(v.nazov); setVyziva(v.vyziva ?? {}); setDoplnok(undefined); setText(v.zlozenie); setHotovy(v.zlozenie); setUlozene(false); setZal('sken'); }} />
          {!hist.length && <p>Zatiaľ nič uložené. Vyhodnoť zloženie a ulož ho do histórie.</p>}
          {hist.some((h) => h.kupujem) && (
            <label class="rad" style="align-items:center;min-height:44px"><input type="checkbox" checked={lenKupujem} onChange={(e) => setLenKupujem((e.target as HTMLInputElement).checked)} style="width:auto" /> Len výrobky, ktoré kupujem</label>
          )}
          {hist.filter((h) => !lenKupujem || h.kupujem).map((h) => (
            <div class="karta" key={h.id} style="animation:none">
              <div class="riadok">
                <div class="rozt"><h3 style="margin:0">{h.kupujem ? '★ ' : ''}{h.nazov}</h3><div class="maly">{new Date(h.cas).toLocaleString('sk-SK')} · {PASMO_TEXT[h.pasmo as keyof typeof PASMO_TEXT]} {h.skore}/100</div></div>
              </div>
              <div class="rad">
                <button class="male" onClick={() => { setText(h.text); setHotovy(h.text); setVyziva(h.vyziva ?? {}); setDoplnok(h.doplnok); setOff(null); setKodSken(h.kod ?? null); setNazov(h.nazov); setUlozene(true); setZal('sken'); }}>Otvoriť</button>
                <button class="male" aria-pressed={!!h.kupujem} onClick={() => { prepniKupujem(h.id); setHist(nacitajHistoriu()); }}>{h.kupujem ? '★ Kupujem' : '☆ Kupujem'}</button>
                <button class="male" onClick={() => nastav((x) => { if (!x.nakupVlastne.includes(h.nazov)) x.nakupVlastne.push(h.nazov); })}>{s.nakupVlastne.includes(h.nazov) ? '✓ V nákupe' : '🛒 Do nákupu'}</button>
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
