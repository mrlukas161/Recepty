// Vlastná sada jednoduchých ilustrácií jedál (SVG, 48×48). Farby idú cez CSS premenné --il-*,
// takže fungujú v svetlej aj tmavej téme. Nahrádza emoji pri receptoch, kategóriách a v navigácii.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { useFoto, fotoUrl } from '../foto';

const P = 'var(--il-pap)', H = 'var(--il-hor)', O = 'var(--il-oli)', K = 'var(--il-kre)', N = 'var(--il-hne)', B = 'var(--il-bob)', M = 'var(--il-mod)', R = 'var(--il-ruz)';

const para = <path d="M17 11c-3 3 3 4 0 8M24 9c-3 3 3 4 0 8M31 11c-3 3 3 4 0 8" fill="none" />;
const misa = (v: string) => <path d="M5 24h38c0 10-8 18-19 18S5 34 5 24z" fill={v} />;

const KRESBY: Record<string, () => ComponentChildren> = {
  polievka: () => <>{para}{misa(M)}<ellipse cx="24" cy="24" rx="19" ry="3.5" fill={H} /><circle cx="17" cy="24" r="1.4" fill={O} stroke="none" /><circle cx="28" cy="25" r="1.4" fill={P} stroke="none" /></>,
  ranajky: () => <><circle cx="24" cy="26" r="9" fill={H} /><path d="M24 11v-3M10 17l-2-2M38 17l2-2M5 28h-3M43 28h3" fill="none" /><path d="M4 42c0-9 9-14 20-14s20 5 20 14z" fill={N} /><path d="M10 40c2-5 8-8 14-8" fill="none" stroke={K} /></>,
  obed: () => <><circle cx="24" cy="25" r="16" fill={K} /><circle cx="24" cy="25" r="10" fill={O} /><circle cx="21" cy="23" r="3.2" fill={P} /><circle cx="28" cy="27" r="2.6" fill={H} /><path d="M3 8v12M6 8v12M9 8v12M3 20h6M6 20v22M43 8c-4 3-4 12 0 14v20" fill="none" /></>,
  vecera: () => <><path d="M34 6a10 10 0 1 0 8 14 8 8 0 0 1-8-14z" fill={H} /><path d="M4 30h40c0 8-8 14-20 14S4 38 4 30z" fill={B} /><path d="M10 30c1-4 4-6 8-6M24 30c0-5 3-7 8-7" fill="none" stroke={K} /></>,
  desiata: () => <><path d="M24 14c-8-5-18 0-16 12 2 10 8 16 13 14 2-1 4-1 6 0 5 2 11-4 13-14 2-12-8-17-16-12z" fill={P} /><path d="M24 14c0-4 2-7 5-9" fill="none" /><path d="M29 5c3 0 6 2 6 5-3 0-6-2-6-5z" fill={O} /><path d="M14 24c0-3 2-5 4-5" fill="none" stroke={K} /></>,
  dezert: () => <><path d="M10 26h28l-3 16H13z" fill={N} /><path d="M10 26c-4-1-4-7 0-8 0-6 8-9 12-5 4-5 14-1 12 6 5 1 5 7 0 7z" fill={R} /><circle cx="24" cy="9" r="3.5" fill={P} /><path d="M17 31v8M24 31v8M31 31v8" fill="none" stroke={K} /></>,
  maso: () => <><path d="M30 6c8 0 12 6 11 13-1 6-6 10-12 10-2 0-3 0-5-1L13 36c1 3-1 6-4 6s-5-3-4-6c-3 1-5-1-5-4 0-3 3-4 5-4l12-12c-1-5 1-11 6-14z" fill={N} /><path d="M33 12c3 0 5 2 5 5" fill="none" stroke={K} /></>,
  ryba: () => <><path d="M3 26c7-9 18-10 27-2l9-8c1 4 1 12 0 16l-9-6c-9 8-20 7-27 0z" fill={M} /><circle cx="12" cy="26" r="1.8" fill="var(--il-ln)" stroke="none" /><path d="M20 22c2 3 2 7 0 10M26 23c1 2 1 5 0 8" fill="none" stroke={K} /></>,
  zelenina: () => <><path d="M16 14c0-4 4-6 8-6s8 2 8 6c0 2 1 4 2 5L26 43c-1 2-3 2-4 0L14 19c1-1 2-3 2-5z" fill={H} transform="rotate(-20 24 26)" /><path d="M12 12c-4-5-1-9 3-9 1 3 1 6-3 9zM19 8c-2-5 2-7 5-6 1 3 0 5-5 6zM28 7c3-3 7-1 7 3-4 1-6 0-7-3z" fill={O} /><path d="M19 28l5 1M22 35l5 1M17 21l4 1" fill="none" stroke={N} /></>,
  cestoviny: () => <><path d="M6 26h36c0 9-7 16-18 16S6 35 6 26z" fill={K} /><path d="M10 26c0-8 6-14 14-14s14 6 14 14" fill={H} /><path d="M14 24c2-6 6-8 10-8s8 2 10 8M18 24c1-3 3-5 6-5s5 2 6 5" fill="none" stroke={N} /><circle cx="24" cy="15" r="3" fill={P} /></>,
  kasa: () => <><path d="M5 22h38c0 11-8 20-19 20S5 33 5 22z" fill={K} /><path d="M7 22c3-5 9-7 17-7s14 2 17 7z" fill={H} /><circle cx="17" cy="19" r="1.3" fill={N} stroke="none" /><circle cx="24" cy="17" r="1.3" fill={N} stroke="none" /><circle cx="31" cy="19" r="1.3" fill={N} stroke="none" /><path d="M30 14l8-10" fill="none" /><ellipse cx="39" cy="7" rx="3.5" ry="2.2" transform="rotate(-50 39 7)" fill={K} /></>,
  salat: () => <><path d="M4 22h40c0 11-8 20-20 20S4 33 4 22z" fill={M} /><path d="M9 22c-2-8 5-12 9-9 2-6 11-6 12 0 5-3 11 2 8 9z" fill={O} /><circle cx="19" cy="18" r="3" fill={P} /><circle cx="30" cy="17" r="2.4" fill={H} /><path d="M24 12v8" fill="none" stroke={K} /></>,
  vajicka: () => <><path d="M8 26c-4-8 2-18 11-18 5 0 7 3 12 3 8 0 13 8 9 16-3 6-10 8-16 8S11 34 8 26z" fill={K} /><circle cx="25" cy="25" r="8" fill={H} /><path d="M21 22c1-2 3-3 5-3" fill="none" stroke={K} /></>,
  strukoviny: () => <><path d="M6 20c0-8 8-12 14-8 4 3 6 8 4 14-2 6-10 8-15 4-3-3-3-6-3-10z" fill={P} /><path d="M26 30c-2-7 3-14 10-14 6 0 10 5 8 12-2 7-12 10-18 2z" fill={N} /><path d="M12 18c0-3 3-5 6-3M32 22c1-2 4-3 6-1" fill="none" stroke={K} /></>,
  palacinky: () => <><ellipse cx="24" cy="36" rx="19" ry="6" fill={H} /><path d="M5 36v-6h38v6" fill={N} /><ellipse cx="24" cy="30" rx="19" ry="6" fill={H} /><ellipse cx="24" cy="24" rx="19" ry="6" fill={N} /><ellipse cx="24" cy="18" rx="19" ry="6" fill={H} /><rect x="19" y="11" width="10" height="7" rx="1" fill={K} /></>,
  sendvic: () => <><path d="M5 20c0-9 8-13 19-13s19 4 19 13z" fill={H} /><path d="M5 24c4 3 6-2 10 0s6-2 10 0 6-2 10 0 4 1 8-1v4H5z" fill={O} /><rect x="5" y="28" width="38" height="5" rx="2" fill={P} /><path d="M5 33h38v2c0 4-3 7-7 7H12c-4 0-7-3-7-7z" fill={H} /><circle cx="16" cy="13" r="1" fill={K} stroke="none" /><circle cx="26" cy="11" r="1" fill={K} stroke="none" /><circle cx="33" cy="14" r="1" fill={K} stroke="none" /></>,
  placky: () => <><circle cx="24" cy="26" r="17" fill={N} /><circle cx="24" cy="26" r="12" fill={H} /><circle cx="19" cy="22" r="2.4" fill={O} /><circle cx="28" cy="25" r="2.4" fill={P} /><circle cx="22" cy="31" r="2" fill={O} /></>,
  pizza: () => <><path d="M24 44L5 14c12-9 26-9 38 0z" fill={H} /><path d="M5 14c12-9 26-9 38 0" fill="none" stroke-width="4.5" /><circle cx="19" cy="21" r="3.5" fill={P} /><circle cx="29" cy="23" r="3.5" fill={P} /><circle cx="24" cy="32" r="3" fill={P} /></>,
  wrap: () => <><path d="M6 36L30 8c6-1 12 3 11 10L17 44c-5 1-12-2-11-8z" fill={K} /><path d="M10 33l22-24c4 1 6 4 6 9L15 41c-3 0-5-3-5-8z" fill={O} /><circle cx="22" cy="28" r="2.8" fill={P} /><circle cx="30" cy="21" r="2.4" fill={H} /></>,
  ryza: () => <><path d="M5 22h38c0 11-8 20-19 20S5 33 5 22z" fill={B} /><path d="M7 22c0-8 7-13 17-13s17 5 17 13z" fill={K} /><path d="M14 17l3 1M21 13l3 2M28 14l3 1M32 19h3M18 20h3M26 19l3 1" fill="none" stroke={N} /><path d="M33 3L23 14M38 5L28 16" fill="none" /></>,
  ovocie: () => <><path d="M24 14c-10-6-19 2-16 14 2 8 8 14 16 14s14-6 16-14c3-12-6-20-16-14z" fill={P} /><path d="M24 14l-2-6M24 14c4-6 10-6 12-4-2 4-6 6-12 4zM24 14c-4-6-10-6-12-4 2 4 6 6 12 4z" fill={O} /><circle cx="16" cy="26" r="1.1" fill={K} stroke="none" /><circle cx="24" cy="30" r="1.1" fill={K} stroke="none" /><circle cx="32" cy="26" r="1.1" fill={K} stroke="none" /><circle cx="20" cy="36" r="1.1" fill={K} stroke="none" /><circle cx="29" cy="36" r="1.1" fill={K} stroke="none" /></>,
  susienka: () => <><circle cx="24" cy="24" r="19" fill={H} /><circle cx="16" cy="17" r="3" fill={N} /><circle cx="29" cy="14" r="2.6" fill={N} /><circle cx="32" cy="27" r="3" fill={N} /><circle cx="18" cy="31" r="2.8" fill={N} /><circle cx="24" cy="23" r="2" fill={N} /></>,
  huby: () => <><path d="M4 24c0-11 9-18 20-18s20 7 20 18c0 3-3 4-6 4H10c-3 0-6-1-6-4z" fill={N} /><path d="M17 28c0 8-2 12-4 14h22c-2-2-4-6-4-14z" fill={K} /><circle cx="16" cy="17" r="3" fill={K} stroke="none" /><circle cx="29" cy="14" r="2.4" fill={K} stroke="none" /><circle cx="35" cy="21" r="2" fill={K} stroke="none" /></>,
  zemiaky: () => <><path d="M8 24c0-10 8-17 18-17 9 0 15 6 14 15-1 10-9 19-19 19-8 0-13-7-13-17z" fill={H} /><path d="M15 18l2 1M27 14l2 2M32 26l2 1M19 31h2M26 36l1 2M12 28l1 2" fill="none" stroke={N} /></>,
  hrniec: () => <><path d="M8 18h32v16c0 6-5 10-10 10H18c-5 0-10-4-10-10z" fill={P} /><rect x="6" y="14" width="36" height="6" rx="3" fill={N} /><path d="M15 9c-2 2 2 3 0 5M24 7c-2 2 2 3 0 5M33 9c-2 2 2 3 0 5" fill="none" /><path d="M14 26v10" fill="none" stroke={K} /></>,
  syr: () => <><path d="M4 32L40 14c3 4 4 10 4 18z" fill={H} /><path d="M4 32v8h40v-8z" fill={N} /><circle cx="22" cy="31" r="3" fill={K} /><circle cx="34" cy="28" r="2.2" fill={K} /><circle cx="15" cy="37" r="1.5" fill={K} stroke="none" /></>,
  orechy: () => <><path d="M24 44c-8 0-13-7-13-16 0-3 1-5 2-7h22c1 2 2 4 2 7 0 9-5 16-13 16z" fill={N} /><path d="M24 44c-3-4-4-10-4-16M24 44c3-4 4-10 4-16" fill="none" stroke={K} /><path d="M9 21c0-8 7-13 15-13s15 5 15 13z" fill={K} /><path d="M15 21l4-9M23 21l-2-12M31 21l-4-10M37 19l-5-6" fill="none" stroke={N} /><path d="M24 8c0-3 2-5 5-5" fill="none" /></>,
  chlieb: () => <><path d="M7 20c-2-8 6-13 17-13s19 5 17 13c-1 3-3 3-3 6v12c0 3-2 5-5 5H15c-3 0-5-2-5-5V26c0-3-2-3-3-6z" fill={N} /><path d="M17 15l5 8M26 14l5 8" fill="none" stroke={K} /></>,
  napoj: () => <><path d="M10 12h28l-3 30H13z" fill={R} /><path d="M11 20h26" fill="none" /><path d="M24 12L30 3h6" fill="none" /><circle cx="22" cy="30" r="2.2" fill={K} stroke="none" /><circle cx="28" cy="35" r="1.8" fill={K} stroke="none" /></>,
  // navigácia a ruleta
  'nav-dnes': () => <><path d="M6 24L24 7l18 17" fill="none" /><path d="M11 21v21h26V21" fill={H} /><rect x="20" y="29" width="8" height="13" fill={P} /></>,
  'nav-recepty': () => <><path d="M24 11c-4-4-12-4-18-2v30c6-2 14-2 18 2 4-4 12-4 18-2V9c-6-2-14-2-18 2z" fill={K} /><path d="M24 11v30" fill="none" /><path d="M11 17c3-1 8-1 9 1M11 24c3-1 8-1 9 1M28 18c1-2 6-2 9-1" fill="none" stroke={P} /></>,
  'nav-jedalnicek': () => <><rect x="6" y="9" width="36" height="33" rx="4" fill={K} /><rect x="6" y="9" width="36" height="10" rx="4" fill={P} /><path d="M15 5v8M33 5v8" fill="none" /><circle cx="16" cy="27" r="2.2" fill={O} /><circle cx="24" cy="27" r="2.2" fill={H} /><circle cx="32" cy="27" r="2.2" fill={O} /><circle cx="16" cy="35" r="2.2" fill={H} /><circle cx="24" cy="35" r="2.2" fill={P} /></>,
  'nav-nakup': () => <><path d="M5 8h6l5 24h22l4-17H13" fill={K} /><circle cx="19" cy="40" r="3" fill={H} /><circle cx="35" cy="40" r="3" fill={H} /><path d="M20 20h18M21 26h16" fill="none" stroke={P} /></>,
  'nav-viac': () => <><circle cx="10" cy="24" r="4" fill={H} /><circle cx="24" cy="24" r="4" fill={P} /><circle cx="38" cy="24" r="4" fill={O} /></>,
  // odkazy v ponuke Viac a ikony kariet
  'nav-nahrady': () => <><path d="M9 20a15 15 0 0 1 27-6" fill="none" stroke-width="3" /><path d="M39 5v10H29z" fill={H} /><path d="M39 28a15 15 0 0 1-27 6" fill="none" stroke-width="3" /><path d="M9 43V33h10z" fill={O} /><circle cx="24" cy="24" r="4" fill={P} /></>,
  'nav-diety': () => <><circle cx="24" cy="26" r="16" fill={K} /><circle cx="24" cy="26" r="9" fill={O} /><path d="M24 10c0-4 3-6 7-6 0 4-3 6-7 6z" fill={O} /></>,
  'nav-kozmetika': () => <><rect x="18" y="6" width="12" height="8" rx="2" fill={H} /><path d="M20 14h8v4l5 5v17a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V23l5-5z" fill={K} /><circle cx="24" cy="31" r="5" fill={M} /></>,
  'nav-skener': () => <><rect x="5" y="14" width="38" height="26" rx="5" fill={K} /><path d="M16 14l3-6h10l3 6" fill={H} /><circle cx="24" cy="27" r="8" fill={M} /><circle cx="24" cy="27" r="3" fill={P} /></>,
  'nav-prenos': () => <><rect x="13" y="4" width="22" height="40" rx="4" fill={K} /><path d="M18 10h12M22 39h4" fill="none" /><path d="M4 22l6-5v3h6v4h-6v3zM44 30l-6 5v-3h-6v-4h6v-3z" fill={H} /></>,
  'nav-nastavenia': () => <><path d="M21 4h6l1 5 4 2 5-3 4 4-3 5 2 4 5 1v6l-5 1-2 4 3 5-4 4-5-3-4 2-1 5h-6l-1-5-4-2-5 3-4-4 3-5-2-4-5-1v-6l5-1 2-4-3-5 4-4 5 3 4-2z" fill={H} transform="scale(.9) translate(2.6 2.6)" /><circle cx="24" cy="24" r="6" fill={K} /></>,
  mlieko: () => <><path d="M14 18h20l-2 24H16z" fill={K} /><path d="M12 8h24v10H12z" fill={M} /><path d="M15 28h18" fill="none" stroke={M} /></>,
  paradajka: () => <><path d="M24 12c-12-3-19 5-18 15 1 9 8 15 18 15s17-6 18-15c1-10-6-18-18-15z" fill={P} /><path d="M24 12l-6-5M24 12l6-5M24 12l-9 1M24 12l9 1M24 12V6" fill="none" stroke={O} stroke-width="3" /><path d="M14 26c0-4 2-6 5-7" fill="none" stroke={K} /></>,
  avokado: () => <><path d="M26 4c-6 0-9 6-10 11-1 5-7 8-7 17 0 8 6 12 13 12s13-4 13-12c0-12-5-28-9-28z" fill={O} /><path d="M26 12c-4 0-6 5-6 9s-5 5-5 11c0 5 4 8 9 8s9-3 9-8c0-8-3-20-7-20z" fill={K} /><circle cx="25" cy="31" r="6" fill={N} /></>,
  muka: () => <><path d="M12 12h24l4 30H8z" fill={K} /><path d="M12 12c4-6 20-6 24 0" fill={N} /><path d="M16 26h16M18 32h12" fill="none" stroke={N} /><path d="M24 8v-4" fill="none" /></>,
  cukor: () => <><rect x="8" y="22" width="16" height="16" rx="2" fill={K} /><rect x="24" y="26" width="16" height="12" rx="2" fill={K} /><rect x="14" y="8" width="14" height="14" rx="2" fill={K} transform="rotate(-10 21 15)" /><path d="M12 28h8M28 32h8" fill="none" stroke={M} /></>,
  udeniny: () => <><path d="M8 34C2 28 6 14 16 12l22 20c-4 10-18 10-30 2z" fill={P} /><path d="M38 32l6 4M12 14l-4-6" fill="none" /><path d="M18 18c6 6 10 12 14 14M14 24c4 4 8 8 10 10" fill="none" stroke={K} /></>,
  vyprazane: () => <><path d="M8 20h32l-4 24H12z" fill={P} /><rect x="12" y="6" width="5" height="16" rx="1" fill={H} transform="rotate(-8 14 14)" /><rect x="19" y="4" width="5" height="18" rx="1" fill={H} /><rect x="26" y="6" width="5" height="16" rx="1" fill={H} transform="rotate(8 28 14)" /><rect x="32" y="9" width="5" height="13" rx="1" fill={H} transform="rotate(16 34 15)" /></>,
  balik: () => <><path d="M24 5L6 14v20l18 9 18-9V14z" fill={N} /><path d="M6 14l18 9 18-9M24 23v20" fill="none" stroke={K} /><path d="M15 9l18 9" fill="none" stroke={K} /></>,
  sol: () => <><path d="M14 18h20l3 24H11z" fill={K} /><path d="M14 18c0-8 4-12 10-12s10 4 10 12z" fill={M} /><circle cx="20" cy="11" r="1.1" fill={K} stroke="none" /><circle cx="24" cy="10" r="1.1" fill={K} stroke="none" /><circle cx="28" cy="11" r="1.1" fill={K} stroke="none" /><path d="M17 30h14" fill="none" stroke={M} /></>,
  brucho: () => <><path d="M14 8c-6 6-8 16-4 24 3 6 9 10 16 10 8 0 14-6 14-14 0-8-6-12-10-14-4-1-8-4-16-6z" fill={R} /><path d="M26 26c-2-3-6-3-8 0" fill="none" stroke={K} /></>,
  plamen: () => <><path d="M24 3c2 8 12 12 12 24 0 9-6 16-12 16S12 36 12 28c0-5 3-8 5-11 1 4 3 5 4 5 0-8 0-14 3-19z" fill={P} /><path d="M24 43c-4 0-7-4-7-8 0-4 4-6 7-12 3 6 7 8 7 12 0 4-3 8-7 8z" fill={H} /></>,
  dieta: () => <><circle cx="24" cy="25" r="17" fill={H} /><circle cx="18" cy="22" r="2" fill="var(--il-ln)" stroke="none" /><circle cx="30" cy="22" r="2" fill="var(--il-ln)" stroke="none" /><path d="M17 30c4 5 10 5 14 0" fill="none" /><path d="M20 8c2-4 8-4 8 0" fill="none" /></>,
  ruleta: () => <><circle cx="24" cy="24" r="18" fill={K} /><path d="M24 24V6a18 18 0 0 1 18 18z" fill={P} /><path d="M24 24h18a18 18 0 0 1-18 18z" fill={H} /><path d="M24 24v18A18 18 0 0 1 6 24z" fill={O} /><circle cx="24" cy="24" r="4" fill={K} /></>,
};

export type TypIlustracie = keyof typeof KRESBY;
KRESBY.olovrant = KRESBY.desiata;
export const TYPY_ILUSTRACII = Object.keys(KRESBY) as TypIlustracie[];

// Pôvodné emoji receptov -> typ ilustrácie (údaje receptov ostávajú, appka zobrazuje ilustráciu).
const Z_EMOJI: Record<string, string> = {
  '🌮': 'wrap', '🌯': 'wrap', '🥙': 'wrap', '🫓': 'wrap', '🌶️': 'zelenina', '🌾': 'kasa', '🍄': 'huby', '🍅': 'paradajka', '🍆': 'zelenina',
  '🍊': 'ovocie', '🍌': 'ovocie', '🍎': 'ovocie', '🍐': 'ovocie', '🍑': 'ovocie', '🍓': 'ovocie', '🥭': 'ovocie', '🫐': 'ovocie',
  '🍔': 'sendvic', '🥪': 'sendvic', '🍕': 'pizza', '🍖': 'maso', '🍗': 'maso', '🍚': 'ryza', '🍛': 'ryza', '🍱': 'ryza', '🥢': 'ryza',
  '🍜': 'cestoviny', '🍝': 'cestoviny', '🍞': 'chlieb', '🍠': 'zemiaky', '🥔': 'zemiaky', '🍦': 'dezert', '🍨': 'dezert', '🍩': 'dezert',
  '🍰': 'dezert', '🧁': 'dezert', '🥧': 'dezert', '🥮': 'susienka', '🍫': 'dezert', '🧡': 'dezert', '🍪': 'susienka', '🍲': 'hrniec', '🥘': 'hrniec', '🫙': 'hrniec',
  '🍳': 'vajicka', '🥚': 'vajicka', '🥞': 'palacinky', '🐟': 'ryba', '🐠': 'ryba', '🫘': 'strukoviny', '🧆': 'placky', '🥟': 'placky',
  '🥗': 'salat', '🥬': 'salat', '🥛': 'mlieko', '🧀': 'syr', '🥜': 'orechy', '🥤': 'napoj', '🥣': 'kasa', '🫑': 'zelenina', '🥒': 'zelenina',
  '🔁': 'nav-nahrady', '📚': 'nav-recepty', '📷': 'nav-skener', '🧴': 'nav-kozmetika', '🎰': 'ruleta', '📲': 'nav-prenos', '⚙️': 'nav-nastavenia', '🔄': 'nav-nahrady',
  '🍬': 'cukor', '🥓': 'udeniny', '🍟': 'vyprazane', '📦': 'balik', '🧂': 'sol', '🫄': 'brucho', '🔥': 'plamen', '👶': 'dieta',
  '🥕': 'zelenina', '🥦': 'zelenina', '🎃': 'zelenina', '🧄': 'zelenina', '🥑': 'avokado',
};

/** Typ ilustrácie pre recept: podľa pôvodného emoji, inak podľa kategórie jedla. */
export function typIlustracie(r: { typ: string; ilustracia?: string }): TypIlustracie {
  const e = r.ilustracia ? Z_EMOJI[r.ilustracia] : undefined;
  if (r.typ === 'polievka' && (!e || e === 'hrniec')) return 'polievka';
  const t = e ?? r.typ;
  return (t in KRESBY ? t : 'obed') as TypIlustracie;
}
export const emojiMaIlustraciu = (e: string) => e in Z_EMOJI;

export function Ilustracia({ typ, velkost = 40, nazov }: { typ: TypIlustracie | string; velkost?: number; nazov?: string }) {
  const k = KRESBY[typ] ?? KRESBY.obed;
  return (
    <svg class="il" viewBox="0 0 48 48" width={velkost} height={velkost} role={nazov ? 'img' : undefined} aria-label={nazov} aria-hidden={nazov ? undefined : 'true'} data-il={typ}
      fill="none" stroke="var(--il-ln)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      {k()}
    </svg>
  );
}

/** Fotka jedla (ak existuje `public/foto/<id>.webp` a je v zozname), inak ilustrácia. AI fotka je nenápadne označená „AI“. */
export function FotoReceptu({ r, velkost = 38, velka = false }: { r: { id: string; typ: string; ilustracia?: string }; velkost?: number; velka?: boolean }) {
  const f = useFoto(r.id);
  const [chyba, setChyba] = useState(false);
  if (!f || chyba) return <IlustraciaReceptu r={r} velkost={velkost} />;
  const popis = f.ai ? `Obrázok vytvorený umelou inteligenciou${f.model ? ` (${f.model}${f.datum ? ', ' + f.datum : ''})` : ''}; ilustračný, nie fotka z tohto receptu.` : '';
  return (
    <span class={`foto${velka ? ' foto-velka' : ''}`} data-foto={r.id} style={velka ? undefined : `width:${velkost}px;height:${velkost}px`}>
      <img src={fotoUrl(r.id)} alt="" loading="lazy" decoding="async" onError={() => setChyba(true)} />
      {f.ai && <span class="foto-ai" title={popis} aria-label={popis} role="img">AI</span>}
    </span>
  );
}

/** Ilustrácia receptu. */
export function IlustraciaReceptu({ r, velkost }: { r: { typ: string; ilustracia?: string }; velkost?: number }) {
  return <Ilustracia typ={typIlustracie(r)} velkost={velkost} />;
}

const KARTA: Record<string, string> = { '🌾': 'muka', '🥗': 'nav-diety' };

export const KARTA_IKONY = (e: string): string | undefined => KARTA[e] ?? Z_EMOJI[e];

/** Ikona karty z textového kľúča (emoji v dátach) -> ilustrácia; neznáme emoji ostane textom. */
export function IkonaKarty({ e, velkost = 32 }: { e: string; velkost?: number }) {
  const t = KARTA_IKONY(e);
  return t ? <Ilustracia typ={t} velkost={velkost} /> : <span aria-hidden="true">{e}</span>;
}
