/** Živá kamera na čiarový kód – spoločná pre skener potravín aj kozmetiky.
 *  BarcodeDetector (Chrome Android), inak záložná knižnica ZXing (načíta sa až keď treba).
 *  Kamera sa zastaví zavolaním `zastav()` (komponent to robí pri opustení obrazovky). */
import { platnyKod } from './off';
import { vytvorDetektor } from './kod';

export interface ZivaKamera { zastav(): void }

export const mozeKameru = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

/** Vibrácia a krátke pípnutie pri prvom načítaní kódu – len ak to prehliadač dovolí (inak ticho). */
export function signalNacitania() {
  try { navigator.vibrate?.(80); } catch { /* nič */ }
  try {
    const AC = (globalThis as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = 880; g.gain.value = 0.08;
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.12);
    o.onended = () => { ctx.close().catch(() => {}); };
  } catch { /* nič */ }
}

/** Spustí kameru do `video`; pri prvom platnom kóde kameru zastaví, dá signál a zavolá `naKod`.
 *  Hodí chybu, keď sa kamera nedá spustiť (povolenie, žiadna kamera). */
export async function spustiKameru(video: HTMLVideoElement, naKod: (kod: string) => void): Promise<ZivaKamera> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
  let koniec = false;
  let casovac: ReturnType<typeof setTimeout> | undefined;
  let zxingReset: (() => void) | undefined;
  const zastav = () => {
    koniec = true;
    if (casovac) clearTimeout(casovac);
    try { zxingReset?.(); } catch { /* nič */ }
    stream.getTracks().forEach((t) => t.stop());
    try { video.srcObject = null; } catch { /* nič */ }
  };
  const nasiel = (k: string) => { if (koniec) return; zastav(); signalNacitania(); naKod(k); };
  try {
    const d = vytvorDetektor();
    if (d) {
      video.srcObject = stream;
      await video.play().catch(() => {});
      const slucka = async () => {
        if (koniec) return;
        try {
          const r = await d.detect(video);
          const k = r.map((x) => x.rawValue).find(platnyKod);
          if (k) { nasiel(k); return; }
        } catch { /* ďalší pokus */ }
        if (!koniec) casovac = setTimeout(slucka, 250);
      };
      void slucka();
    } else {
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      const citac = new BrowserMultiFormatReader();
      zxingReset = () => citac.reset();
      if (koniec) { zastav(); return { zastav }; }
      void citac.decodeFromStream(stream, video, (vysl) => { const k = vysl?.getText(); if (k && platnyKod(k)) nasiel(k); });
    }
  } catch (e) { zastav(); throw e; }
  return { zastav };
}
