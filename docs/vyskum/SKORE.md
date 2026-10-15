# Skóre zdravosti – metodika (naša heuristika)

Skóre 0–100 je **orientačná heuristika**, nie klinický nástroj ani výsledok jednej štúdie. Appka to hovorí pri každom recepte.

## Postup
Pre 1 dospelú porciu (celý recept ÷ `porcie`) sa spočíta 10 faktorov, každý 0–100 bodov, a vážený priemer sa **kalibruje** (`58 + (x − 66) × 1,3`, orezané na 0–100), aby sa bežné jedlá nezhlukli v pásme 70–90 (rozhodnutie R3).

| Faktor | Váha | Čo meriame | Smer (prečo) | Prahy (odhad) |
|---|---|---|---|---|
| Zápalový potenciál | 14 | hmotnostný priemer `zapal` surovín (−2…+2) | viac zeleniny, strukovín, rýb, olejov vs. rafinované obilniny, spracované mäso, cukor (logika DII/EDIP) | 50 − 25·priemer |
| Cukor v krvi (GL odhad) | 14 | rafinované sacharidy (70 % hmotnosti rafinovanej múky + pridaný cukor) a čisté sacharidy bez vlákniny | pomalšie sacharidy = menší vzostup glykémie | 10–70 g |
| Vláknina | 14 | g vlákniny / porcia | sýtosť, trávenie | 2–10 g |
| Bielkoviny a sýtosť | 10 | g bielkovín / porcia | sýtosť | 6–28 g |
| Zelenina, ovocie, strukoviny | 12 | podiel hmotnosti | pestrosť rastlín | 10–55 % |
| Spracovanosť | 8 | podiel energie zo surovín NOVA 4 | ultraspracované potraviny | 10–70 % |
| Tuky a vyprážanie | 9 | nasýtené tuky (+8 g ak vyprážané) | nasýtené tuky, vyprážanie | 4–16 g |
| Soľ | 5 | g soli / porcia | WHO: < 5 g denne | 1,5–4 g |
| Pridaný cukor | 6 | g cukru zo surovín s príznakom pridaný cukor | voľné cukry | 4–25 g |
| Ťažkosť | 8 | tuk + 15 (vyprážané) + (kcal − 700)/20 | tučné a veľké jedlá sa trávia dlhšie | 15–50 |

Váhy sú najvyššie pri faktoroch, ktoré sa najviac týkajú cieľov rodiny (múka/cukr → GL a cukor, vláknina, zápal). Súčet váh = 100.

## Čo je odhad
- **Všetky váhy a prahy** sú naše rozhodnutie; zdroje (`src/data/zdroje/*.json`) podporujú len smer, nie konkrétne čísla.
- Zaradenie surovín (zápal, NOVA, GI) je odhad (`odhad: true`).
- Nutričné hodnoty surovín sú typické hodnoty, nie z tabuliek (USDA/Ciqual boli nedostupné).

## Pásma
80+ výborné · 60–79 dobré · 40–59 občas · < 40 zriedka (text + farba, nikdy len farba).

## Testy
`tests/engine.test.ts`: rozsah 0–100, zelenina+strukoviny > biela múka+cukor, vyprážanie neznižuje skóre dole, každý faktor má vysvetlenie; `tests/data.test.ts`: každá „lepšia verzia“ klasiky má vyššie skóre.
