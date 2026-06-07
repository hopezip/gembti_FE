# 게임 추천 페이지(`/recommendations`) 설계

> 작성일: 2026-06-05
> 출처 디자인: Figma SECTION `게임추천 페이지` (node 4003:2288, 1440폭)
> 관련 기능 ID: `REC-FE-002`(이번주 인기/추천 그리드), `REC-FE-003`(★4+ 추천), `REC-FE-004`(태그·장르 표시). 라우트 SSOT: `routing.md` — `/recommendations` (Public)

## 1. 목표

Figma `게임추천 페이지`를 구현한다. 현재 `/recommendations`는 라우트맵에
존재하나 `PlaceholderPage`를 렌더한다. 이 element를 실제 페이지로 교체한다.

**이번 범위 = 개인화(로그인 + 설문완료) 상태만.** 비로그인/설문미완 게스트
폴백·안내는 별도 티켓으로 분리한다(YAGNI).

## 2. 아키텍처

라우트 `/recommendations`(Public, 이미 라우트맵 존재)의 element만 교체한다.
경로·권한·가드는 변경하지 않는다.

```
RecommendationsPage  (src/routes/RecommendationsPage.tsx · 신규)
└─ <main>
     ├─ <RecommendationHero />            ← 신규 컴포넌트(유일한 신규 UI)
     └─ <PersonalizedRecommendedGames />  ← 기존 컴포넌트 그대로 재사용
        └─ GameGridSection + PersonalizedGameCard
           (제목 "당신을 위한 추천" + 4×3 그리드 + 더보기 + 4상태/스켈레톤)
```

핵심 원칙: **새로 만드는 컴포넌트는 `RecommendationHero` 1개뿐.** 카드·그리드·
더보기·스켈레톤·4상태는 100% 기존 공통 컴포넌트를 재사용한다(중복 0, 회귀 위험 0).

## 3. 신규 컴포넌트: `RecommendationHero`

- 위치: `src/features/recommendations/components/RecommendationHero.tsx`
  - `features/main` 오염 방지를 위해 새 `recommendations` feature 폴더를 만든다.
- 공통 `PageContainer` 안에 배치한다(레이아웃은 PageContainer가 좌우 거터·maxW를 소유).
- 구조:
  - **헤드라인**: `"{nickname} 님, 당신의 다음 게임을 골라봤어요"`
    - `nickname` = `useAuthStore` → `user.nickname`(`AuthUser`, `src/services/auth.ts:21`).
      값이 없으면 `'게이머'`로 폴백한다.
    - "다음 게임"은 `accent.default`로 강조한다.
  - **메타 캡션**: `"현재 취향 기준 추천 · 마지막 업데이트 {lastUpdatedText}"`
  - **취향 2그룹** — 각 그룹은 `accent 마커 + 소제목 + 칩들 + 캡션`:
    - `당신이 좋아하는 것` — **채운** 칩 + 캡션 `"★4+ 게임 23개에서 추출"`
    - `새로운 도전을 해보세요` — **외곽선** 칩 + 캡션 `"새로운 도전 거리로 추천"`
  - 그룹 아이콘(Figma 하트·반짝임 SVG)은 **accent 마커(작은 주황 사각/막대)로 단순화**한다.
- 칩 = 기존 `Tag` 컴포넌트(읽기 전용 라벨). variant로 채움/외곽선을 구분한다.
  클릭 필터는 두지 않는다(디자인상 정적 라벨).
- **semantic token만** 사용한다. 신규 토큰/recipe를 추가하지 않는다(다크·데스크탑 전용).

## 4. 데이터 — `usePersonalizedHome` 재사용 + Mock 보강

페이지는 새 쿼리를 만들지 않고 기존 `usePersonalizedHome`
(`GET /api/v1/home/personalized`)를 구독한다.

| 영역 | 출처 |
|---|---|
| 카드 그리드 | 기존 `recommendedGames` 그대로 |
| "좋아하는 것" 칩 | 기존 `userInterestTags` 재사용 |
| "새로운 도전" 칩 + 두 캡션 + 마지막 업데이트 | **보강 필드 추가** |

### 변경 파일 (모두 additive — `MainPage` 영향 0)

1. `src/mocks/handlers/games.ts` — `/home/personalized` 수동 핸들러 응답
   `data`에 보강 필드 추가(snake_case):
   - `challenge_tags: string[]` (예: 로그라이크/전략 시뮬/대전 격투/서바이벌)
   - `liked_meta: string` (예: "★4+ 게임 23개에서 추출")
   - `challenge_meta: string` (예: "새로운 도전 거리로 추천")
   - `last_updated_text: string` (예: "2일 전")
   - 이 핸들러는 "한시적 수동 핸들러"로 자동 생성물이 아니며 편집 가능하다.
2. `src/features/main/api/personalizedHome.ts` — 도메인 타입에
   `recommendationProfile`(camelCase) 추가 + 매핑 함수 보강:
   ```ts
   export interface RecommendationProfile {
     likedMeta: string;        // "좋아하는 것" 그룹 캡션
     challengeTags: string[];  // "새로운 도전" 그룹 칩
     challengeMeta: string;    // "새로운 도전" 그룹 캡션
     lastUpdatedText: string;  // 메타 캡션의 "마지막 업데이트 …"
   }
   ```
   - "좋아하는 것" 그룹 칩은 별도 필드를 만들지 않고 기존 `userInterestTags`를
     그대로 쓴다(중복 방지). 따라서 mock도 `liked_tags`를 새로 만들지 않고
     기존 `user_interest_tags`를 재사용한다.
   - 기존 필드/타입은 변경하지 않는다(순수 추가). `MainPage`는 새 필드를 쓰지 않는다.

### 4상태 처리

`RecommendationHero`는 `usePersonalizedHome`의 로딩/에러/빈 데이터에서도 헤드라인·
메타 카피는 항상 렌더하고, 칩·캡션 등 데이터 의존 부분만 조건부로 렌더한다
(`PersonalizedHeroBanner`의 "항상 렌더" 패턴과 동일).

## 5. 라우트 연결

`src/routes/index.tsx`의 `pageElement()`에 분기 1줄 추가:
```ts
if (path === '/recommendations') return <RecommendationsPage />;
```
라우트 정의(경로/권한/가드)는 변경하지 않는다.

## 6. 제외 항목 (YAGNI)

- 게스트/비로그인·설문미완 폴백·안내 → 별도 티켓
- 실제 백엔드 `/recommendations` API 신설 → 안 함(기존 personalized 재사용)
- 취향 칩 클릭 필터/토글 → 안 함(읽기 전용 정적 라벨)
- 새 디자인 토큰/recipe → 없음
- Figma 메모 "API 명세 기준으로 화면 데이터 구조 설계하기" 텍스트 → 디자인 노트이므로 구현 제외

## 7. 영향 범위 / 스코프

- 신규: `RecommendationsPage`, `RecommendationHero`
- 수정: `routes/index.tsx`(분기 1줄), `mocks/handlers/games.ts`(mock 보강),
  `features/main/api/personalizedHome.ts`(공통 타입 additive 확장)
- 공통 타입(`personalizedHome`) 확장 + 라우트 element 교체가 포함되므로 **cross 경향**.
  구현 후 dev 띄워 Figma와 시각 비교 후 커밋·PR.

## 8. 검증

- `pnpm type-check`, `pnpm lint`, `pnpm test`(라우트 테스트가 `/recommendations`의
  Placeholder heading을 가정하지 않는지 grep으로 확인 — 화면 교체 회귀 방지)
- dev 서버로 mock 계정(로그인+설문완료)으로 진입해 Figma와 눈대조
