import { test, expect } from '@playwright/test';

async function hotovo(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.getByRole('button', { name: /Hotovo, ukáž návrhy/ }).click();
}

test('úvod nemá dolnú navigáciu a tlačidlo Hotovo je hneď viditeľné', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('nav.spodna')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Hotovo, ukáž návrhy/ })).toBeInViewport();
});

test('Z toho, čo mám doma: pridanie surovín a návrh, „Do jedálnička na dnes“', async ({ page }) => {
  await hotovo(page);
  const vstup = page.getByLabel('Pridať, čo mám doma');
  await vstup.fill('vajc'); await page.locator('[data-sekcia="z-domaca"] .cipy .chip').first().click();
  await vstup.fill('cuket'); await page.locator('[data-sekcia="z-domaca"] .cipy .chip').first().click();
  await expect(page.locator('[data-sekcia="z-domaca"] [aria-pressed="true"]')).toHaveCount(2);
  const na = page.locator('.na-dnes').first();
  await na.click();
  await expect(na).toHaveAttribute('aria-pressed', 'true');
  await page.goto('./#/jedalnicek');
  await expect(page.locator('.slot a').first()).toBeVisible();
});

test('Jedálniček: Späť vráti predchádzajúci týždeň; Nákup: Kúpené X z Y a Skryť kúpené', async ({ page }) => {
  await hotovo(page);
  await page.goto('./#/jedalnicek');
  await page.getByRole('button', { name: /Vygenerovať týždeň/ }).click();
  const prvy = await page.locator('.slot a').first().textContent();
  await page.getByRole('button', { name: /Zamiešať/ }).click();
  await page.getByRole('button', { name: /Späť/ }).click();
  await expect(page.getByRole('button', { name: /Späť/ })).toHaveCount(0);
  await expect(page.locator('.slot a').first()).toHaveText(prvy ?? '');
  await page.getByRole('button', { name: /Nákup z jedálnička/ }).click();
  await expect(page.locator('.nakup-stav')).toContainText(/Kúpené 0 z \d+/);
  await page.locator('.nakup-pol input[type=checkbox]').first().check();
  await expect(page.locator('.nakup-stav')).toContainText(/Kúpené 1 z/);
  const pred = await page.locator('.nakup-pol').count();
  await page.getByLabel('Skryť kúpené').check();
  expect(await page.locator('.nakup-pol').count()).toBe(pred - 1);
});
