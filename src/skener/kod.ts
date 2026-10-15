/** Čítanie čiarového kódu: BarcodeDetector (Chrome Android), inak ZXing (načíta sa až keď treba). */
import { platnyKod } from './off';

interface BD { detect(src: ImageBitmapSource): Promise<{ rawValue: string }[]> }
type BDCtor = new (o?: { formats: string[] }) => BD;
const FORMATY = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

export const maBarcodeDetector = () => 'BarcodeDetector' in globalThis;
export function vytvorDetektor(): BD | null {
  const C = (globalThis as unknown as { BarcodeDetector?: BDCtor }).BarcodeDetector;
  return C ? new C({ formats: FORMATY }) : null;
}

/** Nájde kód vo fotke. Vráti platný EAN/UPC alebo null. */
export async function kodZFotky(subor: Blob): Promise<string | null> {
  const d = vytvorDetektor();
  if (d) {
    try {
      const bmp = await createImageBitmap(subor);
      const r = await d.detect(bmp);
      const k = r.map((x) => x.rawValue).find(platnyKod);
      if (k) return k;
    } catch { /* skúsime ZXing */ }
  }
  const { BrowserMultiFormatReader } = await import('@zxing/library');
  const url = URL.createObjectURL(subor);
  try {
    const t = await new BrowserMultiFormatReader().decodeFromImageUrl(url);
    const k = t.getText();
    return platnyKod(k) ? k : null;
  } catch { return null; } finally { URL.revokeObjectURL(url); }
}
