import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STEAM_AUTH_START_URL } from '@/config/steam';
import { STEAM_AUTH_INTENT_STORAGE_KEY } from '@/features/onboarding/lib/steamAuthIntent';
import type { MockUserProfile } from '@/mocks/handlers/mypage';
import { SteamConnectCard } from './SteamConnectCard';

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
    render(<SteamConnectCard profile={unlinkedProfile} />);

    await user.click(screen.getByRole('button', { name: 'Steam 연동하기' }));

    expect(assign).toHaveBeenCalledWith(STEAM_AUTH_START_URL);
    expect(
      JSON.parse(
        window.sessionStorage.getItem(STEAM_AUTH_INTENT_STORAGE_KEY) ?? '{}',
      ),
    ).toEqual({ type: 'link', returnTo: '/mypage' });
  });
});
