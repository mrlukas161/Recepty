import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

const sha = process.env.GIT_SHA || (() => { try { return execSync('git rev-parse HEAD').toString().trim(); } catch { return 'dev'; } })();

export default defineConfig({
  base: '/Recepty/',
  define: { __SHA__: JSON.stringify(sha), __CAS__: JSON.stringify(new Date().toISOString()) },
  plugins: [
    preact(),
    {
      name: 'version-json',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ sha, cas: new Date().toISOString() }) });
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { skipWaiting: true, clientsClaim: true, cleanupOutdatedCaches: true, globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'], navigateFallback: '/Recepty/index.html', globIgnores: ['version.json', 'ocr/**', 'off/**', 'foto/**'], runtimeCaching: [{ urlPattern: ({ url }) => url.pathname.endsWith('/foto/zoznam.json'), handler: 'NetworkFirst', options: { cacheName: 'foto-zoznam', networkTimeoutSeconds: 3 } }, { urlPattern: ({ url }) => url.pathname.includes('/foto/'), handler: 'StaleWhileRevalidate', options: { cacheName: 'foto-jedal', expiration: { maxEntries: 400 } } }, { urlPattern: ({ url }) => url.pathname.includes('/off/'), handler: 'StaleWhileRevalidate', options: { cacheName: 'skener-off-balik', expiration: { maxEntries: 400 } } }, { urlPattern: ({ url }) => url.pathname.includes('/ocr/'), handler: 'CacheFirst', options: { cacheName: 'skener-ocr', expiration: { maxEntries: 12 } } }] },
      manifest: {
        name: 'Recepty', short_name: 'Recepty', lang: 'sk', description: 'Čo variť, keď chceme menej múky, cukru a údenín.',
        start_url: '/Recepty/', scope: '/Recepty/', display: 'standalone', display_override: ['fullscreen', 'standalone'],
        background_color: '#f5f7f4', theme_color: '#c8472b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { include: ['tests/**/*.test.ts'] },
});
