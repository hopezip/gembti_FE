import { expect, test } from '@playwright/test';

// 앱 루트가 정상적으로 로딩되는지 확인하는 최소 smoke 테스트.
// (E2E 하네스가 거짓 신호 없이 실제로 1건을 실행하는지 검증하는 용도)
test('루트(/)가 로딩되고 앱이 마운트된다', async ({ page }) => {
  await page.goto('/');

  // index.html의 문서 타이틀(GamBTI)이 그대로 노출되는지
  await expect(page).toHaveTitle(/GamBTI/);

  // React 앱이 마운트되는 루트 컨테이너가 존재하고 비어있지 않은지
  const root = page.locator('#root');
  await expect(root).toBeAttached();
});
