import { type Page, expect, test } from '@playwright/test';

// LOGIN-FE-001 이메일 로그인 E2E.
// 전제: webServer(pnpm dev)가 VITE_USE_MOCK=true로 기동되어 MSW(src/mocks/handlers/auth.ts)가
//   POST /api/auth/login을 가로챈다. mock 정상 자격증명은 test@gambti.com / password123.
// 로컬에서 Playwright 브라우저 바이너리가 없으면 실행되지 않을 수 있다(프로젝트 정책상 미설치).
//
// 셸 주의(GlobalShell): /login 페이지에도 글로벌 Header가 함께 렌더된다.
//   Header에는 "로그인" 텍스트 링크(role=link)와 "회원가입" 링크가 있으므로,
//   폼 조작 셀렉터는 AuthCard 영역(role=main)으로 한정해 strict mode 충돌을 피한다.
//   (폼 제출 버튼은 role=button "로그인"이라 Header 링크와 role이 다르지만,
//    이메일/비밀번호 라벨·alert 등은 카드 범위로 묶어 안정화한다.)

const VALID_EMAIL = 'test@gambti.com';
const VALID_PASSWORD = 'password123';

// AuthCard(=<main>) 범위로 한정한 로컬 셀렉터 모음. 셸 Header/Footer 영향에서 격리한다.
function loginCard(page: Page) {
  const card = page.getByRole('main');
  return {
    card,
    heading: card.getByRole('heading', { name: '이메일로 로그인' }),
    email: card.getByLabel(/이메일/),
    password: card.getByLabel(/비밀번호/),
    // 폼 제출 버튼(role=button). 이름 정확 매칭으로 Header "로그인" 링크와 분리.
    submit: card.getByRole('button', { name: '로그인', exact: true }),
    alert: card.getByRole('alert'),
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
      if (req.url().includes('/api/auth/login')) loginCalled = true;
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

    // /search PlaceholderPage로 이동(셸 안에서 페이지 heading은 "검색" 하나뿐)
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole('heading', { name: '검색' })).toBeVisible();
  });

  test('성공 시 redirect가 없으면 홈(/)으로 이동한다', async ({ page }) => {
    await page.goto('/login');
    const form = loginCard(page);
    await form.email.fill(VALID_EMAIL);
    await form.password.fill(VALID_PASSWORD);
    await form.submit.click();

    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByRole('heading', { name: '메인' })).toBeVisible();
  });

  test('외부 redirect(//evil.com)는 무시하고 홈으로 이동한다', async ({
    page,
  }) => {
    await page.goto('/login?redirect=//evil.com');
    const form = loginCard(page);
    await form.email.fill(VALID_EMAIL);
    await form.password.fill(VALID_PASSWORD);
    await form.submit.click();

    await expect(page).toHaveURL('http://localhost:5173/');
  });
});
