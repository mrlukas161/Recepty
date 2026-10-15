/** Úprava fotky pred OCR (orezanie, otočenie, kontrast, čiernobiela). Všetko lokálne v prehliadači. */
export interface Uprava {
  otocenie: 0 | 90 | 180 | 270;
  /** 1 = bez zmeny, až 3 */
  kontrast: number;
  /** orezanie v zlomkoch strany (0–0,45) */
  orez: { l: number; t: number; r: number; b: number };
  cb: boolean;
}
export const PREDVOLENA_UPRAVA: Uprava = { otocenie: 0, kontrast: 1.3, orez: { l: 0, t: 0, r: 0, b: 0 }, cb: false };

/** Najdlhšia strana obrázka na OCR – väčší sa zmenší (pamäť mobilu), menší sa nezväčšuje. */
export const MAX_STRANA = 2200;

export function otsuPrah(sivy: Uint8ClampedArray | number[]): number {
  const h = new Array(256).fill(0);
  for (let i = 0; i < sivy.length; i++) h[sivy[i]]++;
  const n = sivy.length;
  let suma = 0;
  for (let i = 0; i < 256; i++) suma += i * h[i];
  let sb = 0, wb = 0, best = 0, prah = 128;
  for (let t = 0; t < 256; t++) {
    wb += h[t];
    if (!wb) continue;
    const wf = n - wb;
    if (!wf) break;
    sb += t * h[t];
    const mb = sb / wb, mf = (suma - sb) / wf;
    const v = wb * wf * (mb - mf) * (mb - mf);
    if (v > best) { best = v; prah = t; }
  }
  return prah;
}

/** Úprava pixelov na mieste: sivá, kontrast okolo 128, voliteľne čiernobiela (Otsu). */
export function upravPixely(d: Uint8ClampedArray, kontrast: number, cb: boolean) {
  const siva = new Uint8ClampedArray(d.length / 4);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    siva[j] = Math.max(0, Math.min(255, (g - 128) * kontrast + 128));
  }
  const prah = cb ? otsuPrah(siva) : 0;
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const v = cb ? (siva[j] > prah ? 255 : 0) : siva[j];
    d[i] = d[i + 1] = d[i + 2] = v;
  }
}

export type Zdroj = ImageBitmap | HTMLImageElement | HTMLCanvasElement;
const sirka = (z: Zdroj) => ('naturalWidth' in z && z.naturalWidth ? z.naturalWidth : z.width);
const vyska = (z: Zdroj) => ('naturalHeight' in z && z.naturalHeight ? z.naturalHeight : z.height);

export async function nacitajObrazok(subor: Blob): Promise<Zdroj> {
  try { return await createImageBitmap(subor, { imageOrientation: 'from-image' } as ImageBitmapOptions); } catch { /* starší prehliadač */ }
  const url = URL.createObjectURL(subor);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally { setTimeout(() => URL.revokeObjectURL(url), 5000); }
}

/** Vykreslí obrázok s úpravou do canvasu s najdlhšou stranou `max`. */
export function vykresli(z: Zdroj, u: Uprava, max = MAX_STRANA, cieľ?: HTMLCanvasElement): HTMLCanvasElement {
  const w0 = sirka(z), h0 = vyska(z);
  const sx = Math.round(w0 * u.orez.l), sy = Math.round(h0 * u.orez.t);
  const sw = Math.max(8, Math.round(w0 * (1 - u.orez.l - u.orez.r))), sh = Math.max(8, Math.round(h0 * (1 - u.orez.t - u.orez.b)));
  const bocna = u.otocenie === 90 || u.otocenie === 270;
  const ow = bocna ? sh : sw, oh = bocna ? sw : sh;
  const mierka = Math.min(1, max / Math.max(ow, oh));
  const c = cieľ ?? document.createElement('canvas');
  c.width = Math.max(1, Math.round(ow * mierka)); c.height = Math.max(1, Math.round(oh * mierka));
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.save();
  g.translate(c.width / 2, c.height / 2);
  g.rotate((u.otocenie * Math.PI) / 180);
  const dw = (bocna ? c.height : c.width), dh = (bocna ? c.width : c.height);
  g.drawImage(z as CanvasImageSource, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
  g.restore();
  if (u.kontrast !== 1 || u.cb) {
    const px = g.getImageData(0, 0, c.width, c.height);
    upravPixely(px.data, u.kontrast, u.cb);
    g.putImageData(px, 0, 0);
  }
  return c;
}
