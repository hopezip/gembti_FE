import { create } from 'zustand';
import type { AuthUser } from '@/services/auth';

// auth 세션 상태 (REQ 3.1 사용자 상태).
// LOGIN-FE-006에서 실서버(GEMBTI_API) 계약에 맞춰 토큰 방식을 재전환했다.
//   - access_token: Zustand 메모리에만 보관(새로고침 시 사라짐). ky가 Bearer 헤더로 부착한다.
//   - refresh_token: **httpOnly 쿠키**로 백엔드가 발급/관리한다(FE가 읽거나 저장하지 않는다).
//       앱 부팅 시 /api/v1/auth/refresh(쿠키)로 access를 재발급해 세션을 복원한다.
//   - user: 인증된 사용자 정보(미인증이면 null).
// ⚠️ 컴포넌트에서 토큰을 직접 만지지 않는다. 토큰 읽기/쓰기는 이 모듈의 게터/세터 + ky boundary 전담.
// ⚠️ ky.ts와의 순환 import를 피하려고 ky는 store 인스턴스 대신 아래 모듈 레벨 게터/세터를 쓴다.

export type AuthStatus = 'anonymous' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  // 인증된 사용자(미인증이면 null).
  user: AuthUser | null;
  // access_token — 메모리에만 보관(영속화하지 않는다). ky가 Bearer 헤더로 부착한다.
  accessToken: string | null;
  // 로그인/가입 성공 시 호출 — user + access를 저장하고 status를 'authenticated'로 전이한다.
  //   refresh_token은 httpOnly 쿠키라 FE가 보관하지 않는다.
  setSession: (params: { user: AuthUser; accessToken: string }) => void;
  // refresh 재발급으로 access만 갱신한다. user/status는 유지한다.
  setTokens: (params: { accessToken: string }) => void;
  // 설문 제출 성공 후 완료 여부를 현재 세션 사용자에 즉시 반영한다.
  setSurveyCompleted: (completed: boolean) => void;
  // 로그아웃/세션 만료 시 호출 — access/user를 비우고 status를 'anonymous'로 되돌린다.
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'anonymous',
  user: null,
  accessToken: null,
  setSession: ({ user, accessToken }) => {
    set({ status: 'authenticated', user, accessToken });
  },
  setTokens: ({ accessToken }) => {
    set({ accessToken });
  },
  setSurveyCompleted: (completed) => {
    set((state) => ({
      user: state.user
        ? { ...state.user, hasCompletedSurvey: completed }
        : state.user,
    }));
  },
  clearAuth: () => {
    set({ status: 'anonymous', user: null, accessToken: null });
  },
}));

// ── ky boundary용 모듈 레벨 토큰 접근자 ──────────────────────────────────────
// ky.ts가 store 컴포넌트 구독 없이 토큰을 읽고/쓰기 위한 얇은 래퍼.
//   (useAuthStore.getState/setState를 직접 쓰면 ky↔store 결합이 흩어지므로 여기로 모은다.)
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

// refresh 성공 시 access 반영.
export function applyRefreshedTokens(params: { accessToken: string }): void {
  useAuthStore.getState().setTokens(params);
}

// refresh 실패/세션 만료 시 세션 클리어.
export function clearAuthSession(): void {
  useAuthStore.getState().clearAuth();
}
