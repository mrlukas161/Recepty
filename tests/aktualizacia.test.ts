import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { pripravAktualizacie } from '../src/aktualizacia';

describe('aktualizácie appky', () => {
  it('vite.config: autoUpdate a verzia v build-e', () => {
    const cfg = readFileSync('vite.config.ts', 'utf8');
    expect(cfg).toMatch(/registerType:\s*'autoUpdate'/);
    expect(cfg).toMatch(/skipWaiting:\s*true/);
    expect(cfg).toMatch(/clientsClaim:\s*true/);
    expect(cfg).toMatch(/cleanupOutdatedCaches:\s*true/);
    expect(cfg).toContain('version.json');
  });
  it('update() pri návrate z pozadia, nie pri skrytí; nie častejšie ako po 30 s', () => {
    let t = 1000;
    const update = vi.fn().mockResolvedValue(undefined);
    let handler = () => {};
    const doc = { visibilityState: 'hidden', addEventListener: (_: string, f: () => void) => { handler = f; } };
    pripravAktualizacie({ update }, doc, () => t, () => 0);
    handler(); expect(update).not.toHaveBeenCalled();
    doc.visibilityState = 'visible';
    t += 5000; handler(); expect(update).not.toHaveBeenCalled();
    t += 60000; handler(); expect(update).toHaveBeenCalledTimes(1);
    t += 1000; handler(); expect(update).toHaveBeenCalledTimes(1);
  });
  it('chyba update() (offline) neprepadne', async () => {
    const skus = pripravAktualizacie({ update: () => Promise.reject(new Error('offline')) }, { visibilityState: 'visible', addEventListener: () => {} }, () => 1e9, () => 0);
    expect(() => skus()).not.toThrow();
  });
});
