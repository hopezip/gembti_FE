# api_client.md — API 클라이언트 + Mock

## 핵심 규칙 (인라인 룰 추출용)

- 컴포넌트에서 fetch/ky 직접 호출 금지. 기본 호출 경로는 자동 생성된 `src/lib/api/` 함수. `src/services/`는 필요 시 도메인 단위로 조합하는 **선택 레이어**(없어도 됨)
- `docs/03-api/openapi.json`, `src/types/api.ts`, `src/lib/api/*.ts`, `src/mocks/handlers/*.ts`는 자동 생성 → 직접 편집 금지
- HTTP 클라이언트는 ky 단일 인스턴스(`src/lib/ky.ts`), `credentials: 'include'`로 쿠키 자동 전송
- MSW로 개발 (`VITE_USE_MOCK=true`), 실서버 전환 시 false

## 폴더/파일 위치

- `src/lib/ky.ts` — ky 인스턴스 (baseURL, credentials, 에러 인터셉터)
- `src/lib/api/` — 자동 생성 API 함수 (Swagger 완성 후) — 저수준 호출 기본 경로 (직접 편집 금지)
- `src/services/` — 선택적 도메인 서비스 레이어 — 필요 시 `lib/api` 호출을 도메인 단위로 조합 (없어도 됨). 예: `authApi`, `gameApi` 등. 저수준 호출 자체는 services에 중복 작성하지 않는다(lib/api와 역할 구분).
- `src/types/api.ts` — 자동 생성 타입
- `src/mocks/handlers/` — 자동 생성 MSW 핸들러
- `docs/03-api/openapi.json` — 백엔드 Swagger 미러

## 동기화 흐름

```
백엔드가 Swagger 갱신
   ↓
프론트가 /api-sync 실행
   ↓
openapi.json → src/types/api.ts → src/lib/api/*.ts → src/mocks/handlers/*.ts
```

> Swagger 미완성 동안: `docs/requirements` 6장 데이터 모델 + 7장 API 훅 후보를 기준으로 services + MSW handler를 수동 구성.

## 패턴

```typescript
// ✅ ky 인스턴스
import ky from 'ky';
export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include', // httpOnly Cookie 자동 전송
});

// ✅ 서비스 레이어
export const getMe = () => api.get('users/me').json<User>();

// ✅ 응답 가공은 호출부/훅에서
```

## 안티패턴

```typescript
// ❌ 컴포넌트에서 fetch 직접 호출
const data = await fetch('/api/users').then(r => r.json());

// ❌ 자동 생성 파일 직접 편집 (src/lib/api/users.ts 손수 수정)

// ❌ Authorization 헤더를 클라이언트에서 임의 조립 (쿠키 인증이므로 불필요)
```

## 관련 문서
- `../DEVELOPMENT.md` "API 동기화 워크플로우"
- `data_fetching.md` (TanStack Query 결합)
- `auth.md` (Cookie 자동 전송)
