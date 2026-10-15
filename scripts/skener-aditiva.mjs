// Prevod taxonómie aditív Open Food Facts (ODbL) na kompaktný JSON pre skener.
// Použitie: node scripts/skener-aditiva.mjs <additives.txt> <výstup.json>
import { readFileSync, writeFileSync } from 'node:fs';
const [, , vstup, vystup] = process.argv;
const bloky = readFileSync(vstup, 'utf8').split(/\n\s*\n/);
const out = [];
const meno = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
for (const b of bloky) {
  const riadky = b.split('\n').filter((r) => !r.startsWith('#') && r.trim());
  const en = riadky.find((r) => r.startsWith('en: E'));
  if (!en) continue;
  const m = /^en: (E\d+[a-z]?(?:\([ivx]+\))?)/i.exec(en);
  if (!m) continue;
  const id = m[1].toUpperCase().replace(/\(([IVX]+)\)/, (_, r) => `(${r.toLowerCase()})`).replace(/^(E\d+)([A-Z])/, (_, a, b) => a + b.toLowerCase());
  const pole = (k) => riadky.find((r) => r.startsWith(k + ':'))?.slice(k.length + 1).trim();
  const jazyk = (l) => (pole(l) ? meno(pole(l)).filter((x) => !/^E\s?-?\d/i.test(x)) : []);
  const triedy = (pole('additives_classes:en') ?? '').split(',').map((x) => x.trim().replace(/^en:/, '')).filter(Boolean);
  const enm = meno(en.slice(3)).filter((x) => !/^E\s?-?\d/i.test(x));
  const o = { id, sk: jazyk('sk'), cs: jazyk('cs'), en: enm, triedy };
  const url = pole('efsa_evaluation_url:en'); if (url) o.efsa = { url, datum: pole('efsa_evaluation_date:en') ?? '' };
  const adi = pole('efsa_evaluation_adi:en'); if (adi) o.adi = adi;
  if (pole('efsa_evaluation_overexposure_risk:en')) o.preexpozicia = pole('efsa_evaluation_overexposure_risk:en');
  if (pole('vegan:en')) o.vegan = pole('vegan:en');
  out.push(o);
}
writeFileSync(vystup, JSON.stringify(out));
console.log(out.length, 'aditív');
