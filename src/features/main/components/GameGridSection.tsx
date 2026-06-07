import { type ReactNode, useState } from 'react';
import { css } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';

// MAIN-FE-005 홈 그리드 섹션 공유 컴포넌트.
// 추천(003)·신규(004) 섹션이 grid/skeleton/4상태/더보기/PAGE_SIZE를 거의 동일하게 복제하던 것을
// 한 곳으로 모은다. 섹션별 차이(제목·데이터·카드·폴백 문구)만 props로 받는다.
// MAIN-FE-006에서 개인화 카드(PersonalizedGameSummary)도 같은 그리드를 재사용하도록
// items 타입을 제네릭 <T>로 일반화했다. 게스트 호출부는 제네릭 추론으로 무변경이다.
// 데스크탑 전용 규칙의 1100px 미만 1열 fallback도 여기서 단일 출처로 처리한다.

// 더보기 클릭당 추가 노출 개수 기본값. 추천·신규 공통 단일 출처.
// pageSize prop 미지정 시 이 값으로 동작(기존 호출부 무영향).
const DEFAULT_PAGE_SIZE = 12;

const styles = {
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    columnGap: '6', // Figma 카드 가로 간격 24px
    rowGap: '6', // 카드 아래 여백 24px
    // 데스크탑 전용 — 1100px 미만에서는 1열로 떨어뜨려 카드 찌부러짐 방지.
    '@media (max-width: 1100px)': { gridTemplateColumns: '1fr' },
  }),
  // 스켈레톤은 텍스트가 없어 행간 0이면 붙어 보이므로 별도 그리드로 24px 간격을 준다.
  skeletonGrid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6',
    '@media (max-width: 1100px)': { gridTemplateColumns: '1fr' },
  }),
  heading: css({
    textStyle: 'heading.h3',
    color: 'fg.default',
    mb: '7', // 제목→그리드 간격 28px
  }),
  // 데이터 상태와 무관하게 섹션은 항상 렌더되므로 상하 여백을 섹션에 둔다.
  fallback: css({
    color: 'fg.muted',
    fontSize: 'sm',
    py: '8',
    textAlign: 'center',
  }),
  // 카드 커버가 테두리 없는 둥근 이미지라 스켈레톤도 동일 형태(surfaceRaised 둥근 블록)로 맞춘다.
  skeletonCard: css({
    bg: 'bg.surfaceRaised',
    borderRadius: 'xl',
    aspectRatio: '16/10',
    opacity: '0.5',
  }),
  moreRow: css({
    display: 'flex',
    justifyContent: 'center',
    mt: '8',
  }),
  moreButton: css({
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
    _hover: { bg: 'bg.surfaceRaised', borderColor: 'accent.default' },
  }),
};

interface GameGridSectionProps<T> {
  /** 섹션 제목 (예: "추천 게임" / "이번 주 신규 게임") */
  title: string;
  /** 표시할 게임 목록 (camelCase 도메인 타입). 게스트=HomeGameSummary, 개인화=PersonalizedGameSummary 등. */
  items: T[];
  isLoading: boolean;
  isError: boolean;
  /** 카드 렌더링 — 섹션별 카드 차이(추천=title만 / 신규=title+isNew / 개인화=매칭률)를 표현한다. key는 renderCard가 부여한다. */
  renderCard: (item: T) => ReactNode;
  /** 에러 상태 문구 */
  errorText: string;
  /** 빈 상태 문구 */
  emptyText: string;
  /** 초기 노출 개수 + 더보기 클릭당 추가 노출 개수. 미지정 시 12(기존 호출부 무영향). 게임 상세 카드 섹션은 4 전달. */
  pageSize?: number;
}

export function GameGridSection<T>({
  title,
  items,
  isLoading,
  isError,
  renderCard,
  errorText,
  emptyText,
  pageSize = DEFAULT_PAGE_SIZE,
}: GameGridSectionProps<T>) {
  const [visible, setVisible] = useState(pageSize);

  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  return (
    <PageContainer className={css({ py: '10' })}>
      <h2 className={styles.heading}>{title}</h2>

      {isLoading ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: pageSize }, (_, i) => `skeleton-${i}`).map(
            (key) => (
              <div key={key} className={styles.skeletonCard} />
            ),
          )}
        </div>
      ) : isError ? (
        <p className={styles.fallback}>{errorText}</p>
      ) : items.length === 0 ? (
        <p className={styles.fallback}>{emptyText}</p>
      ) : (
        <>
          <div className={styles.grid}>
            {shown.map((game) => renderCard(game))}
          </div>

          {hasMore && (
            <div className={styles.moreRow}>
              <button
                type="button"
                // items가 비동기로 줄어드는 경우까지 대비해 visible이 길이를 넘지 않게 clamp.
                onClick={() =>
                  setVisible((v) => Math.min(v + pageSize, items.length))
                }
                className={styles.moreButton}
                aria-label={`${title} 더 보기`}
              >
                더 보기 ↓
              </button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
