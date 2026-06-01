import type { ReactNode } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { safeRedirect } from '@/features/auth/lib/safeRedirect';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Public only 가드: 비로그인 사용자만 접근 가능(로그인/회원가입 등).
// 로그인 사용자는 redirect 경로(보존), 없으면 홈(/)으로 리다이렉트한다.
//   - 로그인 직후 LoginPage가 store를 'authenticated'로 바꾸면 이 가드가 라우팅을 가로채는데,
//     이때도 ?redirect / state.redirect를 존중해야 진입 전 의도 경로로 복귀한다(routing.md).
//   - redirect 값은 safeRedirect로 정규화해 오픈 리다이렉트를 막는다(앱 내부 상대경로만).
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  if (status === 'authenticated') {
    const stateRedirect =
      (location.state as { redirect?: string } | null)?.redirect ?? null;
    const target = safeRedirect(searchParams.get('redirect') ?? stateRedirect);
    return <Navigate to={target} replace />;
  }

  return children;
}
