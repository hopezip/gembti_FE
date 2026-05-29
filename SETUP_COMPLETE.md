# ✅ SETUP_COMPLETE.md — 셋업 완료!

축하합니다! GamBTI 프론트엔드 하네스 시스템 셋업이 완료되었습니다 (bootstrap v2.4.4, **풀팀 협업 모드**).

## 이 프로젝트의 특수성 (꼭 기억)

- **기능 SSOT**: `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md` (MVP 36 / 추가기능 50). 기능 ID(`LOGIN-FE-001` 등)를 티켓 추적자로 사용.
- **디자인 SSOT**: `docs/design/DESIGN_SYSTEM.md` + 루트 `panda.config.ts`. **다크 모드·데스크탑 전용**, semantic token만, Park UI 베이스 + recipe.
- **스택**: Vite + React 19 / TS strict / Panda CSS + Park UI / Zustand / TanStack Query / ky / React Router / RHF+Zod / JWT(httpOnly Cookie) / MSW / Vitest+RTL + Playwright / Biome.
- **작업 모드**: 풀팀(7명, 본인=프론트 리드) → PR 의무, **본인 머지 금지(1명 승인)**, micro 흐름 비활성.

## v2의 의미

- **plan = ticket = 회고**: 한 파일에 누적 (옮겨적기 0)
- **인라인 룰**: 티켓 상단에 필요한 룰만 요약
- **3-tier 자동 분기**: 풀팀이라 micro 비활성 → normal/cross
- **검증 루프 ×6 → ×2**: FF + code-reviewer 각 1회
- **승인 게이트 (풀팀) 4개**: 영향 파일·푸시·커밋·PR

## 생성된 것 요약

### 폴더 구조
- `docs/` — architecture(8 도메인+README), tickets(MS-01~05 + 템플릿), screens, scratch, logs, 03-api
  - v2: `docs/analysis/`, `docs/superpowers/plans/` 폐기 (회고/plan은 티켓 안)
- `.claude/` — agents(6) + commands(8) + hooks(3) + skills(3)
- `src/` — Vite 런타임 골격 (main/App/routes/lib/mocks/test)
- `docs/requirements`, `docs/design` — 요구사항·디자인 SSOT

### 핵심 문서
- 진입점: `CLAUDE.md`, `README.md`, `ANSWERS.md`
- 기준: `docs/SSOT.md`, `docs/ARCHITECTURE.md`, `docs/AI_AGENT_RULES.md`, `docs/QA_AND_DONE.md`
- 가이드: `docs/AI_ENTRYPOINT.md`, `docs/AI_DEV_PROMPT.md`, `docs/DEVELOPMENT.md`, `docs/TEAM_COLLABORATION.md`
- 협업: `docs/GIT_WORKFLOW.md`, `docs/COMMIT_CONVENTIONS.md`, `docs/PR_GUIDELINES.md`
- 아키텍처: `docs/architecture/` 8개 도메인 문서
- 플러그인 안내: `PLUGINS.md`
- MS-01에 `TASK-API-001` (Swagger 계약 합의) 티켓 자동 생성됨

### 에이전트 6개
- `api-sync` / `ticket-writer` / `screen-doc` / `ticket-implementer` / `code-reviewer` / `pr-writer`

### 스킬 3개 (자동 발동)
- `git-branching`(자동) / `commit-writing`(승인) / `pr-creating`(승인, 본인 머지 금지)

### 슬래시 커맨드 8개
- `/new-ticket`, `/screen-doc`, `/api-sync`, `/done-ticket` (03)
- `/log` (05)
- `/branch`, `/commit`, `/pr` (06) — 풀팀이라 `/quick-fix` 생략

### Hook 시스템 (WSL 전용)
- SessionStart / PostToolUse / SessionEnd — 자동 세션 로깅 (시크릿 마스킹 + 2000자 제한)
- ⚠️ Windows native PowerShell에서는 미작동. WSL에서 실행하거나 `/log` 수동 사용.

---

## 🎯 다음 단계 (순서대로 — 직접 실행)

### Step 1: 의존성 설치
```bash
pnpm install
```

### Step 2: 디자인 토큰 코드 생성
```bash
pnpm panda codegen
```
(`styled-system/` 생성. `pnpm dev`/`build`에 이미 선행 포함되어 있음)

### Step 3: 환경변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local` 값:
- `VITE_API_BASE_URL` — 백엔드 API URL (Swagger 제작 중이라 비워두고)
- `VITE_USE_MOCK=true` — 개발 중엔 mock 사용

### Step 4: 런타임 검증 (스택 커스텀했으니 권장)
```bash
pnpm type-check
pnpm build
```
개발 서버는 별도 터미널에서:
```bash
pnpm dev   # 정상 부팅 확인 후 Ctrl+C
```

### Step 5: MSW 초기화
```bash
pnpm exec msw init public/ --save
```

### Step 6: Hook 권한/검증 (WSL/Linux/macOS에서)
```bash
chmod +x .claude/hooks/*.sh
bash -n .claude/hooks/*.sh
```
> Windows PowerShell만 쓸 거면 Hook은 비활성 상태로 두고 `/log` 수동 사용.

### Step 7: Git / GitHub 연결
이미 `git init`(main) 완료됨. 첫 커밋 + 원격 연결:
```bash
git add .
git commit -m "chore: GamBTI 프론트엔드 하네스 시스템 v2 초기 셋업"
git remote add origin https://github.com/<유저명>/<레포명>.git
git push -u origin main

# dev 브랜치 (협업 필수)
git checkout -b dev
git push -u origin dev
git checkout main
```

### Step 8: GitHub CLI 인증 (PR 자동화)
```bash
gh auth login
```

### Step 9: 브랜치 보호 규칙 (풀팀 — 필수)
GitHub 웹 → Settings → Branches → Add rule:
- `main`, `dev` 각각: ✅ Require a pull request before merging + ✅ Require approvals (1명)

### Step 10: 첫 작업
```
/new-ticket LOGIN-FE-001 이메일 로그인
```
또는 디자인부터:
```
/screen-doc 로그인 화면
```

---

## 📚 익숙해져야 할 명령어

### 개발
- `pnpm dev` / `pnpm build` / `pnpm type-check` / `pnpm lint` / `pnpm test` / `pnpm panda codegen`

### Claude Code 슬래시
- `/new-ticket <설명>` / `/screen-doc <설명>` / `/api-sync` / `/done-ticket <ID>` / `/log`
- `/branch <티켓-ID>` / `/commit` / `/pr`
- `/frontend-fundamentals:review`

### 자연어 요청
- "LOGIN-FE-001 구현해줘" → ticket-implementer (normal/cross 자동 판별)
- "code-reviewer로 검토해줘" → 자체 리뷰

---

## ⚠️ 중요 주의사항

### 자동 생성 파일 직접 편집 금지
- `docs/03-api/openapi.json` / `src/types/api.ts` / `src/lib/api/*.ts` / `src/mocks/handlers/*.ts` / `docs/logs/sessions/*`

### 디자인 규칙 (GamBTI 핵심)
- semantic token만 (`bg.surface`, `fg.default` ...). primitive(`gray.900`)/hex/인라인 style 금지
- `panda.config.ts` 토큰 변경은 cross 흐름 (디자인 SSOT는 DesignEx)
- Park UI 베이스 + recipe, 다크·데스크탑 전용

### 백엔드 Swagger 미정
Swagger 제작 완료되면: `docs/SSOT.md` URL 갱신 → `/api-sync` 실행. 그 전까지 REQ 6장 데이터 모델 기준 MSW mock.

### 풀팀 작업 흐름
- 모든 변경에 티켓 (micro 없음)
- 본인 머지 금지 — PR 후 리뷰어 1명 승인
- main/dev 직푸시 금지

---

## 🆘 막힐 때

- **Hook 작동 안 함**: Windows면 정상(WSL 전용). `/log` 수동 사용. 또는 `.claude/settings.json`에 `"disableAllHooks": true`
- **빌드 실패**: `pnpm panda codegen` 먼저 실행됐는지 확인 (styled-system 생성)
- **분기 정정**: "이거 cross로 다시 진행해줘"

---

화이팅! 🚀
