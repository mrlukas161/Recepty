import type { Zdroj } from './types';

const mods = import.meta.glob('./zdroje/*.json', { eager: true, import: 'default' }) as Record<string, Zdroj[]>;
export const ZDROJE: Zdroj[] = Object.values(mods).flat().filter((z) => z && z.id);
export const ZDROJ = new Map(ZDROJE.map((z) => [z.id, z]));
export const zdrojePre = (kind: 'faktory' | 'karty' | 'diety', id: string) => ZDROJE.filter((z) => z[kind]?.includes(id));
export const OVERENIE_TEXT = { original: 'originál prečítaný', vyhladavanie: 'overené vyhľadávaním, originál nečítaný' } as const;
