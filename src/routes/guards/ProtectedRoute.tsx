import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Auth 가드: 로그인 사용자만 접근 가능.
// 비로그인 사용자는 /login으로 보내고 복귀 경로(redirect)를 state로 보존한다.
// ⚠️ useAuthStore는 현재 status:'anonymous' 고정 stub이라 모든 Auth 경로가 /login으로 간다.
//   실제 인증 분기는 auth 티켓에서 store 구현 후 동작한다(이 가드 코드는 그대로 재사용).
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'anonymous') {
    return (
      <Navigate to="/login" state={{ redirect: location.pathname }} replace />
    );
  }

  return children;
}
