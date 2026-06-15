# features/game/components

game 도메인 컴포넌트 자리 (GameCard, WarningCard, GameDetailSection 등). 다른 도메인을 import하지 않는다(격리).

## 등재 컴포넌트
- `GameSummaryCard` — 공통 게임 카드(테두리 없는 둥근 커버 + (옵션)NEW 뱃지 + (옵션)타이틀 + 장르·★평점). Figma 비회원 카드 기준. 메인 추천/인기/신규 그리드 + 검색 결과 그리드 공유. props: `genres`/`rating?`/`thumbnailUrl?`/`title?`/`isNew?`. `title` 있으면 타이틀 표시 + 간격 조정, 없으면 이미지→장르행 48px 리듬. `isNew`면 좌상단 NEW 뱃지.
- `PersonalizedGameCard` — 개인화 추천 카드(MAIN-FE-006). 둥근 커버 + 선택적 우상단 배지 + 타이틀 Bold + 하단 추천이유 태그라인(앞에 작은 주황 세로 마커). 프로그래스바 없음. props: `title`/`thumbnailUrl?`/`genres?`/`imageBadge?`/`reasonTagline?`/`footer?`. GameSummaryCard와는 분리된 별도 컴포넌트.
- `SearchFilterBox` — 검색 필터박스(SEARCH-FE-003). "필터" 헤딩 + 장르 행 / 태그 행. 각 행은 `Chip` 다중선택 토글 + 우측 "+ 더보기"(접힘/펼침). 라벨만 표시(개수 facet 미표시). 선택/필터 로직은 소비자(SearchPage)가 소유. props: `genres`/`tags`/`selectedGenres`/`selectedTags`/`onToggleGenre`/`onToggleTag`.
- `GameDetailHero` — 게임 상세 Hero(REC-DET-FE-001, Figma 4014:3959). 풀블리드 커버 배경 + 좌→우 그라데이션 오버레이 위 좌측 정렬 콘텐츠(PageContainer 1232px). 카테고리 칩 → 제목 → 별점 → 메타 3컬럼(개발/퍼블리셔·발행일·플레이모드) → 가격블록 → 구매 버튼. 배경 fallback themeImageUrl→bannerUrl→thumbnailUrl→bg.surfaceRaised. props: `detail`(GameDetail).
- `GameInfoTable` — 게임 정보 테이블(Figma 4014:3937). dl/dt/dd 구조(라벨 fg.subtle 고정폭 88px·값 fg.default), bg.surface 반투명 + border + radius xl. 항목: 장르/플레이 모드/연령 등급/한글 지원/최소·권장 사양. props: `detail`(GameDetail).
- `GameIntroSection` — 게임 소개 섹션(Figma 4014:3878). heading.h3 "게임 소개" + 본문. `fullDescription`이 요약보다 의미 있게 길면 "전체 소개 보기" 텍스트 버튼으로 인라인 펼침(useState), 없으면 요약만. props: `description`/`fullDescription?`.
- `GameMediaGallery` — 스크린샷/트레일러 섹션(Figma 4014:3938). heading.h3 + 16:9 박스 가로 나열. 트레일러 있으면 첫 칸에 정적 ▶ 오버레이(재생 동작 없음). 스크린샷·트레일러 모두 없으면 섹션 숨김(null). props: `screenshotUrls`/`trailerUrl?`.
