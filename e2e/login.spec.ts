import { expect, test } from '@playwright/test';

// LOGIN-FE-001 이메일 로그인 E2E.
// 전제: webServer(pnpm dev)가 VITE_USE_MOCK=true로 기동되어 MSW(src/mocks/handlers/auth.ts)가
//   POST /api/auth/login을 가로챈다. mock 정상 자격증명은 test@gambti.com / password123.
// 로컬에서 Playwright 브라우저 바이너리가 없으면 실행되지 않을 수 있다(프로젝트 정책상 미설치).

const VALID_EMAIL = 'test@gambti.com';
const VALID_PASSWORD = 'password123';

test.describe('이메일 로그인 (/login)', () => {
  test('진입 시 빈 로그인 폼이 보인다', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: '이메일로 로그인' }),
    ).toBeVisible();
    await expect(page.getByLabel(/이메일/)).toBeVisible();
    await expect(page.getByLabel(/비밀번호/)).toBeVisible();
  });

  test('검증 실패 시 필드 에러가 뜨고 API는 호출되지 않는다', async ({
    page,
  }) => {
    let loginCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/auth/login')) loginCalled = true;
    });

    await page.goto('/login');
    // 빈 폼 제출 → Zod 검증 실패
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page.getByText('이메일을 입력해주세요')).toBeVisible();
    await expect(page.getByText('비밀번호를 입력해주세요')).toBeVisible();
    expect(loginCalled).toBe(false);

    // 잘못된 이메일 형식
    await page.getByLabel(/이메일/).fill('not-an-email');
    await page.getByLabel(/비밀번호/).fill('something');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page.getByText('올바른 이메일 형식이 아닙니다')).toBeVisible();
    expect(loginCalled).toBe(false);
  });

  test('401 응답 시 폼 레벨 에러가 뜨고 이메일은 유지된다', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel(/이메일/).fill('wrong@gambti.com');
    await page.getByLabel(/비밀번호/).fill('wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(
      '이메일 또는 비밀번호가 올바르지 않습니다',
    );
    // 이메일 입력값 유지
    await expect(page.getByLabel(/이메일/)).toHaveValue('wrong@gambti.com');
  });

  test('성공 시 redirect 경로(보존)로 이동한다', async ({ page }) => {
    await page.goto('/login?redirect=/search');
    await page.getByLabel(/이메일/).fill(VALID_EMAIL);
    await page.getByLabel(/비밀번호/).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: '로그인' }).click();

    // /search PlaceholderPage로 이동
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole('heading', { name: '검색' })).toBeVisible();
  });

  test('성공 시 redirect가 없으면 홈(/)으로 이동한다', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/이메일/).fill(VALID_EMAIL);
    await page.getByLabel(/비밀번호/).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByRole('heading', { name: '메인' })).toBeVisible();
  });

  test('외부 redirect(//evil.com)는 무시하고 홈으로 이동한다', async ({
    page,
  }) => {
    await page.goto('/login?redirect=//evil.com');
    await page.getByLabel(/이메일/).fill(VALID_EMAIL);
    await page.getByLabel(/비밀번호/).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page).toHaveURL('http://localhost:5173/');
  });
});
