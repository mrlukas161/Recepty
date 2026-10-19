import { test, expect } from '@playwright/test';

test('Dnes: múka tento týždeň, návrhy bez múky, odkaz na náhrady', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  const karta = page.locator('.muka-tyzden');
  await expect(karta).toContainText('Múka tento týždeň');
  await expect(karta).toContainText(/Uvarené: 0 z 0 jedál s múkou/);
  await page.getByRole('button', { name: 'Obed' }).click();
  const sek = page.locator('[data-sekcia="bez-muky"]');
  await expect(sek.locator('a.karta').first()).toBeVisible();
  for (const t of await sek.locator('a.karta').all()) await expect(t).not.toContainText('s múkou');
  // uvarené jedlo s múkou sa premietne
  await page.goto('./#/recept/palacinky-s-dzemom');
  await page.getByRole('button', { name: /Uvarené/ }).click();
  await page.goto('./#/');
  await expect(page.locator('.muka-tyzden')).toContainText(/Uvarené: 1 z 1 jedál s múkou/);
  await page.locator('.muka-tyzden').getByRole('link', { name: 'Čím nahradiť múku' }).click();
  await expect(page.getByRole('heading', { name: 'Náhrady' })).toBeVisible();
});
