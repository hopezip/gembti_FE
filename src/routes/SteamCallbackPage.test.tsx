import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 세션 복원 경계(refresh 쿠키 + me)를 모킹해 콜백 3분기를 결정적으로 검증한다(MSW 미설정 단위환경).
const refreshAccessToken = vi.fn();
const getMe = vi.fn();
const getMeRaw = vi.fn();
const toastCreate = vi.fn();
const linkSteam = vi.fn();

vi.mock('@/lib/ky', () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessToken(...args),
  api: {},
}));
vi.mock('@/lib/api/steam', () => ({
  linkSteam: (...args: unknown[]) => linkSteam(...args),
}));
vi.mock('@/services/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/auth')>();
  return {
    ...actual,
    getMe: (...args: unknown[]) => getMe(...args),
    getMeRaw: (...args: unknown[]) => getMeRaw(...args),
  };
});
vi.mock('@/components/ui/Toast', () => ({
  toaster: { create: (...args: unknown[]) => toastCreate(...args) },
}));

import { useAuthStore } from '@/lib/store/useAuthStore';
import { STEAM_AUTH_INTENT_STORAGE_KEY } from '@/features/onboarding/lib/steamAuthIntent';
import { SteamCallbackPage } from './SteamCallbackPage';

// 연동 intent 복귀 시 navigate state(steamLinkStatus)를 텍스트로 노출해 단언한다.
function MyPageProbe() {
  const location = useLocation();
  const status = (location.state as { steamLinkStatus?: string } | null)
    ?.steamLinkStatus;
  return <div>{status ? `MYPAGE ${status}` : 'MYPAGE'}</div>;
}

function renderAt(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/steam/callback${search}`]}>
      <Routes>
        <Route path="/steam/callback" element={<SteamCallbackPage />} />
        <Route path="/signup" element={<div>SIGNUP</div>} />
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/survey/intro" element={<div>SURVEY INTRO</div>} />
        <Route path="/login" element={<div>LOGIN</div>} />
        <Route path="/mypage" element={<MyPageProbe />} />
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
  window.sessionStorage.clear();
  useAuthStore.getState().clearAuth();
});

describe('SteamCallbackPage', () => {
  it('result=success(설문 미완료) → 세션을 복원하고 설문 인트로로 이동한다', async () => {
    refreshAccessToken.mockResolvedValue('mock-access-token');
    getMe.mockResolvedValue(MOCK_USER);

    renderAt('?result=success&is_new_user=false&steam_linked=true');

    expect(await screen.findByText('SURVEY INTRO')).toBeInTheDocument();
    expect(getMe).toHaveBeenCalledWith('mock-access-token');
    expect(linkSteam).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.nickname).toBe('SteamUser');
  });

  it('result=success(설문 완료) → 세션을 복원하고 홈으로 이동한다', async () => {
    refreshAccessToken.mockResolvedValue('mock-access-token');
    getMe.mockResolvedValue({ ...MOCK_USER, hasCompletedSurvey: true });

    renderAt('?result=success&is_new_user=false&steam_linked=true');

    expect(await screen.findByText('HOME')).toBeInTheDocument();
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('result=signup_required → Steam 가입 불가 안내 토스트 후 /signup으로 이동한다', async () => {
    // Steam 신규 가입은 미지원이다(LOGIN-FE-014). 가입 화면이 아니라 이메일 회원가입으로 돌린다.
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

  it('마이페이지 연동 intent + result=success → steam_id로 link 후 /mypage로 이동한다', async () => {
    refreshAccessToken.mockResolvedValue('mock-access-token');
    getMe.mockResolvedValue(MOCK_USER);
    linkSteam.mockResolvedValue({
      steam_linked: true,
      steam_id_64: '76561197960287930',
      steam_sync_status: 'success',
    });
    window.sessionStorage.setItem(
      STEAM_AUTH_INTENT_STORAGE_KEY,
      JSON.stringify({ type: 'link', returnTo: '/mypage' }),
    );

    renderAt('?result=success&steam_id=76561197960287930');

    expect(await screen.findByText('MYPAGE success')).toBeInTheDocument();
    expect(linkSteam).toHaveBeenCalledWith({
      steam_id: '76561197960287930',
    });
    expect(window.sessionStorage.getItem(STEAM_AUTH_INTENT_STORAGE_KEY)).toBe(
      null,
    );
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('마이페이지 연동 intent + 이미 다른 계정에 연동됨 → already_linked 결과로 /mypage 복귀', async () => {
    window.sessionStorage.setItem(
      STEAM_AUTH_INTENT_STORAGE_KEY,
      JSON.stringify({ type: 'link', returnTo: '/mypage' }),
    );

    renderAt('?result=failed&reason=steam_already_linked');

    expect(
      await screen.findByText('MYPAGE already_linked'),
    ).toBeInTheDocument();
    expect(toastCreate).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(STEAM_AUTH_INTENT_STORAGE_KEY)).toBe(
      null,
    );
  });

  it('link 호출이 실패해도 실제로는 연동돼 있으면 성공으로 처리한다(MYPAGE-FE-019)', async () => {
    // 백엔드가 OpenID success 단계에서 이미 링크해 POST /steam/link가 409를 던지는 상황.
    //   me.steam_linked=true면 라이브러리는 채워졌으므로 실패 토스트 없이 성공 처리한다.
    refreshAccessToken.mockResolvedValue('mock-access-token');
    getMe.mockResolvedValue(MOCK_USER);
    linkSteam.mockRejectedValue(new Error('409 conflict'));
    getMeRaw.mockResolvedValue({ steam_linked: true });
    window.sessionStorage.setItem(
      STEAM_AUTH_INTENT_STORAGE_KEY,
      JSON.stringify({ type: 'link', returnTo: '/mypage' }),
    );

    renderAt('?result=success&steam_id=76561197960287930');

    expect(await screen.findByText('MYPAGE success')).toBeInTheDocument();
    expect(getMeRaw).toHaveBeenCalled();
    // 연동 흐름은 토스트가 아니라 인라인 결과로만 알린다.
    expect(toastCreate).not.toHaveBeenCalled();
  });

  it('link 호출 실패 + 실제로도 미연동이면 실패 결과로 복귀한다(MYPAGE-FE-019)', async () => {
    refreshAccessToken.mockResolvedValue('mock-access-token');
    getMe.mockResolvedValue(MOCK_USER);
    linkSteam.mockRejectedValue(new Error('500'));
    getMeRaw.mockResolvedValue({ steam_linked: false });
    window.sessionStorage.setItem(
      STEAM_AUTH_INTENT_STORAGE_KEY,
      JSON.stringify({ type: 'link', returnTo: '/mypage' }),
    );

    renderAt('?result=success&steam_id=76561197960287930');

    expect(await screen.findByText('MYPAGE failed')).toBeInTheDocument();
    expect(toastCreate).not.toHaveBeenCalled();
  });

  it('마이페이지 연동 intent인데 steam_id가 없으면 link 없이 /mypage로 복귀한다', async () => {
    refreshAccessToken.mockResolvedValue('mock-access-token');
    getMe.mockResolvedValue(MOCK_USER);
    window.sessionStorage.setItem(
      STEAM_AUTH_INTENT_STORAGE_KEY,
      JSON.stringify({ type: 'link', returnTo: '/mypage' }),
    );

    renderAt('?result=success');

    expect(await screen.findByText('MYPAGE failed')).toBeInTheDocument();
    expect(linkSteam).not.toHaveBeenCalled();
    expect(toastCreate).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(STEAM_AUTH_INTENT_STORAGE_KEY)).toBe(
      null,
    );
  });
});
