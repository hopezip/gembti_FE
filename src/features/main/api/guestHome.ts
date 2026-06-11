import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';
import type { components } from '@/types/api';

// 비로그인 홈 데이터 계층 (MAIN-FE-003 → API-SYNC-FE-001 실 API 전환).
// 백엔드엔 집계 엔드포인트(/home/guest)가 없어, 실 API 2개를 병렬 조합한다:
//   - 인기: GET /api/v1/games/trending (인증 불필요)
//   - 신규: GET /api/v1/games/new-releases (인증 불필요)
// curation_banner는 백엔드 원천이 없어 정적 상수로 둔다(HeroBanner는 배경 이미지가 없으면 단색 fallback,
//   텍스트·CTA는 하드코딩이라 데이터와 무관하게 항상 렌더된다).
// 컴포넌트는 기존 camelCase 도메인 타입(GuestHome)만 보므로 외부 인터페이스는 무변경이다.

type HomeGameItem = components['schemas']['HomeGameItem'];
type TrendingGamesResponse = components['schemas']['TrendingGamesResponse'];
type NewReleasesResponse = components['schemas']['NewReleasesResponse'];

// --- 도메인(camelCase) — 컴포넌트가 보는 형태 (무변경) ---
export interface CurationBanner {
  mainCopy: string;
  subCopy: string;
  buttonText: string;
  backgroundImageUrl: string;
}

export interface HomeGameSummary {
  gameId: number;
  title: string;
  thumbnailUrl: string;
  genres: string[];
  rating: number | null;
  isNew: boolean;
}

export interface GuestHome {
  curationBanner: CurationBanner;
  newReleases: HomeGameSummary[];
  trendingGames: HomeGameSummary[];
}

// curation_banner는 백엔드 미구현 → 배경 이미지 없는 정적 값. 배너 텍스트·CTA는 HeroBanner가 하드코딩으로 렌더한다.
const STATIC_CURATION_BANNER: CurationBanner = {
  mainCopy: '',
  subCopy: '',
  buttonText: '',
  backgroundImageUrl: '',
};

function mapHomeGame(item: HomeGameItem): HomeGameSummary {
  return {
    gameId: item.game_id,
    title: item.title,
    thumbnailUrl: item.thumbnail_url ?? '',
    genres: item.genres,
    rating: item.rating ?? null,
    isNew: item.is_new ?? false,
  };
}

// 메인 게스트 홈 = 1쿼리(인기+신규 병렬 조합). Hero(배경)·인기 그리드·신규 그리드가 함께 구독한다.
export function useGuestHome() {
  return useQuery({
    queryKey: ['home', 'guest'],
    // TanStack Query가 주는 signal을 ky에 연결 — 언마운트/리페치 시 진행 중 요청 취소.
    queryFn: async ({ signal }) => {
      const [trending, newReleases] = await Promise.all([
        api
          .get('api/v1/games/trending', { signal })
          .json<TrendingGamesResponse>(),
        api
          .get('api/v1/games/new-releases', { signal })
          .json<NewReleasesResponse>(),
      ]);
      return {
        curationBanner: STATIC_CURATION_BANNER,
        trendingGames: (trending.data ?? []).map(mapHomeGame),
        newReleases: (newReleases.data ?? []).map(mapHomeGame),
      } satisfies GuestHome;
    },
  });
}
