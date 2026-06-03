import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { useGuestHome } from '@/features/main/api/guestHome';
import { GameGridSection } from '@/features/main/components/GameGridSection';

// MAIN-FE-004 비로그인 "이번 주 신규 게임" 섹션.
// 데이터 출처는 guest-home의 newReleases. 메인 1페이지=1쿼리이므로 useGuestHome를 재사용한다(새 쿼리 0).
// 그리드/스켈레톤/4상태/더보기는 공유 GameGridSection이 소유하고, 여기선 데이터·카드만 전달한다.
export function NewReleases() {
  const { data, isLoading, isError } = useGuestHome();

  return (
    <GameGridSection
      title="이번 주 신규 게임"
      items={data?.newReleases ?? []}
      isLoading={isLoading}
      isError={isError}
      errorText="신규 게임을 불러오지 못했어요."
      emptyText="표시할 신규 게임이 없어요."
      renderCard={(game) => (
        // "신규 게임" 섹션이므로 데이터 isNew 유무와 무관하게 항상 NEW 뱃지 표시(섹션 자체가 곧 신규).
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
