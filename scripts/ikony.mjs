// Ikona appky: tanier zhora s paradajkou a lístkom, rovnaký štýl (hrubý tmavý obrys, plochá paleta) ako ilustrácie v appke.
// Spustenie: node scripts/ikony.mjs  (vyrobí PNG 192, 512, maskable 512 a apple-touch 180)
import sharp from 'sharp';
const L = '#2b2118';
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#c8472b"/><g transform="translate(${pad} ${pad}) scale(${(512 - 2 * pad) / 512})" stroke="${L}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round">
<circle cx="256" cy="256" r="196" fill="#fff1d0"/><circle cx="256" cy="256" r="150" fill="#f6dba0"/>
<path d="M256 142c-70-20-118 28-108 94 8 62 52 102 108 102s100-40 108-102c10-66-38-114-108-94z" fill="#e4664d"/>
<path d="M256 150l-6-44M256 150c-30-34-64-30-80-8 26 22 56 22 80 8zM256 150c30-34 64-30 80-8-26 22-56 22-80 8z" fill="#8fa64a"/>
<path d="M188 236c2-22 16-38 34-44" fill="none" stroke="#fff1d0" stroke-width="14"/>
</g></svg>`;
await sharp(Buffer.from(svg(0))).resize(192).png().toFile('public/icons/icon-192.png');
await sharp(Buffer.from(svg(0))).resize(512).png().toFile('public/icons/icon-512.png');
await sharp(Buffer.from(svg(70))).resize(512).png().toFile('public/icons/maskable-512.png');
await sharp(Buffer.from(svg(0))).resize(180).png().toFile('public/icons/apple-touch-icon.png');
