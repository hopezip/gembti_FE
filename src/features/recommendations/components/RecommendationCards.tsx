import { css } from 'styled-system/css';
import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { PersonalizedGameCard } from '@/features/game/components/PersonalizedGameCard';
import type {
  DiscountedRecommendation,
  HighlyRatedRecommendation,
  LatestRecommendation,
  PopularGame,
} from '@/features/recommendations/api/recommendations';

const priceStyles = {
  row: css({ mt: '4', display: 'flex', alignItems: 'center', gap: '2' }),
  discount: css({
    color: 'accent.default',
    fontWeight: 'bold',
    fontSize: 'md',
  }),
  original: css({
    color: 'fg.subtle',
    fontSize: 'sm',
    textDecoration: 'line-through',
  }),
  sale: css({ color: 'fg.default', fontWeight: 'bold', fontSize: 'md' }),
};

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('ko-KR').format(price)}원`;
}

export function formatKoreanCount(value: number) {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toFixed(1).replace(/\.0$/, '')}만`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}천`;
  }
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function LatestRecommendationCard({
  game,
}: {
  game: LatestRecommendation;
}) {
  return (
    <PersonalizedGameCard
      title={game.title}
      thumbnailUrl={game.imageUrl}
      genres={game.genres}
      imageBadge={`취향률 ${Math.round(game.similarityScore * 100)}%`}
    />
  );
}

export function DiscountedRecommendationCard({
  game,
}: {
  game: DiscountedRecommendation;
}) {
  return (
    <PersonalizedGameCard
      title={game.title}
      thumbnailUrl={game.imageUrl}
      genres={game.genres}
      footer={
        <div className={priceStyles.row}>
          <span className={priceStyles.discount}>{game.discountRate}%</span>
          <span className={priceStyles.original}>
            {formatPrice(game.originalPrice)}
          </span>
          <span className={priceStyles.sale}>
            {formatPrice(game.salePrice)}
          </span>
        </div>
      }
    />
  );
}

export function HighlyRatedRecommendationCard({
  game,
}: {
  game: HighlyRatedRecommendation;
}) {
  return (
    <PersonalizedGameCard
      title={game.title}
      thumbnailUrl={game.imageUrl}
      genres={game.genres}
      reasonTagline={`★ ${game.rating.toFixed(1)} · 리뷰 ${formatKoreanCount(game.reviewCount)}+`}
    />
  );
}

export function PopularGameCard({ game }: { game: PopularGame }) {
  return (
    <GameSummaryCard
      title={game.title}
      thumbnailUrl={game.imageUrl}
      genres={game.genres}
      rating={game.rating}
      imageBadge={game.rank <= 10 ? `TOP ${game.rank}` : undefined}
      secondaryMeta={`${formatKoreanCount(game.currentPlayers)}명 플레이 중`}
    />
  );
}
