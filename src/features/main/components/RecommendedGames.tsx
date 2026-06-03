import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { useGuestHome } from '@/features/main/api/guestHome';
import { GameGridSection } from '@/features/main/components/GameGridSection';

// MAIN-FE-003 비로그인 "추천 게임" 섹션.
// 비로그인엔 개인화 추천이 없으므로 데이터 출처는 guest-home의 trendingGames(인기)다.
// 그리드/스켈레톤/4상태/더보기는 공유 GameGridSection이 소유하고, 여기선 데이터·카드만 전달한다.
export function RecommendedGames() {
  const { data, isLoading, isError } = useGuestHome();

  return (
    <GameGridSection
      title="추천 게임"
      items={data?.trendingGames ?? []}
      isLoading={isLoading}
      isError={isError}
      errorText="추천 게임을 불러오지 못했어요."
      emptyText="표시할 추천 게임이 없어요."
      renderCard={(game) => (
        <GameSummaryCard
          key={game.gameId}
          title={game.title}
          genres={game.genres}
          rating={game.rating}
          thumbnailUrl={game.thumbnailUrl}
        />
      )}
    />
  );
}
