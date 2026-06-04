# Next.js 마이그레이션 설계 — 1차(최소 이전)

- 티켓: `MIGRATE-FE-001`
- 작성일: 2026-06-04
- 흐름: cross (공통 빌드/엔트리/설정 + 풀팀 영향)
- 상태: 설계 합의 완료 (구현 플랜 대기)

## 1. 배경 / 동기

프론트엔드 팀이 **LangChain(AI)을 돌릴 독립 Node 서버**를 확보하기 위해 현재 Vite +
React 19 SPA를 Next.js로 옮긴다. 목적은 SSR/SEO가 **아니라** 서버 런타임(route
handler / server action) 확보다.

- 서버 소유권: **프론트팀 전용 BFF/AI 서버.** 기존 백엔드(JWT 인증·게임 API·Steam
  OAuth, 백엔드 4명 담당)와 **공존**하며 그 역할을 흡수하지 않는다.
- 백엔드 4명 작업에 **무영향**(인증·API 계약·쿠키 동작 무변경).

## 2. 목표 / 비목표

### 목표 (1차)
- Vite 엔트리/빌드를 Next.js로 교체해 Node 서버를 확보한다.
- LangChain용 route handler **골격(헬스체크)** 을 추가한다.
- 기존 Vitest 단위테스트 + Playwright E2E를 **전부 통과**시켜 "동일 기능 유지"를 보장한다.

### 비목표 (1차 제외 — 후속 티켓)
- RSC/SSR 전환, 데이터 패칭의 서버 이동.
- LangChain 본구현(실제 체인 연결).
- Storybook을 `@storybook/nextjs`로 이관.
- 페이지별 SSR 승격(필요한 페이지만 추후 점진 전환).

## 3. 접근 — catch-all로 react-router 통째 호스팅

화면·상태·데이터·인증·**react-router를 모두 유지**한다. Next는 호스트 + AI 서버 역할만
한다. 기존 react-router 앱을 단일 catch-all 라우트에 얹어 클라이언트 전용으로 마운트한다.
(Next 공식 "Vite에서 마이그레이션" 가이드의 점진 이전 패턴:
https://nextjs.org/docs/app/guides/migrating/from-vite)

### 트레이드오프
- 장점: 라우팅 변경 0, 위험 최소, PR revert로 롤백 쉬움, "1차"에 적합.
- 단점: Next의 per-route 코드분할·layout·metadata 이점 포기(SEO 불필요로 수용). 장기적으로
  페이지별 SSR 승격 시 catch-all을 점진 해체.

## 4. 아키텍처 (파일 구조)

```
src/app/
  layout.tsx              # index.html 대체. <html lang="ko">(dark는 토큰 기본값), Panda 글로벌 CSS import
  providers.tsx           # 'use client'. QueryClientProvider + MSW gate + Devtools (= 기존 main.tsx)
  [[...slug]]/
    page.tsx              # 서버 컴포넌트(얇음). client.tsx 렌더만.
    client.tsx            # 'use client'. dynamic(() => import('@/App'), { ssr: false })
  api/ai/health/route.ts  # LangChain 서버 자리. Node 런타임. 1차엔 헬스체크만.
next.config.ts            # output:'export' 미사용(서버 모드 유지)
vitest.config.ts          # vite.config.ts에서 분리한 Vitest 설정
vite.config.ts            # Storybook(@storybook/react-vite)용으로만 잔존
next-env.d.ts             # vite-env.d.ts 대체
```

### 동작 원리
- 모든 경로(`/`, `/login`, `/games/:id` …)를 catch-all `[[...slug]]`가 받고, 클라이언트의
  기존 `createBrowserRouter`가 실제 라우팅을 처리한다. react-router 코드·가드
  (`ProtectedRoute`/`PublicOnlyRoute`)는 무변경.
- `createBrowserRouter`는 `window`가 필요하므로 catch-all은 **SSR 끈다**
  (`dynamic(..., { ssr: false })`). `ssr:false`는 서버 컴포넌트에서 호출 불가 →
  `page.tsx`(서버)는 얇게 두고 `client.tsx`(`'use client'`)가 dynamic을 담당.

## 5. 상세 변경

### 5.1 엔트리 / Provider
- `index.html` → `src/app/layout.tsx` (`<html lang="ko">` — dark 클래스 없음(토큰 기본값), Panda 글로벌 CSS,
  `#root` div는 `{children}`으로 대체).
- `main.tsx` → `src/app/providers.tsx` (`'use client'`): `QueryClientProvider` +
  `ReactQueryDevtools`(dev lazy) 이사.
- **수동 `<StrictMode>`는 제거.** Next는 `reactStrictMode` 기본 `true`라 중첩이 되므로
  Next 기본값에 맡긴다.

### 5.2 MSW gate (유일 주의 구간)
- 기존 `main.tsx`는 `enableMocking()`을 **모듈 최상단에서 1회**(effect 밖) 호출해 worker
  준비 후 렌더했다.
- providers에서 `useEffect`로 start하면 dev에서 Strict Mode가 effect를 2회 실행해
  `worker.start()`가 **이중 호출**된다.
- → **모듈 레벨 promise**(`let mockingPromise = enableMocking()`)를 두고, providers는 그
  promise가 resolve될 때까지 `children` 렌더를 보류한다. effect 안에서 매번 start하지 않는다.
- `enableMocking()` 안에 **`typeof window === 'undefined'` 가드**를 명시한다. `providers.tsx`가
  `'use client'`여도 Next 빌드/프리렌더 경계에서 모듈 평가가 걸릴 수 있어, `msw/browser` 동적
  import은 브라우저에서만 실행되게 막는다(서버에서 즉시 return).
- 1차에서 MSW는 **유지**한다(테스트/E2E가 mock 기반, 백엔드 계약 과도기 → 동일기능 검증에 필수).

### 5.3 환경변수
`src` 전체 sweep 결과 env 사용처는 아래 3개뿐(전수). 전부 치환한다.
- `import.meta.env.VITE_USE_MOCK` (`main.tsx`) → `process.env.NEXT_PUBLIC_USE_MOCK`
- `import.meta.env.VITE_API_BASE_URL` (`src/lib/ky.ts:3`) → `process.env.NEXT_PUBLIC_API_BASE_URL`
- `import.meta.env.DEV` (`main.tsx`) → `process.env.NODE_ENV === 'development'`
- **`.env.local.example` 도 함께 갱신**(`VITE_*` 키명을 `NEXT_PUBLIC_*`로).

### 5.4 빌드 / 설정
- `package.json` scripts: `dev: next dev` / `build: next build` / `start: next start`.
  `panda codegen`은 `predev`·`prebuild`(또는 `prepare`)로 선행 유지.
- deps: `+ next`. **`vite` / `@vitejs/plugin-react`는 제거 보류** — Vitest와
  Storybook(`@storybook/react-vite`)이 계속 사용. Storybook을 `@storybook/nextjs`로
  옮기는 후속 티켓에서 정리.
- `next.config.ts`: `output:'export'` **미사용**(route handler·server action 필요 →
  서버 모드 유지). 필요 시 `transpilePackages`에 `styled-system` 추가.
- `react`/`react-dom` 19 유지.

### 5.5 tsconfig
- `vite-env.d.ts` → `next-env.d.ts`.
- `types`에서 **`vite/client` 제거**(Next가 `next-env.d.ts`로 대체). `vitest/globals`는
  테스트용 유지.
- `jsx: "react-jsx"` → Next 기대값 `"preserve"`.
- `paths` `@/*` → `src/*` 유지(현행), `moduleResolution: "Bundler"` 유지.
- `include`에서 `vite.config.ts` 정리.

### 5.6 Vitest 분리
- `vite.config.ts`의 `test` 블록을 **`vitest.config.ts`로 분리**: `plugins:[react()]` +
  `resolve.alias`(`@`, `styled-system`) + `test` 블록 통째 이동.
- react 플러그인·alias가 Vitest에 그대로 필요하므로 분리가 정답.

### 5.7 Panda CSS
- `postcss.config.cjs` 유지, Panda 글로벌 CSS를 `layout.tsx`에서 import.
- `styled-system` 산출 경로·codegen 방향 유지(`panda codegen` 선행).

### 5.8 LangChain 서버 자리
- `src/app/api/ai/health/route.ts` — Node 런타임, 1차엔 헬스체크 응답만. 실제 체인 연결은
  후속 티켓.

### 5.9 .gitignore / next-env.d.ts
- 현재 `.gitignore`에 `.next`가 **없다**(확인됨). 구현 시 빌드 산출물이 추적되므로 다음을 추가:
  - `.next/`
  - `*.tsbuildinfo`
  - `next-env.d.ts`
- **`next-env.d.ts` 추적 정책: 비추적(gitignore).** Next가 자동 생성하는 파일이라
  create-next-app 기본 정책과 동일하게 커밋하지 않는다.

## 6. 검증 기준 (1차 성공 = "동일 기능 유지")
- 기존 **Vitest 단위테스트 전부 통과**(router.test 등 react-router 테스트 무변경).
- 기존 **Playwright E2E 전부 통과**. 변경점:
  - `baseURL` `5173 → 3000`
  - `webServer.url` `5173 → 3000`
  - `webServer.env` `VITE_USE_MOCK:'true'` → `NEXT_PUBLIC_USE_MOCK:'true'`
  - `webServer.command` `pnpm dev` 유지(이제 `next dev`).
- `pnpm type-check` / `pnpm lint` 통과.
- `next dev`로 화면 시각 확인(기존 사용자 시각 OK 절차 유지).

## 7. 문서 갱신 범위
- `CLAUDE.md` 기술스택(Vite → Next), 자주 쓰는 명령.
- `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`(dev 명령), `docs/architecture/routing.md`
  (catch-all 패턴 주석).
- 디자인/요구사항 SSOT(`docs/design/*`, `docs/requirements/*`)는 무변경.

## 8. 롤아웃 / 롤백
- cross 작업: PR 필수, 본인 머지 금지(1명 승인). PR에 **백엔드 4명 무영향**(독립 서버, 인증
  무변경) 명시.
- 프론트 4명: `next dev`로 dev 명령만 바뀜.
- **롤백 = PR revert 기준**(개별 수동 복구 아님). catch-all 패턴이라 react-router 앱이 그대로
  살아있어 revert 안전.

## 9. 후속 작업 (별도 티켓)
- LangChain 본구현.
- Storybook `@storybook/nextjs` 이관 + vite/@vitejs/plugin-react 정리.
- 필요한 페이지만 SSR 승격(catch-all 점진 해체).
