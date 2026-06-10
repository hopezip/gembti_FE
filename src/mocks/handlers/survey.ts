import { http, HttpResponse } from 'msw';
import type { SurveySubmitRequest } from '@/features/survey/api/types';
import {
  createMockSurveyRecommendations,
  createMockSurveyResult,
  MOCK_SURVEY_LATEST_RESULT,
  MOCK_SURVEY_QUESTIONS,
} from '@/mocks/data/survey';

// 설문 MSW 핸들러 (한시적 수동 작성, SURVEY-FE-002).
// Swagger/OpenAPI 생성물이 들어오기 전까지 API 명세에 맞춘 응답을 제공한다.
// 패턴은 기존 games/steam 핸들러처럼 `*/api/v1/...`를 사용해 base URL 변경에도 동작한다.
let latestSurveyResult = MOCK_SURVEY_LATEST_RESULT;

export const surveyHandlers = [
  // 설문 진행 화면 문항 조회.
  // 계약: GET /api/v1/surveys/questions → SurveyQuestionResponse[]
  http.get('*/api/v1/surveys/questions', () => {
    return HttpResponse.json(MOCK_SURVEY_QUESTIONS);
  }),

  // 설문 응답 제출.
  // 계약: POST /api/v1/surveys/submit { answers: [{ question_id, answer }] }
  // 건너뛴 문항은 요청에서 제외되며, 제출된 답만 성향 계산에 반영한다.
  http.post('*/api/v1/surveys/submit', async ({ request }) => {
    const body = (await request
      .json()
      .catch(() => ({}))) as Partial<SurveySubmitRequest>;
    const answers = body.answers ?? [];
    const hasInvalidAnswer = answers.some(
      (answer) =>
        !MOCK_SURVEY_QUESTIONS.some(
          (question) => question.question_id === answer.question_id,
        ) || ![1, 2, 3, 4, 5].includes(answer.answer),
    );

    if (hasInvalidAnswer) {
      return HttpResponse.json(
        { error: '유효하지 않은 설문 응답' },
        { status: 400 },
      );
    }

    const result = createMockSurveyResult(answers);
    latestSurveyResult = result.latest;
    return HttpResponse.json(result.submit);
  }),

  // 가장 최근 설문 결과 조회.
  // 계약: GET /api/v1/surveys/result → 최근 survey_id/type/stats/created_at
  http.get('*/api/v1/surveys/result', () => {
    return HttpResponse.json(latestSurveyResult);
  }),

  // 최신 설문 성향 점수를 기준으로 상위 4개 게임 추천을 생성한다.
  http.post('*/api/v1/recommendations/generate', () => {
    return HttpResponse.json(
      createMockSurveyRecommendations(latestSurveyResult.stats),
      { status: 201 },
    );
  }),
];
