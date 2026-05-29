#!/bin/bash
# 도구 사용 후 세션 파일에 사람이 읽을 수 있는 한 줄 요약을 기록한다.
#
# ⚠️ 에러 처리 정책:
# Hook 실패가 Claude 작업을 막으면 안 됨. set -e 대신 명시적 가드 + 마지막 || true로 silently 실패.
#
# 기록 정책:
# - raw JSON을 통째로 찍지 않는다. 도구별 핵심 정보만 한 줄로 요약한다.
#   (Bash=설명+명령, Read/Write/Edit=파일명, Grep=패턴, Glob=패턴, Task=설명 등)
# - tool_response(파일 전체 내용 등)는 기록하지 않는다 → 로그 비대 방지.
# - 시크릿 패턴은 마스킹한다.
# - 길이는 문자(코드포인트) 기준으로 자른다 → 멀티바이트(한글) 깨짐 방지.
# - 백틱/줄바꿈은 정리해 markdown 리스트가 깨지지 않게 한다.

set +e
[ "${CLAUDE_HOOKS_DISABLED:-false}" = "true" ] && exit 0

SESSION_ID=$(cat .claude/hooks/.current-session-id 2>/dev/null || echo "unknown")
SESSION_FILE="docs/logs/sessions/${SESSION_ID}.md"

if [ ! -f "${SESSION_FILE}" ]; then
  exit 0
fi

INPUT_JSON=$(cat 2>/dev/null || echo "{}")
TIMESTAMP=$(date +"%H:%M")

# node로 사람이 읽을 한 줄(필요 시 두 줄) 요약을 만든다 (1순위: 가장 견고).
NODE_SCRIPT=$(cat <<'NODEEOF'
let data = '';
process.stdin.on('data', (d) => { data += d; });
process.stdin.on('end', () => {
  let obj = {};
  try { obj = JSON.parse(data); } catch (e) {}
  const ts = process.env.TS || '';
  const name = obj.tool_name || 'unknown';
  const ti = obj.tool_input || {};

  const clean = (v) => String(v == null ? '' : v)
    .replace(/[\r\n]+/g, ' ')   // 줄바꿈 → 공백
    .replace(/`/g, "'")          // 백틱 → 작은따옴표 (markdown 깨짐 방지)
    .trim();
  const rel = (p) => clean(p).replace(/^.*[\\/]FINALPROJECT[\\/]/, '').replace(/\\/g, '/');
  const cut = (s, n) => { const a = Array.from(s); return a.length > n ? a.slice(0, n).join('') + ' …' : s; };
  const mask = (s) => clean(s)
    .replace(/(Bearer|Basic)\s+[A-Za-z0-9._\-]+/gi, '$1 [REDACTED]')
    .replace(/((?:API_)?KEY|SECRET[A-Z_]*|TOKEN|PASS(?:WORD|WD)?|AUTH[A-Z_]*|CREDENTIAL[A-Z_]*)(\s*[:=]\s*)"?[^"\s,}]+/gi, '$1$2[REDACTED]');

  let summary = '';
  let detail = '';
  switch (name) {
    case 'Bash': case 'PowerShell':
      summary = clean(ti.description);
      detail = mask(cut(clean(ti.command), 200));
      break;
    case 'Read': case 'Write': case 'NotebookEdit':
      summary = rel(ti.file_path); break;
    case 'Edit':
      summary = rel(ti.file_path); break;
    case 'Glob':
      summary = clean(ti.pattern) + (ti.path ? ' in ' + rel(ti.path) : ''); break;
    case 'Grep':
      summary = (ti.pattern ? '"' + clean(ti.pattern) + '"' : '')
        + (ti.path ? ' in ' + rel(ti.path) : '')
        + (ti.glob ? ' [' + clean(ti.glob) + ']' : ''); break;
    case 'Task': case 'Agent':
      summary = (ti.subagent_type ? '[' + clean(ti.subagent_type) + '] ' : '') + clean(ti.description); break;
    case 'Skill':
      summary = clean(ti.skill) + (ti.args ? ' ' + clean(ti.args) : ''); break;
    case 'TaskCreate': case 'TaskUpdate':
      summary = clean(ti.description || ti.prompt || ti.status); break;
    case 'WebFetch': case 'WebSearch':
      summary = clean(ti.url || ti.query); break;
    default:
      try { summary = mask(JSON.stringify(ti)); } catch (e) { summary = clean(ti); }
  }
  summary = mask(cut(summary, 160)) || '(인자 없음)';

  let line = '- `' + ts + '` **' + name + '** — ' + summary;
  if (detail) line += '\n  ↳ ' + detail;
  process.stdout.write(line + '\n');
});
NODEEOF
)

WROTE=""
if command -v node >/dev/null 2>&1; then
  LINE=$(printf '%s' "${INPUT_JSON}" | TS="${TIMESTAMP}" node -e "${NODE_SCRIPT}" 2>/dev/null)
  if [ -n "${LINE}" ]; then
    printf '%s\n' "${LINE}" >> "${SESSION_FILE}" 2>/dev/null || true
    WROTE="1"
  fi
fi

# node 실패 시 폴백: tool_name만이라도 한 줄로
if [ -z "${WROTE}" ]; then
  if command -v jq >/dev/null 2>&1; then
    TOOL_NAME=$(printf '%s' "${INPUT_JSON}" | jq -r '.tool_name // "unknown"' 2>/dev/null || echo "unknown")
  else
    TOOL_NAME=$(printf '%s' "${INPUT_JSON}" | tr '\n' ' ' | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' 2>/dev/null | head -n 1)
    [ -n "${TOOL_NAME}" ] || TOOL_NAME="unknown"
  fi
  printf -- '- `%s` **%s**\n' "${TIMESTAMP}" "${TOOL_NAME}" >> "${SESSION_FILE}" 2>/dev/null || true
fi

exit 0
