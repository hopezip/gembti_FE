# 활용 장비 및 재료 (기술 스택) — GamBTI Frontend

> 개발환경·언어·프레임워크·아키텍처·검증(CLI/E2E/CI) 전반 정리.
> 모든 항목은 실제 `package.json`·CI 워크플로·설정 파일 기준이며, 버전은 `package.json` 선언값입니다.

---

## 1. 개발 환경 & 언어

| 항목 | 내용 |
|---|---|
| **언어** | TypeScript 5.8 (`strict: true`, ES2022 타깃, `moduleResolution: Bundler`) |
| **런타임** | Node.js ≥ 20.19 |
| **패키지 매니저** | pnpm 10.33 (`packageManager` 필드로 버전 고정 = SSOT) |
| **빌드 도구** | Vite 7 (`@vitejs/plugin-react`) — dev/preview 포트 **3000 고정**(백엔드 CORS·refresh 쿠키가 `localhost:3000`에 묶여 있어서) |
| **모듈 별칭** | `@/*` → `src/*`, `styled-system/*` → 디자인 코드젠 산출물 |

---

## 2. 핵심 프레임워크 & 라이브러리 (런타임)

| 영역 | 기술 | 버전 | 역할 |
|---|---|---|---|
| **UI 라이브러리** | React | 19 | 컴포넌트 기반 SPA |
| **라우팅** | React Router | 7 | `createBrowserRouter` 기반 SPA 라우팅(라우트 SSOT) |
| **서버 상태/데이터** | TanStack Query | 5 | 서버 데이터 fetching·캐싱·동기화 (+ Devtools) |
| **클라이언트 상태** | Zustand | 5 | 인증 세션 등 전역 상태(메모리) |
| **폼** | React Hook Form 7 + Zod 3 | — | 폼 상태 + 스키마 검증(`@hookform/resolvers`) |
| **HTTP 클라이언트** | ky | 1.8 | fetch 래퍼 — Bearer 토큰 부착·401 refresh 재시도 담당 |
| **아이콘/캐러셀** | lucide-react, swiper | — | 아이콘셋, 히어로 캐러셀 |

---

## 3. 아키텍처

**유형:** Vite + React 19 **SPA**(Single Page Application), 데스크탑·다크모드 전용. (과거 Next.js → Vite SPA로 복귀)

**레이어 구조 (관심사 분리):**

```
src/
├─ routes/             라우트(페이지) + 가드(ProtectedRoute 등)
├─ features/<도메인>/   도메인별 components · api · hooks (auth, mypage, onboarding, survey ...)
├─ services/           도메인 조합 API 레이어 (컴포넌트의 직접 HTTP 호출 금지)
├─ lib/                ky 인스턴스 · zod 스키마 · zustand store · queryClient
├─ mocks/              MSW 핸들러 (백엔드 미구현 API 대체)
├─ types/api.ts        OpenAPI에서 자동 생성된 타입 (수기 편집 금지)
└─ theme/              Panda 디자인 토큰 분해
```

**핵심 설계 포인트:**

- **인증:** 백엔드 JWT — access token은 Zustand **메모리**에만, refresh token은 **httpOnly 쿠키**(FE가 못 읽음). 부팅 시 `/auth/refresh`로 세션 복원. ky 경계가 토큰 부착·갱신 전담.
- **API 계약 자동화(코드젠 파이프라인):** 백엔드 OpenAPI(`openapi.json`) + 프론트 임시 draft를 `scripts/merge-openapi.mjs`로 병합 → **`openapi-typescript`**가 `src/types/api.ts`를 **결정적 생성**. 타입을 손으로 안 쓰고 스웨거에서 뽑아 백엔드–프론트 계약 불일치를 방지.
- **Mock 서버:** **MSW 2** — 백엔드 미구현 엔드포인트를 가로채 동작. 실서버 있는 경로(`auth/*` 등)는 passthrough(`onUnhandledRequest: 'bypass'`).

---

## 4. 디자인 시스템

| 기술 | 버전 | 역할 |
|---|---|---|
| **Panda CSS** (`@pandacss/dev`) | 0.53 | 빌드타임 CSS-in-JS, semantic 디자인 토큰(SSOT) → `styled-system/` 코드젠 |
| **Park UI** (`@park-ui/panda-preset`) | 0.43 | Panda 프리셋(베이스 컴포넌트 recipe) |
| **Ark UI** (`@ark-ui/react`) | 5 | 헤드리스 접근성 컴포넌트 베이스 |

→ 원칙: **primitive 색(gray.900 등) 직접 사용 금지, semantic 토큰만.** Park UI 베이스 + GamBTI recipe로 오버라이드. (2단계 토큰: primitive → semantic)

---

## 5. 품질·검증 도구 (로컬 CLI)

| 단계 | 도구 | 명령(CLI) |
|---|---|---|
| **정적 분석/포맷** | Biome 2 (lint + formatter 통합) | `pnpm lint` / `pnpm format` |
| **타입 검증** | TypeScript `tsc --noEmit` | `pnpm type-check` |
| **단위/통합 테스트** | Vitest 4 + Testing Library(RTL 16, jest-dom, user-event) + jsdom | `pnpm test` (테스트 파일 16개) |
| **E2E 테스트** | **Playwright 1.50** (Desktop Chrome) | `pnpm test:e2e` |
| **빌드 검증** | tsc + Vite build | `pnpm build` |
| **컴포넌트 문서** | Storybook 10 (a11y·docs 애드온) | `pnpm storybook` |

**Playwright E2E 상세:**

- `e2e/` 디렉터리의 `*.spec.ts`만 수집(Vitest와 격리) — 현재 `login.spec.ts`, `smoke.spec.ts`
- `webServer`가 `pnpm dev`를 **자동 기동**하고 `baseURL=localhost:3000`로 연결
- E2E는 **항상 MSW mock 모드**(`VITE_USE_MOCK=true`)로 실행 → 백엔드 의존 없이 결정적
- CI에선 `retries: 2`, `trace: on-first-retry`로 실패 추적

---

## 6. GitHub 검증 단계 (CI/CD — GitHub Actions)

**`ci.yml`** — PR·push 대상 `dev`/`main`에서 자동 실행. "검증을 권고에서 강제 신호로":

```
┌─ check (matrix, 병렬) ── type-check · lint · test · build   (ubuntu, Node 20, pnpm 캐시)
└─ e2e ─────────────────── Playwright chromium 설치 후 pnpm test:e2e
```

- `pnpm install --frozen-lockfile`로 잠금파일 무결성 보장
- 로컬 스크립트를 그대로 호출(CI 전용 명령 없음) → 로컬 = CI 일치
- ⚠️ 트리거가 base `dev`/`main`인 PR만 → stacked PR(base=feature)은 CI 미동작(로컬 검증 필수)

**`discord-notifications.yml`** — PR 이벤트(open·review_requested·closed·review submitted) 시 Discord 웹훅으로 팀 알림(제목·작성자·브랜치·증감 라인) → 협업 가시성.

---

## 7. 협업 워크플로우

- **Git 전략:** `main`(배포) ← `dev`(통합) ← `feature/<티켓ID>-<설명>`
- **풀팀 모드:** 모든 변경이 티켓 + PR 필수, **본인 머지 금지**(최소 1명 승인)
- 티켓 ID(`MYPAGE-FE-016` 등)로 작업 추적

---

## 부록 — 주요 npm 스크립트 (CLI)

| 명령 | 동작 |
|---|---|
| `pnpm dev` | 코드젠 후 Vite 개발 서버(`localhost:3000`) |
| `pnpm build` | 코드젠 + `tsc --noEmit` + Vite 프로덕션 빌드 |
| `pnpm preview` | 프로덕션 빌드 미리보기 |
| `pnpm type-check` | 코드젠 + 타입 검증 |
| `pnpm lint` / `pnpm format` | Biome 검사 / 자동 수정 |
| `pnpm test` / `pnpm test:watch` | Vitest 단위 테스트 |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm codegen` / `pnpm api:gen` | Panda + OpenAPI 타입 생성 |
| `pnpm storybook` / `pnpm build-storybook` | Storybook 실행 / 빌드 |

> **버전 참고(실제 설치본):** React 19.2 · Vite 7 · TypeScript 5.9 · Vitest 4.1 · Playwright 1.50 · MSW 2.14 · TanStack Query 5.10 · Panda CSS 0.53 · Biome 2.2
