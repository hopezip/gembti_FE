import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import { Input } from '@/components/ui/Input';
import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { SearchFilterBox } from '@/features/game/components/SearchFilterBox';
import {
  CATEGORY_OPTIONS,
  GENRE_OPTIONS,
} from '@/features/game/api/filterOptions';
import {
  type SearchGameSummary,
  useSearchGames,
} from '@/features/game/api/searchGames';

// SEARCH-FE-001/003/004/005 검색 결과 페이지 — Figma 검색 결과 페이지 기준.
// 구조(위→아래): 검색창 → 결과 텍스트 → "필터" 헤딩 → 필터박스(장르·카테고리 칩) → 4×N 그리드 → 더 보기.
// 데이터: 서버 페이지네이션(더 보기 12개씩 누적) + 칩은 서버사이드 필터(genre[]/category[]로 재요청).
// 칩 개수(facet)는 백엔드 미제공이라 표시하지 않는다. 정렬 UI는 현 디자인에 없어 popular 고정.

const styles = {
  page: css({
    py: '8',
    display: 'flex',
    flexDirection: 'column',
  }),
  searchWrap: css({
    position: 'relative',
  }),
  searchIcon: css({
    position: 'absolute',
    left: '4',
    top: '50%',
    transform: 'translateY(-50%)',
    // Input recipe의 불투명 bg(bg.surface)가 DOM상 뒤에 그려져 아이콘을 덮으므로 위로 올린다.
    zIndex: '1',
    fontSize: 'lg',
    color: 'fg.subtle',
    pointerEvents: 'none',
  }),
  searchInput: css({
    pl: '12',
  }),
  resultText: css({
    mt: '3',
    fontSize: 'sm',
    color: 'fg.muted',
  }),
  filterHeading: css({
    mt: '8',
    mb: '3',
    fontSize: 'xl',
    fontWeight: 'bold',
    color: 'fg.default',
  }),
  grid: css({
    mt: '8',
    display: 'grid',
    // minmax(0, 1fr): 1fr의 기본 최소값(min-content)이 nowrap 긴 제목에 밀려 트랙을 넓히는 것을 막아
    // 모든 칸을 정확히 균등하게 만든다(긴 제목은 의도대로 ellipsis 처리).
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    columnGap: '6', // Figma 카드 가로 간격 24px
    rowGap: '6',
    // 데스크탑 전용 — 1100px 미만 1열 fallback(찌부러짐 방지).
    '@media (max-width: 1100px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  }),
  skeletonCard: css({
    bg: 'bg.surfaceRaised',
    borderRadius: 'xl',
    aspectRatio: '16/10',
    opacity: '0.5',
  }),
  cardLink: css({
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: 'xl',
    transition: 'transform 0.15s ease',
    _hover: { transform: 'translateY(-2px)' },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'accent.default',
      outlineOffset: '2px',
    },
  }),
  fallback: css({
    mt: '8',
    color: 'fg.muted',
    fontSize: 'sm',
    py: '8',
    textAlign: 'center',
  }),
  moreRow: css({
    display: 'flex',
    justifyContent: 'center',
    mt: '8',
  }),
  moreButton: css({
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.emphasized',
    borderRadius: 'full',
    px: '6',
    py: '2.5',
    fontSize: 'sm',
    color: 'fg.default',
    cursor: 'pointer',
    fontWeight: 'medium',
    _hover: { bg: 'bg.surfaceRaised', borderColor: 'accent.default' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
  }),
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(query);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<SearchGameSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // URL 변경 시 입력창 동기화
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // 검색어 디바운스 → URL 반영
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputValue.trim();
      if (trimmed !== query) {
        setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, query, setSearchParams]);

  // 검색어 변경 시 선택 필터 리셋(새 검색어엔 이전 필터를 끌고 가지 않는다)
  // biome-ignore lint/correctness/useExhaustiveDependencies: query 변경에만 반응하는 reset 이펙트
  useEffect(() => {
    setSelectedGenres([]);
    setSelectedCategories([]);
  }, [query]);

  // 검색어/필터 변경 시 페이지·누적 리셋 → 서버사이드로 1페이지부터 재요청
  // biome-ignore lint/correctness/useExhaustiveDependencies: 검색 조건 변경에만 반응하는 reset 이펙트
  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [query, selectedGenres, selectedCategories]);

  const { data, isFetching, isError } = useSearchGames({
    q: query,
    page,
    genres: selectedGenres,
    categories: selectedCategories,
  });

  // 페이지 데이터 누적 (page===1이면 교체, 그 외 추가)
  // biome-ignore lint/correctness/useExhaustiveDependencies: data 변경에만 반응하는 accumulate 이펙트
  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) =>
      page === 1 ? data.games : [...prev, ...data.games],
    );
    setTotalCount(data.totalCount);
    setHasMore(data.hasMore);
  }, [data]);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((x) => x !== genre) : [...prev, genre],
    );
  }

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((x) => x !== category)
        : [...prev, category],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  }

  const isInitialLoading = isFetching && accumulated.length === 0;
  const isInitialError = isError && accumulated.length === 0;

  return (
    <main>
      <PageContainer className={styles.page}>
        {/* 검색창 */}
        <form onSubmit={handleSubmit}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              🔍
            </span>
            <Input
              size="lg"
              type="search"
              placeholder="게임, 장르, 태그 검색"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </form>

        {/* 결과 텍스트 */}
        {query && (
          <p className={styles.resultText}>
            {totalCount.toLocaleString()}개 결과 &middot; 검색어 &ldquo;{query}
            &rdquo;
          </p>
        )}

        {/* 필터 */}
        <h2 className={styles.filterHeading}>필터</h2>
        <SearchFilterBox
          genres={GENRE_OPTIONS}
          categories={CATEGORY_OPTIONS}
          selectedGenres={selectedGenres}
          selectedCategories={selectedCategories}
          onToggleGenre={toggleGenre}
          onToggleCategory={toggleCategory}
        />

        {/* 결과 그리드 / 로딩 / 빈 상태 */}
        {isInitialLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map(
              (key) => (
                <div key={key} className={styles.skeletonCard} />
              ),
            )}
          </div>
        ) : isInitialError ? (
          <p className={styles.fallback}>검색 중 문제가 발생했어요</p>
        ) : accumulated.length === 0 ? (
          <EmptyState type="search" target={query || undefined} />
        ) : (
          <div className={styles.grid}>
            {accumulated.map((game) => (
              <Link
                key={game.gameId}
                to={`/games/${game.gameId}`}
                className={styles.cardLink}
              >
                <GameSummaryCard
                  title={game.title}
                  genres={game.genres}
                  rating={game.rating}
                  thumbnailUrl={game.thumbnailUrl || undefined}
                />
              </Link>
            ))}
          </div>
        )}

        {/* 더 보기 (서버 페이지네이션) */}
        {hasMore && accumulated.length > 0 && (
          <div className={styles.moreRow}>
            <button
              type="button"
              className={styles.moreButton}
              disabled={isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              더 보기 ↓
            </button>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
