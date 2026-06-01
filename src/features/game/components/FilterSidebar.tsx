import { useState } from 'react';
import { css, cx } from 'styled-system/css';

export interface FilterState {
  genres: string[];
  tags: string[];
  priceMin: number;
  priceMax: number;
  onSale: boolean;
  koreanSub: boolean;
  playerModes: string[];
  minRating: number;
}

export const DEFAULT_FILTERS: FilterState = {
  genres: [],
  tags: [],
  priceMin: 0,
  priceMax: 70000,
  onSale: false,
  koreanSub: false,
  playerModes: [],
  minRating: 0,
};

const GENRES = [
  { label: 'RPG', count: 428 },
  { label: '액션', count: 312 },
  { label: '어드벤처', count: 186 },
  { label: 'FPS', count: 141 },
  { label: '전략', count: 98 },
  { label: '시뮬레이션', count: 73 },
  { label: '퍼즐', count: 55 },
];

const TAGS = [
  { label: '오픈월드', count: 247 },
  { label: '다크 판타지', count: 112 },
  { label: '잔잔한', count: 68 },
  { label: '스토리 중심', count: 203 },
  { label: '협동', count: 156 },
  { label: '로그라이크', count: 94 },
  { label: 'SF', count: 81 },
];

const PLAYER_MODES = ['싱글플레이어', '협동', '온라인 멀티'];

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

// 토글 스위치
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        css({
          w: '36px',
          h: '20px',
          borderRadius: 'full',
          border: '1px solid',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 0.15s, border-color 0.15s',
        }),
        checked
          ? css({ bg: 'accent.default', borderColor: 'accent.default' })
          : css({ bg: 'bg.surfaceRaised', borderColor: 'border.emphasized' }),
      )}
    >
      <span
        className={css({
          position: 'absolute',
          top: '1px',
          w: '16px',
          h: '16px',
          borderRadius: 'full',
          bg: 'white',
          transition: 'left 0.15s',
        })}
        style={{ left: checked ? '17px' : '1px' }}
      />
    </button>
  );
}

// 체크박스 아이템
function CheckItem({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        cursor: 'pointer',
        py: '1',
      })}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cx('peer', css({ srOnly: true }))}
      />
      <span
        aria-hidden="true"
        className={css({
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '4',
          h: '4',
          borderRadius: 'sm',
          border: '1px solid',
          borderColor: checked ? 'accent.default' : 'border.emphasized',
          bg: checked ? 'accent.default' : 'bg.canvas',
          color: 'fg.onAccent',
          fontSize: '2xs',
          _peerFocusVisible: {
            outline: '2px solid',
            outlineColor: 'border.accent',
            outlineOffset: '1px',
          },
        })}
      >
        {checked ? '✓' : ''}
      </span>
      <span className={css({ fontSize: 'sm', color: 'fg.muted', flex: '1' })}>
        {label}
      </span>
      {count != null && (
        <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
          {count.toLocaleString()}
        </span>
      )}
    </label>
  );
}

const sectionLabel = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  color: 'fg.default',
});

const divider = css({
  borderBottom: '1px solid',
  borderColor: 'border.default',
  my: '4',
});

export function FilterSidebar({ filters, onChange, onReset }: Props) {
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const visibleGenres = showAllGenres ? GENRES : GENRES.slice(0, 5);
  const visibleTags = showAllTags ? TAGS : TAGS.slice(0, 6);

  const hasActive =
    filters.genres.length > 0 ||
    filters.tags.length > 0 ||
    filters.priceMin > 0 ||
    filters.priceMax < 70000 ||
    filters.onSale ||
    filters.koreanSub ||
    filters.playerModes.length > 0 ||
    filters.minRating > 0;

  function toggleGenre(label: string, checked: boolean) {
    onChange({
      ...filters,
      genres: checked
        ? [...filters.genres, label]
        : filters.genres.filter((g) => g !== label),
    });
  }

  function toggleTag(label: string, checked: boolean) {
    onChange({
      ...filters,
      tags: checked
        ? [...filters.tags, label]
        : filters.tags.filter((t) => t !== label),
    });
  }

  function togglePlayerMode(mode: string, checked: boolean) {
    onChange({
      ...filters,
      playerModes: checked
        ? [...filters.playerModes, mode]
        : filters.playerModes.filter((m) => m !== mode),
    });
  }

  return (
    <aside
      className={css({
        w: '200px',
        flexShrink: 0,
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'xl',
        p: '4',
      })}
    >
      {/* 헤더 */}
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
            fontWeight: 'bold',
            color: 'fg.default',
            fontSize: 'sm',
          })}
        >
          필터
        </span>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className={css({
              fontSize: 'xs',
              color: 'accent.fg',
              cursor: 'pointer',
              bg: 'transparent',
              border: 'none',
              _hover: { opacity: '0.8' },
            })}
          >
            초기화
          </button>
        )}
      </div>

      {/* 장르 */}
      <div>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: '2',
          })}
        >
          <span className={sectionLabel}>장르</span>
          {filters.genres.length > 0 && (
            <span
              className={css({
                fontSize: 'xs',
                color: 'accent.fg',
                fontWeight: 'bold',
              })}
            >
              {filters.genres.length}
            </span>
          )}
        </div>
        {visibleGenres.map((g) => (
          <CheckItem
            key={g.label}
            label={g.label}
            count={g.count}
            checked={filters.genres.includes(g.label)}
            onChange={(checked) => toggleGenre(g.label, checked)}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowAllGenres((v) => !v)}
          className={css({
            fontSize: 'xs',
            color: 'fg.subtle',
            cursor: 'pointer',
            mt: '1',
            bg: 'transparent',
            border: 'none',
            _hover: { color: 'fg.muted' },
          })}
        >
          {showAllGenres ? '접기' : '+ 더 보기'}
        </button>
      </div>

      <div className={divider} />

      {/* 태그 */}
      <div>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: '2',
          })}
        >
          <span className={sectionLabel}>태그</span>
          {filters.tags.length > 0 && (
            <span
              className={css({
                fontSize: 'xs',
                color: 'accent.fg',
                fontWeight: 'bold',
              })}
            >
              {filters.tags.length}
            </span>
          )}
        </div>
        {visibleTags.map((t) => (
          <CheckItem
            key={t.label}
            label={t.label}
            count={t.count}
            checked={filters.tags.includes(t.label)}
            onChange={(checked) => toggleTag(t.label, checked)}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowAllTags((v) => !v)}
          className={css({
            fontSize: 'xs',
            color: 'fg.subtle',
            cursor: 'pointer',
            mt: '1',
            bg: 'transparent',
            border: 'none',
            _hover: { color: 'fg.muted' },
          })}
        >
          {showAllTags ? '접기' : '+ 더 보기'}
        </button>
      </div>

      <div className={divider} />

      {/* 가격대 */}
      <div>
        <span className={sectionLabel}>가격대</span>
        <div
          className={css({
            mt: '3',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5',
          })}
        >
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'xs',
              color: 'fg.muted',
            })}
          >
            <span>₩{filters.priceMin.toLocaleString()}</span>
            <span>₩{filters.priceMax.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={70000}
            step={1000}
            value={filters.priceMin}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val < filters.priceMax)
                onChange({ ...filters, priceMin: val });
            }}
            style={{ accentColor: '#ef5a2c', width: '100%', cursor: 'pointer' }}
          />
          <input
            type="range"
            min={0}
            max={70000}
            step={1000}
            value={filters.priceMax}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > filters.priceMin)
                onChange({ ...filters, priceMax: val });
            }}
            style={{ accentColor: '#ef5a2c', width: '100%', cursor: 'pointer' }}
          />
        </div>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: '3',
          })}
        >
          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
            세일 중만 보기
          </span>
          <Toggle
            checked={filters.onSale}
            onChange={(v) => onChange({ ...filters, onSale: v })}
          />
        </div>
      </div>

      <div className={divider} />

      {/* 한글 지원 */}
      <div>
        <span className={sectionLabel}>한글 지원</span>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: '3',
          })}
        >
          <span className={css({ fontSize: 'sm', color: 'fg.muted' })}>
            한글 자막
          </span>
          <Toggle
            checked={filters.koreanSub}
            onChange={(v) => onChange({ ...filters, koreanSub: v })}
          />
        </div>
      </div>

      <div className={divider} />

      {/* 플레이어 모드 */}
      <div>
        <span className={sectionLabel}>플레이어 모드</span>
        <div className={css({ mt: '2' })}>
          {PLAYER_MODES.map((mode) => (
            <CheckItem
              key={mode}
              label={mode}
              checked={filters.playerModes.includes(mode)}
              onChange={(checked) => togglePlayerMode(mode, checked)}
            />
          ))}
        </div>
      </div>

      <div className={divider} />

      {/* 평점 */}
      <div>
        <span className={sectionLabel}>우리 서비스 평점</span>
        <div className={css({ mt: '3' })}>
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'xs',
              color: 'fg.muted',
              mb: '2',
            })}
          >
            <span>
              ★ {filters.minRating > 0 ? `${filters.minRating}+` : '전체'}
            </span>
            <span>★ 5.0</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={filters.minRating}
            onChange={(e) =>
              onChange({ ...filters, minRating: Number(e.target.value) })
            }
            style={{ accentColor: '#ef5a2c', width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>
    </aside>
  );
}
