import { create } from 'zustand';

// auth 세션 상태 (REQ 3.1 사용자 상태).
// ⚠️ 이것은 TASK-DEVEX-003 스캐폴딩용 최소 stub이다.
// 현재는 status가 'anonymous'로 고정되어 있어 라우트 가드 골격만 동작한다.
// TODO(auth 티켓): 실제 JWT/httpOnly 쿠키 기반 세션 복원·로그인·로그아웃 로직으로 교체.
//   - status를 백엔드 세션(쿠키) 검증 결과로 채운다.
//   - 'loading' 상태 추가 검토(세션 확인 중 가드가 깜빡이지 않도록).

export type AuthStatus = 'anonymous' | 'authenticated';

interface AuthState {
  status: AuthStatus;
}

// stub: 항상 'anonymous'를 반환한다. 실제 로직은 범위 밖(auth 티켓에서 구현).
export const useAuthStore = create<AuthState>(() => ({
  status: 'anonymous',
}));
