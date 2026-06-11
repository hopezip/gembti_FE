# api_client.md — API 클라이언트 + Mock

## 핵심 규칙 (인라인 룰 추출용)

- 컴포넌트에서 fetch/ky 직접 호출 금지. 기본 호출 경로는 자동 생성된 `src/lib/api/` 함수. `src/services/`는 필요 시 도메인 단위로 조합하는 **선택 레이어**(없어도 됨)
- `docs/03-api/openapi.json`, `.openapi.merged.json`, `src/types/api.ts`, `src/lib/api/*.ts`, `src/mocks/handlers/*.ts`는 자동 생성 → 직접 편집 금지
- **예외**: `docs/03-api/openapi.draft.json`은 프론트가 미확정 도메인 계약을 **수동 작성하는 임시 파일**이라 편집 허용(TASK-DEVEX-018). 단 모든 path에 `x-status: frontend-draft` + `api/v1/` 프리픽스 통일. 백엔드 확정 시 해당 path를 draft에서 삭제(전환 흐름).
- HTTP 클라이언트는 ky 단일 인스턴스(`src/lib/ky.ts`), `credentials: 'include'`로 쿠키 자동 전송 + access는 `Authorization: Bearer` 부착(하이브리드, auth.md)
- MSW로 개발 (`VITE_USE_MOCK=true`). ⚠️ **auth(`/api/v1/auth/*`)는 실서버(gembti.cloud) passthrough**(LOGIN-FE-006, 핸들러 미등록 + `onUnhandledRequest:'bypass'`). steam/games/home은 mock. `VITE_API_BASE_URL`로 대상 지정.

## 폴더/파일 위치

- `src/lib/ky.ts` — ky 인스턴스 (baseURL, credentials, 에러 인터셉터)
- `src/lib/api/` — 자동 생성 API 함수 (Swagger 완성 후) — 저수준 호출 기본 경로 (직접 편집 금지)
- `src/services/` — 선택적 도메인 서비스 레이어 — 필요 시 `lib/api` 호출을 도메인 단위로 조합 (없어도 됨). 예: `authApi`, `gameApi` 등. 저수준 호출 자체는 services에 중복 작성하지 않는다(lib/api와 역할 구분).
- `src/types/api.ts` — 자동 생성 타입
- `src/mocks/handlers/` — 자동 생성 MSW 핸들러
- `docs/03-api/openapi.json` — 백엔드 Swagger 미러

## 동기화 흐름

API 계약 입력은 **확정(`openapi.json`)** 과 **임시(`openapi.draft.json`)** 두 파일로 물리 분리되어 있고,
`merge-openapi.mjs`가 둘을 병합해 단일 타입 진실(`src/types/api.ts`)로 수렴한다(TASK-DEVEX-018).

```
백엔드 Swagger ──/api-sync──▶ openapi.json ┐
                                            ├─ merge-openapi.mjs ─▶ .openapi.merged.json
사람 작성 ─────────────────▶ openapi.draft.json ┘            ↓ openapi-typescript
                                                  src/types/api.ts → src/lib/api/*.ts → src/mocks/handlers/*.ts
```

- 병합/생성 명령: `pnpm api:gen`(= 병합 + 타입 생성). `pnpm codegen`이 `dev`/`build`/`type-check`에 포함되어 자동 실행.
- 병합 충돌(같은 path/schema 양쪽 존재) 시 `openapi.json`(확정) 우선 + 경고. draft가 없으면 `openapi.json`만 복사.

> Swagger 미완성 동안: 미확정 도메인은 `docs/03-api/openapi.draft.json`(프론트 임시 계약, 수동 작성)을 기준으로 한다.
> (구 `docs/requirements` 6·7장은 TASK-DEVEX-018에서 제거됨 — 요구사항 문서는 기능 목록·기능 ID 체계만 유지.)
> 3파일 책임·전환 흐름 상세: `../03-api/README.md`.

## 패턴

```typescript
// ✅ ky 인스턴스
import ky from 'ky';
export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include', // httpOnly Cookie 자동 전송
});

// ✅ 서비스 레이어 (정식): lib/api 함수를 도메인 단위로 조합 (저수준 호출은 lib/api가 담당)
import { getUsersMe } from '@/lib/api/users'; // Swagger 생성물
export const authApi = {
  me: () => getUsersMe(),
};

// ⏳ Swagger 전 한시적: lib/api가 아직 없을 때만 services에서 ky 직접 호출
//    (생성물이 들어오면 위 조합 형태로 교체, services에 저수준 호출을 남기지 않는다)
export const getMe = () => api.get('users/me').json<User>();

// ✅ 응답 가공은 호출부/훅에서
```

## 안티패턴

```typescript
// ❌ 컴포넌트에서 fetch 직접 호출
const data = await fetch('/api/users').then(r => r.json());

// ❌ 자동 생성 파일 직접 편집 (src/lib/api/users.ts 손수 수정)

// ❌ 컴포넌트에서 Authorization 헤더를 임의 조립 (access Bearer 부착은 ky boundary 전담)
```

## 관련 문서
- `../DEVELOPMENT.md` "API 동기화 워크플로우"
- `data_fetching.md` (TanStack Query 결합)
- `auth.md` (Cookie 자동 전송)
