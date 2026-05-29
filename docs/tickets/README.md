# docs/tickets

> 작업 단위 = 실행 계약서.
> v2: spec + plan + 회고가 한 파일에 통합.

## 이 폴더의 책임
- 모든 normal/cross 변경의 추적 단위
- spec/plan/AC/인라인 룰/회고가 한 티켓 파일에 누적
- (풀팀 모드라 micro 흐름 비활성 → `micro-fixes.md`는 거의 미사용)

## 폴더 내용

```
docs/tickets/
├── README.md           ← 이 파일
├── _TEMPLATE.md        ← v2 통합 양식
├── micro-fixes.md      ← micro 흐름 누적 (풀팀이라 거의 미사용)
├── MS-01/              ← 인증/가입 + 에러처리 (LOGIN, ERROR)
├── MS-02/              ← Steam 연동 (STEAM-INTER)
├── MS-03/              ← 설문 + 성향 결과 (SURVEY, TEND)
├── MS-04/              ← 메인/검색/추천/상세 (MAIN, SEARCH, REC, REC-DET)
└── MS-05/              ← 추가기능 backlog (scaffold만)
```

## 티켓 ID 규칙

- REQ 기능 ID를 추적자로 사용 (예: `LOGIN-FE-001_email-login.md`)
- REQ에 없는 신규 작업: `FEAT-NNN` / `BUG-NNN` / `TASK-NNN` / `REFACTOR-NNN`

## v2 통합 양식

v2의 티켓은 다음을 한 파일에 담습니다:
- 메타데이터
- **인라인 룰** (해당 도메인 핵심 4~6줄)
- **Spec** (왜)
- **Plan** (어떻게, Task 단위)
- **AC** (Acceptance Criteria)
- **영향 파일**
- **Verification** (자동 검증 체크리스트)
- **회고** (구현 후 채움)

→ v1의 별도 plan 파일(`docs/superpowers/plans/`)과 별도 analysis 리포트(`docs/analysis/`)가 모두 폐기되었습니다.

## 작업 규칙
- `/new-ticket <설명>` 명령으로 자동 생성 (권장)
- 또는 `_TEMPLATE.md` 복사
- 풀팀 모드라 오타 수정도 티켓+PR 흐름 (양식은 간결하게 가능)

## 관련 문서
- `../screens/README.md`
- `../architecture/README.md` (인라인 룰 출처)
- `../../docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md` (기능 SSOT)
