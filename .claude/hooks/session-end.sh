#!/bin/bash
# 세션 종료 시 요약 작성
#
# Hook 실패가 Claude 작업을 막으면 안 됨. set -e 대신 silent fail 정책.

set +e
[ "${CLAUDE_HOOKS_DISABLED:-false}" = "true" ] && exit 0

SESSION_ID=$(cat .claude/hooks/.current-session-id 2>/dev/null || echo "unknown")
SESSION_FILE="docs/logs/sessions/${SESSION_ID}.md"

if [ ! -f "${SESSION_FILE}" ]; then
  exit 0
fi

# 도구 기록 한 줄 형식(- `HH:MM` **Tool**)을 센다.
TOOL_COUNT=$(grep -cE '^- `[0-9]' "${SESSION_FILE}" 2>/dev/null || echo "0")
DURATION_MIN=$(( ($(date +%s) - $(stat -c %Y "${SESSION_FILE}" 2>/dev/null || stat -f %m "${SESSION_FILE}" 2>/dev/null || echo "$(date +%s)")) / 60 ))

cat >> "${SESSION_FILE}" <<EOF 2>/dev/null || true

---

## 세션 요약

- 종료 시간: $(date +"%Y-%m-%d %H:%M:%S")
- 지속 시간: 약 ${DURATION_MIN}분
- 도구 사용 횟수: ${TOOL_COUNT}회
- Git 변경 파일: $(git diff --name-only HEAD 2>/dev/null | wc -l | tr -d ' ')개

## 변경된 파일
\`\`\`
$(git diff --name-only HEAD 2>/dev/null || echo "Git 정보 없음")
\`\`\`

## 새 커밋
\`\`\`
$(git log --since="${DURATION_MIN} minutes ago" --oneline 2>/dev/null || echo "없음")
\`\`\`
EOF

rm -f .claude/hooks/.current-session-id 2>/dev/null || true

exit 0
