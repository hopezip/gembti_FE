# features/game/components

game 도메인 컴포넌트 자리 (GameCard, WarningCard, GameDetailSection 등). 다른 도메인을 import하지 않는다(격리).

## 등재 컴포넌트
- `GameSearchCard` — 검색 결과 카드(`GameCard` 프리미티브 기반, 타이틀+장르+★). SearchPage 사용.
- `GameSummaryCard` — 공통 게임 카드(테두리 없는 둥근 커버 + (옵션)NEW 뱃지 + (옵션)타이틀 + 장르·★평점). Figma 비회원 카드 기준. 메인 추천/인기/신규 그리드 공유. props: `genres`/`rating?`/`thumbnailUrl?`/`title?`/`isNew?`. `title` 있으면 타이틀 표시 + 간격 조정, 없으면 이미지→장르행 48px 리듬. `isNew`면 좌상단 NEW 뱃지.
- `PersonalizedGameCard` — 개인화 추천 카드(MAIN-FE-006). 둥근 커버 + 우상단 % 배지(주황 외곽선 pill) + 타이틀 Bold + 주황 매칭률 프로그레스바 + 하단 추천이유 태그라인(앞에 작은 주황 세로 마커). 장르·평점 행 없음. Figma 로그인 추천 카드(4003:41) 기준. props: `title`/`thumbnailUrl?`/`matchRate`/`reasonTagline`. GameSummaryCard와는 분리된 별도 컴포넌트(게스트 회귀 위험 0).
- `FilterSidebar` — 검색 필터 사이드바.
