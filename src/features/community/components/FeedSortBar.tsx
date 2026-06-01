import { useState } from 'react';
import { css } from 'styled-system/css';

type SortKey = 'latest' | 'popular' | 'weekly';

interface SortOption {
  key: SortKey;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'latest', label: '최신' },
  { key: 'popular', label: '인기' },
  { key: 'weekly', label: '주간 베스트' },
];

interface FeedSortBarProps {
  totalCount?: number;
  defaultSort?: SortKey;
  onSortChange?: (sort: SortKey) => void;
}

// 피드 정렬 바 (Figma: feed-head, h=30px).
// 좌측: 세그먼트 컨트롤 (최신/인기/주간 베스트), active=accent.
// 우측: 총 게시글 수 (fg.subtle, 12.5px).
export function FeedSortBar({
  totalCount = 1247,
  defaultSort = 'latest',
  onSortChange,
}: FeedSortBarProps) {
  const [active, setActive] = useState<SortKey>(defaultSort);

  function handleSortClick(key: SortKey) {
    setActive(key);
    onSortChange?.(key);
  }

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        h: '30px',
      })}
    >
      {/* 세그먼트 컨트롤 */}
      <fieldset
        aria-label="정렬 기준"
        className={css({
          display: 'flex',
          alignItems: 'stretch',
          h: '30px',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: '6px',
          overflow: 'hidden',
          p: '0',
          m: '0',
        })}
      >
        {SORT_OPTIONS.map(({ key, label }, idx) => {
          const isActive = active === key;
          const isLast = idx === SORT_OPTIONS.length - 1;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSortClick(key)}
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: '3',
                fontFamily: 'mono',
                fontSize: '12px',
                letterSpacing: '0.3px',
                color: isActive ? 'fg.onAccent' : 'fg.muted',
                bg: isActive ? 'accent.default' : 'bg.surface',
                borderRight: isLast ? 'none' : '1px solid',
                borderColor: 'border.default',
                cursor: 'pointer',
                transition:
                  'background {durations.fast}, color {durations.fast}',
                whiteSpace: 'nowrap',
                _hover: {
                  bg: isActive ? 'accent.hover' : 'bg.surfaceRaised',
                },
              })}
            >
              {label}
            </button>
          );
        })}
      </fieldset>

      {/* 총 게시글 수 */}
      <span
        className={css({
          fontFamily: 'body',
          fontSize: '12.5px',
          color: 'fg.subtle',
          lineHeight: '1.2',
        })}
      >
        총 {totalCount.toLocaleString()}개 게시글
      </span>
    </div>
  );
}
