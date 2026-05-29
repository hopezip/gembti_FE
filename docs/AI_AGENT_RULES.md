# AI_AGENT_RULES.md — AI 행동 제약 (v2)

> Claude가 절대 어겨서는 안 되는 규칙.
> 이 프로젝트의 작업 모드는 **풀팀 협업** + 3-tier 분기(micro 비활성).

## 절대 금지 (Forbidden)

| 금지 | 이유 |
|------|------|
| 티켓 없이 구현 시작 | 추적 불가 (풀팀이라 micro 예외 없음) |
| 범위 밖 리팩터링 | Scope 위반 |
| 인라인 룰 무시 | 도메인 정합성 깨짐 |
| `docs/03-api/openapi.json` 직접 편집 | 백엔드 출처 |
| `src/types/api.ts` 직접 편집 | 자동 생성물 |
| `src/lib/api/*.ts` 직접 편집 | 자동 생성물 |
| `src/mocks/handlers/*.ts` 직접 편집 | 자동 생성물 |
| `panda.config.ts` 토큰 임의 추가/변경 | 디자인 SSOT는 `docs/design` |
| semantic token 대신 primitive(`gray.900`) 직접 사용 | 디자인 시스템 위반 |
| DB 스키마 변경 | 백엔드 영역 |
| Infra/배포 설정 변경 (명시 요청 없이) | 영향 범위 큼 |
| `.env.local.example` 동기화 누락 | 팀원이 모름 |
| logging/error handling 임의 삭제 | 디버깅 약화 |
| `scratch/`를 기준 문서처럼 사용 | non-canonical |
| v1처럼 `docs/analysis/*_report.md` 만들기 | v2 폐기, 회고는 티켓 안 |

## v2 작업 흐름 분기 룰

### 3-tier 자동 분기 (풀팀 모드)

**micro 흐름**: **비활성화** (풀팀 모드). 모든 변경이 normal 이상.
**normal 흐름**: 1~10파일 + 한 도메인
**cross 흐름**: 10파일↑ 또는 공통 모듈/디자인 토큰/auth

### 흐름별 산출물

| 흐름 | 티켓 파일 | 검증 | 회고 | 커밋/PR |
|---|---|---|---|---|
| normal | ✅ (spec+plan+회고 통합) | type-check+lint, FF×1, reviewer×1 | 티켓 안 ## 회고 | 커밋 + PR (1명 승인 후 머지) |
| cross | ✅ + 시각 비교 (UI) | + Playwright (UI) | 티켓 안 ## 회고 | 커밋 + PR (1명 승인 후 머지) |

### cross 강제 영역 (무조건 cross)

- 외부에서 import되는 export 이름, API 계약, 공통 타입, 라우트 경로, 외부 참조 가능 CSS class 변경
- `panda.config.ts` / 디자인 토큰 변경
- auth/JWT/쿠키/암호화 관련 코드 (1줄도 위험)
- 자동 생성 파일이 영향받는 변경
- 보안 관련 (CORS, CSP, 토큰, 쿠키 설정)

### 검증 루프 한계 (v2)

- FF·code-reviewer 각각 **최대 1회 추가 수정만** 허용
- 같은 Critical이 2회 반복 → 즉시 사용자 보고
- 새로운 Critical이 수정 후 발생 → 즉시 사용자 보고
- v1의 "최대 3회" 정책은 폐기됨

## 반드시 할 것 (Required) — v2

| 행동 | 시점 |
|------|------|
| 티켓 파일 읽기 | 구현 전 |
| 인라인 룰 확인 | 구현 전 |
| (UI) DESIGN_SYSTEM.md 컴포넌트 사양 확인 | 구현 전 |
| 영향 파일 목록 보고 | 구현 시작 전 |
| 구현 후 `pnpm type-check`, `pnpm lint` 실행 | 구현 직후 |
| 티켓 ## 회고 섹션 채우기 | 구현 완료 후 |
| Breaking change 발견 시 ⚠️ 표시 | 즉시 |
| 변경된 폴더의 README.md 검토/업데이트 | 파일 추가/삭제 시 |

## 자동 생성 파일 관리

다음 파일들은 직접 편집하지 않습니다:
- `docs/03-api/openapi.json` ← 백엔드 Swagger 미러
- `src/types/api.ts` ← openapi-typescript 출력
- `src/lib/api/*.ts` ← `api-sync` 에이전트 출력
- `src/mocks/handlers/*.ts` ← `api-sync` 에이전트 출력

수정이 필요하면 `/api-sync` 명령어로 백엔드와 재동기화. 대체 행동 순서:
1. **보고**: 어느 파일의 어떤 부분이 문제이고 어떤 증상인지 한 문단으로
2. **출처 판단**: 타입이 잘못됨 → Swagger가 백엔드 실제 응답과 다름(백엔드 팀 보고) / API 함수 없음 → Swagger 갱신 후 `/api-sync` / 응답 가공 원함 → 호출부·어댑터에서 처리
3. **`/api-sync` 필요성 판단**: 백엔드 Swagger 갱신 여부 확인 후 필요 시 실행
4. **래퍼/어댑터 우선 검토**: 자동 생성 파일을 안 건드리고 해결 가능한지 먼저

**금지된 패턴**:
- "막혀서 그냥 직접 수정함" → 절대 금지. 다음 `/api-sync`에서 덮어쓰여 사라짐
- "임시로만 수정" → 금지. 같은 이유
- 어떤 수정도 자동 생성 파일에 직접 가하지 않는다

## Git / 협업 규칙 (v2 — 풀팀 협업 모드)

### 풀팀 모드 정책
- main/dev에 직접 푸시 ❌ 금지 (PR 필수)
- 본인 PR 본인 머지 ❌ 금지 (최소 1명 승인)
- 티켓 ID 없는 브랜치 ❌ 금지 (모든 변경이 티켓 필수)
- micro 흐름 비활성화 (모든 변경이 풀 흐름)
- 승인 게이트 4개: 영향 파일·푸시·커밋·PR

### 위험 명령 승인 규칙 (모든 모드 공통)

다음 명령은 **실행 전 반드시 사용자 승인**을 받습니다.

| 명령 | 위험 | 승인 방식 |
|------|------|-----------|
| `git push` | 원격 반영, 팀원 보임 | 풀팀: 승인 |
| `git push --force` / `--force-with-lease` | 다른 사람 커밋 덮어쓰기 | **두 번 확인** (모든 모드) |
| `git reset --hard` | 작업 영구 삭제 | 어느 커밋으로 갈지 명시 후 확인 |
| `git rebase` | 히스토리 재작성 | 영향 커밋 범위 보고 후 확인 |
| `git clean -fd` / `-fdx` | 추적 안 된 파일 영구 삭제 | 대상 목록 보여주고 확인 |
| `git branch -D` | 브랜치 강제 삭제 | 브랜치명·마지막 커밋 보고 후 확인 |
| `gh pr create` | 외부 PR 생성, 알림 | PR 제목·본문 미리 보여주고 확인 |
| `gh pr merge` | 머지 실행 | 풀팀: 본인이 실행하지 않음 (리뷰어 승인) |
| `rm -rf` (작업 디렉토리 외) | 파일 영구 삭제 | 대상 경로 명시 후 확인 |

**승인 없이 자동 실행 가능** (정보 조회): `git status`, `git diff`, `git log`, `git branch --show-current`, `gh pr view`, `gh pr list`

**일반 작업**: `git add`/`git commit`(commit-writing 승인 후), `git checkout -b`(git-branching 자동), `git fetch`/`git pull`

### 자동 발동 스킬 (v2)
- 새 작업 시작 → `git-branching` (승인 없이 자동, 보고만)
- 변경 발생 → `commit-writing` (승인 유지)
- 티켓 완료 → `pr-creating` (승인 유지, 풀팀이라 본인 머지 금지)

상세: `docs/GIT_WORKFLOW.md`, `docs/COMMIT_CONVENTIONS.md`, `docs/PR_GUIDELINES.md`

## 로깅 관련 규칙 (v2)

### 자동 로깅 (WSL 전용)
- 세션 로그는 Hook이 자동 관리 (수정 금지) — Windows native에서는 미작동
- 일일 로그의 자동 섹션 (세션 목록 등) 수정 금지
- 일일 로그의 수동 섹션 (트러블, 학습 등) 자유 편집

### 작업 흐름과 로깅 (v2)
- 티켓 완료 → 티켓 파일의 `## 회고` 섹션 채움 (v1의 별도 analysis 파일 → 폐기)
- 디버깅 길어짐 → `docs/scratch/<topic>.md` 작성
- 하루 마무리 → `/log` 명령으로 일일 로그 정리 (권장)

### 로그 vs 다른 문서 구분 (v2)
- **티켓** (`tickets/MS-*/*.md`): 작업 단위, spec/plan/회고 통합, 영구 보존
- **임시 메모** (`scratch/`): 디버깅 흔적, 가설, 비공식
- **로그** (`logs/`): 시간 단위, 작업 이력, 협업 가시성

> v1의 "분석/리포트 (analysis/)" 항목은 v2에서 폐기. 회고는 티켓 안에.

### 로그 보안 및 Git 정책
- 세션 원문 로그(`docs/logs/sessions/*.md`)는 기본 `.gitignore` — 로컬에만
- 일일 로그(`docs/logs/YYYY-MM-DD.md`)는 커밋 — 시크릿이 들어가지 않도록 사람이 정리
- Hook은 추가 방어선으로 시크릿 패턴(API_KEY, TOKEN, PASSWORD, Bearer 등) 자동 마스킹 + 2000자 트렁케이션 (완벽하지 않음)
- 실수로 시크릿이 커밋되는 파일에 남았다면: 즉시 `[REDACTED]` 치환 후 커밋 → 푸시됐다면 **시크릿 즉시 무효화/재발급** → 그 다음 히스토리 정리
- 민감한 작업 중에는 `export CLAUDE_HOOKS_DISABLED=true` 또는 `disableAllHooks`로 Hook 끄기
