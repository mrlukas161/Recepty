import { test, expect } from '@playwright/test';

const WEBP = Buffer.from('UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==', 'base64');

test.use({ serviceWorkers: 'block' });

test('foto slot: bez súboru ilustrácia, so záznamom fotka s označením AI na karte aj v detaile', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  await page.goto('./#/recepty');
  await page.getByPlaceholder(/Hľadať/).fill('palacinky s jablkovou');
  const karta = page.locator('a.karta', { hasText: 'Palacinky s jablkovou plnkou' });
  await expect(karta).toBeVisible();
  await expect(karta.locator('[data-foto]')).toHaveCount(0);
  await expect(karta.locator('svg.il').first()).toBeVisible();

  await page.route('**/foto/zoznam.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify([{ id: 'palacinky-s-dzemom', ai: true, model: 'testovací model', datum: '2026-10-20' }]) }));
  await page.route('**/foto/palacinky-s-dzemom.webp', (r) => r.fulfill({ contentType: 'image/webp', body: WEBP }));
  await page.reload();
  await page.getByPlaceholder(/Hľadať/).fill('palacinky s jablkovou');
  const k2 = page.locator('a.karta', { hasText: 'Palacinky s jablkovou plnkou' });
  await expect(k2.locator('[data-foto] img')).toHaveCount(1);
  await expect(k2.locator('.foto-ai')).toHaveText('AI');
  await k2.click();
  await expect(page.locator('.foto-hero [data-foto]')).toBeVisible();
  await expect(page.locator('.foto-hero figcaption')).toContainText('umelou inteligenciou');
  await expect(page.locator('.foto-hero figcaption')).toContainText('testovací model');
});
