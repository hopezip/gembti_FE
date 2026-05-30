# COMMIT_CONVENTIONS.md — 커밋 메시지 규칙

> **Conventional Commits** 표준 사용.

## 기본 양식

```
<type>(<scope>): <ticket-id> <subject>

<body (선택)>

<footer (선택)>
```

> **티켓 ID는 콜론 바로 뒤, subject 앞에 둡니다.** 끝에 `[TASK-XXX]`처럼 대괄호로 붙이지 않습니다.
> - ✅ `chore(ci): TASK-CI-001 Gemini 워크플로우 제거`
> - ❌ `chore(ci): Gemini 워크플로우 제거 [TASK-CI-001]`

## Type (필수)

| Type | 의미 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(auth): LOGIN-FE-001 이메일 로그인 화면 추가` |
| `fix` | 버그 수정 | `fix(steam): STEAM-INTER-FE-002 비공개 안내 오류 수정` |
| `docs` | 문서 변경 | `docs: SSOT.md 백엔드 URL 갱신` |
| `style` | 코드 스타일 | `style: Biome 자동 수정 적용` |
| `refactor` | 리팩터링 | `refactor(api): REFACTOR-001 ky 인스턴스 분리` |
| `perf` | 성능 개선 | `perf(list): 가상 스크롤 적용` |
| `test` | 테스트 | `test(survey): 설문 진행 단위 테스트 추가` |
| `chore` | 빌드/패키지/설정 | `chore: 의존성 업데이트` |
| `ci` | CI 설정 | `ci: GitHub Actions 워크플로우 추가` |
| `build` | 빌드 시스템 | `build: vite 설정 변경` |
| `revert` | 되돌리기 | `revert: feat(auth) 되돌림` |

> **커밋 타입(`feat`)과 브랜치 prefix(`feature/`)는 일부러 다릅니다.** 타입은 Conventional Commits, 브랜치는 Git Flow 어휘입니다. 자세한 매핑은 `GIT_WORKFLOW.md` 참조.

## Scope (선택)

영향 받는 도메인/모듈: `auth`, `steam`, `survey`, `tendency`, `main`, `search`, `recommendation`, `game`, `community`, `party`, `chatbot`, `api`, `ui`, `config`, `mock`. 전체 영향(예: `docs`, `chore`)이면 생략.

> **scope는 선택입니다.** 도메인이 명확하면 붙이고(`feat(auth): …`), 전체/문서/설정 변경이면 생략합니다(`docs: …`). 매번 억지로 채우지 않습니다.

## Subject (필수)

- **한국어 사용**
- 명령형 또는 완료형 (통일)
- 마침표 ❌ / 50자 이내

## Body / Footer (선택)

- Body: 무엇을/왜 (How보다 What/Why), 72자 줄바꿈
- Footer: `BREAKING CHANGE: <설명>`, `Closes #이슈번호`

## 예시

```
feat(auth): LOGIN-FE-001 이메일 로그인 화면 구현

- 이메일/비밀번호 입력 폼 (React Hook Form + Zod)
- httpOnly Cookie 방식 JWT 저장
- TanStack Query useMutation 연결

Closes #15
```

## Forbidden

- 한 커밋에 여러 의미 섞기
- `fix: 오타`, `update: 수정` 같은 모호한 메시지
- 마침표로 subject 끝내기
- subject 안에서 영어·한국어 혼용
- 티켓 ID를 끝에 대괄호로 붙이기 (`... [TASK-XXX]`) — 콜론 뒤로 통일

## 자동화

`commit-writing` 스킬이 자동: git diff 분석 → type/scope/subject 추론 → **사용자 승인** → 커밋 실행

## 한 커밋 단위 원칙

- 1 커밋 = 1 의미 단위
- 한 티켓에 5개 이상 커밋이면 squash 권장

## 관련 문서
- `GIT_WORKFLOW.md`
- `PR_GUIDELINES.md`
