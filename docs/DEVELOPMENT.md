# DEVELOPMENT.md — 개발 절차 가이드

> AI가 작업할 때 어떤 명령어를 치고 어디서 로그를 봐야 하는지.
> 검증 파이프라인 상세는 04 모듈에서 추가됨 (v2 살뺀 버전).

## Setup 명령

| 명령 | 설명 |
|------|------|
| `pnpm install` | 의존성 설치 |
| `pnpm panda codegen` | 디자인 토큰 → `styled-system/` 생성 |
| `pnpm dev` | 개발 서버 (장기 실행, 자동 검증에서는 분리) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm type-check` | TypeScript 타입 검증 |
| `pnpm lint` | Biome 린트 |
| `pnpm test` | Vitest 단위 테스트 |
| `pnpm exec playwright test` | Playwright E2E |

## Mock 환경 토글

`.env.local`:
```
VITE_USE_MOCK=true   # MSW 사용 (Swagger 미완성 동안 기본값)
VITE_USE_MOCK=false  # 실서버
```

## 로그 위치

- **브라우저 콘솔**: 클라이언트 사이드 에러
- **Vite 터미널**: dev 서버/빌드 에러
- **Network 탭**: API 요청/응답
- **`docs/logs/`**: 작업 이력 (자동 기록 — WSL 전용, 또는 `/log` 수동)
- **`docs/logs/sessions/`**: Claude 세션 로그 (Hook 기반, `.gitignore`)

## 디버깅 워크플로우

**Trigger**: 빌드/런타임 에러 발생

**Action**:
1. 에러 메시지를 `docs/scratch/<주제>-debug.md`에 기록
2. 가설 작성
3. 관련 코드 인용
4. 검증 명령어 실행
5. 해결되면 scratch에 "해결 요약" 추가
6. 티켓의 `## 회고` 섹션에 scratch 문서 참조

## API 동기화 워크플로우

**Trigger**: 백엔드가 Swagger 업데이트 알림 (제작 완료 후)

**Action**:
1. Claude Code에서 `/api-sync` 또는 "api-sync 에이전트로 동기화"
2. `docs/03-api/openapi.json` 자동 갱신
3. `src/types/api.ts` 자동 갱신
4. `src/lib/api/*.ts` 자동 갱신
5. `src/mocks/handlers/*.ts` 자동 갱신
6. 변경 요약을 `docs/logs/YYYY-MM-DD.md`에 자동 기록
7. Breaking change 발견 시 영향 받는 화면 티켓 생성

> Swagger 미완성 동안: `docs/requirements` 6장 데이터 모델 + 7장 API 훅 후보를 기준으로 MSW mock을 수동 구성한다.

## 일일 작업 사이클 (v2, 풀팀)

```
[작업 요청 받음]
   → 변경 사이즈 판별 (normal/cross — micro 비활성)
   → 티켓 생성 또는 확인 (인라인 룰 + REQ 기능 ID 포함)
   → 영향 파일 보고 (자동 진행)
   → 코드 작성
   → 검증 파이프라인 (type-check/lint, FF ×1, reviewer ×1)
   → 회고 섹션 채움 (티켓 안)
   → 변경된 폴더 README 업데이트
   → 커밋 (승인) + 푸시
   → PR → 1명 승인 후 머지
```

## 검증 파이프라인 (v2 — 살뺀 버전)

### v1과의 차이
- v1: FF ×3 + code-reviewer ×3 = 최대 6회 / v2: 각 ×1 = 2회 (실패 시 1회 추가)
- v1: 모든 흐름 풀 파이프라인 / v2: normal/cross 분기 (풀팀이라 micro 비활성)

### Stage 1: 정적 검증 (모든 흐름)
```bash
pnpm type-check
pnpm lint
```

### Stage 2: 일반 프론트엔드 원칙
```
/frontend-fundamentals:review
```
- Critical 발견: 자동 수정 → **재실행 최대 1회까지만**
- 1회 후에도 Critical 남으면 사용자에게 보고

### Stage 3: 프로젝트 특화 검증
```
code-reviewer 에이전트 호출
```
- AI_AGENT_RULES 준수 / 티켓 Scope·인라인 룰 / 디자인 토큰·Park UI / 폴더 README 동기화
- **재실행 최대 1회까지만**

### Stage 4: 기능 검증 (해당 시)
- 단위 테스트: `pnpm test`
- E2E (Acceptance) — Playwright CLI 우선: `playwright-cli snapshot/click/fill/screenshot`
- cross + UI 변경 시 활성화

### Stage 5: 회고 (v2 — 별도 파일 안 만듦)
티켓 파일의 `## 회고` 섹션을 채움. `docs/analysis/<TICKET>_report.md`를 만들지 않는다.

## 검증 실패 시

| 실패 | 대응 |
|------|------|
| type-check | 타입 에러 수정 후 재실행 (반복 가능) |
| lint | `pnpm format`로 자동 수정 후 재실행 |
| frontend-fundamentals Critical | 자동 수정 → 재리뷰 (**최대 1회 추가**, 한계 시 보고) |
| code-reviewer Critical | 자동 수정 → 재리뷰 (**최대 1회 추가**, 한계 시 보고) |
| Playwright | 시나리오 또는 코드 수정 |

검증 통과 전까지 `Implementation Done: YES`로 보고하지 않습니다.

## 흐름 결정 표 (풀팀 — micro 비활성)

| 변경 | 파일 수 | 외부 export/API 계약/auth/디자인 토큰 | 흐름 |
|---|---|---|---|
| 일반 컴포넌트 추가 | 1~10 | X | normal |
| API 서비스 추가 | 1~10 | X | normal |
| 텍스트/CSS 값 수정 | 1 | X | normal (양식 간결) |
| `panda.config.ts` 토큰 변경 | - | ✅ | cross |
| auth/JWT/쿠키 로직 | - | ✅ | cross |
| 공통 모듈 리팩토링 | 10+ | - | cross |
