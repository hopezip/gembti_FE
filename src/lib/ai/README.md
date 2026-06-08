# src/lib/ai — AI 게임 설명 파이프라인 (서버 전용)

게임 상세의 **[AI 설명]** 을 처리하는 BFF 로직. **모두 서버에서만** 실행한다(LLM/외부 호출 키 비노출, `NEXT_PUBLIC_` 금지).

## 파일

- `steam.ts` — 외부 Steam 공개 API(`appdetails`/`appreviews`) fetch + 리뷰 샘플링/정규화.
  ⚠️ `src/mocks/handlers/steam.ts`(백엔드 sync-status/link mock)와 **무관**.
- `personas.ts` — 시스템 프롬프트(말투/성격) 분기. MVP는 default 1개.
- `model.ts` — env 모델 해석 + `generateText`+`Output.object` 래퍼 + fallback. *(AI-FE-002)*
- `analyze.ts` / `script.ts` — LLM 2단계(분석→스크립트). model을 주입받아 mock으로 테스트. *(AI-FE-002)*
- `cache.ts` — Runtime Cache(비내구성) + 캐시 키/버전. *(AI-FE-002)*

스키마는 `src/lib/schemas/ai.ts`(Live2D 임시 enum 포함).

## 참조

- 설계 SSOT: `docs/superpowers/specs/2026-06-08-ai-feature-phasing-design.md`
- 구현 계획: `docs/superpowers/plans/2026-06-08-ai-game-explainer.md`
- 티켓: AI-FE-001(토대+Steam fetch) · AI-FE-002(파이프라인+캐싱) · AI-FE-003(프론트 재생)
