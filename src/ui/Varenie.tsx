import { useEffect, useMemo, useState } from 'preact/hooks';
import { najdiCasy, popisCasu, odpocet } from '../engine/casovac';

interface Casovac { id: number; nazov: string; krok: number; koniec: number; hotovo: boolean }

// Časovače žijú mimo komponentu: prežijú zmenu kroku aj zatvorenie a znovuotvorenie režimu varenia.
let casovace: Casovac[] = [];
let dalsieId = 1;
let tikac: ReturnType<typeof setInterval> | null = null;
const poslucham = new Set<() => void>();
const zmena = () => poslucham.forEach((f) => f());

function pipni() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    [0, 0.35, 0.7].forEach((t) => {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.25;
      o.connect(g); g.connect(ac.destination);
      o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.25);
    });
    setTimeout(() => ac.close().catch(() => {}), 1500);
  } catch { /* zvuk nie je dostupný */ }
}

async function oznam(c: Casovac) {
  pipni();
  try { navigator.vibrate?.([300, 150, 300, 150, 300]); } catch { /* bez vibrácie */ }
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const telo = `Časovač „${c.nazov}“ skončil.`;
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) await reg.showNotification('Recepty – čas vypršal', { body: telo, tag: `casovac-${c.id}` });
      else new Notification('Recepty – čas vypršal', { body: telo });
    }
  } catch { /* notifikácie nie sú dostupné */ }
}

function tik() {
  const t = Date.now();
  for (const c of casovace) {
    if (!c.hotovo && c.koniec <= t) { c.hotovo = true; void oznam(c); }
  }
  const bezi = casovace.some((c) => !c.hotovo);
  if (!bezi && tikac) { clearInterval(tikac); tikac = null; }
  zmena();
}

function spusti(nazov: string, krok: number, sekundy: number) {
  // povolenie sa pýta až pri ťuknutí na štart
  try { if (typeof Notification !== 'undefined' && Notification.permission === 'default') void Notification.requestPermission(); } catch { /* nič */ }
  casovace = [...casovace, { id: dalsieId++, nazov, krok, koniec: Date.now() + sekundy * 1000, hotovo: false }];
  if (!tikac) tikac = setInterval(tik, 500);
  zmena();
}

function zrus(id: number) {
  casovace = casovace.filter((c) => c.id !== id);
  zmena();
}

function useCasovace(): Casovac[] {
  const [, setN] = useState(0);
  useEffect(() => {
    const f = () => setN((n) => n + 1);
    poslucham.add(f);
    return () => { poslucham.delete(f); };
  }, []);
  return casovace;
}

export function Varenie({ postup, i, set, nazov }: { postup: string[]; i: number; set: (n: number | null) => void; nazov: string }) {
  const cs = useCasovace();
  const casy = useMemo(() => najdiCasy(postup[i]), [postup, i]);
  useEffect(() => {
    type Lock = { release: () => Promise<void> };
    let lock: Lock | null = null;
    let zrusene = false;
    const nav = navigator as unknown as { wakeLock?: { request: (t: string) => Promise<Lock> } };
    const ziskaj = () => { nav.wakeLock?.request('screen').then((l) => { if (zrusene) l.release().catch(() => {}); else lock = l; }).catch(() => {}); };
    const naViditelnost = () => { if (document.visibilityState === 'visible') ziskaj(); };
    ziskaj();
    document.addEventListener('visibilitychange', naViditelnost);
    return () => { zrusene = true; document.removeEventListener('visibilitychange', naViditelnost); lock?.release().catch(() => {}); };
  }, []);
  const koniec = cs.filter((c) => c.hotovo);
  return (
    <div class="varenie" role="dialog" aria-label={`Varenie: ${nazov}`}>
      <div class="horna"><strong>{nazov}</strong><button class="male" onClick={() => set(null)}>✕ Zavrieť</button></div>
      {cs.length > 0 && (
        <ul class="cisty casovace" aria-label="Časovače">
          {cs.map((c) => (
            <li key={c.id} class={c.hotovo ? 'cas-hotovo' : ''} data-testid="casovac">
              <span class="cas-cislo" role="timer" aria-label={`Časovač ${c.nazov}`}>{c.hotovo ? 'Čas vypršal!' : odpocet(c.koniec - Date.now())}</span>
              <span class="cas-nazov">krok {c.krok + 1} · {c.nazov}</span>
              <button class="male" onClick={() => zrus(c.id)} aria-label={c.hotovo ? 'Zavrieť upozornenie' : `Zrušiť časovač ${c.nazov}`}>{c.hotovo ? 'OK' : '✕'}</button>
            </li>
          ))}
        </ul>
      )}
      {koniec.length > 0 && <div role="alert" class="sr-only">Časovač skončil: {koniec.map((c) => c.nazov).join(', ')}</div>}
      <div class="maly">Krok {i + 1} z {postup.length}</div>
      <div class="krok">{postup[i]}</div>
      {casy.length > 0 && (
        <div class="rad cas-ponuka">
          {casy.flatMap((c) => {
            const hodnoty = c.odS === c.doS ? [c.doS] : [c.odS, c.doS];
            return hodnoty.map((sek) => (
              <button key={`${c.text}-${sek}`} class="male cas-btn" onClick={() => spusti(popisCasu(sek), i, sek)}>⏱ Časovač {popisCasu(sek)}{c.odS !== c.doS ? (sek === c.doS ? ' (horná hranica)' : ' (dolná hranica)') : ''}</button>
            ));
          })}
        </div>
      )}
      <div class="rad" style="justify-content:space-between">
        <button disabled={i === 0} onClick={() => set(i - 1)} style="flex:1;min-height:60px">← Späť</button>
        {i < postup.length - 1 ? <button class="hl" onClick={() => set(i + 1)} style="flex:1;min-height:60px">Ďalej →</button> : <button class="hl" onClick={() => set(null)} style="flex:1;min-height:60px">Hotovo 🎉</button>}
      </div>
    </div>
  );
}
