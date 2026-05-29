# auth.md — 인증 (백엔드 JWT + httpOnly Cookie)

## 핵심 규칙 (인라인 룰 추출용)

- 토큰은 httpOnly Cookie만 사용 (**localStorage/sessionStorage에 토큰 저장 금지**)
- 인증 보호 로직은 한 곳에 모은다: route guard(`src/routes/guards/`) + ky boundary(`src/lib/ky.ts`)
- 로그인/로그아웃/갱신은 백엔드 API 계약을 우선, 프론트는 세션 상태(Zustand)와 에러 표시 담당
- auth 관련 변경은 항상 **cross 흐름** (1줄도 위험)

## 폴더/파일 위치

- `src/features/auth/` — 인증 도메인 (LoginForm, SignupForm, EmailVerificationForm, SteamLoginButton)
- `src/lib/ky.ts` — `credentials: 'include'`로 쿠키 자동 전송, 401 인터셉터
- `src/lib/store/authStore.ts` — 세션 상태 (REQ 3.1 상태 머신)
- `src/routes/guards/` — ProtectedRoute / PublicOnlyRoute

## REQ 인증 정책 메모

- 비밀번호: 10자 이상 + 영문/숫자 포함 (`LOGIN-FE-003`)
- 이메일 6자리 인증 + 닉네임 중복확인 (`LOGIN-FE-004`)
- 만 15세 미만 가입 제한 (`LOGIN-FE-003`)
- 자동 로그인 옵션 (`LOGIN-FE-005`) — 지속 세션은 백엔드 쿠키 만료 정책에 위임
- Steam OpenID/OAuth 소셜 로그인 (`LOGIN-FE-002`) — 인증 방식 표기는 백엔드 계약 확인 필요(REQ 13장)

## 패턴

```typescript
// ✅ 백엔드가 Set-Cookie로 발급, 클라이언트는 토큰 문자열을 직접 저장하지 않음
import { api } from '@/lib/ky';
export const getMe = () => api.get('users/me').json<User>();
export const logout = () => api.post('auth/logout');
```

## 안티패턴

```typescript
// ❌ localStorage에 토큰
localStorage.setItem('token', token);

// ❌ Authorization 헤더를 클라이언트에서 임의 조립
fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });

// ❌ auth 코드 1줄만 고치고 normal 흐름으로 (반드시 cross)
```

## 관련 문서
- `routing.md` (보호 라우트 가드)
- `api_client.md` (Cookie 자동 전송)
- `state_management.md` (세션 상태)
