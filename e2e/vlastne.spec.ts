import { test, expect, type Page } from '@playwright/test';

async function uvod(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
}

async function pridaj(page: Page, nazov: string) {
  await page.goto('./#/recepty');
  await page.getByRole('link', { name: '+ Vlastný recept' }).click();
  await page.getByLabel('Názov receptu').fill(nazov);
  await page.getByLabel('Hľadať surovinu').fill('špenát');
  await page.getByRole('button', { name: '+ Špenát', exact: false }).first().click();
  await page.getByLabel('Množstvo Špenát').fill('300');
  await page.getByLabel('Hľadať surovinu').fill('hrsť petržlenovej vňate');
  await page.getByRole('button', { name: /Pridať ako voľný text/ }).click();
  await page.getByLabel('Postup').fill('Špenát orestuj.\nPridaj vňať.');
  await expect(page.locator('[data-istota]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Uložiť recept' }).click();
}

test('vlastný recept: pridať, skóre, nákup, jedálniček, upraviť, duplikovať, zmazať', async ({ page }) => {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(e.message));
  page.on('dialog', (d) => d.accept());
  await uvod(page);
  await pridaj(page, 'Môj špenát');
  // detail so skóre a upozornením na istotu
  await expect(page.getByRole('heading', { name: 'Môj špenát' })).toBeVisible();
  await expect(page.locator('.pecat').first()).toBeVisible();
  await expect(page.locator('[data-istota]').first()).toContainText('nezapočítalo');
  await expect(page.getByText('hrsť petržlenovej vňate')).toBeVisible();
  await page.screenshot({ path: 'test-results/vlastny-detail.png', fullPage: true });
  // v zozname s označením
  await page.goto('./#/recepty');
  await page.getByLabel('Hľadať', { exact: true }).fill('Môj špenát');
  await expect(page.locator('a.karta', { hasText: 'Môj špenát' }).locator('.tag', { hasText: 'vlastný' })).toBeVisible();
  // do nákupu
  await page.locator('a.karta', { hasText: 'Môj špenát' }).click();
  await page.getByRole('button', { name: /Do nákupu/ }).click();
  await page.getByRole('link', { name: /Nákup/ }).click();
  await expect(page.locator('.nakup-pol', { hasText: 'Špenát' }).first()).toBeVisible();
  await expect(page.locator('.nakup-pol', { hasText: 'hrsť petržlenovej vňate' })).toBeVisible();
  // jedálniček
  await page.goto('./#/recepty');
  await page.getByLabel('Hľadať', { exact: true }).fill('Môj špenát');
  await page.locator('a.karta', { hasText: 'Môj špenát' }).click();
  await page.getByRole('button', { name: 'Po', exact: true }).click();
  await page.getByRole('link', { name: /Jedálniček/ }).click();
  await expect(page.locator('.slot a', { hasText: 'Môj špenát' })).toBeVisible();
  // upraviť
  await page.goto('./#/recepty');
  await page.getByLabel('Hľadať', { exact: true }).fill('Môj špenát');
  await page.locator('a.karta', { hasText: 'Môj špenát' }).click();
  await page.getByRole('link', { name: /Upraviť/ }).click();
  await page.getByLabel('Názov receptu').fill('Špenát upravený');
  await page.screenshot({ path: 'test-results/vlastny-formular.png', fullPage: true });
  await page.getByRole('button', { name: 'Uložiť recept' }).click();
  await expect(page.getByRole('heading', { name: 'Špenát upravený' })).toBeVisible();
  // duplikovať
  await page.getByRole('button', { name: /Duplikovať/ }).click();
  await expect(page.getByLabel('Názov receptu')).toHaveValue('Špenát upravený (kópia)');
  await page.getByRole('link', { name: 'Zrušiť' }).click();
  await page.goto('./#/moje');
  await expect(page.locator('a.karta')).toHaveCount(2);
  // zmazať kópiu aj originál
  for (let k = 0; k < 2; k++) {
    await page.goto('./#/moje');
    await page.locator('a.karta').first().click();
    await page.getByRole('button', { name: /Zmazať/ }).click();
    await expect(page.getByRole('heading', { name: 'Recepty' })).toBeVisible();
  }
  await page.goto('./#/moje');
  await expect(page.getByText('Zatiaľ nemáš žiadny vlastný recept')).toBeVisible();
  // zmazaný recept zmizol z jedálnička
  await page.goto('./#/jedalnicek');
  await expect(page.locator('.slot a', { hasText: 'špenát' })).toHaveCount(0);
  expect(chyby).toEqual([]);
});

test('vlastný recept: ruleta a Dnes ponúkajú vlastné recepty', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await uvod(page);
  await pridaj(page, 'Rýchla večera');
  await page.evaluate(() => { /* typ obed je predvolený; ruleta „Všetko“ */ });
  await page.goto('./#/ruleta');
  await page.getByRole('button', { name: 'Všetko' }).click();
  await expect(page.getByText(/Na výber: \d+ receptov/)).toBeVisible();
  await page.goto('./#/');
  await page.getByRole('button', { name: 'Obed' }).click();
  await expect(page.locator('a.karta').first()).toBeVisible();
});

test('export a import vlastných receptov, chybný súbor appku nerozbije', async ({ page }) => {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(e.message));
  page.on('dialog', (d) => d.accept());
  await uvod(page);
  await pridaj(page, 'Export test');
  await page.goto('./#/moje');
  const json = await page.getByLabel('Export JSON').inputValue();
  expect(JSON.parse(json)).toMatchObject({ format: 'recepty-vlastne', verzia: 1 });
  // chybný import
  await page.getByLabel('Import JSON').fill('{ toto nie je json');
  await page.getByRole('button', { name: 'Importovať' }).click();
  await expect(page.getByRole('status')).toContainText('Import sa nepodaril');
  await page.getByLabel('Import JSON').fill('{"format":"recepty-vlastne","verzia":1,"recepty":[{"nazov":""},5]}');
  await page.getByRole('button', { name: 'Importovať' }).click();
  await expect(page.getByRole('status')).toContainText('Import sa nepodaril');
  await expect(page.locator('nav.spodna')).toBeVisible();
  // zmazať a vrátiť importom
  await page.locator('a.karta').first().click();
  await page.getByRole('button', { name: /Zmazať/ }).click();
  await page.goto('./#/moje');
  await expect(page.locator('a.karta')).toHaveCount(0);
  await page.getByLabel('Import JSON').fill(json);
  await page.getByRole('button', { name: 'Importovať' }).click();
  await expect(page.getByRole('status')).toContainText('pridané 1');
  await expect(page.locator('a.karta', { hasText: 'Export test' })).toBeVisible();
  // opakovaný import nič nezduplikuje
  await page.getByLabel('Import JSON').fill(json);
  await page.getByRole('button', { name: 'Importovať' }).click();
  await expect(page.locator('a.karta')).toHaveCount(1);
  // prežije reload (localStorage)
  await page.reload();
  await expect(page.locator('a.karta', { hasText: 'Export test' })).toBeVisible();
  expect(chyby).toEqual([]);
});
