# Contributing — GamBTI

> 이 문서는 팀 공통 규칙의 **단일 진입점(허브)** 입니다.
> 각 항목은 요약이며, **상세·최신 기준은 링크된 원본 문서**를 따릅니다. (이 문서와 원본이 다르면 원본이 우선)

작업 모드: **풀팀 협업** (프론트 4 + 백엔드 4). 모든 변경은 티켓 + PR을 거치고, **본인 머지 금지(최소 1명 승인)** 입니다.

---

## 1. 브랜치 전략

`main + dev + feature` 3계층. dev에서 분기하고 PR 대상은 `dev`.

| 타입 | prefix | 예시 |
|------|--------|------|
| 기능 | `feature/` | `feature/LOGIN-FE-001-email-login` |
| 버그 | `bugfix/` | `bugfix/STEAM-INTER-FE-002-private-fix` |
| 리팩터 | `refactor/` | `refactor/TASK-DEVEX-002-split-panda-config` |
| 작업 | `task/` | `task/TASK-API-001-openapi-contract` |
| 문서 | `docs/` | `docs/TASK-DOCS-003-contributing-hub` |
| 설정 | `chore/` | `chore/TASK-BUILD-001-pin-pnpm` |
| 긴급 | `hotfix/` | `hotfix/...` (main 직접) |

- 브랜치 이름에 한글·티켓 ID 누락 금지. main/dev 직접 푸시 금지.

→ 상세: [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md)

## 2. 이슈 / 티켓 네이밍

**이슈 제목:** `[<type>] <티켓-ID> <subject>`

```
[feat] LOGIN-FE-001 이메일 로그인 화면
[docs] TASK-DOCS-003 기여 가이드 허브 문서 신설
```

- `<type>`은 커밋 타입과 동일 어휘(`feat`/`fix`/`docs`/`refactor`/`chore`…)
- 티켓 ID는 REQ 기능 ID(`LOGIN-FE-001`) 또는 신규 `FEAT-NNN`/`TASK-NNN` 사용
- 이슈 → 브랜치 → 커밋 → PR(`Closes #N`)이 같은 티켓 ID로 연결됨

→ 상세: [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) · 기능 ID 출처 [`docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md`](docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md)

## 3. 커밋 컨벤션

**양식:** `<type>(<scope>): <티켓-ID> <subject>` (Conventional Commits)

```
feat(auth): LOGIN-FE-001 이메일 로그인 화면 구현
docs: TASK-DOCS-003 기여 가이드 허브 문서 신설
```

- 티켓 ID는 콜론 뒤 subject 앞에 (끝에 `[TASK-XXX]` 대괄호 금지)
- `scope`는 선택 (전체/문서/설정 변경은 생략)
- subject는 한국어, 마침표 없이 50자 이내
- `feat`(커밋 타입) ≠ `feature/`(브랜치 prefix) — 두 표준의 다른 계층, 의도된 차이

→ 상세: [`docs/COMMIT_CONVENTIONS.md`](docs/COMMIT_CONVENTIONS.md)

## 4. PR 규칙

- 대상 브랜치 `dev` (배포 시 `dev` → `main`은 merge commit)
- **본인 머지 금지** — 최소 1명 승인 후 **Squash and merge**, 머지 후 브랜치 삭제
- 제목은 커밋 컨벤션과 동일 양식, 본문은 템플릿 사용, `Closes #이슈번호` 포함
- 변경 200줄+ 이면 분할 권장

→ 상세: [`docs/PR_GUIDELINES.md`](docs/PR_GUIDELINES.md)

## 5. 폴더 구조

```
docs/          # 시스템 문서 (Tier 1 기준 ~ Tier 4 실행 단위)
  architecture/  # 도메인별 규칙 (티켓 인라인 룰의 출처)
  tickets/       # 작업 단위 (spec+plan+회고 통합), MS-01~05
  requirements/  # 기능 SSOT (REQ)
  design/        # 디자인 SSOT (DESIGN_SYSTEM.md + panda.config)
  archive/       # 과거 1회성 기록 (현재 기준 아님)
src/           # 소스 (components/ui·patterns, theme, services, mocks ...)
.claude/       # 에이전트·커맨드·스킬·훅
```

→ 상세: [`docs/README.md`](docs/README.md) · 시스템 개요 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 더 보기

- 단일 진실(SSOT): [`docs/SSOT.md`](docs/SSOT.md)
- 협업 규칙(디스코드 알림·동시 작업 조율 등): [`docs/TEAM_COLLABORATION.md`](docs/TEAM_COLLABORATION.md)
- AI 행동 제약: [`docs/AI_AGENT_RULES.md`](docs/AI_AGENT_RULES.md)
- 개발 절차·명령: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
- 디자인 작업 규칙: [`src/theme/README.md`](src/theme/README.md)
