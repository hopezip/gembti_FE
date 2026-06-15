import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { useGuestHome } from '@/features/main/api/guestHome';
import { GameGridSection } from '@/features/main/components/GameGridSection';

// MAIN-FE-003 비로그인 "인기 게임" 섹션 (MAIN-FE-012: 라벨을 '추천'→'인기'로 정정).
// 비로그인·설문 미완 유저는 개인화 추천이 없으므로 데이터 출처는 guest-home의 trendingGames(인기)다.
// 그리드/스켈레톤/4상태/더보기는 공유 GameGridSection이 소유하고, 여기선 데이터·카드만 전달한다.
// 각 카드는 /games/:id 상세로 가는 react-router Link로 감싼다(REC-DET-FE-001 진입점 보강).

// 카드 링크 — SearchPage/상세와 동일 패턴(블록 링크 + hover lift + 포커스 링).
const cardLink = css({
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  borderRadius: 'xl',
  transition: 'transform 0.15s ease',
  _hover: { transform: 'translateY(-2px)' },
  _focusVisible: {
    outline: '2px solid',
    outlineColor: 'accent.default',
    outlineOffset: '2px',
  },
});

export function RecommendedGames() {
  const { data, isLoading, isError } = useGuestHome();

  return (
    <GameGridSection
      title="인기 게임"
      items={data?.trendingGames ?? []}
      isLoading={isLoading}
      isError={isError}
      errorText="인기 게임을 불러오지 못했어요."
      emptyText="표시할 인기 게임이 없어요."
      renderCard={(game) => (
        <Link
          key={game.gameId}
          to={`/games/${game.gameId}`}
          className={cardLink}
        >
          <GameSummaryCard
            title={game.title}
            genres={game.genres}
            rating={game.rating}
            thumbnailUrl={game.thumbnailUrl}
          />
        </Link>
      )}
    />
  );
}
