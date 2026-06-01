import { http, HttpResponse } from 'msw';

// 인증 MSW 핸들러 (한시적 수동 작성).
// 원래 src/mocks/handlers/는 Swagger 기반 자동 생성물 자리이나(api_client.md 동기화 흐름),
// 백엔드 계약 미완 동안 LOGIN-FE-001 구현/E2E를 위해 한시적으로 수동 작성한다.
// /api-sync 후 자동 생성 핸들러로 교체한다.
//
// 인증은 httpOnly Cookie 전제(auth.md). 200 응답에 Set-Cookie(httpOnly mock)를 실어
// 서버가 쿠키로 세션을 발급하는 흐름을 모사한다. 클라이언트는 토큰 문자열을 저장하지 않는다.

// mock 정상 자격증명. 그 외는 401(ERROR-FE-003)로 응답한다.
const MOCK_EMAIL = 'test@gambti.com';
const MOCK_PASSWORD = 'password123';

interface LoginBody {
  email?: string;
  password?: string;
}

interface SignupBody {
  email?: string;
}

export const authHandlers = [
  // 경로는 ky 인스턴스(prefixUrl 없음)가 만드는 `${origin}/api/auth/login`과 일치한다.
  // origin 무관 매칭을 위해 절대 URL 와일드카드(`*/api/auth/login`)를 쓴다.
  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as LoginBody;

    if (body.email === MOCK_EMAIL && body.password === MOCK_PASSWORD) {
      return HttpResponse.json(
        { user: { id: 'u_1', nickname: '테스트유저' } },
        {
          status: 200,
          headers: {
            // httpOnly 쿠키 발급 모사(브라우저가 httpOnly라 JS로 못 읽는 게 정상).
            'Set-Cookie':
              'gambti_session=mock-session; HttpOnly; Path=/; SameSite=Lax',
          },
        },
      );
    }

    // 잘못된 자격증명 → 401(ERROR-FE-003).
    return HttpResponse.json(
      { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
      { status: 401 },
    );
  }),

  // 회원가입(LOGIN-FE-003) — 한시적 수동 mock. 기본 200 성공 + 세션 쿠키 발급 모사.
  // 기존 mock 계정(test@gambti.com)으로 가입 시도 시 409(email-taken) 데모를 응답한다.
  // 실제 이메일 인증(인증 코드 발송, STEP2)은 LOGIN-FE-004(백엔드 의존)에서 다룬다.
  http.post('*/api/auth/signup', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as SignupBody;

    if (body.email === MOCK_EMAIL) {
      return HttpResponse.json(
        { message: '이미 가입된 이메일입니다' },
        { status: 409 },
      );
    }

    return HttpResponse.json(
      { user: { id: 'u_new', nickname: '새유저' } },
      {
        status: 200,
        headers: {
          'Set-Cookie':
            'gambti_session=mock-session; HttpOnly; Path=/; SameSite=Lax',
        },
      },
    );
  }),
];
