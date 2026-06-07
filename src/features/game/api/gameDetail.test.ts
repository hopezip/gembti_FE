import { describe, expect, it } from 'vitest';
import { mapGameDetail } from './gameDetail';

// mapGameDetail은 GameDetailRaw(비export)를 받는다.
// raw 타입을 외부로 넓히지 않기 위해 함수 시그니처에서 파라미터 타입을 역추론해 픽스처에 적용한다.
type GameDetailRaw = Parameters<typeof mapGameDetail>[0];

// 모든 필드가 채워진 기준 raw 응답(각 케이스에서 일부만 덮어쓴다).
// 백엔드 계약: snake_case + price_info + status/data 래핑(여기선 data 본문만).
function makeRaw(overrides: Partial<GameDetailRaw> = {}): GameDetailRaw {
  const base: GameDetailRaw = {
    game_id: 42,
    title: '엘든 링',
    description: '짧은 설명',
    full_description: '긴 설명 본문',
    genres: ['액션', 'RPG'],
    tags: ['오픈월드', '소울라이크'],
    rating: 9.5,
    review_count: 12345,
    price_info: {
      original_price: 64800,
      sale_price: 45360,
      discount_rate: 30,
    },
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    release_date: '2022-02-25',
    thumbnail_url: 'https://cdn.example/thumb.jpg',
    theme_image_url: 'https://cdn.example/theme.jpg',
    banner_url: 'https://cdn.example/banner.jpg',
    screenshot_urls: [
      'https://cdn.example/s1.jpg',
      'https://cdn.example/s2.jpg',
    ],
    trailer_url: 'https://cdn.example/trailer.mp4',
    system_requirements: {
      minimum: {
        os: 'Windows 10',
        processor: 'Intel i5-8400',
        memory: '12 GB RAM',
        graphics: 'GTX 1060',
        storage: '60 GB',
      },
      recommended: {
        os: 'Windows 11',
        processor: 'Intel i7-8700K',
        memory: '16 GB RAM',
        graphics: 'RTX 2060',
        storage: '60 GB SSD',
      },
    },
    audio_languages: ['영어', '일본어'],
    interface_languages: ['한국어', '영어'],
    play_modes: ['SINGLE', 'MULTI'],
    korean_sub: true,
    age_rating: '청소년 이용불가',
    on_sale: true,
    similar_games: [
      {
        game_id: 7,
        title: '다크 소울 3',
        thumbnail_url: 'https://cdn.example/ds3.jpg',
        genres: ['액션'],
        rating: 9.0,
      },
    ],
    developer_games: [
      {
        game_id: 8,
        title: '세키로',
        thumbnail_url: 'https://cdn.example/sekiro.jpg',
        genres: ['액션'],
        rating: 8.8,
      },
    ],
    ai_match: {
      match_rate: 87,
      reason_summary: '선호 장르와 난이도가 잘 맞습니다',
    },
    review_stats: {
      positive_rate: 92,
      total_count: 10000,
    },
  };
  return { ...base, ...overrides };
}

describe('mapGameDetail', () => {
  it('snake_case 키를 camelCase 도메인 타입으로 정확히 매핑한다', () => {
    const result = mapGameDetail(makeRaw());

    expect(result.gameId).toBe(42);
    expect(result.title).toBe('엘든 링');
    expect(result.description).toBe('짧은 설명');
    expect(result.fullDescription).toBe('긴 설명 본문');
    expect(result.genres).toEqual(['액션', 'RPG']);
    expect(result.reviewCount).toBe(12345);
    expect(result.developer).toBe('FromSoftware');
    expect(result.publisher).toBe('Bandai Namco');
    expect(result.releaseDate).toBe('2022-02-25');
    expect(result.thumbnailUrl).toBe('https://cdn.example/thumb.jpg');
    expect(result.themeImageUrl).toBe('https://cdn.example/theme.jpg');
    expect(result.bannerUrl).toBe('https://cdn.example/banner.jpg');
    expect(result.screenshotUrls).toEqual([
      'https://cdn.example/s1.jpg',
      'https://cdn.example/s2.jpg',
    ]);
    expect(result.trailerUrl).toBe('https://cdn.example/trailer.mp4');
    expect(result.audioLanguages).toEqual(['영어', '일본어']);
    expect(result.interfaceLanguages).toEqual(['한국어', '영어']);
    expect(result.koreanSub).toBe(true);
    expect(result.ageRating).toBe('청소년 이용불가');
    expect(result.onSale).toBe(true);
  });

  it('play_modes 코드 배열을 변환 없이 그대로(코드 원문) 매핑한다', () => {
    // 라벨 변환은 화면단(PLAY_MODE_LABELS) 책임이므로 매핑 계층은 코드를 보존한다.
    const result = mapGameDetail(makeRaw({ play_modes: ['SINGLE', 'CO_OP'] }));
    expect(result.playModes).toEqual(['SINGLE', 'CO_OP']);
  });

  describe('tags 정규화 (?? [])', () => {
    it('tags가 제공되면 그대로 매핑한다', () => {
      const result = mapGameDetail(makeRaw({ tags: ['인디', '로그라이크'] }));
      expect(result.tags).toEqual(['인디', '로그라이크']);
    });

    it('tags가 null이면 빈 배열로 정규화한다', () => {
      const result = mapGameDetail(makeRaw({ tags: null }));
      expect(result.tags).toEqual([]);
    });

    it('tags가 undefined(미제공)면 빈 배열로 정규화한다', () => {
      const result = mapGameDetail(makeRaw({ tags: undefined }));
      expect(result.tags).toEqual([]);
    });
  });

  describe('rating null 유지', () => {
    it('rating 값이 있으면 그대로 유지한다', () => {
      const result = mapGameDetail(makeRaw({ rating: 9.5 }));
      expect(result.rating).toBe(9.5);
    });

    it('rating이 null이면 null로 유지한다(0으로 대체하지 않음)', () => {
      const result = mapGameDetail(makeRaw({ rating: null }));
      expect(result.rating).toBeNull();
    });
  });

  describe('priceInfo 매핑', () => {
    it('price_info 하위 키를 camelCase로 매핑한다', () => {
      const result = mapGameDetail(makeRaw());
      expect(result.priceInfo).toEqual({
        originalPrice: 64800,
        salePrice: 45360,
        discountRate: 30,
      });
    });

    it('salePrice가 null이면 null로 유지한다(미할인)', () => {
      const result = mapGameDetail(
        makeRaw({
          price_info: {
            original_price: 64800,
            sale_price: null,
            discount_rate: 0,
          },
        }),
      );
      expect(result.priceInfo.salePrice).toBeNull();
      expect(result.priceInfo.originalPrice).toBe(64800);
      expect(result.priceInfo.discountRate).toBe(0);
    });
  });

  describe('systemRequirements 매핑', () => {
    it('minimum/recommended 사양을 항목별로 camelCase 없이(동일 키) 매핑한다', () => {
      const result = mapGameDetail(makeRaw());
      expect(result.systemRequirements.minimum).toEqual({
        os: 'Windows 10',
        processor: 'Intel i5-8400',
        memory: '12 GB RAM',
        graphics: 'GTX 1060',
        storage: '60 GB',
      });
      expect(result.systemRequirements.recommended.os).toBe('Windows 11');
      expect(result.systemRequirements.recommended.graphics).toBe('RTX 2060');
    });
  });

  describe('similarGames / developerGames 매핑', () => {
    it('카드 섹션 항목의 game_id/thumbnail_url을 camelCase로 매핑한다', () => {
      const result = mapGameDetail(makeRaw());
      expect(result.similarGames).toEqual([
        {
          gameId: 7,
          title: '다크 소울 3',
          thumbnailUrl: 'https://cdn.example/ds3.jpg',
          genres: ['액션'],
          rating: 9.0,
        },
      ]);
      expect(result.developerGames[0].gameId).toBe(8);
      expect(result.developerGames[0].thumbnailUrl).toBe(
        'https://cdn.example/sekiro.jpg',
      );
    });

    it('카드 섹션 항목의 rating null도 유지한다', () => {
      const result = mapGameDetail(
        makeRaw({
          similar_games: [
            {
              game_id: 9,
              title: '평점 없는 게임',
              thumbnail_url: 'https://cdn.example/none.jpg',
              genres: [],
              rating: null,
            },
          ],
        }),
      );
      expect(result.similarGames[0].rating).toBeNull();
    });

    it('카드 섹션이 빈 배열이면 빈 배열로 매핑한다', () => {
      const result = mapGameDetail(
        makeRaw({ similar_games: [], developer_games: [] }),
      );
      expect(result.similarGames).toEqual([]);
      expect(result.developerGames).toEqual([]);
    });
  });

  describe('ai_match / review_stats 매핑 (갭 C·D, UI 미표시지만 매핑은 수행)', () => {
    it('ai_match를 camelCase 도메인 타입으로 매핑한다', () => {
      const result = mapGameDetail(makeRaw());
      expect(result.aiMatch).toEqual({
        matchRate: 87,
        reasonSummary: '선호 장르와 난이도가 잘 맞습니다',
      });
    });

    it('review_stats를 camelCase 도메인 타입으로 매핑한다', () => {
      const result = mapGameDetail(makeRaw());
      expect(result.reviewStats).toEqual({
        positiveRate: 92,
        totalCount: 10000,
      });
    });

    it('ai_match가 null이면 null로 매핑한다', () => {
      const result = mapGameDetail(makeRaw({ ai_match: null }));
      expect(result.aiMatch).toBeNull();
    });

    it('review_stats가 null이면 null로 매핑한다', () => {
      const result = mapGameDetail(makeRaw({ review_stats: null }));
      expect(result.reviewStats).toBeNull();
    });

    it('ai_match가 undefined(미제공)면 null로 매핑한다', () => {
      const result = mapGameDetail(makeRaw({ ai_match: undefined }));
      expect(result.aiMatch).toBeNull();
    });

    it('review_stats가 undefined(미제공)면 null로 매핑한다', () => {
      const result = mapGameDetail(makeRaw({ review_stats: undefined }));
      expect(result.reviewStats).toBeNull();
    });
  });
});
