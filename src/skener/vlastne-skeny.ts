/** Vlastné skeny k čiarovému kódu: zloženie, ktoré používateľ odfotil alebo vpísal, uložené pod kódom.
 *  Samostatné úložisko (nezasahuje do limitu 300 výrobkov v ulozisko.ts); platí pre potraviny aj kozmetiku. Len localStorage. */
import type { Vyziva } from './typy';

export interface VlastnySken {
  kod: string;
  /** ISO čas uloženia */
  ulozene: string;
  nazov: string;
  znacka?: string;
  zlozenie: string;
  vyziva?: Vyziva;
}

export const LIMIT_VLASTNYCH = 500;
export const KLUC_VLASTNE_POTRAVINY = 'recepty-skener-vlastne-v1';
export const KLUC_VLASTNE_KOZMETIKA = 'recepty-kozmetika-vlastne-v1';

const cisla = (x: unknown): Vyziva | undefined => {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return undefined;
  const o: Record<string, number> = {};
  for (const [k, v] of Object.entries(x)) if (/^[a-z]{2,8}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 100000) o[k] = v;
  return Object.keys(o).length ? (o as Vyziva) : undefined;
};

/** Skontroluje cudzí záznam (z úložiska aj z prenosu). Neplatný → null. */
export function overVlastny(x: unknown): VlastnySken | null {
  const z = x as Partial<VlastnySken> | null;
  if (!z || typeof z !== 'object') return null;
  if (typeof z.kod !== 'string' || !/^\d{8,14}$/.test(z.kod)) return null;
  if (typeof z.zlozenie !== 'string' || !z.zlozenie.trim() || z.zlozenie.length > 5000) return null;
  const cas = typeof z.ulozene === 'string' && !Number.isNaN(Date.parse(z.ulozene)) ? z.ulozene : new Date(0).toISOString();
  return {
    kod: z.kod, ulozene: cas,
    nazov: typeof z.nazov === 'string' && z.nazov.trim() ? z.nazov.trim().slice(0, 200) : `Výrobok ${z.kod}`,
    znacka: typeof z.znacka === 'string' && z.znacka.trim() ? z.znacka.trim().slice(0, 100) : undefined,
    zlozenie: z.zlozenie.trim(),
    vyziva: cisla(z.vyziva),
  };
}

export interface UlozisteVlastnych {
  nacitaj(): VlastnySken[];
  najdi(kod: string): VlastnySken | null;
  uloz(v: Omit<VlastnySken, 'ulozene'>, cas?: Date): VlastnySken | null;
  zmaz(kod: string): void;
  /** Prepíše celý zoznam (prenos, záloha). */
  nahrad(v: VlastnySken[]): void;
}

export function vytvorUloziste(kluc: string, limit = LIMIT_VLASTNYCH): UlozisteVlastnych {
  const nacitaj = (): VlastnySken[] => {
    try {
      const x = JSON.parse(localStorage.getItem(kluc) ?? '[]');
      return Array.isArray(x) ? x.map(overVlastny).filter((v): v is VlastnySken => !!v) : [];
    } catch { return []; }
  };
  const zapis = (v: VlastnySken[]) => {
    let kus = v.slice(0, limit);
    for (;;) {
      try { localStorage.setItem(kluc, JSON.stringify(kus)); return; } catch { if (!kus.length) return; kus = kus.slice(0, Math.floor(kus.length / 2)); }
    }
  };
  return {
    nacitaj,
    najdi: (kod) => nacitaj().find((v) => v.kod === kod) ?? null,
    uloz(v, cas = new Date()) {
      const novy = overVlastny({ ...v, ulozene: cas.toISOString() });
      if (!novy) return null;
      zapis([novy, ...nacitaj().filter((x) => x.kod !== novy.kod)]);
      return novy;
    },
    zmaz: (kod) => zapis(nacitaj().filter((v) => v.kod !== kod)),
    nahrad: (v) => zapis(v.map(overVlastny).filter((x): x is VlastnySken => !!x)),
  };
}

export const vlastneSkenyPotravin = vytvorUloziste(KLUC_VLASTNE_POTRAVINY);
export const vlastneSkenyKozmetiky = vytvorUloziste(KLUC_VLASTNE_KOZMETIKA);

const dd = (iso?: string) => {
  const d = iso ? new Date(iso) : undefined;
  if (!d || Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};
/** „Vlastný sken (DD.MM.RRRR)“ */
export const oznacenieVlastneho = (iso?: string) => `Vlastný sken (${dd(iso)})`;

/** Zlúči dva zoznamy podľa kódu; pri rovnakom kóde vyhrá novší `ulozene`. Najnovšie prvé. */
export function zlucVlastne(a: VlastnySken[], b: VlastnySken[]): VlastnySken[] {
  const m = new Map<string, VlastnySken>();
  for (const v of [...a, ...b]) { const p = m.get(v.kod); if (!p || Date.parse(v.ulozene) >= Date.parse(p.ulozene)) m.set(v.kod, v); }
  return [...m.values()].sort((x, y) => Date.parse(y.ulozene) - Date.parse(x.ulozene));
}
