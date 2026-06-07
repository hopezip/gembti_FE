import { http, HttpResponse } from 'msw';

// 한시적 수동 작성 핸들러 (SEARCH-FE-001).
// 백엔드 계약 확정 후 /api-sync 자동 생성 핸들러로 교체 예정.

export interface MockGame {
  id: string;
  title: string;
  genres: string[];
  tags: string[];
  rating: number | null;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  koreanSub: boolean;
  playerModes: string[];
  // 커버 이미지 URL. 백엔드 자산 확정 전까지 optional — 없으면 프론트가 그라데이션 placeholder로 대체한다.
  coverImageUrl?: string;
}

const MOCK_GAMES: MockGame[] = [
  {
    id: '1',
    title: '게임 타이틀 01',
    genres: ['RPG'],
    tags: ['오픈월드'],
    rating: 4.8,
    price: 55000,
    salePrice: null,
    onSale: false,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '2',
    title: '게임 타이틀 02',
    genres: ['RPG', '액션'],
    tags: ['오픈월드'],
    rating: 4.8,
    price: 49900,
    salePrice: 24950,
    onSale: true,
    koreanSub: true,
    playerModes: ['싱글플레이어', '협동'],
  },
  {
    id: '3',
    title: '게임 타이틀 03',
    genres: ['액션', 'RPG'],
    tags: ['다크 판타지'],
    rating: 4.7,
    price: 39900,
    salePrice: null,
    onSale: false,
    koreanSub: false,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '4',
    title: '게임 타이틀 04',
    genres: ['오픈월드'],
    tags: ['잔잔한'],
    rating: 4.6,
    price: 29900,
    salePrice: null,
    onSale: false,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '5',
    title: '게임 타이틀 05',
    genres: ['RPG', '액션'],
    tags: ['협동'],
    rating: 4.6,
    price: 59900,
    salePrice: 29950,
    onSale: true,
    koreanSub: true,
    playerModes: ['협동', '온라인 멀티'],
  },
  {
    id: '6',
    title: '게임 타이틀 06',
    genres: ['RPG', '오픈월드'],
    tags: ['스토리 중심'],
    rating: 4.5,
    price: 45000,
    salePrice: null,
    onSale: false,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '7',
    title: '게임 타이틀 07',
    genres: ['액션', '어드벤처'],
    tags: ['오픈월드'],
    rating: 4.5,
    price: 35000,
    salePrice: null,
    onSale: false,
    koreanSub: false,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '8',
    title: '게임 타이틀 08',
    genres: ['RPG', '판타지'],
    tags: ['로그라이크'],
    rating: 4.4,
    price: 25000,
    salePrice: 12500,
    onSale: true,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '9',
    title: '게임 타이틀 09',
    genres: ['RPG', '오픈월드'],
    tags: ['스토리 중심'],
    rating: 4.4,
    price: 42000,
    salePrice: null,
    onSale: false,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '10',
    title: '게임 타이틀 10',
    genres: ['액션', 'RPG'],
    tags: ['협동'],
    rating: 4.3,
    price: 32000,
    salePrice: null,
    onSale: false,
    koreanSub: false,
    playerModes: ['협동', '온라인 멀티'],
  },
  {
    id: '11',
    title: '게임 타이틀 11',
    genres: ['RPG', 'SF'],
    tags: ['오픈월드'],
    rating: 4.3,
    price: 55000,
    salePrice: 27500,
    onSale: true,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '12',
    title: '게임 타이틀 12',
    genres: ['오픈월드', '액션'],
    tags: ['다크 판타지'],
    rating: 4.2,
    price: 29000,
    salePrice: null,
    onSale: false,
    koreanSub: false,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '13',
    title: '게임 타이틀 13',
    genres: ['어드벤처'],
    tags: ['잔잔한', '스토리 중심'],
    rating: 4.1,
    price: 19900,
    salePrice: null,
    onSale: false,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '14',
    title: '게임 타이틀 14',
    genres: ['FPS', '액션'],
    tags: ['온라인 멀티'],
    rating: 4.0,
    price: 45000,
    salePrice: 22500,
    onSale: true,
    koreanSub: false,
    playerModes: ['온라인 멀티'],
  },
  {
    id: '15',
    title: '게임 타이틀 15',
    genres: ['전략', 'RPG'],
    tags: ['협동'],
    rating: 3.9,
    price: 35000,
    salePrice: null,
    onSale: false,
    koreanSub: true,
    playerModes: ['싱글플레이어', '협동'],
  },
  {
    id: '16',
    title: '게임 타이틀 16',
    genres: ['RPG', '판타지'],
    tags: ['오픈월드'],
    rating: 3.8,
    price: 15000,
    salePrice: null,
    onSale: false,
    koreanSub: false,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '17',
    title: '게임 타이틀 17',
    genres: ['어드벤처', '퍼즐'],
    tags: ['잔잔한'],
    rating: null,
    price: 12900,
    salePrice: null,
    onSale: false,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
  {
    id: '18',
    title: '게임 타이틀 18',
    genres: ['액션', 'RPG'],
    tags: ['다크 판타지', '오픈월드'],
    rating: 4.7,
    price: 65000,
    salePrice: 32500,
    onSale: true,
    koreanSub: true,
    playerModes: ['싱글플레이어', '협동'],
  },
  {
    id: '19',
    title: '게임 타이틀 19',
    genres: ['전략'],
    tags: ['협동', '온라인 멀티'],
    rating: 4.2,
    price: 28000,
    salePrice: null,
    onSale: false,
    koreanSub: false,
    playerModes: ['협동', '온라인 멀티'],
  },
  {
    id: '20',
    title: '게임 타이틀 20',
    genres: ['RPG'],
    tags: ['오픈월드', '스토리 중심'],
    rating: 4.9,
    price: 59900,
    salePrice: 35940,
    onSale: true,
    koreanSub: true,
    playerModes: ['싱글플레이어'],
  },
];

export const MOCK_GENRES = [
  { label: 'RPG', count: 428 },
  { label: '액션', count: 312 },
  { label: '어드벤처', count: 186 },
  { label: 'FPS', count: 141 },
  { label: '전략', count: 98 },
  { label: '시뮬레이션', count: 73 },
  { label: '퍼즐', count: 55 },
];

export const MOCK_TAGS = [
  { label: '오픈월드', count: 247 },
  { label: '다크 판타지', count: 112 },
  { label: '잔잔한', count: 68 },
  { label: '스토리 중심', count: 203 },
  { label: '협동', count: 156 },
  { label: '로그라이크', count: 94 },
  { label: 'SF', count: 81 },
];

export const MOCK_PLAYER_MODES = ['싱글플레이어', '협동', '온라인 멀티'];

const SEARCH_PAGE_SIZE = 12;
// 더 보기(12개씩) 시연을 위해 검색 매칭 풀을 순환해 합성하는 총 결과 수.
// 12×3 + 4 = 40 → 더 보기 3회 시연 가능. 백엔드 연결 시 실제 total_count로 대체된다.
const SEARCH_TOTAL = 40;

// price_info.discount_rate 파생값 — salePrice가 있으면 할인율(%), 없으면 0.
function discountRate(price: number, salePrice: number | null): number {
  if (salePrice == null || price <= 0) return 0;
  return Math.round((1 - salePrice / price) * 100);
}

export const gameHandlers = [
  // SEARCH-FE-001 게임 검색 — 백엔드 계약(GET /api/v1/games/search, 인증 불필요, snake_case).
  // 응답은 status/data 래핑 + price_info 객체. 한시적 수동 핸들러 — Swagger 확정 후 /api-sync로 교체.
  // ⚠️ 계약 응답엔 genres만 있으나, FE 클라이언트 필터(장르·태그 AND)를 위해 tags도 함께 내려준다.
  //    백엔드 search 응답에 tags 필드 추가가 필요하다(회고/PR에 명시).
  http.get('*/api/v1/games/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase().trim() ?? '';
    // page/limit는 잘못된 값(빈값·문자·음수)이 들어와도 NaN으로 slice가 깨지지 않게 정규화한다.
    const pageRaw = Number(url.searchParams.get('page'));
    const page =
      Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
    const limitRaw = Number(url.searchParams.get('limit'));
    const limit =
      Number.isFinite(limitRaw) && limitRaw >= 1
        ? Math.floor(limitRaw)
        : SEARCH_PAGE_SIZE;

    // 제목/장르/태그 부분일치. q가 없으면 전체를 매칭 풀로 사용한다.
    const matched = q
      ? MOCK_GAMES.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.genres.some((genre) => genre.toLowerCase().includes(q)) ||
            g.tags.some((tag) => tag.toLowerCase().includes(q)),
        )
      : MOCK_GAMES;

    // 매칭 0건 → 검색 실패(SEARCH-FE-004, EmptyState 시연).
    if (matched.length === 0) {
      return HttpResponse.json({
        status: 'SUCCESS',
        data: { games: [], total_count: 0, has_more: false },
      });
    }

    // 매칭 풀을 순환해 SEARCH_TOTAL건으로 합성(더 보기 시연용).
    const pool = Array.from({ length: SEARCH_TOTAL }, (_, i) => {
      const base = matched[i % matched.length];
      return {
        game_id: i + 1,
        title: base.title,
        thumbnail_url: base.coverImageUrl ?? '',
        genres: base.genres,
        tags: base.tags,
        rating: base.rating,
        price_info: {
          original_price: base.price,
          sale_price: base.salePrice,
          discount_rate: discountRate(base.price, base.salePrice),
        },
      };
    });

    const start = (page - 1) * limit;
    const games = pool.slice(start, start + limit);

    return HttpResponse.json({
      status: 'SUCCESS',
      data: {
        games,
        total_count: SEARCH_TOTAL,
        has_more: start + limit < SEARCH_TOTAL,
      },
    });
  }),

  // SEARCH-FE-003 검색 필터 옵션 — 백엔드 계약(GET /api/v1/games/filter-options, 인증 불필요).
  // 장르·태그 목록(+가격대·플레이모드)을 제공. 칩은 장르·태그만 사용하지만 계약 형태는 그대로 둔다.
  http.get('*/api/v1/games/filter-options', () => {
    return HttpResponse.json({
      status: 'SUCCESS',
      data: {
        genres: MOCK_GENRES.map((g) => g.label),
        tags: MOCK_TAGS.map((t) => t.label),
        price_ranges: [
          { label: '무료', min: 0, max: 0 },
          { label: '1만원 이하', min: 1, max: 10000 },
          { label: '1만원~3만원', min: 10000, max: 30000 },
          { label: '3만원 이상', min: 30000, max: -1 },
        ],
        play_modes: [
          { value: 'SINGLE', label: '싱글플레이' },
          { value: 'MULTI', label: '멀티플레이' },
          { value: 'CO_OP', label: '협동플레이' },
        ],
      },
    });
  }),

  // MAIN-FE-003 비로그인 홈 — 배너 + 신규 + 인기를 한 응답으로 제공한다.
  // 백엔드 계약(GET /api/v1/home/guest, 인증 불필요, snake_case)에 맞춘 한시적 수동 핸들러.
  // 백엔드 계약 확정 후 /api-sync 자동 생성물로 교체.
  http.get('*/api/v1/home/guest', () => {
    // 평점이 있는 게임만 추천 풀로 사용(★ 0.0 placeholder 방지) + 평점 내림차순.
    const byRating = MOCK_GAMES.filter((g) => g.rating != null).sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    );

    // 인기(trending) — 더 보기(12개씩) 시연을 위해 36건 합성(평점순 순환).
    const trending_games = Array.from({ length: 36 }, (_, i) => {
      const base = byRating[i % byRating.length];
      return {
        game_id: i + 1,
        title: `게임 타이틀 ${String(i + 1).padStart(2, '0')}`,
        thumbnail_url: base.coverImageUrl ?? '',
        genres: base.genres,
        rating: base.rating ?? 0,
      };
    });

    // 신규(new_releases) — 더 보기(12개씩) 시연을 위해 36건 합성(평점순 순환).
    // ⚠️ 실제 "이번 주 신규"는 소수일 수 있음 — 백엔드 연결 시 실제 건수로 대체된다.
    const new_releases = Array.from({ length: 36 }, (_, i) => {
      const base = byRating[i % byRating.length];
      return {
        game_id: 200 + i + 1,
        title: `신규 타이틀 ${String(i + 1).padStart(2, '0')}`,
        thumbnail_url: base.coverImageUrl ?? '',
        genres: base.genres,
        rating: base.rating ?? 0,
        is_new: true,
      };
    });

    return HttpResponse.json({
      status: 'SUCCESS',
      data: {
        curation_banner: {
          main_copy: '당신의 다음 인생 게임을 찾아보세요',
          sub_copy: 'AI가 당신의 취향을 분석해 완벽한 게임을 추천해드려요',
          button_text: '게임 찾기',
          background_image_url: '',
        },
        new_releases,
        trending_games,
      },
    });
  }),

  // MAIN-FE-006 개인화 홈(로그인+설문완료) — 1순위 추천 + 성향태그 + 추천 그리드 + 신규를 한 응답으로 제공한다.
  // 백엔드 계약(GET /api/v1/home/personalized, 인증✅, snake_case)에 맞춘 한시적 수동 핸들러.
  // ⚠️ 설문 완료 플래그(has_completed_survey)는 로그인/회원가입 응답에 가정한 필드다(auth 핸들러 참고).
  //    이 핸들러 자체는 인증 가드를 두지 않는다(mock 단순화) — 진입 분기는 프론트 authStore가 담당한다.
  // 백엔드 계약 확정 후 /api-sync 자동 생성물로 교체.
  http.get('*/api/v1/home/personalized', () => {
    // 평점이 있는 게임만 추천 풀로 사용(★ 0.0 placeholder 방지) + 평점 내림차순.
    const byRating = MOCK_GAMES.filter((g) => g.rating != null).sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    );

    // 매칭률 데모용 reason 태그라인 풀(유사 게임 비교 톤).
    const reasonPool = [
      '엘든 링 ★5와 유사',
      '발더스 게이트 취향과 일치',
      '다크 판타지 톤이 비슷해요',
      '오픈월드 RPG 선호도 반영',
      '스토리 중심 취향과 맞아요',
    ];

    // 추천 그리드 — 더 보기(12개씩) 시연을 위해 30건 합성. 매칭률은 96%에서 1%씩 하강(현실적 분포).
    const recommended_games = Array.from({ length: 30 }, (_, i) => {
      const base = byRating[i % byRating.length];
      return {
        game_id: 300 + i + 1,
        title: `추천 타이틀 ${String(i + 1).padStart(2, '0')}`,
        thumbnail_url: base.coverImageUrl ?? '',
        genres: base.genres,
        rating: base.rating ?? 0,
        match_rate: Math.max(60, 96 - i),
        reason_tagline: reasonPool[i % reasonPool.length],
      };
    });

    // 신규 — 비회원과 동일 형태(매칭률·태그라인 없음). 더 보기 시연 위해 24건 합성.
    const new_releases = Array.from({ length: 24 }, (_, i) => {
      const base = byRating[i % byRating.length];
      return {
        game_id: 400 + i + 1,
        title: `신규 타이틀 ${String(i + 1).padStart(2, '0')}`,
        thumbnail_url: base.coverImageUrl ?? '',
        genres: base.genres,
        rating: base.rating ?? 0,
        is_new: true,
      };
    });

    return HttpResponse.json({
      status: 'SUCCESS',
      data: {
        top_recommendation: {
          game_id: 301,
          title: '추천 타이틀 01',
          match_rate: 94,
          reason_summary:
            '오픈월드 RPG · 다크 판타지 취향에 기반. ★5점 게임 3개와 톤이 가장 유사해요.',
          background_url: '',
        },
        user_interest_tags: [
          '오픈월드',
          'RPG',
          '다크 판타지',
          '스토리 중심',
          '싱글플레이어',
        ],
        // REC-FE-002 보강: 추천 페이지 Hero의 "새로운 도전" 칩·두 그룹 캡션·마지막 업데이트 표기 (additive, 기존 필드 무변경).
        recommendation_profile: {
          challenge_tags: ['로그라이크', '전략 시뮬', '대전 격투', '서바이벌'],
          liked_meta: '★4+ 게임 23개에서 추출',
          challenge_meta: '새로운 도전 거리로 추천',
          last_updated_text: '2일 전',
        },
        recommended_games,
        new_releases,
      },
    });
  }),
];
