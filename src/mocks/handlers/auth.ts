import { http, HttpResponse } from 'msw';

// 인증 MSW 핸들러 (한시적 수동 작성, LOGIN-FE-005 계약 정합화).
// 원래 src/mocks/handlers/는 Swagger 기반 자동 생성물 자리이나(api_client.md 동기화 흐름),
// 백엔드 계약 미완 동안 한시적으로 수동 작성한다. /api-sync 후 자동 생성 핸들러로 교체한다.
//
// 계약(LOGIN-FE-005):
//   - 엔드포인트: /api/v1/auth/*
//   - 응답 래퍼: { status:'SUCCESS'|'FAIL', data, message?, error_code? }
//   - 토큰 바디: data에 access_token/refresh_token (httpOnly 쿠키 폐기, Set-Cookie 미사용)
//   - 비밀번호 8자(검증은 FE 스키마), 닉네임 2~12자

// mock 정상 자격증명. 그 외는 401(FAIL)로 응답한다.
const MOCK_EMAIL = 'test@gambti.com';
const MOCK_PASSWORD = 'password123';

// 설문 완료 데모 계정(MAIN-FE-006). 이 계정으로 로그인하면 has_completed_survey=true가 되어
// 메인(/)에서 개인화 홈(GET /api/v1/home/personalized)이 렌더된다.
const MOCK_SURVEY_DONE_EMAIL = 'survey@gambti.com';

// 이메일 인증 mock 데모 코드.
// - '123456': 인증 성공(signup_token 발급)
// - '000000': 만료 데모(410)
// - 그 외: 코드 불일치(400)
const MOCK_VERIFY_CODE = '123456';
const MOCK_EXPIRED_CODE = '000000';
const MOCK_EXPIRES_IN_SECONDS = 300;
const MOCK_SIGNUP_TOKEN = 'mock-signup-token';

// 닉네임 중복 데모 — 이 닉네임이면 NICKNAME_DUPLICATED를 응답한다.
const MOCK_TAKEN_NICKNAME = '테스트유저';

interface LoginBody {
  email?: string;
  password?: string;
}
interface SendCodeBody {
  email?: string;
}
interface VerifyCodeBody {
  email?: string;
  code?: string;
}
interface SignupBody {
  signup_token?: string;
  password?: string;
  nickname?: string;
  birth?: string;
  gender?: string;
}
interface RefreshBody {
  refresh_token?: string;
}

// 공통 토큰 발급 헬퍼(데모용 고정 토큰).
function mockTokens() {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  };
}

// SUCCESS 래퍼.
function ok<T>(data: T, status = 200) {
  return HttpResponse.json({ status: 'SUCCESS', data }, { status });
}

// FAIL 래퍼.
function fail(
  status: number,
  message: string,
  errorCode?: string,
  data: unknown = null,
) {
  return HttpResponse.json(
    { status: 'FAIL', data, message, error_code: errorCode },
    { status },
  );
}

export const authHandlers = [
  // 로그인 — 래퍼 + 토큰 바디 + user.
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as LoginBody;

    // 설문 완료 데모 계정 → has_completed_survey=true(개인화 홈 진입).
    if (
      body.email === MOCK_SURVEY_DONE_EMAIL &&
      body.password === MOCK_PASSWORD
    ) {
      return ok({
        ...mockTokens(),
        user: {
          id: 'u_2',
          nickname: '설문완료유저',
          has_completed_survey: true,
        },
      });
    }

    if (body.email === MOCK_EMAIL && body.password === MOCK_PASSWORD) {
      return ok({
        ...mockTokens(),
        user: {
          id: 'u_1',
          nickname: '테스트유저',
          has_completed_survey: false,
        },
      });
    }

    // 잘못된 자격증명 → 401(FAIL).
    return fail(401, '이메일 또는 비밀번호가 올바르지 않습니다');
  }),

  // 토큰 재발급 — refresh_token으로 access(+회전된 refresh) 재발급. user도 함께 내려 세션 복원에 사용.
  http.post('*/api/v1/auth/refresh', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as RefreshBody;
    if (!body.refresh_token) {
      return fail(401, '리프레시 토큰이 없습니다');
    }
    return ok({
      access_token: 'mock-access-token-refreshed',
      refresh_token: body.refresh_token,
      user: {
        id: 'u_1',
        nickname: '테스트유저',
        has_completed_survey: false,
      },
    });
  }),

  // 인증 코드 발송/재전송 — 항상 SUCCESS + expires_in(초).
  http.post('*/api/v1/auth/email/send-code', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as SendCodeBody;
    void body.email;
    return ok({ expires_in: MOCK_EXPIRES_IN_SECONDS });
  }),

  // 인증 코드 검증 → signup_token 발급.
  // 123456=성공(signup_token), 000000=만료(410), 그 외=코드 불일치(400).
  http.post('*/api/v1/auth/email/verify-code', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as VerifyCodeBody;
    if (body.code === MOCK_VERIFY_CODE) {
      return ok({ signup_token: MOCK_SIGNUP_TOKEN });
    }
    if (body.code === MOCK_EXPIRED_CODE) {
      return fail(410, '인증 코드가 만료되었습니다', 'CODE_EXPIRED');
    }
    return fail(400, '인증 코드가 올바르지 않습니다', 'CODE_INVALID');
  }),

  // 닉네임 중복확인 — 데모 닉네임(테스트유저)이면 사용 불가, 그 외 사용 가능.
  http.get('*/api/v1/auth/check-nickname', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');
    return ok({ available: nickname !== MOCK_TAKEN_NICKNAME });
  }),

  // 회원가입 — signup_token + password + nickname(+ birth/gender 수용) → 토큰 바디 + user.
  // 닉네임이 데모 중복 닉네임이면 NICKNAME_DUPLICATED(error_code)로 응답한다.
  http.post('*/api/v1/auth/signup', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as SignupBody;

    if (body.nickname === MOCK_TAKEN_NICKNAME) {
      return fail(409, '이미 사용 중인 닉네임입니다', 'NICKNAME_DUPLICATED');
    }

    // birth/gender는 명세 외 필드(REQ-002)지만 mock은 수용한다(에코하지 않아도 됨).
    void body.birth;
    void body.gender;

    return ok({
      ...mockTokens(),
      user: {
        id: 'u_new',
        nickname: body.nickname ?? '새유저',
        has_completed_survey: false,
      },
    });
  }),
];
