/** Tlačidlo „Pridať do Open Food Facts“ / „Pridať do Open Beauty Facts“ – len odkaz do nového okna, appka nič neposiela. */
export function PridatDoDb({ href, nazov, id }: { href: string; nazov: 'Open Food Facts' | 'Open Beauty Facts'; id: string }) {
  return (
    <div class="upoz">
      <a id={id} class="tlacidlo" href={href} target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center">➕ Pridať do {nazov}</a>
      <p class="maly" style="margin:6px 0 0">Otvorí sa stránka {nazov} v novom okne (potrebuješ internet; môže si vypýtať prihlásenie). Appka sama nič neodosiela ani neposiela na server – údaje tam zadáš ty. Zloženie si môžeš uložiť aj sám v tomto mobile (tlačidlo „Zapamätať zloženie pod kód“).</p>
    </div>
  );
}
