import { type Page, expect, test } from '@playwright/test';

// 앱 루트가 정상적으로 로딩되는지 확인하는 최소 smoke 테스트.
// (E2E 하네스가 거짓 신호 없이 실제로 1건을 실행하는지 검증하는 용도)

// ⚠️ auth(/api/v1/auth/*)는 실서버(gembti.cloud) passthrough라, stub하지 않으면 부팅 세션복원
//   (useSessionRestore의 refresh→me)이 실서버 응답에 묶여 ready가 지연된다(App이 그동안 null).
//   smoke의 취지는 실서버 속도가 아니라 "앱 마운트/라우팅"이므로, login.spec과 동일하게
//   서비스워커(MSW)를 끄고 auth를 anonymous(401)로 스텁해 결정적으로 만든다.
test.use({ serviceWorkers: 'block' });

async function stubAnonymousAuth(page: Page) {
  // 부팅 세션 복원: refresh/me 모두 401(세션 없음)로 즉시 응답 → 즉시 anonymous 복원(ready).
  //   glob은 cross-origin(gembti.cloud)을 못 잡으므로 정규식으로 origin 무관 매칭.
  await page.route(/\/api\/v1\/auth\/(refresh|me)(\?|$)/, (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'no session' }),
    }),
  );
}

test('루트(/)가 로딩되고 앱이 마운트된다', async ({ page }) => {
  await stubAnonymousAuth(page);
  await page.goto('/');

  // layout 문서 타이틀(GamBTI)이 그대로 노출되는지
  await expect(page).toHaveTitle(/GamBTI/);

  // React 앱이 실제로 마운트되어 메인 화면(게스트 홈 Hero)이 렌더되는지 확인한다.
  // (구현 디테일(#root 컨테이너) 대신 실제 렌더 UI로 마운트를 검증한다.)
  await expect(
    page.getByRole('heading', { name: /인생 게임을 찾아보세요/ }),
  ).toBeVisible();
});
