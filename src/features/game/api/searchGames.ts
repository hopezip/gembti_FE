import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';
import type { components } from '@/types/api';

// 게임 검색 데이터 계층 (SEARCH-FE-005 실서버 연결).
// 백엔드 계약: GET /api/v1/games/search (인증 불필요) — status/data 래핑 + snake_case + price_info.
// 응답은 snake_case로 오므로, 이 파일의 매핑 함수가 camelCase 도메인 타입으로 변환한다.
// 컴포넌트는 camelCase 도메인 타입만 사용한다.
// 필터는 서버사이드 — genre[]/category[] 쿼리로 전달하고, 서버가 필터링한 결과를 받는다.

// 정렬·필터 옵션은 생성된 api.ts(SSOT)에서 가져온다.
export type SearchSort = components['schemas']['SortOption'];
type SearchResponseRaw = components['schemas']['SearchResponse'];
type SearchGameRaw = components['schemas']['GameSearchItemResponse'];

// --- 도메인(camelCase) — 컴포넌트가 보는 형태 ---
export interface GamePriceInfo {
  originalPrice: number;
  salePrice: number | null;
  discountRate: number;
}

export interface SearchGameSummary {
  gameId: number;
  title: string;
  thumbnailUrl: string;
  genres: string[];
  categories: string[];
  rating: number | null;
  priceInfo: GamePriceInfo;
}

export interface SearchResult {
  games: SearchGameSummary[];
  totalCount: number;
  hasMore: boolean;
}

function mapSearchGame(raw: SearchGameRaw): SearchGameSummary {
  return {
    gameId: raw.game_id,
    title: raw.title,
    thumbnailUrl: raw.thumbnail_url ?? '',
    genres: raw.genres,
    categories: raw.categories,
    rating: raw.rating,
    priceInfo: {
      originalPrice: raw.price_info.original_price,
      salePrice: raw.price_info.sale_price,
      discountRate: raw.price_info.discount_rate,
    },
  };
}

function mapSearchResult(raw: SearchResponseRaw): SearchResult {
  return {
    games: raw.data.games.map(mapSearchGame),
    totalCount: raw.data.total_count,
    hasMore: raw.data.has_more,
  };
}

export interface SearchGamesParams {
  q: string;
  page: number;
  sort?: SearchSort;
  genres?: string[];
  categories?: string[];
}

// 검색 1페이지 = 1쿼리. q·page·sort·필터를 키에 포함해 페이지/필터별로 캐시하고, 컴포넌트가 누적한다.
export function useSearchGames({
  q,
  page,
  sort = 'popular',
  genres = [],
  categories = [],
}: SearchGamesParams) {
  return useQuery({
    queryKey: ['games', 'search', q, page, sort, genres, categories],
    // TanStack Query가 주는 signal을 ky에 연결 — 언마운트/리페치 시 진행 중 요청 취소.
    queryFn: ({ signal }) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('page', String(page));
      params.set('sort', sort);
      // 배열 필터는 반복 쿼리키(genre=A&genre=B)로 전달 — FastAPI 배열 파라미터 규약.
      for (const genre of genres) params.append('genre', genre);
      for (const category of categories) params.append('category', category);
      return api
        .get('api/v1/games/search', { searchParams: params, signal })
        .json<SearchResponseRaw>()
        .then(mapSearchResult);
    },
  });
}
