import { test, expect } from '@playwright/test';

test('Dnes: múka tento týždeň, návrhy bez múky, odkaz na náhrady', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  const karta = page.locator('.muka-tyzden');
  await expect(karta).toContainText('Pšeničná múka a pečivo tento týždeň');
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

test('múka: ruleta ani Zamiešať ju nedajú, vyhľadaním sa nájde s verziou bez múky, počítadlo limitu', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  // Zamiešať: žiadny recept s múkou
  await page.goto('./#/jedalnicek');
  await page.getByRole('button', { name: /Vygenerovať týždeň|Zamiešať/ }).click();
  const odkazy = await page.locator('.slot a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).textContent));
  expect(odkazy.length).toBeGreaterThan(5);
  for (const o of odkazy) expect(o).not.toMatch(/palacinky s džemom|bryndzové halušky|pizza margherita/i);
  // ruleta: počet receptov na výber je bez múky
  await page.goto('./#/ruleta');
  await page.getByRole('button', { name: 'Všetko' }).click();
  await page.getByRole('button', { name: 'Roztočiť' }).click();
  await expect(page.getByRole('heading', { name: /Recept dňa/ })).toBeVisible({ timeout: 8000 });
  await expect(page.locator('a.karta .tag.war', { hasText: 's múkou' })).toHaveCount(0);
  // vyhľadanie nájde, s verziou bez múky
  await page.goto('./#/recepty');
  await page.getByRole('searchbox', { name: 'Hľadať' }).fill('bryndzové halušky');
  const karta = page.locator('a.karta', { hasText: 'Bryndzové halušky' }).first();
  await expect(karta).toContainText('s múkou');
  await expect(page.locator('[data-bez-muky-verzia="bryndzove-halusky"]')).toContainText('Bez múky:');
  // detail: počítadlo limitu (predvolene 2×)
  await page.goto('./#/recept/bryndzove-halusky');
  await expect(page.locator('[data-banner-muky]')).toContainText('ostáva 2×');
  await page.getByRole('button', { name: /Uvarené/ }).click();
  await expect(page.locator('[data-banner-muky]')).toContainText('ostáva 1×');
  await page.getByRole('button', { name: /Uvarené/ }).click();
  await expect(page.locator('[data-banner-muky]')).toContainText('ostáva 0×');
  await page.getByRole('button', { name: /Uvarené/ }).click();
  await expect(page.locator('[data-banner-muky]')).toContainText('limit je 2×');
});

test('limit múky sa dá prepnúť na 1× vo Viac → Nastavenia', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  await page.goto('./#/nastavenia');
  await page.getByRole('group', { name: 'Týždenný limit jedál s múkou' }).getByRole('button', { name: '1× týždenne' }).click();
  await page.goto('./#/');
  await expect(page.locator('[data-limit-muky]')).toContainText('Limit 1×');
});
