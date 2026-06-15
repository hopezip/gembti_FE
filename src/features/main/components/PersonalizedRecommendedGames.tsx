import { PersonalizedGameCard } from '@/features/game/components/PersonalizedGameCard';
import { usePersonalizedHome } from '@/features/main/api/personalizedHome';
import { GameGridSection } from '@/features/main/components/GameGridSection';
import type { PersonalizedGameSummary } from '@/features/main/api/personalizedHome';

// MAIN-FE-006 개인화 "당신을 위한 추천" 섹션.
// 데이터 출처는 personalized-home의 recommendedGames(매칭률·추천이유 포함). 메인 1페이지=1쿼리이므로
// usePersonalizedHome를 재사용한다(새 쿼리 0). 그리드/스켈레톤/4상태/더보기는 공유 GameGridSection이 소유한다.
// 성향 태그(user_interest_tags)는 디자인 결정으로 메인에서 노출하지 않는다(데이터는 받되 미사용 — Hero 바로 아래로 추천 그리드가 붙는다).
export function PersonalizedRecommendedGames() {
  const { data, isLoading, isError } = usePersonalizedHome();

  return (
    <GameGridSection<PersonalizedGameSummary>
      title="당신을 위한 추천"
      items={data?.recommendedGames ?? []}
      isLoading={isLoading}
      isError={isError}
      errorText="추천 게임을 불러오지 못했어요."
      emptyText="표시할 추천 게임이 없어요."
      renderCard={(game) => (
        <PersonalizedGameCard
          key={game.gameId}
          title={game.title}
          thumbnailUrl={game.thumbnailUrl}
          imageBadge={`취향률 ${game.matchRate}%`}
          reasonTagline={game.reasonTagline}
        />
      )}
    />
  );
}
