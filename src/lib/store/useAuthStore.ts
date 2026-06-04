import { create } from 'zustand';
import type { AuthUser } from '@/services/auth';

// auth 세션 상태 (REQ 3.1 사용자 상태).
// LOGIN-FE-005에서 토큰 방식을 전면 전환했다(이전: httpOnly 쿠키 전제).
//   - access_token: Zustand 메모리에만 보관(새로고침 시 사라짐). ky가 Bearer 헤더로 부착한다.
//   - refresh_token: localStorage 영속화. 앱 부팅 시 refresh로 access를 재발급해 세션을 복원한다.
//   - user: 인증된 사용자 정보(미인증이면 null).
// ⚠️ 컴포넌트에서 토큰을 직접 만지지 않는다. 토큰 읽기/쓰기는 이 모듈의 게터/세터 + ky boundary 전담.
// ⚠️ ky.ts와의 순환 import를 피하려고 ky는 store 인스턴스 대신 아래 모듈 레벨 게터/세터를 쓴다.

export type AuthStatus = 'anonymous' | 'authenticated';

// refresh_token localStorage 키.
const REFRESH_TOKEN_KEY = 'gambti_refresh_token';

interface AuthState {
  status: AuthStatus;
  // 인증된 사용자(미인증이면 null).
  user: AuthUser | null;
  // access_token — 메모리에만 보관(영속화하지 않는다). ky가 Bearer 헤더로 부착한다.
  accessToken: string | null;
  // refresh_token — localStorage에도 미러링되는 영속 토큰.
  refreshToken: string | null;
  // 로그인/가입 성공 시 호출 — user + 토큰을 저장하고 status를 'authenticated'로 전이한다.
  //   refresh_token은 localStorage에도 기록한다.
  setSession: (params: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  // refresh 재발급으로 access(필요 시 refresh 회전)만 갱신한다. user/status는 유지한다.
  setTokens: (params: { accessToken: string; refreshToken?: string }) => void;
  // 로그아웃/세션 만료 시 호출 — 토큰/user를 비우고 status를 'anonymous'로 되돌린다.
  //   localStorage refresh_token도 제거한다.
  clearAuth: () => void;
}

// SSR(Next) 가드 — window 없는 환경에서 localStorage 접근을 피한다.
function readPersistedRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function persistRefreshToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // localStorage 사용 불가(프라이빗 모드 등)면 메모리 세션만 유지한다.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'anonymous',
  user: null,
  accessToken: null,
  // 부팅 시 localStorage의 refresh_token으로 초기화한다(복원은 별도 액션이 access를 재발급).
  refreshToken: readPersistedRefreshToken(),
  setSession: ({ user, accessToken, refreshToken }) => {
    persistRefreshToken(refreshToken);
    set({ status: 'authenticated', user, accessToken, refreshToken });
  },
  setTokens: ({ accessToken, refreshToken }) => {
    if (refreshToken !== undefined) persistRefreshToken(refreshToken);
    set((prev) => ({
      accessToken,
      refreshToken: refreshToken ?? prev.refreshToken,
    }));
  },
  clearAuth: () => {
    persistRefreshToken(null);
    set({
      status: 'anonymous',
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },
}));

// ── ky boundary용 모듈 레벨 토큰 접근자 ──────────────────────────────────────
// ky.ts가 store 컴포넌트 구독 없이 토큰을 읽고/쓰기 위한 얇은 래퍼.
//   (useAuthStore.getState/setState를 직접 쓰면 ky↔store 결합이 흩어지므로 여기로 모은다.)
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}

// refresh 성공 시 access(및 회전된 refresh) 반영.
export function applyRefreshedTokens(params: {
  accessToken: string;
  refreshToken?: string;
}): void {
  useAuthStore.getState().setTokens(params);
}

// refresh 실패/세션 만료 시 세션 클리어.
export function clearAuthSession(): void {
  useAuthStore.getState().clearAuth();
}
