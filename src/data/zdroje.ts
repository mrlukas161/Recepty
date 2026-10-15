import type { Zdroj } from './types';

const mods = import.meta.glob('./zdroje/*.json', { eager: true, import: 'default' }) as Record<string, Zdroj[]>;
/** Rovnaký zdroj sa môže objaviť vo viacerých témach – zlúči sa podľa id (zjednotenie faktorov, kariet a diét). */
function zluc(vsetky: Zdroj[]): Zdroj[] {
  const m = new Map<string, Zdroj>();
  for (const z of vsetky) {
    if (!z || !z.id) continue;
    const a = m.get(z.id);
    if (!a) { m.set(z.id, { ...z }); continue; }
    for (const k of ['faktory', 'karty', 'diety'] as const) a[k] = Array.from(new Set([...(a[k] ?? []), ...(z[k] ?? [])]));
  }
  return [...m.values()];
}
export const ZDROJE: Zdroj[] = zluc(Object.values(mods).flat());
export const ZDROJ = new Map(ZDROJE.map((z) => [z.id, z]));
export const zdrojePre = (kind: 'faktory' | 'karty' | 'diety', id: string) => ZDROJE.filter((z) => z[kind]?.includes(id));
export const OVERENIE_TEXT = { original: 'originál prečítaný', vyhladavanie: 'overené vyhľadávaním, originál nečítaný' } as const;
