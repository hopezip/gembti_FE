import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';
import type { HomeGameSummary } from '@/features/main/api/guestHome';

// 개인화(로그인+설문완료) 홈 데이터 계층 (MAIN-FE-006).
// 백엔드 계약: GET /api/v1/home/personalized (인증✅) — 1순위 추천 + 성향태그 + 추천 그리드 + 신규를 한 응답으로 제공.
// 응답은 snake_case로 오므로, 이 파일의 매핑 함수가 camelCase 도메인 타입으로 변환한다.
// 컴포넌트는 camelCase 도메인 타입만 사용한다(백엔드 연결 시 매핑 계층만 유지하면 됨).

// --- raw(snake_case) — 백엔드 응답 형태 그대로 ---
interface TopRecommendationRaw {
  game_id: number;
  title: string;
  match_rate: number;
  reason_summary: string;
  background_url: string;
}

// 개인화 추천 카드는 게스트 카드 필드 + 매칭률·추천이유 태그라인을 추가로 받는다.
interface PersonalizedGameRaw {
  game_id: number;
  title: string;
  thumbnail_url: string;
  genres: string[];
  rating: number | null;
  match_rate: number;
  reason_tagline: string;
}

// 신규 게임은 게스트 홈과 동일한 형태(매칭률·태그라인 없음).
interface HomeGameRaw {
  game_id: number;
  title: string;
  thumbnail_url: string;
  genres: string[];
  rating: number | null;
  is_new?: boolean;
}

// 추천 페이지 Hero의 취향 2그룹 메타(REC-FE-002). "좋아하는 것" 칩은
// 별도 필드 없이 기존 user_interest_tags를 재사용한다(중복 방지).
interface RecommendationProfileRaw {
  challenge_tags: string[];
  liked_meta: string;
  challenge_meta: string;
  last_updated_text: string;
}

interface PersonalizedHomeResponseRaw {
  status: string;
  data: {
    top_recommendation: TopRecommendationRaw;
    user_interest_tags: string[];
    recommended_games: PersonalizedGameRaw[];
    new_releases: HomeGameRaw[];
    // 기존 실서버 계약엔 없는 추가 필드(REC-FE-002 mock 보강). 실서버가 옛 형태로 내려와도
    // 매핑이 깨지지 않도록 optional로 둔다(없으면 매핑에서 기본값으로 채움).
    recommendation_profile?: RecommendationProfileRaw;
  };
}

// --- 도메인(camelCase) — 컴포넌트가 보는 형태 ---
export interface TopRecommendation {
  gameId: number;
  title: string;
  matchRate: number;
  reasonSummary: string;
  backgroundUrl: string;
}

// 개인화 추천 카드 = 게스트 카드(HomeGameSummary) + 매칭률 + 추천이유 태그라인.
export interface PersonalizedGameSummary extends HomeGameSummary {
  matchRate: number;
  reasonTagline: string;
}

// 추천 페이지 Hero의 취향 2그룹 메타(REC-FE-002).
// "좋아하는 것" 그룹 칩은 별도 필드 없이 기존 userInterestTags를 재사용한다.
export interface RecommendationProfile {
  likedMeta: string; // "좋아하는 것" 그룹 캡션 (예: "★4+ 게임 23개에서 추출")
  challengeTags: string[]; // "새로운 도전" 그룹 칩
  challengeMeta: string; // "새로운 도전" 그룹 캡션
  lastUpdatedText: string; // "마지막 업데이트 …"의 값 (예: "2일 전")
}

export interface PersonalizedHome {
  topRecommendation: TopRecommendation;
  userInterestTags: string[];
  recommendedGames: PersonalizedGameSummary[];
  newReleases: HomeGameSummary[];
  recommendationProfile: RecommendationProfile;
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

function mapPersonalizedGame(
  raw: PersonalizedGameRaw,
): PersonalizedGameSummary {
  return {
    gameId: raw.game_id,
    title: raw.title,
    thumbnailUrl: raw.thumbnail_url,
    genres: raw.genres,
    rating: raw.rating,
    isNew: false,
    matchRate: raw.match_rate,
    reasonTagline: raw.reason_tagline,
  };
}

function mapPersonalizedHome(
  raw: PersonalizedHomeResponseRaw,
): PersonalizedHome {
  const {
    top_recommendation,
    user_interest_tags,
    recommended_games,
    new_releases,
    recommendation_profile,
  } = raw.data;
  return {
    topRecommendation: {
      gameId: top_recommendation.game_id,
      title: top_recommendation.title,
      matchRate: top_recommendation.match_rate,
      reasonSummary: top_recommendation.reason_summary,
      backgroundUrl: top_recommendation.background_url,
    },
    userInterestTags: user_interest_tags,
    recommendedGames: recommended_games.map(mapPersonalizedGame),
    newReleases: new_releases.map(mapHomeGame),
    // recommendation_profile은 실서버 옛 계약엔 없을 수 있다(optional). 없으면 기본값으로 채워
    // 매핑 예외를 방지한다 — 이 쿼리를 공유하는 MainPage 개인화 홈까지 동반 에러로 떨어지지 않도록.
    // 빈 값은 Hero가 조건부 렌더로 자연히 숨긴다(빈 칩 그룹·캡션 미노출).
    recommendationProfile: {
      likedMeta: recommendation_profile?.liked_meta ?? '',
      challengeTags: recommendation_profile?.challenge_tags ?? [],
      challengeMeta: recommendation_profile?.challenge_meta ?? '',
      lastUpdatedText: recommendation_profile?.last_updated_text ?? '',
    },
  };
}

// 개인화 메인 1페이지 = 1쿼리. Hero(1순위)·추천 그리드·신규 그리드가 함께 구독한다.
export function usePersonalizedHome() {
  return useQuery({
    queryKey: ['home', 'personalized'],
    // TanStack Query가 주는 signal을 ky에 연결 — 언마운트/리페치 시 진행 중 요청 취소.
    queryFn: ({ signal }) =>
      api
        .get('api/v1/home/personalized', { signal })
        .json<PersonalizedHomeResponseRaw>()
        .then(mapPersonalizedHome),
  });
}
