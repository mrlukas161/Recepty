import { PASMO_TEXT } from '../engine/score';
import { ZDROJ } from '../data/zdroje';
import { ZdrojKarta } from '../ui/Zdroje';
import { Pecat } from '../ui/kom';
import { ALERGEN_NAZOV } from './alergeny';
import { stupenPreDomacnost, POZNAMKA_SKORE_V, type SkoreVyrobku } from './skore';
import { INFOS } from '../ctx';
import { domaceAlternativy, tipyNaVyber } from './lepsia';
import { STUPEN_TEXT, STUPEN_IKONA, type Rozbor, type Zlozka } from './typy';

const UROVEN_TEXT: Record<string, string> = { 'silné': 'dôkazy: silné', 'stredné': 'dôkazy: stredné', 'slabé': 'dôkazy: slabé', prax: 'prax, nie dôkaz', odhad: 'odhad' };

export function ZdrojeIds({ ids }: { ids: string[] }) {
  const z = ids.map((i) => ZDROJ.get(i)).filter((x): x is NonNullable<typeof x> => !!x);
  if (!z.length) return null;
  return <details><summary style="min-height:44px;display:flex;align-items:center">Zdroje ({z.length})</summary>{z.map((x) => <ZdrojKarta key={x.id} z={x} />)}</details>;
}

export function RiadokZlozky({ z, deti }: { z: Zlozka; deti: boolean }) {
  const s = stupenPreDomacnost(z, deti);
  const h = z.hodnotenie;
  const zakladna = z.typ === 'zlozka' && z.id === 'bezna';
  const cls = s ? `sk-${s}` : 'sk-neznama';
  const stitok = zakladna ? 'Bežná surovina' : s ? STUPEN_TEXT[s] : z.podozrivy ? 'Skontroluj' : 'Nerozpoznané';
  return (
    <div class="sk-zl">
      <span class={`sk-st ${cls}`} aria-hidden="true">{s ? STUPEN_IKONA[s] : '○○○○'}</span>
      <details>
        <summary>
          <span>{z.e ? `${z.e} · ` : ''}{z.nazov}{z.percento !== undefined ? ` ${z.percento} %` : ''}</span>
          <small>{stitok}{z.funkcia && z.typ === 'aditivum' ? ` · ${z.funkcia}` : ''}{z.fuzzy ? ' · nepresná zhoda' : ''}</small>
        </summary>
        <div class="sk-pl">
          {z.povodny !== z.nazov && <p class="maly">V zložení: „{z.povodny}“{z.rodic ? ` (v časti: ${z.rodic})` : ''}</p>}
          {h ? (
            <>
              <p><b>{STUPEN_TEXT[s ?? h.stupen]}</b>{s !== h.stupen ? ` (pre domácnosť s deťmi; inak ${STUPEN_TEXT[h.stupen].toLowerCase()})` : ''}. {h.dovod}</p>
              <span class="tag">{UROVEN_TEXT[h.uroven]}</span>
              {h.preventivne && <span class="tag war">preventívna obava, nie preukázaná škoda</span>}
              {h.predvolene && <span class="tag">predvolené hodnotenie podľa funkcie</span>}
              <ZdrojeIds ids={h.zdroje} />
            </>
          ) : z.typ === 'neznama' ? (
            <p>{z.podozrivy ? 'Toto vyzerá ako chyba rozpoznania textu – oprav ho v poli so zložením.' : 'Zložku nemáme v databáze – pravdepodobne ide o bežnú surovinu (potravinu). Nehodnotíme ju.'}</p>
          ) : <p>Bežná surovina, ktorú nehodnotíme.</p>}
        </div>
      </details>
    </div>
  );
}

export function Vysledok({ r, s, deti, nazov = '', naOpravu }: { r: Rozbor; s: SkoreVyrobku; deti: boolean; nazov?: string; naOpravu?: () => void }) {
  const alt = domaceAlternativy(nazov, r, INFOS);
  return (
    <div>
      <div class="karta" style="animation:none">
        <div class="riadok">
          <Pecat skore={s.celkom} pasmo={s.pasmo} />
          <div class="rozt">
            <h2 style="margin:0">{PASMO_TEXT[s.pasmo]}{s.nizkaSpolahlivost ? ' (orientačne)' : ''}</h2>
            <div class="maly">{r.pocetZloziek} zložiek · {r.zlozky.filter((z) => z.typ === 'aditivum').length} prídavných látok</div>
          </div>
        </div>
        <p class="sk-pozn" style="margin-top:10px">{POZNAMKA_SKORE_V}</p>
      </div>

      {s.nizkaSpolahlivost && (
        <div class="sk-varovanie" role="alert">
          <b>{s.spolahlivostText}.</b> {r.spolahlivost.dovod} Skóre je len orientačné a nikdy nie „Výborné“ ani „Dobré“.
          {r.spolahlivost.zoznam.length > 0 && <> Nerozpoznané: {r.spolahlivost.zoznam.slice(0, 6).join('; ')}{r.spolahlivost.zoznam.length > 6 ? '…' : ''}.</>}
          {naOpravu && <div class="rad"><button class="male" onClick={naOpravu}>✏️ Opraviť zloženie</button></div>}
        </div>
      )}
      {s.osobne.map((o) => <div key={o.text} class="sk-varovanie" role="alert">{o.text}</div>)}
      {r.alergeny.length > 0 && <div class="upoz"><b>Alergény v zložení:</b> {r.alergeny.map((a) => ALERGEN_NAZOV[a]).join(', ')}.</div>}
      {r.stopy.length > 0 && <div class="upoz"><b>Môže obsahovať stopy:</b> {r.stopy.map((a) => ALERGEN_NAZOV[a]).join(', ')}.</div>}

      {(s.pozitiva.length > 0 || s.negativa.length > 0) && (
        <div class="karta" style="animation:none">
          {s.pozitiva.length > 0 && <><h3>Prínosy</h3><ul>{s.pozitiva.map((p) => <li key={p} class="plus">✓ <span style="color:var(--text)">{p}</span></li>)}</ul></>}
          {s.negativa.length > 0 && <><h3>Slabé stránky</h3><ul>{s.negativa.map((p) => <li key={p} class="minus">✗ <span style="color:var(--text)">{p}</span></li>)}</ul></>}
        </div>
      )}

      <h2>Ako sme to spočítali</h2>
      {s.faktory.map((f) => (
        <details class="faktor" key={f.id}>
          <summary><span>{f.nazov}</span><span class={f.body >= 70 ? 'plus' : f.body < 40 ? 'minus' : ''}>{f.body}/100 · váha {f.vaha}</span></summary>
          <div class="lista" role="img" aria-label={`${f.body} zo 100`}><i style={`width:${f.body}%;color:${f.body >= 70 ? 'var(--dobre)' : f.body >= 40 ? 'var(--obcas)' : 'var(--zle)'}`}></i></div>
          <p class="maly" style="margin-top:6px"><b>{f.hodnota}</b></p>
          <p class="maly">{f.preco}</p>
          <ZdrojeIds ids={f.zdroje} />
        </details>
      ))}

      <h2>Lepšia voľba</h2>
      <div class="karta" style="animation:none">
        <h3>Podľa čoho vybrať</h3>
        <ul>{tipyNaVyber(r, s).map((t) => <li key={t}>{t}</li>)}</ul>
        <p class="sk-pozn">Naše pravidlá (odhad), nie výsledok štúdie.</p>
        {alt && (
          <>
            <h3>Domáca alternatíva ({alt.druh.nazov})</h3>
            {alt.recepty.map((i) => <a key={i.r.id} class="karta" style="animation:none" href={`#/recept/${i.r.id}`}><div class="riadok"><div class="emoji" aria-hidden="true">{i.r.ilustracia}</div><div class="rozt"><b>{i.r.nazov}</b><div class="maly">{i.cas} min · skóre {i.skore.celkom}</div></div></div></a>)}
          </>
        )}
      </div>

      <h2>Zložky ({r.zlozky.length})</h2>
      <p class="maly">Ťukni na zložku: čo to je, prečo ju tak hodnotíme a zdroj.</p>
      <div class="karta" style="animation:none">
        {r.zlozky.map((z, i) => <RiadokZlozky key={i} z={z} deti={deti} />)}
        {!r.zlozky.length && <p>Nenašli sme žiadne zložky. Skontroluj text.</p>}
      </div>
    </div>
  );
}
