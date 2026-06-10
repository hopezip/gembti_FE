import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';
import type { SurveyQuestionResponse, SurveyQuestionsResponse } from './types';

// 화면에서 쓰기 쉬운 설문 문항 타입.
// API 응답(snake_case)을 그대로 노출하지 않고 컴포넌트가 필요한 camelCase 형태로 매핑한다.
export interface SurveyQuestion {
  id: number;
  question: string;
  options: string[];
}

function mapSurveyQuestion(raw: SurveyQuestionResponse): SurveyQuestion {
  return {
    id: raw.question_id,
    question: raw.question,
    options: raw.options,
  };
}

// 설문 진행 화면 문항 조회.
// 백엔드 계약: GET /api/v1/surveys/questions (Bearer 인증 필요).
// 인증 헤더는 api(ky) 인스턴스의 beforeRequest 훅에서 자동 부착한다.
export function useSurveyQuestions() {
  return useQuery({
    queryKey: ['surveys', 'questions'],
    queryFn: ({ signal }) =>
      api
        .get('api/v1/surveys/questions', { signal })
        .json<SurveyQuestionsResponse>()
        .then((questions) => questions.map(mapSurveyQuestion)),
  });
}
