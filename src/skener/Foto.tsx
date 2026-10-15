import { useEffect, useRef, useState } from 'preact/hooks';
import { nacitajObrazok, vykresli, PREDVOLENA_UPRAVA, type Uprava, type Zdroj } from './obrazok';
import { rozpoznajText, vycistiOcrText, podporujeOcr, JAZYKY_OCR, type JazykOcr } from './ocr';

const NAH_STRANA = 1000;

export function Foto({ naText }: { naText: (t: string) => void }) {
  const [z, setZ] = useState<Zdroj | null>(null);
  const [u, setU] = useState<Uprava>(PREDVOLENA_UPRAVA);
  const [jazyk, setJazyk] = useState<JazykOcr>('slk+eng');
  const [stav, setStav] = useState('');
  const [podiel, setPodiel] = useState(0);
  const [bezi, setBezi] = useState(false);
  const [chyba, setChyba] = useState('');
  const plocha = useRef<HTMLCanvasElement>(null);
  const ocrOk = podporujeOcr();

  useEffect(() => { if (z && plocha.current) vykresli(z, u, NAH_STRANA, plocha.current); }, [z, u]);

  const vyber = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    setChyba('');
    try { setZ(await nacitajObrazok(f)); setU(PREDVOLENA_UPRAVA); } catch { setChyba('Fotku sa nepodarilo otvoriť. Skús inú, alebo zloženie vlož ručne.'); }
    (e.target as HTMLInputElement).value = '';
  };

  const rozpoznaj = async () => {
    if (!z) return;
    setBezi(true); setChyba(''); setStav('Pripravujem…'); setPodiel(0);
    try {
      const c = vykresli(z, u);
      const t = await rozpoznajText(c, jazyk, (p) => { setStav(p.stav); setPodiel(p.podiel); });
      const cisty = vycistiOcrText(t);
      if (!cisty) setChyba('Nenašiel sa žiadny text. Skús fotku zblízka, rovno, s dobrým svetlom, alebo zvýš kontrast.');
      else { naText(cisty); setStav('Hotovo – text skontroluj nižšie a oprav chyby.'); }
    } catch (err) {
      setChyba('OCR zlyhalo (pri prvom použití treba internet na stiahnutie jazykových dát). Zloženie môžeš vložiť ručne. ' + (err instanceof Error ? err.message : ''));
    } finally { setBezi(false); }
  };

  const orez = (k: keyof Uprava['orez'], nazov: string) => (
    <label class="maly">{nazov}: {Math.round(u.orez[k] * 100)} %
      <input type="range" min="0" max="45" value={Math.round(u.orez[k] * 100)} onInput={(e) => setU({ ...u, orez: { ...u.orez, [k]: Number((e.target as HTMLInputElement).value) / 100 } })} style="width:100%;min-height:32px" />
    </label>
  );

  return (
    <div class="karta" style="animation:none">
      <h3>Odfoť zloženie</h3>
      <p class="maly">Odfoť zoznam zložiek zblízka, rovno a pri dobrom svetle. Fotka sa spracuje len v tvojom mobile a nikam sa neposiela.</p>
      <div class="rad">
        <label class="tlacidlo hl" style="display:inline-flex;align-items:center;cursor:pointer">
          📷 Odfotiť / vybrať fotku
          <input id="sk-foto" type="file" accept="image/*" capture="environment" onChange={vyber} style="position:absolute;opacity:0;width:1px;height:1px" aria-label="Odfotiť alebo vybrať fotku zloženia" />
        </label>
      </div>
      {!ocrOk && <p class="upoz">Tento prehliadač nepodporuje OCR (chýba WebAssembly SIMD). Zloženie vlož ručne.</p>}
      {z && (
        <>
          <canvas ref={plocha} class="sk-obrazok" aria-label="Náhľad fotky" />
          <div class="rad">
            <button class="male" onClick={() => setU({ ...u, otocenie: (((u.otocenie + 270) % 360) as Uprava['otocenie']) })}>↺ Otočiť vľavo</button>
            <button class="male" onClick={() => setU({ ...u, otocenie: (((u.otocenie + 90) % 360) as Uprava['otocenie']) })}>↻ Otočiť vpravo</button>
            <label class="pol"><input type="checkbox" checked={u.cb} onChange={(e) => setU({ ...u, cb: (e.target as HTMLInputElement).checked })} /> Čiernobiele</label>
          </div>
          <label class="maly">Kontrast: {u.kontrast.toFixed(1)}
            <input type="range" min="1" max="3" step="0.1" value={u.kontrast} onInput={(e) => setU({ ...u, kontrast: Number((e.target as HTMLInputElement).value) })} style="width:100%;min-height:32px" />
          </label>
          <details>
            <summary style="min-height:44px;display:flex;align-items:center;font-weight:700">Orezať</summary>
            {orez('t', 'Hore')}{orez('b', 'Dole')}{orez('l', 'Vľavo')}{orez('r', 'Vpravo')}
          </details>
          <label class="maly" for="sk-jazyk">Jazyk obalu</label>
          <select id="sk-jazyk" value={jazyk} onChange={(e) => setJazyk((e.target as HTMLSelectElement).value as JazykOcr)} style="width:100%">
            {JAZYKY_OCR.map((j) => <option key={j.id} value={j.id}>{j.nazov}</option>)}
          </select>
          <div class="rad"><button class="hl" onClick={rozpoznaj} disabled={bezi || !ocrOk}>{bezi ? 'Rozpoznávam…' : 'Rozpoznať text'}</button></div>
        </>
      )}
      {(bezi || stav) && <div class="sk-stav" role="status">{stav}{bezi && <progress class="sk" value={podiel} max="1" />}</div>}
      {chyba && <p class="sk-varovanie" role="alert">{chyba}</p>}
    </div>
  );
}
