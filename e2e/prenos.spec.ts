import { test, expect, type Browser } from '@playwright/test';

const STAV_A = {
  nastavenia: { hotovo: true, dospeli: 3, tema: 'auto' },
  oblubene: ['x-oblubene-1', 'x-oblubene-2'], hodnotenie: { 'x-r1': 1 }, nakupVlastne: ['žltá šošovica'],
};

async function prvyMobil(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, baseURL: `http://localhost:${process.env.PW_PORT ?? 4173}/Recepty/`, hasTouch: true, isMobile: true });
  await ctx.addInitScript((s) => { if (!localStorage.getItem('recepty-v1')) localStorage.setItem('recepty-v1', JSON.stringify(s)); }, STAV_A);
  const page = await ctx.newPage();
  await page.goto('./#/prenos');
  await expect(page.locator('#prenos-qr')).toBeVisible();
  return { ctx, page };
}
const druhyMobil = async (browser: Browser, stav?: object) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, baseURL: `http://localhost:${process.env.PW_PORT ?? 4173}/Recepty/`, hasTouch: true, isMobile: true });
  if (stav) await ctx.addInitScript((s) => { if (!localStorage.getItem('recepty-v1')) localStorage.setItem('recepty-v1', JSON.stringify(s)); }, stav);
  return { ctx, page: await ctx.newPage() };
};
const ulozeny = (page: import('@playwright/test').Page) => page.evaluate(() => JSON.parse(localStorage.getItem('recepty-v1') ?? '{}'));

test('prenos odkazom: zabaliť v jednom mobile, otvoriť v druhom, zlúčiť', async ({ browser }) => {
  const a = await prvyMobil(browser);
  await a.page.locator('details summary').click();
  const odkaz = await a.page.locator('#prenos-odkaz').inputValue();
  expect(odkaz).toContain('#/prenos/');

  const b = await druhyMobil(browser, { nastavenia: { hotovo: true }, oblubene: ['x-lokalne'], nakupVlastne: ['chlieb'] });
  await b.page.goto(odkaz);
  await expect(b.page.getByRole('heading', { name: 'Preniesť do druhého mobilu' })).toBeVisible();
  await expect(b.page.getByRole('table', { name: 'Čo sa zmení' })).toBeVisible();
  await expect(b.page.getByLabel(/Zlúčiť/)).toBeChecked();
  await b.page.screenshot({ path: 'test-results/prenos-nahlad.png', fullPage: true });
  // pred potvrdením sa nič nezmenilo
  expect((await ulozeny(b.page)).oblubene).toEqual(['x-lokalne']);
  await b.page.getByRole('button', { name: 'Zlúčiť údaje' }).click();
  await expect(b.page.getByText('Hotovo – údaje sú zlúčené.')).toBeVisible();
  const s = await ulozeny(b.page);
  expect([...s.oblubene].sort()).toEqual(['x-lokalne', 'x-oblubene-1', 'x-oblubene-2']);
  expect(s.nakupVlastne.sort()).toEqual(['chlieb', 'žltá šošovica']);
  expect(s.hodnotenie).toEqual({ 'x-r1': 1 });
  expect(s.nastavenia.dospeli).toBe(3);
  // vrátiť späť
  await b.page.getByRole('button', { name: /Vrátiť späť/ }).click();
  expect((await ulozeny(b.page)).oblubene).toEqual(['x-lokalne']);
  await a.ctx.close(); await b.ctx.close();
});

test('prenos QR kódom z fotky a nahradenie', async ({ browser }) => {
  const a = await prvyMobil(browser);
  const png = Buffer.from((await a.page.locator('#prenos-qr').evaluate((c: HTMLCanvasElement) => c.toDataURL('image/png'))).split(',')[1], 'base64');
  const b = await druhyMobil(browser, { nastavenia: { hotovo: true }, oblubene: ['x-lokalne'] });
  await b.page.goto('./#/prenos');
  await b.page.locator('#prenos-subor').setInputFiles({ name: 'qr.png', mimeType: 'image/png', buffer: png });
  await expect(b.page.getByRole('table', { name: 'Čo sa zmení' })).toBeVisible({ timeout: 15000 });
  await b.page.getByLabel(/Nahradiť/).check();
  await expect(b.page.getByRole('alert').filter({ hasText: 'stratí' })).toBeVisible();
  await b.page.getByRole('button', { name: 'Nahradiť údaje' }).click();
  await expect(b.page.getByText(/nahradené/)).toBeVisible();
  expect((await ulozeny(b.page)).oblubene).toEqual(['x-oblubene-1', 'x-oblubene-2']);
  await a.ctx.close(); await b.ctx.close();
});

test('poškodený odkaz ukáže chybu a nič nezmení', async ({ browser }) => {
  const b = await druhyMobil(browser, { nastavenia: { hotovo: true }, oblubene: ['x-lokalne'] });
  await b.page.goto('./#/prenos/Zabc_def-ghijklmnop');
  await expect(b.page.getByRole('alert')).toContainText(/poškodené|neúplné|prenos/i);
  expect((await ulozeny(b.page)).oblubene).toEqual(['x-lokalne']);
  await b.ctx.close();
});

test('veľké dáta: bez QR, ponúkne súbor', async ({ browser }) => {
  const historia = Array.from({ length: 3000 }, (_, i) => ({ recept: `r-${i * 7919 % 100003}`, den: `2026-${i}` }));
  const a = await druhyMobil(browser, { nastavenia: { hotovo: true }, historia });
  await a.page.goto('./#/prenos');
  await expect(a.page.getByText(/na QR kód priveľa/)).toBeVisible();
  await expect(a.page.locator('#prenos-qr')).toHaveCount(0);
  const [stiahnutie] = await Promise.all([a.page.waitForEvent('download'), a.page.getByRole('button', { name: /Stiahnuť súbor/ }).click()]);
  expect(stiahnutie.suggestedFilename()).toBe('recepty-prenos.json');
  await a.ctx.close();
});
