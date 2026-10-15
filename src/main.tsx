import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import './styles.css';
import { useStav } from './store';
import { Dnes } from './ui/Dnes';
import { Recepty } from './ui/Recepty';
import { Detail } from './ui/Detail';
import { Ruleta } from './ui/Ruleta';
import { Jedalnicek } from './ui/Jedalnicek';
import { Nakup } from './ui/Nakup';
import { Viac, Nahrady, Diety, Vedomosti, Nastavenia } from './ui/Viac';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

function useHash() {
  const [h, setH] = useState(location.hash || '#/');
  useEffect(() => { const f = () => { setH(location.hash || '#/'); document.querySelector('main')?.scrollTo(0, 0); }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return h;
}

const NAV = [['#/', '🏠', 'Dnes'], ['#/recepty', '📖', 'Recepty'], ['#/jedalnicek', '📅', 'Jedálniček'], ['#/nakup', '🛒', 'Nákup'], ['#/viac', '☰', 'Viac']] as const;

function App() {
  const s = useStav();
  const h = useHash();
  useEffect(() => {
    const t = s.nastavenia.tema;
    if (t === 'auto') document.documentElement.removeAttribute('data-tema'); else document.documentElement.setAttribute('data-tema', t);
  }, [s.nastavenia.tema]);
  const [, a, b] = h.split('/');
  let obsah;
  if (!s.nastavenia.hotovo) obsah = <Nastavenia uvod />;
  else if (a === 'recept' && b) obsah = <Detail id={b} />;
  else if (a === 'recepty') obsah = <Recepty />;
  else if (a === 'jedalnicek') obsah = <Jedalnicek />;
  else if (a === 'nakup') obsah = <Nakup />;
  else if (a === 'ruleta') obsah = <Ruleta />;
  else if (a === 'nahrady') obsah = <Nahrady />;
  else if (a === 'diety') obsah = <Diety id={b} />;
  else if (a === 'vedomosti') obsah = <Vedomosti />;
  else if (a === 'nastavenia') obsah = <Nastavenia />;
  else if (a === 'viac') obsah = <Viac />;
  else obsah = <Dnes />;
  const akt = a === '' || a === undefined ? '#/' : `#/${a === 'recept' ? 'recepty' : a}`;
  return (
    <>
      <main>{obsah}</main>
      <nav class="spodna" aria-label="Hlavná navigácia">
        {NAV.map(([href, ik, nz]) => <a href={href} key={href} aria-current={akt === href || (href === '#/viac' && ['#/nahrady', '#/diety', '#/vedomosti', '#/nastavenia', '#/ruleta'].includes(akt)) ? 'page' : undefined}><span class="ik" aria-hidden="true">{ik}</span>{nz}</a>)}
      </nav>
    </>
  );
}
render(<App />, document.getElementById('app')!);
