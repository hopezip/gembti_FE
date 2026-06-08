import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { RecommendationsPage } from './RecommendationsPage';

// REC-FE-002 개인화 가드 + REC-GUEST-FE-001 게스트 추천 노출.
// /recommendations는 Public이라 비인증으로도 진입 가능하다. 개인화 컴포넌트를 무가드로 렌더하면
// 이전 로그인 사용자의 ['home','personalized'] 캐시가 로그아웃 후에도 노출된다(개인정보 누출).
// 따라서 authenticated && hasCompletedSurvey 가 아니면 개인화 Hero/그리드를 렌더하지 않아야 한다.
// 단, 비로그인/설문미완에도 인기 추천 그리드(게스트)는 노출해야 한다(게이트만 보이면 안 됨).

// home 쿼리는 mock으로 대체해 실제 네트워크(api/v1/home/*) 요청을 막는다.
// MSW는 브라우저 워커만 설정되어 있어 단위 테스트(jsdom)에서는 동작하지 않으므로 훅을 직접 모킹한다.
const mockUseGuestHome = vi.fn();
vi.mock('@/features/main/api/guestHome', () => ({
  useGuestHome: () => mockUseGuestHome(),
}));
vi.mock('@/features/main/api/personalizedHome', () => ({
  usePersonalizedHome: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}));

// 게스트 추천 그리드(RecommendedGames)가 구독하는 trendingGames 샘플.
const sampleTrending = [
  {
    gameId: 1,
    title: '테스트 게임 A',
    thumbnailUrl: '',
    genres: ['액션'],
    rating: 4.5,
    isNew: false,
  },
  {
    gameId: 2,
    title: '테스트 게임 B',
    thumbnailUrl: '',
    genres: ['RPG'],
    rating: 4.2,
    isNew: false,
  },
];

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  // 기본값: 게스트 홈 정상 응답(인기 게임 2개).
  mockUseGuestHome.mockReturnValue({
    data: { trendingGames: sampleTrending },
    isLoading: false,
    isError: false,
  });
});

afterEach(() => {
  useAuthStore.getState().clearAuth();
  queryClient.clear();
  vi.clearAllMocks();
});

describe('RecommendationsPage 개인화 가드', () => {
  it('비로그인 상태에서는 개인화 Hero 대신 게스트 추천(로그인 CTA + 인기 그리드)을 렌더한다', () => {
    // 기본 store = anonymous.
    renderPage();

    expect(
      screen.getByRole('link', { name: '로그인하기' }),
    ).toBeInTheDocument();
    // 게스트 추천 헤더 + 인기 그리드 섹션이 노출되어야 한다(게이트만 보이면 안 됨).
    expect(
      screen.getByRole('heading', { name: '지금 인기 있는 게임' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '추천 게임' }),
    ).toBeInTheDocument();
    // 인기 게임 카드가 /games/:gameId 상세 링크로 노출된다.
    expect(screen.getByText('테스트 게임 A').closest('a')).toHaveAttribute(
      'href',
      '/games/1',
    );
    // 개인화 Hero 헤드라인("…골라봤어요")은 렌더되지 않아야 한다(캐시 노출 차단).
    expect(screen.queryByText(/골라봤어요/)).not.toBeInTheDocument();
  });

  it('로그인했으나 설문 미완이면 설문 유도 CTA + 인기 그리드를 렌더한다(개인화 미렌더)', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: 'survey-incomplete@gambti.com',
        nickname: '테스트유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'test-access',
    });

    renderPage();

    expect(
      screen.getByRole('link', { name: '설문 시작하기' }),
    ).toBeInTheDocument();
    // 설문미완도 게스트와 동일하게 인기 추천 그리드를 본다.
    expect(
      screen.getByRole('heading', { name: '지금 인기 있는 게임' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/골라봤어요/)).not.toBeInTheDocument();
  });

  it('로그인 + 설문완료면 개인화 Hero를 렌더한다(가드 통과)', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 2,
        email: 'survey@gambti.com',
        nickname: '설문완료유저',
        hasCompletedSurvey: true,
      },
      accessToken: 'test-access',
    });

    renderPage();

    // 개인화 Hero 헤드라인은 데이터 로딩과 무관하게 항상 렌더된다(닉네임 기반).
    expect(screen.getByText(/골라봤어요/)).toBeInTheDocument();
    // 게이트 CTA는 노출되지 않아야 한다.
    expect(
      screen.queryByRole('link', { name: '로그인하기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '설문 시작하기' }),
    ).not.toBeInTheDocument();
  });
});

describe('RecommendationsPage 게스트 추천 그리드 상태', () => {
  it('로딩 중에는 섹션 헤더를 유지하고 카드 텍스트는 아직 없다', () => {
    mockUseGuestHome.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderPage();

    expect(
      screen.getByRole('heading', { name: '추천 게임' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('테스트 게임 A')).not.toBeInTheDocument();
  });

  it('에러 시 폴백 문구를 노출한다', () => {
    mockUseGuestHome.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderPage();

    expect(
      screen.getByText('추천 게임을 불러오지 못했어요.'),
    ).toBeInTheDocument();
  });
});
