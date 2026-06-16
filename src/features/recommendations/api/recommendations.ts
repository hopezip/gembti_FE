import { HTTPError } from 'ky';
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
  onGenerated?: () => void | Promise<void>;
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
  let response: RecommendationListResponseRaw<LatestRecommendationRaw>;
  try {
    response = await requestList<LatestRecommendationRaw>(
      'api/v1/recommendations/latest_reco',
      options,
    );
  } catch (err) {
    // 추천 기록 없음(404) → 최초 generate 후 그 결과를 바로 사용한다.
    if (err instanceof HTTPError && err.response.status === 404) {
      response = await api
        .post('api/v1/recommendations/generate', {
          signal: options?.signal,
          searchParams: { limit: options?.limit ?? RECOMMENDATION_LIMIT },
        })
        .json<RecommendationListResponseRaw<LatestRecommendationRaw>>();
      await options?.onGenerated?.();
    } else {
      throw err;
    }
  }
  return response.games.map((item) => ({
    recommendationItemId: item.recommendation_item_id,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url ?? null,
    genres: item.genres,
    rating: item.rating ?? null,
    similarityScore: item.similarity_score,
    similarityRank: item.similarity_rank,
  }));
}

export async function getDiscountedRecommendations(
  options?: RequestOptions,
): Promise<DiscountedRecommendation[]> {
  let response: RecommendationListResponseRaw<DiscountedRecommendationRaw>;
  try {
    response = await requestList<DiscountedRecommendationRaw>(
      'api/v1/recommendations/discounted',
      options,
    );
  } catch (err) {
    if (err instanceof HTTPError && err.response.status === 404) return [];
    throw err;
  }
  return response.games.map((item) => ({
    recommendationItemId: item.recommendation_item_id,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url,
    genres: item.genres,
    similarityScore: item.similarity_score,
    similarityRank: item.similarity_rank,
    discountRate: item.discount_percent,
    originalPrice: item.original_price_krw,
    salePrice: item.price_krw,
    rating: item.rating ?? null,
  }));
}

export async function getHighlyRatedRecommendations(
  options?: RequestOptions,
): Promise<HighlyRatedRecommendation[]> {
  let response: RecommendationListResponseRaw<HighlyRatedRecommendationRaw>;
  try {
    response = await requestList<HighlyRatedRecommendationRaw>(
      'api/v1/recommendations/highly-rated',
      options,
    );
  } catch (err) {
    if (err instanceof HTTPError && err.response.status === 404) return [];
    throw err;
  }
  return response.games.map((item) => ({
    recommendationItemId: item.recommendation_item_id,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url,
    genres: item.genres,
    rating: item.rating ?? null,
    reviewCount: item.review_count,
    similarityScore: item.similarity_score,
    similarityRank: item.similarity_rank,
  }));
}

export async function getPopularGames(
  options?: RequestOptions,
): Promise<PopularGame[]> {
  let response: RecommendationListResponseRaw<PopularGameRaw>;
  try {
    response = await requestList<PopularGameRaw>(
      'api/v1/recommendations/popular',
      options,
    );
  } catch (err) {
    if (err instanceof HTTPError && err.response.status === 404) return [];
    throw err;
  }
  return response.games.map((item) => ({
    recommendationItemId: item.recommendation_item_id,
    rank: item.rank,
    gameId: item.game_id,
    title: item.title,
    imageUrl: item.image_url,
    genres: item.genres,
    currentPlayers: item.current_players,
    rating: item.rating ?? null,
    currentPlayersUpdatedAt: item.current_players_updated_at ?? null,
    similarityScore: item.similarity_score,
    similarityRank: item.similarity_rank,
  }));
}

export type {
  DiscountedRecommendation,
  HighlyRatedRecommendation,
  LatestRecommendation,
  PopularGame,
} from './types';
