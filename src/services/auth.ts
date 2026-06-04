import { HTTPError } from 'ky';
import { api } from '@/lib/ky';

// 인증 도메인 서비스 레이어 (LOGIN-FE-005 백엔드 계약 정합화).
// ⏳ Swagger 미완 상태라 한시적으로 lib/ky로 직접 호출한다(api_client.md).
//   백엔드 계약 확정 후 /api-sync로 생성되는 src/lib/api/auth 조합으로 교체한다.
//
// 인증 방식(LOGIN-FE-005): access_token(메모리) + refresh_token(localStorage) + Bearer 헤더.
//   ky 인스턴스(src/lib/ky.ts)가 Authorization 헤더 부착과 401 refresh 재시도를 전담한다.
//   서비스는 엔드포인트(`/api/v1/auth/*`)와 응답 래퍼(`{status,data,message,error_code}`) 매핑만 담당한다.

// ── 응답 래퍼 ────────────────────────────────────────────────────────────────
// 백엔드 공통 응답: { status:'SUCCESS'|'FAIL', data, message?, error_code? }.
export interface ApiEnvelope<T> {
  status: 'SUCCESS' | 'FAIL';
  data: T;
  message?: string;
  error_code?: string;
}

// ── 사용자/토큰 ──────────────────────────────────────────────────────────────
// 로그인 응답 사용자 — 자동 생성물(src/types/api.ts) 직접 편집 금지라 한시적 로컬 정의.
export interface AuthUser {
  id: string;
  nickname: string;
  // 설문 완료 여부 — 메인 진입 분기(개인화 홈 vs 게스트 홈)에 사용(MAIN-FE-006).
  // ⚠️ 백엔드 명세에 아직 없는 가정 필드. 응답에 없으면 false로 기본 처리(mock만 제공).
  hasCompletedSurvey: boolean;
}

// 토큰 묶음(도메인). 백엔드 토큰 바디를 store로 전달할 때 사용한다.
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthUserRaw {
  id: string;
  nickname: string;
  has_completed_survey?: boolean;
}

// 토큰 바디(snake_case) — 로그인/가입/refresh 응답 data에 실린다.
interface AuthTokenRaw {
  access_token: string;
  refresh_token: string;
}

interface AuthSessionRaw extends AuthTokenRaw {
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

function mapTokens(raw: AuthTokenRaw): AuthTokens {
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
  };
}

// ── 로그인 ───────────────────────────────────────────────────────────────────
export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// 로그인 실패 유형 — 폼 레벨 에러 메시지 분기.
// - 'invalid-credentials': 401({status:'FAIL'}) — 잘못된 자격증명
// - 'generic': 그 외 4xx/5xx/네트워크
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
    const env = await api
      .post('api/v1/auth/login', { json: payload })
      .json<ApiEnvelope<AuthSessionRaw>>();
    return {
      user: mapAuthUser(env.data.user),
      tokens: mapTokens(env.data),
    };
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      throw new LoginError('invalid-credentials');
    }
    throw new LoginError('generic');
  }
}

// ── 인증 코드 발송(STEP2 진입 시) ────────────────────────────────────────────
// 발송 응답의 expires_in(초)을 카운트다운 타이머 초기값으로 쓴다.
export interface SendCodeResponse {
  expiresInSeconds: number;
}

interface SendCodeRaw {
  expires_in: number;
}

// 인증 코드 발송(최초/재전송 공용). 재전송 쿨다운은 클라이언트가 제어한다.
export async function sendEmailCode(email: string): Promise<SendCodeResponse> {
  const env = await api
    .post('api/v1/auth/email/send-code', { json: { email } })
    .json<ApiEnvelope<SendCodeRaw>>();
  return { expiresInSeconds: env.data.expires_in };
}

// ── 인증 코드 검증 → signup_token 발급 ───────────────────────────────────────
export interface VerifyCodeResult {
  signupToken: string;
}

interface VerifyCodeRaw {
  signup_token: string;
}

// 인증 코드 검증 실패 유형.
// - 'invalid-code': 400/422 — 코드 불일치
// - 'expired': 410 — 코드 만료
// - 'generic': 그 외
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

// 코드 검증 성공 시 signup_token을 반환한다. signup 호출에 이 토큰을 사용한다.
export async function verifyEmailCode(
  payload: VerifyEmailCodePayload,
): Promise<VerifyCodeResult> {
  try {
    const env = await api
      .post('api/v1/auth/email/verify-code', { json: payload })
      .json<ApiEnvelope<VerifyCodeRaw>>();
    return { signupToken: env.data.signup_token };
  } catch (error) {
    if (error instanceof HTTPError) {
      const status = error.response.status;
      if (status === 410) throw new VerifyError('expired');
      if (status === 400 || status === 422)
        throw new VerifyError('invalid-code');
    }
    throw new VerifyError('generic');
  }
}

// ── 닉네임 중복확인 ──────────────────────────────────────────────────────────
export interface NicknameAvailability {
  available: boolean;
}

interface NicknameAvailabilityRaw {
  available: boolean;
}

// 닉네임 실시간 중복확인 — STEP2 닉네임 필드 표시용.
// 네트워크/4xx 등 실패는 호출부에서 "확인 불가"로 degrade한다(가입을 막지 않는다).
export async function checkNicknameAvailability(
  nickname: string,
): Promise<NicknameAvailability> {
  const env = await api
    .get('api/v1/auth/check-nickname', { searchParams: { nickname } })
    .json<ApiEnvelope<NicknameAvailabilityRaw>>();
  return { available: env.data.available };
}

// ── 회원가입(signup_token + 프로필) ──────────────────────────────────────────
// signup_token + password + nickname이 필수. birth/gender는 백엔드 명세엔 아직 없어
//   mock에만 전송한다(REQ-002로 추가 요청). 응답은 토큰 바디 + user(자동 로그인 가능).
export interface SignupPayload {
  signupToken: string;
  password: string;
  nickname: string;
  // 생년월일(YYYY-MM-DD) — 명세 외 추가 요청 필드(REQ-002).
  birth: string;
  // 성별 — 명세 외 추가 요청 필드(REQ-002).
  gender: 'male' | 'female' | 'unspecified';
}

export interface SignupResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// 회원가입 실패 유형.
// - 'nickname-duplicated': error_code 'NICKNAME_DUPLICATED' — 닉네임 중복
// - 'generic': 그 외
export type SignupErrorKind = 'nickname-duplicated' | 'generic';

export class SignupError extends Error {
  readonly kind: SignupErrorKind;

  constructor(kind: SignupErrorKind) {
    super(kind);
    this.name = 'SignupError';
    this.kind = kind;
  }
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  try {
    const env = await api
      .post('api/v1/auth/signup', {
        json: {
          signup_token: payload.signupToken,
          password: payload.password,
          nickname: payload.nickname,
          // 명세 외 필드(REQ-002) — 백엔드 미수용 시 무시되어도 안전하다.
          birth: payload.birth,
          gender: payload.gender,
        },
      })
      .json<ApiEnvelope<AuthSessionRaw>>();
    return {
      user: mapAuthUser(env.data.user),
      tokens: mapTokens(env.data),
    };
  } catch (error) {
    // 닉네임 중복은 error_code로 식별한다(HTTP 상태와 무관하게 본문 우선).
    if (error instanceof HTTPError) {
      const body = await error.response
        .json<ApiEnvelope<unknown>>()
        .catch(() => null);
      if (body?.error_code === 'NICKNAME_DUPLICATED') {
        throw new SignupError('nickname-duplicated');
      }
    }
    throw new SignupError('generic');
  }
}
