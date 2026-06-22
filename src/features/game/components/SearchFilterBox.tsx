import { useId, useState } from 'react';
import { css, cx } from 'styled-system/css';
import { Chip } from '@/components/ui/Chip';

// SEARCH-FE-003 검색 필터박스 — Figma 검색 결과 페이지(4030:2) 기준.
// "필터" 헤딩 + 장르 행 / 카테고리 행. 각 행은 칩(다중선택 토글)로 구성된다.
// 칩은 장르·카테고리만, 라벨만 표시(개수 facet 미표시 — 백엔드 미제공). 선택 상태는 Chip data-state="on".
// 필터 적용은 서버사이드 — 상태/재요청 로직은 소비자(SearchPage)가 소유하고 여기선 선택 UI만 담당한다.
// 데스크탑(>768px): 모든 칩을 그대로 줄바꿈해 깔끔히 보여준다("+ 더보기" 없음 — RESPONSIVE-FE-004).
// 모바일(≤768px): 라벨을 칩 위로 올리고, 접힘 상태의 칩을 한 줄로 클립해 필터 영역이
//   여러 줄로 길어지지 않게 한다(RESPONSIVE-FE-002). 이때만 "+ 더보기"로 아래로 펼친다.

// 모바일 접힘 시 한 줄을 넘길 만큼 칩이 많은지 판단하는 기준(이 이상일 때만 '+ 더보기' 노출).
//   데스크탑은 항상 전부 펼쳐 보여주므로 더보기를 쓰지 않는다.
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
    // 모바일(≤768px): 라벨을 칩 위로 올려 칩이 전체 폭을 쓰게 한다(RESPONSIVE-FE-002).
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '1.5',
    },
  }),
  // 행 라벨("장르"/"카테고리") — 칩과 세로 중앙을 맞추기 위해 칩 높이만큼 라인하이트 보정.
  rowLabel: css({
    flexShrink: 0,
    w: '20', // 80px 고정폭으로 장르/카테고리 라벨 좌측 정렬(긴 라벨 "카테고리" 기준)
    whiteSpace: 'nowrap',
    fontSize: 'lg',
    fontWeight: 'medium',
    color: 'fg.default',
    lineHeight: '1.9',
    // 모바일에선 칩 위 한 줄 라벨이라 보정 라인하이트 불필요.
    '@media (max-width: 768px)': { w: 'auto', lineHeight: 'normal' },
  }),
  // 칩 묶음 + 더보기를 한 행으로(PC: 라벨 옆 한 줄, 모바일: 라벨 아래 전체 폭).
  chipArea: css({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
    flex: '1',
    minW: '0',
    w: 'full',
  }),
  chips: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2',
    flex: '1',
    minW: '0',
  }),
  // 모바일 접힘 상태: 칩을 스크롤 없는 한 줄로(넘치는 칩은 가리고 '+ 더보기'로 펼침 — RESPONSIVE-FE-002).
  chipsCollapsed: css({
    '@media (max-width: 768px)': {
      flexWrap: 'nowrap!',
      overflow: 'hidden',
      '& > *': { flexShrink: '0', transition: 'none' },
    },
  }),
  more: css({
    // 데스크탑: 더보기 숨김(모든 칩을 그대로 펼쳐 보여준다 — RESPONSIVE-FE-004).
    //   모바일(≤768px)에서만 노출해 접힘/펼침을 토글한다.
    display: 'none',
    '@media (max-width: 768px)': { display: 'block' },
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
  // 칩은 항상 전부 렌더한다. 데스크탑은 그대로 줄바꿈해 보여주고, 모바일 접힘 상태에선
  //   chipsCollapsed(nowrap+overflow hidden)로 한 줄만 노출하다가 '+ 더보기'로 펼친다.
  const hasMore = options.length > COLLAPSED_COUNT;

  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div className={styles.chipArea}>
        <div
          id={listId}
          className={cx(styles.chips, !showAll && styles.chipsCollapsed)}
        >
          {options.map((option) => {
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
    </div>
  );
}

export interface SearchFilterBoxProps {
  genres: string[];
  categories: string[];
  selectedGenres: string[];
  selectedCategories: string[];
  onToggleGenre: (genre: string) => void;
  onToggleCategory: (category: string) => void;
}

export function SearchFilterBox({
  genres,
  categories,
  selectedGenres,
  selectedCategories,
  onToggleGenre,
  onToggleCategory,
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
        label="카테고리"
        options={categories}
        selected={selectedCategories}
        onToggle={onToggleCategory}
      />
    </div>
  );
}
