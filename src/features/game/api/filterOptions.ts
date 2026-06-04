import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';

// 검색 필터 옵션 데이터 계층 (SEARCH-FE-003).
// 백엔드 계약: GET /api/v1/games/filter-options (인증 불필요) — 장르·태그(+가격대·플레이모드) 목록.
// 현 디자인 필터박스는 장르·태그 칩만 쓰므로 도메인 타입도 genres/tags만 노출한다.

interface FilterOptionsResponseRaw {
  status: string;
  data: {
    genres: string[];
    tags: string[];
    // price_ranges / play_modes는 현 디자인 미사용 — 계약엔 있으나 도메인에 매핑하지 않는다.
  };
}

export interface FilterOptions {
  genres: string[];
  tags: string[];
}

function mapFilterOptions(raw: FilterOptionsResponseRaw): FilterOptions {
  return {
    genres: raw.data.genres,
    tags: raw.data.tags,
  };
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['games', 'filter-options'],
    queryFn: ({ signal }) =>
      api
        .get('api/v1/games/filter-options', { signal })
        .json<FilterOptionsResponseRaw>()
        .then(mapFilterOptions),
    // 필터 옵션은 거의 변하지 않으므로 한 번 받으면 길게 신선하게 유지.
    staleTime: 1000 * 60 * 10,
  });
}
