import { http, HttpResponse } from 'msw';
import type { SurveySubmitRequest } from '@/features/survey/api/types';
import {
  MOCK_SURVEY_LATEST_RESULT,
  MOCK_SURVEY_QUESTIONS,
  MOCK_SURVEY_SUBMIT_RESULT,
} from '@/mocks/data/survey';

// 설문 MSW 핸들러 (한시적 수동 작성, SURVEY-FE-002).
// Swagger/OpenAPI 생성물이 들어오기 전까지 API 명세에 맞춘 응답을 제공한다.
// 패턴은 기존 games/steam 핸들러처럼 `*/api/v1/...`를 사용해 base URL 변경에도 동작한다.
export const surveyHandlers = [
  // 설문 진행 화면 문항 조회.
  // 계약: GET /api/v1/surveys/questions → SurveyQuestionResponse[]
  http.get('*/api/v1/surveys/questions', () => {
    return HttpResponse.json(MOCK_SURVEY_QUESTIONS);
  }),

  // 설문 응답 제출.
  // 계약: POST /api/v1/surveys/submit { answers: [{ question_id, answer }] }
  // mock은 누락 문항/잘못된 척도만 검증하고, 성향 계산은 고정 결과로 반환한다.
  http.post('*/api/v1/surveys/submit', async ({ request }) => {
    const body = (await request
      .json()
      .catch(() => ({}))) as Partial<SurveySubmitRequest>;
    const answers = body.answers ?? [];
    const requiredQuestionIds = new Set(
      MOCK_SURVEY_QUESTIONS.map((question) => question.question_id),
    );
    const answeredQuestionIds = new Set(
      answers.map((answer) => answer.question_id),
    );
    const hasMissingAnswer = [...requiredQuestionIds].some(
      (questionId) => !answeredQuestionIds.has(questionId),
    );
    const hasInvalidAnswer = answers.some(
      (answer) => ![1, 2, 3, 4, 5].includes(answer.answer),
    );

    if (hasMissingAnswer || hasInvalidAnswer) {
      return HttpResponse.json(
        { error: '응답 누락 문항 존재' },
        { status: 400 },
      );
    }

    return HttpResponse.json(MOCK_SURVEY_SUBMIT_RESULT);
  }),

  // 가장 최근 설문 결과 조회.
  // 계약: GET /api/v1/surveys/result → 최근 survey_id/type/stats/created_at
  http.get('*/api/v1/surveys/result', () => {
    return HttpResponse.json(MOCK_SURVEY_LATEST_RESULT);
  }),
];
