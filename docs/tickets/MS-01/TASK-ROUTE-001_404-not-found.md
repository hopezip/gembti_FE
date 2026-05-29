# TASK-ROUTE-001: 404 Not Found 페이지 라우트 추가

## 메타
- ID: TASK-ROUTE-001 (REQ에 404 전용 ID 없음 → 신규 TASK, ERROR 도메인)
- 타입: FEAT
- 생성: 2026-05-29
- 상태: DONE
- 마일스톤: MS-01
- 브랜치: feature/TASK-ROUTE-001-404-not-found
- 분기 판별: normal (1~3파일, 라우팅 한 도메인)

---

## 인라인 룰 (이 작업에서 지킬 것만)

- 색은 semantic token만 사용 (primitive `gray.900` 등 금지)
- Park UI 베이스 + panda recipe / `styled-system/css` 사용
- 다크 모드 전용 · 데스크탑 전용 (반응형 모바일 제외)
- 라우트는 `src/routes/index.tsx`의 `createBrowserRouter` 배열에 추가
- 홈 이동은 react-router-dom `Link` 사용 (a 태그 직접 사용 금지)

---

## Spec (왜) — 3~5줄

존재하지 않는 경로로 접근했을 때 빈 화면이 아니라 명확한 안내를 제공한다.
"페이지를 찾을 수 없습니다" 메시지와 홈(`/`)으로 돌아가는 링크를 보여주는
catch-all 라우트(`path: '*'`)를 추가한다. ERROR 도메인의 사용자 경험 보강이며
MVP 라우팅의 기본 안전망 역할을 한다.

---

## Plan (어떻게) — Task 단위

- Task 1: `NotFoundPage` 컴포넌트 작성 (메시지 + 홈 링크, semantic token)
- Task 2: `createBrowserRouter` 배열에 `{ path: '*', element: <NotFoundPage /> }` 추가
- Task 3: type-check / lint / build / test 검증

---

## AC (Acceptance Criteria)

- [ ] 존재하지 않는 경로(예: `/nope`) 접근 시 NotFoundPage가 렌더된다
- [ ] "페이지를 찾을 수 없습니다" 안내 문구가 보인다
- [ ] 홈(`/`)으로 가는 링크가 동작한다
- [ ] semantic token만 사용 (primitive 직접 사용 0건)
- [ ] 기존 `/` 홈 라우트는 영향 없음

---

## 영향 파일 (예상)

- `src/routes/NotFoundPage.tsx` (신규)
- `src/routes/index.tsx` (수정 — catch-all 라우트 추가)

---

## Must read docs (인라인 룰로 부족할 때만)

- `../../docs/design/DESIGN_SYSTEM.md`

---

## Related screens (있다면)

- 없음 (정의서 없는 시스템 페이지)

---

## API endpoints used

- 없음

---

## Verification (자동 검증)

### 정적
- [x] `pnpm type-check` 통과
- [x] `pnpm lint` 통과

### 원칙 (normal/cross)
- [ ] code-reviewer 에이전트 통과 (리허설 — 생략)

### 기능 (해당 시)
- [x] `pnpm test` 통과 (테스트 파일 없음, passWithNoTests)

### 수동
- [ ] 변경 화면 브라우저에서 동작 확인 (데스크탑 다크 모드) — 리허설 미실행

### 문서 (v2)
- [x] 이 파일의 `## 회고` 섹션 채움

---

## 회고 (구현 후 ticket-implementer가 채움)

- 실제로 한 일: `NotFoundPage.tsx` 신규 작성, `routes/index.tsx`에 `{ path: '*' }` catch-all 추가. type-check/lint/build/test 4개 통과.
- 빗나간 점: 처음에 `accent.emphasized`, `accent.fg`(텍스트)를 썼으나 둘 다 부적절. panda.config의 실제 토큰은 `accent.hover`(호버)이고, accent 배경 위 텍스트는 `fg.onAccent`였음(accent.fg는 orange라 orange-on-orange로 안 보임). button recipe(primary)를 참고해 교정.
- 다음에 비슷한 거 할 때: semantic token 쓰기 전 `panda.config.ts`의 semanticTokens.colors와 recipes를 먼저 확인. 특히 "배경 위 텍스트"는 `fg.onAccent` 계열, `*.fg`는 soft 배경용임을 기억.
