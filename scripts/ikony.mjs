import sharp from 'sharp';
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#c8472b"/><g transform="translate(${pad} ${pad}) scale(${(512 - 2 * pad) / 512})"><circle cx="256" cy="270" r="170" fill="#fbf4e6"/><circle cx="256" cy="270" r="128" fill="none" stroke="#c8472b" stroke-width="14"/><path d="M256 150c-30 40-30 80 0 120M200 160c-20 30-20 60 0 90M312 160c20 30 20 60 0 90" stroke="#5b6b2f" stroke-width="16" fill="none" stroke-linecap="round"/><rect x="236" y="330" width="40" height="110" rx="20" fill="#5b6b2f" transform="rotate(35 256 380)"/></g></svg>`;
await sharp(Buffer.from(svg(0))).resize(192).png().toFile('public/icons/icon-192.png');
await sharp(Buffer.from(svg(0))).resize(512).png().toFile('public/icons/icon-512.png');
await sharp(Buffer.from(svg(70))).resize(512).png().toFile('public/icons/maskable-512.png');
await sharp(Buffer.from(svg(0))).resize(180).png().toFile('public/icons/apple-touch-icon.png');
