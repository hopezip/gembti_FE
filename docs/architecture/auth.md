# auth.md — 인증 (백엔드 JWT + 토큰 바디 / Bearer 헤더)

> ⚠️ LOGIN-FE-005에서 토큰 방식을 전환했다. 이전 "httpOnly Cookie 전제"는 폐기됐다.
> 현재 방식: **access_token(메모리) + refresh_token(localStorage) + Authorization: Bearer 헤더**.

## 핵심 규칙 (인라인 룰 추출용)

- 토큰 방식: access_token은 Zustand **메모리**, refresh_token은 **localStorage**에 저장한다.
  - access_token은 새로고침 시 사라지며, 부팅 시 refresh_token으로 재발급(세션 복원)한다.
- ky 단일 인스턴스(`src/lib/ky.ts`)가 모든 요청에 `Authorization: Bearer <access>`를 부착한다.
- 401 응답 시 ky가 refresh로 access를 **1회만** 재발급·재시도한다(무한루프 금지, `x-retried` 플래그).
  - refresh 실패/refresh_token 없음 → 세션 클리어(anonymous).
- 인증 보호 로직은 한 곳에 모은다: route guard(`src/routes/guards/`) + ky boundary(`src/lib/ky.ts`).
- 컴포넌트에서 토큰을 직접 만지지 않는다. 토큰 읽기/쓰기는 store 게터/세터 + ky boundary 전담.
- 응답 래퍼는 공통 `{ status:'SUCCESS'|'FAIL', data, message?, error_code? }` (토큰은 `data`에).
- auth 관련 변경은 항상 **cross 흐름** (1줄도 위험).

## 폴더/파일 위치

- `src/features/auth/` — 인증 도메인 (LoginForm, SignupForm, EmailVerificationForm(STEP2), SteamButton)
- `src/lib/ky.ts` — Bearer 헤더 부착 + 401 refresh 1회 재시도 boundary
- `src/lib/store/useAuthStore.ts` — 세션 상태 + 토큰 보관(access 메모리 / refresh localStorage) + 토큰 게터/세터
- `src/features/auth/hooks/useSessionRestore.ts` — 부팅 시 refresh로 세션 복원
- `src/services/auth.ts` — `/api/v1/auth/*` 호출 + 래퍼/토큰 바디 매핑
- `src/routes/guards/` — ProtectedRoute / PublicOnlyRoute

## REQ 인증 정책 메모

- 비밀번호: **8자 이상** + 영문/숫자 포함 (`LOGIN-FE-005` 백엔드 계약)
- 회원가입 STEP2: 이메일 6자리 코드(verify-code→signup_token) + 닉네임 실시간 중복확인(check-nickname) + 생년월일/성별
- 닉네임: 2~12자, 특수기호 불가
- 만 14세 이상 한 줄 동의(약관 그룹 폐지)
- Steam OpenID/OAuth 소셜 로그인 (`LOGIN-FE-002`) — 후속

## 토큰 흐름

```typescript
// 로그인/가입 성공 → store에 access(메모리)+refresh(localStorage) 저장
setSession({ user, accessToken, refreshToken });

// ky beforeRequest: 메모리 access를 Bearer로 부착
request.headers.set('Authorization', `Bearer ${getAccessToken()}`);

// ky afterResponse 401: refresh_token으로 1회 재발급 후 원요청 재시도
//   재시도 요청에 x-retried=1 → 두 번째 401이면 더 재시도하지 않고 세션 클리어
```

## 안티패턴

```typescript
// ❌ access_token을 localStorage에 저장 (access는 메모리만)
localStorage.setItem('access_token', token);

// ❌ 컴포넌트에서 Authorization 헤더를 직접 조립 (ky boundary가 전담)
fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });

// ❌ 401 refresh 재시도를 무제한 반복 (반드시 1회 제한)

// ❌ auth 코드 1줄만 고치고 normal 흐름으로 (반드시 cross)
```

## 관련 문서
- `routing.md` (보호 라우트 가드)
- `api_client.md` (ky boundary)
- `state_management.md` (세션 상태)
