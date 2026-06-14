import { useQuery } from '@tanstack/react-query';
import {
  getDiscountedRecommendations,
  getHighlyRatedRecommendations,
  getLatestRecommendations,
  getPopularGames,
  RECOMMENDATION_LIMIT,
} from '@/features/recommendations/api/recommendations';

interface QueryOptions {
  enabled?: boolean;
}

export function useLatestRecommendations(options?: QueryOptions) {
  return useQuery({
    queryKey: ['recommendations', 'latest', RECOMMENDATION_LIMIT],
    queryFn: ({ signal }) =>
      getLatestRecommendations({ limit: RECOMMENDATION_LIMIT, signal }),
    enabled: options?.enabled ?? true,
  });
}

export function useDiscountedRecommendations(options?: QueryOptions) {
  return useQuery({
    queryKey: ['recommendations', 'discounted', RECOMMENDATION_LIMIT],
    queryFn: ({ signal }) =>
      getDiscountedRecommendations({ limit: RECOMMENDATION_LIMIT, signal }),
    enabled: options?.enabled ?? true,
  });
}

export function useHighlyRatedRecommendations(options?: QueryOptions) {
  return useQuery({
    queryKey: ['recommendations', 'highly-rated', RECOMMENDATION_LIMIT],
    queryFn: ({ signal }) =>
      getHighlyRatedRecommendations({ limit: RECOMMENDATION_LIMIT, signal }),
    enabled: options?.enabled ?? true,
  });
}

export function usePopularGames(options?: QueryOptions) {
  return useQuery({
    queryKey: ['games', 'popular', RECOMMENDATION_LIMIT],
    queryFn: ({ signal }) =>
      getPopularGames({ limit: RECOMMENDATION_LIMIT, signal }),
    enabled: options?.enabled ?? true,
  });
}
