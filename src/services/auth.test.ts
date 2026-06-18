import { HTTPError } from 'ky';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/ky';
import { signup } from './auth';

// ky 인스턴스를 모킹해 signup의 에러 분류만 검증한다(HTTP 미발생).
vi.mock('@/lib/ky', () => ({
  api: { post: vi.fn(), get: vi.fn() },
  refreshAccessToken: vi.fn(),
}));

const mockedPost = vi.mocked(api.post);

// 실서버 확인 형식: 비즈니스 에러 본문은 { error: "메시지" }(409/403 등).
function httpError(status: number, body: unknown): HTTPError {
  const response = new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
  const request = new Request('http://localhost/api/v1/auth/signup', {
    method: 'POST',
  });
  return new HTTPError(response, request, {} as never);
}

function mockSignupReject(error: unknown) {
  mockedPost.mockReturnValue({ json: () => Promise.reject(error) } as never);
}

const payload = {
  email: 'user@example.com',
  password: 'password!1',
  passwordConfirm: 'password!1',
  nickname: 'admin',
  gender: 'other' as const,
  birthDate: '2000-01-01',
  ageConfirmed: true,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('signup 에러 분류 (LOGIN-FE-017 ③)', () => {
  it('409 {error:"...닉네임..."}은 nickname-duplicated로 분류한다', async () => {
    // 회귀 방지: 과거엔 {error}를 못 읽어 409가 이메일 중복으로 오분류돼 로그인으로 튕겼다.
    mockSignupReject(httpError(409, { error: '이미 사용 중인 닉네임입니다.' }));
    await expect(signup(payload)).rejects.toMatchObject({
      kind: 'nickname-duplicated',
      detail: '이미 사용 중인 닉네임입니다.',
    });
  });

  it('409 {error:"...이메일..."}은 email-duplicated로 분류한다', async () => {
    mockSignupReject(httpError(409, { error: '이미 가입된 이메일입니다.' }));
    await expect(signup(payload)).rejects.toMatchObject({
      kind: 'email-duplicated',
    });
  });
});
