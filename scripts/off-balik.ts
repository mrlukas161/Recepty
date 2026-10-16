// Zostaví balík slovenských výrobkov z Open Food Facts (ODbL) pre public/off/.
// Použitie: npx vite-node scripts/off-balik.ts <sk-vyrobky.jsonl.gz> [cieľový-priečinok=public/off] [rozpočet-bajtov=3000000]
// Vstup: po jednom JSON na riadok (polia ako v API OFF; kód v `code`). Výstup: index.json + diely podľa začiatku kódu.
import fs from 'node:fs';
import zlib from 'node:zlib';
import readline from 'node:readline';
import { mapujOff, platnyKod } from '../src/skener/off';
import type { BalikZaznam, BalikDiel, BalikIndex } from '../src/skener/balik';

const [vstup, ciel = 'public/off', rozp = '3000000'] = process.argv.slice(2);
const ROZPOCET = Number(rozp);
const MAX_ZLOZENIE = 1500;

const zaznamy = new Map<string, { z: BalikZaznam; bohatost: number }>();
let riadkov = 0, bezKodu = 0, neplatnych = 0, neuzitocnych = 0;
const rl = readline.createInterface({ input: fs.createReadStream(vstup).pipe(zlib.createGunzip()), crlfDelay: Infinity });
for await (const riadok of rl) {
  if (!riadok.trim()) continue;
  riadkov++;
  let p: Record<string, unknown>;
  try { p = JSON.parse(riadok); } catch { continue; }
  const kod = String(p.code ?? p._id ?? '').trim();
  if (!kod) { bezKodu++; continue; }
  if (!platnyKod(kod)) { neplatnych++; continue; }
  const v = mapujOff(kod, { status: 1, product: p });
  if (!v) continue;
  const tags = Array.isArray(p.ingredients_tags) ? p.ingredients_tags.length : 0;
  const maVyzivu = Object.values(v.vyziva).some((x) => x != null);
  if (!v.zlozenie && !tags && !maVyzivu) { neuzitocnych++; continue; }
  const d = v.doplnok ?? {};
  const z: BalikZaznam = [
    v.nazov.startsWith('Výrobok ') ? '' : v.nazov.slice(0, 120), (v.znacka ?? '').slice(0, 60), v.zlozenie.slice(0, MAX_ZLOZENIE), v.jazyk ?? '',
    d.e ?? [], d.alergeny ?? [], d.stopy ?? [], (d.cukor ? 1 : 0) | (d.palma ? 2 : 0),
    [v.vyziva.kcal, v.vyziva.tuky, v.vyziva.nasyt, v.vyziva.sach, v.vyziva.cukry, v.vyziva.vlak, v.vyziva.bielk, v.vyziva.sol].map((x) => x ?? null),
    v.nutriscore ?? '', v.nova ?? 0,
  ];
  // bohatosť na prípadné orezanie rozpočtu: zloženie > výživa > len tagy
  const bohatost = (v.zlozenie ? 4 : 0) + (maVyzivu ? 2 : 0) + (v.nazov.startsWith('Výrobok ') ? 0 : 1);
  zaznamy.set(kod, { z, bohatost });
}

const velkost = (m: Map<string, { z: BalikZaznam }>) => [...m].reduce((a, [k, x]) => a + k.length + JSON.stringify(x.z).length + 6, 0);
let vybrane = new Map(zaznamy);
if (velkost(vybrane) > ROZPOCET) {
  const zoradene = [...zaznamy].sort((a, b) => b[1].bohatost - a[1].bohatost);
  vybrane = new Map();
  let b = 0;
  for (const [k, x] of zoradene) { const s = k.length + JSON.stringify(x.z).length + 6; if (b + s > ROZPOCET) continue; b += s; vybrane.set(k, x); }
}

// najkratšia predpona kódu, pri ktorej žiaden diel nepresiahne ~250 kB
function rozdel(dlzka: number) { const m = new Map<string, BalikDiel>(); for (const [k, x] of vybrane) { const kl = k.slice(0, dlzka); (m.get(kl) ?? m.set(kl, {}).get(kl)!)[k] = x.z; } return m; }
let dlzka = 2, diely = rozdel(dlzka);
while (dlzka < 6 && Math.max(...[...diely.values()].map((d) => JSON.stringify(d).length)) > 250_000) diely = rozdel(++dlzka);

fs.rmSync(ciel, { recursive: true, force: true });
fs.mkdirSync(ciel, { recursive: true });
for (const [k, d] of diely) fs.writeFileSync(`${ciel}/${k}.json`, JSON.stringify(d));
const index: BalikIndex = { v: 1, dlzka, diely: [...diely.keys()].sort(), pocet: vybrane.size };
fs.writeFileSync(`${ciel}/index.json`, JSON.stringify(index));
fs.writeFileSync(`${ciel}/README.txt`, 'Výrobky z Open Food Facts (https://world.openfoodfacts.org), © prispievatelia Open Food Facts, licencia ODbL (https://opendatacommons.org/licenses/odbl/1-0/). Stiahnuté 16.10.2026, spracované skriptom scripts/off-balik.ts.\n');
const bajty = [...diely.values()].reduce((a, d) => a + JSON.stringify(d).length, 0);
console.log(JSON.stringify({ riadkov, bezKodu, neplatnych, neuzitocnych, rozne: zaznamy.size, vBaliku: vybrane.size, dlzkaPredpony: dlzka, dielov: diely.size, bajty }));
