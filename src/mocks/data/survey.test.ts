import { describe, expect, it } from 'vitest';
import {
  createMockSurveyRecommendations,
  createMockSurveyResult,
} from './survey';

describe('createMockSurveyResult', () => {
  it('건너뛴 문항을 제외하고 제출된 응답만 성향 점수에 반영한다', () => {
    const result = createMockSurveyResult([
      { question_id: 1, answer: 5 },
      { question_id: 2, answer: 3 },
      { question_id: 6, answer: 1 },
    ]);

    expect(result.submit.stats).toEqual({
      combat: 50,
      strategy: 0,
      cooperation: 0,
      exploration: 100,
      growth: 0,
      healing: 0,
    });
    expect(result.latest.type).toBe('탐험가형');
  });

  it('0점 성향을 제외하고 점수가 높은 순서로 최대 4개를 추천한다', () => {
    const result = createMockSurveyRecommendations({
      combat: 50,
      strategy: 25,
      cooperation: 5,
      exploration: 100,
      growth: 75,
      healing: 10,
    });

    expect(result.games).toHaveLength(4);
    expect(result.games.map((game) => game.game_id)).toEqual([
      301, 303, 302, 306,
    ]);
  });

  it('양수 성향이 2개면 추천 게임도 2개만 생성한다', () => {
    const result = createMockSurveyRecommendations({
      combat: 25,
      strategy: 0,
      cooperation: 0,
      exploration: 75,
      growth: 0,
      healing: 0,
    });

    expect(result.games.map((game) => game.game_id)).toEqual([301, 302]);
    expect(result.games.every((game) => game.score > 0)).toBe(true);
  });
});
