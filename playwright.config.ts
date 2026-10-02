import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.ts',
  forbidOnly: !!process.env['CI'],
  use: { baseURL: 'http://localhost:4200' },
  webServer: [
    // Never reuse whatever is on port 3000: the tests need the API with the fake portal behind it.
    { command: 'node e2e/api.mts', url: 'http://localhost:3000/health', reuseExistingServer: false },
    { command: 'npm start', url: 'http://localhost:4200', reuseExistingServer: !process.env['CI'], timeout: 180_000 },
  ],
});
