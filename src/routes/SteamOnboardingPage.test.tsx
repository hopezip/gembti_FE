import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SteamSyncResult } from '@/features/onboarding/types';
import { SteamOnboardingPage } from './SteamOnboardingPage';

// 서비스 레이어를 모킹한다(MSW 미설정 단위환경). 폴링/스킵을 결정적으로 제어한다.
const getSyncStatus = vi.fn();
const skipSteam = vi.fn();

vi.mock('@/services/steam', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/steam')>();
  return {
    ...actual,
    getSyncStatus: (...args: unknown[]) => getSyncStatus(...args),
    skipSteam: (...args: unknown[]) => skipSteam(...args),
  };
});

const SUCCESS: SteamSyncResult = {
  status: 'success',
  foundGames: 147,
  steamNickname: 'My_Steam_ID',
  errorMessage: null,
};
const PRIVATE: SteamSyncResult = {
  status: 'private',
  foundGames: null,
  steamNickname: null,
  errorMessage: '비공개',
};

function renderPage(initialEntry = '/onboarding/steam?origin=steamSignup') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/onboarding/steam" element={<SteamOnboardingPage />} />
          <Route path="/survey/intro" element={<div>SURVEY INTRO</div>} />
          <Route path="/" element={<div>HOME</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getSyncStatus.mockReset();
  skipSteam.mockReset();
});

describe('SteamOnboardingPage (통합 플로우)', () => {
  it('연동하기 → 폴링 성공 → 성공 화면을 보여준다', async () => {
    getSyncStatus.mockResolvedValue(SUCCESS);
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole('button', { name: 'Steam으로 연동하기' }),
    );

    expect(await screen.findByText('Steam 연동 완료')).toBeInTheDocument();
    expect(screen.getByText('147')).toBeInTheDocument();
  });

  it('비공개 결과에서 다시 시도하면 재폴링한다 (되돌이 회귀 가드)', async () => {
    getSyncStatus.mockResolvedValue(PRIVATE);
    const user = userEvent.setup();
    renderPage('/onboarding/steam?origin=steamSignup&scenario=PRIVATE');

    await user.click(
      screen.getByRole('button', { name: 'Steam으로 연동하기' }),
    );
    expect(
      await screen.findByText('라이브러리가 비공개로 설정되어 있어요'),
    ).toBeInTheDocument();
    expect(getSyncStatus).toHaveBeenCalledTimes(1);

    // 다시 시도 — 캐시된 종료상태로 곧장 튀지 않고 실제로 다시 폴링해야 한다.
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(getSyncStatus).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByText('라이브러리가 비공개로 설정되어 있어요'),
    ).toBeInTheDocument();
  });

  it('건너뛰기 → skip 호출 후 설문 인트로로 이동한다', async () => {
    skipSteam.mockResolvedValue({ nextStep: 'SURVEY', message: 'ok' });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '건너뛰고 시작하기' }));

    expect(await screen.findByText('SURVEY INTRO')).toBeInTheDocument();
    expect(skipSteam).toHaveBeenCalledTimes(1);
  });

  it('콜백 합성 실패결과(state.result)로 진입하면 곧장 에러 화면을 보여준다', async () => {
    const user = userEvent.setup();
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/onboarding/steam',
              state: {
                result: {
                  status: 'failed',
                  foundGames: null,
                  steamNickname: null,
                  errorMessage: null,
                },
              },
            },
          ]}
        >
          <Routes>
            <Route path="/onboarding/steam" element={<SteamOnboardingPage />} />
            <Route path="/survey/intro" element={<div>SURVEY INTRO</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText('Steam 정보를 불러오지 못했어요'),
    ).toBeInTheDocument();
    // 합성 결과 진입이므로 폴링은 일어나지 않는다.
    expect(getSyncStatus).not.toHaveBeenCalled();
    // 다시 시도하면 폴링이 시작된다.
    getSyncStatus.mockResolvedValue(SUCCESS);
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(getSyncStatus).toHaveBeenCalledTimes(1));
  });
});
