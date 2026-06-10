# routing.md — 라우팅 (Vite React SPA + React Router)

## 핵심 규칙 (인라인 룰 추출용)

- 라우트 정의는 `src/routes/`에 둔다 (React Router, 라우트 SSOT). **파일 라우팅으로 갈아엎지 않는다.**
- 앱 진입은 `index.html` → `src/main.tsx`(`createRoot`)에서 `App`을 마운트한다. (이력: MIGRATE-FE-001에서 Next `src/app/[[...slug]]` catch-all로 호스팅했으나 MIGRATE-FE-002에서 Next 제거하고 Vite SPA로 복귀.)
- env는 `import.meta.env.VITE_*`를 쓴다(`NEXT_PUBLIC_*`/`process.env` 아님).
- 라우트 접근 권한(REQ 3.1 사용자 상태)을 가드로 분기: Public / Public only / Auth.
- 로그인 필요 화면은 비로그인 시 `/login`으로 보내고 `redirect` 값을 보존해 복귀시킨다.
- 인증 보호 로직은 한 곳(route guard / API client boundary)에 모은다.

## 폴더/파일 위치

```
src/
├── App.tsx
└── routes/
    ├── index.tsx            라우트 정의 (createBrowserRouter)
    ├── guards/              ProtectedRoute, PublicOnlyRoute
    └── <route>.tsx          페이지 엔트리
```

## 확정 라우트 맵 (FE 라우팅 정의서)

> 이 표가 라우트 경로의 SSOT다. `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md` 4장의 라우트 표는 "구현 편의용 제안"이며(해당 문서 95행 명시), 실제 구조는 이 정의서를 따른다.

### 권한 유형

| 권한 | 의미 |
|---|---|
| Public | 로그인 여부와 관계없이 접근 가능 |
| Public only | 비로그인 사용자만 접근 가능. 로그인 사용자는 `/`로 리다이렉트 |
| Auth | 로그인 사용자만 접근 가능. 비로그인 사용자는 `/login`으로 리다이렉트 (redirect path 보존) |
| Technical | 사용자용 화면은 아니지만 인증/콜백 처리를 위해 필요한 기술 라우트 |

### MVP 라우트

| No | 화면명 | Route | 권한 | 비고 |
|---:|---|---|---|---|
| 1 | 메인 | `/` | Public | 서비스 홈 / 추천 배너 / 게임 목록 |
| 2 | 로그인 | `/login` | Public only | 로그인 사용자는 `/`로 리다이렉트 |
| 3 | 회원가입 | `/signup` | Public only | 이메일 회원가입 / 이메일 인증 / 닉네임 중복확인 |
| 4 | Steam OAuth 콜백 | `/auth/steam/callback` | Technical | 백엔드 OAuth 처리 방식 확정 전까지 후보 라우트 |
| 5 | 스팀 연동 | `/onboarding/steam` | Auth | **단일 플로우** — 연동 안내 / 연동하기 / 로딩 / 결과(성공·비공개·실패)를 한 페이지 step으로 처리 |
| ~~6~~ | ~~스팀 연동 결과~~ | ~~`/onboarding/steam/result`~~ | — | **제거**(STEAM-INTER-FE-001) — 결과는 별도 라우트가 아니라 `/onboarding/steam`의 result step으로 통합. cross-route 왕복이 냈던 되돌이 버그 제거 |
| 7 | 설문 인트로 | `/survey/intro` | Auth | 설문 시작 안내 |
| 8 | 설문 진행 | `/survey` | Auth | 설문 문항 진행 |
| 9 | 설문 결과 | `/survey/result` | Auth | 성향 분석 결과 / 추천 게임 |
| 10 | 검색 | `/search` | Public | 검색창 / 최근 검색 / 필터 / 검색 실패 처리 |
| 11 | 게임 추천 | `/recommendations` | Public | 추천 게임 목록 / 인기 게임 / 세일 게임 |
| 12 | 게임별 상세 | `/games/:gameId` | Public | 게임 정보 / 리뷰 / 위시리스트 / 구매 링크 |

> **구현 메모(STEAM-INTER-FE-001)**: `/onboarding/steam`(단일 플로우 intro/syncing/result·SteamOnboardingPage)과 `/auth/steam/callback`(콜백·SteamCallbackPage) 2개 호스트가 `src/routes/index.tsx` `pageElement()`에 배선됨. `/onboarding/steam/result`는 제거(결과를 result step으로 통합). 컴포넌트 6 + 훅 3은 `src/features/onboarding/`, 서비스/설정/mock은 `src/services/steam.ts`·`src/config/steam.ts`·`src/mocks/handlers/steam.ts`. 화면 전이·`?scenario` mock·REQ 갭(003~006,008)은 `src/features/onboarding/README.md` 참조. **진입 배선 적용됨**: 회원가입 완료(`SignupPage`) → `setSession`(자동 로그인) → `/onboarding/steam`(origin='steamSignup'). LOGIN-FE-005의 "가입 후 /login" 결정을 자동 로그인으로 전환(auth 영역 변경).

### 추가기능 라우트

> 커뮤니티 라우트(`/community*` 7개: 구 13~19번 — 커뮤니티 메인 / 게시글·리뷰·파티 상세 및 작성)는 **MVP 구현 생략(보류, scaffold 유지)**으로 코드(`src/routes/index.tsx`)에서 제거했다(TASK-DEVEX-016). "취소"가 아니라 추후 보류 성격이며 `src/features/community/` scaffold는 유지한다. 추후 복원 시 아래 표에 다시 추가한다.

| No | 화면명 | Route | 권한 | 비고 |
|---:|---|---|---|---|
| 20 | 마이페이지 | `/mypage` | Auth | 본인 프로필 / 라이브러리 / 성향 정보 |
| 21 | 프로필 편집 | `/mypage/edit` | Auth | 닉네임, 소개, 프로필 이미지 수정 |
| 22 | 팔로우 리스트 | `/mypage/follow` | Auth | 팔로잉 / 팔로워 목록 |
| 23 | 타인 프로필 | `/users/:userId` | Public | 다른 유저 공개 프로필 |

> (참고) 커뮤니티 복원 시: `/community/posts/new` 등 `new`는 정적 세그먼트라 `:postId` 동적 세그먼트보다 우선 매칭된다(React Router ranked matching). 충돌 없음.

### 라우팅 제외 항목 (컴포넌트 상태로 처리)

| 항목 | 처리 방식 | 이유 |
|---|---|---|
| 챗봇 | 전역 오버레이 위젯 | 페이지 이동이 아님 |
| 로그인 실패 메시지 | 컴포넌트 상태 | URL 접근 불필요 |
| 회원가입 이메일 인증 단계 | `/signup` 내부 step | 독립 페이지 불필요 |
| 설문 문항 선택 상태 | 컴포넌트 상태 | 현재 문항 내부 상태 |
| 검색 필터 열림/닫힘 | 컴포넌트 상태 | 검색 페이지 내부 UI 상태 |
| Toast / Alert / Modal | 컴포넌트 상태 | 일시적 / 비독립 UI |

### 추천 구현 순서

| 순서 | 단계 | 라우트 |
|---:|---|---|
| 1 | 기본 라우터 + 가드 | `/`, `/login` |
| 2 | 인증/온보딩 | `/signup`, `/auth/steam/callback`, `/onboarding/steam` |
| 3 | 설문/성향 | `/survey/intro`, `/survey`, `/survey/result` |
| 4 | 게임 탐색 | `/search`, `/recommendations`, `/games/:gameId` |
| 5 | 마이페이지 | `/mypage`, `/mypage/edit`, `/mypage/follow` |
| ~~6~~ | ~~커뮤니티~~ | MVP 구현 생략(보류, scaffold 유지) — TASK-DEVEX-016 |
| ~~7~~ | ~~게시글 작성~~ | MVP 구현 생략(보류, scaffold 유지) — TASK-DEVEX-016 |
| 8 | 타인 프로필 | `/users/:userId` |

### 확정 전 확인 필요 (백엔드 연동 시점에 재검토)

| 항목 | 확인 내용 | 기본 결정 |
|---|---|---|
| Steam OAuth callback | FE가 콜백을 받을지, 백엔드가 받을지 | `/auth/steam/callback` 후보 유지 |
| 회원가입 인증 단계 | `/signup` 내부 step vs 별도 route | `/signup` 내부 step |
| 타인 프로필 | MVP 포함 여부 | 추가기능 라우트로 유지 |

## 패턴

```tsx
// ✅ src/routes/guards/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuthStore();
  const location = useLocation();
  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />;
  }
  return children;
}
```

## 안티패턴

- `src/app`, `middleware.ts`, `NEXT_PUBLIC_*`를 기본값처럼 사용 (이 프로젝트는 Vite SPA)
- 가드 로직을 페이지마다 복붙
- 로그인 후 무조건 홈으로 (redirect 보존 무시)

## 관련 문서
- `auth.md` (인증 보호 흐름)
- `state_management.md` (auth 세션 상태)
