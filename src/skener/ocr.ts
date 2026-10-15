/** OCR offline: Tesseract.js, súbory (worker, jadro, jazykové dáta) sú súčasťou appky v /ocr/ a načítajú sa až pri prvom rozpoznávaní.
 *  Service worker ich po prvom stiahnutí uchová (pozri vite.config.ts, runtimeCaching `skener-ocr`). */
import type { Worker as TessWorker } from 'tesseract.js';
import { opravSlova, spojRozdeleneSlova, kvalitaTextu, pasmoTextu, type OpravaSlova } from './slovnik';

export type JazykOcr = 'slk+eng' | 'ces+eng' | 'slk+ces+eng';
export const JAZYKY_OCR: { id: JazykOcr; nazov: string }[] = [
  { id: 'slk+eng', nazov: 'Slovenčina + angličtina' },
  { id: 'ces+eng', nazov: 'Čeština + angličtina' },
  { id: 'slk+ces+eng', nazov: 'Slovenčina + čeština + angličtina (pomalšie)' },
];

const SIMD = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);
export const podporujeOcr = () => typeof WebAssembly === 'object' && typeof Worker !== 'undefined' && WebAssembly.validate(SIMD);

const zaklad = () => new URL(`${import.meta.env.BASE_URL}ocr/`, document.baseURI).href;

let worker: TessWorker | null = null;
let jazyk: JazykOcr | null = null;
let postup: ((p: { stav: string; podiel: number }) => void) | null = null;

const STAV_SK: Record<string, string> = {
  'loading tesseract core': 'Načítavam OCR jadro…', 'initializing tesseract': 'Spúšťam OCR…', 'loading language traineddata': 'Načítavam jazykové dáta…',
  'initializing api': 'Pripravujem rozpoznávanie…', 'recognizing text': 'Rozpoznávam text…',
};

async function dajWorker(j: JazykOcr): Promise<TessWorker> {
  if (worker && jazyk === j) return worker;
  if (worker) { await worker.terminate(); worker = null; }
  const { createWorker } = await import('tesseract.js');
  worker = await createWorker(j.split('+'), 1, {
    workerPath: `${zaklad()}worker.min.js`,
    corePath: `${zaklad()}tesseract-core-simd-lstm.wasm.js`,
    langPath: `${zaklad()}lang`,
    gzip: true,
    logger: (m) => postup?.({ stav: STAV_SK[m.status] ?? m.status, podiel: m.progress ?? 0 }),
  });
  await worker.setParameters({ preserve_interword_spaces: '1' });
  jazyk = j;
  return worker;
}

/** Prah kvality (podiel známych slov), pod ktorým sa pri zapnutom druhom prechode skúsi orez na pás textu. */
export const PRAH_DRUHEHO_PRECHODU = 0.8;

export interface VysledokOcr { text: string; druhyPrechod: boolean; kvalita: number }

/** Rozpozná text z canvasu; voliteľne druhý prechod s orezom na pás textu (PSM 6), ak je prvý výsledok slabý. */
export async function rozpoznajText(c: HTMLCanvasElement, j: JazykOcr, naPostup: (p: { stav: string; podiel: number }) => void, druhyPrechod = true): Promise<VysledokOcr> {
  postup = naPostup;
  try {
    const w = await dajWorker(j);
    const r1 = await w.recognize(c, {}, { blocks: true });
    let text = r1.data.text;
    let kvalita = kvalitaTextu(vycistiOcrText(text));
    let pouzity = false;
    if (druhyPrechod && kvalita < PRAH_DRUHEHO_PRECHODU) {
      const riadky = (r1.data.blocks ?? []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines)).map((l) => ({ text: l.text, confidence: l.confidence, bbox: l.bbox }));
      const pas = pasmoTextu(riadky, c.width, c.height);
      if (pas) {
        const o = document.createElement('canvas');
        o.width = pas.width; o.height = pas.height;
        o.getContext('2d')!.drawImage(c, pas.left, pas.top, pas.width, pas.height, 0, 0, pas.width, pas.height);
        naPostup({ stav: 'Druhý prechod: čítam pás textu…', podiel: 0 });
        await w.setParameters({ tessedit_pageseg_mode: '6' as never });
        try {
          const r2 = await w.recognize(o);
          const k2 = kvalitaTextu(vycistiOcrText(r2.data.text));
          if (k2 > kvalita) { text = r2.data.text; kvalita = k2; pouzity = true; }
        } finally { await w.setParameters({ tessedit_pageseg_mode: '3' as never }); }
      }
    }
    return { text, druhyPrechod: pouzity, kvalita };
  } finally { postup = null; }
}

export async function ukonciOcr() { if (worker) { const w = worker; worker = null; jazyk = null; await w.terminate(); } }

/** Zloží text z OCR do jedného riadka zloženia (spojí slová rozdelené na konci riadku, zalomenia, opraví medzery pred čiarkou). */
export function vycistiOcrText(t: string): string {
  return spojRozdeleneSlova(t).replace(/\s*\n\s*/g, ' ').replace(/\s+([,.;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

/** Čistenie + slovníková oprava (preklepy, diakritika). `opravy` sa ukážu používateľovi. */
export function spracujOcrText(t: string): { text: string; opravy: OpravaSlova[] } {
  return opravSlova(vycistiOcrText(t));
}
