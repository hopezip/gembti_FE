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
    question_text:
      '새로운 게임을 고를 때 검증된 인기작보다 낯선 경험을 먼저 찾는다',
    stat_axis: 'exploration',
    display_order: 1,
  },
  {
    question_id: 2,
    question_text: '플레이 중에는 빠른 판단과 손맛이 있는 순간에 가장 몰입한다',
    stat_axis: 'combat',
    display_order: 2,
  },
  {
    question_id: 3,
    question_text: '스트레스 없이 즐기는데도 적을 휘어잡는 성장을 선호한다',
    stat_axis: 'growth',
    display_order: 3,
  },
  {
    question_id: 4,
    question_text: '게임의 규칙을 파악하고 최적의 전략을 찾는 과정이 즐겁다',
    stat_axis: 'strategy',
    display_order: 4,
  },
  {
    question_id: 5,
    question_text: '캐릭터와 세계관의 이야기가 오래 기억나는 게임을 좋아한다',
    stat_axis: 'healing',
    display_order: 5,
  },
  {
    question_id: 6,
    question_text: '친구와 협력하거나 경쟁하며 생기는 변수를 즐기는 편이다',
    stat_axis: 'cooperation',
    display_order: 6,
  },
  {
    question_id: 7,
    question_text:
      '수집, 업적, 장비 강화처럼 완성도를 채워가는 플레이에 끌린다',
    stat_axis: 'growth',
    display_order: 7,
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
  user_stats_id: 1,
  stats: MOCK_SURVEY_STATS,
  source_type: 'ONLY_SURVEY',
  survey_mode: 'standard',
};

// GET /api/v1/surveys/result 성공 mock.
export const MOCK_SURVEY_LATEST_RESULT: SurveyLatestResultResponse = {
  user_stats_id: 1,
  stats: MOCK_SURVEY_STATS,
  source_type: 'ONLY_SURVEY',
  survey_mode: 'standard',
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

const recommendationGames: Record<
  SurveyTraitKey,
  SurveyRecommendationsResponse['games'][number]
> = {
  exploration: {
    recommendation_item_id: 1,
    game_id: 301,
    title: 'ELDEN RING',
    image_url: 'https://picsum.photos/seed/survey-exploration/640/400',
    genres: ['RPG', '오픈월드'],
    rating: 4.8,
    similarity_score: 0,
    similarity_rank: 0,
  },
  combat: {
    recommendation_item_id: 2,
    game_id: 302,
    title: 'SEKIRO: SHADOWS DIE TWICE',
    image_url: 'https://picsum.photos/seed/survey-combat/640/400',
    genres: ['액션', '어드벤처'],
    rating: 4.7,
    similarity_score: 0,
    similarity_rank: 0,
  },
  growth: {
    recommendation_item_id: 3,
    game_id: 303,
    title: 'HADES',
    image_url: 'https://picsum.photos/seed/survey-growth/640/400',
    genres: ['로그라이크', '액션'],
    rating: 4.9,
    similarity_score: 0,
    similarity_rank: 0,
  },
  healing: {
    recommendation_item_id: 4,
    game_id: 304,
    title: 'STARDEW VALLEY',
    image_url: 'https://picsum.photos/seed/survey-healing/640/400',
    genres: ['시뮬레이션', '힐링'],
    rating: 4.9,
    similarity_score: 0,
    similarity_rank: 0,
  },
  cooperation: {
    recommendation_item_id: 5,
    game_id: 305,
    title: 'IT TAKES TWO',
    image_url: 'https://picsum.photos/seed/survey-cooperation/640/400',
    genres: ['협동', '어드벤처'],
    rating: 4.8,
    similarity_score: 0,
    similarity_rank: 0,
  },
  strategy: {
    recommendation_item_id: 6,
    game_id: 306,
    title: 'CIVILIZATION VI',
    image_url: 'https://picsum.photos/seed/survey-strategy/640/400',
    genres: ['전략', '턴제'],
    rating: 4.6,
    similarity_score: 0,
    similarity_rank: 0,
  },
};

export function createMockSurveyRecommendations(
  stats: SurveyStats,
): SurveyRecommendationsResponse {
  const games = (Object.keys(stats) as SurveyTraitKey[])
    .filter((trait) => stats[trait] > 0)
    .sort((left, right) => stats[right] - stats[left])
    .slice(0, 4)
    .map((trait, index) => ({
      ...recommendationGames[trait],
      similarity_score: stats[trait] / 100,
      similarity_rank: index + 1,
    }));

  return { games };
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
  return {
    latest: {
      user_stats_id: 1,
      stats,
      source_type: 'ONLY_SURVEY',
      survey_mode: 'standard',
      created_at: new Date().toISOString(),
    } satisfies SurveyLatestResultResponse,
    submit: {
      user_stats_id: 1,
      stats,
      source_type: 'ONLY_SURVEY',
      survey_mode: 'standard',
    } satisfies SurveySubmitResponse,
  };
}
