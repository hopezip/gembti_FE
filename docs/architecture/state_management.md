# state_management.md — 클라이언트 상태 (Zustand)

## 핵심 규칙 (인라인 룰 추출용)

- 서버 데이터는 TanStack Query, 클라이언트 상태는 Zustand로 분리
- 전역 상태는 최소화 (인증 세션 상태, 모달, 토스트, 진행 중 설문 응답 등만)
- 컴포넌트 로컬 상태는 useState/useReducer 우선
- store 파일은 도메인별로 분리

## 폴더/파일 위치

- `src/features/<domain>/store/` — 도메인 store (예: survey 진행 상태)
- `src/lib/store/` — 전역 store (auth 세션 상태, modal, toast)

## 패턴

```typescript
import { create } from 'zustand';

type AuthState = {
  status: 'anonymous' | 'authenticated' | 'steamLinked' | 'steamPrivateOrFailed';
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'anonymous',
  user: null,
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'anonymous' }),
}));
```

## 안티패턴

- 서버 데이터를 store에 저장 (TanStack Query가 캐시 담당)
- 모든 것을 전역 store에 (로컬 상태 적극 활용)
- store 안에서 API 호출 (서비스/훅에서 호출 후 결과만 set)

## 관련 문서
- `data_fetching.md` (서버 상태와 분리)
- `auth.md` (세션 상태 관리)
