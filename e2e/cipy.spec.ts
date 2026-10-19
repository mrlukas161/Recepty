import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
});

test('výbery sú čipy: filter receptov, obmedzenia, téma, jedlá vrátane olovrantu', async ({ page }) => {
  expect(await page.locator('select').count()).toBe(0);
  await page.goto('./#/recepty');
  await page.getByRole('button', { name: /Filtre a zoradenie/ }).click();
  expect(await page.locator('select').count()).toBe(0);
  const typ = page.getByRole('group', { name: 'Typ jedla' });
  await typ.getByRole('button', { name: 'Raňajky' }).click();
  await expect(typ.getByRole('button', { name: 'Raňajky' })).toHaveAttribute('aria-pressed', 'true');
  for (const t of await page.locator('a.karta .maly').allInnerTexts()) expect(t).toMatch(/^Raňajky/);
  await page.getByRole('group', { name: 'Čas' }).getByRole('button', { name: 'do 15 min' }).click();
  await page.getByRole('group', { name: 'Zoradenie' }).getByRole('button', { name: 'Podľa času' }).click();

  await page.goto('./#/nastavenia');
  expect(await page.locator('select').count()).toBe(0);
  const muka = page.getByRole('group', { name: 'Rafinovaná múka' });
  await muka.getByRole('button', { name: 'Vylúčiť' }).click();
  await expect(muka.getByRole('button', { name: 'Vylúčiť' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Téma' }).getByRole('button', { name: 'Tmavá' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'tmava');
  const jedla = page.locator('.cipy button', { hasText: 'Olovrant' });
  await jedla.click();
  await expect(jedla).toHaveAttribute('aria-pressed', 'true');
  await page.goto('./#/jedalnicek');
  await page.getByRole('button', { name: /Vygenerovať týždeň/ }).click();
  await expect(page.locator('.slot', { hasText: 'Olovrant' }).first()).toBeVisible();
  // náhrada receptu v slote: zoznam tlačidiel namiesto select
  await page.getByRole('button', { name: 'Vymeniť' }).first().click();
  await page.getByRole('group', { name: 'Vybrať recept' }).getByRole('button').first().click();
});

test('vlastný recept: typ a jednotka ako čipy', async ({ page }) => {
  await page.goto('./#/vlastny');
  expect(await page.locator('select').count()).toBe(0);
  await page.getByRole('group', { name: 'Typ jedla' }).getByRole('button', { name: 'Olovrant' }).click();
  await expect(page.getByRole('group', { name: 'Typ jedla' }).getByRole('button', { name: 'Olovrant' })).toHaveAttribute('aria-pressed', 'true');
});
