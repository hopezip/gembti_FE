# auth.md — 인증 (백엔드 JWT / access Bearer + refresh httpOnly 쿠키)

> ⚠️ LOGIN-FE-006에서 실서버(GEMBTI_API) 계약에 맞춰 재정합했다. LOGIN-FE-005의 "refresh=localStorage" 표기는 폐기됐다.
> 현재 방식: **access_token(메모리 Bearer) + refresh_token(httpOnly 쿠키)**. 응답 envelope 없음, 에러는 `{detail}`.
> 1차 출처: 메모리 `project_auth_backend_contract` + `https://gembti.cloud/openapi.json`.

## 핵심 규칙 (인라인 룰 추출용)

- 토큰 방식: access_token은 Zustand **메모리**, refresh_token은 **httpOnly 쿠키**(백엔드 발급/관리, FE가 읽거나 저장하지 않음).
  - access_token은 새로고침 시 사라지며, 부팅 시 쿠키 refresh로 재발급(세션 복원)한다.
- ky 단일 인스턴스(`src/lib/ky.ts`)가 `credentials:'include'`로 쿠키를 주고받고, 모든 요청에 `Authorization: Bearer <access>`를 부착한다.
- 401 응답 시 ky가 `/api/v1/auth/refresh`(쿠키, 바디 없음)로 access를 **1회만** 재발급·재시도한다(무한루프 금지, `x-retried` 플래그).
  - refresh 실패 → 세션 클리어(anonymous).
- 인증 보호 로직은 한 곳에 모은다: route guard(`src/routes/guards/`) + ky boundary(`src/lib/ky.ts`).
- 컴포넌트에서 토큰을 직접 만지지 않는다. 토큰 읽기/쓰기는 store 게터/세터 + ky boundary 전담.
- 응답 래퍼 **없음**: `AuthResponse={access_token, token_type, user}` 직접. 에러는 `{detail}`(string | 검증배열), `error_code` 없음.
- auth 관련 변경은 항상 **cross 흐름** (1줄도 위험).

## 폴더/파일 위치

- `src/features/auth/` — 인증 도메인 (LoginForm, SignupForm, EmailVerificationForm(STEP2), SteamButton)
- `src/lib/ky.ts` — `credentials:'include'` + Bearer 부착 + 401 쿠키 refresh 1회 재시도 boundary (`refreshAccessToken` export)
- `src/lib/store/useAuthStore.ts` — 세션 상태 + access(메모리) 보관 + 게터/세터(`getAccessToken`/`applyRefreshedTokens`/`clearAuthSession`)
- `src/features/auth/hooks/useSessionRestore.ts` — 부팅 시 쿠키 refresh → `/me`로 세션 복원
- `src/services/auth.ts` — `/api/v1/auth/*` 호출 + 응답 매핑(자동생성물 `src/types/api.ts` 타입 사용) + `{detail}` 에러
- `src/routes/guards/` — ProtectedRoute / PublicOnlyRoute

## REQ 인증 정책 메모 (GEMBTI_API 실계약, LOGIN-FE-006)

- 비밀번호: **10자 이상 + 특수문자 1개 이상** 필수 (특수문자는 OpenAPI 스키마 외 프로빙 발견 규칙 — 백엔드 변경 시 어긋날 수 있음). 영문/숫자는 권장(강도 표시).
- 회원가입: send-code → **verify(검증만, 토큰 없음)** → **signup(전체 필드 직접 전송)** 강제 순서. verify 미통과 시 signup 403. signup_token 흐름 폐기.
  - signup 필드: email / password / password_confirm / nickname / gender / birth_date / age_confirmed.
- 닉네임: **2~8자**, 특수기호 불가. (실시간 중복확인 엔드포인트 없음 → 제거. 중복은 signup 응답으로만 판별)
- 성별: `male | female | other` (UI에서 other="선택 안 함"). 백엔드 optional.
- 연령 확인: **만 15세 이상 확인(age_confirmed) 필수 boolean 1개** (LOGIN-FE-008, 기존 약관 2필드 대체).
- 이메일 인증 코드 유효시간: 응답에 `expires_in` 없음 → FE 상수 TTL(`src/config/auth.ts`).
- Steam OpenID/OAuth 소셜 로그인 (`LOGIN-FE-002`) — 후속.

## 토큰 흐름

```typescript
// 로그인/가입 성공 → store에 access(메모리)만 저장(refresh는 응답 바디에 없고 Set-Cookie로 옴)
setSession({ user, accessToken });

// ky: credentials:'include'(쿠키) + 메모리 access를 Bearer로 부착
request.headers.set('Authorization', `Bearer ${getAccessToken()}`);

// ky afterResponse 401: 쿠키 refresh(바디 없음)로 1회 재발급 후 원요청 재시도
//   재시도 요청에 x-retried=1 → 두 번째 401이면 더 재시도하지 않고 세션 클리어

// 부팅 세션 복원: refreshAccessToken()(쿠키) → 성공 시 getMe()로 user 복원
```

## 안티패턴

```typescript
// ❌ refresh_token을 localStorage/JS에서 읽거나 저장 (httpOnly 쿠키 — 백엔드 전담)
localStorage.setItem('refresh_token', token);

// ❌ access_token을 localStorage에 저장 (access는 메모리만)

// ❌ 응답을 { status, data, error_code } 래퍼로 가정 (envelope 없음 — 바디 직접/에러는 {detail})

// ❌ 컴포넌트에서 Authorization 헤더를 직접 조립 (ky boundary가 전담)

// ❌ 401 refresh 재시도를 무제한 반복 (반드시 1회 제한)

// ❌ auth 코드 1줄만 고치고 normal 흐름으로 (반드시 cross)
```

## CORS / 배포 주의

- 쿠키 인증(refresh)이 동작하려면 백엔드 CORS `allow-credentials:true` + `allow-origin`에 정확한 오리진 반향이 필요하다.
- 현재 실측 허용 오리진: `http://localhost:3000`. **배포 오리진은 백엔드 협의로 allowlist 추가 필요**(LOGIN-FE-006 R1).

## 관련 문서
- `routing.md` (보호 라우트 가드)
- `api_client.md` (ky boundary)
- `state_management.md` (세션 상태)
