/** Spoločný panel „Čiarový kód“ (potraviny aj kozmetika): vpísanie, odfotenie a živá kamera.
 *  Kamera sa zapína tlačidlom a zastaví sa pri opustení obrazovky, schovaní appky aj po prvom načítaní kódu. */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { kodZFotky } from './kod';
import { mozeKameru, spustiKameru, type ZivaKamera } from './kamera';

interface Props {
  /** predpona id prvkov: `sk` (potraviny) alebo `kz` (kozmetika) */
  pred: 'sk' | 'kz';
  ariaKod: string;
  placeholder: string;
  popis: ComponentChildren;
  bezi: boolean;
  stav: string;
  chyba: string;
  /** nájdený/vpísaný platný alebo neplatný kód – hľadanie rieši rodič */
  naKod: (kod: string) => void;
  children?: ComponentChildren;
}

export function KodPanel({ pred, ariaKod, placeholder, popis, bezi, stav, chyba, naKod, children }: Props) {
  const [kod, setKod] = useState('');
  const [kamera, setKamera] = useState(false);
  const [chybaKamera, setChybaKamera] = useState('');
  const [fotoStav, setFotoStav] = useState('');
  const [fotoChyba, setFotoChyba] = useState('');
  const video = useRef<HTMLVideoElement>(null);

  const zFotky = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    setFotoChyba(''); setFotoStav('Čítam čiarový kód…');
    const k = await kodZFotky(f);
    (e.target as HTMLInputElement).value = '';
    setFotoStav('');
    if (!k) { setFotoChyba('Čiarový kód sa na fotke nenašiel. Skús zblízka a rovno, alebo ho napíš ručne.'); return; }
    setKod(k); naKod(k);
  };

  useEffect(() => {
    if (!kamera) return;
    let k: ZivaKamera | undefined; let koniec = false;
    setChybaKamera('');
    spustiKameru(video.current!, (nacitany) => { setKamera(false); setKod(nacitany); naKod(nacitany); }).then(
      (z) => { if (koniec) z.zastav(); else k = z; },
      () => { if (!koniec) { setChybaKamera('Kameru sa nepodarilo spustiť (povolenie?). Použi tlačidlo na fotku alebo kód napíš ručne.'); setKamera(false); } },
    );
    const schovane = () => { if (document.visibilityState === 'hidden') setKamera(false); };
    document.addEventListener('visibilitychange', schovane);
    // cleanup = opustenie obrazovky (odmontovanie), vypnutie kamery aj schovanie appky
    return () => { koniec = true; k?.zastav(); document.removeEventListener('visibilitychange', schovane); };
  }, [kamera]);

  return (
    <div class="karta" style="animation:none">
      <h3>Čiarový kód <span class="tag">online</span></h3>
      <p class="maly">{popis}</p>
      <div class="rad">
        <input type="text" inputMode="numeric" pattern="[0-9]*" id={`${pred}-kod`} aria-label={ariaKod} placeholder={placeholder} value={kod} onInput={(e) => setKod((e.target as HTMLInputElement).value.replace(/\D/g, ''))} style="flex:1;min-width:160px;width:auto" />
        <button class="hl" onClick={() => naKod(kod)} disabled={bezi || !kod}>Nájsť</button>
      </div>
      <div class="rad">
        {mozeKameru() && <button class="hl" id={`${pred}-kamera`} onClick={() => setKamera(!kamera)} aria-pressed={kamera}>{kamera ? 'Zastaviť kameru' : '🎥 Živá kamera'}</button>}
        <label class="tlacidlo" style="display:inline-flex;align-items:center;cursor:pointer">
          📦 Odfotiť kód
          <input id={`${pred}-kod-foto`} type="file" accept="image/*" capture="environment" onChange={zFotky} style="position:absolute;opacity:0;width:1px;height:1px" aria-label="Odfotiť čiarový kód" />
        </label>
      </div>
      {kamera && (
        <>
          <video ref={video} id={`${pred}-video`} playsInline muted autoplay class="sk-obrazok" aria-label="Živý obraz z kamery" />
          <p class="maly" role="status">Namier kameru na čiarový kód. Po načítaní sa kamera sama vypne.</p>
        </>
      )}
      {(stav || fotoStav) && <div class="sk-stav" role="status">{stav || fotoStav}</div>}
      {(chyba || fotoChyba || chybaKamera) && <p class="sk-varovanie" role="alert">{chyba || fotoChyba || chybaKamera}</p>}
      {children}
    </div>
  );
}
