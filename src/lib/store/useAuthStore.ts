import { create } from 'zustand';
import type { AuthUser } from '@/services/auth';

// auth 세션 상태 (REQ 3.1 사용자 상태).
// LOGIN-FE-001에서 stub을 최소 확장했다: user 보관 + 로그인/로그아웃 상태 전이 액션.
// ⚠️ 토큰 문자열은 저장하지 않는다(httpOnly 쿠키 전제 — auth.md). user/세션 상태만 반영한다.
// ⚠️ 세션 복원(GET /api/auth/me)과 'loading' 가드 상태는 이번 범위 밖(후속 auth 인프라 티켓).
//   기본 status는 'anonymous'를 유지해 라우트 가드(Protected/PublicOnly) 인터페이스가 그대로 동작한다.
// TODO(auth 티켓): 새로고침 시 쿠키 기반 세션 복원으로 초기 status를 채운다.

export type AuthStatus = 'anonymous' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  // 인증된 사용자(미인증이면 null). 토큰은 포함하지 않는다.
  user: AuthUser | null;
  // 로그인 성공 시 호출 — user를 저장하고 status를 'authenticated'로 전이한다.
  setAuthenticated: (user: AuthUser) => void;
  // 로그아웃 시 호출 — user를 비우고 status를 'anonymous'로 되돌린다.
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'anonymous',
  user: null,
  setAuthenticated: (user) => set({ status: 'authenticated', user }),
  clearAuth: () => set({ status: 'anonymous', user: null }),
}));
