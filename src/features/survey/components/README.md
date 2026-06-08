# features/survey/components

survey 도메인 컴포넌트 자리. 설문 인트로(`/survey/intro`), 설문 진행(`/survey`), 설문 결과 분석(`/survey/loading`), 설문 분석 결과(`/survey/result`) 화면에서 쓰는 UI만 둔다.

## 규칙

- 색은 semantic token만 사용한다. 배경 이미지처럼 에셋 경로가 필요한 경우만 문자열 URL을 허용한다.
- 페이지 라우트(`src/routes/*`)는 화면 진입점과 레이아웃 연결만 담당한다. 설문 진행 상태와 UI 조합은 feature 내부 컴포넌트/훅이 담당한다.
- `Button`, `ProgressBar`, `Spinner`처럼 공용화된 UI는 `src/components/ui`에서 가져다 쓴다. 설문 전용 모양만 feature 안에서 조정한다.
- 설문 결과 추천 영역처럼 이미 공통화된 게임 UI가 필요한 경우에는 `features/game/components/GameSummaryCard`처럼 목적이 명확한 공통 도메인 컴포넌트를 재사용한다.
- 진행률 계산, 이전/건너뛰기/선택 상태는 `useSurveyQuestionSection`에서 관리한다. 컴포넌트는 표시와 이벤트 연결만 한다.
- 현재 문항 데이터는 임시 mock이다. API/MSW 연결 시 `SurveyQuestionSection.tsx`의 `surveyQuestions`를 MSW survey handler mock response로 이동하고, 화면은 서비스/API 응답을 사용한다.

## 등재 컴포넌트

- `SurveyQuestionSection` — 설문 진행 화면의 feature 루트. 상단 단계 표시, 질문 문장, 1~5 선택지, 하단 컨트롤을 조립한다. 문항 데이터는 현재 임시 mock이며, 선택/건너뛰기/이전 이동은 `useSurveyQuestionSection`에 위임한다.
- `SurveyStepIndicator` — 상단 dot + `01 / 07` 표시. 주황 dot은 실제 응답을 선택한 문항만 표시하고, 건너뛴 문항은 회색으로 남긴다.
- `SurveyAnswerScale` — 1~5 리커트 선택지. 육각형 버튼 5개를 고정 순서로 렌더하고, 선택된 값만 주황색 프레임/글로우로 강조한다. 모바일/태블릿 간격은 `clamp` 기준으로 조절한다.
- `SurveyQuestionControls` — 하단 이전/건너뛰기 버튼과 데스크탑용 진행률 막대. 모바일에서는 프로그래스바를 숨기고 버튼은 좌우 2열로 유지한다.
- `SurveyAnalysisLoading` — 설문 완료 후 결과 페이지로 이동하기 전 성향 분석 진행률과 현재 분석 단계를 표시한다. 공용 `Spinner`/`ProgressBar`를 조합하고 색상은 semantic token만 사용한다.
- `ResultSummary` — 설문 분석 결과 화면 상단. `TraitRadarChart`와 대표 플레이어 유형, 설명, 태그, 후속 액션 버튼을 조립한다.
- `TraitRadarChart` — 설문 분석 결과 전용 6대 성향 SVG 레이더 차트. 마이페이지 레이더 컴포넌트를 수정하지 않고 별도 구현한다.
- `GameRecommendations` — 설문 분석 결과 하단 추천 게임 영역. 공통 `GameSummaryCard`를 재사용하고 결과 전용 추천 이유 문구만 추가한다. 각 카드는 `/games/:id` 상세 페이지로 이동한다.
- `surveyIntro.styles` — 설문 인트로 스타일과 진행 화면이 공유하는 배경 스타일. 현재 인트로 styles 파일에 공유 배경이 함께 있으므로, 추후 survey 공통 layout/style 파일로 분리한다.

## 연결 지점

- `src/routes/SurveyIntroPage.tsx` — 설문 소개 화면. `surveyIntro.styles`를 사용하고, "설문 시작하기" 클릭 시 `/survey`로 이동한다.
- `src/routes/SurveyPage.tsx` — 설문 진행 라우트 페이지. 공통 배경과 `PageContainer`를 연결하고, 실제 설문 UI는 `SurveyQuestionSection`에 위임한다.
- `src/routes/SurveyAnalysisLoadingPage.tsx` — 설문 결과 분석 로딩 라우트 페이지. 진행률/단계 전환과 결과 페이지 자동 이동만 담당한다.
- `src/routes/SurveyResultPage.tsx` — 설문 분석 결과 라우트 페이지. 현재는 MSW/API 연결 전 임시 결과 데이터와 feature 컴포넌트 조립만 담당한다.
- `src/features/survey/hooks/useSurveyQuestionSection.ts` — 설문 진행 상태 훅. `answers`, `currentIndex`, `progressPercent`, `selectAnswer`, `skipQuestion`, `goToQuestion`을 제공한다.

## 후속 정리

- SURVEY-FE-002 API/MSW 연결 시 문항 mock 데이터를 handler/service 계층으로 이동한다.
- SURVEY-FE-004 또는 TEND-FE-001 API/MSW 연결 시 `SurveyResultPage`의 임시 점수/태그/추천 mock을 handler/service 계층으로 이동한다.
- 인트로/진행 화면이 공유하는 배경 스타일은 `surveyIntro.styles.ts`에서 별도 공통 파일로 분리한다.
- SURVEY-FE-003 API 연동 시 `SurveyAnalysisLoadingPage`의 임시 진행률 타이머를 실제 분석 요청 상태로 교체한다.
