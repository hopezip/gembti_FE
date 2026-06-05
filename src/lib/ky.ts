import ky from 'ky';
import {
  applyRefreshedTokens,
  clearAuthSession,
  getAccessToken,
} from '@/lib/store/useAuthStore';
import type { components } from '@/types/api';

// HTTP 단일 인스턴스 (LOGIN-FE-006 실서버(GEMBTI_API) 토큰 방식).
// 인증 방식: access_token(메모리 Bearer) + refresh_token(httpOnly 쿠키).
//   - credentials:'include' — 크로스오리진(gembti.cloud)에서도 refresh 쿠키를 주고받는다.
//   - beforeRequest: Zustand의 access_token을 `Authorization: Bearer <access>`로 부착.
//   - afterResponse 401: 쿠키 refresh로 access를 1회 재발급 후 원요청 재시도(요청당 1회, x-retried).
//   - refresh 실패: 세션은 클리어하지 않고(부팅 복원/명시 로그아웃이 판단) 원래 401을 그대로 반환한다.
// 에러 본문 파싱({detail})은 서비스 레이어(src/services/auth.ts)가 담당한다.

type AccessTokenResponse = components['schemas']['AccessTokenResponse'];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// refresh 호출용 분리 인스턴스 — 메인 api의 afterResponse 훅을 타지 않아 재귀를 막는다.
//   (refresh 자체가 401이어도 다시 refresh를 시도하지 않는다.) 쿠키 전송 위해 credentials 포함.
const refreshClient = ky.create({
  prefixUrl: API_BASE_URL || undefined,
  credentials: 'include',
});

// 쿠키의 refresh_token으로 access를 재발급한다(바디 없음). 성공 시 store에 반영하고 새 access를 반환한다.
//   실패하면 null을 반환한다(호출부가 판단). 부팅 세션 복원과 401 재시도가 공용으로 쓴다.
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await refreshClient
      .post('api/v1/auth/refresh')
      .json<AccessTokenResponse>();
    if (!res?.access_token) return null;
    applyRefreshedTokens({ accessToken: res.access_token });
    return res.access_token;
  } catch {
    return null;
  }
}

export const api = ky.create({
  prefixUrl: API_BASE_URL || undefined,
  credentials: 'include',
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

        // 인증 없이 호출하는 auth 엔드포인트(login/signup/logout/email)의 401은
        //   "토큰 만료"가 아니라 자격증명/요청 자체의 실패다 → refresh 재시도 대상에서 제외하고
        //   원래 401을 그대로 흘려보내 서비스가 도메인 에러로 매핑하게 한다.
        //   (/me 등 보호 리소스의 401만 refresh 재시도한다. /refresh는 분리 인스턴스라 이 훅을 안 탄다.)
        if (
          /\/api\/v1\/auth\/(login|signup|logout|email\/)/.test(request.url)
        ) {
          return response;
        }

        // 요청당 1회만 재시도(무한루프 금지). 재시도 요청에는 플래그 헤더를 단다.
        if (request.headers.get('x-retried') === '1') return response;

        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          // refresh 불가/실패 → 세션 만료. 세션을 클리어(anonymous)하고 원래 401을 흘려보낸다.
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
