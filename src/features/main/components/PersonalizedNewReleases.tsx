import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { usePersonalizedHome } from '@/features/main/api/personalizedHome';
import { GameGridSection } from '@/features/main/components/GameGridSection';

// MAIN-FE-006 개인화 홈의 "이번 주 신규 게임" 섹션.
// 신규 섹션은 비회원과 동일하다(사용자 확정): GameSummaryCard, 타이틀 없음, NEW 뱃지, 장르·평점.
// 데이터만 personalized-home의 newReleases를 쓴다. 메인 1페이지=1쿼리이므로 usePersonalizedHome 재사용(새 쿼리 0).
export function PersonalizedNewReleases() {
  const { data, isLoading, isError } = usePersonalizedHome();

  return (
    <GameGridSection
      title="이번 주 신규 게임"
      items={data?.newReleases ?? []}
      isLoading={isLoading}
      isError={isError}
      errorText="신규 게임을 불러오지 못했어요."
      emptyText="표시할 신규 게임이 없어요."
      renderCard={(game) => (
        // "신규 게임" 섹션이므로 데이터 isNew 유무와 무관하게 항상 NEW 뱃지 표시(비회원 NewReleases와 동일).
        <GameSummaryCard
          key={game.gameId}
          title={game.title}
          thumbnailUrl={game.thumbnailUrl}
          genres={game.genres}
          rating={game.rating}
          isNew
        />
      )}
    />
  );
}
