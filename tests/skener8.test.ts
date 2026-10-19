import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nacitajOff, offPridatUrl, vlastnyNaVyrobok } from '../src/skener/off';
import { nacitajObf, obfPridatUrl } from '../src/kozmetika/obf';
import { ulozVyrobok, nacitajUlozisko, LIMIT_VYROBKOV } from '../src/skener/ulozisko';
import { vlastneSkenyPotravin, vlastneSkenyKozmetiky, oznacenieVlastneho, zlucVlastne, overVlastny, LIMIT_VLASTNYCH } from '../src/skener/vlastne-skeny';
import { pridajDoHistorie, nacitajHistoriu } from '../src/skener/historia';
import { pridajDoHistorie as pridajK, nacitajHistoriu as histK, ulozObf } from '../src/kozmetika/ulozisko';
import { zoberSkener, overSkener, zlucSkener, rozdielSkener, pouziSkener, zalohujSkener, vratSkener, dotiahniCakajuce, PRAZDNY_SKENER } from '../src/skener/prenos-skener';
import { zabal, rozbal, zabalJson, vytiahniDataText, odkazZDat, zmestiSaDoQr, MAX_QR_ZNAKOV, FORMAT } from '../src/engine/prenos';
import { spustiKameru } from '../src/skener/kamera';
import type { OffVyrobok } from '../src/skener/off';

function falosnyStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); }, clear: () => m.clear() };
}
beforeEach(() => { vi.stubGlobal('localStorage', falosnyStorage()); vi.unstubAllGlobals(); vi.stubGlobal('localStorage', falosnyStorage()); });

const KOD = '4006381333931';
const off = (kod: string, zlozenie = 'voda, cukor'): OffVyrobok => ({ kod, nazov: `Z OFF ${kod}`, zlozenie, vyziva: {}, url: 'x' });

describe('vlastný sken: prednosť a offline', () => {
  it('uloží pod kód, nájde bez siete a označí dátumom', async () => {
    vlastneSkenyPotravin.uloz({ kod: KOD, nazov: 'Moje müsli', zlozenie: 'ovsené vločky, cukor' }, new Date(2026, 9, 19, 12));
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('bez siete'); }));
    const v = await nacitajOff(KOD);
    expect(v?.vlastny).toBe(true);
    expect(v?.zlozenie).toBe('ovsené vločky, cukor');
    expect(fetch).not.toHaveBeenCalled();
    expect(oznacenieVlastneho(v?.ulozene)).toBe('Vlastný sken (19.10.2026)');
  });
  it('má prednosť pred výrobkom z lokálnej zásoby (aj pred OFF bez zloženia)', async () => {
    ulozVyrobok(off(KOD, ''));
    vlastneSkenyPotravin.uloz({ kod: KOD, nazov: 'Doplnené', zlozenie: 'mlieko, soľ' });
    const v = await nacitajOff(KOD);
    expect(v?.vlastny).toBe(true);
    expect(v?.zlozenie).toBe('mlieko, soľ');
  });
  it('dá sa zmazať; potom sa hľadá ďalej (OFF)', async () => {
    vlastneSkenyPotravin.uloz({ kod: KOD, nazov: 'A', zlozenie: 'cukor' });
    vlastneSkenyPotravin.zmaz(KOD);
    expect(vlastneSkenyPotravin.najdi(KOD)).toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    // balík nie je dostupný (fetch 404) → OFF 404 → null
    expect(await nacitajOff(KOD)).toBeNull();
  });
  it('nevypadne pri limite 300 uložených výrobkov', () => {
    vlastneSkenyPotravin.uloz({ kod: KOD, nazov: 'Môj', zlozenie: 'cukor' });
    for (let i = 0; i < LIMIT_VYROBKOV + 20; i++) ulozVyrobok(off(String(10000000 + i)));
    expect(nacitajUlozisko().length).toBe(LIMIT_VYROBKOV);
    expect(vlastneSkenyPotravin.najdi(KOD)?.nazov).toBe('Môj');
  });
  it('potraviny a kozmetika majú oddelené úložiská', () => {
    vlastneSkenyPotravin.uloz({ kod: KOD, nazov: 'A', zlozenie: 'cukor' });
    expect(vlastneSkenyKozmetiky.najdi(KOD)).toBeNull();
  });
  it('kozmetika: vlastný sken má prednosť a funguje bez siete', async () => {
    vlastneSkenyKozmetiky.uloz({ kod: KOD, nazov: 'Krém', zlozenie: 'Aqua, Glycerin' });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('bez siete'); }));
    const v = await nacitajObf(KOD);
    expect(v?.vlastny).toBe(true);
    expect(v?.zlozenie).toBe('Aqua, Glycerin');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('neplatné záznamy sa zahodia, limit počtu platí', () => {
    expect(overVlastny({ kod: 'abc', zlozenie: 'x' })).toBeNull();
    expect(overVlastny({ kod: KOD, zlozenie: '  ' })).toBeNull();
    expect(overVlastny({ kod: KOD, zlozenie: 'cukor' })?.nazov).toBe(`Výrobok ${KOD}`);
    localStorage.setItem('recepty-skener-vlastne-v1', '{zle');
    expect(vlastneSkenyPotravin.nacitaj()).toEqual([]);
    expect(LIMIT_VLASTNYCH).toBeGreaterThan(LIMIT_VYROBKOV);
  });
  it('zlučovanie: pri rovnakom kóde vyhrá novší', () => {
    const a = overVlastny({ kod: KOD, nazov: 'staré', zlozenie: 'a', ulozene: '2026-10-01T00:00:00Z' })!;
    const b = overVlastny({ kod: KOD, nazov: 'nové', zlozenie: 'b', ulozene: '2026-10-05T00:00:00Z' })!;
    expect(zlucVlastne([b], [a])[0].nazov).toBe('nové');
    expect(vlastnyNaVyrobok(a).vlastny).toBe(true);
  });
  it('história ukladá kód aj bez výrobku z OFF', () => {
    pridajDoHistorie({ nazov: 'X', text: 'cukor', skore: 10, pasmo: 'obcas', kod: KOD });
    expect(nacitajHistoriu()[0].kod).toBe(KOD);
  });
});

describe('tlačidlo „Pridať do Open Food Facts / Open Beauty Facts“', () => {
  it('adresa s daným kódom', () => {
    expect(offPridatUrl(KOD)).toBe(`https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=${KOD}`);
    expect(obfPridatUrl(KOD)).toBe(`https://world.openbeautyfacts.org/cgi/product.pl?type=edit&code=${KOD}`);
  });
  it('kód sa zakóduje (nič cudzie sa do adresy nedostane)', () => {
    expect(offPridatUrl('1&x=2')).toContain('code=1%26x%3D2');
  });
});

describe('prenos skenera', () => {
  const nastav = () => {
    vlastneSkenyPotravin.uloz({ kod: KOD, nazov: 'Môj', zlozenie: 'cukor, múka' });
    vlastneSkenyKozmetiky.uloz({ kod: '3600550000003', nazov: 'Krém', zlozenie: 'Aqua, Parfum' });
    pridajDoHistorie({ nazov: 'H1', text: 'cukor', skore: 30, pasmo: 'obcas', kod: KOD });
    pridajK({ nazov: 'K1', text: 'Aqua', skore: 80, pasmo: 'dobre' });
    ulozVyrobok(off('5900000000009')); ulozVyrobok(off(KOD));
    ulozObf({ kod: '3600550000010', nazov: 'OBF', zlozenie: 'Aqua', url: 'x' });
  };
  it('zoberSkener: vlastné skeny celé, ostatné výrobky len kódy', () => {
    nastav();
    const d = zoberSkener();
    expect(d.vs).toHaveLength(1); expect(d.vk).toHaveLength(1);
    expect(d.h).toHaveLength(1); expect(d.hk).toHaveLength(1);
    expect(d.u).toEqual(['5900000000009']); // KOD je vlastný sken → nejde dvakrát
    expect(d.uk).toEqual(['3600550000010']);
  });
  it('kolobeh cez odkaz: zabalené → rozbalené → použité v druhom mobile', async () => {
    nastav();
    const d = zoberSkener();
    const text = await zabal({ oblubene: ['a'] }, 1, { sk: d });
    const { balik } = await rozbal(text);
    const pri = overSkener(balik.x?.sk)!;
    expect(pri.vs[0].zlozenie).toBe('cukor, múka');
    expect(pri.u).toEqual(d.u);
    // druhý mobil
    vi.stubGlobal('localStorage', falosnyStorage());
    pouziSkener(pri, 'zlucit');
    expect(vlastneSkenyPotravin.najdi(KOD)?.zlozenie).toBe('cukor, múka');
    expect(vlastneSkenyKozmetiky.nacitaj()).toHaveLength(1);
    expect(nacitajHistoriu()).toHaveLength(1); expect(histK()).toHaveLength(1);
  });
  it('kódy sa dotiahnu z balíka/OFF, keď je internet; pri výpadku ostanú čakať', async () => {
    const pri = { ...PRAZDNY_SKENER(), u: ['4006381333931'], uk: ['3600550000010'] };
    pouziSkener(pri, 'zlucit');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('bez siete'); }));
    expect(await dotiahniCakajuce()).toBe(0);
    const odpoved = (p: object) => new Response(JSON.stringify({ status: 1, product: p }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn(async (u: string) => (String(u).includes('openbeautyfacts') ? odpoved({ product_name: 'Krém', ingredients_text_en: 'Aqua' }) : String(u).includes('openfoodfacts') ? odpoved({ product_name: 'Müsli', ingredients_text_sk: 'ovos' }) : new Response('', { status: 404 }))));
    expect(await dotiahniCakajuce()).toBe(2);
    expect(nacitajUlozisko().map((x) => x.kod)).toEqual(['4006381333931']);
    expect(await dotiahniCakajuce()).toBe(0);
  });
  it('zlúčiť nič nezmaže, nahradiť prepíše históriu a vlastné skeny', () => {
    nastav();
    const lok = zoberSkener();
    const pri = { ...PRAZDNY_SKENER(), h: [{ id: 'iny', cas: '2026-10-18T00:00:00Z', nazov: 'Iné', text: 'soľ', skore: 1, pasmo: 'zle' }], vs: [overVlastny({ kod: '8590000000008', nazov: 'N', zlozenie: 'soľ' })!] };
    const z = zlucSkener(lok, pri, 'zlucit');
    expect(z.h).toHaveLength(2); expect(z.vs).toHaveLength(2); expect(z.hk).toHaveLength(1);
    const n = zlucSkener(lok, pri, 'nahradit');
    expect(n.h.map((x) => x.id)).toEqual(['iny']); expect(n.vs.map((x) => x.kod)).toEqual(['8590000000008']);
    expect(n.hk).toHaveLength(1); // prenos kozmetiku neobsahuje → ostáva
  });
  it('náhľad: počty nových a konfliktov', () => {
    nastav();
    const lok = zoberSkener();
    const novsi = { ...lok.vs[0], zlozenie: 'iné', ulozene: new Date(Date.now() + 1e6).toISOString() };
    const r = rozdielSkener(lok, { ...PRAZDNY_SKENER(), vs: [novsi, overVlastny({ kod: '8590000000008', zlozenie: 'x' })!] });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ nove: 1, konflikty: 1, lokalne: 1, prichadzajuce: 2 });
  });
  it('záloha a vrátenie späť', () => {
    nastav();
    zalohujSkener();
    pouziSkener({ ...PRAZDNY_SKENER(), vs: [overVlastny({ kod: '8590000000008', zlozenie: 'x' })!] }, 'nahradit');
    expect(vlastneSkenyPotravin.nacitaj().map((v) => v.kod)).toEqual(['8590000000008']);
    expect(vratSkener()).toBe(true);
    expect(vlastneSkenyPotravin.najdi(KOD)).not.toBeNull();
  });
  it('poškodené a nebezpečné údaje sa vyčistia; prázdne = null', () => {
    expect(overSkener(null)).toBeNull();
    expect(overSkener({ h: 'x', vs: [{ kod: 'zly' }], u: ['abc', 5, '12345678'] })).toMatchObject({ u: ['12345678'], vs: [], h: [] });
    expect(overSkener({ u: ['abc'] })).toBeNull();
  });
  it('staré prenosy (bez skenera) fungujú dál', async () => {
    const text = await zabal({ oblubene: ['a'] }, 5);
    const { balik } = await rozbal(text);
    expect(balik.x).toBeUndefined();
    expect(balik.s.oblubene).toEqual(['a']);
    expect(overSkener(balik.x?.sk)).toBeNull();
  });
  it('súbor JSON: rovnaký obsah, rozpozná sa ako prenos, bez limitu QR', async () => {
    const velke = { ...PRAZDNY_SKENER(), h: Array.from({ length: 150 }, (_, i) => ({ id: `id${i}`, cas: '2026-10-01T00:00:00Z', nazov: `Výrobok ${i}`, text: 'múka, cukor, palmový tuk '.repeat(12) + i, skore: 20, pasmo: 'zle' })) };
    const stav = { oblubene: ['a'] };
    const odkaz = odkazZDat(await zabal(stav, 1, { sk: velke }), 'https://x.sk/Recepty/');
    const json = zabalJson(stav, 1, { sk: velke });
    expect(JSON.parse(json).a).toBe(FORMAT);
    const dt = vytiahniDataText(json);
    expect(dt).toBe(json);
    const { balik } = await rozbal(dt!);
    expect(overSkener(balik.x?.sk)!.h.length).toBeGreaterThan(100);
    expect(zmestiSaDoQr(odkaz)).toBe(odkaz.length <= MAX_QR_ZNAKOV);
    // malý prenos sa do QR zmestí
    expect(zmestiSaDoQr(odkazZDat(await zabal(stav, 1), 'https://x.sk/Recepty/'))).toBe(true);
  });
  it('poškodený JSON súbor → zrozumiteľná chyba', async () => {
    await expect(rozbal('{"a":"recepty-prenos","v":')).rejects.toThrow(/poškodený/);
    await expect(rozbal('{"a":"iná appka"}')).rejects.toThrow(/nie je prenos/);
  });
});

describe('živá kamera', () => {
  const video = () => ({ srcObject: null as unknown, play: async () => {} }) as unknown as HTMLVideoElement;
  it('prvý platný kód: signál (vibrácia), zastavenie kamery, jedno volanie', async () => {
    vi.useFakeTimers();
    const stop = vi.fn(); const vibrate = vi.fn();
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })) }, vibrate });
    let n = 0;
    vi.stubGlobal('BarcodeDetector', class { async detect() { n++; return n < 2 ? [{ rawValue: '123' }] : [{ rawValue: '4006381333931' }]; } });
    const naKod = vi.fn();
    await spustiKameru(video(), naKod);
    await vi.advanceTimersByTimeAsync(2000);
    expect(naKod).toHaveBeenCalledTimes(1);
    expect(naKod).toHaveBeenCalledWith('4006381333931');
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalled();
    vi.useRealTimers();
  });
  it('zastav() vypne kameru a už nič nenájde', async () => {
    vi.useFakeTimers();
    const stop = vi.fn();
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })) } });
    vi.stubGlobal('BarcodeDetector', class { async detect() { return []; } });
    const naKod = vi.fn();
    const k = await spustiKameru(video(), naKod);
    k.zastav();
    expect(stop).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(naKod).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
  it('odmietnutá kamera → chyba (appka ponúkne fotku)', async () => {
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn(async () => { throw new Error('NotAllowedError'); }) } });
    await expect(spustiKameru(video(), vi.fn())).rejects.toThrow();
  });
});
