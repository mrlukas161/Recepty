import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
});

test('recept: slabá surovina má dôvod a náhradu, ťuk otvorí kartu suroviny', async ({ page }) => {
  await page.goto('./#/recept/palacinky-s-dzemom');
  const slaba = page.locator('[data-slaba]').first();
  await expect(slaba).toBeVisible();
  await expect(slaba).toContainText('Lepšie:');
  await slaba.locator('a').last().click();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Prečo áno alebo nie' })).toBeVisible();
});

test('karta suroviny: tapioka nie je zlepšenie, bulgur má lepok, zdroje s úrovňou overenia', async ({ page }) => {
  await page.goto('./#/surovina/tapioka-skrob');
  await expect(page.locator('[data-verdikt="podobne"]')).toContainText('Nie je zlepšenie');
  await expect(page.getByText('čistý škrob').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Čím nahradiť' })).toBeVisible();
  await page.goto('./#/surovina/bulgur');
  await expect(page.getByText(/lepok/).first()).toBeVisible();
  await page.goto('./#/surovina/psyllium');
  await expect(page.getByText('overené vyhľadávaním, originál nečítaný')).toBeVisible();
  await expect(page.getByText(/odhad/).first()).toBeVisible();
});

test('zoznam surovín a Dnes: denný tip', async ({ page }) => {
  await page.goto('./#/suroviny');
  await page.getByLabel('Hľadať surovinu').fill('quin');
  await page.getByRole('link', { name: 'Quinoa' }).first().click();
  await expect(page.getByRole('heading', { name: 'Quinoa' })).toBeVisible();
  await page.goto('./#/');
  const tip = page.locator('.tip-dna p');
  const t1 = await tip.innerText();
  await page.locator('.tip-dna').getByRole('button', { name: 'Ďalší tip' }).click();
  expect(await tip.innerText()).not.toBe(t1);
});
