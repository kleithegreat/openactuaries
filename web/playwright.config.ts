import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    cwd: '.',
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
});
