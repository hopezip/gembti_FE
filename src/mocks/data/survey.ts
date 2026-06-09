import type {
  SurveyLatestResultResponse,
  SurveyQuestionsResponse,
  SurveyStats,
  SurveySubmitResponse,
} from '@/features/survey/api/types';

// 설문 진행 화면 문항 mock.
// 기존 SurveyQuestionSection 내부에 있던 임시 문항을 API 응답 형태로 이동했다.
// question은 화면에서 강조 문구를 계산할 수 있도록 기존 문장을 한 문자열로 합쳤다.
export const MOCK_SURVEY_QUESTIONS: SurveyQuestionsResponse = [
  {
    question_id: 1,
    question: '새로운 게임을 고를 때 검증된 인기작보다 낯선 경험을 먼저 찾는다',
    options: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  },
  {
    question_id: 2,
    question: '플레이 중에는 빠른 판단과 손맛이 있는 순간에 가장 몰입한다',
    options: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  },
  {
    question_id: 3,
    question: '스트레스 없이 즐기는데도 적을 휘어잡는 성장을 선호한다',
    options: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  },
  {
    question_id: 4,
    question: '게임의 규칙을 파악하고 최적의 전략을 찾는 과정이 즐겁다',
    options: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  },
  {
    question_id: 5,
    question: '캐릭터와 세계관의 이야기가 오래 기억나는 게임을 좋아한다',
    options: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  },
  {
    question_id: 6,
    question: '친구와 협력하거나 경쟁하며 생기는 변수를 즐기는 편이다',
    options: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  },
  {
    question_id: 7,
    question: '수집, 업적, 장비 강화처럼 완성도를 채워가는 플레이에 끌린다',
    options: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  },
];

// submit/result mock이 공유하는 계산 완료 스탯.
// 실제 백엔드는 답변 기반으로 계산하지만, MSW는 화면 흐름 확인용 고정값을 반환한다.
export const MOCK_SURVEY_STATS: SurveyStats = {
  combat: 70,
  strategy: 60,
  cooperation: 50,
  exploration: 80,
  growth: 65,
  healing: 40,
};

// POST /api/v1/surveys/submit 성공 mock.
export const MOCK_SURVEY_SUBMIT_RESULT: SurveySubmitResponse = {
  survey_id: 1,
  stats: MOCK_SURVEY_STATS,
  source: 'ONLY_SURVEY',
};

// GET /api/v1/surveys/result 성공 mock.
export const MOCK_SURVEY_LATEST_RESULT: SurveyLatestResultResponse = {
  survey_id: 1,
  type: '전략가형',
  stats: MOCK_SURVEY_STATS,
  created_at: '2026-06-08T12:00:00+09:00',
};
