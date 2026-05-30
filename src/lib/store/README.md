# lib/store

전역 store 자리. 도메인 전반에서 공유되는 상태(auth 세션·modal·toast 등)를 Zustand store로 둔다. 도메인 한정 store는 `src/features/<domain>/store/`에 둔다.
