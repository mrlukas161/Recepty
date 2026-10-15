/** OCR offline: Tesseract.js, súbory (worker, jadro, jazykové dáta) sú súčasťou appky v /ocr/ a načítajú sa až pri prvom rozpoznávaní.
 *  Service worker ich po prvom stiahnutí uchová (pozri vite.config.ts, runtimeCaching `skener-ocr`). */
import type { Worker as TessWorker } from 'tesseract.js';

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

/** Rozpozná text z canvasu. */
export async function rozpoznajText(c: HTMLCanvasElement, j: JazykOcr, naPostup: (p: { stav: string; podiel: number }) => void): Promise<string> {
  postup = naPostup;
  try {
    const w = await dajWorker(j);
    const r = await w.recognize(c);
    return r.data.text;
  } finally { postup = null; }
}

export async function ukonciOcr() { if (worker) { const w = worker; worker = null; jazyk = null; await w.terminate(); } }

/** Zloží text z OCR do jedného riadka zloženia (spojí zalomenia riadkov, opraví medzery pred čiarkou). */
export function vycistiOcrText(t: string): string {
  return t.replace(/(\p{L})-\n(\p{L})/gu, '$1$2').replace(/\s*\n\s*/g, ' ').replace(/\s+([,.;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}
