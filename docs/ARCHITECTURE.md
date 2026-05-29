# ARCHITECTURE.md — 시스템 전체 개요

> 시스템 전체 흐름 요약 + 도메인 문서 지도.
> 상세는 `docs/architecture/*.md` 참조.
> v2: 티켓 인라인 룰이 도메인 문서의 4~6줄 요약을 박아둠.

## 한 줄 미션
게임 유저들을 위한 AI 게임 추천 서비스.

## Entry Points

- **Vite Entry**: `src/main.tsx`
- **Root App**: `src/App.tsx`
- **Route Index**: `src/routes/index.tsx` (React Router)
- **Mock 초기화**: `src/mocks/browser.ts`
- **디자인 토큰**: `panda.config.ts` → `styled-system/` (codegen)

## Data Flow

```
Route Component
  → Feature Component (src/features/<domain>)
    → Hook (TanStack Query)
      → Service (src/services/*) / API Client (src/lib/api, 자동 생성)
        → MSW Handler (개발) / 실서버 (프로덕션)
```

환경 토글:
- `VITE_USE_MOCK=true` → MSW로 응답
- `VITE_USE_MOCK=false` → 실서버 호출

## 전역 사용자 상태 (REQ 3.1 기반)

`anonymous → emailSignupPending → authenticated → steamLinkPending → steamLinked / steamPrivateOrFailed`, 그리고 `surveyIncomplete → surveyCompleted`. 라우트 접근 가드와 추천 모드 분기의 기준이다.

## 폴더 책임 (요약, 상세는 SSOT 참조)

| 폴더 | 책임 |
|------|------|
| `src/routes/` | React Router 라우트/페이지 엔트리 |
| `src/features/<domain>/` | 도메인별 컴포넌트/훅/스키마/store |
| `src/components/ui/` | Park UI 래핑 Primitive |
| `src/components/patterns/` | 도메인 컴포넌트 (GameCard 등) |
| `src/layouts/` | GlobalShell / DetailLayout / FormLayout |
| `src/services/` | 도메인 서비스 레이어 (컴포넌트가 직접 fetch 금지) |
| `src/lib/api/` | API 호출 함수 (**자동 생성**) |
| `src/types/` | 타입 (`api.ts`는 **자동 생성**) |
| `src/mocks/` | MSW 핸들러 (**자동 생성**) |

## 도메인 문서 지도

각 도메인의 상세 규칙은 다음 문서를 참조하세요.
**v2**: ticket-writer가 도메인 관련 티켓 만들 때 이 문서들에서 4~6줄 추출해 티켓의 "인라인 룰" 섹션에 박습니다.

| 도메인 | 문서 |
|--------|------|
| API 클라이언트 + Mock | `architecture/api_client.md` |
| 데이터 패칭 | `architecture/data_fetching.md` |
| 상태관리 | `architecture/state_management.md` |
| 라우팅 | `architecture/routing.md` |
| 컴포넌트 | `architecture/components.md` |
| 스타일링 (Panda+Park UI) | `architecture/styling.md` |
| 인증 (JWT/쿠키) | `architecture/auth.md` |
| 폼 (RHF+Zod) | `architecture/forms.md` |

## 백엔드 인터페이스

- 단일 소스: `docs/03-api/openapi.json` (백엔드 Swagger 미러)
- 동기화 명령: `/api-sync`
- 동기화 시 자동 갱신: `src/types/api.ts`, `src/lib/api/`, `src/mocks/handlers/`
- Swagger 미완성 동안: `REQ` 6장 데이터 모델 + 7장 API 훅 후보가 mock 기준
