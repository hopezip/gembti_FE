import { useEffect, useState } from 'react';
import { api } from '@/lib/ky';
import {
  applyRefreshedTokens,
  clearAuthSession,
  getRefreshToken,
  useAuthStore,
} from '@/lib/store/useAuthStore';
import type { ApiEnvelope, AuthUser } from '@/services/auth';

// 앱 부팅 시 세션 복원(LOGIN-FE-005).
// access_token은 메모리라 새로고침 시 사라진다. 부팅 시 localStorage의 refresh_token으로
//   access를 재발급(/api/v1/auth/refresh)하고, 사용자 정보를 함께 받아 status를 authenticated로 복원한다.
// refresh_token이 없거나 refresh가 실패하면 anonymous로 둔다(세션 클리어).
// 복원 진행 중에는 ready=false를 노출해 가드가 깜빡이지 않게 한다.

interface RefreshEnvelopeData {
  access_token: string;
  refresh_token?: string;
  user?: {
    id: string;
    nickname: string;
    has_completed_survey?: boolean;
  };
}

function mapUser(raw: NonNullable<RefreshEnvelopeData['user']>): AuthUser {
  return {
    id: raw.id,
    nickname: raw.nickname,
    hasCompletedSurvey: raw.has_completed_survey ?? false,
  };
}

export function useSessionRestore(): { ready: boolean } {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ⚠️ Strict Mode 대응: 과거 `startedRef`로 effect 1회만 돌게 막았더니,
    //   dev의 effect 이중 setup에서 [setup①→cleanup①(cancelled=true)→setup②(ref가 true라 즉시 return)]
    //   순서로 흘러 두 setup 모두 setReady에 도달하지 못해 ready가 영구 false가 됐다(빈 화면, TASK-DEVEX-017).
    //   ref 가드를 제거하고, 매 setup이 자체 cancelled 플래그로 동작하게 한다. dev에선 refresh가 2번
    //   호출될 수 있으나 멱등(refresh)이라 무해하고, production은 이중 실행이 없어 1회만 호출된다.
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const env = await api
          .post('api/v1/auth/refresh', {
            json: { refresh_token: refreshToken },
          })
          .json<ApiEnvelope<RefreshEnvelopeData>>();
        if (cancelled) return;
        if (env.status === 'SUCCESS' && env.data?.access_token) {
          applyRefreshedTokens({
            accessToken: env.data.access_token,
            refreshToken: env.data.refresh_token,
          });
          // user를 함께 내려주면 status를 authenticated로 복원한다.
          if (env.data.user) {
            useAuthStore.setState({
              status: 'authenticated',
              user: mapUser(env.data.user),
            });
          }
        } else {
          clearAuthSession();
        }
      } catch {
        if (!cancelled) clearAuthSession();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready };
}
