import { useId, useState } from 'react';
import { css } from 'styled-system/css';
import { Chip } from '@/components/ui/Chip';

// SEARCH-FE-003 검색 필터박스 — Figma 검색 결과 페이지(4030:2) 기준.
// "필터" 헤딩 + 장르 행 / 태그 행. 각 행은 칩(다중선택 토글) + 우측 "+ 더보기"(접힘/펼침).
// 칩은 장르·태그만, 라벨만 표시(개수 facet 미표시 — 백엔드 미제공). 선택 상태는 Chip data-state="on".
// 필터 적용은 클라이언트(AND) — 상태/필터 로직은 소비자(SearchPage)가 소유하고 여기선 선택 UI만 담당한다.

// 접힘 상태에서 노출할 칩 개수. 초과분은 "+ 더보기"로 펼친다.
const COLLAPSED_COUNT = 5;

const styles = {
  box: css({
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.emphasized',
    borderRadius: 'lg', // 8px
    px: '5',
    py: '4',
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
  }),
  row: css({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
  }),
  // 행 라벨("장르"/"태그") — 칩과 세로 중앙을 맞추기 위해 칩 높이만큼 라인하이트 보정.
  rowLabel: css({
    flexShrink: 0,
    w: '10', // 40px 고정폭으로 장르/태그 라벨 좌측 정렬
    fontSize: 'lg',
    fontWeight: 'medium',
    color: 'fg.default',
    lineHeight: '1.9',
  }),
  chips: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2',
    flex: '1',
    minW: '0',
  }),
  more: css({
    flexShrink: 0,
    alignSelf: 'flex-start',
    fontSize: 'sm',
    fontWeight: 'medium',
    color: 'fg.subtle',
    cursor: 'pointer',
    bg: 'transparent',
    border: 'none',
    px: '1',
    py: '1',
    _hover: { color: 'fg.muted' },
  }),
};

interface FilterRowProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

function FilterRow({ label, options, selected, onToggle }: FilterRowProps) {
  const [showAll, setShowAll] = useState(false);
  // 더보기 버튼(aria-expanded)이 제어하는 칩 목록을 aria-controls로 연결하기 위한 고유 id.
  const listId = useId();
  const visible = showAll ? options : options.slice(0, COLLAPSED_COUNT);
  const hasMore = options.length > COLLAPSED_COUNT;

  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div id={listId} className={styles.chips}>
        {visible.map((option) => {
          const on = selected.includes(option);
          return (
            <Chip
              key={option}
              type="button"
              data-state={on ? 'on' : undefined}
              aria-pressed={on}
              onClick={() => onToggle(option)}
            >
              {option}
            </Chip>
          );
        })}
      </div>
      {hasMore && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={showAll}
          aria-controls={listId}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? '접기' : '+ 더보기'}
        </button>
      )}
    </div>
  );
}

export interface SearchFilterBoxProps {
  genres: string[];
  tags: string[];
  selectedGenres: string[];
  selectedTags: string[];
  onToggleGenre: (genre: string) => void;
  onToggleTag: (tag: string) => void;
}

export function SearchFilterBox({
  genres,
  tags,
  selectedGenres,
  selectedTags,
  onToggleGenre,
  onToggleTag,
}: SearchFilterBoxProps) {
  return (
    <div className={styles.box}>
      <FilterRow
        label="장르"
        options={genres}
        selected={selectedGenres}
        onToggle={onToggleGenre}
      />
      <FilterRow
        label="태그"
        options={tags}
        selected={selectedTags}
        onToggle={onToggleTag}
      />
    </div>
  );
}
