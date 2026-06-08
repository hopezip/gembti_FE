import { z } from 'zod';

// ── Live2D 재생 키 (임시 enum) ─────────────────────────────
// ⚠️ 임시값. Live2D 모델(.model3.json)의 Expressions/Motions 키 확정 시(AI-FE-003) 이 배열만 교체한다.
// 'neutral'/'none'은 미매핑 폴백 기본값이라 반드시 유지한다.
export const LIVE2D_EMOTIONS = [
  'neutral',
  'excited',
  'happy',
  'worried',
  'angry',
  'sad',
] as const;
export const LIVE2D_GESTURES = [
  'none',
  'point',
  'headTilt',
  'wave',
  'nod',
] as const;

export const Live2dEmotionEnum = z.enum(LIVE2D_EMOTIONS);
export const Live2dGestureEnum = z.enum(LIVE2D_GESTURES);

// ── 분석 산출물(리뷰 신호) — emotion/gesture와 다른 레이어 ──
export const AnalysisSchema = z.object({
  positive: z.array(z.string()).max(8),
  negative: z.array(z.string()).max(8),
  // 장르 톤(예: 'hardcore' | 'cozy' ...). LLM 자유 추출, 엄격 분류는 후속.
  genreTone: z.string(),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

// ── 스크립트 라인 ──
export const ScriptLineSchema = z.object({
  lineId: z.string(),
  // 말풍선 UI 가드 — 너무 긴 대사 차단.
  text: z.string().min(1).max(200),
  // 모델 키 1:1 enum → LLM이 없는 표정/모션을 뱉어 재생이 깨지는 것을 차단.
  emotion: Live2dEmotionEnum,
  gesture: Live2dGestureEnum,
  // LLM이 생성하지 않음(환각 방지). 프론트가 글자수로 파생, 후일 TTS 길이로 대체.
  durationMs: z.number().optional(),
});
export type ScriptLine = z.infer<typeof ScriptLineSchema>;

export const ScriptSchema = z.array(ScriptLineSchema).min(1).max(12);

// ── 최종 응답 계약 (전체 script[]를 한 번에 반환 → 프론트 순차 재생) ──
export const ExplainResponseSchema = z.object({
  appid: z.number(),
  persona: z.string(),
  analysis: AnalysisSchema,
  script: ScriptSchema,
});
export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;
