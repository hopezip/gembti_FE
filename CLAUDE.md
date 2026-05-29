# CLAUDE.md — GamBTI

> **이 파일은 Claude Code가 매 세션 시작 시 자동으로 읽는 진입점입니다.**
> 시스템 버전: bootstrap v2.4.4 (단독·소팀 친화적)

## 세션 시작 규칙 (Claude Code 필독) — v2

v1과 다릅니다. v2는 **티켓 1개로 자기완결적**입니다.

### 작업이 있을 때 (v2 권장 흐름)
1. `CLAUDE.md` (이 파일) — 항상
2. 현재 작업 티켓 파일 — 인라인 룰 포함되어 있어 보통 이것만으로 충분
3. (티켓의 인라인 룰로 부족할 때만) 관련 `docs/architecture/*.md` 1~2개

### 작업이 없을 때 / 큰 변경을 의논할 때
1. `CLAUDE.md`
2. `docs/SSOT.md` — 단일 진실
3. `docs/ARCHITECTURE.md` — 시스템 개요
4. `docs/AI_AGENT_RULES.md` — 행동 제약
5. `docs/DEVELOPMENT.md` — 개발 절차

**핵심 원칙 (v2):**
- v1처럼 매번 5개 문서를 강제로 읽지 않는다. 티켓 안 인라인 룰이 충분하면 그것만 본다.
- 읽지 않은 문서를 읽은 척하지 않는다.
- 컨텍스트가 불확실하면 추측하지 말고 사용자에게 확인한다.
- 인라인 룰에 명백한 누락이 있으면 그 도메인 문서를 자율적으로 추가 로드.

## ⭐ GamBTI 특수 규칙 (반드시 인지)

- **핵심 기능 SSOT는 `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md`** 이다. 기능 88개 = MVP 36(P0) + 추가기능 50(P1/P2). 기능 ID(`LOGIN-FE-001` 등)를 티켓 추적자로 사용한다.
- **디자인 토큰 SSOT는 `docs/design/panda.config.ts` + `DESIGN_SYSTEM.md`** 이다. 루트 `panda.config.ts`로 그대로 적용 후 `pnpm panda codegen`.
- **다크 모드 전용 · 데스크탑 전용** (1100px 미만 1열 fallback만, 반응형 모바일은 MVP 밖).
- 색은 semantic token만 사용. 컴포넌트는 Park UI 베이스 + GamBTI recipe로 덮어쓴다.

## 프로젝트 한 줄 요약
게임 유저들을 위한 AI 게임 추천 서비스

## 작업 모드 (v2)
- **이 프로젝트의 작업 모드**: 풀팀 협업 (프론트 3 + 백엔드 4 = 7명, 본인=프론트 리드)
- 영향: PR 의무, 본인 머지 금지(최소 1명 승인), 승인 게이트 4개, **micro 자동 흐름 비활성화**(모든 변경이 normal 이상 풀 흐름)
- 상세: `docs/AI_AGENT_RULES.md` 참조

## Fast Path + 질문 정책 (v2.1)
- **속도 우선 범위**: micro + normal까지 빠르게
- **질문 기준**: 작업 결과가 달라질 때만
- **질문 방식**: 한 번에 1~3개 질문
- **추천값 처리**: 위험 작업은 중단·일반 작업은 추천값으로 진행

> 풀팀 모드라 모든 변경이 티켓+PR을 거치지만, 구현 *중* 불필요한 확인은 최소화하고 cross/위험 변경만 질문한다.

## 기술 스택 요약
- Vite + React 19 SPA (TypeScript strict)
- 데이터: TanStack Query
- 상태: Zustand
- UI: Panda CSS + Park UI (다크 모드·데스크탑 전용)
- 라우팅: React Router
- 폼: React Hook Form + Zod
- 인증: 백엔드 JWT + httpOnly Cookie
- HTTP: ky
- 테스트: Vitest + RTL (단위), Playwright (E2E)
- Mock: MSW

## v2 작업 흐름 — 3-tier 자동 분기

ticket-implementer가 모든 작업 시작 시 자동 분기:

| 흐름 | 조건 | 산출물 |
|---|---|---|
| ~~micro~~ | (풀팀 모드라 **비활성화**) | — |
| **normal** | 1~10파일, 한 도메인 | 티켓 1 파일 (spec/plan/회고 통합) |
| **cross** | 10파일↑ 또는 공통 모듈/디자인 토큰/auth | 티켓 1 파일 + 시각 비교 |

> ⚠️ 풀팀 모드이므로 micro 자동 흐름은 꺼져 있다. 오타 한 글자도 티켓+PR 흐름을 탄다. 단 티켓 양식은 간결하게 쓸 수 있다.

cross 강제 영역 (무조건 cross):
- 외부에서 import되는 export 이름 변경
- API 계약, 공통 타입, 라우트 경로 변경
- `panda.config.ts` / 디자인 토큰 변경
- auth/JWT/쿠키 관련 코드
- 자동 생성 파일 영향

자세한 룰: `docs/AI_AGENT_RULES.md` 참조.

## 자주 쓰는 명령

- `pnpm dev` — 개발 서버
- `pnpm build` — 빌드
- `pnpm type-check` — 타입 검증
- `pnpm lint` — 린트 (Biome)
- `pnpm test` — 테스트 (Vitest)
- `pnpm panda codegen` — 디자인 토큰 코드 생성
- `/api-sync` — 백엔드 API 동기화 (Swagger 완성 후)
- `/new-ticket <설명>` — 새 티켓 생성 (v2 통합 양식)
- `/done-ticket <id>` — 티켓 완료 + 회고 섹션 채움

## 절대 하면 안 되는 것 (요약)

1. 티켓 없이 구현 시작 (풀팀이라 micro 예외 없음)
2. `docs/03-api/openapi.json` 직접 편집 (백엔드 출처)
3. `src/types/api.ts`, `src/lib/api/`, `src/mocks/handlers/` 직접 편집 (자동 생성물)
4. `panda.config.ts` 토큰을 임의로 추가/변경 (디자인 SSOT는 DesignEx)
5. semantic token 대신 primitive(`gray.900` 등) 직접 사용
6. 범위 밖 리팩터링
7. v1처럼 `docs/analysis/<TICKET>_report.md` 파일 만들기 (v2: 티켓 ## 회고 섹션)
8. 자세한 규칙: `docs/AI_AGENT_RULES.md` 참조

## 협업 워크플로우 (v2 — 풀팀)

자동화된 Git 워크플로우를 사용합니다.

### 브랜치 전략
- `main`: 배포 가능 / 안정
- `dev`: 통합 / 다음 배포 후보
- `feature/<티켓-ID>-<설명>`: 작업 브랜치 (풀팀이라 티켓 ID 필수)

### 자동 발동 스킬
- 브랜치 생성 → `git-branching` (승인 없이 자동, 보고만)
- 커밋 메시지 작성 → `commit-writing` (승인 유지)
- PR 본문 작성 + 생성 → `pr-creating` (승인 유지, **본인 머지 금지 — 1명 승인**)

### 수동 호출
- `/branch <티켓-ID>` / `/commit` / `/pr`

### 자세한 가이드
- `docs/GIT_WORKFLOW.md` / `docs/COMMIT_CONVENTIONS.md` / `docs/PR_GUIDELINES.md`

## 로깅 시스템

이 프로젝트는 자동 로깅이 활성화되어 있습니다. ⚠️ **단, Hook은 WSL/macOS/Linux 전용**입니다. Windows PowerShell에서 실행 중이면 Hook이 안 도므로 `/log` 수동을 사용하세요.

- **세션 자동 기록**: `docs/logs/sessions/` (Hook 기반, gitignore)
- **일일 로그**: `docs/logs/YYYY-MM-DD.md` (자동 + 수동, 커밋)
- **티켓 회고**: 티켓 파일의 `## 회고` 섹션 (v2 — v1 analysis 폴더 대체)
- **수동 보강**: `/log` 슬래시 커맨드

로컬 임시 비활성화: `export CLAUDE_HOOKS_DISABLED=true`
전체 비활성화: `.claude/settings.json`에 `"disableAllHooks": true`

자세한 내용: `docs/logs/README.md` 참조.

## 폴더 한눈에 보기 (v2)

- `docs/` — 시스템 문서 (각 폴더에 README 있음)
  - `tickets/` — 작업 단위 (v2: spec+plan+회고 통합), `MS-01~04`(MVP) + `MS-05`(추가기능 backlog)
  - `architecture/` — 도메인 룰 (티켓 인라인 룰의 출처)
  - `screens/` — 화면 정의서
  - `scratch/` — 임시 디버깅
  - `logs/` — 자동 작업 로그
  - ~~`analysis/`~~ — v2에서 폐기 (티켓 안으로)
- `docs/requirements/`, `docs/design/` — 요구사항·디자인 SSOT (출처 문서)
- `src/` — 소스 코드
- `.claude/agents/` — 사용 가능한 에이전트들 (README 참조)
- `.claude/commands/` — 슬래시 커맨드들 (README 참조)
- `.claude/skills/` — 자동 발동 스킬들 (06 모듈에서 추가)
