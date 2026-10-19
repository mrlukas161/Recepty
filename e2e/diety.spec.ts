import { test, expect } from '@playwright/test';

test('popis diéty (keto) je vidno hneď na karte aj po ťuknutí', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  await page.goto('./#/diety');
  const keto = page.locator('.dieta[data-dieta="ketogenna"]');
  await expect(keto.locator('.dieta-popis')).toContainText('Veľmi málo sacharidov');
  await keto.getByRole('link', { name: 'Ketogénna' }).click();
  await expect(page.getByRole('heading', { name: 'Ketogénna' })).toBeVisible();
  await expect(page.getByText('Veľmi málo sacharidov')).toBeVisible();
  await page.goBack();
  await keto.getByRole('button', { name: 'Použiť' }).click();
  await expect(keto.getByRole('button', { name: 'Prestať používať' })).toBeVisible();
});

test('v Nastaveniach diéty nezaberajú miesto, odkaz vedie do Viac → Diéty', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  await page.goto('./#/nastavenia');
  await expect(page.getByRole('heading', { name: 'Diéty (vedľajšie)' })).toBeVisible();
  await page.getByRole('link', { name: /Diéty s popisom/ }).click();
  await expect(page.locator('.dieta').first()).toBeVisible();
});
