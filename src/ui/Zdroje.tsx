import { zdrojePre, OVERENIE_TEXT, ZDROJE } from '../data/zdroje';
import type { Zdroj, Surovina } from '../data/types';
import { SUROVINA } from '../data';

export function ZdrojKarta({ z }: { z: Zdroj }) {
  return (
    <div class="karta" style="animation:none">
      <div class="maly">{z.citacia}</div>
      <p style="margin:4px 0">{z.tvrdenie}{z.cisla ? ` (${z.cisla})` : ''}</p>
      <span class="tag">dôkazy: {z.uroven}</span><span class="tag war">{OVERENIE_TEXT[z.overenie]}</span><span class="tag">overené {z.overene}</span>
      <div class="maly zdroj"><a href={z.url} target="_blank" rel="noopener noreferrer">{z.doi ? `DOI ${z.doi}` : z.url}</a></div>
    </div>
  );
}

export function ZdrojeK({ kind, id, nadpis = 'Zdroje' }: { kind: 'faktory' | 'karty' | 'diety'; id: string; nadpis?: string }) {
  const z = zdrojePre(kind, id);
  if (!z.length) return <p class="maly">Zdroj: zatiaľ nepotvrdený – ide o odhad alebo prax.</p>;
  return <details><summary style="min-height:44px;display:flex;align-items:center;font-weight:700">{nadpis} ({z.length})</summary>{z.map((x) => <ZdrojKarta key={x.id} z={x} />)}</details>;
}

export function VsetkyZdroje() {
  return <>{ZDROJE.map((z) => <ZdrojKarta key={z.id} z={z} />)}{!ZDROJE.length && <p>Zatiaľ žiadne potvrdené zdroje.</p>}</>;
}

export function ZdrojeTabuliek() {
  return (
    <>
      <div class="karta" style="animation:none">
        <div class="maly">U.S. Department of Agriculture, Agricultural Research Service. FoodData Central (SR Legacy 2018-04, Foundation Foods 2025-12-18).</div>
        <p style="margin:4px 0">Zdroj výživových hodnôt surovín označených „USDA“. Sacharidy sme upravili na etiketový tvar (bez vlákniny), soľ je prepočet zo sodíka (× 2,5).</p>
        <span class="tag">licencia: CC0 1.0</span>
        <div class="maly zdroj"><a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">fdc.nal.usda.gov</a></div>
      </div>
      <div class="karta" style="animation:none">
        <div class="maly">Anses. 2025. Table de composition nutritionnelle des aliments Ciqual 2025. doi:10.57745/RDMHWY.</div>
        <p style="margin:4px 0">Zdroj výživových hodnôt surovín označených „Ciqual“. Hodnoty „traces“ a „&lt; x“ sú v appke približné.</p>
        <span class="tag">licencia: Licence Ouverte 2.0 (Etalab)</span>
        <div class="maly zdroj"><a href="https://ciqual.anses.fr/" target="_blank" rel="noopener noreferrer">ciqual.anses.fr</a></div>
      </div>
    </>
  );
}

/** Odkiaľ sú výživové hodnoty jednotlivých surovín receptu. */
export function ZdrojVyzivy({ ids }: { ids: string[] }) {
  const sv = Array.from(new Set(ids)).map((i) => SUROVINA.get(i)).filter((s): s is Surovina => !!s);
  const znamy = (s: Surovina) => s.zdrojNutr.startsWith('ciqual:') ? 'Ciqual 2025 ' + s.zdrojNutr.slice(7) : s.zdrojNutr.startsWith('fdc:') ? 'USDA FDC ' + s.zdrojNutr.slice(4) : '';
  const t = sv.filter((s) => !s.odhad).length;
  return (
    <details>
      <summary style="min-height:44px;display:flex;align-items:center;font-weight:700">Zdroj výživových hodnôt ({t} z {sv.length} z tabuliek)</summary>
      <ul class="maly">
        {sv.map((s) => <li key={s.id}>{s.nazov}: {s.odhad ? 'odhad (typická hodnota)' : znamy(s) + (s.priblizne ? ' – približné (traces / „< x“ / doplnené)' : '')}{s.poznamkaNutr ? ` – ${s.poznamkaNutr}` : ''}</li>)}
      </ul>
      <p class="maly">USDA FoodData Central (CC0) a Ciqual 2025 (Anses, Licence Ouverte 2.0); pozri zoznam zdrojov vo Vedomostiach.</p>
    </details>
  );
}
