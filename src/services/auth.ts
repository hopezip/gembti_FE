import { HTTPError } from 'ky';
import { api } from '@/lib/ky';
import type { components } from '@/types/api';

// 인증 도메인 서비스 레이어 (LOGIN-FE-006 실서버(GEMBTI_API) 계약 정합).
// 백엔드: FastAPI / OpenAPI 3.1 / https://gembti.cloud. 응답 envelope 없음, 에러는 {detail}.
//   - 토큰: access_token(메모리 Bearer) + refresh_token(httpOnly 쿠키, 바디에 없음).
//   - ky 인스턴스(src/lib/ky.ts)가 Authorization 부착·401 refresh(쿠키) 재시도·{detail} 파싱을 전담한다.
//   - 타입은 자동생성물(src/types/api.ts)에서 가져와 snake_case 응답을 도메인(camel)으로 매핑만 한다.

type AuthResponse = components['schemas']['AuthResponse'];
type AccessTokenResponse = components['schemas']['AccessTokenResponse'];
type UserResponse = components['schemas']['UserResponse'];
type LoginRequest = components['schemas']['LoginRequest'];
type SignupRequest = components['schemas']['SignupRequest'];
type Gender = components['schemas']['Gender'];

// ── 사용자/세션 ──────────────────────────────────────────────────────────────
// 도메인 사용자. 백엔드 UserResponse(id:number 외 다수)에서 화면이 쓰는 최소 필드만 추린다.
//   steam_linked 등 스팀 필드는 UserResponse(api.ts)에 있고 소비는 스팀 티켓이 담당한다.
export interface AuthUser {
  id: number;
  email: string;
  nickname: string;
  // 설문 완료 여부 — 메인 진입 분기(개인화 홈 vs 게스트 홈, MAIN-FE-006)에 사용.
  // ⚠️ 백엔드 UserResponse에 아직 없는 가정 필드(project_personalized_home 갭). 항상 false로 둔다.
  //    이 티켓 범위 밖이라 분기 코드는 건드리지 않고 격리만 한다(LOGIN-FE-006 R4).
  hasCompletedSurvey: boolean;
}

// 인증 세션 결과 — 로그인/가입 성공 시 user + access(메모리)를 함께 반환한다.
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export type LoginResponse = AuthSession;
export type SignupResponse = AuthSession;

// UserResponse(snake) → 도메인 AuthUser.
function mapAuthUser(raw: UserResponse): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    nickname: raw.nickname,
    hasCompletedSurvey: false,
  };
}

// ── 에러 파싱 ────────────────────────────────────────────────────────────────
// 백엔드 에러: 비즈니스 { "detail": "메시지" } / 검증 { "detail": [{loc,msg,type}] }.
//   error_code는 없다. detail을 사람이 읽을 한 줄로 정규화한다.
async function parseDetail(error: unknown): Promise<string | null> {
  if (!(error instanceof HTTPError)) return null;
  const body = await error.response
    .json<{ detail?: unknown }>()
    .catch(() => null);
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    return first?.msg ?? null;
  }
  return null;
}

// ── 로그인 ───────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

// 로그인 실패 유형 — 폼 레벨 에러 메시지 분기.
// - 'invalid-credentials': 401 — 잘못된 자격증명
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
    const res = await api
      .post('api/v1/auth/login', { json: payload satisfies LoginRequest })
      .json<AuthResponse>();
    // ky가 비정상 응답에 throw하지 않은 경우 방어(에러 바디를 200처럼 파싱한 상황 등):
    //   토큰/유저가 없으면 자격증명 실패로 본다.
    if (!res?.access_token || !res.user) {
      throw new LoginError('invalid-credentials');
    }
    return { user: mapAuthUser(res.user), accessToken: res.access_token };
  } catch (error) {
    if (error instanceof LoginError) throw error;
    if (error instanceof HTTPError && error.response.status === 401) {
      throw new LoginError('invalid-credentials');
    }
    throw new LoginError('generic');
  }
}

// ── 인증 코드 발송(STEP2 진입 시) ────────────────────────────────────────────
// 발송 응답은 MessageResponse(expires_in 없음). 카운트다운은 FE 상수 TTL을 쓴다.
export async function sendEmailCode(email: string): Promise<void> {
  await api.post('api/v1/auth/email/send-code', { json: { email } }).json();
}

// ── 인증 코드 검증 ───────────────────────────────────────────────────────────
// 응답은 MessageResponse(토큰 없음). 검증만 하고, 실제 가입은 signup이 전체 필드로 수행한다.
//   ⚠️ verify를 통과하지 않으면 signup이 403으로 거부된다(send-code → verify → signup 강제 순서).

// 코드 검증 실패 유형.
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

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<void> {
  try {
    await api.post('api/v1/auth/email/verify', { json: payload }).json();
  } catch (error) {
    if (error instanceof HTTPError) {
      const status = error.response.status;
      if (status === 410) throw new VerifyError('expired');
      if (status === 400 || status === 422) {
        throw new VerifyError('invalid-code');
      }
    }
    throw new VerifyError('generic');
  }
}

// ── 회원가입(전체 필드 직접 전송) ────────────────────────────────────────────
// signup_token 흐름 폐기 — email/password/password_confirm/nickname/gender/birth_date/약관 2개를 직접 보낸다.
//   verify 미통과 시 403. 응답은 AuthResponse(access + user → 자동 로그인).
export interface SignupPayload {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  // 'male' | 'female' | 'other' (schemas/auth Gender와 동일). 백엔드 optional이나 UI는 항상 보낸다.
  gender: Gender;
  // 생년월일(YYYY-MM-DD).
  birthDate: string;
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

// 회원가입 실패 유형.
// - 'nickname-duplicated': detail이 닉네임 중복을 가리킴 — 닉네임 필드 에러로 표시
// - 'generic': 그 외(서버 detail 메시지를 그대로 노출)
export type SignupErrorKind = 'nickname-duplicated' | 'generic';

export class SignupError extends Error {
  readonly kind: SignupErrorKind;
  // 서버 detail 원문(있으면 UI에서 우선 표시).
  readonly detail: string | null;

  constructor(kind: SignupErrorKind, detail: string | null = null) {
    super(detail ?? kind);
    this.name = 'SignupError';
    this.kind = kind;
    this.detail = detail;
  }
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const body: SignupRequest = {
    email: payload.email,
    password: payload.password,
    password_confirm: payload.passwordConfirm,
    nickname: payload.nickname,
    gender: payload.gender,
    birth_date: payload.birthDate,
    terms_agreed: payload.termsAgreed,
    privacy_agreed: payload.privacyAgreed,
  };
  try {
    const res = await api
      .post('api/v1/auth/signup', { json: body })
      .json<AuthResponse>();
    if (!res?.access_token || !res.user) {
      throw new SignupError('generic');
    }
    return { user: mapAuthUser(res.user), accessToken: res.access_token };
  } catch (error) {
    if (error instanceof SignupError) throw error;
    const detail = await parseDetail(error);
    // error_code가 없으므로 detail 문구로 닉네임 중복을 추정한다(백엔드 메시지 변경 시 generic으로 폴백).
    if (detail && /nickname|닉네임/i.test(detail)) {
      throw new SignupError('nickname-duplicated', detail);
    }
    throw new SignupError('generic', detail);
  }
}

// ── 토큰 재발급(httpOnly 쿠키) ───────────────────────────────────────────────
// 바디 없음. 쿠키의 refresh_token으로 access만 재발급(AccessTokenResponse).
//   ⚠️ ky의 401 재시도 훅과 부팅 세션 복원이 모두 ky.refreshAccessToken()을 쓰므로,
//      이 service.refresh는 명시적 호출(테스트/특수 경로)용으로만 둔다.
export async function refresh(): Promise<{ accessToken: string }> {
  const res = await api.post('api/v1/auth/refresh').json<AccessTokenResponse>();
  return { accessToken: res.access_token };
}

// ── 로그아웃(httpOnly 쿠키 무효화) ───────────────────────────────────────────
export async function logout(): Promise<void> {
  await api
    .post('api/v1/auth/logout')
    .json()
    .catch(() => undefined);
}

// ── 현재 사용자 ──────────────────────────────────────────────────────────────
// 세션 복원에 사용(refresh로 access 재발급 후 user를 받아온다).
export async function getMe(): Promise<AuthUser> {
  const res = await api.get('api/v1/auth/me').json<UserResponse>();
  return mapAuthUser(res);
}
