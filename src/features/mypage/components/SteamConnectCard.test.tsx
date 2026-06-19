import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STEAM_AUTH_START_URL } from '@/config/steam';
import { STEAM_AUTH_INTENT_STORAGE_KEY } from '@/features/onboarding/lib/steamAuthIntent';
import type { MockUserProfile } from '@/mocks/handlers/mypage';
import { SteamConnectCard } from './SteamConnectCard';

const unlinkSteam = vi.fn<() => Promise<void>>();
const syncSteam = vi.fn<() => Promise<void>>();
vi.mock('@/features/mypage/api/mypage', () => ({
  unlinkSteam: () => unlinkSteam(),
  syncSteam: () => syncSteam(),
}));
vi.mock('@/components/ui/Toast', () => ({
  toaster: { create: vi.fn() },
}));

function renderCard(
  profile: MockUserProfile,
  state?: { steamLinkStatus: string },
) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/mypage', state }]}>
        <SteamConnectCard profile={profile} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const assign = vi.fn();
const originalLocation = window.location;

const unlinkedProfile: MockUserProfile = {
  id: 'user-1',
  nickname: '테스트유저',
  handle: 'test',
  avatarUrl: null,
  joinedAt: '2024.11',
  isPublic: true,
  loginProvider: 'email',
  steamConnected: false,
  steamId: null,
  steamNickname: null,
  steamSyncedAt: null,
  steamSyncStatus: null,
  email: 'test@example.com',
  birthdate: '2000-01-01',
  gender: '기타',
  bio: '',
  website: null,
  favoriteGenres: [],
  stats: {
    following: 0,
    followers: 0,
    totalPlayHours: 0,
    reviewCount: 0,
  },
  personality: [],
};

const connectedProfile: MockUserProfile = {
  ...unlinkedProfile,
  steamConnected: true,
  steamId: 'My_Steam_ID',
  steamNickname: 'My_Steam_ID',
  steamSyncedAt: '2025-05-28T10:30:00Z',
  steamSyncStatus: 'success',
};

beforeEach(() => {
  assign.mockClear();
  unlinkSteam.mockReset();
  unlinkSteam.mockResolvedValue(undefined);
  syncSteam.mockReset();
  syncSteam.mockResolvedValue(undefined);
  window.sessionStorage.clear();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, assign },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

describe('SteamConnectCard', () => {
  it('미연동 상태에서 Steam 인증으로 바로 이동하고 link intent를 저장한다', async () => {
    const user = userEvent.setup();
    renderCard(unlinkedProfile);

    await user.click(screen.getByRole('button', { name: 'Steam 연동하기' }));

    expect(assign).toHaveBeenCalledWith(STEAM_AUTH_START_URL);
    expect(
      JSON.parse(
        window.sessionStorage.getItem(STEAM_AUTH_INTENT_STORAGE_KEY) ?? '{}',
      ),
    ).toEqual({ type: 'link', returnTo: '/mypage' });
  });

  it('연동 실패 결과(navigate state)면 버튼 아래에 실패 안내를 표시한다', () => {
    renderCard(unlinkedProfile, { steamLinkStatus: 'failed' });

    expect(
      screen.getByText('Steam 인증에 실패했어요. 다시 시도해주세요.'),
    ).toBeInTheDocument();
  });

  it('이미 다른 계정에 연동됨 결과면 해당 안내를 표시한다', () => {
    renderCard(unlinkedProfile, { steamLinkStatus: 'already_linked' });

    expect(
      screen.getByText('이미 다른 계정에 연동된 Steam 계정이에요.'),
    ).toBeInTheDocument();
  });

  it('연동 결과가 없으면 안내 텍스트를 표시하지 않는다', () => {
    renderCard(unlinkedProfile);

    expect(
      screen.queryByText('Steam 인증에 실패했어요. 다시 시도해주세요.'),
    ).not.toBeInTheDocument();
  });

  it('미연동 상태에서는 연동 해제/재동기화 버튼이 보이지 않는다', () => {
    renderCard(unlinkedProfile);

    expect(
      screen.queryByRole('button', { name: '연동 해제' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '라이브러리 재동기화' }),
    ).not.toBeInTheDocument();
  });

  it('Steam 소셜로그인 계정에는 연동 해제 버튼이 없고 재동기화만 보인다', () => {
    renderCard({ ...connectedProfile, loginProvider: 'steam' });

    expect(
      screen.queryByRole('button', { name: '연동 해제' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '라이브러리 재동기화' }),
    ).toBeInTheDocument();
  });

  it('email 가입 + Steam 연동 계정에는 연동 해제 버튼이 보인다', () => {
    renderCard({ ...connectedProfile, loginProvider: 'email' });

    expect(
      screen.getByRole('button', { name: '연동 해제' }),
    ).toBeInTheDocument();
  });

  it('연동 상태에서 재동기화 버튼을 누르면 syncSteam을 호출한다', async () => {
    const user = userEvent.setup();
    renderCard(connectedProfile);

    await user.click(
      screen.getByRole('button', { name: '라이브러리 재동기화' }),
    );

    expect(syncSteam).toHaveBeenCalledTimes(1);
  });

  it('연동 상태에서 해제 버튼 클릭 → 확인 단계를 거쳐 unlinkSteam을 호출한다', async () => {
    const user = userEvent.setup();
    renderCard(connectedProfile);

    // 1단계: 해제 버튼 노출
    await user.click(screen.getByRole('button', { name: '연동 해제' }));

    // 2단계: 확인 안내 + 취소/해제 버튼 노출, 아직 호출 전
    expect(
      screen.getByText(
        'Steam 연동을 해제하면 연동된 라이브러리 정보가 사라집니다.',
      ),
    ).toBeInTheDocument();
    expect(unlinkSteam).not.toHaveBeenCalled();

    // 3단계: 확인하면 unlinkSteam 호출
    const confirmButtons = screen.getAllByRole('button', { name: '연동 해제' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(unlinkSteam).toHaveBeenCalledTimes(1);
  });

  it('확인 단계에서 취소하면 호출 없이 닫힌다', async () => {
    const user = userEvent.setup();
    renderCard(connectedProfile);

    await user.click(screen.getByRole('button', { name: '연동 해제' }));
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(
      screen.queryByText(
        'Steam 연동을 해제하면 연동된 라이브러리 정보가 사라집니다.',
      ),
    ).not.toBeInTheDocument();
    expect(unlinkSteam).not.toHaveBeenCalled();
  });
});
