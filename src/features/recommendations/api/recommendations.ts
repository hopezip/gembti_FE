import { api } from '@/lib/ky';
import type {
  DiscountedRecommendation,
  DiscountedRecommendationRaw,
  HighlyRatedRecommendation,
  HighlyRatedRecommendationRaw,
  LatestRecommendation,
  LatestRecommendationRaw,
  PopularGame,
  PopularGameRaw,
  RecommendationListResponseRaw,
} from './types';

export const RECOMMENDATION_PAGE_SIZE = 12;
export const RECOMMENDATION_LIMIT = 48;

interface RequestOptions {
  limit?: number;
  signal?: AbortSignal;
}

function requestList<T>(path: string, options?: RequestOptions) {
  return api
    .get(path, {
      signal: options?.signal,
      searchParams: { limit: options?.limit ?? RECOMMENDATION_LIMIT },
    })
    .json<RecommendationListResponseRaw<T>>();
}

export async function getLatestRecommendations(
  options?: RequestOptions,
): Promise<LatestRecommendation[]> {
  const response = await requestList<LatestRecommendationRaw>(
    'api/v1/recommendations/latest_reco',
    options,
  );
  return response.games.map((item) => ({
    recommendationItemId: item.recommendation_item_id,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url,
    genres: item.genres,
    similarityScore: item.similarity_score,
    similarityRank: item.similarity_rank,
  }));
}

export async function getDiscountedRecommendations(
  options?: RequestOptions,
): Promise<DiscountedRecommendation[]> {
  const response = await requestList<DiscountedRecommendationRaw>(
    'api/v1/recommendations/discounted',
    options,
  );
  return response.games.map((item) => ({
    recommendationItemId: item.recommendation_item_id,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url,
    genres: item.genres,
    similarityScore: item.similarity_score,
    discountRate: item.discount_rate,
    originalPrice: item.original_price,
    salePrice: item.sale_price,
  }));
}

export async function getHighlyRatedRecommendations(
  options?: RequestOptions,
): Promise<HighlyRatedRecommendation[]> {
  const response = await requestList<HighlyRatedRecommendationRaw>(
    'api/v1/recommendations/highly-rated',
    options,
  );
  return response.games.map((item) => ({
    recommendationItemId: item.recommendation_item_id,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url,
    genres: item.genres,
    rating: item.rating,
    reviewCount: item.review_count,
    similarityScore: item.similarity_score,
    similarityRank: item.similarity_rank,
  }));
}

export async function getPopularGames(
  options?: RequestOptions,
): Promise<PopularGame[]> {
  const response = await requestList<PopularGameRaw>(
    'api/v1/games/popular',
    options,
  );
  return response.games.map((item) => ({
    rank: item.rank,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url,
    genres: item.genres,
    currentPlayers: item.current_players,
    rating: item.rating,
  }));
}

export type {
  DiscountedRecommendation,
  HighlyRatedRecommendation,
  LatestRecommendation,
  PopularGame,
} from './types';
