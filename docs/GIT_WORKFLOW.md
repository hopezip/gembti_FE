# GIT_WORKFLOW.md — Git 브랜치 전략 (v2)

> 이 프로젝트는 **main + dev + feature** 3계층 전략을 사용합니다.
> 작업 모드는 **풀팀 협업** — 모든 변경이 PR을 거치고, 최소 1명 승인 후 머지합니다.

## 브랜치 구조

```
main (배포 가능 / 안정)
  ↑ 머지 (배포 시점 또는 hotfix)
dev (통합 브랜치 / 다음 배포 후보)
  ↑ 머지 (기능 완성 시, PR + 1명 승인)
feature/<티켓-ID>-<짧은-설명>   ← 개별 작업
bugfix/<티켓-ID>-<짧은-설명>    ← 버그 수정
hotfix/<티켓-ID>-<짧은-설명>    ← 긴급 (main 직접)
refactor/<티켓-ID>-<짧은-설명>  ← 리팩터링
task/<티켓-ID>-<짧은-설명>      ← 작업
docs/<티켓-ID>-<짧은-설명>      ← 문서
chore/<티켓-ID>-<짧은-설명>     ← 설정/빌드/패키지
```

> ⚠️ 풀팀 모드라 **티켓 ID 없는 micro 브랜치(`fix/*`, `chore/*` 단독)는 사용하지 않습니다.** 모든 변경에 티켓이 있습니다.

## 브랜치 이름 규칙

| 티켓 타입 | 브랜치 Prefix | PR 대상 |
|----------|--------------|---------|
| FEAT | `feature/` | dev |
| BUG | `bugfix/` | dev |
| HOTFIX | `hotfix/` | main (긴급) |
| REFACTOR | `refactor/` | dev |
| TASK | `task/` | dev |
| DOCS | `docs/` | dev |
| CHORE | `chore/` | dev |

REQ 기능 ID를 티켓 ID로 쓰는 경우 예: `feature/LOGIN-FE-001-email-login`

> **`feat` vs `feature/` 는 일부러 다릅니다 (오타 아님).**
> - `feat`, `docs`, `refactor` … = **Conventional Commits**의 커밋 *타입* (커밋 메시지용)
> - `feature/`, `docs/`, `refactor/` … = **Git Flow**의 브랜치 *prefix* (브랜치 이름용)
> 두 표준의 다른 계층이라, 새 기능은 `feat` 커밋 ↔ `feature/` 브랜치로 매핑됩니다. (`docs`/`refactor`/`chore` 등은 타입·prefix 철자가 같음)

## 이슈 네이밍

> 모든 작업은 GitHub Issue를 먼저 만들고 진행합니다. 이슈 제목에서 작업 성격이 바로 보이도록 통일합니다.

**양식:** `[<type>] <티켓-ID> <subject>`

```
[refactor] TASK-DEVEX-002 panda.config.ts 모듈 분리
[feat] LOGIN-FE-001 이메일 로그인 화면
[docs] TASK-DOCS-001 이슈·브랜치·커밋 네이밍 통일
```

- `<type>` = 커밋 타입과 동일한 어휘 사용: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`
- `<티켓-ID>` = 내부 티켓/기능 ID (`TASK-*`, `LOGIN-FE-001` 등). 1:1로 브랜치·커밋과 연결됨
- `<subject>` = 한국어, 마침표 없이 간결하게
- GitHub `label`은 보조 수단 — 제목의 `[type]`이 1차 식별자

**이슈 → 브랜치 → 커밋 추적 예시 (한 줄로 연결):**

| 단계 | 예시 |
|------|------|
| 이슈 | `[refactor] TASK-DEVEX-002 panda.config.ts 모듈 분리` |
| 브랜치 | `refactor/TASK-DEVEX-002-split-panda-config` |
| 커밋 | `refactor(config): TASK-DEVEX-002 panda 설정 모듈 분리` |
| PR | 본문에 `Closes #16` 으로 이슈 연결 |

## 브랜치 라이프사이클 (normal/cross)

```
dev에서 출발
  → git checkout -b feature/LOGIN-FE-001-email-login
  → 작업 + 커밋
  → git push origin feature/LOGIN-FE-001-email-login
  → PR 생성 (대상: dev)
  → 리뷰 + 자동 검증 통과 → 최소 1명 승인
  → 머지 (Squash and merge 권장)
  → 브랜치 삭제
```

## main으로 머지 (배포)

```
dev → main (정기 배포)  또는  hotfix/* → main (긴급)
```

## Forbidden — 풀팀 협업 모드

### 모든 모드 공통
- main에 직접 푸시 ❌ (절대)
- 브랜치 이름에 한글 ❌
- 한 브랜치에서 여러 티켓 작업 ❌
- 자동 검증 실패 상태에서 PR 생성 ❌

### 풀팀 모드 추가
- dev에 직접 푸시 ❌ 금지 (PR 거쳐야 함)
- 본인 PR 본인 머지 ❌ 금지 (최소 1명 승인)
- 티켓 ID 없는 브랜치 ❌ 금지 (모든 변경이 티켓 필수)
- micro 흐름 자동 진입 ❌ 비활성화

## 충돌 발생 시

**Trigger**: PR 생성 시 conflict
**Action**:
1. `git fetch origin`
2. `git rebase origin/dev` 또는 `git merge origin/dev`
3. 충돌 해결
4. `git push --force-with-lease` (rebase 한 경우, **두 번 확인 필수**)

## 자동화

`git-branching` 스킬이 자동 처리:
1. 분기 판별 (풀팀이라 normal/cross)
2. prefix 추론 + 브랜치 이름 생성
3. **자동 생성** (보고만, 승인 안 받음)
4. 명시적으로 이름 바꿔달라면 거기서만 멈춤

## 관련 문서
- `COMMIT_CONVENTIONS.md`
- `PR_GUIDELINES.md`
- `TEAM_COLLABORATION.md`
