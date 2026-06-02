import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';

// 비로그인 홈 데이터 계층 (MAIN-FE-003).
// 백엔드 계약: GET /api/v1/home/guest (인증 불필요) — 배너 + 신규 + 인기를 한 응답으로 제공.
// 응답은 snake_case로 오므로, 이 파일의 매핑 함수가 camelCase 도메인 타입으로 변환한다.
// 컴포넌트는 camelCase 도메인 타입만 사용한다(백엔드 연결 시 매핑 계층만 유지하면 됨).

// --- raw(snake_case) — 백엔드 응답 형태 그대로 ---
interface CurationBannerRaw {
  main_copy: string;
  sub_copy: string;
  button_text: string;
  background_image_url: string;
}

interface HomeGameRaw {
  game_id: number;
  title: string;
  thumbnail_url: string;
  genres: string[];
  rating: number;
  is_new?: boolean;
}

interface GuestHomeResponseRaw {
  status: string;
  data: {
    curation_banner: CurationBannerRaw;
    new_releases: HomeGameRaw[];
    trending_games: HomeGameRaw[];
  };
}

// --- 도메인(camelCase) — 컴포넌트가 보는 형태 ---
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
  rating: number;
  isNew: boolean;
}

export interface GuestHome {
  curationBanner: CurationBanner;
  newReleases: HomeGameSummary[];
  trendingGames: HomeGameSummary[];
}

function mapHomeGame(raw: HomeGameRaw): HomeGameSummary {
  return {
    gameId: raw.game_id,
    title: raw.title,
    thumbnailUrl: raw.thumbnail_url,
    genres: raw.genres,
    rating: raw.rating,
    isNew: raw.is_new ?? false,
  };
}

function mapGuestHome(raw: GuestHomeResponseRaw): GuestHome {
  const { curation_banner, new_releases, trending_games } = raw.data;
  return {
    curationBanner: {
      mainCopy: curation_banner.main_copy,
      subCopy: curation_banner.sub_copy,
      buttonText: curation_banner.button_text,
      backgroundImageUrl: curation_banner.background_image_url,
    },
    newReleases: new_releases.map(mapHomeGame),
    trendingGames: trending_games.map(mapHomeGame),
  };
}

// 메인 1페이지 = 1쿼리. Hero(배경)·추천(인기) 그리드가 함께 구독한다.
export function useGuestHome() {
  return useQuery({
    queryKey: ['home', 'guest'],
    queryFn: () =>
      api
        .get('api/v1/home/guest')
        .json<GuestHomeResponseRaw>()
        .then(mapGuestHome),
  });
}
