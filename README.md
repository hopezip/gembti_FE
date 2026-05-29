# GamBTI

게임 유저들을 위한 AI 게임 추천 서비스. 설문과 Steam 라이브러리 데이터를 분석해 사용자의 6대 게임 성향을 진단하고, 맞춤 게임을 추천한다.

## 팀
- 작업 모드: 풀팀 협업
- 협업 규모: 4명 이상 (총 7명)
- 프론트엔드: 3명 (본인 = 프론트 리드)
- 백엔드: 4명
- 기간: 미정

## 기술 스택
- App Template: Vite + React 19 SPA, TypeScript strict
- 데이터: TanStack Query
- 상태: Zustand
- UI: Panda CSS + Park UI (다크 모드·데스크탑 전용)
- 라우팅: React Router
- 폼: React Hook Form + Zod
- 인증: 백엔드 JWT + httpOnly Cookie
- HTTP: ky
- 테스트: Vitest + RTL (단위), Playwright (E2E)
- Mock: MSW
- Lint/Format: Biome
- 배포: Vercel

## 시작하기

```bash
pnpm install
cp .env.local.example .env.local
# .env.local 값 채우기 (VITE_API_BASE_URL, VITE_USE_MOCK)
pnpm panda codegen
pnpm dev
```

## 문서

- `CLAUDE.md` — Claude Code 진입점
- `docs/SSOT.md` — 단일 진실 문서
- `docs/ARCHITECTURE.md` — 시스템 개요
- `docs/AI_AGENT_RULES.md` — AI 행동 규칙
- `docs/DEVELOPMENT.md` — 개발 절차
- `docs/tickets/` — 작업 티켓 (spec+plan+회고 통합)
- `docs/architecture/` — 도메인별 아키텍처
- `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md` — **기능 요구사항 SSOT** (MVP 36 / 추가기능 50)
- `docs/design/DESIGN_SYSTEM.md` — **디자인 시스템 SSOT** (토큰·컴포넌트 사양)

## 시스템 버전

이 프로젝트는 **bootstrap v2.4.4 — 단독·소팀 친화적** 시스템을 사용합니다.
v1과 다른 점: 3-tier 자동 분기, 옮겨적기 0번, 검증 루프 ×2.
