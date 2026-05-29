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
chore/<티켓-ID>-<짧은-설명>     ← 설정/문서
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
| CHORE | `chore/` | dev |

REQ 기능 ID를 티켓 ID로 쓰는 경우 예: `feature/LOGIN-FE-001-email-login`

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
