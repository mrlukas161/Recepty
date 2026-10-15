// Kontrola novej verzie service workera: pri návrate z pozadia a raz za hodinu.
// Samotná výmena verzie ide cez vite-plugin-pwa (autoUpdate + skipWaiting + clientsClaim).

export interface RegLike { update: () => Promise<unknown> }
export interface DocLike { visibilityState: string; addEventListener: (t: string, f: () => void) => void }

export const INTERVAL_MS = 60 * 60 * 1000;
const MIN_ODSTUP_MS = 30 * 1000;

export function pripravAktualizacie(
  reg: RegLike,
  doc: DocLike,
  teraz: () => number = Date.now,
  setInt: (f: () => void, ms: number) => unknown = setInterval,
): () => void {
  let posledna = teraz();
  const skus = () => {
    const t = teraz();
    if (t - posledna < MIN_ODSTUP_MS) return;
    posledna = t;
    reg.update().catch(() => {});
  };
  doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'visible') skus(); });
  setInt(skus, INTERVAL_MS);
  return skus;
}
