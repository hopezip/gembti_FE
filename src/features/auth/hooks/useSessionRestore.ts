import { useEffect, useState } from 'react';
import { refreshAccessToken } from '@/lib/ky';
import { clearAuthSession, useAuthStore } from '@/lib/store/useAuthStore';
import { getMe } from '@/services/auth';

// 앱 부팅 시 세션 복원 (LOGIN-FE-006 쿠키 방식).
// access_token은 메모리라 새로고침 시 사라진다. 부팅 시 httpOnly 쿠키의 refresh_token으로
//   access를 재발급(/api/v1/auth/refresh, 쿠키)하고, /api/v1/auth/me로 사용자 정보를 받아
//   status를 authenticated로 복원한다. (localStorage refresh 게이트 제거 — 무조건 refresh 시도)
// refresh가 실패(쿠키 없음/만료)하면 anonymous로 둔다.
// 복원 진행 중에는 ready=false를 노출해 가드가 깜빡이지 않게 한다.

export function useSessionRestore(): { ready: boolean } {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ⚠️ Strict Mode 대응(TASK-DEVEX-017): ref 가드 대신 매 setup이 자체 cancelled 플래그로 동작한다.
    //   dev에선 refresh가 2번 호출될 수 있으나 멱등이라 무해하고, production은 1회만 호출된다.
    let cancelled = false;
    (async () => {
      try {
        // 쿠키 refresh로 access 재발급(성공 시 store에 access 반영).
        const access = await refreshAccessToken();
        if (cancelled) return;
        if (!access) {
          clearAuthSession();
          return;
        }
        // access 확보 후 /me로 사용자 정보를 받아 세션을 복원한다.
        const user = await getMe();
        if (cancelled) return;
        useAuthStore.setState({ status: 'authenticated', user });
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
