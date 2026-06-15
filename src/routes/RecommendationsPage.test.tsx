import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { RecommendationsPage } from './RecommendationsPage';

vi.mock('@/features/main/api/personalizedHome', () => ({
  usePersonalizedHome: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/features/recommendations/hooks/useRecommendations', () => {
  const latestRecommendations = Array.from({ length: 13 }, (_, index) => ({
    recommendationItemId: index + 1,
    gameId: index + 101,
    title: index === 0 ? '최신 추천 게임' : `최신 추천 게임 ${index + 1}`,
    imageUrl: '',
    genres: ['RPG'],
    similarityScore: 0.92 - index * 0.01,
    similarityRank: index + 1,
  }));

  return {
    useLatestRecommendations: () => ({
      data: latestRecommendations,
      isLoading: false,
      isError: false,
    }),
    useDiscountedRecommendations: () => ({
      data: [
        {
          recommendationItemId: 2,
          gameId: 102,
          title: '할인 추천 게임',
          imageUrl: '',
          genres: ['액션'],
          similarityScore: 0.88,
          discountRate: 50,
          originalPrice: 60_000,
          salePrice: 30_000,
        },
      ],
      isLoading: false,
      isError: false,
    }),
    useHighlyRatedRecommendations: () => ({
      data: [
        {
          recommendationItemId: 3,
          gameId: 103,
          title: '고평가 추천 게임',
          imageUrl: '',
          genres: ['전략'],
          similarityScore: 0.84,
          similarityRank: 2,
          rating: 4.8,
          reviewCount: 120_000,
        },
      ],
      isLoading: false,
      isError: false,
    }),
    usePopularGames: () => ({
      data: [
        {
          rank: 1,
          gameId: 104,
          title: '인기 게임',
          imageUrl: '',
          genres: ['인디'],
          currentPlayers: 912_345,
          rating: 4.7,
        },
        {
          rank: 11,
          gameId: 105,
          title: '인기 게임 11위',
          imageUrl: '',
          genres: ['액션'],
          currentPlayers: 120_000,
          rating: 4.2,
        },
      ],
      isLoading: false,
      isError: false,
    }),
  };
});

function renderPage(initialEntry = '/recommendations') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <RecommendationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  useAuthStore.getState().clearAuth();
  queryClient.clear();
});

describe('RecommendationsPage', () => {
  it('비로그인 상태에서는 로그인 안내 화면을 렌더한다', () => {
    renderPage();

    expect(
      screen.getByRole('link', { name: /로그인하고 추천받기/ }),
    ).toHaveAttribute('href', '/login');
    expect(screen.queryByText(/골라봤어요/)).not.toBeInTheDocument();
  });

  it('로그인했으나 설문 미완이면 설문 안내 화면을 렌더한다', () => {
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
      screen.getByRole('link', { name: /설문조사 진행하기/ }),
    ).toHaveAttribute('href', '/survey');
  });

  it('로그인과 설문을 완료하면 네 추천 분류를 탭으로 렌더한다', async () => {
    const user = userEvent.setup();
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

    expect(screen.getByText(/골라봤어요/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'GamBTI 추천 게임' }),
    ).toBeInTheDocument();
    expect(screen.getByText('취향률 92%')).toBeInTheDocument();
    expect(screen.queryByText(/추천 순위/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'GamBTI 추천' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.queryByRole('heading', { name: '할인 중인 취향 저격 게임' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '할인 중' }));

    expect(
      screen.getByRole('heading', { name: '할인 중인 취향 저격 게임' }),
    ).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '유저 고평가' }));

    expect(
      screen.getByRole('heading', { name: '유저들이 인정한 취향 게임' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/★ 4.8/)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '인기 게임' }));

    expect(
      screen.getByRole('heading', { name: '지금 가장 핫한 게임' }),
    ).toBeInTheDocument();
    expect(screen.getByText('TOP 1')).toBeInTheDocument();
    expect(screen.queryByText('TOP 11')).not.toBeInTheDocument();
    expect(screen.getByText('★ 4.7')).toBeInTheDocument();
    expect(screen.getByText('91.2만명 플레이 중')).toBeInTheDocument();
  });

  it('탭을 전환해도 탭별 더보기 노출 개수를 유지한다', async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setSession({
      user: {
        id: 3,
        email: 'more@gambti.com',
        nickname: '더보기유저',
        hasCompletedSurvey: true,
      },
      accessToken: 'test-access',
    });

    renderPage();

    expect(screen.queryByText('최신 추천 게임 13')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'GamBTI 추천 게임 더 보기' }),
    );

    expect(screen.getByText('최신 추천 게임 13')).toBeInTheDocument();
    const moreButton = screen.getByRole('button', {
      name: 'GamBTI 추천 게임 더 보기',
    });
    expect(moreButton).toBeDisabled();
    expect(moreButton).toHaveTextContent('모두 불러왔어요');

    await user.click(screen.getByRole('tab', { name: '할인 중' }));
    expect(screen.getByText('할인 추천 게임')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'GamBTI 추천' }));
    expect(screen.getByText('최신 추천 게임 13')).toBeInTheDocument();
  });

  it('URL category에 해당하는 탭을 초기 선택한다', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 4,
        email: 'category@gambti.com',
        nickname: '카테고리유저',
        hasCompletedSurvey: true,
      },
      accessToken: 'test-access',
    });

    renderPage('/recommendations?category=popular');

    expect(screen.getByRole('tab', { name: '인기 게임' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('heading', { name: '지금 가장 핫한 게임' }),
    ).toBeInTheDocument();
  });
});
