import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
});

test('1★ = nechutilo: recept zmizne z Dnes, rulety aj jedálnička; zoznam Nechutilo a návrat', async ({ page }) => {
  await page.getByRole('button', { name: 'Raňajky' }).click();
  const prva = page.locator('[data-sekcia="bez-muky"] a.karta, a.karta').first();
  const nazov = (await prva.locator('h3').innerText()).replace(/^★ /, '');
  await prva.click();
  await page.locator('[data-hviezda="1"]').click();
  await expect(page.locator('.hviezdy-text')).toContainText('nebude sa navrhovať');
  await page.goto('./#/');
  await page.getByRole('button', { name: 'Raňajky' }).click();
  const nazvy = await page.locator('a.karta h3').allInnerTexts();
  expect(nazvy.join('|')).not.toContain(nazov);
  // jedálniček: Zamiešať
  await page.goto('./#/jedalnicek');
  await page.getByRole('button', { name: /Vygenerovať týždeň/ }).click();
  await page.getByRole('button', { name: /Zamiešať/ }).click();
  expect((await page.locator('.slot a').allInnerTexts()).join('|')).not.toContain(nazov);
  // zoznam Nechutilo
  await page.goto('./#/nechutilo');
  await expect(page.locator('[data-nechutilo]')).toContainText(nazov);
  await page.getByRole('button', { name: /Vrátiť/ }).click();
  await expect(page.locator('[data-prazdne]')).toBeVisible();
});

test('hviezdičky 1–5 sa ukladajú, zobrazia na karte a prenášajú v stave', async ({ page }) => {
  await page.goto('./#/recept/palacinky-s-dzemom');
  await page.locator('[data-hviezda="4"]').click();
  await expect(page.locator('.hviezdy-text')).toContainText('4★');
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('recepty-v1')!).hviezdicky);
  expect(s).toEqual({ 'palacinky-s-dzemom': 4 });
  await page.goto('./#/recepty');
  await page.getByPlaceholder(/Hľadať/).fill('palacinky s jablkovou');
  await expect(page.locator('a.karta', { hasText: 'Palacinky s jablkovou plnkou' }).locator('.tag', { hasText: '★★★★' })).toBeVisible();
});
