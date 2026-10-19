import { test, expect, type Browser, type Page } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const KOD = '4006381333931';
const base = () => `http://localhost:${process.env.PW_PORT ?? 4173}/Recepty/`;
const dnes = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; };
const OFF = 'https://world.openfoodfacts.org/api/v2/product/**';
const OBF = 'https://world.openbeautyfacts.org/api/v2/product/**';

async function otvor(page: Page, trasa: 'skener' | 'kozmetika') {
  await page.goto('./');
  await page.getByRole('button', { name: 'Hotovo, ukáž návrhy' }).click();
  await page.goto(`./#/${trasa}`);
}
const nenajdene = (r: import('@playwright/test').Route) => r.fulfill({ status: 404, contentType: 'application/json', body: '{"status":0}' });

test('potraviny: kód nie je nikde → vlastný sken → nájde sa bez siete s označením → zmazanie', async ({ page }) => {
  let volania = 0;
  await page.route(OFF, (r) => { volania++; return nenajdene(r); });
  await otvor(page, 'skener');
  await page.getByLabel('Čiarový kód (čísla)').fill(KOD);
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByRole('alert').first()).toContainText(/nenašiel/);
  const odkaz = page.locator('#sk-pridat-off');
  await expect(odkaz).toHaveText(/Pridať do Open Food Facts/);
  await expect(odkaz).toHaveAttribute('href', `https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=${KOD}`);
  await expect(odkaz).toHaveAttribute('target', '_blank');

  await page.locator('#sk-text').fill('ovsené vločky, cukor, palmový tuk, soľ');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await page.locator('#sk-nazov').fill('Moje müsli');
  await page.getByRole('button', { name: new RegExp(`Zapamätať zloženie pod kód ${KOD}`) }).click();
  await expect(page.locator('#sk-vlastny-info')).toContainText(`Vlastný sken (${dnes()})`);
  await page.getByRole('button', { name: /Uložiť do histórie/ }).click();
  await page.screenshot({ path: 'test-results/skener-vlastny-1.png', fullPage: true });

  // bez internetu: appka nesmie siahnuť na sieť, nájde výrobok z vlastného skenu
  await page.unroute(OFF);
  await page.route(OFF, (r) => { volania += 1000; return r.abort('internetdisconnected'); });
  await page.reload();
  await page.getByLabel('Čiarový kód (čísla)').fill(KOD);
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.locator('#sk-vlastny-info')).toContainText(`Vlastný sken (${dnes()})`);
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  expect(volania).toBe(1);

  // história má kód a zoznam vlastných skenov sa dá mazať
  await page.getByRole('button', { name: /História/ }).click();
  await expect(page.getByRole('heading', { name: /Moje vlastné skeny \(1\)/ })).toBeVisible();
  const hist = await page.evaluate(() => JSON.parse(localStorage.getItem('recepty-skener-v1') ?? '[]'));
  expect(hist[0].kod).toBe(KOD);
  await page.getByRole('button', { name: 'Zmazať vlastný sken' }).click();
  await expect(page.getByRole('heading', { name: /Moje vlastné skeny/ })).toHaveCount(0);
  await page.getByRole('button', { name: /Skenovať/ }).click();
  await page.getByLabel('Čiarový kód (čísla)').fill(KOD);
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByRole('alert').first()).toContainText(/Nepodarilo sa spojiť|nenašiel/);
});

test('potraviny: výrobok z OFF bez zloženia → tlačidlo na úpravu v OFF + doplnenie zloženia vlastným skenom', async ({ page }) => {
  await page.route(OFF, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 1, product: { product_name: 'Bez zloženia', brands: 'Test' } }) }));
  await otvor(page, 'skener');
  await page.getByLabel('Čiarový kód (čísla)').fill(KOD);
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.getByRole('alert').first()).toContainText(/nemá zadané zloženie/);
  await expect(page.locator('#sk-pridat-off')).toHaveAttribute('href', `https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=${KOD}`);
  await page.locator('#sk-text').fill('mlieko, kakao, cukor');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await expect(page.locator('#sk-nazov')).toHaveValue(/Bez zloženia/);
  await page.locator('#sk-uloz-vlastny').click();
  await page.unroute(OFF);
  await page.route(OFF, (r) => r.abort('internetdisconnected'));
  await page.reload();
  await page.getByLabel('Čiarový kód (čísla)').fill(KOD);
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.locator('#sk-vlastny-info')).toContainText('Bez zloženia');
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
});

test('kozmetika: nenájdený kód → Open Beauty Facts tlačidlo → vlastný sken sa nájde bez siete', async ({ page }) => {
  await page.route(OBF, nenajdene);
  await otvor(page, 'kozmetika');
  await page.getByLabel('Čiarový kód kozmetiky (čísla)').fill(KOD);
  await page.getByRole('button', { name: 'Nájsť' }).click();
  const odkaz = page.locator('#kz-pridat-obf');
  await expect(odkaz).toHaveText(/Pridať do Open Beauty Facts/);
  await expect(odkaz).toHaveAttribute('href', `https://world.openbeautyfacts.org/cgi/product.pl?type=edit&code=${KOD}`);
  await page.locator('#kz-text').fill('Aqua, Glycerin, Parfum, Phenoxyethanol');
  await page.getByRole('button', { name: 'Vyhodnotiť' }).click();
  await page.locator('#kz-uloz-vlastny').click();
  await expect(page.locator('#kz-vlastny-info')).toContainText(`Vlastný sken (${dnes()})`);
  await page.unroute(OBF);
  await page.route(OBF, (r) => r.abort('internetdisconnected'));
  await page.reload();
  await page.getByLabel('Čiarový kód kozmetiky (čísla)').fill(KOD);
  await page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(page.locator('#kz-vlastny-info')).toBeVisible();
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await page.locator('#kz-zmaz-vlastny').click();
  await expect(page.locator('#kz-vlastny-info')).toHaveCount(0);
});

/* ---------- prenos ---------- */
const STAV = { nastavenia: { hotovo: true }, oblubene: ['x'] };
async function mobil(browser: Browser, ulozisko: Record<string, unknown> = {}) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, baseURL: base(), hasTouch: true, isMobile: true, acceptDownloads: true });
  await ctx.addInitScript(([s, u]) => {
    if (!localStorage.getItem('recepty-v1')) localStorage.setItem('recepty-v1', JSON.stringify(s));
    if (!localStorage.getItem('__init')) { localStorage.setItem('__init', '1'); for (const [k, v] of Object.entries(u as object)) localStorage.setItem(k, JSON.stringify(v)); }
  }, [STAV, ulozisko] as const);
  return { ctx, page: await ctx.newPage() };
}
const ls = (page: Page, k: string) => page.evaluate((x) => JSON.parse(localStorage.getItem(x) ?? 'null'), k);
const NOVY = { ulozene: '2026-10-19T10:00:00.000Z' };
const SKENER_A = {
  'recepty-skener-vlastne-v1': [{ kod: KOD, nazov: 'Moje müsli', zlozenie: 'ovsené vločky, cukor', ...NOVY }],
  'recepty-kozmetika-vlastne-v1': [{ kod: '3600550000003', nazov: 'Môj krém', zlozenie: 'Aqua, Glycerin', ...NOVY }],
  'recepty-skener-v1': [{ id: 'h1', cas: NOVY.ulozene, nazov: 'História A', text: 'cukor, soľ', skore: 40, pasmo: 'obcas', kod: '5900000000009' }],
  'recepty-skener-off-v1': [{ kod: '5900000000009', ulozene: NOVY.ulozene, zdroj: 'sken', vyrobok: { kod: '5900000000009', nazov: 'Z OFF', zlozenie: 'voda', vyziva: {}, url: 'x' } }],
};

test('prenos odkazom: vlastné skeny a história prejdú, ostatné výrobky ako kódy sa dotiahnu', async ({ browser }) => {
  const a = await mobil(browser, SKENER_A);
  await a.page.goto('./#/prenos');
  await expect(a.page.locator('#prenos-so-skenerom')).toBeChecked();
  await expect(a.page.locator('#prenos-qr')).toBeVisible();
  await a.page.locator('details summary').click();
  const odkaz = await a.page.locator('#prenos-odkaz').inputValue();

  const b = await mobil(browser);
  const dotiahnute: string[] = [];
  await b.page.route(OFF, (r) => { dotiahnute.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 1, product: { product_name: 'Dotiahnutý', ingredients_text_sk: 'voda, soľ' } }) }); });
  await b.page.goto(odkaz);
  const tab = b.page.getByRole('table', { name: 'Čo sa zmení' });
  await expect(tab).toContainText('Vlastné skeny (potraviny)');
  await expect(tab).toContainText('História skenov (potraviny)');
  await expect(tab).toContainText('Uložené výrobky – kódy (potraviny)');
  await b.page.screenshot({ path: 'test-results/prenos-skener-nahlad.png', fullPage: true });
  expect(await ls(b.page, 'recepty-skener-vlastne-v1')).toBeNull(); // pred potvrdením sa nič nezmenilo
  await b.page.getByRole('button', { name: 'Zlúčiť údaje' }).click();
  await expect(b.page.getByText('Hotovo – údaje sú zlúčené.')).toBeVisible();
  expect((await ls(b.page, 'recepty-skener-vlastne-v1'))[0].kod).toBe(KOD);
  expect((await ls(b.page, 'recepty-kozmetika-vlastne-v1'))[0].nazov).toBe('Môj krém');
  expect((await ls(b.page, 'recepty-skener-v1'))[0].nazov).toBe('História A');
  await expect.poll(async () => ((await ls(b.page, 'recepty-skener-off-v1')) ?? []).map((u: { kod: string }) => u.kod)).toEqual(['5900000000009']);
  expect(dotiahnute.length).toBe(1);

  // vrátiť späť (v druhom mobile bolo pred prenosom prázdno), potom prenos zopakovať
  await b.page.getByRole('button', { name: /Vrátiť späť/ }).click();
  await expect(b.page.getByText('Vrátené do stavu pred prenosom.')).toBeVisible();
  expect(await ls(b.page, 'recepty-skener-vlastne-v1')).toEqual([]);
  expect(await ls(b.page, 'recepty-skener-v1')).toEqual([]);
  await b.page.goto(odkaz);
  await b.page.reload();
  await b.page.getByRole('button', { name: 'Zlúčiť údaje' }).click();
  await expect(b.page.getByText('Hotovo – údaje sú zlúčené.')).toBeVisible();

  // druhý mobil nájde vlastný sken bez siete
  await b.page.unroute(OFF);
  await b.page.route(OFF, (r) => r.abort('internetdisconnected'));
  await b.page.goto('./#/skener');
  await b.page.getByLabel('Čiarový kód (čísla)').fill(KOD);
  await b.page.getByRole('button', { name: 'Nájsť' }).click();
  await expect(b.page.locator('#sk-vlastny-info')).toContainText('Moje müsli');

  await a.ctx.close(); await b.ctx.close();
});

test('prenos súborom: veľká história sa nezmestí do QR → súbor JSON → načíta sa v druhom mobile', async ({ browser }) => {
  const nahodny = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 36).toString(36)).join('');
  const hist = Array.from({ length: 40 }, (_, i) => ({ id: `id${i}`, cas: `2026-10-${String(1 + (i % 28)).padStart(2, '0')}T10:00:00.000Z`, nazov: `Výrobok ${i}`, text: nahodny(220), skore: 30, pasmo: 'obcas' }));
  const a = await mobil(browser, { ...SKENER_A, 'recepty-skener-v1': hist });
  await a.page.goto('./#/prenos');
  await expect(a.page.locator('#prenos-bez-qr')).toContainText(/priveľa/);
  await expect(a.page.locator('#prenos-bez-qr')).toContainText(/súbor/);
  await expect(a.page.locator('#prenos-qr')).toHaveCount(0);
  await a.page.screenshot({ path: 'test-results/prenos-skener-subor.png', fullPage: true });
  const [dl] = await Promise.all([a.page.waitForEvent('download'), a.page.locator('#prenos-subor-stiahnut').click()]);
  expect(dl.suggestedFilename()).toBe('recepty-prenos.json');
  const cesta = join(tmpdir(), 'recepty-prenos-e2e.json'); // ASCII cesta (Chromium si neporadí s diakritikou v ceste)
  await dl.saveAs(cesta);
  // bez skenera sa QR zmestí
  await a.page.locator('#prenos-so-skenerom').uncheck();
  await expect(a.page.locator('#prenos-qr')).toBeVisible();

  const b = await mobil(browser);
  await b.page.goto('./#/prenos');
  await b.page.locator('#prenos-subor').setInputFiles(cesta);
  await expect(b.page.getByRole('table', { name: 'Čo sa zmení' })).toContainText('História skenov (potraviny)');
  await b.page.getByRole('button', { name: 'Zlúčiť údaje' }).click();
  await expect(b.page.getByText('Hotovo – údaje sú zlúčené.')).toBeVisible();
  expect((await ls(b.page, 'recepty-skener-v1')).length).toBe(40);
  expect((await ls(b.page, 'recepty-skener-vlastne-v1'))[0].kod).toBe(KOD);
  await a.ctx.close(); await b.ctx.close();
});

test('starý prenos (bez skenera) sa načíta ako doteraz', async ({ browser }) => {
  const a = await mobil(browser); // nič v skeneri → žiadna možnosť „Poslať aj skener“
  await a.page.goto('./#/prenos');
  await expect(a.page.locator('#prenos-so-skenerom')).toHaveCount(0);
  await a.page.locator('details summary').click();
  const odkaz = await a.page.locator('#prenos-odkaz').inputValue();
  const b = await mobil(browser, { 'recepty-skener-vlastne-v1': [{ kod: KOD, nazov: 'Zostane', zlozenie: 'cukor', ...NOVY }] });
  await b.page.goto(odkaz);
  const tab = b.page.getByRole('table', { name: 'Čo sa zmení' });
  await expect(tab).toBeVisible();
  await expect(tab).not.toContainText('Vlastné skeny');
  await b.page.getByRole('button', { name: 'Zlúčiť údaje' }).click();
  await expect(b.page.getByText('Hotovo – údaje sú zlúčené.')).toBeVisible();
  expect((await ls(b.page, 'recepty-skener-vlastne-v1'))[0].nazov).toBe('Zostane');
  await a.ctx.close(); await b.ctx.close();
});

/* ---------- živá kamera ---------- */
const MOCK_KAMERY = () => {
  const w = window as unknown as Record<string, unknown>;
  w.__stop = 0; w.__vib = 0; w.__kod = '';
  navigator.mediaDevices.getUserMedia = async () => {
    const c = document.createElement('canvas'); c.width = 320; c.height = 240; c.getContext('2d')!.fillRect(0, 0, 320, 240);
    const s = c.captureStream(10);
    s.getTracks().forEach((t) => { const o = t.stop.bind(t); t.stop = () => { (w.__stop as number)++; o(); }; });
    return s;
  };
  (w as { BarcodeDetector: unknown }).BarcodeDetector = class { async detect() { return w.__kod ? [{ rawValue: w.__kod }] : []; } };
  navigator.vibrate = () => { (w.__vib as number)++; return true; };
};

test('živá kamera v potravinách: zapne sa, načíta kód, vibruje, vypne sa a nájde výrobok', async ({ page }) => {
  await page.addInitScript(MOCK_KAMERY);
  await page.route(OFF, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 1, product: { product_name: 'Z kamery', ingredients_text_sk: 'ovsené vločky 100 %' } }) }));
  await otvor(page, 'skener');
  await page.getByRole('button', { name: /Živá kamera/ }).click();
  await expect(page.locator('#sk-video')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zastaviť kameru' })).toBeVisible();
  await page.evaluate(() => { (window as unknown as { __kod: string }).__kod = '4006381333931'; });
  await expect(page.getByText('Ako sme to spočítali')).toBeVisible();
  await expect(page.locator('#sk-video')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __stop: number }).__stop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => (window as unknown as { __vib: number }).__vib)).toBe(1);
  await expect(page.locator('#sk-kod')).toHaveValue('4006381333931');
});

test('živá kamera sa zastaví pri opustení obrazovky; odmietnutá kamera nechá fotku a ručné vpísanie', async ({ page }) => {
  await page.addInitScript(MOCK_KAMERY);
  await otvor(page, 'kozmetika');
  await page.getByRole('button', { name: /Živá kamera/ }).click();
  await expect(page.locator('#kz-video')).toBeVisible();
  await page.goto('./#/');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __stop: number }).__stop)).toBeGreaterThan(0);

  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('no', 'NotAllowedError'); }; });
  await page.goto('./#/skener');
  await page.getByRole('button', { name: /Živá kamera/ }).click();
  await expect(page.getByRole('alert')).toContainText(/Kameru sa nepodarilo spustiť/);
  await expect(page.getByLabel('Čiarový kód (čísla)')).toBeVisible();
  await expect(page.getByLabel('Odfotiť čiarový kód')).toBeAttached();
});
