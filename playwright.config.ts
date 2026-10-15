import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e', timeout: 60000, retries: 0,
  use: { baseURL: 'http://localhost:4173/Recepty/', viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow', launchOptions: { executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium' } },
  webServer: { command: 'npm run build && npx vite preview --port 4173', url: 'http://localhost:4173/Recepty/', reuseExistingServer: true, timeout: 120000 },
});
