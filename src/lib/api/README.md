# lib/api

API 호출 함수(저수준) 자리. `/api-sync`로 **자동 생성**되는 자리이며 직접 편집 금지(자동 생성물).

- `lib/api`: 자동 생성 저수준 HTTP 호출 함수.
- `services/`: 선택적 도메인 레이어(수동 작성, 복잡한 조합만).

기존 `lib/ky.ts`(ky 인스턴스), `lib/queryClient.ts`(TanStack Query)는 이 폴더와 별개로 유지한다.
