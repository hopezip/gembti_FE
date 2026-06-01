import { useState } from 'react';
import { css } from 'styled-system/css';

type TabKey = 'all' | 'free' | 'review' | 'party';

interface Tab {
  key: TabKey;
  label: string;
  count: number;
}

const TABS: Tab[] = [
  { key: 'all', label: '전체', count: 1247 },
  { key: 'free', label: '자유', count: 582 },
  { key: 'review', label: '리뷰', count: 421 },
  { key: 'party', label: '파티 모집', count: 98 },
];

function formatCount(n: number) {
  return n >= 1000
    ? `${(n / 1000).toFixed(0)},${String(n % 1000).padStart(3, '0')}`
    : String(n);
}

interface CommunityTabsProps {
  defaultTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
}

// 커뮤니티 카테고리 탭 (Figma: comm-tabs, h=42px).
// active 탭: border-bottom 2px accent + 텍스트 accent.
// 숫자 배지: JetBrains Mono, 비활성 fg.subtle.
export function CommunityTabs({
  defaultTab = 'all',
  onTabChange,
}: CommunityTabsProps) {
  const [active, setActive] = useState<TabKey>(defaultTab);

  function handleTabClick(key: TabKey) {
    setActive(key);
    onTabChange?.(key);
  }

  return (
    <div
      role="tablist"
      aria-label="커뮤니티 카테고리"
      className={css({
        display: 'flex',
        alignItems: 'flex-end',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        px: { base: '7', '2xl': '8' },
        h: '42px',
      })}
    >
      {TABS.map(({ key, label, count }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabClick(key)}
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.5',
              h: '42px',
              px: '3',
              pb: '0',
              borderBottom: '2px solid',
              borderColor: isActive ? 'accent.default' : 'transparent',
              fontWeight: 'medium',
              fontSize: '13.5px',
              color: isActive ? 'accent.fg' : 'fg.muted',
              background: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              transition:
                'color {durations.fast}, border-color {durations.fast}',
              _hover: { color: isActive ? 'accent.fg' : 'fg.default' },
            })}
          >
            {label}
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: '10.5px',
                fontWeight: 'medium',
                color: isActive ? 'accent.fg' : 'fg.subtle',
              })}
            >
              {formatCount(count)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
