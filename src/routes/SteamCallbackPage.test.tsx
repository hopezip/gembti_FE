import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 세션 복원 경계(refresh 쿠키 + me)를 모킹해 콜백 3분기를 결정적으로 검증한다(MSW 미설정 단위환경).
const refreshAccessToken = vi.fn();
const getMe = vi.fn();
const toastCreate = vi.fn();

vi.mock('@/lib/ky', () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessToken(...args),
  api: {},
}));
vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return { ...actual, getMe: (...args: unknown[]) => getMe(...args) };
});
vi.mock('@/components/ui/Toast', () => ({
  toaster: { create: (...args: unknown[]) => toastCreate(...args) },
}));

import { useAuthStore } from '@/lib/store/useAuthStore';
import { SteamCallbackPage } from './SteamCallbackPage';

function renderAt(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/steam/callback${search}`]}>
      <Routes>
        <Route path="/steam/callback" element={<SteamCallbackPage />} />
        <Route path="/signup" element={<div>SIGNUP</div>} />
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/login" element={<div>LOGIN</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

const MOCK_USER = {
  id: 7,
  email: 'steam@example.com',
  nickname: 'SteamUser',
  hasCompletedSurvey: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clearAuth();
});

describe('SteamCallbackPage', () => {
  it('result=success → 쿠키 refresh + me로 세션을 복원하고 홈으로 이동한다', async () => {
    refreshAccessToken.mockResolvedValue('mock-access-token');
    getMe.mockResolvedValue(MOCK_USER);

    renderAt('?result=success&is_new_user=false&steam_linked=true');

    expect(await screen.findByText('HOME')).toBeInTheDocument();
    expect(getMe).toHaveBeenCalledWith('mock-access-token');
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.nickname).toBe('SteamUser');
  });

  it('result=signup_required → Steam 가입 미지원 안내 후 회원가입으로 이동한다', async () => {
    renderAt('?result=signup_required&signup_token=abc123');

    expect(await screen.findByText('SIGNUP')).toBeInTheDocument();
    expect(toastCreate).toHaveBeenCalled();
    // 세션 복원 경로는 타지 않는다.
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it('result=failed → 사유 토스트 후 로그인으로 이동한다', async () => {
    renderAt('?result=failed&reason=steam_auth_failed');

    expect(await screen.findByText('LOGIN')).toBeInTheDocument();
    expect(toastCreate).toHaveBeenCalled();
  });

  it('result=success인데 refresh 실패 → 토스트 후 로그인으로 이동한다', async () => {
    refreshAccessToken.mockResolvedValue(null);

    renderAt('?result=success');

    expect(await screen.findByText('LOGIN')).toBeInTheDocument();
    expect(getMe).not.toHaveBeenCalled();
    expect(toastCreate).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('anonymous');
  });
});
