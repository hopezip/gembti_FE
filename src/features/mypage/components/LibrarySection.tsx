import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import { Button } from '@/components/ui/Button';
import { GameCard } from '@/components/ui/GameCard';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import type { MockLibraryItem } from '@/mocks/handlers/mypage';

type LibraryTab = 'all' | 'playing' | 'rated';
type LibrarySort = 'recent' | 'playtime' | 'rating';

const TABS: { key: LibraryTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'playing', label: '플레이중' },
  { key: 'rated', label: '내 별점' },
];

const SORT_OPTIONS: { key: LibrarySort; label: string }[] = [
  { key: 'recent', label: '최근 플레이순' },
  { key: 'playtime', label: '플레이 시간순' },
  { key: 'rating', label: '별점순' },
];

interface LibraryResponse {
  total: number;
  items: MockLibraryItem[];
  hasMore: boolean;
}

function LibraryGameCard({ item }: { item: MockLibraryItem }) {
  const statusLabel: Record<MockLibraryItem['status'], string> = {
    playing: '플레이 중',
    cleared: '클리어',
    unplayed: '미플레이',
    dropped: '중단',
  };

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
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '1',
          })}
        >
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            {item.genres.join(' · ')}
          </span>
          <Tag tone="guide">Steam</Tag>
        </div>
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
            alignItems: 'center',
            justifyContent: 'space-between',
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
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          })}
        >
          <span
            className={css({
              fontSize: 'xs',
              color: item.status === 'playing' ? 'accent.fg' : 'fg.subtle',
            })}
          >
            {statusLabel[item.status]}
          </span>
          {item.lastPlayedAt && (
            <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
              {item.lastPlayedAt}
            </span>
          )}
        </div>
      </div>
    </GameCard>
  );
}

export function LibrarySection() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<MockLibraryItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['mypage', 'library', activeTab, sort, search, page],
    queryFn: () =>
      ky
        .get('/api/mypage/library', {
          searchParams: { tab: activeTab, sort, search, page },
        })
        .json<LibraryResponse>(),
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

  function handleTabChange(tab: LibraryTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setSearchInput('');
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
          borderBottom: '1px solid',
          borderColor: 'border.default',
          mb: '4',
        })}
      >
        {/* 탭 + 정렬 */}
        <div className={css({ display: 'flex', alignItems: 'center' })}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={css({
                px: '3',
                py: '2',
                fontSize: 'sm',
                fontWeight: activeTab === tab.key ? 'semibold' : 'normal',
                color: activeTab === tab.key ? 'accent.fg' : 'fg.subtle',
                bg: 'transparent',
                border: 'none',
                borderBottom: '2px solid',
                borderColor:
                  activeTab === tab.key ? 'accent.default' : 'transparent',
                cursor: 'pointer',
                mb: '-1px',
                _hover: { color: 'fg.default' },
              })}
            >
              {tab.label}
            </button>
          ))}
          <select
            value={sort}
            onChange={handleSortChange}
            className={css({
              ml: '3',
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
              mb: '2',
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
        <form
          onSubmit={handleSearch}
          className={css({
            display: 'flex',
            gap: '1',
            alignItems: 'center',
            mb: '2',
          })}
        >
          <Input
            size="sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="내 라이브러리에서 검색..."
            className={css({ w: '52' })}
          />
          <Button variant="primary" size="sm" type="submit">
            🔍
          </Button>
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
