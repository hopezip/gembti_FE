# features/game/components

game 도메인 컴포넌트 자리 (GameCard, WarningCard, GameDetailSection 등). 다른 도메인을 import하지 않는다(격리).

## 등재 컴포넌트
- `GameSearchCard` — 검색 결과 카드(`GameCard` 프리미티브 기반, 타이틀+장르+★). SearchPage 사용.
- `GameSummaryCard` — 공통 게임 카드(테두리 없는 둥근 커버 + 장르·★평점, 타이틀 없음). Figma 비회원 카드 기준. 메인 추천/인기 그리드 사용. props: `genres`/`rating?`/`thumbnailUrl?`.
- `FilterSidebar` — 검색 필터 사이드바.
