import { describe, expect, it } from 'vitest';
import { ExplainResponseSchema, LIVE2D_EMOTIONS, ScriptLineSchema } from './ai';

describe('ScriptLineSchema', () => {
  it('모델 보유 emotion/gesture는 통과', () => {
    const line = {
      lineId: 'l1',
      text: '안녕',
      emotion: 'excited',
      gesture: 'point',
    };
    expect(ScriptLineSchema.parse(line)).toEqual(line);
  });

  it('enum에 없는 emotion은 거부(LLM 헛값 차단)', () => {
    const bad = {
      lineId: 'l1',
      text: '안녕',
      emotion: 'sleepy',
      gesture: 'point',
    };
    expect(() => ScriptLineSchema.parse(bad)).toThrow();
  });

  it('text는 200자 초과 시 거부(말풍선 가드)', () => {
    const bad = {
      lineId: 'l1',
      text: 'a'.repeat(201),
      emotion: 'neutral',
      gesture: 'none',
    };
    expect(() => ScriptLineSchema.parse(bad)).toThrow();
  });

  it('durationMs는 optional(LLM 비생성)', () => {
    const line = {
      lineId: 'l1',
      text: '안녕',
      emotion: 'neutral',
      gesture: 'none',
    };
    expect(ScriptLineSchema.parse(line).durationMs).toBeUndefined();
  });

  it('neutral은 항상 유효한 폴백 값', () => {
    expect(LIVE2D_EMOTIONS).toContain('neutral');
  });
});

describe('ExplainResponseSchema', () => {
  it('appid+persona+analysis+script 구조 통과', () => {
    const r = {
      appid: 1245620,
      persona: 'default',
      analysis: {
        positive: ['타격감'],
        negative: ['진입장벽'],
        genreTone: 'hardcore',
      },
      script: [
        { lineId: 'l1', text: '이 게임은', emotion: 'excited', gesture: 'point' },
      ],
    };
    expect(ExplainResponseSchema.parse(r)).toEqual(r);
  });
});
