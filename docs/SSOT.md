# SSOT.md — Single Source of Truth

> **이 문서가 모든 충돌의 최우선 기준입니다.**
> 다른 문서와 충돌 시 이 문서가 우선합니다.
> 단, **기능 요구사항**은 `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md`, **디자인 토큰**은 `docs/design/`가 1차 출처이며 이 문서는 그 둘을 가리킨다.

## 프로젝트 정체성
- **이름**: GamBTI (패키지/폴더명 `gambti`, 디자인 표기 `GAMBITI`)
- **설명**: 게임 유저들을 위한 AI 게임 추천 서비스
- **카테고리**: AI/LLM
- **타겟**: 게임을 즐기는 일반 유저
- **기간**: 미정
- **성격**: 사이드 프로젝트

## 팀 + 작업 모드 (v2)
- **작업 모드**: 풀팀 협업
  - 영향: PR 의무, 본인 머지 금지(최소 1명 승인), 승인 게이트 4개, micro 자동 흐름 비활성화
- 협업 규모: 4명 이상 (총 7명)
- 사용자 역할: 프론트 리드
- 프론트엔드 인원: 3명
- 백엔드 인원: 4명
- 백엔드 연동 방식: Swagger/OpenAPI URL 예정 (현재 제작 중 → 초기 MSW mock)

## 작업속도 + 질문 정책 (v2.1)
- **속도 우선 범위**: micro + normal까지 빠르게
- **질문 기준**: 작업 결과가 달라질 때만
- **질문 방식**: 1~3개 질문
- **추천값 처리**: 위험 작업은 중단·일반 작업은 추천값으로 진행

## 기술 스택 (확정)
- 앱 템플릿: **Vite + React 19 SPA**
- 언어: **TypeScript strict**
- 데이터 패칭: **TanStack Query**
- 클라이언트 상태: **Zustand**
- UI: **Panda CSS + Park UI** (다크 모드·데스크탑 전용)
- 라우팅: **React Router**
- 폼: **React Hook Form + Zod**
- 인증: **백엔드 JWT + httpOnly Cookie**
- HTTP: **ky**
- 테스트: **Vitest + RTL (단위) / Playwright (E2E)**
- Mock: **MSW**
- Lint/Format: **Biome**

## 백엔드 API 기준
- Swagger URL: 미정 (제작 중)
- API 동기화 정책: 백엔드가 Swagger 갱신 → 프론트가 `/api-sync` 실행
- 단일 소스: `docs/03-api/openapi.json` (자동 생성, 직접 편집 금지)
- 완성 전까지: `REQ` 6장 데이터 모델 + 7장 API 훅 후보를 기준으로 MSW mock 구성

## 폴더 책임 분리 (v2)

```
src/
├── main.tsx     Vite 앱 엔트리
├── App.tsx      루트 컴포넌트
├── routes/      React Router 라우트/페이지 엔트리
├── features/    도메인별 응집 (auth, steam, survey, tendency, main, search, recommendation, game, mypage, user, follow, community, party, chatbot)
├── components/
│   ├── ui/      Park UI 래핑 Primitive (button, input, tag, chip, card, dialog, toast, menu, tabs, avatar)
│   └── patterns/ 도메인 컴포넌트 (GameCard, ReviewCard, PartyCard, CommentThread, MatchScore, TypeTag ...)
├── layouts/     GlobalShell, DetailLayout, FormLayout
├── lib/
│   └── api/     API 클라이언트 (자동 생성, 직접 편집 금지)
├── services/    도메인 서비스 레이어 (authApi, steamApi, surveyApi, gameApi ...)
├── hooks/       공용 훅
├── types/       타입 (api.ts는 자동 생성)
└── mocks/       MSW 핸들러 (자동 생성)

styled-system/   panda codegen 산출물 (gitignore)

docs/
├── architecture/  도메인별 아키텍처 문서 (티켓 인라인 룰의 출처)
├── 03-api/        백엔드 미러 (자동 동기화)
├── screens/       화면 정의서 (티켓 구현하며 누적)
├── tickets/       작업 단위 (v2: spec+plan+회고 통합)
│   ├── MS-01~04   MVP 마일스톤
│   ├── MS-05      추가기능 backlog
│   └── micro-fixes.md  (풀팀이라 거의 미사용)
├── scratch/       임시 메모 / 디버깅 흔적
└── logs/          작업 로그 (Hook 자동, WSL 전용)

# v2에서 폐기된 폴더
# docs/analysis/        → 회고는 티켓 ## 회고 섹션
# docs/superpowers/plans/ → plan은 티켓 ## Plan 섹션
```

## 환경변수 규칙

- `.env.local`: 로컬 개발 (Git 제외)
- `.env.local.example`: 템플릿 (Git 포함)
- Vite 템플릿: `VITE_` 접두사만 클라이언트에 노출

필수 환경변수:
- `VITE_API_BASE_URL` — 백엔드 API URL (미정 시 mock 베이스)
- `VITE_USE_MOCK` — MSW 활성화 토글 (true/false)

## 디자인 시스템 기준 (GamBTI)

- **토큰 출처**: `docs/design/panda.config.ts` → 루트 `panda.config.ts`, `pnpm panda codegen`
- **사양서**: `docs/design/DESIGN_SYSTEM.md` (anatomy/variant/size 강제)
- **모드**: 다크 전용, 데스크탑 전용 (1100px 미만 1열 fallback만)
- **색**: semantic token만 사용 (primitive 직접 사용 금지)
- **폰트**: Noto Sans KR(본문) / JetBrains Mono(메타) / Archivo Black(로고 전용)
- **아이콘**: Park UI 기본 Lucide

## AI 작업 순서 (canonical) — v2

### v2: 티켓 1개로 자기완결 (권장)
1. CLAUDE.md (진입점)
2. 현재 작업 티켓 — 인라인 룰 포함

### v2: 큰 변경 의논 / 작업 없을 때
1. SSOT.md (이 문서)
2. ARCHITECTURE.md
3. AI_AGENT_RULES.md
4. DEVELOPMENT.md
5. AI_ENTRYPOINT.md

## 변경 규칙
- 이 SSOT.md는 사용자(프론트 리드)의 명시적 승인 없이 수정 금지
- 기술 스택 변경 시 ANSWERS.md도 함께 갱신
- 변경 시 `docs/logs/`에 기록

## 핵심 기능 (P0)

> **출처: `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md` (88개 = MVP 36 / 추가기능 50)**

**P0 = MVP (우선순위 높음)**
1. 인증/회원가입 (`LOGIN-FE-001~005`): 이메일 로그인/가입, 이메일 인증, 닉네임 중복확인, 비밀번호 정책, 만15세 제한, 자동 로그인, Steam 소셜 로그인
2. Steam 연동 (`STEAM-INTER-FE-001~004`): 연동/건너뛰기, 성공·실패 피드백, 비공개 안내+재시도, 라이브러리 요약
3. 설문 조사 (`SURVEY-FE-001~002`): 인트로, 1~5점 척도, 자동 진행, 실시간 저장
4. 성향 결과 (`TEND-FE-001~003`): 6대 성향 + 레이더 차트 + 대표 타이틀/태그, 추천 4개
5. 메인 (`MAIN-FE-001~004`): 추천 배너, 성향 태그 필터, 추천/신규 게임 목록
6. 검색/탐색 (`SEARCH-FE-001~004`): 검색창, 최근 검색, 필터, 실패 대체 추천
7. 게임 추천 (`REC-FE-*` MVP): 이번주 인기, 4점↑ 추천, 태그/장르, 세일 인기, 취향 재분석
8. 게임 상세 (`REC-DET-FE-001~005`): 정보/사양, Steam 리뷰, 위시리스트, 구매/라이브러리, 비슷한 게임
9. 에러/예외처리 (`ERROR-FE-001~003`)

**P1/P2 = 추가기능 (scaffold만)**: 네비/프로필 팝업, 마이페이지, 유저페이지, 팔로우, 커뮤니티, 게시글, 댓글, 파티 모집, 챗봇
