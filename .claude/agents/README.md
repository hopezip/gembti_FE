# .claude/agents

> 명시/암묵 호출되는 에이전트 모음.

## 이 폴더의 책임
- 특정 작업을 위임할 에이전트 정의
- description 기반 자동 인식 또는 명시 호출

## 폴더 내용 (v2)

| 에이전트 | 역할 | 호출 |
|----------|------|------|
| `api-sync.md` | 백엔드 Swagger 동기화 | `/api-sync` 또는 자동 |
| `ticket-writer.md` | 자연어 → v2 통합 양식 티켓 (plan/spec/회고 한 파일, REQ ID 추적) | `/new-ticket` 또는 자동 |
| `screen-doc.md` | 화면 정의서 작성 | `/screen-doc` 또는 자동 |
| `ticket-implementer.md` | 티켓 구현 + 3-tier 분기(풀팀이라 normal/cross) + 살뺀 검증 | "<티켓-ID> 구현해줘" 등 |
| `code-reviewer.md` | 프로젝트 특화 코드 리뷰 (AI_AGENT_RULES, Scope, 디자인 토큰/Park UI/auth, README sync). 1회 호출 + 1회 추가 | ticket-implementer 자동 |
| `pr-writer.md` | PR 본문 작성 (06에서 추가) | pr-creating 스킬 |

## 관련 문서
- `../skills/README.md` (06에서 추가)
- `../commands/README.md`
