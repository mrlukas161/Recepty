import { useEffect, useRef, useState } from 'preact/hooks';
import { nacitajOff, platnyKod, type OffVyrobok } from './off';
import { kodZFotky, maBarcodeDetector, vytvorDetektor } from './kod';

export function Kod({ naVyrobok }: { naVyrobok: (v: OffVyrobok) => void }) {
  const [kod, setKod] = useState('');
  const [stav, setStav] = useState('');
  const [chyba, setChyba] = useState('');
  const [bezi, setBezi] = useState(false);
  const [kamera, setKamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const prud = useRef<MediaStream | null>(null);

  const hladaj = async (k: string) => {
    setChyba(''); setStav('');
    if (!platnyKod(k)) { setChyba('Kód nie je platný (EAN-13, EAN-8 alebo UPC). Skontroluj čísla pod čiarovým kódom.'); return; }
    setBezi(true); setStav('Hľadám v Open Food Facts…');
    try {
      const v = await nacitajOff(k);
      if (!v) setChyba('Výrobok sa v Open Food Facts nenašiel. Odfoť zloženie alebo ho vlož ručne.');
      else if (!v.zlozenie) { setChyba('Výrobok sa našiel, ale nemá zadané zloženie. Odfoť zloženie na obale.'); naVyrobok(v); }
      else { setStav(''); naVyrobok(v); }
    } catch {
      setChyba('Nepodarilo sa spojiť s Open Food Facts (bez internetu?) a výrobok nemáme uložený v mobile. Odfoť zloženie – to funguje aj offline.');
    } finally { setBezi(false); }
  };

  const zFotky = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    setChyba(''); setStav('Čítam čiarový kód…');
    const k = await kodZFotky(f);
    (e.target as HTMLInputElement).value = '';
    if (!k) { setStav(''); setChyba('Čiarový kód sa na fotke nenašiel. Skús zblízka a rovno, alebo ho napíš ručne.'); return; }
    setKod(k);
    await hladaj(k);
  };

  const zastav = () => { prud.current?.getTracks().forEach((t) => t.stop()); prud.current = null; setKamera(false); };
  useEffect(() => zastav, []);
  useEffect(() => {
    if (!kamera) return;
    let koniec = false;
    const d = vytvorDetektor();
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (koniec) { s.getTracks().forEach((t) => t.stop()); return; }
        prud.current = s;
        const v = video.current!;
        v.srcObject = s; await v.play();
        const slucka = async () => {
          if (koniec || !d) return;
          try {
            const r = await d.detect(v);
            const k = r.map((x) => x.rawValue).find(platnyKod);
            if (k) { zastav(); setKod(k); await hladaj(k); return; }
          } catch { /* ďalší pokus */ }
          setTimeout(slucka, 300);
        };
        slucka();
      } catch { setChyba('Kameru sa nepodarilo spustiť (povolenie?). Použi tlačidlo na fotku.'); setKamera(false); }
    })();
    return () => { koniec = true; };
  }, [kamera]);

  return (
    <div class="karta" style="animation:none">
      <h3>Čiarový kód <span class="tag">online</span></h3>
      <p class="maly">Keď máš internet, nájdeme výrobok v Open Food Facts (názov, zloženie, výživové hodnoty). Výrobky, ktoré už raz našlo, sa uložia v mobile a nájdu sa aj bez internetu. Bez nálezu odfoť zloženie.</p>
      <div class="rad">
        <input type="text" inputMode="numeric" pattern="[0-9]*" id="sk-kod" aria-label="Čiarový kód (čísla)" placeholder="napr. 5900000000000" value={kod} onInput={(e) => setKod((e.target as HTMLInputElement).value.replace(/\D/g, ''))} style="flex:1;min-width:160px;width:auto" />
        <button class="hl" onClick={() => hladaj(kod)} disabled={bezi || !kod}>Nájsť</button>
      </div>
      <div class="rad">
        <label class="tlacidlo" style="display:inline-flex;align-items:center;cursor:pointer">
          📦 Odfotiť kód
          <input id="sk-kod-foto" type="file" accept="image/*" capture="environment" onChange={zFotky} style="position:absolute;opacity:0;width:1px;height:1px" aria-label="Odfotiť čiarový kód" />
        </label>
        {maBarcodeDetector() && <button onClick={() => (kamera ? zastav() : setKamera(true))}>{kamera ? 'Zastaviť kameru' : '🎥 Živá kamera'}</button>}
      </div>
      {kamera && <video ref={video} playsInline muted class="sk-obrazok" aria-label="Živý obraz z kamery" />}
      {stav && <div class="sk-stav" role="status">{stav}</div>}
      {chyba && <p class="sk-varovanie" role="alert">{chyba}</p>}
    </div>
  );
}
