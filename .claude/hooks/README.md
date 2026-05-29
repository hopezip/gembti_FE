# .claude/hooks

> 자동 실행 Hook 정의. **bash-first — WSL/macOS/Linux 전용.** Windows native PowerShell에서는 작동하지 않으므로 WSL에서 Claude Code를 실행하거나 `/log` 수동을 사용한다.

## 이 폴더의 책임
- 세션 자동 로깅
- 작업 자동 기록
- 일일 로그 자동 갱신

## 폴더 내용
- `session-start.sh` — 세션 시작 시 로그 파일 생성
- `post-tool-use.sh` — 도구 사용 기록 추가
- `session-end.sh` — 세션 요약 작성

## 작동 방식

```
[세션 시작]  → session-start.sh  → docs/logs/sessions/<timestamp>.md 생성 + 메타 기록
[도구 사용]  → post-tool-use.sh  → 현재 세션 파일에 도구 사용 추가 (시크릿 마스킹 + 2000자 제한)
[세션 종료]  → session-end.sh    → 세션 요약 + 일일 로그에 링크
```

## Hook 비활성화
- 임시 로컬 비활성화: `export CLAUDE_HOOKS_DISABLED=true`
- 전체 비활성화: `.claude/settings.json`에 `"disableAllHooks": true`

## 관련 문서
- `../../docs/logs/README.md`
