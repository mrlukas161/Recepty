import { defineConfig } from '@playwright/test';
const port = Number(process.env.PW_PORT ?? 4173);
export default defineConfig({
  testDir: 'e2e', timeout: 60000, retries: 0,
  use: { baseURL: `http://localhost:${port}/Recepty/`, viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow', launchOptions: { executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium' } },
  webServer: { command: `npm run build && npx vite preview --port ${port}`, url: `http://localhost:${port}/Recepty/`, reuseExistingServer: true, timeout: 120000 },
});
