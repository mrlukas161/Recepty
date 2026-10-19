// Vygeneruje docs/RECEPTY_ZOZNAM.md (id, názov, typ všetkých vstavaných receptov) a docs/zoznam-surovin.txt (id | názov | skupina).
// Použitie: npx vite-node scripts/recepty-zoznam.ts
import fs from 'node:fs';
import { RECEPTY, SUROVINY } from '../src/data';

const NAZOV_TYPU: Record<string, string> = { ranajky: 'raňajky', desiata: 'desiata', obed: 'obed', olovrant: 'olovrant', vecera: 'večera', polievka: 'polievka', dezert: 'dezert' };
const riadky = RECEPTY.map((r) => `| \`${r.id}\` | ${r.nazov.replace(/\|/g, '/')} | ${NAZOV_TYPU[r.typ] ?? r.typ} |`);
const out = `# Zoznam receptov (id → názov)

Generované skriptom \`scripts/recepty-zoznam.ts\` (\`npx vite-node scripts/recepty-zoznam.ts\`); test \`tests/foto.test.ts\` kontroluje, že zoznam sedí s dátami.
Počet vstavaných receptov: **${RECEPTY.length}**. Názov súboru fotky = \`<id>.webp\` (pozri „Fotky jedál“ v \`docs/ROZHODNUTIA.md\`).

| id | názov | typ |
|---|---|---|
${riadky.join('\n')}

## Formát receptu pre nové recepty dodané zvonka

Dva spôsoby; oba sú bezpečné (neznáme suroviny sa neprevezmú ako tvrdenie, ale ako voľný text).

### A. JSON na import (odporúčané) – Viac → Moje recepty → Import, alebo Nastavenia → Import

\`\`\`json
{
  "format": "recepty-vlastne",
  "verzia": 1,
  "vytvorene": "2026-10-19T12:00:00.000Z",
  "recepty": [
    {
      "id": "v-cizrnove-placky",
      "nazov": "Cícerové placky so špenátom",
      "typ": "obed",
      "casPripravy": 10,
      "casVarenia": 15,
      "porcie": 2,
      "suroviny": [
        { "id": "cicerova-muka", "mnozstvo": 120, "jednotka": "g" },
        { "id": "vajce-slepacie", "mnozstvo": 2, "jednotka": "ks" },
        { "id": "spenat", "mnozstvo": 100, "jednotka": "g" },
        { "id": "olej-repkovy", "mnozstvo": 1, "jednotka": "lyzica" }
      ],
      "volne": ["štipka soli"],
      "postup": ["Zmiešame múku, vajcia a vodu na hustejšie cesto.", "Pridáme špenát a smažíme na panvici z oboch strán."],
      "tagy": ["bezmasite", "rychle"],
      "vytvorene": "2026-10-19T12:00:00.000Z",
      "upravene": "2026-10-19T12:00:00.000Z"
    }
  ]
}
\`\`\`

Pravidlá: \`id\` začína \`v-\` a má len malé písmená, čísla a pomlčky (max. 40 znakov po \`v-\`); \`typ\` je jedna z hodnôt \`ranajky, desiata, obed, olovrant, vecera, polievka, dezert\`; \`jednotka\` je \`g, ml, ks, lyzica, lyzicka\`; množstvá sú na **celý recept** pre \`porcie\` dospelých; \`suroviny[].id\` musí byť id z \`docs/zoznam-surovin.txt\` (inak ho dajte do \`volne\` ako text); \`tagy\` z: detske, rychle, do-krabicky, lacne, bezmasite, bez-peciva, sladke, na-viac-dni. Texty píšte vlastnými slovami (žiadne kopírovanie z receptových webov), po slovensky s diakritikou.

### B. Zápis do kódu (\`src/data/recepty/*.ts\`, typ \`Recept\` v \`src/data/types.ts\`)

Navyše oproti JSON: \`kuchyna\`, \`narocnost\` (1–3), \`vybavenie[]\`, \`upravy[]\` (tlačidlá „pridať“ / „vymeniť“ so surovinou \`na\`), \`skladovanie\`, \`deti\`, \`klasika\`, \`lepsiaVerzia[]\`, \`vyprazane\`, \`ilustracia\` (emoji, z ktorého appka vyberie ilustráciu). Povinné polia: \`id\` (kebab-case bez diakritiky, jedinečné), \`nazov\`, \`typ\`, \`kuchyna\`, \`casPripravy\`, \`casVarenia\`, \`narocnost\`, \`porcie\`, \`suroviny[]\` (aspoň 2, každé id existuje), \`postup[]\` (aspoň 2 kroky), \`tagy[]\`, \`vybavenie[]\`, \`upravy[]\`, \`ilustracia\`. Validuje \`tests/data.test.ts\`.
`;
fs.writeFileSync('docs/RECEPTY_ZOZNAM.md', out);
fs.writeFileSync('docs/zoznam-surovin.txt', SUROVINY.map((x) => `${x.id} | ${x.nazov} | ${x.skupina}`).join('\n') + '\n');
console.log('hotovo', RECEPTY.length, SUROVINY.length);
