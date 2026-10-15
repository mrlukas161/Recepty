import { test, expect } from '@playwright/test';

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
