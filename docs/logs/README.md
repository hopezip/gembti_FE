# docs/logs

> 모든 작업의 자동 + 수동 로그 저장소.
> ⚠️ 자동 로깅(Hook)은 **WSL/macOS/Linux 전용**. Windows native PowerShell에서는 `/log` 수동만 작동.

## 이 폴더의 책임
- 일일 작업 이력
- Claude 세션별 자동 기록 (Hook)
- 수동 보강 메모

## 폴더 구조

```
docs/logs/
├── README.md                       ← 이 파일
├── _DAILY_TEMPLATE.md              ← 일일 로그 양식
├── _SESSION_TEMPLATE.md            ← 세션 로그 양식
├── YYYY-MM-DD.md                   ← 일일 로그 (자동 + 수동)
└── sessions/
    └── session-YYYY-MM-DDTHHMMSS.md  ← 세션별 자동 로그 (Hook, gitignore)
```

## 자동 로깅 (Hook 기반, WSL 전용)

- **SessionStart Hook**: 세션 시작 시 sessions/ 에 새 파일 생성
- **PostToolUse Hook**: 도구 사용마다 세션 파일에 추가 (시크릿 마스킹 + 2000자 제한)
- **SessionEnd Hook**: 세션 종료 시 요약 작성
- 새 세션 시작 → 일일 로그에 세션 링크 자동 추가

## 수동 보강

`/log` 슬래시 커맨드로: 완료 티켓 / 트러블 / 학습 / 내일 할 일 추가.
예: `/log 오늘 작업 정리`

## 작업 규칙
- **편집 가능**: 일일 로그의 수동 섹션
- **자동 생성 부분 수정 금지**: 세션 메타, 도구 기록 등

## Git 정책 (커밋 vs 로컬 보관) — v2

| 파일 | 정책 | 이유 |
|------|------|------|
| `docs/logs/YYYY-MM-DD.md` (일일 로그) | **로컬 전용 (gitignore)** | 로컬 보관 — 팀 충돌 방지, 공유는 `/log` 요약·티켓 회고로 |
| `docs/logs/sessions/*.md` (세션 원문) | **gitignore** (기본) | 도구 입력 평문이라 시크릿 노출 위험. 마스킹은 사후 보호일 뿐 |
| `docs/tickets/MS-*/*.md` (티켓 = 회고 포함) | **로컬 전용 (gitignore)** | 로컬 보관 — 티켓+회고가 한 파일, 공유는 이슈(ID 선점)·PR로 |

> v1의 `docs/analysis/*_report.md`는 v2에서 폐기. 회고는 티켓 파일 `## 회고` 섹션으로 통합.

`.gitignore`에 `docs/logs/sessions/`와 `.claude/hooks/.current-session-id`가 포함되어 있습니다(03에서 설정).

세션 로그는 **로컬에서만** 보관됩니다. 공유 시 `/log`로 정리한 요약본 또는 티켓 회고를 사용하세요.

## Hook 비활성화
- 로컬 임시: `export CLAUDE_HOOKS_DISABLED=true`
- 전체: `.claude/settings.json`에 `"disableAllHooks": true`

## 관련 문서
- `../../.claude/hooks/README.md`
- `../tickets/README.md` (v2: 티켓 안에 회고 통합)
- `../scratch/README.md` (임시 디버깅)
