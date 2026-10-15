# Ranný prehľad – Recepty

**Appka:** https://mrlukas161.github.io/Recepty/ (verzia v Nastaveniach → „O appke“; `…/version.json` = posledný nasadený commit)

## Inštalácia na Android (Xiaomi 15) v 3 krokoch
1. Otvor odkaz v **Chrome**.
2. ⋮ (menu) → **Inštalovať aplikáciu** / **Pridať na plochu**.
3. Spusti ikonu „Recepty“ – funguje aj offline. (Na celú obrazovku: Nastavenia → „Na celú obrazovku“.) iPhone: Safari → Zdieľať → *Pridať na plochu*.

## Čo appka vie
- **Dnes:** podľa dennej doby návrhy raňajok/obeda/večere zoradené podľa skóre a tvojich preferencií, „Iné návrhy“, stav týždňa (koľkokrát múka, cukor… z limitu).
- **Recepty (197):** raňajky, obedy, večere, polievky, desiaty, dezerty; vyhľadávanie (bez diakritiky), filtre (typ, čas, náročnosť, diéta, detské, „mám doma“, bez vylúčených), zoradenie. 17 klasických múčnych/ťažkých jedál (halušky, rezeň, palacinky…) ako referencia s odkazom na lepšie verzie.
- **Detail:** skóre 0–100 s rozpadom na 10 faktorov (prečo + zdroje), prínosy a slabé stránky, suroviny prepočítané na domácnosť („bez tohto to nejde“ / voliteľné), **úpravy** (vynechať, vymeniť, pridať) s živým prepočtom skóre, režim varenia (veľké písmo, Wake Lock), obľúbené, 👍/👎, „Uvarené“.
- **Jedálniček:** týždeň (raňajky/desiata/obed/večera podľa nastavenia), rešpektuje alergie, vylúčenia, diétu, limity (múka, cukor, údeniny, vyprážané, ťažké), neopakuje recepty, striedá bielkoviny, ryby 1–2×; zamknúť/vymeniť/pregenerovať; súhrn týždňa.
- **Nákup:** z jedálnička alebo receptov, zlúčené množstvá, podľa oddelení obchodu, odškrtávanie, vlastné položky, „mám doma“, zdieľanie.
- **Ruleta**, **Náhrady** (múka, cukor, údeniny, vyprážané, smotana + „Chuť na…?“), **Diéty (14)** s popisom a „Použiť“, **Vedomosti** (14 kariet + zoznam zdrojov), **Nastavenia** (domácnosť, obmedzenia 3-stupňové, alergie, nejem, vybavenie, téma, export/import JSON, reset).
- **Skener zloženia** (Viac → Skener zloženia): staval samostatný agent, pozri `docs/PRIEBEH_SKENER.md` a `docs/vyskum/SKENER.md`.
- Offline PWA, bez backendu, bez kľúčov, dáta len v telefóne.

## Čo je overené a čo odhad
- **Overené vyhľadávaním (originál nečítaný):** 43 zdrojov v `src/data/zdroje/*.json`, adversariálne prekontrolovaných druhým agentom (`docs/vyskum/OVERENIE.md`; nepotvrdené čísla vyradené, nesprávne priradenia zdrojov odstránené). V appke majú viditeľné označenie.
- **Odhad / prax:** váhy a prahy skóre (`docs/vyskum/SKORE.md`), zaradenie surovín (zápal, NOVA, GI), **všetky nutričné hodnoty surovín** (typické hodnoty, USDA/Ciqual nedostupné), recepty (vlastné slová, 2 kontroly agentmi, ale **nik ich neuvaril** – prosím rodinná skúška).
- Nie je to lekárska rada – upozornenie je v appke.

## Čo chýba a prečo
- **Originály zdrojov** nie sú prečítané – sandbox blokuje PubMed/DOI/WHO (iba WebSearch). Po otvorení siete zopakovať rešerš na úroveň `original`.
- Nutričné hodnoty bez tabuliek (USDA/Ciqual) → všetky `odhad: true`.
- Živá adresa sa z cloudu nedá otvoriť (proxy blokuje github.io); nasadenie som overoval cez GitHub Actions (behy úspešné). **Ráno otvor `version.json` a porovnaj s commitom.**
- Plánovač nerieši zvyšky (večera → obed) ani rozdielny čas cez týždeň len približne; nákup nepozná balenia.
- Ilustrácie sú emoji; vlastné SVG chýbajú. Ikona appky je jednoduchá.
- e2e testy bežia na Chromium (nie na reálnom Xiaomi/iPhone).

## Ďalšie návrhy (vyber si)
| Návrh | Prečo | Náročnosť |
|---|---|---|
| Overenie zdrojov v origináli (otvoriť sieť pre PubMed/doi.org) | zvýši dôveryhodnosť na `original` | nízka |
| Nutričné hodnoty z USDA/Ciqual | nahradiť odhady | stredná |
| Rodinná skúška receptov + úprava podľa chuti, fotky vlastných jedál | recepty sú len na papieri | stredná |
| Zvyšky: večera → obed v plánovači, plán „na viac dní“ | menej práce, menej plytvania | stredná |
| Časovač v režime varenia (z textu receptu) | pohodlie pri varení | nízka |
| Synchronizácia medzi mobilmi (QR/odkaz namiesto JSON) | druhý mobil v domácnosti | stredná |
| Vlastné recepty (pridať/importovať) so skóre | rodinné recepty | stredná |
| Kozmetika (INCI) v skeneri | pôvodný nápad | vysoká |
| Sledovanie váhy/príjmu | mimo cieľ appky; len ak chcete | – |
