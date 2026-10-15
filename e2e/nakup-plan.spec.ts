import { test, expect } from '@playwright/test';

// Nastaví hotové úvodné nastavenie (údeniny „obmedziť“ je predvolené).
async function hotovo(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
}

test('voliteľná klobása: názov bez nej, pridanie ju vráti a započíta do nákupu; nákup bez vody', async ({ page }) => {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(e.message));
  await hotovo(page);
  await page.goto('./#/recept/fazulovy-privarok');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fazuľový prívarok (klobása voliteľne)');
  await expect(page.getByText('voliteľne (máš obmedzené)')).toBeVisible();
  await page.getByRole('button', { name: /Do nákupu/ }).click();
  await page.goto('./#/nakup');
  await expect(page.locator('.nakup-pol', { hasText: 'Fazuľa biela' })).toBeVisible();
  await expect(page.locator('.nakup-pol', { hasText: 'Klobása' })).toHaveCount(0);
  await expect(page.locator('.nakup-pol', { hasText: /^Voda/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Skontroluj, či máš doma' })).toBeVisible();
  await page.screenshot({ path: 'test-results/10-nakup-skontroluj.png', fullPage: true });
  // pridanie klobásy
  await page.goto('./#/recept/fazulovy-privarok');
  await page.locator('li', { hasText: 'Klobása údená' }).getByRole('button', { name: 'Pridať' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fazuľový prívarok s údeným');
  await page.goto('./#/nakup');
  await expect(page.locator('.nakup-pol', { hasText: 'Klobása' })).toBeVisible();
  expect(chyby).toEqual([]);
});

test('nastavenia: čas cez týždeň a víkend, varím na 2 dni sa prenesie do jedálnička', async ({ page }) => {
  await hotovo(page);
  await page.goto('./#/nastavenia');
  await page.getByLabel(/Čas na varenie cez víkend/).fill('120');
  await page.getByLabel(/Čas na varenie cez týždeň/).fill('30');
  await page.getByLabel(/Varím na 2 dni/).check();
  await page.goto('./#/jedalnicek');
  await expect(page.getByLabel(/Varím na 2 dni/)).toBeChecked();
  await page.getByRole('button', { name: /Vygenerovať týždeň/ }).click();
  await expect(page.locator('.slot a').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/11-jedalnicek-2dni.png', fullPage: true });
  const ulozene = await page.evaluate(() => JSON.parse(localStorage.getItem('recepty-v1') ?? '{}'));
  expect(ulozene.verzia).toBe(2);
  expect(ulozene.nastavenia.casTyzden).toBe(30);
  expect(ulozene.nastavenia.casVikend).toBe(120);
  expect(ulozene.nastavenia.varimNa2Dni).toBe(true);
});

test('starý uložený stav (maxCas) sa načíta a prenesie', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('recepty-v1', JSON.stringify({ nastavenia: { dospeli: 3, deti: [], maxCas: 25, hotovo: true }, oblubene: ['x'] })));
  await page.goto('./#/nastavenia');
  await page.reload();
  await expect(page.getByLabel(/Čas na varenie cez týždeň/)).toHaveValue('25');
  await expect(page.getByLabel(/Čas na varenie cez víkend/)).toHaveValue('90');
});
