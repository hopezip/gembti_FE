import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import { Input } from '@/components/ui/Input';
import { GameSearchCard } from '@/features/game/components/GameSearchCard';
import {
  FilterSidebar,
  DEFAULT_FILTERS,
  type FilterState,
} from '@/features/game/components/FilterSidebar';
import { api } from '@/lib/ky';
import type { GamesSearchResponse, MockGame } from '@/mocks/handlers/games';

type SortBy = 'recommended' | 'rating' | 'price_asc' | 'price_desc';

const INITIAL_RECENT = ['엘든 링', 'RPG 합동', '인디 호러'];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(query);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [allGames, setAllGames] = useState<MockGame[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('recommended');
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT);

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

  // 검색어 변경 시 페이지 리셋
  // biome-ignore lint/correctness/useExhaustiveDependencies: query 변경에만 반응하는 reset 이펙트
  useEffect(() => {
    setPage(1);
    setAllGames([]);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ['games', 'search', query, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('page', String(page));
      return api
        .get('api/games/search', { searchParams: params })
        .json<GamesSearchResponse>();
    },
  });

  // 페이지 데이터 누적
  // biome-ignore lint/correctness/useExhaustiveDependencies: data 변경에만 반응하는 accumulate 이펙트
  useEffect(() => {
    if (!data) return;
    setAllGames((prev) => (page === 1 ? data.games : [...prev, ...data.games]));
    setTotal(data.total);
    setHasMore(data.hasMore);
  }, [data]);

  // 사이드바 필터 클라이언트 적용
  const filteredGames = useMemo(() => {
    return allGames.filter((g) => {
      if (
        filters.genres.length > 0 &&
        !filters.genres.some((genre) => g.genres.includes(genre))
      )
        return false;
      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => g.tags.includes(tag))
      )
        return false;
      if (g.price < filters.priceMin || g.price > filters.priceMax)
        return false;
      if (filters.onSale && !g.onSale) return false;
      if (filters.koreanSub && !g.koreanSub) return false;
      if (
        filters.playerModes.length > 0 &&
        !filters.playerModes.some((m) => g.playerModes.includes(m))
      )
        return false;
      if (
        filters.minRating > 0 &&
        (g.rating == null || g.rating < filters.minRating)
      )
        return false;
      return true;
    });
  }, [allGames, filters]);

  // 정렬
  const sortedGames = useMemo(() => {
    const arr = [...filteredGames];
    switch (sortBy) {
      case 'rating':
        return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'price_asc':
        return arr.sort(
          (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price),
        );
      case 'price_desc':
        return arr.sort(
          (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price),
        );
      default:
        return arr;
    }
  }, [filteredGames, sortBy]);

  // 활성 필터 칩 목록
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    for (const g of filters.genres) {
      chips.push({
        key: `genre-${g}`,
        label: g,
        onRemove: () =>
          setFilters((f) => ({
            ...f,
            genres: f.genres.filter((x) => x !== g),
          })),
      });
    }
    for (const t of filters.tags) {
      chips.push({
        key: `tag-${t}`,
        label: t,
        onRemove: () =>
          setFilters((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) })),
      });
    }
    if (filters.priceMin > 0 || filters.priceMax < 70000) {
      const lo =
        filters.priceMin > 0
          ? `₩${Math.round(filters.priceMin / 1000)}K`
          : '₩0';
      const hi = `₩${Math.round(filters.priceMax / 1000)}K`;
      chips.push({
        key: 'price',
        label: `${lo}~${hi}`,
        onRemove: () =>
          setFilters((f) => ({ ...f, priceMin: 0, priceMax: 70000 })),
      });
    }
    if (filters.onSale)
      chips.push({
        key: 'onSale',
        label: '세일 중',
        onRemove: () => setFilters((f) => ({ ...f, onSale: false })),
      });
    if (filters.koreanSub)
      chips.push({
        key: 'koreanSub',
        label: '한글 자막',
        onRemove: () => setFilters((f) => ({ ...f, koreanSub: false })),
      });
    for (const m of filters.playerModes) {
      chips.push({
        key: `mode-${m}`,
        label: m,
        onRemove: () =>
          setFilters((f) => ({
            ...f,
            playerModes: f.playerModes.filter((x) => x !== m),
          })),
      });
    }
    if (filters.minRating > 0)
      chips.push({
        key: 'rating',
        label: `★ ${filters.minRating}+`,
        onRemove: () => setFilters((f) => ({ ...f, minRating: 0 })),
      });

    return chips;
  }, [filters]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
    if (trimmed && !recentSearches.includes(trimmed)) {
      setRecentSearches((prev) => [trimmed, ...prev].slice(0, 5));
    }
  }

  function removeRecent(s: string) {
    setRecentSearches((prev) => prev.filter((x) => x !== s));
  }

  const remaining = total - sortedGames.length;

  return (
    <main>
      {/* 검색 바 영역 */}
      <div
        className={css({
          bg: 'bg.subtle',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          px: { base: '7', '2xl': '8' },
          py: '5',
        })}
      >
        <div className={css({ maxW: 'containerLg', mx: 'auto' })}>
          <form onSubmit={handleSearchSubmit}>
            <div className={css({ position: 'relative' })}>
              <Input
                size="lg"
                type="search"
                placeholder="게임, 장르, 태그 검색"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={css({ w: 'full', pr: '16' })}
              />
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  setSearchParams({});
                }}
                className={css({
                  position: 'absolute',
                  right: '3',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 'xs',
                  color: 'fg.subtle',
                  cursor: 'pointer',
                  bg: 'bg.surfaceRaised',
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 'md',
                  px: '2',
                  py: '0.5',
                  _hover: { color: 'fg.muted' },
                })}
              >
                ESC
              </button>
            </div>
          </form>

          {query && (
            <p className={css({ mt: '2', fontSize: 'sm', color: 'fg.muted' })}>
              {total.toLocaleString()}개 결과 &middot; 검색에 &ldquo;{query}
              &rdquo;
            </p>
          )}

          {recentSearches.length > 0 && (
            <div
              className={css({
                mt: '3',
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                flexWrap: 'wrap',
              })}
            >
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'fg.subtle',
                  whiteSpace: 'nowrap',
                })}
              >
                최근 검색
              </span>
              {recentSearches.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1.5',
                    bg: 'bg.surfaceRaised',
                    border: '1px solid',
                    borderColor: 'border.default',
                    borderRadius: 'full',
                    px: '3',
                    py: '1',
                    fontSize: 'xs',
                    color: 'fg.muted',
                    cursor: 'pointer',
                    _hover: { borderColor: 'border.emphasized' },
                  })}
                  onClick={() => setInputValue(s)}
                >
                  {s}
                  <button
                    type="button"
                    aria-label={`${s} 검색 기록 삭제`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecent(s);
                    }}
                    className={css({
                      color: 'fg.subtle',
                      lineHeight: '1',
                      bg: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      p: '0',
                      _hover: { color: 'fg.default' },
                    })}
                  >
                    ×
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 메인 레이아웃: 사이드바 + 결과 */}
      <div
        className={css({
          maxW: 'containerLg',
          mx: 'auto',
          px: { base: '7', '2xl': '8' },
          py: '6',
          display: 'flex',
          gap: '6',
          alignItems: 'flex-start',
        })}
      >
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />

        {/* 결과 영역 */}
        <div className={css({ flex: '1', minW: '0' })}>
          {/* 결과 헤더 */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '4',
            })}
          >
            <span
              className={css({
                fontWeight: 'semibold',
                color: 'fg.default',
                fontSize: 'md',
              })}
            >
              {total > 0 ? `${total.toLocaleString()}개 결과` : ''}
            </span>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className={css({
                  bg: 'bg.surface',
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 'md',
                  px: '3',
                  py: '1.5',
                  fontSize: 'sm',
                  color: 'fg.default',
                  cursor: 'pointer',
                  _focus: { outline: 'none', borderColor: 'accent.default' },
                })}
              >
                <option value="recommended">추천순</option>
                <option value="rating">평점순</option>
                <option value="price_asc">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
              </select>
              {/* 그리드 뷰 토글 */}
              <button
                type="button"
                aria-label="그리드 뷰"
                className={css({
                  p: '2',
                  bg: 'accent.soft',
                  borderRadius: 'md',
                  color: 'accent.fg',
                  cursor: 'pointer',
                  border: 'none',
                })}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="0" y="0" width="7" height="7" rx="1" />
                  <rect x="9" y="0" width="7" height="7" rx="1" />
                  <rect x="0" y="9" width="7" height="7" rx="1" />
                  <rect x="9" y="9" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="리스트 뷰"
                className={css({
                  p: '2',
                  bg: 'transparent',
                  borderRadius: 'md',
                  color: 'fg.subtle',
                  cursor: 'pointer',
                  border: 'none',
                  _hover: { bg: 'bg.surfaceRaised' },
                })}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="0" y="1" width="16" height="3" rx="1" />
                  <rect x="0" y="6.5" width="16" height="3" rx="1" />
                  <rect x="0" y="12" width="16" height="3" rx="1" />
                </svg>
              </button>
            </div>
          </div>

          {/* 활성 필터 칩 */}
          {activeChips.length > 0 && (
            <div
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2',
                mb: '4',
              })}
            >
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1',
                    bg: 'accent.soft',
                    border: '1px solid',
                    borderColor: 'accent.default',
                    borderRadius: 'full',
                    px: '3',
                    py: '1',
                    fontSize: 'xs',
                    color: 'accent.fg',
                    cursor: 'pointer',
                    fontWeight: 'medium',
                    _hover: { opacity: '0.8' },
                  })}
                >
                  {chip.label} ×
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className={css({
                  fontSize: 'xs',
                  color: 'fg.subtle',
                  cursor: 'pointer',
                  bg: 'transparent',
                  border: 'none',
                  px: '2',
                  py: '1',
                  _hover: { color: 'fg.muted' },
                })}
              >
                모두 지우기
              </button>
            </div>
          )}

          {/* 게임 그리드 */}
          {isFetching && allGames.length === 0 ? (
            // 로딩 스켈레톤
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4',
              })}
            >
              {Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map(
                (key) => (
                  <div
                    key={key}
                    className={css({
                      bg: 'bg.surface',
                      borderRadius: 'xl',
                      border: '1px solid',
                      borderColor: 'border.default',
                      aspectRatio: '3/2',
                      opacity: '0.4',
                    })}
                  />
                ),
              )}
            </div>
          ) : sortedGames.length === 0 ? (
            <div
              className={css({
                textAlign: 'center',
                py: '20',
                color: 'fg.muted',
                fontSize: 'sm',
              })}
            >
              {query
                ? `"${query}"에 해당하는 게임이 없어요`
                : '검색어를 입력해보세요'}
            </div>
          ) : (
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4',
              })}
            >
              {sortedGames.map((game) => (
                <GameSearchCard key={game.id} game={game} />
              ))}
            </div>
          )}

          {/* 더 보기 버튼 */}
          {hasMore && remaining > 0 && (
            <div
              className={css({
                display: 'flex',
                justifyContent: 'center',
                mt: '8',
              })}
            >
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className={css({
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
                  _hover: {
                    bg: 'bg.surfaceRaised',
                    borderColor: 'accent.default',
                  },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                더 보기 &middot; {remaining.toLocaleString()}개 남음 ↓
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
