# ANSWERS.md — Bootstrap Interview Results

> 이 문서는 BOOTSTRAP 인터뷰 결과를 정리한 단일 진실 문서입니다.
> 이후 모든 파일 생성은 이 파일을 기준으로 진행됩니다.
> 수정 시 03~06 모듈을 다시 실행해야 합니다.

생성일: 2026-05-29
시스템 버전: bootstrap v2.4.4 (단독·소팀 친화적)

---

## Group 1: 프로젝트 기본 정보

### 필수
- **프로젝트명**: GamBTI (패키지/폴더명은 소문자 `gambti`, 디자인 시스템 표기는 `GAMBITI`)
- **한 줄 설명**: 게임 유저들을 위한 AI 게임 추천 서비스
- **프로젝트 성격**: 사이드 프로젝트

### 선택 / 기본값 가능
- **카테고리**: AI/LLM (한 줄 설명에서 추론)
- **타겟 유저**: 게임을 즐기는 일반 유저 [기본값 추론]
- **프로젝트 기간**: 미정 [기본값]

---

## Group 2: 작업 모드 + 협업 방식

### 필수
- **작업 모드**: 풀팀 협업
  - 영향: PR 의무, 본인 머지 금지(최소 1명 승인 후 머지), 승인 게이트 4개
- **협업 규모**: 4명 이상 (프론트 3 + 백엔드 4 = 총 7명)
- **사용자 역할**: 프론트 리드
- **백엔드 연동 방식**: Swagger/OpenAPI URL 예정 (현재 제작 중)
- **Swagger URL 또는 파일 경로 (있을 시)**: 미정 (제작 완료 후 연동, 초기엔 MSW mock)

### 선택 / 기본값 가능
- **프론트엔드 인원 수**: 3명
- **백엔드 인원 수**: 4명
- **백엔드 레포 URL**: 미정 [기본값]
- **협업 도구**: 노션 + 디스코드 [기본값]

---

## Group 2-1: 작업속도 + 질문 정책

- **속도 우선 범위**: micro + normal까지 빠르게
- **질문 기준**: 작업 결과가 달라질 때만
- **질문 방식**: 1~3개 질문
- **추천값 처리**: 위험 작업은 중단·일반 작업은 추천값으로 진행

> ⚠️ 절충 규칙: 작업 모드가 **풀팀**이라 모든 변경이 티켓+PR 흐름을 타지만(micro 자동 흐름은 비활성), 구현 *중*에는 Group 2-1 정책에 따라 불필요한 확인을 최소화하고 cross/위험 변경만 질문한다.

---

## Group 3: 기술 스택

- **앱 템플릿**: Vite + React SPA (React 19)
- **패키지 매니저**: pnpm
- **언어**: TypeScript strict
- **데이터 패칭**: TanStack Query
- **클라이언트 상태관리**: Zustand
- **UI 라이브러리**: Panda CSS + Park UI (다크 모드 전용, 데스크탑 우선)
- **라우팅**: React Router
- **폼 처리**: React Hook Form + Zod
- **Lint/Format**: Biome
- **인증 방식**: 백엔드 JWT + httpOnly Cookie (자동 로그인 옵션 포함)
- **HTTP 클라이언트**: ky
- **테스트**: Vitest + RTL (단위/컴포넌트) + Playwright (E2E)
- **Mock 환경**: MSW

---

## Group 4: 핵심 기능 (P0)

> ⚠️ **핵심 기능의 SSOT는 `docs/requirements/FE_REQUIREMENTS_FOR_CLAUDE_CODE.md`** 이다.
> 고유 기능 88개 = MVP 36개(P0) + 추가기능 50개(P1/P2). 아래는 MVP(P0) 도메인 요약.
> 기능 ID(`LOGIN-FE-001` 등)를 티켓 추적자로 그대로 사용한다.

**P0 = MVP (REQ 기준, 우선순위 높음)**

1. **인증/회원가입** (`LOGIN-FE-001~005`): 이메일 로그인/회원가입, 이메일 6자리 인증, 닉네임 중복확인, 비밀번호 정책(10자+영문/숫자), 만 15세 미만 제한, 자동 로그인, Steam 소셜 로그인
2. **Steam 연동** (`STEAM-INTER-FE-001~004`): 연동/건너뛰기, 성공·실패 피드백, 비공개 안내+재시도, 라이브러리 요약 표시
3. **설문 조사** (`SURVEY-FE-001~002`): 인트로(문항수/소요시간 안내), 1~5점 척도, 자동 다음 이동, 이전/건너뛰기, 실시간 저장
4. **성향 결과** (`TEND-FE-001~003`): 6대 성향 점수 + 레이더 차트 + 대표 성향 타이틀/설명/태그, 결과 기반 추천 4개, 결과 후 이동
5. **메인 페이지** (`MAIN-FE-001~004`): 추천 배너(로그인/비로그인 분기), 성향 태그 필터, 추천 게임 목록(매칭률), 신규 게임 목록
6. **검색/탐색** (`SEARCH-FE-001~004`): 검색창, 최근 검색, 필터(장르/태그/가격/세일/자막/모드/평점), 검색 실패 대체 추천
7. **게임 추천 페이지** (`REC-FE-001~009` 中 MVP): 이번주 인기, 평균 4점↑ 추천, 태그/장르, 세일 인기, 취향 재분석
8. **게임 상세** (`REC-DET-FE-001~005`): 게임 정보/사양, Steam 리뷰·평점, 위시리스트, 구매/라이브러리 추가, 비슷한 게임
9. **에러/예외처리** (`ERROR-FE-001~003`): Steam 비공개/실패 안내, 로그인 실패 안내

**P1/P2 = 추가기능 (scaffold만, 세부 구현 TODO)**
네비게이션·프로필 팝업, 마이페이지, 유저페이지, 팔로우, 커뮤니티, 게시글 작성, 댓글, 파티 모집, 고객센터 챗봇.

---

## Group 5: 배포 및 환경

- **환경 구분**: 로컬 + 프로덕션 [추천]
- **배포 플랫폼**: Vercel
- **백엔드 API URL (개발)**: 미정 (MSW mock으로 시작)
- **백엔드 API URL (프로덕션)**: 미정

---

## Group 6: 문서 시스템 옵션

- **문서 작성 언어**: 한국어
- **티켓 ID 포맷**: REQ 기능 ID 그대로 추적(`LOGIN-FE-001` 등) + 신규 작업은 `FEAT-NNN` / `BUG-NNN` / `TASK-NNN`
- **마일스톤 사용**: 사용
- **마일스톤 개수 (사용 시)**: MVP 4개 + backlog (기간 미정 → 주차 대신 REQ 도메인 묶음)
  - `MS-01` 인증/가입 + 에러처리 (LOGIN, ERROR)
  - `MS-02` Steam 연동 (STEAM-INTER)
  - `MS-03` 설문 + 성향 결과 (SURVEY, TEND)
  - `MS-04` 메인/검색/추천/상세 (MAIN, SEARCH, REC, REC-DET)
  - `MS-05+` 추가기능 50개 backlog (scaffold만)
- **scratch 폴더**: 활성
- **로그 시스템 자동화**: 자동 (Hook 기반) — ⚠️ **WSL 환경에서만 작동**. Windows PowerShell 실행 시 `/log` 수동 사용 필요.

---

## 디자인 시스템 통합 (GamBTI 특수)

> 와이어프레임 18개 페이지에서 추출된 디자인 산출물이 이미 존재한다.

- **디자인 토큰 출처**: `docs/design/panda.config.ts` → 프로젝트 루트 `panda.config.ts`로 그대로 적용 후 `pnpm panda codegen`
- **디자인 사양서**: `docs/design/DESIGN_SYSTEM.md` (컴포넌트 anatomy/variant/size 강제 기준)
- **모드**: 다크 모드 전용, **데스크탑 전용**(1100px 미만 1열 fallback만, 반응형 모바일은 MVP 밖)
- **컴포넌트 우선순위**: `ui/`(Park UI 래핑) Button → Input/Textarea/Select → Field → Tag/Chip → Card → Dialog → Toast → Menu → Tabs → Avatar / 이후 `patterns/`(GameCard → ReviewCard → TypeTag → CommentThread → PartyCard → MatchScore)
- **폰트**: Noto Sans KR(본문) / JetBrains Mono(메타·캡션) / Archivo Black(로고 전용)
- **아이콘**: Park UI 기본 Lucide

---

## 파생 결정 사항 (Claude가 자동 도출)

- **백엔드 계약 티켓**: Swagger/OpenAPI가 제작 중이므로 `MS-01`에 `TASK-API-001 OpenAPI/Swagger 계약 합의 및 연동` 티켓을 생성한다. 완성 전까지는 `REQ` 6장 데이터 모델 + 7장 API 훅 후보를 기준으로 MSW mock을 구성한다.
- **런타임 스캐폴딩**: Vite + React SPA → `src/vite-env.d.ts` 포함 최소 부팅 파일을 03에서 생성. `pnpm build` / `pnpm type-check` 가능 상태가 목표(`dev`는 장기 실행이라 자동 검증에서 분리).
- **패키지 매니저**: pnpm (단일 기준)
- **Git 사용**: yes (현재 git 레포 아님 → 03/06에서 `git init` 제안)
- **테스트 디렉토리**: `src/__tests__/` (Vitest + RTL), `e2e/` (Playwright)
- **컴포넌트 디렉토리**: `src/components/ui/` (Park UI 래핑 Primitive), `src/components/patterns/` (도메인 컴포넌트)
- **MSW 핸들러 디렉토리**: `src/mocks/handlers/`
- **서비스 레이어**: `src/services/` (authApi, steamApi, surveyApi, gameApi, userApi, communityApi, chatbotApi) — 컴포넌트가 직접 fetch 금지

### 풀팀 협업 모드 자동 결정
- PR: 의무, 본인 머지 금지 (최소 1명 승인 후 머지)
- 승인 게이트: 영향 파일·커밋·푸시·PR (4개)
- micro 자동 흐름: 비활성화 (모든 변경이 티켓+PR 풀 흐름) — 단 구현 중 질문은 Group 2-1 정책 적용

### v2.1 Fast Path + 질문 정책 자동 결정
| 답변 | 반영 |
|---|---|
| 속도 우선 범위: micro+normal | normal까지 구현 중 승인 대기 최소화, cross/위험만 질문 |
| 질문 기준: 결과가 달라질 때만 | 단순 관례는 기본값 진행, 기능 결과가 달라질 때만 질문 |
| 질문 방식: 1~3개 | 한 번에 최대 3개, 추천값 동반 |
| 추천값 처리: 위험은 중단·일반은 추천값 | 일반 작업 추천값 진행, 위험 작업은 답변 전 중단 |

---

## 확인 요청

위 내용 확인 후 다음 중 하나로 답변해주세요:

- **"OK"** 또는 **"진행"** → 다음 단계 (파일 생성)로 넘어갑니다
- **"X번 항목을 Y로 바꿔줘"** → 해당 항목만 수정합니다
- **"전체 다시 인터뷰"** → 01-interview로 돌아갑니다
