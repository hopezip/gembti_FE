import type {
  SurveyLatestResultResponse,
  SurveyQuestionsResponse,
  SurveyRecommendationsResponse,
  SurveyStats,
  SurveySubmitAnswer,
  SurveySubmitResponse,
  SurveyTraitKey,
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

const questionTraits: Record<number, SurveyTraitKey[]> = {
  1: ['exploration'],
  2: ['combat'],
  3: ['growth'],
  4: ['strategy'],
  5: ['healing'],
  6: ['cooperation'],
  7: ['growth', 'strategy'],
};

const traitNames: Record<SurveyTraitKey, string> = {
  combat: '액션가형',
  strategy: '전략가형',
  cooperation: '협동가형',
  exploration: '탐험가형',
  growth: '성장가형',
  healing: '힐링가형',
};

const recommendationGames: Record<
  SurveyTraitKey,
  SurveyRecommendationsResponse['games'][number]
> = {
  exploration: {
    game_id: 301,
    name: 'ELDEN RING',
    image_url: 'https://picsum.photos/seed/survey-exploration/640/400',
    genres: ['RPG', '오픈월드'],
    score: 0,
    reason: '',
  },
  combat: {
    game_id: 302,
    name: 'SEKIRO: SHADOWS DIE TWICE',
    image_url: 'https://picsum.photos/seed/survey-combat/640/400',
    genres: ['액션', '어드벤처'],
    score: 0,
    reason: '',
  },
  growth: {
    game_id: 303,
    name: 'HADES',
    image_url: 'https://picsum.photos/seed/survey-growth/640/400',
    genres: ['로그라이크', '액션'],
    score: 0,
    reason: '',
  },
  healing: {
    game_id: 304,
    name: 'STARDEW VALLEY',
    image_url: 'https://picsum.photos/seed/survey-healing/640/400',
    genres: ['시뮬레이션', '힐링'],
    score: 0,
    reason: '',
  },
  cooperation: {
    game_id: 305,
    name: 'IT TAKES TWO',
    image_url: 'https://picsum.photos/seed/survey-cooperation/640/400',
    genres: ['협동', '어드벤처'],
    score: 0,
    reason: '',
  },
  strategy: {
    game_id: 306,
    name: 'CIVILIZATION VI',
    image_url: 'https://picsum.photos/seed/survey-strategy/640/400',
    genres: ['전략', '턴제'],
    score: 0,
    reason: '',
  },
};

const traitLabels: Record<SurveyTraitKey, string> = {
  combat: '액션',
  strategy: '전략',
  cooperation: '협동',
  exploration: '탐험',
  growth: '성장',
  healing: '힐링',
};

export function createMockSurveyRecommendations(
  stats: SurveyStats,
): SurveyRecommendationsResponse {
  const games = (Object.keys(stats) as SurveyTraitKey[])
    .filter((trait) => stats[trait] > 0)
    .sort((left, right) => stats[right] - stats[left])
    .slice(0, 4)
    .map((trait) => ({
      ...recommendationGames[trait],
      score: stats[trait] / 100,
      reason: `${traitLabels[trait]} ${stats[trait]} 일치 · 설문 성향 기반 추천`,
    }));

  return { recommendation_items_id: 1, games };
}

export function createMockSurveyResult(answers: SurveySubmitAnswer[]) {
  const totals = Object.fromEntries(
    Object.keys(MOCK_SURVEY_STATS).map((trait) => [trait, 0]),
  ) as SurveyStats;
  const counts = { ...totals };

  answers.forEach(({ question_id, answer }) => {
    questionTraits[question_id]?.forEach((trait) => {
      totals[trait] += (answer - 1) * 25;
      counts[trait] += 1;
    });
  });

  const stats = Object.fromEntries(
    Object.keys(totals).map((trait) => {
      const key = trait as SurveyTraitKey;
      return [key, counts[key] ? Math.round(totals[key] / counts[key]) : 0];
    }),
  ) as SurveyStats;
  const primaryTrait = (Object.keys(stats) as SurveyTraitKey[]).reduce(
    (highest, trait) => (stats[trait] > stats[highest] ? trait : highest),
    'exploration',
  );

  return {
    latest: {
      survey_id: 1,
      type: traitNames[primaryTrait],
      stats,
      created_at: new Date().toISOString(),
    } satisfies SurveyLatestResultResponse,
    submit: {
      survey_id: 1,
      stats,
      source: 'ONLY_SURVEY',
    } satisfies SurveySubmitResponse,
  };
}
