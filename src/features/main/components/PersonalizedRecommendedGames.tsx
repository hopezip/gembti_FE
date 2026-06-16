import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { PersonalizedGameCard } from '@/features/game/components/PersonalizedGameCard';
import { useRecommendations } from '@/features/main/api/recommendations';
import type { RecommendedGame } from '@/features/main/api/recommendations';
import { GameGridSection } from '@/features/main/components/GameGridSection';

// MAIN-FE-006 / MAIN-FE-012 개인화 "당신을 위한 추천" 섹션.
// 데이터 출처: 실 API POST /api/v1/recommendations/generate (성향 코사인 유사도 추천).
//   이전 mock(home/personalized)의 recommendedGames 의존에서 실서버 추천으로 전환(MAIN-FE-012).
// 실 응답엔 추천이유 태그라인이 없어 카드 하단 reason은 생략하고, 유사도(similarityScore)를
//   취향 매칭률(%)로 환산해 커버 배지로 노출한다. 그리드/스켈레톤/4상태/더보기는 GameGridSection이 소유.

// 카드 링크 — 신규 섹션(NewReleases)과 동일 패턴(블록 링크 + hover lift + 포커스 링).
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

export function PersonalizedRecommendedGames() {
  const { data, isLoading, isError } = useRecommendations();

  return (
    <GameGridSection<RecommendedGame>
      title="당신을 위한 추천"
      items={data ?? []}
      isLoading={isLoading}
      isError={isError}
      errorText="추천 게임을 불러오지 못했어요."
      emptyText="표시할 추천 게임이 없어요."
      renderCard={(game) => (
        // 카드를 /games/:id 상세로 가는 react-router Link로 감싼다(신규 섹션과 동일 진입점).
        <Link
          key={game.gameId}
          to={`/games/${game.gameId}`}
          className={cardLink}
        >
          <PersonalizedGameCard
            title={game.title}
            thumbnailUrl={game.thumbnailUrl}
            genres={game.genres}
            imageBadge={`취향 매칭 ${Math.round(game.similarityScore * 100)}%`}
          />
        </Link>
      )}
    />
  );
}
