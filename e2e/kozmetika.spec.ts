import { test, expect, type Page } from '@playwright/test';

const INCI = 'Aqua, Glycerin, Cetearyl Alcohol, Phenoxyethanol, Parfum, Limonene, Linalool, Titanium Dioxide, CI 77891';

async function otvor(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/kozmetika');
  await expect(page.getByRole('heading', { name: 'Skener kozmetiky' })).toBeVisible();
}

test('kozmetika: menu Viac → ručné vloženie → rozpad, detail zložky, nastavenia, história, porovnanie', async ({ page }) => {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(e.message));
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto('./#/viac');
  await page.getByRole('link', { name: /Skener kozmetiky/ }).click();
  await expect(page.getByRole('heading', { name: 'Skener kozmetiky' })).toBeVisible();
  await expect(page.getByText('Nie je to lekárska rada.', { exact: true })).toBeVisible();

  await page.locator('#kz-text').fill(INCI);
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alergény vôní' })).toBeVisible();
  const zakl = Number((await page.locator('.pecat').first().innerText()).split('\n')[0]);
  await page.screenshot({ path: 'test-results/kozmetika-1-vysledok.png', fullPage: true });

  // ťuknutie na zložku: funkcia, dôvod, zdroj, úroveň dôkazov
  await page.getByText(/4\. Phenoxyethanol/).click();
  await expect(page.getByText(/SCCS \(2016\)/)).toBeVisible();
  await expect(page.getByText(/SCCS: stanovisko k fenoxyetanolu/)).toBeVisible();
  await expect(page.getByText('overené vyhľadávaním, originál nečítaný').first()).toBeVisible();
  await expect(page.getByText(/Od tejto zložky ďalej ide/)).toBeVisible();

  // osobné nastavenia znížia skóre, prežijú reload
  await page.getByText('Moje nastavenia (kozmetika)').click();
  await page.getByLabel('Alergia na vône').check();
  await expect(page.getByText(/Parfum \(alergia na vône\)/)).toBeVisible();
  const po = Number((await page.locator('.pecat').first().innerText()).split('\n')[0]);
  expect(po).toBeLessThan(zakl);
  await page.reload();
  await expect(page.getByLabel('Alergia na vône')).toBeChecked();

  // história a porovnanie dvoch výrobkov
  await page.locator('#kz-text').fill(INCI);
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await page.locator('#kz-nazov').fill('Krém s parfumom');
  await page.getByRole('button', { name: /Uložiť do histórie/ }).click();
  await page.locator('#kz-text').fill('Aqua, Glycerin, Panthenol, Cetearyl Alcohol, Squalane');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await page.locator('#kz-nazov').fill('Jednoduchý krém');
  await page.getByRole('button', { name: /Uložiť do histórie/ }).click();
  await page.getByRole('button', { name: /História/ }).click();
  await expect(page.getByRole('button', { name: 'Otvoriť' })).toHaveCount(2);
  await page.getByRole('button', { name: /Porovnať/ }).click();
  await expect(page.getByText(/Lepšie vychádza: Jednoduchý krém/)).toBeVisible();
  await page.screenshot({ path: 'test-results/kozmetika-2-porovnanie.png', fullPage: true });
  expect(chyby).toEqual([]);
});

test('kozmetika: syntetická etiketa → OCR (angličtina) → parser opraví preklepy → hodnotenie', async ({ page, context }) => {
  await otvor(page);
  const p2 = await context.newPage();
  await p2.setViewportSize({ width: 900, height: 260 });
  await p2.setContent(`<body style="margin:0;background:#fff"><div style="width:860px;padding:30px;font:34px/1.5 'DejaVu Sans', Arial, sans-serif;color:#111">INGREDIENTS: ${INCI}.</div></body>`);
  const png = await p2.screenshot();
  await p2.close();
  await page.locator('#kz-foto').setInputFiles({ name: 'etiketa.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('canvas.sk-obrazok')).toBeVisible();
  await page.getByRole('button', { name: 'Rozpoznať text' }).click();
  await expect(page.getByText(/Hotovo – text skontroluj/)).toBeVisible({ timeout: 120000 });
  const text = (await page.locator('#kz-text').inputValue()).toLowerCase();
  console.log('OCR kozmetika:', text);
  expect(text).toContain('glycerin');
  expect(text).toMatch(/phenoxy/);
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await expect(page.getByText(/Phenoxyethanol/).first()).toBeVisible();
  await expect(page.getByText(/Limonene|Linalool/).first()).toBeVisible();
  await page.screenshot({ path: 'test-results/kozmetika-3-ocr.png', fullPage: true });
});

test('kozmetika: čiarový kód → Open Beauty Facts (zmockované) → výsledok; po výpadku internetu z uloženého', async ({ page }) => {
  let online = true;
  let volania = 0;
  await page.route('https://world.openbeautyfacts.org/api/v2/product/**', (r) => {
    volania++;
    return online
      ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 1, product: { product_name: 'Telové mlieko', brands: 'Test', ingredients_text_en: INCI } }) })
      : r.abort('internetdisconnected');
  });
  await otvor(page);
  await page.getByLabel('Čiarový kód kozmetiky (čísla)').fill('4006381333931');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/údaje z Open Beauty Facts/)).toBeVisible();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await expect(page.getByText(/Uložené \d{2}\.\d{2}\.\d{4}/)).toHaveCount(0);
  expect(volania).toBe(1);
  await page.screenshot({ path: 'test-results/kozmetika-4-obf.png', fullPage: true });

  online = false;
  await page.reload();
  await page.getByLabel('Čiarový kód kozmetiky (čísla)').fill('4006381333931');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByText(/Uložené \d{2}\.\d{2}\.\d{4}/)).toBeVisible();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();

  // neznámy kód bez internetu → zrozumiteľná chyba
  await page.getByLabel('Čiarový kód kozmetiky (čísla)').fill('3600550000000'.slice(0, 12) + '0');
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();
});

test('kozmetika: offline po načítaní (service worker) – trasa aj vyhodnotenie fungujú bez internetu', async ({ page, context }) => {
  await otvor(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Skener kozmetiky' })).toBeVisible();
  await page.locator('#kz-text').fill(INCI);
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await expect(page.getByText(/Titanium Dioxide/).first()).toBeVisible();
  await context.setOffline(false);
});
