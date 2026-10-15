#!/usr/bin/env node
/**
 * Databáza INCI pre skener kozmetiky: zdrojový zoznam látok a zdrojov -> src/kozmetika/data/{latky,zdroje}.json.
 * Spustenie: `node scripts/kozmetika-data.mjs` (zapíše súbory) alebo `--kontrola` (len overí, že súbory sedia).
 *
 * PRAVIDLÁ (CLAUDE.md): číslo (limit) je uvedené len tam, kde ho potvrdili výsledky vyhľadávania (úroveň `vyhladavanie`,
 * ≥ 2 zdroje). Zaradenie alebo vysvetlenie bez takého potvrdenia má úroveň `odhad` a v appke je výslovne označené.
 * Hodnotenia iných aplikácií nepreberáme. Funkcie sú naše zjednodušené zhrnutie funkčných kategórií CosIng
 * (databáza CosIng nebola v tomto behu prístupná, nič z nej sa nekopíruje).
 */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const KOREN = join(dirname(fileURLToPath(import.meta.url)), '..');
const VYSTUP = join(KOREN, 'src/kozmetika/data');

/** Zdroje: id -> [názov, url]. Všetky na úrovni `vyhladavanie` (existencia a záver potvrdené výsledkami WebSearch 15. 10. 2026; originál nečítaný). */
export const ZDROJE = {
  r1223: ['Nariadenie (ES) č. 1223/2009 o kozmetických výrobkoch (prílohy II–VI)', 'https://eur-lex.europa.eu/legal-content/SK/TXT/?uri=CELEX:32009R1223'],
  'r1004-2014': ['Nariadenie Komisie (EÚ) č. 1004/2014 – parabény v Prílohe V', 'https://www.legislation.gov.uk/eur/2014/1004'],
  'paraben-de': ['Príloha V (nemecký prepis: butylparabén, propylparabén – súčet 0,14 % ako kyselina)', 'https://www.umwelt-online.de/recht/euarchive/08_09/09_1223a_22_09_1/09_1223d.htm'],
  'mit-obs': ['CosmeticOBS: metylizotiazolinón zakázaný v nezmývateľných výrobkoch (nar. 2016/1198)', 'https://cosmeticobs.com/en/articles/news-59/reminder-mit-is-now-banned-in-leave-on-products-3791'],
  'mit-biorius': ['Biorius: metylizotiazolinón max. 15 ppm v zmývateľných výrobkoch (nar. 2017/1224)', 'https://biorius.com/?p=44117'],
  'echa-v': ['ECHA – Príloha V, povolené konzervanty (databáza)', 'https://echa.europa.eu/cosmetics-preservatives/-/legislationlist/substance/100.103.285'],
  'safic-v': ['Safic-Alcan: Konzervanty v kozmetike – prehľad Prílohy V', 'https://www.safic-alcan.com/en-fr/industry-articles/preservatives-cosmetics-guide/'],
  'sccs-fenoxy': ['SCCS: stanovisko k fenoxyetanolu (SCCS/1575/16) – bezpečný ako konzervant do 1,0 %', 'https://health.ec.europa.eu/publications/phenoxyethanol_en'],
  'fenoxy-media': ['Personal Care Magazine: fenoxyetanol potvrdený ako bezpečný do 1 % (deti: MoS ≈ 50)', 'https://personalcaremagazine.com/story/17788/phenoxyethanol-preservative-confirmed-as-safe-at-1'],
  'sccs-okto': ['SCCS: stanovisko k oktokrylénu (SCCS/1627/21)', 'https://health.ec.europa.eu/publications/octocrylene_en'],
  'r2022-1176': ['Nariadenie Komisie (EÚ) 2022/1176 – benzofenón-3 a oktokrylén v Prílohe VI', 'https://eur-lex.europa.eu/eli/reg/2022/1176/oj'],
  'bp3-ceway': ['Ceway: aktualizácie Prílohy VI (benzofenón-3: 6 % / 2,2 % / 0,5 %)', 'https://news.ceway.eu/eu-cosmetics-regulation-annex-vi-updates/'],
  'sccs-homo': ['SCCS: vedecké stanovisko k homosalátu', 'https://health.ec.europa.eu/publications/scientific-advice-safety-homosalate-cas-no-118-56-9-ec-no-204-260-8-uv-filter-cosmetic-products_da'],
  'r2022-2195': ['Nariadenie Komisie (EÚ) 2022/2195 – homosalát v Prílohe VI (súhrn)', 'https://lawplayer.com/eu/act/32022R2195'],
  'homo-obs': ['CosmeticOBS: nové obmedzenia homosalátu (1. 1. 2025 / 1. 7. 2025)', 'https://client.cosmeticobs.com/en/articles/news-59/homosalate-new-restrictions-come-into-force-8525'],
  'echa-uv': ['ECHA – Príloha VI, povolené UV filtre (databáza)', 'https://echa.europa.eu/cosmetics-uv-filters/-/legislationlist/substance/100.033.327'],
  'tio2-sgs': ['SGS: nar. 2021/850 – oxid titaničitý, salicylová kyselina (Príloha III, IV, VI)', 'https://www.sgs.com/en/news/2021/07/safeguards-10021-eu-amends-cosmetics-regulation-in-response-to-cmr-substances'],
  'tio2-ceway': ['Ceway: aktualizácie k oxidu titaničitému a kyseline salicylovej', 'https://news.ceway.eu/regulatory-updates-concerning-titanium-dioxide-and-salicylic-acid/'],
  'd4d5d6-obs': ['CosmeticOBS: nar. 2024/1328 – nové obmedzenia D4, D5 a D6', 'https://cosmeticobs.com/en/articles/european-commission-45/regulation-20241328-new-restrictions-for-d4-d5-and-d6-8116'],
  'd4d5d6-bio': ['Biorius: obmedzenia D4, D5, D6', 'https://biorius.com/cosmetic-news/d4-d5-d6-restrictions/'],
  'r2021-1902': ['Nariadenie Komisie (EÚ) 2021/1902 – látky CMR v Prílohe II (Lilial)', 'https://criticalcatalyst.com/butylphenyl-methylpropional-to-be-prohibited-in-cosmetics-placed-in-the-eu-market/'],
  'lilial-obelis': ['Obelis: Lilial klasifikovaný ako CMR', 'https://www.obelis.net/news/lilial-classified-as-a-cmr-substance/'],
  'alerg-ec': ['Európska komisia (SCCS, laická verzia): 26 vonných alergénov v Prílohe III, položky 67–92', 'https://ec.europa.eu/health/scientific_committees/opinions_layman/perfume-allergies/en/l-3/1-introduction.htm'],
  'alerg-hpra': ['HPRA: označovanie vonných alergénov (0,001 % / 0,01 %)', 'https://www.hpra.ie/regulation/cosmetics/labelling-and-claims/cosmetic-products-labelling/labelling-of-cosmetic-fragrance-allergens'],
  'r2023-1545': ['Nariadenie Komisie (EÚ) 2023/1545 – rozšírenie zoznamu vonných alergénov (31. 7. 2026 / 31. 7. 2028)', 'https://coslaw.eu/more-allergens-to-be-individually-labelled-cosmetics/'],
  'r2023-2055': ['Nariadenie Komisie (EÚ) 2023/2055 – syntetické polymérne mikročastice (REACH, príloha XVII)', 'https://single-market-economy.ec.europa.eu/sectors/chemicals/reach/restrictions/commission-regulation-eu-20232055-restriction-microplastics-intentionally-added-products_en'],
  'mikro-bio': ['Biorius: mikroplasty v kozmetike (prechodné obdobia)', 'https://biorius.com/cosmetic-news/microplastics-in-cosmetics/'],
  'r2024-996-obs': ['CosmeticOBS: nar. 2024/996 – vitamín A, arbutín a ďalšie látky', 'https://cosmeticobs.com/en/articles/regulation-57/regulation-2024996-restrictions-on-vitamin-a-arbutin-and-6-endocrine-disruptors-8029'],
  'r2024-996-cos': ['Coslaw: nar. 2024/996 – retinol a ďalšie zakázané alebo obmedzené látky', 'https://coslaw.eu/new-amendment-to-cosmetics-regulation-retinol-and-other-substances-banned-or-restricted-in-cosmetics/'],
  'tricl-obelis': ['Obelis: nové obmedzenia retinolu, triklokarbánu a triklosánu', 'https://www.obelis.net/news/upcoming-cosmetics-deadline-in-the-eu-new-restrictions-on-retinol-retinol-equivalents-and-triclocarban-and-triclosan/'],
  'uk-sag-form': ['UK SAG-CS: stanovisko k látkam uvoľňujúcim formaldehyd (formaldehyd v Prílohe II od 2019)', 'https://assets.publishing.service.gov.uk/media/682dde5ca599d03a16bff3b2/sag-cs-opinion-16-formaldehyde-releasing-substances.pdf'],
  'form-exp': ['Exponent: formaldehyd a jeho uvoľňovače v nariadení o kozmetike', 'https://www.exponent.com/article/new-european-cosmetics-regulation-amendment-formaldehyde-releasers'],
  'ema-sls': ['EMA: lauryl sulfát sodný ako pomocná látka – hlásené podráždenie kože pri dlhšej aplikácii', 'https://ema.europa.eu/documents/report/background-review-sodium-laurilsulfate-used-excipient-context-revision-guideline-excipients-label_en.pdf'],
  'cir-laureth': ['CIR (1983): laureth sulfáty – podráždenie pokožky a očí pri niektorých testoch', 'https://journals.sagepub.com/doi/10.3109/10915818309140713'],
  'ec-parfum': ['Európska komisia: SCCS – alergie na parfumy (úvod)', 'https://ec.europa.eu/health/scientific_committees/opinions_layman/perfume-allergies/en/l-3/1-introduction.htm'],
};

const V = 'vyhladavanie', O = 'odhad';
const ODHAD_NEUTRAL = 'Bežná zložka; uvádzame len funkciu. Zhrnutie funkcie je naše, nie citát z CosIng; rizikové tvrdenie k nej nemáme.';

/**
 * Látky. Pole: [id, 'INCI|synonymá', 'funkcie', trieda, stupeň, dôvod, [zdroje], úroveň, voliteľné {limit, max, os, nano}]
 * trieda: zakazana | obmedzena | alergen | draziva | konzervant | uv | mikroc | siloxan | vona | farbivo | ina
 * stupeň: zakazana | diskusia | obmedzena | pozor | ok
 * os (osobné príznaky): citliva | vona | tehotenstvo | deti ; max = najvyššia povolená koncentrácia v % (len overené)
 */
const L = [];
const p = (id, mena, funkcie, trieda, stupen, dovod, zdroje, uroven, extra = {}) => L.push({ id, mena: mena.split('|'), f: funkcie.split(';').map((x) => x.trim()), t: trieda, s: stupen, d: dovod, z: zdroje, u: uroven, ...extra });

// --- zakázané (Príloha II) ---
p('formaldehyd', 'Formaldehyde|Formalin', 'konzervant (už nepovolený)', 'zakazana', 'zakazana',
  'Formaldehyd bol v EÚ vyradený z Príloh III a V v roku 2019 po klasifikácii ako karcinogén kat. 1B a patrí do Prílohy II (zakázané látky). V hotovom výrobku by sa nemal objaviť ako zložka; nájdeš ho len ako možné neúmyselné uvoľnenie z povolených uvoľňovačov.',
  ['uk-sag-form', 'form-exp'], V);
p('lilial', 'Butylphenyl Methylpropional|BMHCA|Lilial', 'vonná látka (už zakázaná)', 'zakazana', 'zakazana',
  'Zakázaný v EÚ (Príloha II) nariadením 2021/1902 po klasifikácii ako CMR 1B (nar. 2020/1182 o klasifikácii); od 1. 3. 2022 sa výrobky s ním nesmú predávať. Ak ho vidíš na obale, ide o starý alebo mimoeurópsky výrobok.',
  ['r2021-1902', 'lilial-obelis'], V);

// --- konzervanty ---
p('mit', 'Methylisothiazolinone|MIT|Metylizotiazolinón', 'konzervant', 'konzervant', 'diskusia',
  'V nezmývateľných výrobkoch (krémy, nezmývateľné produkty, vlhčené utierky) je v EÚ zakázaný od roku 2017 (nar. 2016/1198); v zmývateľných sa smie najviac 15 ppm (0,0015 %; nar. 2017/1224). Predpisy reagovali na obavy z kontaktnej alergie. Ak ho nájdeš v nezmývateľnom výrobku, ide o nesúlad s predpisom.',
  ['mit-obs', 'mit-biorius'], V, { limit: 'zmývateľné: 15 ppm; nezmývateľné: zakázané', max: 0.0015, os: ['citliva', 'deti'] });
p('mci', 'Methylchloroisothiazolinone|MCI|Metylchlórizotiazolinón', 'konzervant', 'konzervant', 'diskusia',
  'Povolený len v zmesi s metylizotiazolinónom podľa Prílohy V (položka 39 podľa databázy ECHA); podmienky použitia (zmes, typ výrobku) pozri v predpise – číslo tu neuvádzame, lebo sme ho nepotvrdili. Patrí k konzervantom s častejšími hláseniami kontaktnej alergie (odhad z literatúry, v tejto práci nečítanej).',
  ['echa-v', 'mit-biorius'], V, { os: ['citliva', 'deti'] });
p('fenoxyetanol', 'Phenoxyethanol|Fenoxyetanol', 'konzervant', 'konzervant', 'obmedzena',
  'Povolený konzervant do 1,0 %. SCCS (2016) ho pri 1 % považuje za bezpečný vrátane detí (rozpätie bezpečnosti ≈ 50). Francúzska ANSM (2012) odporúčala pre deti do 3 rokov nižšiu hranicu 0,4 % a nepoužívať ho na plienkovú oblasť – ide o rozdielne názory regulátorov, nie o jednoznačný dôkaz škody.',
  ['sccs-fenoxy', 'fenoxy-media'], V, { limit: '1,0 %', max: 1 });
p('metylparaben', 'Methylparaben|Metylparabén', 'konzervant', 'konzervant', 'obmedzena',
  'Povolený konzervant (Príloha V, položka 12): najviac 0,4 % jeden ester a 0,8 % zmes parabénov.',
  ['r1004-2014', 'paraben-de'], V, { limit: '0,4 % (zmes esterov 0,8 %)', max: 0.4 });
p('etylparaben', 'Ethylparaben|Etylparabén', 'konzervant', 'konzervant', 'obmedzena',
  'Povolený konzervant (Príloha V, položka 12): najviac 0,4 % jeden ester a 0,8 % zmes parabénov.',
  ['r1004-2014', 'paraben-de'], V, { limit: '0,4 % (zmes esterov 0,8 %)', max: 0.4 });
p('propylparaben', 'Propylparaben|Propylparabén', 'konzervant', 'konzervant', 'diskusia',
  'Povolený (Príloha V, položka 12a) s limitom 0,14 % pre súčet propyl- a butylparabénu (ako kyselina) a bez použitia v nezmývateľných výrobkoch pre deti do 3 rokov v oblasti plienok (nar. 1004/2014). Nižší limit než pri metyl- a etylparabéne odráža opatrnejší prístup regulátora.',
  ['r1004-2014', 'paraben-de'], V, { limit: '0,14 % (súčet propyl + butyl)', max: 0.14, os: ['deti'] });
p('butylparaben', 'Butylparaben|Butylparabén', 'konzervant', 'konzervant', 'diskusia',
  'Povolený (Príloha V, položka 12a) s limitom 0,14 % pre súčet propyl- a butylparabénu (ako kyselina) a bez použitia v nezmývateľných výrobkoch pre deti do 3 rokov v oblasti plienok (nar. 1004/2014).',
  ['r1004-2014', 'paraben-de'], V, { limit: '0,14 % (súčet propyl + butyl)', max: 0.14, os: ['deti'] });
p('benzylalkohol', 'Benzyl Alcohol|Benzylalkohol', 'konzervant;rozpúšťadlo;vonná látka', 'alergen', 'pozor',
  'Konzervant do 1,0 % (Príloha V) a zároveň jeden z vonných alergénov, ktoré sa musia uviesť na obale samostatne (nad 0,001 % v nezmývateľných, 0,01 % v zmývateľných výrobkoch).',
  ['echa-v', 'safic-v', 'alerg-hpra'], V, { limit: '1,0 % ako konzervant', max: 1, os: ['vona'] });
p('chlorfenezin', 'Chlorphenesin|Chlórfenezín', 'konzervant', 'konzervant', 'obmedzena',
  'Povolený konzervant do 0,3 % (Príloha V).', ['echa-v', 'safic-v'], V, { limit: '0,3 %', max: 0.3 });
p('kys-salicylova', 'Salicylic Acid|Kyselina salicylová', 'konzervant;exfoliant;činidlo proti akné', 'konzervant', 'obmedzena',
  'Ako konzervant najviac 0,5 %; na iné účely (peeling, akné) platia samostatné podmienky v Prílohe III. Pri sprejoch a aerosóloch sú nové podmienky (nar. 2021/850).',
  ['safic-v', 'tio2-ceway'], V, { limit: '0,5 % ako konzervant', max: 0.5 });
p('triklosan', 'Triclosan|Triklosán', 'konzervant;antimikrobiálna látka', 'konzervant', 'diskusia',
  'EÚ obmedzila použitie triklosánu a triklokarbánu nariadením 2024/996 (podľa správ odborných webov). Presné podmienky a lehoty sme nepotvrdili, preto ich neuvádzame – pozri predpis.',
  ['tricl-obelis', 'r2024-996-obs'], V, { os: ['deti'] });
for (const [id, m, ds] of [
  ['dmdm', 'DMDM Hydantoin', 'Prílohy V (položka 33 podľa UK SAG)'], ['imidazolidinyl', 'Imidazolidinyl Urea', 'Prílohy V'], ['diazolidinyl', 'Diazolidinyl Urea', 'Prílohy V'],
  ['quaternium15', 'Quaternium-15', 'Prílohy V'], ['hydroxymethylglycinat', 'Sodium Hydroxymethylglycinate', 'Prílohy V'], ['bronopol', '2-Bromo-2-Nitropropane-1,3-Diol|Bronopol', 'Prílohy V'],
]) p(id, m, 'konzervant (uvoľňuje formaldehyd)', 'konzervant', 'diskusia',
  `Konzervant, ktorý môže pomaly uvoľňovať formaldehyd (karcinogén kat. 1B, sám osebe v Prílohe II). Uvoľňovače sú v EÚ povolené podľa ${ds} s podmienkami; prah, od ktorého sa musí uvádzať upozornenie na uvoľňovaný formaldehyd, EÚ sprísňuje (finálne znenie sme nepotvrdili). Vhodné obmedziť pri citlivej pokožke.`,
  ['uk-sag-form', 'form-exp'], V, { os: ['citliva'] });
for (const [id, m] of [['benzoat', 'Sodium Benzoate|Benzoic Acid'], ['sorban', 'Potassium Sorbate|Sorbic Acid'], ['dhk', 'Dehydroacetic Acid|Sodium Dehydroacetate']])
  p(id, m, 'konzervant', 'konzervant', 'obmedzena', 'Bežný konzervant; v EÚ sa smie použiť len ak je v Prílohe V a v povolenom množstve. Konkrétny limit sme v tejto práci nepotvrdili, preto ho neuvádzame.', [], O);
p('etylhexylglycerin', 'Ethylhexylglycerin', 'kondicionér pokožky;podporuje konzerváciu', 'ina', 'ok', ODHAD_NEUTRAL, [], O);
p('kaprylylglykol', 'Caprylyl Glycol', 'kondicionér pokožky;zvlhčovač', 'ina', 'ok', ODHAD_NEUTRAL, [], O);

// --- UV filtre ---
p('oktokrylen', 'Octocrylene|Oktokrylén', 'UV filter', 'uv', 'diskusia',
  'Povolený UV filter. SCCS (2021): bezpečný do 10 %; v aerosólových sprejoch je pri spoločnom použití s inými výrobkami bezpečná len koncentrácia do 9 %. Pri oktokrylene a benzofenóne-3 bol dôvodom prehodnotenia aj podozrenie na endokrinné účinky (nar. 2022/1176).',
  ['sccs-okto', 'r2022-1176'], V, { limit: '10 % (sprej ≤ 9 %)', max: 10 });
p('benzofenon3', 'Benzophenone-3|Oxybenzone|Benzofenón-3', 'UV filter', 'uv', 'diskusia',
  'Povolený UV filter s prísnejšími limitmi od nar. 2022/1176: výrobky na tvár, ruky a pery 6 %, telové výrobky vrátane sprejov 2,2 %, ostatné 0,5 %. Dôvodom boli obavy z endokrinných účinkov. Má povinné upozornenie na obale.',
  ['bp3-ceway', 'r2022-1176'], V, { limit: '6 % tvár/ruky/pery; 2,2 % telo; 0,5 % ostatné', max: 6, os: ['deti'] });
p('homosalat', 'Homosalate|Homosalát', 'UV filter', 'uv', 'diskusia',
  'Povolený UV filter. SCCS (2021) uzavrel, že 10 % nie je bezpečných (0,5 % áno) a po doplnení údajov ho uznal za bezpečný do 7,34 % v prípravkoch na tvár; nar. 2022/2195 ho obmedzilo na prípravky na tvár bez aerosólových sprejov do 7,34 % (nové výrobky od 1. 1. 2025, všetky od 1. 7. 2025). Presné znenie výnimky pre spreje sme nepotvrdili. Dôvodom boli obavy z endokrinných účinkov.',
  ['sccs-homo', 'r2022-2195', 'homo-obs'], V, { limit: '7,34 % výrobky na tvár (nie aerosól)', max: 7.34 });
p('tio2', 'Titanium Dioxide|CI 77891|Oxid titaničitý', 'UV filter;farbivo (biele);matujúca látka', 'uv', 'obmedzena',
  'Ako UV filter povolený do 25 %; pri práškových a sprejových výrobkoch (riziko vdýchnutia) platia osobitné podmienky v Prílohe III od nar. 2021/850, lebo sa vdychovaný prach klasifikuje ako možný karcinogén (kat. 2). Pri nanoforme ((nano)) platia ďalšie podmienky (napr. nie na pery pri niektorých povlakoch). Na koži vo forme krému sa vdýchnutie nepredpokladá.',
  ['tio2-sgs', 'echa-uv', 'tio2-ceway'], V, { limit: 'UV filter ≤ 25 %', max: 25 });
p('zinok-oxid', 'Zinc Oxide|CI 77947|Oxid zinočnatý', 'UV filter;farbivo (biele);ochrana pokožky', 'uv', 'ok',
  'Minerálny UV filter, v EÚ povolený v Prílohe VI. Maximálny limit sme v tejto práci nepotvrdili a neuvádzame.', ['echa-uv'], O);
for (const [id, m] of [['avobenzon', 'Butyl Methoxydibenzoylmethane|Avobenzone'], ['oktinoxat', 'Ethylhexyl Methoxycinnamate|Octinoxate'], ['oktisalat', 'Ethylhexyl Salicylate|Octisalate'], ['tinosorb-s', 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine'], ['uvinul-a', 'Diethylamino Hydroxybenzoyl Hexyl Benzoate'], ['tinosorb-m', 'Methylene Bis-Benzotriazolyl Tetramethylbutylphenol'], ['uvinul-t', 'Ethylhexyl Triazone']])
  p(id, m, 'UV filter', 'uv', 'ok', 'Chemický UV filter. Na trhu EÚ smú byť len filtre z Prílohy VI s limitmi; číselný limit pre túto látku sme nepotvrdili, preto ho neuvádzame.', ['echa-uv'], O);

// --- siloxány ---
for (const [id, m, d] of [
  ['d4', 'Cyclotetrasiloxane|D4', 'D4'], ['d5', 'Cyclopentasiloxane|D5', 'D5'], ['d6', 'Cyclohexasiloxane|D6', 'D6'],
]) p(id, m, 'rozpúšťadlo;kondicionér (vlasy, pokožka)', 'siloxan', 'diskusia',
  `Cyklický siloxan ${d}: REACH (príloha XVII, položka 70; nar. 2024/1328 pre D6) obmedzuje ≥ 0,1 % – v zmývateľných kozmetických výrobkoch D4 a D5 od 31. 1. 2020, D6 od 6. 6. 2026; v nezmývateľných od 6. 6. 2027 (podľa súhrnov; dátumy pre jednotlivé látky sme nepotvrdili v origináli). Dôvodom je pretrvávanie v životnom prostredí, nie priamy účinok pri bežnom použití.`,
  ['d4d5d6-obs', 'd4d5d6-bio'], V, { limit: '< 0,1 % (REACH)', max: 0.1 });

// --- mikročastice ---
for (const [id, m] of [['pe', 'Polyethylene'], ['nylon', 'Nylon-12|Nylon-6'], ['pmma', 'Polymethyl Methacrylate'], ['polystyren', 'Polystyrene'], ['polypropylen', 'Polypropylene'], ['akryl-xp', 'Acrylates Crosspolymer|Acrylates Copolymer|Acrylates/C10-30 Alkyl Acrylate Crosspolymer']])
  p(id, m, 'plnivo;viskozita;exfoliant (podľa použitia)', 'mikroc', 'diskusia',
    'Syntetický polymér – môže ísť o mikročastice (nar. 2023/2055 o úmyselne pridaných mikroplastoch). Zákaz sa pre kozmetiku zavádza postupne s prechodnými obdobiami (4 až 12 rokov podľa druhu výrobku; podľa súhrnov). Z názvu v INCI nepoznáme veľkosť častíc, preto je to len upozornenie, nie zistenie.',
    ['r2023-2055', 'mikro-bio'], V);

// --- vône a alergény ---
p('parfum', 'Parfum|Fragrance|Aroma|Perfume|Vôňa', 'vonná zmes', 'vona', 'pozor',
  'Zmes vonných látok, ktorých zloženie výrobca nemusí uviesť. Alergény zo zoznamu sa však musia uviesť samostatne, ak ich je nad 0,001 % v nezmývateľných alebo 0,01 % v zmývateľných výrobkoch. Pri alergii na vône je „parfum" signál, aby si sa výrobku vyhla.',
  ['alerg-ec', 'alerg-hpra'], V, { os: ['vona', 'citliva'] });
const ALERGENY = [
  ['Amyl Cinnamal', 'amylcinnamal'], ['Amylcinnamyl Alcohol', 'amylcinnamylalkohol'], ['Anise Alcohol', 'anizalkohol'], ['Benzyl Benzoate', 'benzylbenzoat'], ['Benzyl Cinnamate', 'benzylcinamat'],
  ['Benzyl Salicylate', 'benzylsalicylat'], ['Cinnamal', 'cinamal'], ['Cinnamyl Alcohol', 'cinamylalkohol'], ['Citral', 'citral'], ['Citronellol', 'citronellol'], ['Coumarin', 'kumarin'],
  ['Eugenol', 'eugenol'], ['Farnesol', 'farnesol'], ['Geraniol', 'geraniol'], ['Hexyl Cinnamal', 'hexylcinamal'], ['Hydroxycitronellal', 'hydroxycitronellal'], ['Isoeugenol', 'izoeugenol'],
  ['Limonene', 'limonen'], ['Linalool', 'linalool'], ['Methyl 2-Octynoate', 'metyloktynoat'], ['Evernia Prunastri Extract|Evernia Prunastri', 'duboy-mach'], ['Evernia Furfuracea Extract|Evernia Furfuracea', 'stromovy-mach'],
  ['Alpha-Isomethyl Ionone', 'izometylionon'],
];
for (const [m, id] of ALERGENY) p(id, m, 'vonná látka', 'alergen', 'pozor',
  'Vonná látka zo zoznamu alergénov, ktoré musí obal uvádzať samostatne (Príloha III, položky 67–92; označenie nad 0,001 % v nezmývateľných a 0,01 % v zmývateľných výrobkoch). Zoznam sa od 31. 7. 2026 (nové výrobky) a 31. 7. 2028 (všetky) rozširuje (nar. 2023/1545). Zaradenie tejto konkrétnej látky do pôvodného zoznamu 26 sme z vyhľadávania nepotvrdili po jednej látke.',
  ['alerg-ec', 'alerg-hpra', 'r2023-1545'], V, { limit: 'uvádzať nad 0,001 % / 0,01 %', os: ['vona'] });

// --- vitamín A ---
for (const [id, m] of [['retinol', 'Retinol'], ['retinyl-palmitat', 'Retinyl Palmitate'], ['retinyl-acetat', 'Retinyl Acetate']])
  p(id, m, 'vitamín A;kondicionér pokožky', 'obmedzena', 'obmedzena',
    'Od nar. 2024/996 (Príloha III) najviac 0,3 % retinolového ekvivalentu v bežných výrobkoch a 0,05 % v telových mliekach, s upozornením „Contains vitamin A. Consider your daily intake before use." Dátumy uplatnenia sa v zdrojoch líšia (nové výrobky od 1. 11. 2025, existujúce 2027). V tehotenstve ide o preventívnu opatrnosť pri celkovom príjme vitamínu A – poraď sa s lekárom (naše preventívne odporúčanie, nie zistenie zo štúdie).',
    ['r2024-996-obs', 'r2024-996-cos'], V, { limit: '0,3 % RE; telové mlieka 0,05 % RE', max: 0.3, os: ['tehotenstvo'] });

// --- dráždivé / citlivé (odhad = prax alebo slabé podklady) ---
p('sls', 'Sodium Lauryl Sulfate|Sodium Laurylsulfate|SLS', 'čistiaca látka (tenzid);pena', 'draziva', 'pozor',
  'Silný čistiaci tenzid. EMA uvádza hlásené podráždenie kože pri dlhšej aplikácii, CIR (1983) pri príbuzných laureth sulfátoch podráždenie pokožky a očí v niektorých testoch. V zmývateľných produktoch ide o krátky kontakt; pri citlivej pokožke a nezmývateľných produktoch je vhodné sa mu vyhnúť (naše preventívne odporúčanie).',
  ['ema-sls', 'cir-laureth'], V, { os: ['citliva'] });
p('sles', 'Sodium Laureth Sulfate|SLES', 'čistiaca látka (tenzid);pena', 'draziva', 'pozor',
  'Jemnejší príbuzný SLS (etoxylovaný). CIR (1983) hlási pri laureth sulfátoch podráždenie pokožky a očí v niektorých testoch, no celkovo ich hodnotil ako bezpečné pri bežnom použití. Pri citlivej pokožke môže dráždiť.',
  ['cir-laureth'], O, { os: ['citliva'] });
p('alkohol-denat', 'Alcohol Denat.|Alcohol|Denatured Alcohol|SD Alcohol', 'rozpúšťadlo;astringent;urýchľuje vysychanie', 'draziva', 'pozor',
  'Prchavý alkohol môže pri citlivej alebo suchej pokožke vysušovať a štípať. Je to kozmetická prax, nie overený dôkaz – závisí od množstva (ktoré z obalu nepoznáme).',
  [], O, { os: ['citliva'] });
p('propylenglykol', 'Propylene Glycol|Propylénglykol', 'zvlhčovač;rozpúšťadlo', 'draziva', 'pozor',
  'Bežný zvlhčovač; u malej časti ľudí môže vyvolať kontaktné podráždenie alebo alergiu. Je to prax z dermatológie, nie náš overený zdroj.',
  [], O, { os: ['citliva'] });
p('cocamidopropyl-betain', 'Cocamidopropyl Betaine', 'čistiaca látka (tenzid);pena', 'draziva', 'pozor',
  'Jemný tenzid; u niektorých ľudí môže vyvolať kontaktnú alergiu (často kvôli nečistotám zo suroviny). Je to prax z dermatológie, nie náš overený zdroj.', [], O, { os: ['citliva'] });
p('lanolin', 'Lanolin|Lanolin Alcohol', 'zmäkčovadlo;emulgátor', 'draziva', 'pozor', 'Prírodný vlnový tuk; patrí medzi častejšie kontaktné alergény. Je to prax z dermatológie, nie náš overený zdroj.', [], O, { os: ['citliva'] });

// --- farbivá ---
p('ci-15985', 'CI 15985', 'farbivo (žlté)', 'farbivo', 'ok', 'Farbivo (Sunset Yellow). Podľa tabuľky Prílohy IV smie byť vo všetkých kozmetických výrobkoch; poznámky pri položke sme nečítali.', [], O);
p('ci-16035', 'CI 16035', 'farbivo (červené)', 'farbivo', 'ok', 'Farbivo (Allura Red). Podľa tabuľky Prílohy IV smie byť vo všetkých kozmetických výrobkoch; poznámky pri položke sme nečítali.', [], O);
for (const [id, ci, f] of [['ci-77491', 'CI 77491', 'oxid železitý, červený'], ['ci-77492', 'CI 77492', 'oxid železitý, žltý'], ['ci-77499', 'CI 77499', 'oxid železitý, čierny'], ['ci-19140', 'CI 19140', 'farbivo (žlté)'], ['ci-42090', 'CI 42090', 'farbivo (modré)'], ['ci-77019', 'CI 77019|Mica', 'sľuda; farbivo/lesk']])
  p(id, ci, `farbivo (${f})`, 'farbivo', 'ok', 'Farbivo z Prílohy IV (zaradenie podľa nášho prehľadu, nepotvrdené po jednej látke). Pri farbivách s CI číslom platí, že smú byť len vymenované v Prílohe IV, niektoré len pre určité typy výrobkov.', [], O);

// --- bežné zložky (len funkcia) ---
for (const [id, m, f] of [
  ['voda', 'Aqua|Water|Eau', 'rozpúšťadlo'], ['glycerin', 'Glycerin|Glycerol', 'zvlhčovač'], ['butylenglykol', 'Butylene Glycol', 'zvlhčovač;rozpúšťadlo'], ['dimethicone', 'Dimethicone', 'kondicionér;zmäkčovadlo (silikón, nie cyklický)'],
  ['cetearyl', 'Cetearyl Alcohol', 'zahusťovadlo;emulgátor (mastný alkohol)'], ['cetyl', 'Cetyl Alcohol', 'zahusťovadlo;zmäkčovadlo (mastný alkohol)'], ['stearova-kyselina', 'Stearic Acid', 'emulgátor;zahusťovadlo'],
  ['xantan', 'Xanthan Gum', 'zahusťovadlo'], ['carbomer', 'Carbomer', 'zahusťovadlo;stabilizátor emulzie'], ['edta', 'Disodium EDTA', 'viaže kovy (stabilizátor)'], ['hyaluronan', 'Sodium Hyaluronate', 'zvlhčovač'],
  ['panthenol', 'Panthenol', 'kondicionér pokožky a vlasov'], ['tokoferol', 'Tocopherol', 'antioxidant'], ['tokoferylacetat', 'Tocopheryl Acetate', 'antioxidant;kondicionér pokožky'], ['niacinamid', 'Niacinamide', 'kondicionér pokožky'],
  ['alantoin', 'Allantoin', 'upokojujúca látka'], ['citronova', 'Citric Acid', 'regulácia pH'], ['hydroxid', 'Sodium Hydroxide', 'regulácia pH'], ['kapryl-triglycerid', 'Caprylic/Capric Triglyceride', 'zmäkčovadlo'],
  ['slnecnicovy-olej', 'Helianthus Annuus Seed Oil', 'zmäkčovadlo (rastlinný olej)'], ['bambucke-maslo', 'Butyrospermum Parkii Butter', 'zmäkčovadlo (bambucké maslo)'], ['glyceryl-stearat', 'Glyceryl Stearate', 'emulgátor'],
  ['polysorbat20', 'Polysorbate 20', 'emulgátor'], ['kokoglukozid', 'Coco-Glucoside', 'čistiaca látka (jemný tenzid)'], ['nacl', 'Sodium Chloride', 'zahusťovadlo;regulácia viskozity'], ['skvalan', 'Squalane', 'zmäkčovadlo'],
  ['urea', 'Urea', 'zvlhčovač'], ['mlecna', 'Lactic Acid', 'regulácia pH;zvlhčovač'], ['vazelina', 'Petrolatum|Vaseline', 'zmäkčovadlo;ochranná vrstva'], ['mineralny-olej', 'Paraffinum Liquidum|Mineral Oil', 'zmäkčovadlo'],
  ['aloe', 'Aloe Barbadensis Leaf Juice|Aloe Barbadensis Leaf Extract', 'kondicionér pokožky'], ['glycereth', 'PEG-40 Hydrogenated Castor Oil', 'emulgátor (solubilizér)'],
]) p(id, m, f, 'ina', 'ok', ODHAD_NEUTRAL, [], O);

// --- kontrola a výstup ---
export function zostav() {
  const ids = new Set();
  for (const x of L) {
    if (ids.has(x.id)) throw new Error(`duplicitné id ${x.id}`);
    ids.add(x.id);
    if (x.u === V && x.z.length < 2) throw new Error(`${x.id}: úroveň vyhladavanie vyžaduje ≥ 2 zdroje`);
    if (x.u === O && x.z.length && !x.z.every((z) => ZDROJE[z])) throw new Error(`${x.id}: neznámy zdroj`);
    for (const z of x.z) if (!ZDROJE[z]) throw new Error(`${x.id}: neznámy zdroj ${z}`);
    if (x.limit && x.u !== V) throw new Error(`${x.id}: limit bez úrovne vyhladavanie`);
  }
  const latky = L.map(({ id, mena, f, t, s, d, z, u, limit, max, os }) => ({ id, m: mena, f, t, s, d, z, u, ...(limit ? { l: limit } : {}), ...(max !== undefined ? { x: max } : {}), ...(os ? { o: os } : {}) }));
  const zdroje = Object.fromEntries(Object.entries(ZDROJE).map(([k, [n, url]]) => [k, { n, url, u: V }]));
  return { latky, zdroje };
}

const jeHlavny = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (jeHlavny) {
  const { latky, zdroje } = zostav();
  const a = JSON.stringify(latky), b = JSON.stringify(zdroje);
  if (process.argv.includes('--kontrola')) {
    const ok = readFileSync(join(VYSTUP, 'latky.json'), 'utf8') === a && readFileSync(join(VYSTUP, 'zdroje.json'), 'utf8') === b;
    console.log(ok ? 'sedí' : 'NESEDÍ – spusti node scripts/kozmetika-data.mjs');
    process.exit(ok ? 0 : 1);
  }
  mkdirSync(VYSTUP, { recursive: true });
  writeFileSync(join(VYSTUP, 'latky.json'), a);
  writeFileSync(join(VYSTUP, 'zdroje.json'), b);
  console.log(`látky: ${latky.length} (${(a.length / 1024).toFixed(1)} kB), zdroje: ${Object.keys(zdroje).length}`);
}
