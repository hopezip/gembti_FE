import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { queryClient } from '@/lib/queryClient';
import { SearchPage } from './SearchPage';

// useSearchGames를 "캐시처럼" 모킹한다 — q별로 동기·안정 참조를 돌려줘
//   React Query 캐시 히트(즉시·동일 객체) 조건을 재현한다. 이게 SEARCH-FE-006 버그의 발화 조건.
const card = (id: number, title: string) => ({
  gameId: id,
  title,
  thumbnailUrl: '',
  genres: ['액션'],
  categories: [],
  rating: 4.5,
  priceInfo: { originalPrice: 0, salePrice: null, discountRate: 0 },
});

const RESULTS: Record<
  string,
  {
    data: {
      games: ReturnType<typeof card>[];
      totalCount: number;
      hasMore: boolean;
    };
    isFetching: boolean;
    isError: boolean;
  }
> = {
  coun: {
    data: {
      games: [card(1, 'Coun Game 1'), card(2, 'Coun Game 2')],
      totalCount: 2,
      hasMore: false,
    },
    isFetching: false,
    isError: false,
  },
  '': {
    data: {
      games: [card(100, 'Trending Game')],
      totalCount: 1,
      hasMore: false,
    },
    isFetching: false,
    isError: false,
  },
};

vi.mock('@/features/game/api/searchGames', () => ({
  useSearchGames: ({ q }: { q: string }) => RESULTS[q] ?? RESULTS[''],
}));

function renderSearchPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/search']}>
        <SearchPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SearchPage 캐시 재검색 (SEARCH-FE-006)', () => {
  it('지웠다가 같은 검색어를 다시 검색해도 결과 목록이 보인다', async () => {
    const user = userEvent.setup();
    renderSearchPage();

    const input = screen.getByRole('searchbox', { name: '게임 검색' });

    // 1) coun 검색 → 결과 표시
    await user.type(input, 'coun');
    await waitFor(
      () => expect(screen.getByText('Coun Game 1')).toBeInTheDocument(),
      { timeout: 1500 },
    );

    // 2) 전부 지움 → 인기목록
    await user.clear(input);
    await waitFor(
      () => expect(screen.getByText('Trending Game')).toBeInTheDocument(),
      { timeout: 1500 },
    );

    // 3) 다시 coun 검색 → 결과가 다시 보여야 한다(버그: 카드 0개 + 빈 상태)
    await user.type(input, 'coun');
    await waitFor(
      () => expect(screen.getByText('Coun Game 1')).toBeInTheDocument(),
      { timeout: 1500 },
    );
    expect(screen.getByText('Coun Game 2')).toBeInTheDocument();
    // 빈 상태가 떠 있으면 안 된다
    expect(
      screen.queryByText(/해당하는 게임이 없어요/),
    ).not.toBeInTheDocument();
  });
});
