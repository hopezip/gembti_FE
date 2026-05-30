# TEAM_COLLABORATION.md — 팀 협업 규칙 (v2)

> 이 프로젝트의 작업 모드는 **풀팀 협업**입니다.
> 06 모듈에서 Git 워크플로우 통합 섹션이 추가됩니다.

## 팀 구성
- 프론트엔드: 4명 (본인 포함)
- 백엔드: 4명
- 작업 모드: 풀팀 협업
- 협업 도구: 노션 + 디스코드

## 작업 모드 영향 (v2 핵심) — 풀팀 협업

- PR: 의무, **본인 머지 금지** (최소 1명 승인)
- 승인 게이트: 영향 파일·푸시·커밋·PR (4개)
- micro 흐름 **비활성화** (모든 변경이 normal 이상 풀 흐름)
- 아래 룰을 엄격 준수

## 작업 시작 전

**Trigger**: 새 작업 시작
**Action**:
1. `git pull origin dev` 으로 최신 받기
2. SSOT.md / REQ / DesignEx에 변경이 있나 확인
3. 변경 있으면 디스코드 채널에 알림 확인

## 티켓 ID 충돌 방지

**Trigger**: 새 티켓 생성
**Action**:
1. `git pull` 으로 최신 티켓 목록 받기
2. REQ 기능 ID 기반 추적자 사용(`LOGIN-FE-001` 등), 신규는 `docs/tickets/`에서 다음 가용 `FEAT-NNN` 확인
3. 티켓 생성 후 즉시 커밋

## 같은 파일 동시 작업 방지

**Trigger**: 새 티켓 시작
**Action**:
1. 디스코드 채널에 "<티켓-ID> 시작합니다 / 영향 파일: ..." 공유
2. 이미 작업 중인 파일이면 조율 (프론트 4명이 같은 영역을 만질 수 있음)

## 머지 후 알림

**Trigger**: PR 머지
**Action**:
1. SSOT.md 변경 있으면 디스코드 알림
2. Breaking API change 있으면 디스코드 알림
3. 공통 컴포넌트(`components/ui`, `patterns`)·디자인 토큰 변경 시 프론트 전원 알림

## scratch 폴더 규칙
- 개인 디버깅 공간
- 커밋 OK, 강제 머지는 X
- 다른 팀원의 scratch를 임의로 삭제 금지

## 티켓 회고 섹션 규칙 (v2 — analysis 폴더 대체)
- 모든 normal/cross 티켓은 회고 섹션 필수
- 팀원 누구나 회고 작성 가능

## 백엔드와의 인터페이스

**Trigger**: 백엔드 API 변경 (Swagger 갱신)
**Action**: 백엔드 팀이 디스코드에 알림 → 프론트 팀이 `/api-sync` 실행

**Trigger**: Breaking change
**Action**: 백엔드 팀이 사전 합의 요청 → 프론트 팀과 조율 후 변경

> 현재 Swagger 제작 중. 완성 전까지 프론트는 REQ 데이터 모델 기준 MSW mock으로 진행하고, 계약 합의 티켓(`TASK-API-001`)을 MS-01에 둔다.

## 로그 시스템
- 일일 작업 로그: `docs/logs/YYYY-MM-DD.md` (자동 + `/log` 명령)
- 세션 로그: `docs/logs/sessions/` (Hook 자동, `.gitignore`, **WSL 전용**)
- 팀원 누구든 자신의 작업을 로그로 남길 수 있음

## Git 워크플로우 통합 (v2)

이 프로젝트는 자동화된 Git 워크플로우를 사용합니다 (풀팀 협업).

### 새 작업 시작
1. 사용자: "LOGIN-FE-001 구현해줘"
2. ticket-implementer가 분기 판별 (풀팀이라 normal/cross)
3. git-branching 스킬 자동 발동 → 브랜치 자동 생성 + 보고 (승인 없이)

### 작업 완료
1. 검증 통과 (FF ×1 + code-reviewer ×1 + 옵션)
2. 회고 섹션 채움 (티켓 파일 안)
3. commit-writing 스킬 → **승인** → 커밋
4. 푸시 → **승인** (풀팀)

### PR 생성
1. pr-creating 스킬 → PR 본문 자동 작성 → **승인** → `gh pr create`
2. **본인 머지 금지 — 리뷰어 1명 승인 후 머지**

상세: `GIT_WORKFLOW.md`, `COMMIT_CONVENTIONS.md`, `PR_GUIDELINES.md`
