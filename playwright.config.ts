import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 설정.
 *
 * vitest(단위 테스트)와 격리한다:
 * - `testDir`를 `./e2e`로 한정하고, `testMatch`로 `e2e/**` 의 `.spec.ts`만 수집한다.
 * - 반대로 vitest는 `vitest.config.ts`에서 `e2e/`를 수집하지 않도록 별도 처리한다.
 *
 * `webServer`로 vite 개발 서버를 자동 기동하고, baseURL을 그 주소로 맞춘다.
 * 데스크탑 전용 서비스이므로 데스크탑 Chromium 1종만 둔다.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // 앱(vite dev 서버)을 자동 기동한다. 이미 떠 있으면 재사용한다.
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // E2E는 항상 MSW mock으로 띄운다(로컬/CI 무관). VITE_USE_MOCK은 .env.local(gitignore)에만
    // 있어 CI의 pnpm dev에는 주입되지 않으므로, webServer.env로 강제해 MSW worker가 항상 뜨게 한다.
    env: { VITE_USE_MOCK: 'true' },
  },
});
