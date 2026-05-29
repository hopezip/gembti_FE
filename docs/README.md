# docs/ — 시스템 문서 (v2)

## 문서 계층 (Tier)

### 기준 문서 (Tier 1 — 절대 기준)
- `SSOT.md` — 단일 진실
- `ARCHITECTURE.md` — 시스템 개요
- (기능 SSOT) `../docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md`
- (디자인 SSOT) `../docs/design/DESIGN_SYSTEM.md`

### 가이드 문서 (Tier 2 — 작업 절차)
- `AI_AGENT_RULES.md` — AI 행동 제약 (v2 분기 룰)
- `AI_ENTRYPOINT.md` — 작업 시작점
- `AI_DEV_PROMPT.md` — 구현 절차
- `DEVELOPMENT.md` — 개발 명령/워크플로우
- `QA_AND_DONE.md` — 완료 정의 (v2 회고 양식)
- `TEAM_COLLABORATION.md` — 협업 규칙 (풀팀)

### 도메인 문서 (Tier 3 — 영역별)
- `architecture/` — 8개 도메인 + README (인라인 룰 출처)

### 실행 단위 (Tier 4 — 매일 추가됨)
- `tickets/` — 작업 단위 (v2 통합 양식), MS-01~05
- `screens/` — 화면 정의서
- `03-api/` — 백엔드 미러 (자동)
- `scratch/` — 임시 메모
- `logs/` — 작업 로그 (Hook 자동, WSL 전용)

### v2에서 폐기된 폴더
- ~~`analysis/`~~ — 회고는 티켓 안 `## 회고` 섹션
- ~~`superpowers/plans/`~~ — plan은 티켓 안 `## Plan` 섹션

## v2 핵심 변화

1. **티켓 1개로 자기완결** (인라인 룰 포함)
2. **3-tier 자동 분기** (이 프로젝트는 풀팀이라 micro 비활성, normal/cross만)
3. **v2.1 Fast Path + 질문 정책** (micro+normal은 빠르게, 결과가 달라질 때만 질문)
4. **검증 루프 ×2** (FF ×1 + reviewer ×1)
5. **작업 모드별 룰** (이 프로젝트: 풀팀 — PR + 1명 승인 필수)
