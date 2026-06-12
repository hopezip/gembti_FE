import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { GameCard } from '@/components/ui/GameCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { getLibrary } from '@/features/mypage/api/mypage';
import type { MockLibraryItem } from '@/mocks/handlers/mypage';

type LibrarySort = 'recent' | 'oldest';

const SORT_OPTIONS: { key: LibrarySort; label: string }[] = [
  { key: 'recent', label: '최근 플레이순' },
  { key: 'oldest', label: '오래된 순' },
];

function LibraryGameCard({ item }: { item: MockLibraryItem }) {
  return (
    <GameCard padding="none" interactive>
      <div
        className={css({
          aspectRatio: '16/10',
          bg: 'bg.surfaceRaised',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 'xl',
          borderTopRightRadius: 'xl',
          color: 'fg.subtle',
          fontSize: 'xs',
        })}
      >
        카버쥬얼
      </div>
      <div className={css({ px: '3', pt: '2.5', pb: '3' })}>
        <span
          className={css({
            fontSize: 'xs',
            color: 'fg.subtle',
            display: 'block',
            mb: '1',
          })}
        >
          {item.genres.join(' · ')}
        </span>
        <p
          className={css({
            fontWeight: 'semibold',
            color: 'fg.default',
            fontSize: 'sm',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            mb: '1',
          })}
        >
          {item.title}
        </p>
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '0.5',
          })}
        >
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            ▶ {item.playHours.toFixed(1)}시간
          </span>
          {item.myRating !== null && (
            <span
              className={css({
                fontSize: 'xs',
                color: 'warning.fg',
                fontWeight: 'semibold',
              })}
            >
              ★ {item.myRating.toFixed(1)}
            </span>
          )}
        </div>
        {item.lastPlayedAt && (
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            {item.lastPlayedAt}
          </span>
        )}
      </div>
    </GameCard>
  );
}

export function LibrarySection() {
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<MockLibraryItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['mypage', 'library', genre, sort, search, page],
    queryFn: () => getLibrary({ genre, sort, search, page }),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!data) return;
    if (page === 1) {
      setAllItems(data.items);
      return;
    }
    setAllItems((prev) => {
      const ids = new Set(prev.map((i) => i.id));
      const next = data.items.filter((i) => !ids.has(i.id));
      return next.length === 0 ? prev : [...prev, ...next];
    });
  }, [data, page]);

  function handleGenreChange(g: string) {
    setGenre(g);
    setPage(1);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value as LibrarySort);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  const genres = data?.allGenres ?? [];

  return (
    <section>
      {/* 헤더 */}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '4',
        })}
      >
        <div
          className={css({ display: 'flex', alignItems: 'baseline', gap: '2' })}
        >
          <h2
            className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: 'fg.default',
            })}
          >
            내 라이브러리
          </h2>
          {data && (
            <span className={css({ fontSize: 'sm', color: 'fg.subtle' })}>
              {data.total}개 · 자동 동기화
            </span>
          )}
        </div>
        <div
          className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
        >
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            모두 · Steam · 직접
          </span>
          <Button variant="secondary" size="sm">
            동기화
          </Button>
        </div>
      </div>

      {/* 필터 행 */}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '4',
          gap: '3',
          flexWrap: 'wrap',
        })}
      >
        {/* 장르 Chip + 정렬 */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            flexWrap: 'wrap',
          })}
        >
          <Chip
            data-state={genre === '' ? 'on' : undefined}
            onClick={() => handleGenreChange('')}
          >
            전체
          </Chip>
          {genres.map((g) => (
            <Chip
              key={g}
              data-state={genre === g ? 'on' : undefined}
              onClick={() => handleGenreChange(g)}
            >
              {g}
            </Chip>
          ))}
          <select
            value={sort}
            onChange={handleSortChange}
            className={css({
              px: '2',
              py: '1',
              fontSize: 'xs',
              color: 'fg.subtle',
              bg: 'bg.surfaceRaised',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 'md',
              cursor: 'pointer',
              outline: 'none',
            })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className={css({ w: '52' })}>
          <SearchInput
            size="sm"
            aria-label="내 라이브러리 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="내 라이브러리에서 검색..."
          />
        </form>
      </div>

      {/* 콘텐츠 */}
      {isLoading && allItems.length === 0 ? (
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4',
          })}
        >
          {(['sk1', 'sk2', 'sk3', 'sk4'] as const).map((key) => (
            <div
              key={key}
              className={css({
                aspectRatio: '3/4',
                bg: 'bg.surfaceRaised',
                borderRadius: 'xl',
              })}
            />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <EmptyState
          type={search ? 'search' : 'party'}
          target={search || undefined}
          title={search ? undefined : '라이브러리가 비어 있어요'}
          description={
            search
              ? undefined
              : 'Steam을 연동하면 게임 라이브러리가 자동으로 동기화돼요.'
          }
        />
      ) : (
        <>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4',
              mb: '4',
            })}
          >
            {allItems.map((item) => (
              <LibraryGameCard key={item.id} item={item} />
            ))}
          </div>
          {data?.hasMore && (
            <div className={css({ textAlign: 'center' })}>
              <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
                더 보기 · {data.total - allItems.length}개 남음 ↓
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
