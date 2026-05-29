# AI_DEV_PROMPT.md — 표준 구현 프롬프트 (v2)

> 티켓을 받았을 때 Claude가 따라야 하는 단계.
> v2: 3-tier 자동 분기 + 살뺀 검증. 풀팀 모드라 micro 비활성.

## 절차

### 0. 변경 사이즈 판별

```
입력: 자연어 요청 또는 티켓
판별 → normal / cross   (micro는 풀팀 모드라 비활성)
```

판별 기준은 `AI_AGENT_RULES.md`의 "3-tier 자동 분기" 섹션 참조.

### 1. 컨텍스트 적재 (v2 — 가벼움)

**normal 흐름**:
- 티켓 파일 1개 필수
- 인라인 룰로 부족할 때만 도메인 architecture 자율 추가
- UI면 `docs/design/DESIGN_SYSTEM.md`의 해당 컴포넌트 사양

**cross 흐름**:
- 티켓 파일 1개 + 영향 도메인 architecture 1~2개

### 2. 영향 범위 파악

- 어떤 파일을 만들/수정할 예정인가?
- 영향 받는 다른 화면/기능이 있는가?
- 백엔드 API 변경이 필요한가? (있다면 사용자에게 알림)

### 3. 사용자에게 보고 (승인 없이 자동 진행)

```
티켓: <ID> <제목>   (예: LOGIN-FE-001 이메일 로그인)
흐름: <normal / cross>
영향 파일:
- (신규) src/...
- (수정) src/...
구현 시작합니다.
```

"시작해도 될까요?" 묻지 않음. 보고만. (단 사용자가 "잠깐"이라 하면 즉시 멈춤)

### 4. 구현

- AI_AGENT_RULES 준수 / 인라인 룰 준수 / 최소 수정
- 자동 생성 파일은 건드리지 않기
- semantic token만, Park UI 베이스 + recipe, 데스크탑 다크 모드

### 5. 검증 (04 모듈 살뺀 버전)

**normal/cross**:
- `pnpm type-check` + `pnpm lint`
- `/frontend-fundamentals:review` Critical 0개 (최대 1회 추가)
- 자체 code-reviewer 에이전트 (최대 1회 추가)
- Playwright (cross + UI) — MCP는 백업

### 6. 회고 섹션 채우기 (별도 파일 안 만듦)

티켓 파일의 `## 회고` 섹션:
```markdown
## 회고
- 실제로 한 일: ...
- 빗나간 점: ...
- 다음에 비슷한 거 할 때: ...
```

### 7. README 업데이트 (폴더 책임 변경 시)

- 변경된 폴더의 README.md 검토 및 갱신

### 8. 커밋 + PR (06 모듈 흐름, 풀팀)

- commit-writing 스킬 → 승인 → 커밋
- 푸시 → PR 생성 → **최소 1명 승인 후 머지** (본인 머지 금지)
