# PLUGINS.md — Claude Code 플러그인 설치 안내

> 이 프로젝트의 검증 시스템은 외부 플러그인과 함께 동작합니다.
> 셋업 후 다음 플러그인들을 설치해주세요.

## 플러그인과 프로젝트 슬래시 커맨드 구분

- 아래 `/plugin ...` 명령은 Claude Code 외부 플러그인 설치용입니다.
- `/log`, `/new-ticket`, `/screen-doc`, `/api-sync`, `/done-ticket`는 플러그인이 아니라 `.claude/commands/*.md`로 생성되는 **프로젝트 로컬 슬래시 커맨드**입니다.
- 특히 `/log`는 `05-logging-setup`에서 `.claude/commands/log.md`로 생성되며, `docs/logs/YYYY-MM-DD.md`를 생성/갱신합니다.

## 필수 플러그인

### 1. TypeScript LSP
- 역할: 실시간 타입 검증
- 설치:
  ```
  /plugin marketplace add anthropics/claude-code
  /plugin install typescript-lsp@claude-plugins-official
  ```

### 2. Toss Frontend Fundamentals
- 역할: 프론트엔드 4원칙 자동 리뷰 (Cohesion / Coupling / Predictability / Readability)
- 설치:
  ```
  /plugin marketplace add toss/frontend-fundamentals
  /plugin install frontend-fundamentals@toss
  ```
- 사용법: `/frontend-fundamentals:review`
- v2 반복 모드: Critical 남으면 최대 1회만 추가 수정 (v1의 3회 폐기)

### 3. Anthropic Code Review
- 역할: 일반 코드 품질 (보안, 에러 핸들링, 테스트 커버리지)
- 설치:
  ```
  /plugin install code-review@claude-plugins-official
  ```

## 강력 추천 플러그인

### 4. Playwright (E2E 자동화)

**CLI 우선, MCP는 백업.** 둘 다 설치 가능.

#### 4-A. Playwright CLI (권장, 토큰 효율 4배)
- 프로젝트 로컬 설치 (이미 `@playwright/test`는 devDependency에 포함):
  ```bash
  pnpm exec playwright install
  ```
- 사용: `playwright-cli snapshot` / `click <ref>` / `fill <ref> "텍스트"` / `screenshot`

#### 4-B. Playwright MCP (백업)
  ```bash
  claude mcp add playwright -- pnpm dlx @playwright/mcp@latest
  ```

## 선택 플러그인

### 5. Chrome DevTools MCP
- 심층 디버깅 (인증/세션/Performance). 1시간 이상 막힌 버그용.
  ```
  /plugin install chrome-devtools@claude-plugins-official
  ```

### 6. Agent Browser (Claude in Chrome)
- 실제 Chrome 세션 작업 (로그인 유지). 일상 시각 확인용. Chrome 확장(Anthropic 공식).

## 플러그인 역할 분리표

| 도구 | 검증 영역 | 호출 |
|------|----------|------|
| TypeScript LSP | 타입 | 자동/실시간 |
| Toss FF | 프론트엔드 원칙 | `/frontend-fundamentals:review` |
| Anthropic code-review | 일반 코드 품질 | `/code-review` 또는 자동 |
| 자체 code-reviewer | 프로젝트 특화 규칙 (디자인 토큰/Park UI/auth) | ticket-implementer 자동 |
| Playwright CLI | E2E (Acceptance) | ticket-implementer 자동 |
| Playwright MCP | E2E (백업) | 자율 에이전트 시 |

## v2 자동 검증 파이프라인 (풀팀, micro 비활성)

### normal 흐름
```
1. TypeScript LSP        → 타입 안전성
2. pnpm lint (Biome)     → 코드 스타일
3. /frontend-fundamentals:review  → Toss 4원칙 (Critical 0개, 최대 1회 추가)
4. code-reviewer (자체)  → 프로젝트 규칙 (최대 1회 추가)
```

### cross 흐름
```
1~4번: normal과 동일
5. Playwright CLI        → 시각 회귀 (UI 변경 시)
6. PR 리뷰 게이트 (1명 승인 후 머지)
```
