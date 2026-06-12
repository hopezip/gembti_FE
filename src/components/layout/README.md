# `src/components/layout` — 글로벌 셸 / 레이아웃

모든 라우트를 감싸는 공통 셸(Header / 콘텐츠 / Footer)과 그 하위 UI를 둔다.
출처: `docs/design/DESIGN_SYSTEM.md` 4.1 글로벌 셸, `docs/architecture/routing.md` 확정 라우트 맵.

## 규칙

- 색은 **semantic token만**(`bg.canvas`/`bg.surface`/`fg.*`/`accent.*`/`border.*`). primitive/hex/인라인 `style=` 금지.
- `panda.config.ts`/`src/theme/*` **무변경** — 새 토큰/recipe/textStyle 추가 금지. `styled-system/css`/`patterns` + 기존 토큰으로만 구성한다(변경 시 cross).
- 라우트 경로/권한 SSOT는 `routing.md`. Nav 노출 항목도 거기서 도출한다.
- `useAuthStore`는 **읽기 전용**(`status`만 구독). 인증 로직(로그인/로그아웃/세션)은 여기서 만들지 않는다.
- 페이지 좌우 거터·콘텐츠 폭은 `PageContainer.tsx`의 `pageGutter`(24px)·`pageContainer`(maxW = `containerLg − 거터×2` = **1232px**, 카드 290 그리드 규격) **단일 출처**를 쓴다. `px`/`maxW` 값을 페이지에 직접 박지 않는다. bg·border가 화면 끝까지 닿아야 하는 요소는 컴포넌트 대신 두 스타일 조각을 합성한다(2층: 거터=전체폭 요소, 폭=안쪽 요소).

## 등재 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---|---|---|
| `GlobalShell` | `GlobalShell.tsx` | layout 라우트 element. `<Header/>` → `<Outlet/>` → `<Footer/>`를 세로 스택으로 조립하고 전역 `ScrollToTopButton`/`Toaster`를 한 번만 렌더한다. `min-h 100vh` + flex column 으로 Footer를 하단 고정한다. |
| `Header` | `Header.tsx` | 상단 `sticky` 헤더. base(640px 미만)는 로고·프로필과 fixed 하단 내비게이션(홈/추천/검색), `sm` 이상은 `[Logo][Nav] … [SearchInput][프로필 메뉴]`를 표시한다. |
| `HeaderProfileMenu` | `HeaderProfileMenu.tsx` | 인증 상태에 따라 로그인 링크 또는 프로필 드롭다운(마이페이지/로그아웃)을 표시한다. |
| `MobileBottomNav` | `MobileBottomNav.tsx` | base에서만 `document.body` portal로 렌더되는 fixed 하단 내비게이션. |
| `Nav` | `Nav.tsx` | `<nav aria-label>` landmark. `react-router` `NavLink` active 시 하단 2px `accent.default` 바, gap 22px. 항목: 홈 `/`·게임 추천 `/recommendations`. 설문 진입은 메인 배너 CTA로 제공한다. 검색은 헤더 검색창으로 분리. 커뮤니티는 MVP 구현 생략(보류, scaffold 유지)으로 비노출(TASK-DEVEX-016). |
| `Logo` | `Logo.tsx` | `display` 폰트 italic·`letterSpacing.widest` "GAMBITI" 워드마크. `<Link to="/">`. |
| `Footer` | `Footer.tsx` | `<footer>`(border-top). `caption` 캡션과 GitHub 저장소 링크를 표시하며, 모바일에서는 fixed 하단 내비게이션 높이만큼 안전 여백을 둔다. |
| `ScrollToTopButton` | `ScrollToTopButton.tsx` | 400px 이상 스크롤하면 나타나는 전역 탑 버튼. 모션 감소 설정을 존중하고 모바일 하단 내비게이션 위에 배치한다. |
| `PageContainer` | `PageContainer.tsx` | 페이지 좌우 거터/콘텐츠 폭 **단일 출처**. `pageGutter`(`px:'6'`=24px)·`pageContainer`(`maxW = calc(containerLg − spacing.6×2)` = 1232px·`mx:auto`, 카드 290 그리드 규격 — TASK-UI-011) 스타일 조각과, 둘을 2층으로 합친 `PageContainer` 컴포넌트(풀폭 bg/border 불필요한 일반 콘텐츠용)를 export. |

## 라우트 적용

`src/routes/index.tsx`의 `routeObjects`는 `{ element: <GlobalShell/>, children: [...전 라우트...] }` 단일 layout 라우트로 구성된다. 기존 가드(`PublicOnlyRoute`/`ProtectedRoute`)·권한표·`mvpRoutes`+`extraRoutes` SSOT는 그대로 children으로 이동했다. NotFound(`*`)도 셸 안에 있어 404에서도 Header/Footer가 보인다.

## 알려진 한계

- `useAuthStore` stub이 항상 `anonymous`라, 로그인-후 Avatar 분기는 stub `status`를 임시로 `'authenticated'`로 바꿔야 시각 확인된다(auth 인프라 티켓 전까지).
