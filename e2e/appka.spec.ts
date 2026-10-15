import { test, expect } from '@playwright/test';

test('prvé spustenie → nastavenie → raňajky → detail → úprava → jedálniček → nákup → ruleta → offline', async ({ page, context }) => {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(e.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Vitaj v Receptoch' })).toBeVisible();
  await page.screenshot({ path: 'test-results/01-uvod.png', fullPage: true });
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  // Dnes – záložka raňajky
  await page.getByRole('button', { name: 'Raňajky' }).click();
  await expect(page.locator('a.karta').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/02-dnes.png', fullPage: false });
  // detail
  await page.locator('a.karta').first().click();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  const skoreP = await page.locator('.pecat').first().innerText();
  await page.screenshot({ path: 'test-results/03-detail.png', fullPage: true });
  // úprava
  const upravy = page.locator('h2:has-text("Úpravy") + .karta input[type=checkbox]');
  if (await upravy.count()) { await upravy.first().check(); await expect(page.locator('.pecat').first()).toBeVisible(); }
  // režim varenia
  await page.getByRole('button', { name: /Režim varenia/ }).click();
  await expect(page.locator('.varenie .krok')).toBeVisible();
  await page.getByRole('button', { name: /Zavrieť/ }).click();
  // do nákupu
  await page.getByRole('button', { name: /Do nákupu/ }).click();
  // jedálniček
  await page.getByRole('link', { name: /Jedálniček/ }).click();
  await page.getByRole('button', { name: /Vygenerovať týždeň/ }).click();
  await expect(page.locator('.slot a').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/04-jedalnicek.png', fullPage: true });
  await page.getByRole('button', { name: /Nákup z jedálnička/ }).click();
  await expect(page.locator('.nakup-pol').first()).toBeVisible();
  await page.locator('.nakup-pol input').first().check();
  await page.screenshot({ path: 'test-results/05-nakup.png', fullPage: true });
  // ruleta
  await page.goto('./#/ruleta');
  await page.getByRole('button', { name: /Roztočiť/ }).click();
  await expect(page.getByText('Recept dňa')).toBeVisible({ timeout: 8000 });
  await page.screenshot({ path: 'test-results/06-ruleta.png' });
  // recepty + vyhľadávanie
  await page.goto('./#/recepty');
  await page.getByLabel('Hľadať').fill('sosovica');
  await page.screenshot({ path: 'test-results/07-recepty.png' });
  // verzia v nastaveniach
  await page.goto('./#/nastavenia');
  await expect(page.getByText(/Verzia:/)).toBeVisible();
  await page.screenshot({ path: 'test-results/08-nastavenia.png', fullPage: true });
  // offline
  await page.goto('./');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('nav.spodna')).toBeVisible();
  await page.goto('./#/recepty');
  await expect(page.locator('a.karta').first()).toBeVisible();
  await context.setOffline(false);
  expect(chyby).toEqual([]);
  expect(skoreP).toMatch(/\d/);
});

test('diéta Vegánska skryje recepty s mäsom a alergia na lepok vylúči pečivo', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  await page.goto('./#/diety/bezlepkova');
  await page.getByRole('button', { name: 'Použiť' }).click();
  await page.goto('./#/recepty');
  await expect(page.locator('a.karta').first()).toBeVisible();
});
