import { test, expect } from '@playwright/test';

test('skóre: pri faktoroch skutočná hodnota, cieľ a slovo; percento len celkové; vhodnosť keto', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  await page.goto('./#/diety');
  await page.locator('.dieta[data-dieta="ketogenna"]').getByRole('button', { name: 'Použiť' }).click();
  await page.goto('./#/recepty');
  await page.locator('a.karta').first().click();
  const vl = page.locator('[data-faktor="vlaknina"]');
  await expect(vl).toBeVisible();
  await expect(vl.locator('.faktor-hodnota')).toContainText(/\d+(,\d)? g.*~10 g na jedlo/);
  await expect(vl.locator('.faktor-slovo')).toHaveText(/výborné|dobré|slabé/);
  await expect(vl).not.toContainText('/100');
  await expect(page.locator('[data-faktor="muka"]')).toBeVisible();
  await expect(page.locator('.pecat').first()).toBeVisible();
  await expect(page.locator('.vhodnost')).toContainText(/čisté sacharidy \d+,\d g na porciu, limit 15 g/);
});
