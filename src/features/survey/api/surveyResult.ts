import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/ky';
import type {
  SurveyLatestResultResponse,
  SurveyRecommendationsResponse,
  SurveySubmitRequest,
  SurveySubmitResponse,
} from './types';

// 최신 설문 결과 조회 캐시 키
const surveyResultQueryKey = ['surveys', 'result'] as const;

// 설문 기반 추천 게임 생성/조회 캐시 키
const surveyRecommendationsQueryKey = ['surveys', 'recommendations'] as const;

/**
 * 설문 응답 제출
 * - 모든 설문 문항 응답 완료 후 호출한다.
 * - 설문 결과를 저장하고 최신 설문 관련 캐시를 갱신한다.
 */
export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SurveySubmitRequest) =>
      api
        .post('api/v1/surveys/submit', { json: body })
        .json<SurveySubmitResponse>(),
    onSuccess: () => {
      // 설문 관련 데이터를 최신 상태로 갱신
      void queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
    retry: false,
  });
}

/**
 * 최신 설문 결과 조회
 * - 사용자의 가장 최근 설문 결과를 조회한다.
 * - 결과 페이지 진입 시 사용된다.
 */
export function useSurveyResult() {
  return useQuery({
    queryKey: surveyResultQueryKey,
    queryFn: ({ signal }) =>
      api
        .get('api/v1/surveys/result', { signal })
        .json<SurveyLatestResultResponse>(),
  });
}

/**
 * 설문 결과 기반 추천 게임 생성 및 조회
 * - enabled가 true일 때만 추천 요청을 수행한다.
 */
export function useSurveyRecommendations(enabled: boolean) {
  return useQuery({
    queryKey: surveyRecommendationsQueryKey,
    queryFn: ({ signal }) =>
      api
        .post('api/v1/recommendations/generate', {
          signal,
          searchParams: { limit: 4 },
        })
        .json<SurveyRecommendationsResponse>(),
    enabled,
  });
}
