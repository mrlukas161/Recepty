import { test, expect } from '@playwright/test';

test('skener: skrytý zdroj dusičnanov/dusitanov (zeleninový extrakt v mäse) + popis prečo škodí', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  await page.goto('./#/skener');
  await page.locator('#sk-text').fill('Bravčové mäso (86 %), voda, soľ, zelerový extrakt, dextróza. Bez pridaných dusitanov.');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  const n = page.locator('[data-riziko="skryte-dusicnany"]');
  await expect(n).toContainText('Skrytý zdroj dusičnanov/dusitanov');
  await expect(n).toContainText('bez éčok');
  await n.locator('summary').first().click();
  await expect(n.locator('[data-preco="bez-e-zelenina"]')).toContainText('Úroveň dôkazov');
  // falošný poplach: zeler v šaláte bez mäsa
  await page.locator('#sk-text').fill('Zeler, mrkva, uhorka, olivový olej, soľ.');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.locator('[data-riziko="skryte-dusicnany"]')).toHaveCount(0);
});

test('popis „prečo to škodí“ je pri skene, recepte aj surovine rovnaký a má 5 častí', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Preskočiť' }).click();
  const casti = ['Čo to je a prečo to škodí.', 'Koľko a ako často vadí.', 'Komu viac.', 'Čo namiesto toho.', 'Úroveň dôkazov.'];
  // sken: dusitany E250
  await page.goto('./#/skener');
  await page.locator('#sk-text').fill('Bravčové mäso, soľ, konzervant dusitan sodný (E250), korenie.');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  const sken = page.locator('[data-riziko="dusitany"] [data-preco="dusitany"]');
  await sken.locator('summary').first().click();
  for (const c of casti) await expect(sken).toContainText(c);
  const textSken = await sken.innerText();
  // recept: halušky (múka)
  await page.goto('./#/recept/bryndzove-halusky');
  const rec = page.locator('[data-preco-recept] [data-preco="psenicna-muka"]');
  await rec.locator('summary').first().click();
  for (const c of casti) await expect(rec).toContainText(c);
  const textRec = await rec.innerText();
  // surovina: pšeničná múka
  await page.goto('./#/surovina/psenicna-muka-hladka');
  const sur = page.locator('[data-preco-surovina] [data-preco="psenicna-muka"]');
  await sur.locator('summary').first().click();
  for (const c of casti) await expect(sur).toContainText(c);
  expect(await sur.innerText()).toBe(textRec);
  // rovnaký text aj pri údenine (sken vs. surovina)
  await page.goto('./#/surovina/sunka-bravcova');
  const sur2 = page.locator('[data-preco-surovina] [data-preco="dusitany"]');
  await sur2.locator('summary').first().click();
  expect(await sur2.innerText()).toBe(textSken);
});
