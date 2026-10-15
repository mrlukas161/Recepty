import { zdrojePre, OVERENIE_TEXT, ZDROJE } from '../data/zdroje';
import type { Zdroj } from '../data/types';

export function ZdrojKarta({ z }: { z: Zdroj }) {
  return (
    <div class="karta" style="animation:none">
      <div class="maly">{z.citacia}</div>
      <p style="margin:4px 0">{z.tvrdenie}{z.cisla ? ` (${z.cisla})` : ''}</p>
      <span class="tag">dôkazy: {z.uroven}</span><span class="tag war">{OVERENIE_TEXT[z.overenie]}</span><span class="tag">overené {z.overene}</span>
      <div class="maly"><a href={z.url} target="_blank" rel="noopener noreferrer">{z.doi ? `DOI ${z.doi}` : z.url}</a></div>
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
