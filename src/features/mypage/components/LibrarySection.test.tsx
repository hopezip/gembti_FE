import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// mypage api를 모킹해 "Steam 연동됨 + 게임 세부정보 비공개" 상태를 재현한다.
const { getMyLibraryMock, getMyProfileMock } = vi.hoisted(() => ({
  getMyLibraryMock: vi.fn(),
  getMyProfileMock: vi.fn(),
}));
vi.mock('@/features/mypage/api/mypage', () => ({
  getMyLibrary: getMyLibraryMock,
  getMyProfile: getMyProfileMock,
}));

import { LibrarySection } from './LibrarySection';

function renderSection() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LibrarySection />
    </QueryClientProvider>,
  );
}

describe('LibrarySection 비공개 안내 (MYPAGE-FE-020)', () => {
  it('게임 세부정보가 비공개면 Steam 공개 설정 버튼을 노출하고 새 탭으로 연다', async () => {
    getMyLibraryMock.mockResolvedValue([]);
    getMyProfileMock.mockResolvedValue({
      steamConnected: true,
      steamSyncStatus: 'private',
    });
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderSection();

    const btn = await screen.findByRole('button', {
      name: 'Steam 공개 설정 열기',
    });
    await userEvent.click(btn);

    expect(openSpy).toHaveBeenCalledWith(
      'https://steamcommunity.com/my/edit/settings',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('비공개 상태면 게임이 남아 있어도 그리드 대신 비공개 안내를 보여준다', async () => {
    getMyLibraryMock.mockResolvedValue([
      {
        id: 1,
        title: 'Left 4 Dead 2',
        genres: ['액션'],
        thumbnailUrl: null,
        playHours: 0,
        rating: null,
        lastPlayedAt: null,
      },
    ]);
    getMyProfileMock.mockResolvedValue({
      steamConnected: true,
      steamSyncStatus: 'private',
    });

    renderSection();

    expect(
      await screen.findByRole('button', { name: 'Steam 공개 설정 열기' }),
    ).toBeInTheDocument();
    // 잔여 게임이 있어도 비공개면 목록을 노출하지 않는다.
    expect(screen.queryByText('Left 4 Dead 2')).not.toBeInTheDocument();
  });

  it('연동 안 된 빈 라이브러리에는 Steam 공개 설정 버튼이 없다', async () => {
    getMyLibraryMock.mockResolvedValue([]);
    getMyProfileMock.mockResolvedValue({
      steamConnected: false,
      steamSyncStatus: 'idle',
    });

    renderSection();

    expect(
      await screen.findByText('라이브러리가 비어 있어요'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Steam 공개 설정 열기' }),
    ).toBeNull();
  });
});
