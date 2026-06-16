import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';
import type { components } from '@/types/api';

// 성향 기반 추천 데이터 계층 (MAIN-FE-012).
// 백엔드 계약: POST /api/v1/recommendations/generate (인증✅) — 로그인 사용자의 최신 성향 스탯과
//   게임 벡터를 코사인 유사도로 비교해 추천 목록을 생성·저장하고 반환한다(설문 완료 유저용).
// 응답은 snake_case raw이므로 이 파일의 매핑이 camelCase 도메인 타입으로 변환한다.
// 메인 개인화 홈의 "당신을 위한 추천" 그리드가 구독한다(설문 완료 분기에서만 마운트).

type RecommendationGenerateResponse =
  components['schemas']['RecommendationGenerateResponse'];
type RecommendedGameRaw = components['schemas']['RecommendedGameResponse'];

// --- 도메인(camelCase) — 컴포넌트가 보는 형태 ---
export interface RecommendedGame {
  gameId: number;
  title: string;
  thumbnailUrl: string | null;
  genres: string[];
  reviewScore: number | null;
  /** 코사인 유사도(0~1). 카드 배지에 취향 매칭률(%)로 환산해 노출한다. */
  similarityScore: number;
  /** 추천 순위(1부터). */
  similarityRank: number;
}

function mapRecommendedGame(raw: RecommendedGameRaw): RecommendedGame {
  return {
    gameId: raw.game_id,
    title: raw.title,
    thumbnailUrl: raw.image_url ?? null,
    genres: raw.genres,
    reviewScore: raw.rating ?? null,
    similarityScore: raw.similarity_score,
    similarityRank: raw.similarity_rank,
  };
}

// 성향 추천 목록. limit는 백엔드 상한(50)을 요청하고 노출/더보기는 GameGridSection이 처리한다.
export function useRecommendations(limit = 50) {
  return useQuery({
    queryKey: ['recommendations', 'generate', limit],
    // TanStack Query가 주는 signal을 ky에 연결 — 언마운트/리페치 시 진행 중 요청 취소.
    queryFn: ({ signal }) =>
      api
        .post('api/v1/recommendations/generate', {
          searchParams: { limit },
          signal,
        })
        .json<RecommendationGenerateResponse>()
        .then((res) => res.games.map(mapRecommendedGame)),
  });
}
