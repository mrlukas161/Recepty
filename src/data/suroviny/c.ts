import type { Surovina } from '../types';

/** Doplnené suroviny z bežných obchodov (škroby a psyllium). Výživové hodnoty prekrýva tabuľka (vyziva-tabulky.json); psyllium v tabuľkách nie je → odhad. */
function s(
  id: string, nazov: string, skupina: Surovina['skupina'], oddelenie: Surovina['oddelenie'], jednotky: Surovina['jednotky'],
  v: [number, number, number, number, number, number, number, number],
  gi: Surovina['gi'], nova: Surovina['nova'], zapal: Surovina['zapal'], priznaky: Surovina['priznaky'], poznamkaDeti?: string,
): Surovina {
  const [kcal, bielk, tuky, nasyt, sach, cukry, vlak, sol] = v;
  return {
    id, nazov, skupina, oddelenie, jednotky, na100: { kcal, bielk, tuky, nasyt, sach, cukry, vlak, sol },
    zdrojNutr: 'typická hodnota (odhad)', odhad: true, gi, nova, zapal, priznaky, alergeny: [], ...(poznamkaDeti ? { poznamkaDeti } : {}),
  };
}

export const SUROVINY_C: Surovina[] = [
  s('tapioka-skrob', 'Tapioka (škrob z manioku)', 'muky-obilniny', 'obilniny-muky', { lyzica: 10 }, [358, 0.2, 0, 0, 87.8, 3.4, 0.9, 0], 'vysoky', 3, 1, ['rafinovana-muka', 'rastlinne']),
  s('zemiakovy-skrob', 'Zemiakový škrob', 'muky-obilniny', 'obilniny-muky', { lyzica: 10 }, [348, 0, 0.2, 0, 86.3, 0, 0.6, 0], 'vysoky', 3, 1, ['rafinovana-muka', 'rastlinne']),
  s('kukuricny-skrob', 'Kukuričný škrob (maizena)', 'muky-obilniny', 'obilniny-muky', { lyzica: 8 }, [365, 0.3, 0.1, 0, 90.4, 0, 0.9, 0], 'vysoky', 3, 1, ['rafinovana-muka', 'rastlinne']),
  s('psyllium', 'Psyllium (šupky skorocelu)', 'orechy-semienka', 'trvanlive', { lyzicka: 3, lyzica: 8 }, [200, 2, 0.6, 0, 3, 0, 80, 0.05], 'nizky', 2, -1, ['semienka', 'rastlinne'], 'Deťom len s lekárom; vždy zapiť dostatkom tekutín.'),
];
