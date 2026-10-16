// Zostaví src/data/vyziva-tabulky.json z mapovania (id → ciqual:/fdc:) a tabuliek z vetvy data-zdroje.
// Použitie: node scripts/vyziva-zostav.mjs <csv-priečinok> <mapa.json> <suroviny.json (id,na100 – starý odhad)>
import fs from 'node:fs';
const [dir, mapF, oldF] = process.argv.slice(2);
const csv = (f) => { const t = fs.readFileSync(f, 'utf8'); const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = ''; } else cur += c; }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const h = rows.shift(); return rows.filter((r) => r.length === h.length).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]]))); };
const cq = new Map(csv(dir + '/ciqual.csv').map((r) => [r.alim_code, r]));
const us = new Map(csv(dir + '/usda.csv').map((r) => [r.fdc_id, r]));
const map = JSON.parse(fs.readFileSync(mapF, 'utf8'));
const old = new Map(JSON.parse(fs.readFileSync(oldF, 'utf8')).map((s) => [s.id, s.na100]));
const r1 = (x) => Math.round(x * 10) / 10;
// Ciqual: "12,5" → 12,5; "traces" → 0 (približné); "< x" → x/2 (približné); "-" alebo prázdne → null
function cnum(v) { v = (v ?? '').trim(); if (!v || v === '-') return { v: null }; if (/^traces?$/i.test(v)) return { v: 0, p: true };
  const m = v.match(/^<\s*([\d,.]+)$/); if (m) return { v: parseFloat(m[1].replace(',', '.')) / 2, p: true };
  const n = parseFloat(v.replace(',', '.')); return Number.isFinite(n) ? { v: n } : { v: null }; }
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const out = {}; const nezhoda = [];
for (const [id, m] of Object.entries(map)) {
  if (!m.zdroj) { out[id] = { pozn: 'odhad – ' + m.dovod }; continue; }
  const [t, kod] = m.zdroj.split(':'); const o = old.get(id); let n, p = false, chyba = [];
  if (t === 'ciqual') { const r = cq.get(kod); if (!r) { nezhoda.push(id + ' ' + m.zdroj); continue; }
    const g = (k) => { const x = cnum(r[k]); if (x.p) p = true; return x.v; };
    let sol = g('sol_g'); if (sol == null) { const na = cnum(r.sodik_mg); sol = na.v == null ? null : na.v * 2.5 / 1000; if (na.p) p = true; }
    const f = { kcal: g('kcal'), bielk: g('bielkoviny_g'), tuky: g('tuky_g'), nasyt: g('nasytene_g'), sach: g('sacharidy_g'), cukry: g('cukry_g'), vlak: g('vlaknina_g'), sol };
    for (const k of Object.keys(f)) if (f[k] == null) { chyba.push(k); f[k] = o[k]; p = true; }
    if (['kcal', 'bielk', 'tuky', 'sach'].some((k) => chyba.includes(k))) { nezhoda.push(id + ' chýba hlavná živina ' + m.zdroj); continue; }
    n = f;
  } else { const r = us.get(kod); if (!r) { nezhoda.push(id + ' ' + m.zdroj); continue; }
    const vl = num(r.vlaknina_g); const car = num(r.sacharidy_g);
    const kc = num(r.kcal) ?? num(r.kcal_atwater_vseob) ?? num(r.kcal_atwater_spec);
    const f = { kcal: kc, bielk: num(r.bielkoviny_g), tuky: num(r.tuky_g), nasyt: num(r.nasytene_g),
      sach: car == null ? null : Math.max(0, car - (vl ?? 0)), cukry: num(r.cukry_g), vlak: vl, sol: num(r.sol_g_vypocet) };
    for (const k of Object.keys(f)) if (f[k] == null) { chyba.push(k); f[k] = o[k]; p = true; }
    if (['kcal', 'bielk', 'tuky', 'sach'].some((k) => chyba.includes(k))) { nezhoda.push(id + ' chýba hlavná živina ' + m.zdroj); continue; }
    n = f; }
  // cukry nemôžu presiahnuť sacharidy bez vlákniny (rozdiel býva zaokrúhlením alebo definíciou tabuľky)
  n.cukry = Math.min(n.cukry, n.sach); n.nasyt = Math.min(n.nasyt, n.tuky);
  out[id] = { z: m.zdroj, n: [n.kcal, n.bielk, n.tuky, n.nasyt, n.sach, n.cukry, n.vlak, n.sol].map(r1), ...(p ? { p: 1 } : {}), ...(chyba.length ? { d: chyba } : {}) };
}
fs.writeFileSync('src/data/vyziva-tabulky.json', JSON.stringify(out, null, 0).replace(/},"/g, '},\n"') + '\n');
console.log('hotovo', Object.keys(out).length, 'nezhody:', nezhoda);
