#!/bin/bash
# 세션 시작 시 로그 파일 생성
#
# Hook 실패가 Claude 작업을 막으면 안 됨. set -e 대신 silent fail 정책.

set +e
[ "${CLAUDE_HOOKS_DISABLED:-false}" = "true" ] && exit 0

TIMESTAMP=$(date +"%Y-%m-%dT%H%M%S")
DATE=$(date +"%Y-%m-%d")
SESSION_ID="session-${TIMESTAMP}"

SESSION_FILE="docs/logs/sessions/${SESSION_ID}.md"
DAILY_FILE="docs/logs/${DATE}.md"

mkdir -p docs/logs/sessions 2>/dev/null || exit 0

cat > "${SESSION_FILE}" <<EOF 2>/dev/null || exit 0
# Session: ${SESSION_ID}

## Metadata
- 시작 시간: $(date +"%Y-%m-%d %H:%M:%S")
- 사용자: $(whoami)
- 작업 디렉토리: $(pwd)
- Git 브랜치: $(git branch --show-current 2>/dev/null || echo "N/A")
- Git 마지막 커밋: $(git log -1 --oneline 2>/dev/null || echo "N/A")

## 작업 기록

(아래에 도구 사용 / 사용자 요청 / Claude 응답이 자동 추가됩니다)

---

EOF

if [ ! -f "${DAILY_FILE}" ]; then
  cat > "${DAILY_FILE}" <<EOF 2>/dev/null || true
# 일일 작업 로그: ${DATE}

## 세션 목록

EOF
fi

echo "- [${SESSION_ID}](sessions/${SESSION_ID}.md) — $(date +"%H:%M") 시작" >> "${DAILY_FILE}" 2>/dev/null || true

echo "${SESSION_ID}" > .claude/hooks/.current-session-id 2>/dev/null || true

exit 0
