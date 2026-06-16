// TODO: 아래 추천 조회 API들이 백엔드 OpenAPI에 등재되면 src/types/api.ts 생성 타입으로 교체한다.
// 현재는 백엔드와 합의한 응답 계약을 MSW와 함께 수동으로 유지한다.
export interface LatestRecommendationRaw {
  recommendation_item_id: number;
  game_id: number;
  title: string;
  image_url: string | null;
  genres: string[];
  rating: number | null;
  similarity_score: number;
  similarity_rank: number;
}

export interface DiscountedRecommendationRaw {
  recommendation_item_id: number;
  game_id: number;
  title: string;
  image_url: string | null;
  genres: string[];
  similarity_score: number;
  similarity_rank: number;
  discount_percent: number;
  original_price_krw: number | null;
  price_krw: number | null;
  rating: number | null;
}

export interface HighlyRatedRecommendationRaw {
  recommendation_item_id: number;
  game_id: number;
  title: string;
  image_url: string | null;
  genres: string[];
  rating: number | null;
  review_count: number;
  similarity_score: number;
  similarity_rank: number;
}

export interface PopularGameRaw {
  recommendation_item_id: number;
  rank: number;
  game_id: number;
  title: string;
  image_url: string | null;
  genres: string[];
  current_players: number;
  rating: number | null;
  current_players_updated_at: string | null;
  similarity_score: number;
  similarity_rank: number;
}

export interface RecommendationListResponseRaw<T> {
  games: T[];
}

export interface LatestRecommendation {
  recommendationItemId: number;
  gameId: number;
  title: string;
  imageUrl: string | null;
  genres: string[];
  rating: number | null;
  similarityScore: number;
  similarityRank: number;
}

export interface DiscountedRecommendation {
  recommendationItemId: number;
  gameId: number;
  title: string;
  imageUrl: string | null;
  genres: string[];
  similarityScore: number;
  similarityRank: number;
  discountRate: number;
  originalPrice: number | null;
  salePrice: number | null;
  rating: number | null;
}

export interface HighlyRatedRecommendation {
  recommendationItemId: number;
  gameId: number;
  title: string;
  imageUrl: string | null;
  genres: string[];
  rating: number | null;
  reviewCount: number;
  similarityScore: number;
  similarityRank: number;
}

export interface PopularGame {
  recommendationItemId: number;
  rank: number;
  gameId: number;
  title: string;
  imageUrl: string | null;
  genres: string[];
  currentPlayers: number;
  rating: number | null;
  currentPlayersUpdatedAt: string | null;
  similarityScore: number;
  similarityRank: number;
}
