# AI 게임 설명(Live2D) 기능 — 단계 분해 설계 (SSOT)

> 작성일: 2026-06-08 · 상태: 합의안 · 출처: `docs/logs/2026-06-08-ai-sdk-plan.md` 기획 확정안 + 기존 단일 티켓 `AI-FE-001`
> 역할: AI 기능을 **3개 티켓으로 분해**한 단계 구조와 **공통 설계 결정의 SSOT**. 각 티켓은 이 문서를 참조한다(티켓은 gitignore, 이 문서는 commit 대상).

---

## 1. 목적 · 배경

게임 유저용 AI 추천 서비스 GamBTI의 2차 기능. Steam 데이터·리뷰를 AI가 분석해, **Live2D 캐릭터**가 대사·표정·몸짓으로 게임을 소개한다.

기존에는 모든 작업(Task 0~7 + 미정 3개)이 단일 거대 티켓 `AI-FE-001`에 들어 있었다. 풀팀 PR 흐름(티켓당 리뷰 단위)에 맞게 **3개 티켓 + 자산 게이트**로 재편한다.

핵심 발견(2026-06-08 현황 조사):
- AI 서버 자리: `src/app/api/ai/health/route.ts` **헬스체크만** 존재(주석은 1차 "LangChain" 표현 그대로 → 정정 필요).
- 게임 상세 페이지: ✅ 구현됨(`GameDetailPage.tsx`, `GameDetailHero`, `GameInfoTable`) → 프론트 통합 전제 충족.
- `ai`(Vercel AI SDK) 미설치, `zod ^3.25.0`(→ `^3.25.76↑` 정렬 필요), **Live2D 자산 repo에 없음**, Steam fetch 코드 없음.

---

## 2. 전체 구조

```
Phase 0 ─ 토대 (별도 티켓 없이 AI-FE-001에 흡수)
Phase 1 ─ 백엔드 파이프라인 ─┬─ AI-FE-001  토대 + Steam fetch
                            └─ AI-FE-002  analyze + script + 캐싱
        ───────── [Live2D 자산 확보 게이트] ─────────
Phase 2 ─ 프론트 재생 ────────  AI-FE-003  [AI 설명] 버튼 + Live2D 재생
```

- **의존 순서**: `AI-FE-001 → AI-FE-002 → (자산 게이트) → AI-FE-003`
- **자산 게이트**: Live2D 모델 자산이 아직 없음(확보 시점 미정). 001·002는 **임시 enum**으로 자산 없이 완주 가능. 003만 게이트에 막힌다.
- **임시 enum 단일 출처**: emotion/gesture enum을 한 파일에 모아 두고, 자산 확보 후 003에서 **실제 모델 키로 교체**한다(교체 지점 1곳).

---

## 3. 티켓별 스코프

### AI-FE-001 — 토대 + Steam fetch (분기: cross)
- 의존성: **`ai@^6`**(Vercel AI SDK 6) 설치, `zod` `^3.25.76↑` 정렬
- env: 모델(AI Gateway) 키 + Steam 키 (`.env.local.example` 갱신, 클라이언트 비노출)
- Zod 스키마: `AnalysisSchema`, `ScriptSchema(ScriptLineSchema)`, **emotion/gesture 임시 enum 단일 파일**
- persona 레지스트리 골격: genre→persona 매핑 구조 + **default persona 1개(MVP 필수 — 이것만 있으면 통과)**
- Steam fetch 레이어: `appdetails`(설명·태그·장르) + `appreviews`(긍/부정/helpful 샘플링) DTO 고정
- **선행조건(appid 매핑)** ⚠️: 현재 `GameDetail`엔 `game_id`만 있고 **`steam_appid` 없음**(`src/features/game/api/gameDetail.ts`). `gameId === steam_appid`인지 백엔드 확인 필요. 아니면 백엔드가 `steam_appid` 필드를 내려줘야 함 — 미충족 시 AI 버튼 비활성.
- health route 주석 정정("LangChain 서버 자리" → "AI SDK BFF")
- **AC**: Steam fetch가 appid→정규화 DTO 반환 / 스키마가 type-check 통과 / 키 클라이언트 미노출

### AI-FE-002 — analyze + script + 캐싱 (분기: cross)
- LLM 호출 ① `generateText` + `Output.object({ schema: AnalysisSchema })` — 리뷰 → 긍/부정/genreTone
- LLM 호출 ② `generateText` + `Output.object({ schema: ScriptSchema })` — 분석+게임데이터+persona → script[]
- 2단계 캐싱: `analysis = appid + 리뷰스냅샷해시 + promptVersion`, `script = appid + persona + analysisVersion + promptVersion`
- fallback 모델(동일 Zod 스키마) + 에러 폴백(§5)
- 엔드포인트: `POST /api/ai/explain` (analyze/script 내부 분리 가능)
- **AC**: appid→구조화 JSON / ScriptSchema 통과(emotion·gesture enum 내) / fallback 동작 / 같은 (appid,persona) 캐시 적중 / 리뷰 샘플 긍·부정·helpful 혼합
- **확장 AC(선택)**: Steam genre/tag 기반 **persona 선택 규칙**(genre/tag → persona 매핑). 매칭 실패 시 default persona로 폴백. (프롬프트 세트 실제 제작은 후속 §11.)

### AI-FE-003 — 프론트 재생 (분기: cross) ⚠️ 자산 게이트
- 게임 상세에 `[AI 설명]` 버튼
- Live2D 렌더러 도입(라이브러리 선정은 착수 시점: pixi-live2d-display vs Cubism SDK)
- script[] 순차 재생 + emotion 동기화(gesture는 차후), 말풍선 텍스트
- 임시 enum → **실제 모델 표정/모션 키로 교체**
- **AC**: 실제 appid로 스크립트 생성→Live2D 재생 눈대조(데스크탑 다크) / 미매핑 emotion은 neutral 폴백

---

## 4. 공통 설계 결정 (SSOT — 모든 티켓 공통)

- **라이브러리**: Vercel AI SDK **6** — `generateText/streamText` + `Output.object({ schema })` + Zod. (`generateObject`/`streamObject`는 SDK 6에서 **deprecated**라 미사용 — 공식 migration guide: "removed in a future version".) LangChain 미채택(선형 파이프라인이라 에이전트/RAG/체인 불필요, 타입 계약·디버깅 이점).
- **2단계 분리**: 분석 ≠ 스크립트. 분석은 persona 무관 → persona만 바꿔도 분석 재사용.
- **감정 2레이어**: `positive/negative`(리뷰 분석 신호) ≠ `emotion/gesture`(Live2D 재생 키, Zod enum). 혼동 금지.
- **`durationMs`는 LLM 비생성**(환각 방지). 프론트가 text 길이로 파생, 후일 TTS 길이로 대체. 계약엔 optional.
- **`text` 최대 길이 제한**(말풍선 UI 깨짐 방지).
- **모델명 하드코딩 금지**: 모델은 **env `AI_PRIMARY_MODEL` / `AI_FALLBACK_MODELS`** 로 제어(코드 상수 금지). "Flash 계열 1순위 + 동일 schema fallback" 추상 기술, 구현 시점 Gateway 카탈로그 재확인. (AI Gateway model fallbacks 활용.)
- **`promptVersion`/`analysisVersion`**: 프롬프트·스키마 변경 시 버전 문자열만 올려 옛 캐시 자동 폐기.
- **persona**: 모델 교체가 아니라 시스템 프롬프트(말투/성격) 분기. promptVersion에 묶임. **3단계 확장** — ① MVP: default 1개 필수(AI-FE-001) → ② genre/tag 기반 선택 규칙(AI-FE-002 확장 AC) → ③ 태그별 프롬프트 세트 제작·한국어 톤 검증(후속 §11).

---

## 5. 에러 · 폴백 (AI-FE-002·003)

| 실패 지점 | 처리 |
|---|---|
| LLM 스키마 불일치 | `Output.object` 검증 실패 감지 → 내부 retry/repair 정책 + fallback 래퍼 적용 → 반복 실패 시 "설명 생성 실패" + 재시도 버튼 |
| 1순위 모델 오류/한도 | AI Gateway fallback 모델(동일 Zod 스키마) 자동 전환 |
| Steam 실패/리뷰 없음 | 리뷰 없으면 설명·태그만 축약 분석. appdetails 실패 시 버튼 disabled |
| 미매핑 emotion/gesture | enum 강제로 1차 차단, 방어적으로 `neutral`/기본 모션 폴백 |
| 캐시 미스/장애 | 첫 호출만 느림. 저장소 장애 시 캐시 우회 직접 호출 |

---

## 6. 미정 → 추천값 (각 티켓 "구현 전 확정"으로 표시)

1. **캐시 저장소** → **Vercel Runtime Cache**(regional·**비내구성**: eviction/장애 시 재생성 허용. 태그 무효화로 promptVersion 폐기 용이). ⚠️ "영속 캐시" 아님 — 캐시 미스는 첫 호출만 느릴 뿐 정상. 캐시 **영속성**이 요구되면 Upstash Redis로 승격. — AI-FE-002
2. **리뷰 샘플** → 긍정 5 + 부정 5 + helpful 5 = **15개**, 리뷰당 **~400자 절단**(토큰 가드). — AI-FE-001/002
3. **모델 비용 경로** → 기본 **AI Gateway `provider/model` 문자열**(1순위 `google/gemini-2.5-flash-lite` + fallback). 데모 0원이 중요하면 BYOK(Google 키 직결)을 env 토글로. — AI-FE-002

---

## 7. 진행 로드맵

| 순서 | 티켓 | 브랜치 | 게이트 | 비고 |
|---|---|---|---|---|
| 1 | AI-FE-001 | `feature/AI-FE-001-…` | 없음 | 기존 단일 티켓을 이 스코프로 **축소 재작성** |
| 2 | AI-FE-002 | `feature/AI-FE-002-…` | 001 머지 후 | 백엔드 파이프라인 완성 = 데모 가능(JSON) |
| — | **자산 게이트** | — | Live2D 모델 확보 | 확보 전까지 003 보류 |
| 3 | AI-FE-003 | `feature/AI-FE-003-…` | 자산 + 002 | 프론트 재생, 임시 enum 교체 |

- 각 티켓: 브랜치 생성(git-branching) → 구현 → 검증 전수 → PR(본인 머지 금지·1명 승인) → dev 머지.
- 풀팀 모드라 3개 모두 cross 풀 흐름(API 계약·env·공통 스키마·서버 런타임 포함).

---

## 8. 기존 `AI-FE-001` 티켓 재편

- 현재 단일 거대 티켓을 **새 AI-FE-001(토대+Steam fetch)로 축소 재작성**.
- 나머지 내용을 **AI-FE-002 / AI-FE-003 신규 티켓**으로 분리.
- 공통 설계 결정(§4·§5)은 이 문서를 SSOT로 두고 각 티켓이 짧게 참조(중복 최소화).
- 티켓 파일은 gitignore(`docs/tickets/**/*.md`)라 자유 재작성 가능.

---

## 9. 외부 리뷰 반영 이력 (2026-06-08, 5건 검증 후 수용)

1. **AI SDK 버전** → `ai@^6` + `generateText`+`Output.object`. (`generateObject` deprecated 확인 — 공식 migration guide.) §3·§4 갱신.
2. **캐시 내구성** → Runtime Cache는 regional·비내구성으로 명시("영속" 표현 제거). 영속 필요 시 Upstash. §6 갱신.
3. **gameId↔appid** → AI-FE-001 선행조건으로 명시(`steam_appid` 부재 확인 — `gameDetail.ts`). §3 갱신.
4. **에러 문구** → "SDK 재시도" → "검증 실패 감지 → retry/repair + fallback 래퍼". §5 갱신.
5. **모델명 제어** → env `AI_PRIMARY_MODEL`/`AI_FALLBACK_MODELS` 명시. §4·§6 갱신.

## 10. 다음 액션

1. 이 설계 문서 사용자 리뷰(반영본 확인).
2. (승인 시) `writing-plans`로 **전체 구현 계획서**(3 티켓 통합) 작성 → 착수.

---

## 11. 후속 (MVP 밖, 별도 티켓)

- **태그별 persona 프롬프트 세트 제작 + 한국어 톤 검증**: Steam genre/tag별 말투·성격 시스템 프롬프트를 실제로 작성하고, **한국어 리뷰 샘플로 톤 품질 검증**(특히 fallback 모델이 한국어 대사를 자연스럽게 뽑는지). AI-FE-002의 genre/tag→persona 선택 규칙이 가리킬 실제 콘텐츠. promptVersion에 묶임.
- **TTS/음성 톤, 립싱크**(기획서 추가기능). `durationMs`를 글자수 파생 → 실제 오디오 길이로 대체.
- **다중 persona 본격 확장**(default 1개 → N개).
