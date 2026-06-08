// persona = 모델 교체가 아니라 시스템 프롬프트(말투/성격) 분기. promptVersion에 묶인다.
// MVP: default 1개만. genre/tag 기반 선택 규칙은 AI-FE-002 확장 AC,
// 태그별 프롬프트 세트 제작·한국어 톤 검증은 후속(spec §11).

export const PERSONA_VERSION = 'p1';

export interface Persona {
  id: string;
  systemPrompt: string;
}

export const DEFAULT_PERSONA: Persona = {
  id: 'default',
  // 한국어 대사. 과장 없이 게임을 친근하게 소개하는 가이드 톤.
  systemPrompt:
    '너는 게임을 소개하는 친근한 한국어 캐릭터다. 제공된 분석 신호만 근거로, ' +
    '과장이나 없는 사실 추가 없이 핵심을 짧고 생동감 있게 말한다.',
};

// genre/tag → persona 선택. 지금은 항상 default(매칭 규칙은 AI-FE-002 확장 AC에서 추가).
export function getPersona(_genre?: string, _tags?: string[]): Persona {
  return DEFAULT_PERSONA;
}
