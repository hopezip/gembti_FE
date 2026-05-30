import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Public only 가드: 비로그인 사용자만 접근 가능(로그인/회원가입 등).
// 로그인 사용자는 홈(/)으로 리다이렉트한다.
// ⚠️ useAuthStore는 현재 status:'anonymous' 고정 stub이라 항상 children을 통과시킨다.
//   실제 분기는 auth 티켓에서 store 구현 후 동작한다(이 가드 코드는 그대로 재사용).
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return children;
}
