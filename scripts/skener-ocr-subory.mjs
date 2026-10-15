// Skopíruje súbory pre offline OCR (Tesseract.js: worker, jadro s SIMD, jazykové dáta slk/ces/eng) z node_modules do public/ocr/.
// Spúšťa sa ručne po zmene verzií (`node scripts/skener-ocr-subory.mjs`); výsledok sa commituje, aby sa appka nasadila aj bez siete.
import { mkdirSync, copyFileSync } from 'node:fs';
const ciel = 'public/ocr';
mkdirSync(`${ciel}/lang`, { recursive: true });
copyFileSync('node_modules/tesseract.js/dist/worker.min.js', `${ciel}/worker.min.js`);
copyFileSync('node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', `${ciel}/tesseract-core-simd-lstm.wasm.js`);
for (const l of ['slk', 'ces', 'eng']) copyFileSync(`node_modules/@tesseract.js-data/${l}/4.0.0_best_int/${l}.traineddata.gz`, `${ciel}/lang/${l}.traineddata.gz`);
console.log('hotovo');
