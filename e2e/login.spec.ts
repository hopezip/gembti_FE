import { type Page, expect, test } from '@playwright/test';

// LOGIN-FE-001/005 이메일 로그인 E2E.
// 전제: webServer(pnpm dev)가 mock 모드로 기동되어 MSW(src/mocks/handlers/auth.ts)가
//   POST /api/v1/auth/login을 가로챈다(LOGIN-FE-005 계약: /api/v1/auth/*, {status,data} 래퍼, 토큰 바디).
//   mock 정상 자격증명은 test@gambti.com / password123.
// 로컬에서 Playwright 브라우저 바이너리가 없으면 실행되지 않을 수 있다(프로젝트 정책상 미설치).
//
// 셸 주의(GlobalShell): /login 페이지에도 글로벌 Header가 함께 렌더된다.
//   Header에는 "로그인" 텍스트 링크(role=link)와 "회원가입" 링크가 있으므로,
//   카드 헤딩·폼 조작 셀렉터는 AuthCard 영역(role=main)으로 한정해 strict mode 충돌을 피한다.
//   (LOGIN-FE-001b: Figma auth-modal 재구성 — 헤딩 "로그인"(main 한정), 제출 버튼 "로그인 →".)

const VALID_EMAIL = 'test@gambti.com';
const VALID_PASSWORD = 'password123';

// AuthCard(=<main>) 범위로 한정한 로컬 셀렉터 모음. 셸 Header/Footer 영향에서 격리한다.
function loginCard(page: Page) {
  const card = page.getByRole('main');
  return {
    card,
    // 카드 헤딩 "로그인"(main 한정). Header "로그인" 링크와 분리.
    heading: card.getByRole('heading', { name: '로그인' }),
    email: card.getByLabel(/이메일/),
    // 비밀번호 input — 👁 토글 버튼 aria-label "비밀번호 표시"와 겹치므로 input id로 한정.
    password: card.locator('#login-password'),
    // 폼 제출 버튼(role=button "로그인 →"). Header "로그인" 링크와 role/이름 모두 다르다.
    submit: card.getByRole('button', { name: '로그인 →' }),
    alert: card.getByRole('alert'),
    // 👁 비밀번호 표시/숨김 토글(aria-label 기준).
    toggle: card.getByRole('button', { name: /비밀번호 (표시|숨기기)/ }),
    // 회원가입 세그먼트 탭(카드 내 링크).
    signupTab: card.getByRole('link', { name: '회원가입' }),
  };
}

test.describe('이메일 로그인 (/login)', () => {
  test('진입 시 빈 로그인 폼이 보인다', async ({ page }) => {
    await page.goto('/login');
    const form = loginCard(page);
    await expect(form.heading).toBeVisible();
    await expect(form.email).toBeVisible();
    await expect(form.password).toBeVisible();
  });

  test('검증 실패 시 필드 에러가 뜨고 API는 호출되지 않는다', async ({
    page,
  }) => {
    let loginCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/auth/login')) loginCalled = true;
    });

    await page.goto('/login');
    const form = loginCard(page);
    // 빈 폼 제출 → Zod 검증 실패
    await form.submit.click();

    await expect(form.card.getByText('이메일을 입력해주세요')).toBeVisible();
    await expect(form.card.getByText('비밀번호를 입력해주세요')).toBeVisible();
    expect(loginCalled).toBe(false);

    // 잘못된 이메일 형식
    await form.email.fill('not-an-email');
    await form.password.fill('something');
    await form.submit.click();
    await expect(
      form.card.getByText('올바른 이메일 형식이 아닙니다'),
    ).toBeVisible();
    expect(loginCalled).toBe(false);
  });

  test('401 응답 시 폼 레벨 에러가 뜨고 이메일은 유지된다', async ({
    page,
  }) => {
    await page.goto('/login');
    const form = loginCard(page);
    await form.email.fill('wrong@gambti.com');
    await form.password.fill('wrongpassword');
    await form.submit.click();

    await expect(form.alert).toBeVisible();
    await expect(form.alert).toContainText(
      '이메일 또는 비밀번호가 올바르지 않습니다',
    );
    // 이메일 입력값 유지
    await expect(form.email).toHaveValue('wrong@gambti.com');
  });

  test('성공 시 redirect 경로(보존)로 이동한다', async ({ page }) => {
    await page.goto('/login?redirect=/search');
    const form = loginCard(page);
    await form.email.fill(VALID_EMAIL);
    await form.password.fill(VALID_PASSWORD);
    await form.submit.click();

    // /search SearchPage로 이동(검색 input placeholder로 확인)
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByPlaceholder('게임, 장르, 태그 검색')).toBeVisible();
  });

  test('성공 시 redirect가 없으면 홈(/)으로 이동한다', async ({ page }) => {
    await page.goto('/login');
    const form = loginCard(page);
    await form.email.fill(VALID_EMAIL);
    await form.password.fill(VALID_PASSWORD);
    await form.submit.click();

    await expect(page).toHaveURL('/');
    // '/'는 MainPage(MAIN-FE-001 Hero 배너)를 렌더한다(이전 PlaceholderPage "메인" 대체).
    await expect(
      page.getByRole('heading', { name: /인생 게임을 찾아보세요/ }),
    ).toBeVisible();
  });

  test('외부 redirect(//evil.com)는 무시하고 홈으로 이동한다', async ({
    page,
  }) => {
    await page.goto('/login?redirect=//evil.com');
    const form = loginCard(page);
    await form.email.fill(VALID_EMAIL);
    await form.password.fill(VALID_PASSWORD);
    await form.submit.click();

    await expect(page).toHaveURL('/');
  });

  test('👁 토글 클릭 시 비밀번호 입력 type이 password↔text로 바뀐다', async ({
    page,
  }) => {
    await page.goto('/login');
    const form = loginCard(page);
    await form.password.fill('secret123');

    // 초기: type=password, 토글 aria-pressed=false, aria-label="비밀번호 표시"
    await expect(form.password).toHaveAttribute('type', 'password');
    await expect(form.toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(form.toggle).toHaveAttribute('aria-label', '비밀번호 표시');

    // 토글 on → type=text, aria-pressed=true, aria-label="비밀번호 숨기기"
    await form.toggle.click();
    await expect(form.password).toHaveAttribute('type', 'text');
    await expect(form.toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(form.toggle).toHaveAttribute('aria-label', '비밀번호 숨기기');
    // 입력값은 유지된다
    await expect(form.password).toHaveValue('secret123');

    // 다시 토글 off → type=password 복귀
    await form.toggle.click();
    await expect(form.password).toHaveAttribute('type', 'password');
    await expect(form.toggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('회원가입 세그먼트 탭 클릭 시 /signup으로 이동한다', async ({
    page,
  }) => {
    await page.goto('/login');
    const form = loginCard(page);
    await form.signupTab.click();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
