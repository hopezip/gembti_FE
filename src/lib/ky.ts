import ky from 'ky';
import {
  applyRefreshedTokens,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
} from '@/lib/store/useAuthStore';

// HTTP 단일 인스턴스 (LOGIN-FE-005 토큰 방식 전환).
// 인증 방식: access_token(메모리) + refresh_token(localStorage) + Bearer 헤더.
//   - beforeRequest: Zustand의 access_token을 `Authorization: Bearer <access>`로 부착.
//   - afterResponse 401: refresh_token으로 access를 1회 재발급 후 원요청 재시도.
//       무한루프 방지를 위해 요청당 1회만 재시도한다(_retried 플래그).
//   - refresh 실패/refresh_token 없음: 세션 클리어 후 원래 401을 그대로 반환.
// ⚠️ credentials:'include'는 제거했다(쿠키 전제 폐기). 토큰은 헤더로만 전달한다.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// refresh 호출용 분리 인스턴스 — 메인 api의 afterResponse 훅을 타지 않아 재귀를 막는다.
//   (refresh 자체가 401이어도 다시 refresh를 시도하지 않는다.)
const refreshClient = ky.create({
  prefixUrl: API_BASE_URL || undefined,
});

interface RefreshEnvelope {
  status: 'SUCCESS' | 'FAIL';
  data: {
    access_token: string;
    refresh_token?: string;
  };
}

// refresh_token으로 access를 재발급한다. 성공 시 store에 반영하고 새 access를 반환한다.
//   실패하면 null을 반환한다(호출부가 세션 클리어).
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const env = await refreshClient
      .post('api/v1/auth/refresh', { json: { refresh_token: refreshToken } })
      .json<RefreshEnvelope>();
    if (env.status !== 'SUCCESS' || !env.data?.access_token) return null;
    applyRefreshedTokens({
      accessToken: env.data.access_token,
      refreshToken: env.data.refresh_token,
    });
    return env.data.access_token;
  } catch {
    return null;
  }
}

export const api = ky.create({
  prefixUrl: API_BASE_URL || undefined,
  hooks: {
    beforeRequest: [
      (request) => {
        const accessToken = getAccessToken();
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401) return response;

        // 요청당 1회만 재시도(무한루프 금지). 재시도 요청에는 플래그 헤더를 단다.
        if (request.headers.get('x-retried') === '1') return response;

        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          // refresh 불가/실패 → 세션 만료. 원래 401을 그대로 흘려보낸다.
          clearAuthSession();
          return response;
        }

        // 새 access로 원요청 1회 재시도.
        const retryRequest = request.clone();
        retryRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        retryRequest.headers.set('x-retried', '1');
        return ky(retryRequest);
      },
    ],
  },
});
