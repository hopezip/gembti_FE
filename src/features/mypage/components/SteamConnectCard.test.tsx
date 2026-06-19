import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STEAM_AUTH_START_URL } from '@/config/steam';
import { STEAM_AUTH_INTENT_STORAGE_KEY } from '@/features/onboarding/lib/steamAuthIntent';
import type { MockUserProfile } from '@/mocks/handlers/mypage';
import { SteamConnectCard } from './SteamConnectCard';

function renderCard(
  profile: MockUserProfile,
  state?: { steamLinkStatus: string },
) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/mypage', state }]}>
      <SteamConnectCard profile={profile} />
    </MemoryRouter>,
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

beforeEach(() => {
  assign.mockClear();
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
});
