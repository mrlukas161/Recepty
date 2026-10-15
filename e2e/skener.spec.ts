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
