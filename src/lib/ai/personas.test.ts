import { describe, expect, it } from 'vitest';
import { DEFAULT_PERSONA, getPersona, PERSONA_VERSION } from './personas';

describe('getPersona', () => {
  it('미지정 시 default 반환', () => {
    expect(getPersona().id).toBe(DEFAULT_PERSONA.id);
  });

  it('매칭 규칙 미구현 단계 — 어떤 genre/tag든 default로 폴백', () => {
    expect(getPersona('Souls-like', ['hardcore']).id).toBe(DEFAULT_PERSONA.id);
  });

  it('persona는 systemPrompt 텍스트를 가진다(말투/성격 분기)', () => {
    expect(DEFAULT_PERSONA.systemPrompt.length).toBeGreaterThan(0);
  });

  it('PERSONA_VERSION은 캐시 키 구성요소라 정의돼 있다', () => {
    expect(typeof PERSONA_VERSION).toBe('string');
  });
});
