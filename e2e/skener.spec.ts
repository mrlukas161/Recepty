import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const ETIKETA = 'Zloženie: pšeničná múka, cukor, palmový tuk, kakao 4,5 %, emulgátor (E 471), farbivo E102, aróma, soľ.';

test('skener: ručné vloženie → hodnotenie → história; fotka etikety → OCR → zložky', async ({ page, context }) => {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(e.message));
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/skener');
  await expect(page.getByRole('heading', { name: 'Skener zloženia' })).toBeVisible();

  // ručné vloženie
  await page.locator('#sk-text').fill('Zloženie: cukor, pšeničná múka, palmový tuk, farbivo (E102), soľ. Môže obsahovať stopy orechov.');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await expect(page.getByText('Palmový tuk / olej')).toBeVisible();
  await expect(page.getByText(/E102 · /).first()).toBeVisible();
  await page.screenshot({ path: 'test-results/skener-1-vysledok.png', fullPage: true });
  await page.getByRole('button', { name: /Uložiť do histórie/ }).click();
  await page.getByRole('button', { name: /História/ }).click();
  await expect(page.getByRole('button', { name: 'Otvoriť' })).toBeVisible();

  // fotka etikety (vyrenderovaný text → PNG)
  const p2 = await context.newPage();
  await p2.setViewportSize({ width: 900, height: 260 });
  await p2.setContent(`<body style="margin:0;background:#fff"><div style="width:860px;padding:30px;font:34px/1.5 'DejaVu Sans', Arial, sans-serif;color:#111">${ETIKETA}</div></body>`);
  const png = await p2.screenshot();
  await p2.close();
  await page.getByRole('button', { name: /Skenovať/ }).click();
  await page.locator('#sk-foto').setInputFiles({ name: 'etiketa.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('canvas.sk-obrazok')).toBeVisible();
  await page.screenshot({ path: 'test-results/skener-2-foto.png', fullPage: true });
  await page.getByRole('button', { name: 'Rozpoznať text' }).click();
  await expect(page.getByText(/Hotovo – text skontroluj/)).toBeVisible({ timeout: 120000 });
  const text = (await page.locator('#sk-text').inputValue()).toLowerCase();
  console.log('OCR:', text);
  expect(text).toContain('cukor');
  expect(text).toMatch(/palmov/);
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await expect(page.getByText(/E471 · /).first()).toBeVisible();
  await expect(page.getByText(/E102 · /).first()).toBeVisible();
  await page.screenshot({ path: 'test-results/skener-3-ocr.png', fullPage: true });
  expect(chyby).toEqual([]);
});

test('skener: čiarový kód → Open Food Facts (zmockované) → hodnotenie, lepšia voľba, porovnanie', async ({ page }) => {
  await page.route('https://world.openfoodfacts.org/api/v2/product/**', (r) => {
    const kod = r.request().url().includes('4006381333931') ? 'A' : 'B';
    const product = kod === 'A'
      ? { product_name: 'Müsli čokoládové', brands: 'Test', ingredients_text_sk: 'ovsené vločky, cukor, glukózovo-fruktózový sirup, kakao, aróma, emulgátor (E 471)', nutriscore_grade: 'c', nova_group: 4, nutriments: { sugars_100g: 28, salt_100g: 0.3 } }
      : { product_name: 'Ovsené vločky', brands: 'Test', ingredients_text_sk: 'celozrnné ovsené vločky 100 %', nutriscore_grade: 'a', nova_group: 1, nutriments: { sugars_100g: 1, salt_100g: 0, fiber_100g: 10 } };
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 1, product }) });
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/skener');
  await page.getByLabel('Čiarový kód (čísla)').fill('4006381333932');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/Kód nie je platný/)).toBeVisible();
  await page.getByLabel('Čiarový kód (čísla)').fill('4006381333931');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/údaje z Open Food Facts \(ODbL\)/)).toBeVisible();
  await expect(page.getByText('Lepšia voľba')).toBeVisible();
  await expect(page.getByText(/Domáca alternatíva/)).toBeVisible();
  await page.screenshot({ path: 'test-results/skener-4-off.png', fullPage: true });
  await page.getByRole('button', { name: /Uložiť do histórie/ }).click();
  await page.getByRole('button', { name: /Skenovať/ }).click();
  await page.getByLabel('Čiarový kód (čísla)').fill('96385074');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/údaje z Open Food Facts/)).toBeVisible();
  await page.getByRole('button', { name: /Uložiť do histórie/ }).click();
  await page.getByRole('button', { name: /Porovnať/ }).click();
  await expect(page.getByText(/Lepšie vychádza/)).toBeVisible();
  await page.screenshot({ path: 'test-results/skener-5-porovnanie.png', fullPage: true });
});

test('skener: výrobok z balíka slovenských výrobkov sa nájde bez siete s označením zdroja', async ({ page }) => {
  const siet: string[] = [];
  await page.route('https://world.openfoodfacts.org/**', (r) => { siet.push(r.request().url()); return r.abort(); });
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/skener');
  await page.getByLabel('Čiarový kód (čísla)').fill('20131616');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText('Trappista').first()).toBeVisible();
  await expect(page.getByText('Open Food Facts (ODbL), stiahnuté 16.10.2026')).toBeVisible();
  await expect(page.getByText(/Pasterizované mlieko/).first()).toBeVisible();
  expect(siet).toEqual([]);
});

test('skener: OCR funguje aj offline po prvom použití (service worker)', async ({ page, context }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const p2 = await context.newPage();
  await p2.setViewportSize({ width: 900, height: 200 });
  await p2.setContent(`<body style="margin:0;background:#fff"><div style="width:860px;padding:30px;font:34px/1.5 'DejaVu Sans', Arial, sans-serif;color:#111">Zloženie: ovsené vločky, cukor, soľ.</div></body>`);
  const png = await p2.screenshot();
  await p2.close();
  const spusti = async () => {
    await page.goto('./#/skener');
    await page.locator('#sk-foto').setInputFiles({ name: 'e.png', mimeType: 'image/png', buffer: png });
    await page.getByRole('button', { name: 'Rozpoznať text' }).click();
    await expect(page.getByText(/Hotovo – text skontroluj/)).toBeVisible({ timeout: 120000 });
    expect((await page.locator('#sk-text').inputValue()).toLowerCase()).toContain('cukor');
  };
  await spusti();
  await context.setOffline(true);
  await page.reload();
  await spusti();
});

test('skener: Nutella (reálna odpoveď OFF, zloženie len en/fr) → nízke pásmo, E322, cukor, palmový olej', async ({ page }) => {
  const nutella = readFileSync(new URL('../tests/fixtures/off/nutella.json', import.meta.url), 'utf8');
  await page.route('https://world.openfoodfacts.org/api/v2/product/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: nutella }));
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/skener');
  await page.getByLabel('Čiarový kód (čísla)').fill('3017620422003');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/Zloženie je v angličtine/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Zriedka|Občas/ })).toBeVisible();
  await expect(page.getByText(/Nízka spoľahlivosť/)).toHaveCount(0);
  await expect(page.getByText(/E322 · /).first()).toBeVisible();
  await expect(page.getByText(/Vysoký obsah cukrov/)).toBeVisible();
  await expect(page.getByText('Palmový tuk / olej').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/skener-6-nutella.png', fullPage: true });
});

test('skener: výrobok nájdený podľa kódu sa po výpadku internetu nájde z uloženého', async ({ page }) => {
  const nutella = readFileSync(new URL('../tests/fixtures/off/nutella.json', import.meta.url), 'utf8');
  let online = true;
  await page.route('https://world.openfoodfacts.org/api/v2/product/**', (r) => (online ? r.fulfill({ status: 200, contentType: 'application/json', body: nutella }) : r.abort('internetdisconnected')));
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/skener');
  await page.getByLabel('Čiarový kód (čísla)').fill('3017620422003');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/údaje z Open Food Facts/)).toBeVisible();
  await expect(page.getByText(/Uložené \d{2}\.\d{2}\.\d{4}/)).toHaveCount(0);
  online = false;
  await page.reload();
  await page.getByLabel('Čiarový kód (čísla)').fill('3017620422003');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/Uložené \d{2}\.\d{2}\.\d{4}/)).toBeVisible();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
});

test('skener: diéta bezlepková a bez laktózy → upozornenia so zdrojmi', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('recepty-v1')) localStorage.setItem('recepty-v1', JSON.stringify({ nastavenia: { hotovo: true, diety: ['bezlepkova', 'bez-laktozy'], alergie: [] } }));
  });
  await page.goto('./#/skener');
  await page.locator('#sk-text').fill('ovsené vločky, odtučnené mlieko, srvátkový prášok, tvrdý syr, jačmenný slad, cukor. Môže obsahovať stopy lepku.');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.getByRole('heading', { name: 'Tvoja diéta a alergie' })).toBeVisible();
  await expect(page.getByText(/krížovo|kontaminovať/).first()).toBeVisible();
  await expect(page.getByText(/Laktóza: srvátka/)).toBeVisible();
  await expect(page.getByText(/vyzret/)).toBeVisible();
  await page.screenshot({ path: 'test-results/skener-7-dieta.png', fullPage: true });
});

test('skener: história → „Kupujem“, filter, „Do nákupu“; lepšia voľba → recept do nákupu', async ({ page }) => {
  await page.route('https://world.openfoodfacts.org/api/v2/product/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 1, product: { product_name: 'Müsli čokoládové', brands: 'Test', ingredients_text_sk: 'ovsené vločky, cukor, glukózovo-fruktózový sirup, kakao, aróma', nutriments: { sugars_100g: 28 } } }) }));
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/skener');
  await page.getByLabel('Čiarový kód (čísla)').fill('4006381333931');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/Domáca alternatíva/)).toBeVisible();
  await page.getByRole('button', { name: '🛒 Do nákupu' }).first().click();
  await expect(page.getByRole('button', { name: '✓ V nákupe' })).toBeVisible();
  await page.getByRole('button', { name: /Uložiť do histórie/ }).click();
  await page.getByRole('button', { name: /História/ }).click();
  await page.getByRole('button', { name: '☆ Kupujem' }).click();
  await expect(page.getByRole('button', { name: '★ Kupujem' })).toBeVisible();
  await page.getByLabel('Len výrobky, ktoré kupujem').check();
  await expect(page.getByRole('heading', { name: /★ Test – Müsli čokoládové/ })).toBeVisible();
  await page.getByRole('button', { name: '🛒 Do nákupu' }).click();
  await expect(page.getByRole('button', { name: '✓ V nákupe' })).toBeVisible();
  await page.goto('./#/nakup');
  await expect(page.getByText('Test – Müsli čokoládové')).toBeVisible();
  await expect(page.getByText('Recepty v nákupe')).toBeVisible();
});

test('skener: zašumená fotka (zalomené riadky, rozmazanie, náklon) → OCR → slovníková oprava', async ({ page, context }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  const p2 = await context.newPage();
  await p2.setViewportSize({ width: 700, height: 520 });
  await p2.setContent(`<body style="margin:0;background:#f4f1ea"><div style="width:380px;margin:40px;font:27px/1.45 'DejaVu Sans', Arial, sans-serif;color:#222;transform:rotate(1.2deg);filter:blur(0.7px);hyphens:auto" lang="sk">Zloženie: pšeničná múka, cukor, palmový tuk, emulgátor (E471), sladidlo (E950), kakao 4,5 %, soľ, aróma.</div></body>`);
  const png = await p2.screenshot();
  await p2.close();
  await page.goto('./#/skener');
  await page.locator('#sk-foto').setInputFiles({ name: 'zasumena.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('button', { name: 'Rozpoznať text' }).click();
  await expect(page.getByText(/Hotovo – text skontroluj/)).toBeVisible({ timeout: 120000 });
  const text = (await page.locator('#sk-text').inputValue()).toLowerCase();
  console.log('OCR zašumené:', text);
  expect(text).toContain('cukor');
  expect(text).toMatch(/palmov/);
  expect(text).not.toContain('\n');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.getByText(/E471 · /).first()).toBeVisible();
});
