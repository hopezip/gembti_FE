import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type InitialEntry,
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 서비스(가입 완료)를 모킹해 화면 흐름(세션 세움/만료/직접접근)을 결정적으로 검증한다.
const completeSteamSignup = vi.fn();
const toastCreate = vi.fn();

vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return {
    ...actual,
    completeSteamSignup: (...args: unknown[]) => completeSteamSignup(...args),
  };
});
vi.mock('@/components/ui/Toast', () => ({
  toaster: { create: (...args: unknown[]) => toastCreate(...args) },
}));

import { useAuthStore } from '@/lib/store/useAuthStore';
import { SteamSignupError } from '@/services/auth';
import { SteamCompleteSignupPage } from './SteamCompleteSignupPage';

function renderAt(entry: InitialEntry) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route
            path="/steam/complete-signup"
            element={<SteamCompleteSignupPage />}
          />
          <Route path="/" element={<div>HOME</div>} />
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const WITH_TOKEN: InitialEntry = {
  pathname: '/steam/complete-signup',
  state: { signupToken: 'mock_steam_signup_token' },
};

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/이메일/), 'steam@example.com');
  await user.type(screen.getByLabelText(/닉네임/), '겜BTI유저');
  const checkboxes = screen.getAllByRole('checkbox');
  for (const cb of checkboxes) await user.click(cb);
  await user.click(screen.getByRole('button', { name: /가입 완료/ }));
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clearAuth();
});

describe('SteamCompleteSignupPage', () => {
  it('가입 완료(201) → 세션을 세우고 홈으로 이동한다', async () => {
    completeSteamSignup.mockResolvedValue({
      accessToken: 'mock-access-token',
      user: {
        id: 7,
        email: 'steam@example.com',
        nickname: '겜BTI유저',
        hasCompletedSurvey: false,
      },
    });

    renderAt(WITH_TOKEN);
    await fillAndSubmit();

    expect(await screen.findByText('HOME')).toBeInTheDocument();
    expect(completeSteamSignup).toHaveBeenCalledWith(
      expect.objectContaining({
        signupToken: 'mock_steam_signup_token',
        email: 'steam@example.com',
        nickname: '겜BTI유저',
        termsAgreed: true,
        privacyAgreed: true,
      }),
    );
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('가입 세션 만료(invalid-signup-token) → 토스트 후 로그인으로 이동한다', async () => {
    completeSteamSignup.mockRejectedValue(
      new SteamSignupError(
        'invalid-signup-token',
        '가입 세션이 만료되었습니다.',
      ),
    );

    renderAt(WITH_TOKEN);
    await fillAndSubmit();

    expect(await screen.findByText('LOGIN')).toBeInTheDocument();
    expect(toastCreate).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('직접 접근(signup_token 없음) → 토스트 후 로그인으로 이동한다', async () => {
    renderAt('/steam/complete-signup');

    expect(await screen.findByText('LOGIN')).toBeInTheDocument();
    expect(toastCreate).toHaveBeenCalled();
  });
});
