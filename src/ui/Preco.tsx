import { PRECO, UROVEN_PRECO_TEXT, type PrecoId } from '../data/preco';
import { ZDROJ } from '../data/zdroje';
import { ZdrojKarta } from './Zdroje';

/** Rozbaliteľný krátky popis „prečo to škodí“ – všade rovnaký (pri skene, recepte aj surovine). */
export function PrecoSkodi({ id, otvorene = false }: { id: PrecoId; otvorene?: boolean }) {
  const p = PRECO[id];
  if (!p) return null;
  const zdroje = p.zdroje.map((z) => ZDROJ.get(z)).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <details class="preco" data-preco={id} open={otvorene}>
      <summary style="min-height:44px;display:flex;align-items:center;font-weight:700">Prečo to škodí? · {p.nazov}</summary>
      <div class="preco-telo">
        <p><b>Čo to je a prečo to škodí.</b> {p.co}</p>
        <p><b>Koľko a ako často vadí.</b> {p.davka}</p>
        <p><b>Komu viac.</b> {p.komu}</p>
        <p><b>Čo namiesto toho.</b> {p.namiesto}</p>
        <p><b>Úroveň dôkazov.</b> <span class="tag">{UROVEN_PRECO_TEXT[p.dokaz.uroven]}</span> {p.dokaz.text}</p>
        {zdroje.length > 0 && (
          <details>
            <summary style="min-height:44px;display:flex;align-items:center">Zdroje ({zdroje.length})</summary>
            {zdroje.map((z) => <ZdrojKarta key={z.id} z={z} />)}
          </details>
        )}
        <p class="maly">Nie je to lekárska rada. Pri deťoch, tehotenstve a chorobách sa poraď s lekárom alebo nutričným terapeutom.</p>
      </div>
    </details>
  );
}

/** Viac popisov naraz (bez duplicít). */
export function PrecoZoznam({ ids }: { ids: PrecoId[] }) {
  const u = [...new Set(ids)];
  if (!u.length) return null;
  return <div class="preco-zoznam">{u.map((i) => <PrecoSkodi key={i} id={i} />)}</div>;
}
