import { HTTPError } from 'ky';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/ky';
import { checkNickname } from './users';

// ky 인스턴스를 모킹해 checkNickname의 409 정규화/에러 전파만 검증한다(HTTP 미발생).
vi.mock('@/lib/ky', () => ({
  api: { get: vi.fn() },
}));

const mockedGet = vi.mocked(api.get);

// ky HTTPError를 실제 생성자로 만든다(instanceof 통과 목적). 생성자는 response/request만 읽는다.
function makeHttpError(status: number): HTTPError {
  const response = new Response('{}', { status });
  const request = new Request('http://localhost/api/v1/auth/nickname/check');
  return new HTTPError(response, request, {} as never);
}

// api.get(...).json() 형태를 흉내내는 헬퍼.
function mockJson(impl: () => Promise<unknown>) {
  mockedGet.mockReturnValue({ json: impl } as never);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('checkNickname', () => {
  it('200 응답을 그대로 반환한다(사용 가능)', async () => {
    mockJson(() => Promise.resolve({ available: true, message: 'ok' }));
    await expect(checkNickname('가나다')).resolves.toEqual({
      available: true,
      message: 'ok',
    });
  });

  it('409(이미 사용 중)는 available:false로 정규화한다', async () => {
    mockJson(() => Promise.reject(makeHttpError(409)));
    await expect(checkNickname('중복닉')).resolves.toEqual({
      available: false,
    });
  });

  it('409 외 HTTP 에러(422 등)는 그대로 throw한다', async () => {
    const err = makeHttpError(422);
    mockJson(() => Promise.reject(err));
    await expect(checkNickname('ㄱ')).rejects.toBe(err);
  });

  it('비-HTTP 에러(네트워크 등)도 그대로 throw한다', async () => {
    const err = new TypeError('network');
    mockJson(() => Promise.reject(err));
    await expect(checkNickname('가나다')).rejects.toBe(err);
  });
});
