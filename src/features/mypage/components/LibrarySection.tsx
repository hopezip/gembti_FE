import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { GameCard } from '@/components/ui/GameCard';
import type { MockLibraryItem } from '@/mocks/handlers/mypage';

type LibraryTab = 'all' | 'playing' | 'cleared' | 'unplayed' | 'dropped';

const TABS: { key: LibraryTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'playing', label: '플레이 중' },
  { key: 'cleared', label: '내 평점' },
  { key: 'unplayed', label: '미 플레이' },
  { key: 'dropped', label: '중단됨' },
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
          <span
            className={css({
              fontSize: 'xs',
              color: 'info.fg',
              bg: 'info.soft',
              px: '1.5',
              py: '0.5',
              borderRadius: 'sm',
            })}
          >
            Steam
          </span>
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
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<MockLibraryItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['mypage', 'library', activeTab, page],
    queryFn: () =>
      ky
        .get(`/api/mypage/library?tab=${activeTab}&page=${page}`)
        .json<LibraryResponse>(),
    placeholderData: (prev) => prev,
  });

  const handleTabChange = (tab: LibraryTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setAllItems([]);
  };

  const items = (() => {
    if (!data) return allItems;
    if (page === 1) return data.items;
    const ids = new Set(allItems.map((i) => i.id));
    const newItems = data.items.filter((i) => !ids.has(i.id));
    if (newItems.length > 0) {
      setAllItems((prev) => [...prev, ...newItems]);
    }
    return [...allItems, ...newItems];
  })();

  return (
    <section>
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
            소스 · Steam
          </span>
          <button
            type="button"
            className={css({
              fontSize: 'xs',
              color: 'fg.muted',
              bg: 'bg.surfaceRaised',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 'md',
              px: '2',
              py: '1',
              cursor: 'pointer',
              _hover: { borderColor: 'border.emphasized' },
            })}
          >
            수동 동기화
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div
        className={css({
          display: 'flex',
          gap: '1',
          mb: '4',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          pb: '0',
        })}
      >
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
      </div>

      {isLoading && items.length === 0 ? (
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
      ) : items.length === 0 ? (
        <div
          className={css({
            textAlign: 'center',
            py: '12',
            color: 'fg.subtle',
            fontSize: 'sm',
          })}
        >
          라이브러리가 비어 있습니다
        </div>
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
            {items.map((item) => (
              <LibraryGameCard key={item.id} item={item} />
            ))}
          </div>

          {data?.hasMore && (
            <div className={css({ textAlign: 'center' })}>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className={css({
                  px: '6',
                  py: '2',
                  fontSize: 'sm',
                  color: 'fg.muted',
                  bg: 'bg.surface',
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 'md',
                  cursor: 'pointer',
                  _hover: {
                    borderColor: 'border.emphasized',
                    color: 'fg.default',
                  },
                })}
              >
                더 보기 · {data.total - items.length}개 남음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
