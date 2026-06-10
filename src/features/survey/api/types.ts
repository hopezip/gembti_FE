// 설문 API 임시 계약 타입.
// Swagger/OpenAPI 생성물이 들어오기 전까지 화면·서비스·MSW가 같은 형태를 보도록
// 이 파일에서 설문 도메인 타입을 한곳에 모은다.

// 1~5 리커트 척도 값.
// API 명세의 submit 예시는 answer를 number로 받지만, 화면 선택지는 1~5만 허용한다.
export type SurveyAnswerValue = 1 | 2 | 3 | 4 | 5;

// GET /api/v1/surveys/questions 응답의 단일 문항.
// question_id/question/options는 백엔드 명세의 snake_case 응답을 그대로 따른다.
export interface SurveyQuestionResponse {
  question_id: number;
  question: string;
  options: string[];
}

// GET /api/v1/surveys/questions 응답.
// 현재 명세는 배열을 최상위로 반환하므로 별도 data 래퍼를 두지 않는다.
export type SurveyQuestionsResponse = SurveyQuestionResponse[];

// POST /api/v1/surveys/submit 요청의 단일 답변.
// answer는 선택된 척도 값이며, 누락 문항은 서버가 400으로 판단한다.
export interface SurveySubmitAnswer {
  question_id: number;
  answer: SurveyAnswerValue;
}

// POST /api/v1/surveys/submit 요청 바디.
export interface SurveySubmitRequest {
  answers: SurveySubmitAnswer[];
}

// 성향 스탯 키.
// 백엔드 명세의 최종 스탯 키를 그대로 사용해 결과/추천 API와 맞춘다.
export type SurveyTraitKey =
  | 'combat'
  | 'strategy'
  | 'cooperation'
  | 'exploration'
  | 'growth'
  | 'healing';

// 설문/Steam 혼합 여부.
// ONLY_SURVEY: 설문만으로 계산, HYBRID_STEAM: Steam 데이터와 설문을 합산.
export type SurveyResultSource = 'ONLY_SURVEY' | 'HYBRID_STEAM';

// POST /api/v1/surveys/submit 응답의 stats 객체.
export type SurveyStats = Record<SurveyTraitKey, number>;

// POST /api/v1/surveys/submit 성공 응답.
export interface SurveySubmitResponse {
  survey_id: number;
  stats: SurveyStats;
  source: SurveyResultSource;
}

// GET /api/v1/surveys/result 성공 응답.
// type은 "전략가형" 같은 사용자 표시용 유형명이다.
export interface SurveyLatestResultResponse {
  survey_id: number;
  type: string;
  stats: SurveyStats;
  created_at: string;
}

// 설문 완료 후 로딩 라우트로 전달하는 클라이언트 상태.
// 건너뛴 문항은 answers에 포함하지 않는다.
export interface SurveyAnalysisNavigationState {
  answers: SurveySubmitAnswer[];
  totalQuestions: number;
}

export interface SurveyRecommendationGame {
  game_id: number;
  name: string;
  image_url: string;
  genres: string[];
  score: number;
  reason: string;
}

export interface SurveyRecommendationsResponse {
  recommendation_items_id: number;
  games: SurveyRecommendationGame[];
}

// MSW와 서비스에서 공통으로 쓰는 에러 응답 형태.
export interface SurveyErrorResponse {
  error: string;
}
