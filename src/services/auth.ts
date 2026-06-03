import { HTTPError } from 'ky';
import { api } from '@/lib/ky';

// 인증 도메인 서비스 레이어.
// ⏳ Swagger 미완 상태라 한시적으로 lib/ky로 직접 호출한다(api_client.md).
//   백엔드 계약 확정 후 /api-sync로 생성되는 src/lib/api/auth 조합으로 교체한다
//   (이 파일에 저수준 호출을 남기지 않는다).
//
// 인증은 httpOnly Cookie 전제(auth.md): 토큰 문자열을 직접 다루지 않는다.
//   ky 인스턴스(src/lib/ky.ts)가 credentials:'include'로 쿠키를 자동 전송/수신하며,
//   Authorization 헤더를 클라이언트에서 조립하지 않는다.

// 로그인 응답 사용자 — 자동 생성물(src/types/api.ts) 직접 편집 금지라 한시적 로컬 정의.
// 계약 확정 시 생성 타입으로 교체한다.
export interface AuthUser {
  id: string;
  nickname: string;
  // 설문 완료 여부 — 메인 진입 분기(개인화 홈 vs 게스트 홈)에 사용한다(MAIN-FE-006).
  // ⚠️ 백엔드 계약에 아직 없는 가정 필드다. 응답에 없으면 false로 기본 처리하며,
  //    백엔드에 `has_completed_survey` 추가를 요청한다(docs/03-api/backend-requests.md).
  hasCompletedSurvey: boolean;
}

// 백엔드 원시 응답의 user(snake_case 일부 가정 필드 포함) — 매핑 전 형태.
interface AuthUserRaw {
  id: string;
  nickname: string;
  // 백엔드가 추가 예정인 설문 완료 플래그(현재 mock만 제공). 없으면 매핑에서 false.
  has_completed_survey?: boolean;
}

interface AuthResponseRaw {
  user: AuthUserRaw;
}

// 원시 user → 도메인 AuthUser. 설문 플래그는 없으면 false로 안전 기본 처리한다.
function mapAuthUser(raw: AuthUserRaw): AuthUser {
  return {
    id: raw.id,
    nickname: raw.nickname,
    hasCompletedSurvey: raw.has_completed_survey ?? false,
  };
}

export interface LoginResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// 로그인 실패 유형 — 폼 레벨 에러 메시지 분기에 사용한다.
// - 'invalid-credentials': 401(ERROR-FE-003) — 잘못된 자격증명
// - 'generic': 그 외 4xx/5xx/네트워크 — 재시도 가능한 일반 오류
export type LoginErrorKind = 'invalid-credentials' | 'generic';

export class LoginError extends Error {
  readonly kind: LoginErrorKind;

  constructor(kind: LoginErrorKind) {
    super(kind);
    this.name = 'LoginError';
    this.kind = kind;
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const raw = await api
      .post('api/auth/login', { json: payload })
      .json<AuthResponseRaw>();
    return { user: mapAuthUser(raw.user) };
  } catch (error) {
    // 401은 잘못된 자격증명, 그 외는 일반 오류로 정규화한다.
    if (error instanceof HTTPError && error.response.status === 401) {
      throw new LoginError('invalid-credentials');
    }
    throw new LoginError('generic');
  }
}

// 회원가입(LOGIN-FE-003) 요청 페이로드 — Figma STEP1 계정정보 + 약관 동의.
// 비밀번호 확인(passwordConfirm)은 클라 검증용이라 서버로 보내지 않는다.
export interface SignupPayload {
  email: string;
  password: string;
  ageOver14: boolean;
  termsOfService: boolean;
  privacy: boolean;
  marketing: boolean;
}

export interface SignupResponse {
  user: AuthUser;
}

// 회원가입 실패 유형 — 폼 레벨 에러 분기에 사용한다.
// - 'email-taken': 409 — 이미 가입된 이메일
// - 'generic': 그 외 4xx/5xx/네트워크
export type SignupErrorKind = 'email-taken' | 'generic';

export class SignupError extends Error {
  readonly kind: SignupErrorKind;

  constructor(kind: SignupErrorKind) {
    super(kind);
    this.name = 'SignupError';
    this.kind = kind;
  }
}

export async function signupWithEmail(
  payload: SignupPayload,
): Promise<SignupResponse> {
  try {
    const raw = await api
      .post('api/auth/signup', { json: payload })
      .json<AuthResponseRaw>();
    return { user: mapAuthUser(raw.user) };
  } catch (error) {
    // 409는 이메일 중복, 그 외는 일반 오류로 정규화한다.
    if (error instanceof HTTPError && error.response.status === 409) {
      throw new SignupError('email-taken');
    }
    throw new SignupError('generic');
  }
}

// ── 이메일 인증(LOGIN-FE-004 STEP2) ──────────────────────────────────────────
// 인증 코드 발송/검증·이메일 실시간 중복확인. 전부 httpOnly Cookie 전제(토큰 미조립)이며
// Swagger 미완 동안 한시적 수동 호출이다(/api-sync 후 생성물 조합으로 교체).

// 인증 코드 발송 응답 — 유효시간(초). 클라 카운트다운 타이머의 초기값으로 쓴다.
export interface EmailVerificationResponse {
  ttlSeconds: number;
}

// 인증 코드 발송(최초/재전송 공용). 재전송 쿨다운은 클라이언트가 제어한다(서버는 동일 엔드포인트).
export async function requestEmailVerification(
  email: string,
): Promise<EmailVerificationResponse> {
  return await api
    .post('api/auth/email/verification', { json: { email } })
    .json<EmailVerificationResponse>();
}

// 인증 코드 검증 실패 유형 — 폼 레벨 에러 분기에 사용한다.
// - 'invalid-code': 400/422 — 코드 불일치
// - 'expired': 410 — 코드 만료(타이머 0 또는 서버 만료)
// - 'generic': 그 외 4xx/5xx/네트워크
export type VerifyErrorKind = 'invalid-code' | 'expired' | 'generic';

export class VerifyError extends Error {
  readonly kind: VerifyErrorKind;

  constructor(kind: VerifyErrorKind) {
    super(kind);
    this.name = 'VerifyError';
    this.kind = kind;
  }
}

export interface VerifyEmailCodePayload {
  email: string;
  code: string;
}

export async function verifyEmailCode(
  payload: VerifyEmailCodePayload,
): Promise<void> {
  try {
    await api.post('api/auth/email/verify', { json: payload });
  } catch (error) {
    // 410=만료, 400/422=코드 불일치, 그 외=일반 오류로 정규화한다.
    if (error instanceof HTTPError) {
      const status = error.response.status;
      if (status === 410) throw new VerifyError('expired');
      if (status === 400 || status === 422)
        throw new VerifyError('invalid-code');
    }
    throw new VerifyError('generic');
  }
}

// 이메일 중복확인 — STEP1 이메일 필드 실시간 표시용.
// 네트워크/4xx 등 실패는 호출부에서 "확인 불가"로 degrade한다(가입을 막지 않는다).
export interface EmailAvailability {
  available: boolean;
}

export async function checkEmailAvailability(
  email: string,
): Promise<EmailAvailability> {
  return await api
    .get('api/auth/email/check', { searchParams: { email } })
    .json<EmailAvailability>();
}
