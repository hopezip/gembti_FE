import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';

// 게임 검색 데이터 계층 (SEARCH-FE-001).
// 백엔드 계약: GET /api/v1/games/search (인증 불필요) — status/data 래핑 + snake_case + price_info.
// 응답은 snake_case로 오므로, 이 파일의 매핑 함수가 camelCase 도메인 타입으로 변환한다.
// 컴포넌트는 camelCase 도메인 타입만 사용한다(백엔드 연결 시 매핑 계층만 유지하면 됨).

// 정렬 옵션(백엔드 계약). 현 디자인엔 정렬 UI가 없어 기본 relevance만 쓰지만, 계약 형태는 유지한다.
export type SearchSort =
  | 'relevance'
  | 'rating'
  | 'release_date'
  | 'price_asc'
  | 'price_desc';

// --- raw(snake_case) — 백엔드 응답 형태 그대로 ---
interface PriceInfoRaw {
  original_price: number;
  sale_price: number | null;
  discount_rate: number;
}

interface SearchGameRaw {
  game_id: number;
  title: string;
  thumbnail_url: string;
  genres: string[];
  // ⚠️ 계약 응답엔 genres만 있으나, 클라이언트 태그 필터를 위해 mock이 tags도 내려준다.
  //    백엔드 search 응답에 tags 필드 추가 필요(미제공 시 optional로 빈 배열 처리).
  tags?: string[];
  rating: number | null;
  price_info: PriceInfoRaw;
}

interface SearchResponseRaw {
  status: string;
  data: {
    games: SearchGameRaw[];
    total_count: number;
    has_more: boolean;
  };
}

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
  tags: string[];
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
    thumbnailUrl: raw.thumbnail_url,
    genres: raw.genres,
    tags: raw.tags ?? [],
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

// 검색 1페이지 = 1쿼리. page를 키에 포함해 페이지별로 캐시하고, 컴포넌트가 누적한다.
export function useSearchGames(
  q: string,
  page: number,
  sort: SearchSort = 'relevance',
) {
  return useQuery({
    queryKey: ['games', 'search', q, page, sort],
    // TanStack Query가 주는 signal을 ky에 연결 — 언마운트/리페치 시 진행 중 요청 취소.
    queryFn: ({ signal }) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('page', String(page));
      params.set('sort', sort);
      return api
        .get('api/v1/games/search', { searchParams: params, signal })
        .json<SearchResponseRaw>()
        .then(mapSearchResult);
    },
  });
}
