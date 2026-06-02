import { useState } from 'react';
import { css } from 'styled-system/css';
import { GameSummaryCard } from '@/components/game/GameSummaryCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { useGuestHome } from '@/features/main/api/guestHome';

const PAGE_SIZE = 12;

// MAIN-FE-003 비로그인 "추천 게임" 섹션.
// 비로그인엔 개인화 추천이 없으므로 데이터 출처는 guest-home의 trending_games(인기)다.
// 4상태(로딩/에러/빈/성공) 폴백을 갖고, "더 보기"는 클라이언트에서 12개씩 추가 노출한다.
const styles = {
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    columnGap: '6', // Figma 카드 가로 간격 24px
    rowGap: '6', // 카드 아래 여백 24px (Figma는 0이나 카드 분리감 위해 추가)
  }),
  // 스켈레톤은 텍스트가 없어 행간 0이면 붙어 보이므로 별도 그리드로 24px 간격을 준다.
  skeletonGrid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6',
  }),
  heading: css({
    textStyle: 'heading.h3',
    color: 'fg.default',
    mb: '7', // Figma 제목→그리드 간격 28px
  }),
  // 데이터 상태와 무관하게 섹션은 항상 렌더되므로 상하 여백을 섹션에 둔다.
  fallback: css({
    color: 'fg.muted',
    fontSize: 'sm',
    py: '8',
    textAlign: 'center',
  }),
  // 카드가 테두리 없는 둥근 이미지라 스켈레톤도 동일 형태(surfaceRaised 둥근 블록)로 맞춘다.
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

export function RecommendedGames() {
  const { data, isLoading, isError } = useGuestHome();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const games = data?.trendingGames ?? [];
  const shown = games.slice(0, visible);
  const hasMore = visible < games.length;

  return (
    <PageContainer className={css({ py: '10' })}>
      <h2 className={styles.heading}>추천 게임</h2>

      {isLoading ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: PAGE_SIZE }, (_, i) => `skeleton-${i}`).map(
            (key) => (
              <div key={key} className={styles.skeletonCard} />
            ),
          )}
        </div>
      ) : isError ? (
        <p className={styles.fallback}>추천 게임을 불러오지 못했어요.</p>
      ) : games.length === 0 ? (
        <p className={styles.fallback}>표시할 추천 게임이 없어요.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {shown.map((game) => (
              <GameSummaryCard
                key={game.gameId}
                genres={game.genres}
                rating={game.rating}
                thumbnailUrl={game.thumbnailUrl}
              />
            ))}
          </div>

          {hasMore && (
            <div className={styles.moreRow}>
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className={styles.moreButton}
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
