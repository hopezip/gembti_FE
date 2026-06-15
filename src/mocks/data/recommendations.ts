const GAME_COVER = '/images/recommendation-game-cover.png';

const GAME_TITLES = [
  'Ashen Horizon',
  'Neon Vanguard',
  'Forgotten Crown',
  'Echoes of Aether',
  'Ironbound Legends',
  'Moonfall Protocol',
  'Rift Walker',
  'Emberwake',
  'Starlight Valley',
  'Citadel of Time',
  'Arcane Tactics',
  'Wildheart Hunter',
];

const MOCK_RECOMMENDATION_COUNT = 36;

const GENRES_POOL = [
  ['RPG', '오픈월드'],
  ['액션', '어드벤처'],
  ['전략', '턴제'],
  ['시뮬레이션', '힐링'],
  ['로그라이크', '인디'],
  ['액션', 'RPG'],
];

function baseItem(index: number, gameIdBase: number) {
  return {
    recommendation_item_id: gameIdBase + index,
    game_id: gameIdBase + index,
    title: `${GAME_TITLES[index % GAME_TITLES.length]} ${Math.floor(index / GAME_TITLES.length) + 1}`,
    image_url: GAME_COVER,
    genres: GENRES_POOL[index % GENRES_POOL.length],
    similarity_score: Number((0.96 - index * 0.025).toFixed(2)),
  };
}

export const MOCK_LATEST_RECOMMENDATIONS = {
  games: Array.from({ length: MOCK_RECOMMENDATION_COUNT }, (_, index) => ({
    ...baseItem(index, 1000),
    similarity_rank: index + 1,
  })),
};

export const MOCK_DISCOUNTED_RECOMMENDATIONS = {
  games: Array.from({ length: MOCK_RECOMMENDATION_COUNT }, (_, index) => {
    const originalPrice = 69_800 - (index % 4) * 10_000;
    const discountRate = 20 + (index % 5) * 10;
    return {
      ...baseItem(index, 2000),
      discount_rate: discountRate,
      original_price: originalPrice,
      sale_price: Math.round((originalPrice * (100 - discountRate)) / 100),
    };
  }),
};

export const MOCK_HIGHLY_RATED_RECOMMENDATIONS = {
  games: Array.from({ length: MOCK_RECOMMENDATION_COUNT }, (_, index) => ({
    ...baseItem(index, 3000),
    rating: Number((4.9 - (index % 7) * 0.1).toFixed(1)),
    review_count: Math.max(1_200, 128_400 - index * 3_500),
    similarity_rank: index + 1,
  })),
};

export const MOCK_POPULAR_GAMES = {
  games: Array.from({ length: MOCK_RECOMMENDATION_COUNT }, (_, index) => ({
    rank: index + 1,
    game_id: 4000 + index,
    title: `${GAME_TITLES[index % GAME_TITLES.length]} ${Math.floor(index / GAME_TITLES.length) + 1}`,
    image_url: GAME_COVER,
    genres: GENRES_POOL[index % GENRES_POOL.length],
    current_players: Math.max(1_000, 912_345 - index * 25_000),
    rating: Number((4.9 - (index % 8) * 0.1).toFixed(1)),
  })),
};
