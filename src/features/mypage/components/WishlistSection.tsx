import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { GameCard } from '@/components/ui/GameCard';
import type { MockWishlistItem } from '@/mocks/handlers/mypage';

interface WishlistResponse {
  total: number;
  items: MockWishlistItem[];
  hasMore: boolean;
}

function WishlistGameCard({ item }: { item: MockWishlistItem }) {
  return (
    <GameCard padding="none" interactive>
      {/* 커버 플레이스홀더 */}
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
        {/* Steam 뱃지 */}
        <div
          className={css({
            display: 'flex',
            justifyContent: 'flex-end',
            mb: '1',
          })}
        >
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
          })}
        >
          <span className={css({ fontSize: 'xs', color: 'fg.muted' })}>
            {item.genres.join(' · ')}
          </span>
          {item.onSale && item.salePrice ? (
            <div className={css({ textAlign: 'right' })}>
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'fg.subtle',
                  textDecoration: 'line-through',
                  mr: '1',
                })}
              >
                ₩{item.price.toLocaleString()}
              </span>
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'danger.fg',
                  fontWeight: 'semibold',
                })}
              >
                세일 {Math.round((1 - item.salePrice / item.price) * 100)}%
              </span>
            </div>
          ) : (
            <span className={css({ fontSize: 'xs', color: 'fg.muted' })}>
              ₩{item.price.toLocaleString()}
            </span>
          )}
        </div>
        <p className={css({ fontSize: 'xs', color: 'fg.subtle', mt: '1' })}>
          위시리스트 추가 · {item.addedAt}
        </p>
      </div>
    </GameCard>
  );
}

export function WishlistSection() {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<MockWishlistItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['mypage', 'wishlist', page],
    queryFn: () =>
      ky.get(`/api/mypage/wishlist?page=${page}`).json<WishlistResponse>(),
    placeholderData: (prev) => prev,
  });

  // 데이터 누적
  const items = (() => {
    if (!data) return allItems;
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
            내 위시리스트
          </h2>
          {data && (
            <span className={css({ fontSize: 'sm', color: 'fg.subtle' })}>
              {data.total}개
            </span>
          )}
        </div>
        <div className={css({ display: 'flex', gap: '2' })}>
          <button
            type="button"
            className={css({
              fontSize: 'xs',
              color: 'fg.subtle',
              bg: 'transparent',
              border: 'none',
              cursor: 'pointer',
              _hover: { color: 'fg.default' },
            })}
          >
            정렬
          </button>
          <button
            type="button"
            className={css({
              fontSize: 'xs',
              color: 'accent.fg',
              bg: 'transparent',
              border: 'none',
              cursor: 'pointer',
            })}
          >
            위시리스트 편집
          </button>
        </div>
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
          위시리스트가 비어 있습니다
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
              <WishlistGameCard key={item.id} item={item} />
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
