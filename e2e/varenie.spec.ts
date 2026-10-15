import { test, expect } from '@playwright/test';

async function uvod(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
}

test('úpravy receptu sú prepínače: role, aria-pressed, 44 px, focus, prepočet skóre', async ({ page }) => {
  await uvod(page);
  await page.goto('./#/recept/prazenica-so-zeleninou');
  const tl = page.locator('h2:has-text("Úpravy") + .karta button.upr').first();
  await expect(tl).toBeVisible();
  await expect(tl).toHaveAttribute('role', 'button');
  await expect(tl).toHaveAttribute('aria-pressed', 'false');
  const box = await tl.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
  const pred = await page.locator('.pecat').first().innerText();
  const surovin = await page.locator('ul.suroviny li').count();
  await tl.click();
  await expect(tl).toHaveAttribute('aria-pressed', 'true');
  await expect(tl).toContainText('zapnuté');
  await expect(page.locator('ul.suroviny li')).toHaveCount(surovin + 1);
  expect(await page.locator('.pecat').first().innerText()).toBeTruthy();
  // klávesnica + viditeľný focus
  await tl.focus();
  await page.keyboard.press('Enter');
  await expect(tl).toHaveAttribute('aria-pressed', 'false');
  await expect(tl).toContainText('vypnuté');
  await expect(page.locator('ul.suroviny li')).toHaveCount(surovin);
  const outline = await tl.evaluate((e) => getComputedStyle(e).outlineStyle);
  expect(outline).not.toBe('none');
  expect(await page.locator('.pecat').first().innerText()).toBe(pred);
});

test('časovač v režime varenia: viac naraz, prežije zmenu kroku, ukončenie', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __vib: number }).__vib = 0;
    navigator.vibrate = () => { (window as unknown as { __vib: number }).__vib++; return true; };
  });
  await page.clock.install({ time: new Date('2026-10-15T10:00:00Z') });
  await uvod(page);
  await page.goto('./#/recept/volske-oko-na-spenate');
  await page.getByRole('button', { name: /Režim varenia/ }).click();
  // krok 1 bez času → žiadne tlačidlo
  await expect(page.locator('.cas-btn')).toHaveCount(0);
  await page.getByRole('button', { name: /Ďalej/ }).click();
  // krok 2: „po pol minúte“ a „2 minúty“
  await expect(page.getByRole('button', { name: /Časovač 30 s/ })).toBeVisible();
  await page.getByRole('button', { name: /Časovač 2 min/ }).click();
  await page.getByRole('button', { name: /Časovač 30 s/ }).click();
  await expect(page.getByTestId('casovac')).toHaveCount(2);
  await page.getByRole('button', { name: /Ďalej/ }).click();
  await page.getByRole('button', { name: /Ďalej/ }).click();
  // krok 4: rozsah 3–4 minúty → dolná aj horná hranica
  await expect(page.getByRole('button', { name: /dolná hranica/ })).toBeVisible();
  await page.getByRole('button', { name: /horná hranica/ }).click();
  await expect(page.getByTestId('casovac')).toHaveCount(3);
  await expect(page.getByTestId('casovac').first()).toContainText('01:');
  await page.clock.runFor(31_000);
  await expect(page.getByTestId('casovac').nth(1)).toContainText('Čas vypršal');
  expect(await page.evaluate(() => (window as unknown as { __vib: number }).__vib)).toBeGreaterThan(0);
  await page.clock.runFor(95_000);
  await expect(page.getByTestId('casovac').first()).toContainText('Čas vypršal');
  await expect(page.getByTestId('casovac').nth(2)).toContainText('01:');
  // zatvor a znova otvor – časovače ostali
  await page.getByRole('button', { name: /Zavrieť$/ }).click();
  await page.getByRole('button', { name: /Režim varenia/ }).click();
  await expect(page.getByTestId('casovac')).toHaveCount(3);
  await page.getByRole('button', { name: 'Zavrieť upozornenie' }).first().click();
  await expect(page.getByTestId('casovac')).toHaveCount(2);
});

test('aktualizácie: sw.js má skipWaiting a clientsClaim, O appke ukazuje verziu', async ({ page, request }) => {
  const sw = await (await request.get('sw.js')).text();
  expect(sw).toMatch(/skipWaiting/);
  expect(sw).toMatch(/clientsClaim|clients\.claim/);
  const v = await (await request.get('version.json')).json();
  expect(v.sha).toBeTruthy();
  await uvod(page);
  await page.goto('./#/nastavenia');
  await expect(page.getByText(/Verzia:/)).toContainText(v.sha.slice(0, 7));
  await page.getByRole('button', { name: /Skontrolovať aktualizáciu/ }).click();
  await expect(page.getByRole('status').filter({ hasText: /najnovšiu|verzia/ })).toBeVisible();
});
