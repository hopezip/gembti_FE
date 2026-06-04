# Next.js 마이그레이션(1차·최소 이전) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vite + React 19 SPA를 Next.js로 옮겨 LangChain용 독립 Node 서버를 확보하되, 화면·상태·데이터·인증·react-router를 그대로 유지한다.

**Architecture:** 기존 react-router 앱을 단일 catch-all 라우트(`src/app/[[...slug]]`)에 얹어 클라이언트 전용(`dynamic ssr:false`)으로 마운트한다. Next는 호스트 + AI 서버 역할만. `output:'export'`는 쓰지 않는다(route handler 필요).

**Tech Stack:** Next.js(App Router) + React 19, react-router-dom v7, TanStack Query, Zustand, Panda CSS + Park UI, MSW, Vitest, Playwright.

**Spec:** `docs/architecture/nextjs-migration-design.md` (커밋 `a568929`)

**검증 체크포인트(설계 합의):**
- Vitest 분리 후 → `pnpm test`
- 엔트리 이사 후 → `pnpm type-check`
- Playwright 변경 후 → `pnpm test:e2e`
- 최종 → `type-check` · `lint` · `test` · `build` · `e2e` 전수

---

## File Structure

| 경로 | 동작 | 책임 |
|---|---|---|
| `next.config.ts` | 생성 | 서버 모드(`output:'export'` 미사용), strict mode |
| `vitest.config.ts` | 생성 | `vite.config.ts`에서 분리한 Vitest 설정 |
| `vite.config.ts` | 수정 | Storybook(`@storybook/react-vite`) 빌더 전용으로 축소 |
| `tsconfig.json` | 수정 | Next 호환(jsx preserve, next plugin, vite/client 제거) |
| `.gitignore` | 수정 | `.next/`·`*.tsbuildinfo`·`next-env.d.ts` |
| `package.json` | 수정 | scripts(next dev/build/start), deps(+next) |
| `src/app/layout.tsx` | 생성 | `index.html` 대체. `<html lang="ko">`, 폰트, Panda 글로벌, Providers |
| `src/app/providers.tsx` | 생성 | `'use client'`. QueryClient + MSW gate + Devtools (= 기존 `main.tsx`) |
| `src/app/[[...slug]]/page.tsx` | 생성 | 서버 컴포넌트(얇음). Client 렌더만 |
| `src/app/[[...slug]]/client.tsx` | 생성 | `'use client'`. `dynamic(() => import('@/App'), { ssr:false })` |
| `src/app/api/ai/health/route.ts` | 생성 | LangChain 서버 자리. Node 런타임. 헬스체크만 |
| `src/mocks/enableMocking.ts` | 생성 | `typeof window` 가드 + `NEXT_PUBLIC_USE_MOCK` 분기 worker 시작 |
| `src/lib/ky.ts` | 수정 | `VITE_API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL` |
| `.env.local.example` | 수정 | `VITE_*` → `NEXT_PUBLIC_*` |
| `index.html` | 삭제 | layout.tsx가 대체 |
| `src/main.tsx` | 삭제 | layout/providers가 대체 |
| `src/vite-env.d.ts` | 삭제 | Next가 `next-env.d.ts` 자동 생성 |
| `playwright.config.ts` | 수정 | port 3000, `NEXT_PUBLIC_USE_MOCK` |
| `CLAUDE.md` 등 docs | 수정 | 기술스택·명령 갱신 |

> ⚠️ 삭제 대상(`index.html`·`main.tsx`·`vite-env.d.ts`)은 실행 시 사용자 확인 후 삭제한다(전역 룰).

---

## Task 1: Next 설치 + 기본 설정 (서버 모드 골격)

**Files:**
- Modify: `package.json` (deps)
- Create: `next.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Next 설치**

Run: `pnpm add next@latest`
Expected: `package.json` dependencies에 `next` 추가. (react/react-dom 19 유지, vite 계열은 건드리지 않음 — Vitest·Storybook이 사용)

- [ ] **Step 2: `next.config.ts` 생성**

```ts
import type { NextConfig } from 'next';

// 서버 모드 유지: output:'export'를 쓰지 않는다(route handler/server action 필요).
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 3: `.gitignore`에 Next 산출물 추가**

`.gitignore` 끝에 추가:

```
# Next
.next/
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 4: 커밋**

```bash
git add package.json pnpm-lock.yaml next.config.ts .gitignore
git commit -m "build(MIGRATE-FE-001): next 설치 + 서버 모드 설정 골격"
```

---

## Task 2: tsconfig + Vitest 설정 분리

**Files:**
- Modify: `tsconfig.json`
- Create: `vitest.config.ts`
- Modify: `vite.config.ts`
- Delete: `src/vite-env.d.ts` (실행 시 확인 후)

- [ ] **Step 1: `vitest.config.ts` 생성 (기존 vite.config.ts의 test 블록 이전)**

```ts
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

// 앱 런타임은 Next로 이전됨. 이 파일은 Vitest 전용.
// react 플러그인·alias가 테스트에 그대로 필요하므로 함께 둔다.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'styled-system': fileURLToPath(
        new URL('./styled-system', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
```

- [ ] **Step 2: `vite.config.ts`를 Storybook 전용으로 축소 (test 블록 제거)**

```ts
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// Storybook(@storybook/react-vite) 빌더 전용. 앱 런타임은 Next로 이전됨.
// Vitest 설정은 vitest.config.ts로 분리했다.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'styled-system': fileURLToPath(
        new URL('./styled-system', import.meta.url),
      ),
    },
  },
});
```

- [ ] **Step 3: `tsconfig.json` Next 호환으로 수정**

전체를 아래로 교체:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "types": ["vitest/globals"],
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "styled-system/*": ["styled-system/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "src",
    "styled-system",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

변경 요지: `jsx: react-jsx → preserve`, `types`에서 `vite/client` 제거(`vitest/globals` 유지), `next` plugin 추가, `vite.config.ts` include 제거, `next-env.d.ts`·`.next/types` 추가.

- [ ] **Step 4: `src/vite-env.d.ts` 삭제 (사용자 확인 후)**

`vite/client` 참조 제거. Next가 `next-env.d.ts`를 자동 생성한다.

- [ ] **Step 5: 검증 체크포인트 — `pnpm test`**

Run: `pnpm test`
Expected: 기존 Vitest 단위테스트 **전부 PASS**. (vitest는 `vitest.config.ts`를 우선 인식. jsx 변환은 `@vitejs/plugin-react`가 담당하므로 tsconfig `jsx:preserve` 영향 없음.)

- [ ] **Step 6: 커밋**

```bash
git add tsconfig.json vitest.config.ts vite.config.ts
git rm src/vite-env.d.ts
git commit -m "build(MIGRATE-FE-001): tsconfig Next 호환 + Vitest 설정 분리"
```

---

## Task 3: 엔트리 이사 — layout / providers / MSW gate

**Files:**
- Create: `src/mocks/enableMocking.ts`
- Create: `src/app/providers.tsx`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: `src/mocks/enableMocking.ts` 생성 (window 가드)**

```ts
// MSW worker를 브라우저에서만 1회 시작한다.
// providers가 이 promise를 await해 worker 준비 후 children을 렌더한다.
export async function enableMocking(): Promise<void> {
  // providers.tsx가 'use client'여도 Next SSR/프리렌더에서 모듈이 평가될 수 있다.
  // msw/browser 동적 import는 브라우저에서만 실행되게 막는다.
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') return;

  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

- [ ] **Step 2: `src/app/providers.tsx` 생성 (= 기존 main.tsx 로직)**

```tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useState } from 'react';
import { queryClient } from '@/lib/queryClient';
import { enableMocking } from '@/mocks/enableMocking';

// Devtools는 개발 환경에서만 lazy 로드(프로덕션 번들 제외).
const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((d) => ({
          default: d.ReactQueryDevtools,
        })),
      )
    : () => null;

// 모듈 레벨 1회 호출 — Strict Mode가 effect를 2회 실행해도 worker.start 이중 호출 방지.
const mockingPromise = enableMocking();

export function Providers({ children }: { children: React.ReactNode }) {
  // worker 준비 전에는 렌더를 보류해 첫 쿼리가 mock을 놓치지 않게 한다.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    mockingPromise.then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: `src/app/layout.tsx` 생성 (= 기존 index.html)**

> 주의: 실제 `index.html`은 `<html lang="ko">`만 있고 `dark` 클래스가 없다(다크 전용 토큰이 기본값). 동일 동작 유지를 위해 클래스를 추가하지 않는다. Panda 글로벌 CSS는 `src/index.css`를 import한다.

```tsx
import type { Metadata } from 'next';
import { Providers } from './providers';
import '../index.css';

export const metadata: Metadata = {
  title: 'GamBTI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Archivo+Black&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/mocks/enableMocking.ts src/app/providers.tsx src/app/layout.tsx
git commit -m "feat(MIGRATE-FE-001): App Router 엔트리(layout/providers) + MSW gate 이사"
```

---

## Task 4: catch-all 라우트 — react-router 통째 마운트

**Files:**
- Create: `src/app/[[...slug]]/page.tsx`
- Create: `src/app/[[...slug]]/client.tsx`

- [ ] **Step 1: `src/app/[[...slug]]/client.tsx` 생성 (SSR off)**

```tsx
'use client';

import dynamic from 'next/dynamic';

// createBrowserRouter는 window가 필요하므로 SSR을 끈다.
// ssr:false는 클라이언트 컴포넌트에서만 호출 가능 → 이 파일이 담당.
const App = dynamic(() => import('@/App').then((m) => m.App), {
  ssr: false,
});

export function Client() {
  return <App />;
}
```

- [ ] **Step 2: `src/app/[[...slug]]/page.tsx` 생성 (얇은 서버 컴포넌트)**

```tsx
import { Client } from './client';

// 모든 경로(/ · /login · /games/:id …)를 이 optional catch-all이 받고,
// 클라이언트의 기존 react-router(createBrowserRouter)가 실제 라우팅을 처리한다.
// 서버 컴포넌트는 얇게 두고 마운트는 client.tsx가 담당.
export default function CatchAllPage() {
  return <Client />;
}
```

- [ ] **Step 3: 커밋**

```bash
git add "src/app/[[...slug]]/page.tsx" "src/app/[[...slug]]/client.tsx"
git commit -m "feat(MIGRATE-FE-001): catch-all 라우트로 react-router 앱 마운트"
```

---

## Task 5: 환경변수 치환 + Vite 엔트리 제거

**Files:**
- Modify: `src/lib/ky.ts`
- Modify: `.env.local.example`
- Delete: `index.html`, `src/main.tsx` (실행 시 확인 후)

- [ ] **Step 1: `src/lib/ky.ts` env 치환**

`src/lib/ky.ts:3`을 변경:

```ts
import ky from 'ky';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = ky.create({
  prefixUrl: API_BASE_URL || undefined,
  credentials: 'include',
});
```

- [ ] **Step 2: `.env.local.example` 키명 변경**

```
# 백엔드 API (Swagger 제작 중 → 미정)
NEXT_PUBLIC_API_BASE_URL=

# MSW 토글 (true = mock, false = 실서버)
NEXT_PUBLIC_USE_MOCK=true
```

> 실행자 주의: 로컬 `.env.local`(gitignore)도 동일 키명으로 직접 갱신해야 dev에서 동작한다.

- [ ] **Step 3: `index.html`·`src/main.tsx` 삭제 (사용자 확인 후)**

layout.tsx/providers.tsx가 대체. (`import.meta.env.VITE_USE_MOCK`·`import.meta.env.DEV`는 이 두 파일에만 있었고 enableMocking/providers로 이전됨 → 잔존 `import.meta.env` 없음.)

- [ ] **Step 4: 잔존 `import.meta.env`·`VITE_` 없음 확인**

Run: `grep -rn "import.meta.env\|VITE_" src`
Expected: 매치 없음(출력 없음).

- [ ] **Step 5: 검증 체크포인트 — `pnpm type-check`**

Run: `pnpm type-check`
Expected: PASS. (`panda codegen` 선행 후 `tsc --noEmit`. `next-env.d.ts`가 없어 에러나면 `pnpm exec next telemetry status` 또는 다음 Task에서 `next dev` 1회 실행으로 생성됨 — 본 단계 전 `pnpm exec next build --no-lint` 대신, 간단히 빈 `next dev` 부팅으로 생성 가능.)

- [ ] **Step 6: 커밋**

```bash
git add src/lib/ky.ts .env.local.example
git rm index.html src/main.tsx
git commit -m "refactor(MIGRATE-FE-001): NEXT_PUBLIC_* 치환 + Vite 엔트리 제거"
```

---

## Task 6: LangChain 서버 자리 — health route handler

**Files:**
- Create: `src/app/api/ai/health/route.ts`

- [ ] **Step 1: route handler 생성 (Node 런타임)**

```ts
import { NextResponse } from 'next/server';

// LangChain 서버 자리. 1차엔 헬스체크만. 실제 체인 연결은 후속 티켓.
// LangChain은 Node API에 의존하므로 Edge가 아닌 Node 런타임을 명시한다.
export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ status: 'ok', service: 'ai' });
}
```

- [ ] **Step 2: 부팅 + 수동 확인**

Run: `pnpm dev` (별도 터미널) 후 `curl http://localhost:3000/api/ai/health`
Expected: `{"status":"ok","service":"ai"}`

- [ ] **Step 3: 커밋**

```bash
git add "src/app/api/ai/health/route.ts"
git commit -m "feat(MIGRATE-FE-001): LangChain용 health route handler 골격"
```

---

## Task 7: package.json scripts + Playwright 전환

**Files:**
- Modify: `package.json` (scripts)
- Modify: `playwright.config.ts`

- [ ] **Step 1: `package.json` scripts 교체**

```json
"scripts": {
  "prepare": "panda codegen --silent",
  "dev": "panda codegen && next dev",
  "build": "panda codegen && next build",
  "start": "next start",
  "type-check": "panda codegen && tsc --noEmit",
  "lint": "biome check .",
  "format": "biome check --write .",
  "test": "vitest run --passWithNoTests",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "api:gen": "openapi-typescript docs/03-api/openapi.json -o src/types/api.ts",
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

변경 요지: `dev`/`build`를 next로, `start` 추가, `preview`(vite) 제거. Storybook·test·api:gen 유지.

- [ ] **Step 2: `playwright.config.ts` port/env 전환**

3곳 변경:

```ts
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
```

```ts
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // E2E는 항상 MSW mock으로 띄운다. NEXT_PUBLIC_USE_MOCK을 강제 주입.
    env: { NEXT_PUBLIC_USE_MOCK: 'true' },
  },
```

상단 주석의 `vite 개발 서버` 표현도 `next 개발 서버`로 갱신.

- [ ] **Step 3: 검증 체크포인트 — `pnpm test:e2e`**

Run: `pnpm test:e2e`
Expected: 기존 Playwright E2E **전부 PASS**. (webServer가 `next dev`를 3000에 띄우고 MSW mock 주입. catch-all로 모든 경로가 react-router로 처리되어 기존 spec의 네비게이션·heading 가정 그대로 유효.)

- [ ] **Step 4: 커밋**

```bash
git add package.json playwright.config.ts
git commit -m "build(MIGRATE-FE-001): scripts next 전환 + Playwright 3000/NEXT_PUBLIC 전환"
```

---

## Task 8: 문서 갱신

**Files:**
- Modify: `CLAUDE.md` (기술 스택, 자주 쓰는 명령)
- Modify: `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/architecture/routing.md`

- [ ] **Step 1: `CLAUDE.md` 기술 스택 줄 갱신**

`## 기술 스택 요약`의 첫 줄을 변경:

```
- Next.js(App Router) + React 19 (TypeScript strict) — catch-all로 react-router 호스팅(1차 최소 이전)
- 라우팅: react-router (기존 유지, src/app/[[...slug]]에 마운트)
```

`## 자주 쓰는 명령`에 반영: `pnpm dev`(= next dev), `pnpm build`(= next build), `pnpm start` 추가.

- [ ] **Step 2: `docs/architecture/routing.md`에 catch-all 패턴 주석 추가**

문서 상단에 노트 블록 추가(라우트 맵 SSOT는 react-router 그대로, Next는 단일 catch-all로 호스팅한다는 1~2문장).

- [ ] **Step 3: `docs/ARCHITECTURE.md` / `docs/DEVELOPMENT.md` dev 명령·빌드 도구 표기 갱신**

Vite → Next 표기. dev 서버 포트 5173 → 3000.

- [ ] **Step 4: 커밋**

```bash
git add CLAUDE.md docs/ARCHITECTURE.md docs/DEVELOPMENT.md docs/architecture/routing.md
git commit -m "docs(MIGRATE-FE-001): 기술스택·명령·라우팅 문서 Next 반영"
```

---

## Task 9: 최종 전수 게이트 + PR

- [ ] **Step 1: 최종 검증 전수 실행**

Run 순서대로:
- `pnpm type-check` → PASS
- `pnpm lint` → PASS (Biome)
- `pnpm test` → 단위테스트 전부 PASS
- `pnpm build` → `next build` 성공(타입체크 포함, catch-all 프리렌더 통과)
- `pnpm test:e2e` → E2E 전부 PASS

- [ ] **Step 2: dev 시각 확인 (사용자 OK 절차)**

`pnpm dev` 후 사용자가 본인 브라우저로 주요 화면(`/`, `/login`, `/search`) 렌더 확인. (Playwright resize/navigate로 사용자 브라우저를 흔들지 않는다.)

- [ ] **Step 3: PR 생성 (pr-creating)**

- 본인 머지 금지(1명 승인 후 머지).
- PR 본문에 **백엔드 4명 무영향**(독립 서버, 인증·API 계약·쿠키 무변경) 명시.
- **롤백 = PR revert 기준** 명시.

---

## Self-Review 결과

- **Spec 커버리지:** 설계 §5.1~5.9 전부 태스크에 매핑 — 엔트리(T3)/MSW gate+window가드(T3)/env 3종+example(T5)/빌드설정(T1,T7)/tsconfig(T2)/Vitest분리(T2)/Panda(T3 layout import)/route handler(T6)/gitignore(T1). 검증(§6)은 각 체크포인트 + T9. 문서(§7)는 T8. 롤아웃·롤백(§8)은 T9.
- **Placeholder 스캔:** 모든 코드 스텝에 실제 코드 포함. TBD/TODO 없음.
- **타입 일관성:** `enableMocking()`(T3 정의) → providers `mockingPromise`(T3 사용), `App` named export(`@/App`) → client.tsx `m.App`(T4), `NEXT_PUBLIC_USE_MOCK`/`NEXT_PUBLIC_API_BASE_URL` 키명 T3/T5/T7 일치.
- **주의(실행자):** `next-env.d.ts`는 `next dev`/`next build` 최초 1회 실행 시 생성된다. T5 type-check 전 미생성이면 짧게 `next dev` 부팅 후 종료해 생성한다.
