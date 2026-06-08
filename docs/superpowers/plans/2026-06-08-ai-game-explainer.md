# AI 게임 설명(Live2D) — 전체 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **설계 SSOT:** `docs/superpowers/specs/2026-06-08-ai-feature-phasing-design.md` (이 계획과 충돌 시 spec 우선, 반영 후 둘 다 갱신).
> **티켓 대응:** Phase 1·2 = AI-FE-001, Phase 3·4 = AI-FE-002, Phase 5 = AI-FE-003(게이트). 풀팀 모드라 각 티켓은 별 브랜치/PR(본인 머지 금지).

**Goal:** Steam 게임 데이터·리뷰를 AI(Vercel AI SDK 6)가 분석해, Live2D 캐릭터가 읽을 구조화 스크립트(대사+감정+몸짓)를 생성하는 서버 파이프라인과 프론트 재생을 구축한다.

**Architecture:** Next.js route handler(`src/app/api/ai/*`, `runtime='nodejs'`)를 BFF로 둔다. 서버가 외부 Steam Web API를 호출→정규화→LLM 2단계(analyze→script, 각 `generateText`+`Output.object(Zod)`)→2단계 캐싱→`script[]` 일괄 반환. 프론트는 게임 상세에서 `[AI 설명]` 클릭 시 호출해 Live2D로 순차 재생. 인증·게임 API는 별도 FastAPI 백엔드(공존, 무관).

**Tech Stack:** Next.js App Router, React 19(React Router SPA), TypeScript strict, **Vercel AI SDK 6 (`ai@^6`)**, Zod, Vercel AI Gateway(`provider/model` 문자열+fallback), Vercel Runtime Cache(비내구성), Vitest, pnpm@10.

---

## 선행 게이트 / 전제 (착수 전 확인)

| # | 항목 | 상태 | 차단 대상 |
|---|---|---|---|
| G1 | **gameId ↔ steam_appid 매핑** — `GameDetail`엔 `game_id`만 있음(`src/features/game/api/gameDetail.ts`). `gameId === steam_appid`인지, 아니면 백엔드가 `steam_appid` 필드 제공하는지 백엔드팀 확인 | ❓ 미확인 | Phase 5(프론트), Phase 3 통합 테스트는 임의 appid로 가능 |
| G2 | **Steam 공개 엔드포인트 키 정책** — `appdetails`/`appreviews`는 공개 API(키 불필요)로 알려짐. 서버 호출 시 레이트리밋/지역 파라미터(`cc`,`l`)만 주의. 구현 첫 step에서 1건 실측 | ❓ 실측 필요 | Phase 2 |
| G3 | **ai@^6 실제 export·gateway·mock 시그니처** — `generateText`/`Output.object`/AI Gateway fallback 설정/`ai/test` mock 클래스명을 설치 직후 공식 문서로 확정 | ❓ 설치 후 | Phase 3 |
| G4 | **Live2D 모델 자산·렌더러 라이브러리** — repo에 모델 없음. 자산 확보 + pixi-live2d-display vs Cubism SDK 선정 | ❌ 미확보 | **Phase 5 전체** |

> G1·G2·G3는 해당 Phase 첫 task에서 해소(블로킹 아님, 확인 step 포함). **G4만 Phase 5를 통째로 막는다** → Phase 1~4 먼저 완주.

---

## 파일 구조 (생성/수정 맵)

```
src/lib/schemas/ai.ts            ★생성  Zod: Live2dEmotion/Gesture enum, AnalysisSchema, ScriptLineSchema, ScriptSchema, ExplainResponseSchema
src/lib/schemas/ai.test.ts       ★생성  스키마 단위 테스트
src/lib/ai/personas.ts           ★생성  persona 레지스트리(default 1개) + getPersona(genre,tags)
src/lib/ai/personas.test.ts      ★생성
src/lib/ai/steam.ts              ★생성  외부 Steam Web API fetch + 정규화 DTO + 리뷰 샘플링
src/lib/ai/steam.test.ts         ★생성  (global fetch mock)
src/lib/ai/model.ts              ★생성  env 모델 해석 + generateText+Output.object 래퍼 + fallback
src/lib/ai/model.test.ts         ★생성  (ai/test mock model)
src/lib/ai/analyze.ts            ★생성  분석 단계
src/lib/ai/analyze.test.ts       ★생성
src/lib/ai/script.ts             ★생성  스크립트 단계(persona 주입)
src/lib/ai/script.test.ts        ★생성
src/lib/ai/cache.ts              ★생성  Runtime Cache 래퍼 + 캐시 키 빌더 + 버전 상수
src/lib/ai/cache.test.ts         ★생성  (키 빌더는 순수함수라 단위 테스트)
src/lib/ai/README.md             ★생성  폴더 책임 설명(프로젝트 폴더 README 규칙)
src/app/api/ai/explain/route.ts  ★생성  POST 통합 핸들러
src/app/api/ai/explain/route.test.ts ★생성  (steam/model 모듈 mock)
src/app/api/ai/health/route.ts   ✎수정  주석 "LangChain" → "AI SDK BFF"
.env.local.example               ✎수정  AI_GATEWAY_API_KEY, AI_PRIMARY_MODEL, AI_FALLBACK_MODELS
package.json                     ✎수정  ai@^6, zod 정렬(자동)
--- Phase 5 (G4 해소 후 별도 계획) ---
src/features/game/components/AiExplainButton.tsx   (예정)
src/features/game/components/Live2dStage.tsx        (예정)
```

원칙: 파일 1개 = 책임 1개. LLM 결합부(`model.ts`)와 도메인 로직(`analyze/script`)을 분리해, 도메인 함수는 model을 **주입**받아 mock으로 테스트한다(외부 호출 없는 단위 테스트).

---

# Phase 1 — 토대 (AI-FE-001 전반)

### Task 1: 의존성 설치 + zod 정렬

**Files:** `package.json`(자동 수정)

- [ ] **Step 1: AI SDK 설치**

```bash
pnpm add ai@^6
```

- [ ] **Step 2: zod 정렬 확인** (ai@6는 zod ^3.25↑ 요구)

```bash
pnpm why zod
# zod가 ^3.25.76 이상으로 해석되는지 확인. 아니면:
pnpm add zod@^3.25.76
```

- [ ] **Step 3: 타입체크 통과 확인**

Run: `pnpm type-check`
Expected: PASS (기존 코드 깨짐 없음)

- [ ] **Step 4: 커밋**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(ai): AI-FE-001 Vercel AI SDK 6 도입 + zod 정렬"
```

---

### Task 2: Zod 스키마 + Live2D enum (임시)

**Files:**
- Create: `src/lib/schemas/ai.ts`
- Test: `src/lib/schemas/ai.test.ts`

> enum 값은 **임시**(Live2D 자산 미확보, G4). 단일 파일에 모아 Phase 5에서 실제 모델 키로 교체. `MockSkin` 등 자산이 오면 이 enum만 바꾼다.

- [ ] **Step 1: 실패 테스트 작성**

```ts
// src/lib/schemas/ai.test.ts
import { describe, expect, it } from 'vitest';
import { ScriptLineSchema, ExplainResponseSchema, LIVE2D_EMOTIONS } from './ai';

describe('ScriptLineSchema', () => {
  it('모델 보유 emotion/gesture는 통과', () => {
    const line = { lineId: 'l1', text: '안녕', emotion: 'excited', gesture: 'point' };
    expect(ScriptLineSchema.parse(line)).toEqual(line);
  });

  it('enum에 없는 emotion은 거부(LLM 헛값 차단)', () => {
    const bad = { lineId: 'l1', text: '안녕', emotion: 'sleepy', gesture: 'point' };
    expect(() => ScriptLineSchema.parse(bad)).toThrow();
  });

  it('text는 200자 초과 시 거부(말풍선 가드)', () => {
    const bad = { lineId: 'l1', text: 'a'.repeat(201), emotion: 'neutral', gesture: 'none' };
    expect(() => ScriptLineSchema.parse(bad)).toThrow();
  });

  it('durationMs는 optional(LLM 비생성)', () => {
    const line = { lineId: 'l1', text: '안녕', emotion: 'neutral', gesture: 'none' };
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
      analysis: { positive: ['타격감'], negative: ['진입장벽'], genreTone: 'hardcore' },
      script: [{ lineId: 'l1', text: '이 게임은', emotion: 'excited', gesture: 'point' }],
    };
    expect(ExplainResponseSchema.parse(r)).toEqual(r);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/lib/schemas/ai.test.ts`
Expected: FAIL (`./ai` 모듈 없음)

- [ ] **Step 3: 스키마 구현**

```ts
// src/lib/schemas/ai.ts
import { z } from 'zod';

// ── Live2D 재생 키 (임시 enum) ─────────────────────────────
// ⚠️ 임시값. Live2D 모델(.model3.json)의 Expressions/Motions 키 확정 시(Phase 5) 이 배열만 교체한다.
// 'neutral'/'none'은 미매핑 폴백 기본값이라 반드시 유지한다.
export const LIVE2D_EMOTIONS = ['neutral', 'excited', 'happy', 'worried', 'angry', 'sad'] as const;
export const LIVE2D_GESTURES = ['none', 'point', 'headTilt', 'wave', 'nod'] as const;

export const Live2dEmotionEnum = z.enum(LIVE2D_EMOTIONS);
export const Live2dGestureEnum = z.enum(LIVE2D_GESTURES);

// ── 분석 산출물(리뷰 신호) — emotion/gesture와 다른 레이어 ──
export const AnalysisSchema = z.object({
  positive: z.array(z.string()).max(8),
  negative: z.array(z.string()).max(8),
  genreTone: z.string(), // 예: 'hardcore' | 'cozy' ... LLM 자유 추출(분류는 후속)
});
export type Analysis = z.infer<typeof AnalysisSchema>;

// ── 스크립트 라인 ──
export const ScriptLineSchema = z.object({
  lineId: z.string(),
  text: z.string().min(1).max(200), // 말풍선 UI 가드
  emotion: Live2dEmotionEnum, // 모델 키 1:1 → 헛값 차단
  gesture: Live2dGestureEnum,
  durationMs: z.number().optional(), // LLM 비생성. 프론트가 글자수로 파생, 후일 TTS 길이로 대체
});
export type ScriptLine = z.infer<typeof ScriptLineSchema>;

export const ScriptSchema = z.array(ScriptLineSchema).min(1).max(12);

// ── 최종 응답 계약 ──
export const ExplainResponseSchema = z.object({
  appid: z.number(),
  persona: z.string(),
  analysis: AnalysisSchema,
  script: ScriptSchema,
});
export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/lib/schemas/ai.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/schemas/ai.ts src/lib/schemas/ai.test.ts
git commit -m "feat(ai): AI-FE-001 AI 스키마 + Live2D 임시 enum"
```

---

### Task 3: persona 레지스트리 (default 1개)

**Files:**
- Create: `src/lib/ai/personas.ts`, `src/lib/ai/personas.test.ts`

> MVP는 **default 1개 필수**. `getPersona(genre, tags)`는 매칭 규칙(AI-FE-002 확장 AC)이 들어올 자리지만, 지금은 항상 default 반환. 매칭 실패 폴백 동작을 지금 테스트로 박아 둔다.

- [ ] **Step 1: 실패 테스트**

```ts
// src/lib/ai/personas.test.ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm vitest run src/lib/ai/personas.test.ts`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

```ts
// src/lib/ai/personas.ts
// persona = 모델 교체가 아니라 시스템 프롬프트(말투/성격) 분기. promptVersion에 묶인다.
// MVP: default 1개만. genre/tag 기반 선택 규칙은 AI-FE-002 확장 AC, 실제 프롬프트 세트는 후속(spec §11).

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
```

- [ ] **Step 4: 통과 확인** → Run: `pnpm vitest run src/lib/ai/personas.test.ts` → Expected: PASS
- [ ] **Step 5: 커밋**

```bash
git add src/lib/ai/personas.ts src/lib/ai/personas.test.ts
git commit -m "feat(ai): AI-FE-001 persona 레지스트리(default 1개)"
```

---

### Task 4: 외부 Steam Web API fetch + 정규화

**Files:**
- Create: `src/lib/ai/steam.ts`, `src/lib/ai/steam.test.ts`

> ⚠️ 기존 `src/mocks/handlers/steam.ts`(백엔드 sync-status/link)와 **무관**. 여기는 서버에서 **외부** `store.steampowered.com` 직접 호출. MSW 아님 → 테스트는 `global.fetch` mock.
> G2: appdetails/appreviews는 공개(키 불필요)로 알려짐 — **Step 0에서 1건 실측**해 응답 형태/키 필요 여부 확정 후 정규화 매핑 고정.

- [ ] **Step 0: 실측 확인(G2 해소)**

Run:
```bash
curl -s "https://store.steampowered.com/api/appdetails?appids=1245620&l=korean&cc=kr" | head -c 400
curl -s "https://store.steampowered.com/appreviews/1245620?json=1&language=koreana&num_per_page=20&filter=recent" | head -c 400
```
Expected: appdetails는 `{"1245620":{"success":true,"data":{...}}}`, appreviews는 `{"success":1,"reviews":[...]}`. 키 없이 200이면 키 불필요 확정. (지역 차단/형태 다르면 매핑 조정)

- [ ] **Step 1: 실패 테스트 (정규화 + 샘플링)**

```ts
// src/lib/ai/steam.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchSteamGame, sampleReviews } from './steam';

afterEach(() => vi.restoreAllMocks());

const appdetails = {
  '1245620': {
    success: true,
    data: { name: 'ELDEN RING', short_description: '광활한 액션 RPG',
      genres: [{ description: 'Action' }, { description: 'RPG' }],
      categories: [{ description: 'Single-player' }] },
  },
};
const appreviews = {
  success: 1,
  reviews: [
    { review: '타격감 최고', voted_up: true,  votes_up: 100 },
    { review: '진입장벽 높음', voted_up: false, votes_up: 80 },
    { review: '보스전 명작', voted_up: true,  votes_up: 5 },
  ],
};

describe('sampleReviews', () => {
  it('긍/부정/helpful 혼합으로 뽑고 각 리뷰를 자른다(편향·토큰 가드)', () => {
    const out = sampleReviews(appreviews.reviews, { positive: 1, negative: 1, helpful: 1, maxLen: 5 });
    expect(out.some((r) => r.voted_up)).toBe(true);
    expect(out.some((r) => !r.voted_up)).toBe(true);
    expect(out.every((r) => r.review.length <= 5)).toBe(true);
  });
});

describe('fetchSteamGame', () => {
  it('appdetails+appreviews를 정규화 DTO로 합친다', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url: any) => {
      const body = String(url).includes('appreviews') ? appreviews : appdetails;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    });
    const dto = await fetchSteamGame(1245620);
    expect(dto.name).toBe('ELDEN RING');
    expect(dto.genres).toContain('Action');
    expect(dto.reviews.length).toBeGreaterThan(0);
  });

  it('appdetails success=false면 에러(버튼 비활성 신호)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ '1': { success: false } }), { status: 200 }));
    await expect(fetchSteamGame(1)).rejects.toThrow();
  });

  it('리뷰 없는 게임도 설명/태그만으로 DTO 반환(reviews=[])', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url: any) => {
      const body = String(url).includes('appreviews')
        ? { success: 1, reviews: [] } : appdetails;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    });
    const dto = await fetchSteamGame(1245620);
    expect(dto.reviews).toEqual([]);
  });
});
```

- [ ] **Step 2: 실패 확인** → Run: `pnpm vitest run src/lib/ai/steam.test.ts` → Expected: FAIL

- [ ] **Step 3: 구현** (Step 0 실측에 맞춰 URL/매핑 확정)

```ts
// src/lib/ai/steam.ts
// 서버 전용. 외부 Steam 공개 엔드포인트를 호출해 LLM 입력용 DTO로 정규화한다.
// 리뷰는 '최신 N'만 쓰면 편향 → 긍/부정/helpful 혼합으로 샘플링하고 각 리뷰를 짧게 자른다.

export interface SteamReview { review: string; voted_up: boolean; votes_up: number }
export interface SteamGameDTO {
  appid: number; name: string; description: string;
  genres: string[]; categories: string[];
  reviews: { review: string; voted_up: boolean }[];
  reviewsSnapshotHash: string; // 캐시 키용(리뷰 변하면 분석 무효화)
}

interface SampleOpts { positive: number; negative: number; helpful: number; maxLen: number }

export function sampleReviews(reviews: SteamReview[], opts: SampleOpts) {
  const clip = (r: SteamReview) => ({ review: r.review.slice(0, opts.maxLen), voted_up: r.voted_up });
  const pos = reviews.filter((r) => r.voted_up).slice(0, opts.positive);
  const neg = reviews.filter((r) => !r.voted_up).slice(0, opts.negative);
  const helpful = [...reviews].sort((a, b) => b.votes_up - a.votes_up).slice(0, opts.helpful);
  // 중복 제거(같은 리뷰가 helpful+pos 겹칠 수 있음)
  const seen = new Set<string>();
  return [...pos, ...neg, ...helpful].filter((r) => {
    if (seen.has(r.review)) return false;
    seen.add(r.review);
    return true;
  }).map(clip);
}

// 리뷰 텍스트 집합 → 결정적 해시(캐시 키). 외부 의존 없는 간단 FNV-1a.
function hashReviews(reviews: { review: string }[]): string {
  let h = 0x811c9dc5;
  for (const { review } of reviews) {
    for (let i = 0; i < review.length; i++) { h ^= review.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  }
  return (h >>> 0).toString(16);
}

// 샘플 기본값(spec §6: 긍5/부5/helpful5, 리뷰당 ~400자). 구현 후 토큰 비용 보고 조정.
const SAMPLE = { positive: 5, negative: 5, helpful: 5, maxLen: 400 };

export async function fetchSteamGame(appid: number): Promise<SteamGameDTO> {
  const detailRes = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&l=korean&cc=kr`);
  const detailJson = (await detailRes.json()) as Record<string, { success: boolean; data?: any }>;
  const entry = detailJson[String(appid)];
  if (!entry?.success || !entry.data) throw new Error(`appdetails 실패: appid=${appid}`);

  const reviewRes = await fetch(
    `https://store.steampowered.com/appreviews/${appid}?json=1&language=koreana&num_per_page=100&filter=recent`);
  const reviewJson = (await reviewRes.json().catch(() => ({ reviews: [] }))) as { reviews?: SteamReview[] };
  const sampled = sampleReviews(reviewJson.reviews ?? [], SAMPLE);

  return {
    appid,
    name: entry.data.name,
    description: entry.data.short_description ?? '',
    genres: (entry.data.genres ?? []).map((g: any) => g.description),
    categories: (entry.data.categories ?? []).map((c: any) => c.description),
    reviews: sampled,
    reviewsSnapshotHash: hashReviews(sampled),
  };
}
```

- [ ] **Step 4: 통과 확인** → Run: `pnpm vitest run src/lib/ai/steam.test.ts` → Expected: PASS (5 tests)
- [ ] **Step 5: 커밋**

```bash
git add src/lib/ai/steam.ts src/lib/ai/steam.test.ts
git commit -m "feat(ai): AI-FE-001 외부 Steam fetch + 리뷰 샘플링/정규화"
```

---

### Task 5: env 예시 갱신 + health 주석 정정 + 폴더 README

**Files:**
- Modify: `.env.local.example`, `src/app/api/ai/health/route.ts`
- Create: `src/lib/ai/README.md`

- [ ] **Step 1: `.env.local.example`에 AI 키 추가** (맨 아래)

```bash
# ── AI 게임 설명(AI-FE-001~003) · 서버 전용, 클라이언트 비노출(NEXT_PUBLIC_ 금지) ──
# Vercel AI Gateway. 모델명은 하드코딩하지 않고 env로 제어(spec §4).
AI_GATEWAY_API_KEY=
AI_PRIMARY_MODEL=google/gemini-2.5-flash-lite
AI_FALLBACK_MODELS=google/gemini-2.5-flash
```

- [ ] **Step 2: health route 주석 정정**

`src/app/api/ai/health/route.ts`의 상단 주석을 교체:
```ts
// AI BFF 서버 자리. 1차엔 헬스체크만. 실제 파이프라인은 AI-FE-002(explain).
// Vercel AI SDK(Node API 의존)를 쓰므로 Edge가 아닌 Node 런타임을 명시한다.
export const runtime = 'nodejs';
```
(본문 GET은 그대로)

- [ ] **Step 3: 폴더 README 생성**

```md
# src/lib/ai — AI 게임 설명 파이프라인 (서버 전용)

게임 상세의 [AI 설명]을 처리하는 BFF 로직. **모두 서버에서만** 실행(LLM/외부 호출 키 비노출).

- `steam.ts` — 외부 Steam 공개 API fetch + 리뷰 샘플링/정규화 (기존 mocks/handlers/steam.ts와 무관)
- `personas.ts` — 시스템 프롬프트(말투/성격) 분기. MVP는 default 1개
- `model.ts` — env 모델 해석 + generateText+Output.object 래퍼 + fallback
- `analyze.ts` / `script.ts` — LLM 2단계(분석→스크립트). model 주입받아 테스트
- `cache.ts` — Runtime Cache(비내구성) + 캐시 키/버전

스키마는 `src/lib/schemas/ai.ts`. 설계 SSOT: `docs/superpowers/specs/2026-06-08-ai-feature-phasing-design.md`.
```

- [ ] **Step 4: 검증** → Run: `pnpm type-check && pnpm lint` → Expected: PASS
- [ ] **Step 5: 커밋**

```bash
git add .env.local.example src/app/api/ai/health/route.ts src/lib/ai/README.md
git commit -m "chore(ai): AI-FE-001 env/health 주석/README 정비"
```

> **Phase 1 종료 = AI-FE-001 검증 전수 후 PR.** `pnpm type-check && pnpm lint && pnpm test` → dev 시각 확인 불필요(서버 모듈) → PR(1명 승인).

---

# Phase 2 — LLM 파이프라인 (AI-FE-002 전반)

> **Phase 2 첫 작업 전 G3 해소:** ai@6 공식 문서로 `generateText`/`Output.object` 시그니처, AI Gateway fallback 설정법, `ai/test`의 mock model 클래스명을 확정한다. 아래 코드는 v6 기준 예상 형태이며, 확정 시그니처로 맞춘다.

### Task 6: 모델 래퍼 (env 해석 + Output.object + fallback)

**Files:** Create: `src/lib/ai/model.ts`, `src/lib/ai/model.test.ts`

설계: `generateStructured({ model, system, prompt, schema })`가 1순위 모델 실패 시 fallback 모델로 동일 schema 재시도. 도메인 함수(analyze/script)는 이 함수에 **model 문자열을 주입**받아, 테스트에서 mock model로 대체한다.

- [ ] **Step 1: 실패 테스트** (mock language model — 클래스명 G3 확정값으로)

```ts
// src/lib/ai/model.test.ts
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { MockLanguageModelV2 } from 'ai/test'; // ⚠️ G3: v6 실제 경로/이름 확인
import { generateStructured } from './model';

const schema = z.object({ ok: z.boolean() });

describe('generateStructured', () => {
  it('1순위 모델이 schema 객체를 반환', async () => {
    const primary = new MockLanguageModelV2({
      doGenerate: async () => ({ /* G3: Output.object가 읽는 형태로 채움 */ } as any),
    });
    const out = await generateStructured({ models: [primary], system: 's', prompt: 'p', schema });
    expect(out.ok).toBe(true);
  });

  it('1순위 throw 시 fallback 모델로 전환', async () => {
    const primary = new MockLanguageModelV2({ doGenerate: async () => { throw new Error('limit'); } });
    const fallback = new MockLanguageModelV2({ doGenerate: async () => ({ /* ok:true */ } as any) });
    const out = await generateStructured({ models: [primary, fallback], system: 's', prompt: 'p', schema });
    expect(out.ok).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인** → Run: `pnpm vitest run src/lib/ai/model.test.ts` → Expected: FAIL
- [ ] **Step 3: 구현** (G3 확정 시그니처로)

```ts
// src/lib/ai/model.ts
import { generateText, Output } from 'ai';
import type { z } from 'zod';

// env에서 모델 목록 해석(코드 상수 금지, spec §4). 첫 번째가 1순위, 나머지가 fallback.
export function resolveModels(): string[] {
  const primary = process.env.AI_PRIMARY_MODEL;
  if (!primary) throw new Error('AI_PRIMARY_MODEL 미설정');
  const fallbacks = (process.env.AI_FALLBACK_MODELS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return [primary, ...fallbacks];
}

interface Args<T> { models: (string | unknown)[]; system: string; prompt: string; schema: z.ZodType<T> }

// 모델 목록을 순서대로 시도, schema 검증 통과 결과를 반환. 모두 실패 시 마지막 에러 throw.
export async function generateStructured<T>({ models, system, prompt, schema }: Args<T>): Promise<T> {
  let lastErr: unknown;
  for (const model of models) {
    try {
      const { output } = await generateText({
        model: model as any, // 문자열이면 AI Gateway가 해석(G3 확인)
        system,
        prompt,
        output: Output.object({ schema }),
        // maxRetries 등 repair 정책은 G3 확인 후 옵션 추가
      });
      return output as T;
    } catch (err) { lastErr = err; }
  }
  throw lastErr ?? new Error('generateStructured: 호출 가능한 모델 없음');
}
```

- [ ] **Step 4: 통과 확인** → Expected: PASS (mock 형태는 G3 확정 후 채움)
- [ ] **Step 5: 커밋** → `feat(ai): AI-FE-002 모델 래퍼(Output.object + env fallback)`

---

### Task 7: 분석 단계 (analyze)

**Files:** Create: `src/lib/ai/analyze.ts`, `src/lib/ai/analyze.test.ts`

- [ ] **Step 1: 실패 테스트** (generateStructured를 mock)

```ts
// src/lib/ai/analyze.test.ts
import { describe, expect, it, vi } from 'vitest';
vi.mock('./model', () => ({
  generateStructured: vi.fn(async () => ({ positive: ['타격감'], negative: ['진입장벽'], genreTone: 'hardcore' })),
}));
import { analyzeGame, ANALYSIS_VERSION } from './analyze';
import type { SteamGameDTO } from './steam';

const dto: SteamGameDTO = {
  appid: 1, name: 'X', description: 'd', genres: ['Action'], categories: [],
  reviews: [{ review: '좋음', voted_up: true }], reviewsSnapshotHash: 'abc',
};

describe('analyzeGame', () => {
  it('DTO → AnalysisSchema 통과 객체', async () => {
    const a = await analyzeGame(dto);
    expect(a.positive).toContain('타격감');
  });
  it('ANALYSIS_VERSION 정의(캐시 키 구성요소)', () => {
    expect(typeof ANALYSIS_VERSION).toBe('string');
  });
});
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**

```ts
// src/lib/ai/analyze.ts
import { AnalysisSchema, type Analysis } from '@/lib/schemas/ai';
import { generateStructured, resolveModels } from './model';
import type { SteamGameDTO } from './steam';

export const ANALYSIS_VERSION = 'a1'; // 분석 스키마/프롬프트 변경 시 올림 → 캐시 무효화
export const ANALYSIS_PROMPT_VERSION = 'ap1';

const SYSTEM =
  '너는 게임 리뷰 분석가다. 제공된 리뷰/설명에서 긍정·부정 핵심 신호와 장르 톤만 추출한다. ' +
  '없는 사실을 만들지 말고, 한국어 키워드로 간결히.';

export async function analyzeGame(dto: SteamGameDTO): Promise<Analysis> {
  const prompt = JSON.stringify({
    name: dto.name, description: dto.description, genres: dto.genres,
    reviews: dto.reviews.map((r) => ({ t: r.review, up: r.voted_up })),
  });
  return generateStructured({ models: resolveModels(), system: SYSTEM, prompt, schema: AnalysisSchema });
}
```

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** → `feat(ai): AI-FE-002 분석 단계(analyze)`

---

### Task 8: 스크립트 단계 (script, persona 주입)

**Files:** Create: `src/lib/ai/script.ts`, `src/lib/ai/script.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
// src/lib/ai/script.test.ts
import { describe, expect, it, vi } from 'vitest';
vi.mock('./model', () => ({
  generateStructured: vi.fn(async () => [
    { lineId: 'l1', text: '이 게임은 타격감이 좋아요', emotion: 'excited', gesture: 'point' },
  ]),
}));
import { generateScript } from './script';
import { DEFAULT_PERSONA } from './personas';

describe('generateScript', () => {
  it('분석+persona → ScriptSchema 통과 배열', async () => {
    const script = await generateScript({
      game: { name: 'X', genres: ['Action'], categories: [] } as any,
      analysis: { positive: ['타격감'], negative: [], genreTone: 'hardcore' },
      persona: DEFAULT_PERSONA,
    });
    expect(script[0].emotion).toBe('excited');
  });
});
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**

```ts
// src/lib/ai/script.ts
import { ScriptSchema, type ScriptLine, LIVE2D_EMOTIONS, LIVE2D_GESTURES } from '@/lib/schemas/ai';
import { generateStructured, resolveModels } from './model';
import type { Analysis } from '@/lib/schemas/ai';
import type { Persona } from './personas';
import type { SteamGameDTO } from './steam';

export const SCRIPT_PROMPT_VERSION = 'sp1';

interface Args { game: Pick<SteamGameDTO, 'name' | 'genres' | 'categories'>; analysis: Analysis; persona: Persona }

export async function generateScript({ game, analysis, persona }: Args): Promise<ScriptLine[]> {
  const system = persona.systemPrompt +
    `\n사용 가능한 emotion: ${LIVE2D_EMOTIONS.join(',')}. gesture: ${LIVE2D_GESTURES.join(',')}. ` +
    '목록 밖 값을 쓰지 마라. durationMs는 생성하지 마라.';
  const prompt = JSON.stringify({ game, analysis });
  return generateStructured({ models: resolveModels(), system, prompt, schema: ScriptSchema });
}
```

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** → `feat(ai): AI-FE-002 스크립트 단계(persona 주입)`

---

### Task 9: 캐싱 (Runtime Cache + 키/버전)

**Files:** Create: `src/lib/ai/cache.ts`, `src/lib/ai/cache.test.ts`

> 캐시 키 빌더(순수함수)만 단위 테스트. Runtime Cache I/O는 통합/수동에서 확인(비내구성이라 적중 실패해도 정상).

- [ ] **Step 1: 실패 테스트 (키 빌더)**

```ts
// src/lib/ai/cache.test.ts
import { describe, expect, it } from 'vitest';
import { analysisKey, scriptKey } from './cache';

describe('cache keys', () => {
  it('analysisKey = appid+리뷰해시+버전 (persona 무관)', () => {
    const k = analysisKey({ appid: 1, reviewsSnapshotHash: 'abc' });
    expect(k).toContain('1');
    expect(k).toContain('abc');
  });
  it('scriptKey는 persona를 포함(persona별 분리)', () => {
    const a = scriptKey({ appid: 1, persona: 'default' });
    const b = scriptKey({ appid: 1, persona: 'soulslike' });
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현** (Runtime Cache API는 G3와 함께 확인 — vercel:runtime-cache)

```ts
// src/lib/ai/cache.ts
// Vercel Runtime Cache: regional·비내구성. eviction/장애 시 재생성 허용(영속 아님).
import { ANALYSIS_VERSION, ANALYSIS_PROMPT_VERSION } from './analyze';
import { SCRIPT_PROMPT_VERSION } from './script';
import { PERSONA_VERSION } from './personas';

export function analysisKey(p: { appid: number; reviewsSnapshotHash: string }): string {
  return `ai:analysis:${p.appid}:${p.reviewsSnapshotHash}:${ANALYSIS_VERSION}:${ANALYSIS_PROMPT_VERSION}`;
}
export function scriptKey(p: { appid: number; persona: string }): string {
  return `ai:script:${p.appid}:${p.persona}:${ANALYSIS_VERSION}:${SCRIPT_PROMPT_VERSION}:${PERSONA_VERSION}`;
}

// get-or-compute. Runtime Cache 미설정/장애 시 캐시 우회하고 compute 직접 실행(throw 금지).
export async function cached<T>(key: string, compute: () => Promise<T>): Promise<T> {
  try {
    // G3: vercel runtime cache get/set 시그니처 확인 후 연결.
    // const hit = await runtimeCache.get(key); if (hit) return hit as T;
    const value = await compute();
    // await runtimeCache.set(key, value, { tags: [...] });
    return value;
  } catch {
    return compute();
  }
}
```

- [ ] **Step 4: 통과 확인** → PASS (키 빌더)
- [ ] **Step 5: 커밋** → `feat(ai): AI-FE-002 캐시 키/버전 + Runtime Cache 래퍼`

---

### Task 10: 통합 route handler `POST /api/ai/explain`

**Files:** Create: `src/app/api/ai/explain/route.ts`, `src/app/api/ai/explain/route.test.ts`

- [ ] **Step 1: 실패 테스트** (steam/analyze/script/cache 모듈 mock)

```ts
// src/app/api/ai/explain/route.test.ts
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/ai/steam', () => ({
  fetchSteamGame: vi.fn(async () => ({
    appid: 1, name: 'X', description: 'd', genres: ['Action'], categories: [],
    reviews: [], reviewsSnapshotHash: 'h',
  })),
}));
vi.mock('@/lib/ai/analyze', () => ({
  analyzeGame: vi.fn(async () => ({ positive: ['p'], negative: [], genreTone: 't' })),
  ANALYSIS_VERSION: 'a1', ANALYSIS_PROMPT_VERSION: 'ap1',
}));
vi.mock('@/lib/ai/script', () => ({
  generateScript: vi.fn(async () => [{ lineId: 'l1', text: '안녕', emotion: 'neutral', gesture: 'none' }]),
  SCRIPT_PROMPT_VERSION: 'sp1',
}));
import { POST } from './route';

describe('POST /api/ai/explain', () => {
  it('appid → ExplainResponseSchema 통과 JSON', async () => {
    const req = new Request('http://x/api/ai/explain', {
      method: 'POST', body: JSON.stringify({ appid: 1 }) });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.script[0].emotion).toBe('neutral');
  });

  it('appid 누락 시 400', async () => {
    const req = new Request('http://x/api/ai/explain', { method: 'POST', body: '{}' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**

```ts
// src/app/api/ai/explain/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchSteamGame } from '@/lib/ai/steam';
import { analyzeGame } from '@/lib/ai/analyze';
import { generateScript } from '@/lib/ai/script';
import { getPersona } from '@/lib/ai/personas';
import { analysisKey, scriptKey, cached } from '@/lib/ai/cache';
import { ExplainResponseSchema } from '@/lib/schemas/ai';

export const runtime = 'nodejs';

const BodySchema = z.object({ appid: z.number().int().positive() });

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'appid 필요' }, { status: 400 });
  const { appid } = parsed.data;

  try {
    const game = await fetchSteamGame(appid); // 실패 시 catch → 422
    const persona = getPersona(game.genres[0], game.genres);

    const analysis = await cached(
      analysisKey({ appid, reviewsSnapshotHash: game.reviewsSnapshotHash }),
      () => analyzeGame(game));
    const script = await cached(
      scriptKey({ appid, persona: persona.id }),
      () => generateScript({ game, analysis, persona }));

    const payload = { appid, persona: persona.id, analysis, script };
    return NextResponse.json(ExplainResponseSchema.parse(payload));
  } catch (err) {
    // Steam 실패/LLM 전 모델 실패 → 설명 생성 불가(프론트가 재시도 버튼 노출)
    return NextResponse.json({ error: '설명 생성 실패' }, { status: 422 });
  }
}
```

- [ ] **Step 4: 통과 확인** → Run: `pnpm vitest run src/app/api/ai/explain/route.test.ts` → PASS
- [ ] **Step 5: 전체 검증** → Run: `pnpm type-check && pnpm lint && pnpm test` → PASS
- [ ] **Step 6: 수동 통합(선택, 실 LLM)** — `.env.local`에 실제 키 넣고 `pnpm dev` 후
  `curl -X POST localhost:3000/api/ai/explain -d '{"appid":1245620}' -H 'content-type: application/json'`
  → ExplainResponse JSON 확인(emotion/gesture가 enum 내, fallback 동작은 1순위 키 제거로 테스트)
- [ ] **Step 7: 커밋** → `feat(ai): AI-FE-002 explain route 통합 + 2단계 캐싱`

> **Phase 2 종료 = AI-FE-002 PR.** 백엔드 파이프라인 완성 = JSON으로 데모 가능. 프론트(Phase 5) 없이도 완결.

---

# Phase 5 — 프론트 재생 (AI-FE-003) ⚠️ G4 게이트

**이 Phase는 Live2D 자산·렌더러(G4)가 해소되기 전까지 상세 계획을 쓰지 않는다**(자산 키에 따라 enum·재생 API가 달라져 placeholder가 될 수밖에 없음). 자산 확보 시 **별도 계획 파일**(`docs/superpowers/plans/<date>-ai-live2d-playback.md`)을 작성한다.

**G4 해소 시 착수할 작업 개요(상세 아님):**
- Live2D 라이브러리 선정(pixi-live2d-display vs Cubism SDK) — 트레이드오프 별도 정리
- `src/lib/schemas/ai.ts`의 `LIVE2D_EMOTIONS`/`LIVE2D_GESTURES`를 **실제 모델 키로 교체**(교체 지점 1곳)
- `AiExplainButton` — 게임 상세에 버튼(appdetails 실패 시 disabled). **G1(appid 매핑) 해소 필요**
- `Live2dStage` — `script[]` 순차 재생, emotion 동기화(gesture는 차후), `durationMs`를 글자수로 파생
- 미매핑 emotion → `neutral` 방어 폴백
- 기존 `router.test`/e2e가 게임 상세 heading 가정과 충돌 없는지 grep(메모리: 화면 교체 시 e2e 확인)
- 수동: 실제 appid로 생성→재생 눈대조(데스크탑 다크)

---

# 후속 (MVP 밖, spec §11)

- **태그별 persona 프롬프트 세트 + 한국어 톤 검증** — `getPersona` 매칭 규칙(AI-FE-002 확장 AC)이 가리킬 실제 프롬프트 콘텐츠 제작. 한국어 리뷰 샘플로 fallback 모델 톤 품질 검증.
- TTS/음성 톤, 립싱크 — `durationMs`를 실제 오디오 길이로 대체.
- 다중 persona 본격 확장(default 1개 → N개).

---

## Self-Review 결과

- **Spec 커버리지:** §3 AI-FE-001(Task 1~5)·AI-FE-002(Task 6~10)·AI-FE-003(Phase 5 게이트) 매핑됨. §4 공통설계(2단계 분리·감정 2레이어·durationMs 비생성·모델 env·persona 3단계)·§5 에러폴백·§6 미정 추천값 모두 task에 반영. §11 후속 별도 섹션.
- **외부 의존(placeholder 아님):** G2(Steam 실측)·G3(ai@6 시그니처)·G4(Live2D)는 "확인 step" 또는 "명시적 게이트"로 처리 — 추측 코드 박지 않음.
- **타입 일관성:** `SteamGameDTO`/`Analysis`/`ScriptLine`/`Persona`가 생성 task에서 정의되고 이후 task가 동일 이름으로 import. 캐시 키 버전 상수(`ANALYSIS_VERSION` 등)는 정의 모듈에서 export → cache.ts가 재사용.
- **알려진 한계:** Task 6의 mock model 본문, Task 9의 Runtime Cache I/O는 G3 확정값으로 채우는 단계가 명시됨(시그니처 미상이라 의도적 보류, 추측 금지).
