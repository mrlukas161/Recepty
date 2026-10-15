import { Pecat } from '../ui/kom';
import { ZDROJE_KOZ } from './databaza';
import { KATEGORIE, POZNAMKA_SKORE_K, type SkoreKoz } from './skore';
import type { Latka, Parsovane, Polozka } from './typy';

export const UROVEN_TEXT: Record<Latka['u'], string> = { vyhladavanie: 'overené vyhľadávaním, originál nečítaný', odhad: 'odhad / prax, nie dôkaz' };
const STUPEN: Record<Latka['s'], [string, string]> = {
  zakazana: ['sk-vyhnut-sa', 'ZAKÁZANÉ'], diskusia: ['sk-obmedzit', 'DISKUSIA'], obmedzena: ['sk-v-poriadku', 'OBMEDZENÉ'], pozor: ['sk-obmedzit', 'POZOR'], ok: ['sk-bez-vyhrad', 'BEŽNÁ'],
};

export function ZdrojeK({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <ul class="maly" style="margin:4px 0 0;padding-left:18px">
      {ids.map((i) => ZDROJE_KOZ[i] && <li key={i}><a href={ZDROJE_KOZ[i].url} target="_blank" rel="noopener noreferrer">{ZDROJE_KOZ[i].n}</a></li>)}
    </ul>
  );
}

function RiadokZlozky({ p }: { p: Polozka }) {
  const l = p.latka;
  const [cls, txt] = l ? STUPEN[l.s] : ['sk-neznama', p.ci ? 'FARBIVO' : '?'];
  return (
    <div class="sk-zl">
      <span class={`sk-st ${cls}`}>{txt}</span>
      <details>
        <summary>{p.poradie}. {l ? l.m[0] : p.nazov}{p.nano ? ' (nano)' : ''}{p.zhoda === 'priblizna' ? <small> (opravené z „{p.nazov}“)</small> : null}</summary>
        {l ? (
          <div class="sk-pl">
            <div><b>Funkcia:</b> {l.f.join(', ')} <small class="maly">(naše zhrnutie)</small></div>
            <div><b>Prečo:</b> {l.d}</div>
            {l.l && <div><b>Limit podľa predpisu:</b> {l.l}</div>}
            <div><span class="tag">{UROVEN_TEXT[l.u]}</span></div>
            <ZdrojeK ids={l.z} />
          </div>
        ) : (
          <div class="sk-pl">
            {p.ci ? <>Farbivo CI {p.ci}: v EÚ smú byť len farbivá z Prílohy IV (niektoré len pre určité výrobky). Túto konkrétnu položku v našej databáze nemáme, preto ju nehodnotíme.</> : <>Zložku <b>{p.nazov}</b> nemáme v databáze alebo ju OCR pokazilo. Nehodnotíme ju (nepenalizujeme). Skontroluj prepis podľa obalu.</>}
          </div>
        )}
      </details>
    </div>
  );
}

export function VysledokK({ r, s, nazov }: { r: Parsovane; s: SkoreKoz; nazov?: string }) {
  return (
    <div>
      <div class="karta" style="animation:none">
        <div class="riadok">
          <Pecat skore={s.celkom} pasmo={s.pasmo} />
          <div class="rozt">
            <h2 style="margin:0">{s.pasmoText}{s.nizkaSpolahlivost ? ' (orientačne)' : ''}</h2>
            <div class="maly">{nazov ? `${nazov} · ` : ''}{s.spolu} zložiek, rozpoznaných {s.rozpoznane}</div>
          </div>
        </div>
        <p class="sk-pozn" style="margin-top:10px">{POZNAMKA_SKORE_K}</p>
      </div>
      {s.nizkaSpolahlivost && <div class="sk-varovanie" role="alert"><b>{s.spolahlivostText}.</b> Skóre je len orientačné a nikdy nie „Výborné“. Skontroluj prepis zloženia podľa obalu.</div>}
      {s.poznamky.map((x) => <div class="upoz" key={x}>{x}</div>)}

      <h2>Ako sme to spočítali</h2>
      {s.faktory.map((f) => (
        <div class="karta" style="animation:none" key={f.id}>
          <div class="riadok"><div class="rozt"><h3 style="margin:0">{f.nazov}</h3></div><b>{f.body ? `−${f.body}` : '0'}</b></div>
          {f.polozky.length ? (
            <ul class="maly" style="margin:6px 0 0;padding-left:18px">{f.polozky.map((x) => <li key={x.id ?? x.nazov}>{x.nazov}{x.body ? ` (−${x.body})` : ' (bez odpočtu, len povolená s limitom)'}</li>)}</ul>
          ) : <div class="maly">Nič z tejto kategórie sme nenašli.</div>}
          {f.orezane && <div class="maly">Odpočet v tejto kategórii sme zastropovali.</div>}
          {!f.polozky.length ? null : <div class="maly" style="margin-top:4px">{KATEGORIE.find((k) => k.id === f.id)?.popis ?? f.popis}</div>}
        </div>
      ))}

      <h2>Zložky (ťukni pre detail)</h2>
      {r.polozky.map((p, i) => (
        <div key={`${p.nazov}-${i}`}>
          {s.hranica1 === i && <div class="maly sk-pozn" style="border-top:2px dashed var(--ciara);padding-top:4px">Od tejto zložky ďalej ide podľa zoznamu o ≤ 1 % (EÚ radí zložky nad 1 % zostupne, pod 1 % v ľubovoľnom poradí; naša hranica je odhad podľa prvej látky s overeným stropom do 1 %).</div>}
          <RiadokZlozky p={p} />
        </div>
      ))}
      {r.moze.length > 0 && <><h3>Môže obsahovať (+/-)</h3>{r.moze.map((p, i) => <RiadokZlozky key={`m${i}`} p={p} />)}</>}
      {r.opravy.length > 0 && <p class="maly">Opravili sme {r.opravy.length} preklepov z OCR: {r.opravy.slice(0, 8).map((o) => `${o.z} → ${o.na}`).join('; ')}.</p>}
    </div>
  );
}
