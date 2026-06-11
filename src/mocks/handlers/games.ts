import { http, HttpResponse, passthrough } from 'msw';

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

  // 게스트 홈 인기·신규는 실서버(games/trending·new-releases)를 그대로 쓴다(passthrough, API-SYNC-FE-001).
  //   ⚠️ 아래 '*/api/v1/games/:id'(상세) 핸들러가 'trending'/'new-releases'를 게임 id로 오인해 404를 주므로,
  //   그보다 먼저 명시적 passthrough를 등록해 실서버로 보낸다(onUnhandledRequest:'bypass'만으론 가로채짐).
  http.get('*/api/v1/games/trending', () => passthrough()),
  http.get('*/api/v1/games/new-releases', () => passthrough()),

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

  // REC-DET-FE-001 게임 상세 — 백엔드 계약(GET /api/v1/games/{gameId}, 인증 불필요, snake_case).
  // 응답은 status/data 래핑 + price_info 객체. 한시적 수동 핸들러 — Swagger 확정 후 /api-sync로 교체.
  // snake_case 필드는 gameDetail.ts(GameDetailRaw)의 camel 도메인 타입과 1:1 대응한다.
  http.get('*/api/v1/games/:id', ({ params }) => {
    const id = String(params.id);
    const numId = Number(id);
    // 실제 MOCK_GAMES id 우선. 없으면 합성 id(인기 i+1·신규 200+·추천 300+·개인화 400+·검색 i+1)도
    // MOCK_GAMES로 순환 매핑해 상세를 제공한다 — 메인/검색 카드의 상세 진입점이 mock에서 404로 깨지는 것을 방지.
    const base =
      MOCK_GAMES.find((g) => g.id === id) ??
      (Number.isFinite(numId) && numId > 0
        ? MOCK_GAMES[(numId - 1) % MOCK_GAMES.length]
        : undefined);

    // 매핑조차 불가한 id(NaN·0·음수) → NOT_FOUND + 404(상세 에러 분기 시연).
    if (!base) {
      return HttpResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    }

    // 카드 섹션(유사 게임·개발사의 다른 게임) 합성 — MOCK_GAMES를 순환해 각 8건 이상.
    // 4개+더보기 누적 시연용(상세 그리드 pageSize=4). 자기 자신은 제외하고 채운다.
    const pool = MOCK_GAMES.filter((g) => g.id !== id);
    const buildSummaries = (offset: number) =>
      Array.from({ length: 8 }, (_, i) => {
        const g = pool[(i + offset) % pool.length];
        return {
          game_id: Number(g.id),
          title: g.title,
          thumbnail_url:
            g.coverImageUrl ??
            `https://picsum.photos/seed/game-${g.id}/320/200`,
          genres: g.genres,
          rating: g.rating,
        };
      });

    // theme_image_url/banner_url은 일부 게임(id 1·3)만 채워 fallback 시연 — 나머지는 빈 문자열.
    // 백엔드 자산 확정 전까지 한시적으로 picsum placeholder 사용(실서버는 실제 CDN URL).
    const themeImageUrl =
      id === '1' || id === '3'
        ? `https://picsum.photos/seed/theme-${id}/1280/480`
        : '';
    const bannerUrl =
      id === '1' || id === '2'
        ? `https://picsum.photos/seed/banner-${id}/1280/480`
        : '';

    // 스크린샷 placeholder 2~4개(id 기준 가변) + 트레일러 썸네일 placeholder.
    const shotCount = 2 + (Number(id) % 3); // 2~4
    const screenshotUrls = Array.from(
      { length: shotCount },
      (_, i) => `https://picsum.photos/seed/shot-${id}-${i + 1}/640/360`,
    );

    return HttpResponse.json({
      status: 'SUCCESS',
      data: {
        game_id: Number(base.id),
        title: base.title,
        description: `${base.title}의 한 줄 요약 소개입니다. ${base.genres.join(' · ')} 장르의 대표작.`,
        full_description: `${base.title}은(는) ${base.genres.join(', ')} 장르를 아우르는 작품으로, ${base.tags.join(', ')} 같은 특징을 담았습니다. 깊이 있는 스토리와 탄탄한 게임플레이로 호평을 받았으며, 전체 소개에서는 세계관·주요 시스템·플레이 방식을 자세히 다룹니다. 더 보기를 펼치면 추가 설명이 표시됩니다.`,
        genres: base.genres,
        tags: base.tags,
        rating: base.rating,
        review_count: 1284,
        price_info: {
          original_price: base.price,
          sale_price: base.salePrice,
          discount_rate: discountRate(base.price, base.salePrice),
        },
        developer: `${base.title} 스튜디오`,
        publisher: 'GamBTI 퍼블리싱',
        release_date: '2024-03-15',
        thumbnail_url:
          base.coverImageUrl ??
          `https://picsum.photos/seed/game-${base.id}/640/400`,
        theme_image_url: themeImageUrl,
        banner_url: bannerUrl,
        screenshot_urls: screenshotUrls,
        trailer_url: `https://picsum.photos/seed/trailer-${id}/640/360`,
        system_requirements: {
          minimum: {
            os: 'Windows 10 64-bit',
            processor: 'Intel Core i5-4460 / AMD FX-6300',
            memory: '8 GB RAM',
            graphics: 'NVIDIA GTX 760 / AMD R7 260x',
            storage: '50 GB 사용 가능 공간',
          },
          recommended: {
            os: 'Windows 11 64-bit',
            processor: 'Intel Core i7-8700 / AMD Ryzen 5 3600',
            memory: '16 GB RAM',
            graphics: 'NVIDIA RTX 2060 / AMD RX 5700',
            storage: '50 GB SSD',
          },
        },
        audio_languages: base.koreanSub
          ? ['한국어', '영어', '일본어']
          : ['영어', '일본어'],
        interface_languages: ['한국어', '영어', '일본어', '중국어(간체)'],
        // 플레이 모드는 코드(value) 배열로 내려준다(SINGLE/CO_OP/MULTI). 라벨 변환은 화면단.
        play_modes:
          base.playerModes.length > 1
            ? ['SINGLE', 'CO_OP', 'MULTI']
            : ['SINGLE'],
        korean_sub: base.koreanSub,
        age_rating: '15세 이용가',
        on_sale: base.onSale,
        similar_games: buildSummaries(0),
        developer_games: buildSummaries(3),
        // 갭 C — ai_match(매칭률). gameDetail.ts는 match_rate/reason_summary만 매핑(나머지는 보강 필드).
        ai_match: {
          match_rate: 92,
          score: 92,
          reason_summary:
            '오픈월드 RPG 선호도와 다크 판타지 톤이 취향과 일치해요.',
          reason: '오픈월드 RPG 선호도와 다크 판타지 톤이 취향과 일치해요.',
          match_tags: base.tags.length ? base.tags : ['오픈월드', 'RPG'],
        },
        // 갭 D — review_stats(리뷰 통계). gameDetail.ts는 positive_rate/total_count만 매핑(나머지는 보강 필드).
        review_stats: {
          average: base.rating ?? 0,
          total_count: 1284,
          positive_rate: 94,
          distribution: { 5: 720, 4: 360, 3: 140, 2: 40, 1: 24 },
        },
      },
    });
  }),
];
