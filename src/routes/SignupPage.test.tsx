import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  RouterProvider,
  createMemoryRouter,
  useSearchParams,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { SignupPage } from './SignupPage';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicOnlyRoute } from './guards/PublicOnlyRoute';

// 서비스 레이어 모킹(MSW 미설정 단위환경) — send-code/verify/signup.
const sendEmailCode = vi.fn();
const verifyEmail = vi.fn();
const signup = vi.fn();

vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return {
    ...actual,
    sendEmailCode: (...a: unknown[]) => sendEmailCode(...a),
    verifyEmail: (...a: unknown[]) => verifyEmail(...a),
    signup: (...a: unknown[]) => signup(...a),
  };
});

// 온보딩 도착 + origin 보존 확인용 프로브.
function OnboardingProbe() {
  const [sp] = useSearchParams();
  return <div>ONBOARDING origin={sp.get('origin')}</div>;
}

// /signup(PublicOnly) + /onboarding/steam(Protected) + 홈/로그인 스텁으로 실제 가드를 건다.
function renderSignupFlow() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      {
        path: '/signup',
        element: (
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/onboarding/steam',
        element: (
          <ProtectedRoute>
            <OnboardingProbe />
          </ProtectedRoute>
        ),
      },
      { path: '/', element: <div>HOME</div> },
      { path: '/login', element: <div>LOGIN</div> },
    ],
    { initialEntries: ['/signup'] },
  );
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useAuthStore.getState().clearAuth();
  sendEmailCode.mockReset();
  verifyEmail.mockReset();
  signup.mockReset();
});

describe('SignupPage 진입 배선 (가입 완료 → 스팀 온보딩)', () => {
  it('가입 완료 시 PublicOnlyRoute race 없이 /onboarding/steam(steamSignup)로 간다', async () => {
    sendEmailCode.mockResolvedValue(undefined);
    verifyEmail.mockResolvedValue(undefined);
    signup.mockResolvedValue({
      user: {
        id: 1,
        email: 'new_user@example.com',
        nickname: '테스트유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'a',
    });
    const user = userEvent.setup();
    renderSignupFlow();

    // STEP1 — 계정정보(비번 10자+특수문자, 약관 2개 동의)
    await user.type(
      screen.getByPlaceholderText('name@example.com'),
      'new_user@example.com',
    );
    await user.type(
      screen.getByPlaceholderText('특수문자 포함 10자 이상'),
      'abcde1234!',
    );
    await user.type(
      screen.getByPlaceholderText('비밀번호 재입력'),
      'abcde1234!',
    );
    // 필수 약관 2개(이용약관 + 개인정보) 모두 체크.
    for (const checkbox of screen.getAllByRole('checkbox')) {
      await user.click(checkbox);
    }
    await user.click(screen.getByRole('button', { name: '인증 코드 받기 →' }));

    // STEP2 — 인증 + 프로필
    const otpFirst = await screen.findByLabelText('인증 코드 1번째 자리');
    await user.click(otpFirst);
    await user.keyboard('123456');
    await user.type(screen.getByLabelText(/닉네임/), '테스트유저');
    const birth = screen.getByLabelText(/생년월일/);
    await user.clear(birth);
    await user.type(birth, '2000-01-01');
    await user.click(screen.getByRole('button', { name: '가입 완료 →' }));

    // 홈(race 실패)이 아니라 온보딩에 도착해야 하고 origin이 보존돼야 한다.
    expect(await screen.findByText(/ONBOARDING/)).toBeInTheDocument();
    expect(screen.getByText(/origin=steamSignup/)).toBeInTheDocument();
    expect(screen.queryByText('HOME')).not.toBeInTheDocument();
    // 자동 로그인 세션이 섰는지.
    await waitFor(() =>
      expect(useAuthStore.getState().status).toBe('authenticated'),
    );
  });
});
