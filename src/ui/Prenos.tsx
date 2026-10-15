import { useEffect, useRef, useState } from 'preact/hooks';
import { dajStav, nastav, zluc } from '../store';
import {
  zabal, rozbal, rozdiel, pouzi, odkazZDat, zmestiSaDoQr, vytiahniDataText, PrenosChyba, MIMO_STAVU, mozeKomprimovat,
  type Balik, type Rezim, type RozdielKluca,
} from '../engine/prenos';
import { Hlavicka, Upozornenie } from './kom';

const ZALOHA = 'recepty-pred-prenosom';

/* ---------- QR (lokálne, @zxing/library sa načíta až keď treba) ---------- */
function QrPlatno({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [chyba, setChyba] = useState('');
  useEffect(() => {
    let zrusene = false;
    (async () => {
      try {
        const { QRCodeWriter, BarcodeFormat, EncodeHintType, QRCodeDecoderErrorCorrectionLevel } = await import('@zxing/library');
        const hints = new Map<unknown, unknown>([[EncodeHintType.ERROR_CORRECTION, QRCodeDecoderErrorCorrectionLevel.L], [EncodeHintType.MARGIN, 4]]);
        const m = new QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, 1, 1, hints as Map<never, never>);
        if (zrusene || !ref.current) return;
        const w = m.getWidth(); const h = m.getHeight(); const c = ref.current;
        const sc = Math.max(4, Math.ceil(480 / w));
        c.width = w * sc; c.height = h * sc;
        const g = c.getContext('2d')!;
        g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#000';
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m.get(x, y)) g.fillRect(x * sc, y * sc, sc, sc);
      } catch { if (!zrusene) setChyba('QR kód sa nepodarilo vytvoriť. Použi odkaz alebo súbor.'); }
    })();
    return () => { zrusene = true; };
  }, [text]);
  return chyba ? <p class="upoz" role="alert">{chyba}</p> : <canvas ref={ref} id="prenos-qr" role="img" aria-label="QR kód s prenosom" style="width:min(100%,320px);height:auto;image-rendering:pixelated;background:#fff;border-radius:8px;display:block;margin:8px auto" />;
}

/* ---------- čítanie QR z kamery alebo z fotky ---------- */
async function qrZPlatna(c: HTMLCanvasElement): Promise<string | null> {
  const z = await import('@zxing/library');
  try { return new z.QRCodeReader().decode(new z.BinaryBitmap(new z.HybridBinarizer(new z.HTMLCanvasElementLuminanceSource(c)))).getText(); } catch { return null; }
}
async function qrZFotky(f: Blob): Promise<string | null> {
  const bmp = await createImageBitmap(f);
  for (const max of [1200, 700, 400]) {
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const t = await qrZPlatna(c); if (t) return t;
  }
  return null;
}

function Skenuj({ naText, zavri }: { naText: (t: string) => void; zavri: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [chyba, setChyba] = useState('');
  useEffect(() => {
    let koniec = false; let prud: MediaStream | null = null; let t: ReturnType<typeof setTimeout>;
    (async () => {
      try {
        prud = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (koniec) { prud.getTracks().forEach((x) => x.stop()); return; }
        const v = video.current!; v.srcObject = prud; await v.play();
        const c = document.createElement('canvas');
        const slucka = async () => {
          if (koniec) return;
          if (v.videoWidth) {
            const k = Math.min(1, 800 / v.videoWidth); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
            c.getContext('2d', { willReadFrequently: true })!.drawImage(v, 0, 0, c.width, c.height);
            const txt = await qrZPlatna(c);
            if (txt && vytiahniDataText(txt)) { naText(txt); return; }
          }
          t = setTimeout(slucka, 250);
        };
        slucka();
      } catch { setChyba('Kameru sa nepodarilo spustiť (povolenie?). Použi fotku QR kódu alebo vlož odkaz.'); }
    })();
    return () => { koniec = true; clearTimeout(t); prud?.getTracks().forEach((x) => x.stop()); };
  }, []);
  return (
    <div class="karta">
      <video ref={video} playsInline muted aria-label="Živý obraz z kamery" style="width:100%;border-radius:8px" />
      {chyba && <p class="upoz" role="alert">{chyba}</p>}
      <p class="maly">Namier kameru na QR kód v prvom mobile.</p>
      <button onClick={zavri}>Zastaviť kameru</button>
    </div>
  );
}

/* ---------- odoslanie ---------- */
function Odoslanie() {
  const [odkaz, setOdkaz] = useState('');
  const [chyba, setChyba] = useState('');
  const [sprava, setSprava] = useState('');
  useEffect(() => {
    zabal(dajStav() as unknown as Record<string, unknown>).then((p) => setOdkaz(odkazZDat(p, location.href)), () => setChyba('Zabalenie údajov sa nepodarilo.'));
  }, []);
  const qr = !!odkaz && zmestiSaDoQr(odkaz);
  const subor = () => new File([odkaz], 'recepty-prenos.txt', { type: 'text/plain' });
  const kopiruj = async () => { try { await navigator.clipboard.writeText(odkaz); setSprava('Odkaz je skopírovaný.'); } catch { setSprava('Kopírovanie sa nepodarilo – označ odkaz nižšie a skopíruj ho ručne.'); } };
  const zdielaj = async () => {
    try {
      const f = subor();
      if (navigator.canShare?.({ files: [f] })) await navigator.share({ files: [f], title: 'Recepty – prenos' });
      else await navigator.share({ title: 'Recepty – prenos', url: odkaz });
    } catch { /* zrušené */ }
  };
  const stiahni = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(subor()); a.download = 'recepty-prenos.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); };
  return (
    <section aria-labelledby="prenos-odoslat">
      <h2 id="prenos-odoslat">Odoslať z tohto mobilu</h2>
      <p class="maly">Prenesie nastavenia, obľúbené, hodnotenia, jedálniček, nákup a ďalšie údaje z appky. Všetko ostane len medzi vašimi mobilmi, nič sa neposiela na server. {MIMO_STAVU[0]}</p>
      {chyba && <p class="upoz" role="alert">{chyba}</p>}
      {odkaz && (
        <div class="karta">
          {qr
            ? <><p style="margin:0">V druhom mobile naskenuj QR kód bežnou kamerou (otvorí sa odkaz) alebo v appke cez „Prijať“.</p><QrPlatno text={odkaz} /></>
            : <p class="upoz" style="margin:0">Údajov je na QR kód priveľa. Pošli odkaz alebo súbor (napr. cez správu, e-mail alebo Zdieľať).</p>}
          <div class="rad">
            <button class="hl" onClick={kopiruj}>📋 Kopírovať odkaz</button>
            {typeof navigator.share === 'function' && <button onClick={zdielaj}>📤 Zdieľať</button>}
            <button onClick={stiahni}>⬇ Stiahnuť súbor</button>
          </div>
          <p role="status" class="maly">{sprava}</p>
          <details><summary class="maly">Ukázať odkaz ({odkaz.length} znakov{mozeKomprimovat() ? '' : ', bez kompresie'})</summary>
            <textarea readOnly id="prenos-odkaz" aria-label="Odkaz na prenos" rows={4} style="width:100%" value={odkaz} onFocus={(e) => (e.target as HTMLTextAreaElement).select()} />
          </details>
        </div>
      )}
    </section>
  );
}

/* ---------- náhľad a import ---------- */
const sk = (n: number, a: string, b: string, c: string) => `${n} ${n === 1 ? a : n >= 2 && n <= 4 ? b : c}`;
const polozky = (n: number) => sk(n, 'položka', 'položky', 'položiek');

function Riadok({ r, rezim }: { r: RozdielKluca; rezim: Rezim }) {
  const bezZmeny = r.nove === 0 && r.konflikty === 0 && (rezim === 'zlucit' || r.lenLokalne === 0);
  return (
    <tr>
      <td>{r.popis}</td>
      <td>{r.lokalne}</td>
      <td>{r.prichadzajuce}</td>
      <td>{bezZmeny ? 'bez zmeny' : rezim === 'zlucit'
        ? `${r.nove ? `+${r.nove} nových` : ''}${r.nove && r.konflikty ? ', ' : ''}${r.konflikty ? `${r.konflikty} prepíše` : ''}`
        : `spolu ${r.prichadzajuce}${r.lenLokalne ? `, stratíš ${r.lenLokalne}` : ''}`}</td>
    </tr>
  );
}

function Nahlad({ data, zrus }: { data: string; zrus: () => void }) {
  const [stavNacitania, setStavNacitania] = useState<'caka' | 'ok' | 'chyba'>('caka');
  const [balik, setBalik] = useState<Balik | null>(null);
  const [chyba, setChyba] = useState('');
  const [varovania, setVarovania] = useState<string[]>([]);
  const [rezim, setRezim] = useState<Rezim>('zlucit');
  const [hotovo, setHotovo] = useState('');
  useEffect(() => {
    setStavNacitania('caka'); setHotovo('');
    rozbal(data).then((r) => { setBalik(r.balik); setVarovania(r.varovania); setStavNacitania('ok'); }, (e) => { setChyba(e instanceof PrenosChyba ? e.message : 'Prenos sa nepodarilo načítať.'); setStavNacitania('chyba'); });
  }, [data]);
  if (stavNacitania === 'caka') return <p role="status">Načítavam prenos…</p>;
  if (stavNacitania === 'chyba' || !balik) return (
    <>
      <p class="upoz" role="alert">{chyba}</p>
      <div class="rad"><button onClick={zrus}>Späť</button></div>
    </>
  );
  const lok = dajStav() as unknown as Record<string, unknown>;
  const rz = rozdiel(lok, balik);
  const stratene = rz.kluce.reduce((s, r) => s + r.lenLokalne + r.konflikty, 0);
  const zmeny = rz.kluce.reduce((s, r) => s + r.nove + r.konflikty + (rezim === 'nahradit' ? r.lenLokalne : 0), 0);
  const potvrd = () => {
    try { localStorage.setItem(ZALOHA, JSON.stringify(dajStav())); } catch { /* bez zálohy */ }
    nastav((s) => zluc(pouzi(s as unknown as Record<string, unknown>, balik, rezim) as never));
    setHotovo(rezim === 'zlucit' ? 'Hotovo – údaje sú zlúčené.' : 'Hotovo – údaje v tomto mobile sú nahradené.');
  };
  const spat = () => {
    try { const z = localStorage.getItem(ZALOHA); if (z) { nastav(() => zluc(JSON.parse(z))); setHotovo('Vrátené do stavu pred prenosom.'); } } catch { setHotovo('Vrátenie sa nepodarilo.'); }
  };
  if (hotovo) return (
    <div class="karta">
      <p role="status" style="margin:0"><strong>{hotovo}</strong></p>
      <div class="rad"><a class="tlacidlo hl" href="#/">Do appky</a><button onClick={spat}>↩ Vrátiť späť</button></div>
    </div>
  );
  return (
    <>
      <p>Prenos z {balik.c ? new Date(balik.c).toLocaleString('sk-SK') : 'druhého mobilu'}. Pozri, čo sa zmení, a potvrď.</p>
      {varovania.map((v) => <p class="upoz" key={v}>{v}</p>)}
      <fieldset class="karta" style="border:0">
        <label class="pol"><input type="radio" name="prenos-rezim" checked={rezim === 'zlucit'} onChange={() => setRezim('zlucit')} /> <strong>Zlúčiť</strong> (odporúčané) – pridá nové a nič nezmaže; pri rozpore vyhrá prenos</label>
        <label class="pol"><input type="radio" name="prenos-rezim" checked={rezim === 'nahradit'} onChange={() => setRezim('nahradit')} /> <strong>Nahradiť</strong> – údaje z prenosu prepíšu tie v tomto mobile</label>
      </fieldset>
      <div style="overflow-x:auto">
        <table class="maly" style="width:100%;border-collapse:collapse" aria-label="Čo sa zmení">
          <thead><tr><th align="left">Údaj</th><th>Teraz</th><th>Prenos</th><th align="left">Výsledok</th></tr></thead>
          <tbody>{rz.kluce.map((r) => <Riadok key={r.kluc} r={r} rezim={rezim} />)}</tbody>
        </table>
      </div>
      {rz.ignorovane.length > 0 && <p class="maly">Preskočené (táto verzia appky ich nepozná): {rz.ignorovane.join(', ')}.</p>}
      {rezim === 'nahradit' && stratene > 0 && <p class="upoz" role="alert">Pozor: nahradením sa stratí alebo prepíše {polozky(stratene)} v tomto mobile. Predtým sa ale uloží záloha a pôjde to vrátiť späť.</p>}
      {zmeny === 0 && <p class="maly">V tomto mobile je už všetko rovnaké, nič sa nezmení.</p>}
      <div class="rad">
        <button class="hl" onClick={potvrd}>{rezim === 'zlucit' ? 'Zlúčiť údaje' : 'Nahradiť údaje'}</button>
        <button onClick={zrus}>Zrušiť</button>
      </div>
    </>
  );
}

/* ---------- prijatie ---------- */
function Prijatie({ naData }: { naData: (d: string) => void }) {
  const [kamera, setKamera] = useState(false);
  const [vlozene, setVlozene] = useState('');
  const [chyba, setChyba] = useState('');
  const text = (t: string) => { const d = vytiahniDataText(t); if (!d) { setChyba('V tom nie je odkaz na prenos z appky Recepty.'); return; } setChyba(''); setKamera(false); naData(d); };
  const subor = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0]; (e.target as HTMLInputElement).value = '';
    if (!f) return;
    setChyba('');
    try {
      if (f.type.startsWith('image/')) { const t = await qrZFotky(f); if (!t) { setChyba('QR kód sa na fotke nenašiel. Skús ho odfotiť zblízka a rovno.'); return; } text(t); }
      else text(await f.text());
    } catch { setChyba('Súbor sa nepodarilo načítať.'); }
  };
  return (
    <section aria-labelledby="prenos-prijat">
      <h2 id="prenos-prijat">Prijať v tomto mobile</h2>
      <p class="maly">Odkaz z prvého mobilu stačí otvoriť v tomto mobile – appka sa sama opýta, čo urobiť. Alebo:</p>
      <div class="rad">
        <button class="hl" onClick={() => setKamera(!kamera)}>📷 Naskenovať QR</button>
        <label class="tlacidlo" style="display:inline-flex;align-items:center;cursor:pointer">📁 Súbor alebo fotka QR<input id="prenos-subor" type="file" accept="image/*,text/plain,.txt" hidden onChange={subor} /></label>
      </div>
      {kamera && <Skenuj naText={text} zavri={() => setKamera(false)} />}
      <label class="maly" for="prenos-vloz">Vložiť odkaz</label>
      <div class="rad">
        <input id="prenos-vloz" type="text" placeholder="https://…#/prenos/…" value={vlozene} onInput={(e) => setVlozene((e.target as HTMLInputElement).value)} style="flex:1;min-width:160px;width:auto" />
        <button onClick={() => text(vlozene)} disabled={!vlozene.trim()}>Načítať</button>
      </div>
      {chyba && <p class="upoz" role="alert">{chyba}</p>}
    </section>
  );
}

export function Prenos({ data }: { data?: string }) {
  const [ruc, setRuc] = useState<string | null>(null);
  const d = ruc ?? data;
  const zrus = () => { setRuc(null); location.hash = '#/prenos'; };
  return (
    <>
      <Hlavicka nazov="Preniesť do druhého mobilu" />
      {d ? <Nahlad data={d} zrus={zrus} /> : <><Odoslanie /><Prijatie naData={setRuc} /></>}
      <p class="maly">Prenos sa deje len medzi mobilmi, bez servera. Odkaz obsahuje všetky tvoje údaje z appky – nezdieľaj ho verejne.</p>
      <Upozornenie />
    </>
  );
}
