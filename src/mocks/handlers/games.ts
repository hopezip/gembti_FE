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

export const MOCK_PLAYER_MODES = ['싱글플레이어', '협동', '온라인 멀티'];

export const gameHandlers = [
  // SEARCH-FE-005 게임 검색 — 실서버(GET /api/v1/games/search)를 그대로 쓴다(passthrough).
  //   실 계약은 q·page·sort·genre[]·category[] 쿼리로 서버사이드 필터링하고 categories/genres를 응답한다.
  //   filter-options 엔드포인트는 실서버에 없다 — 장르·카테고리는 고정 enum(filterOptions.ts 정적 상수)을 쓴다.
  http.get('*/api/v1/games/search', () => passthrough()),

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
        // REC-FE-002 보강: 추천 페이지 Hero의 "새로운 도전" 칩과 두 그룹 캡션.
        recommendation_profile: {
          challenge_tags: ['로그라이크', '전략 시뮬', '대전 격투', '서바이벌'],
          liked_meta: '★4+ 게임 23개에서 추출',
          challenge_meta: '새로운 도전 거리로 추천',
        },
        recommended_games,
        new_releases,
      },
    });
  }),

  // 게임 상세는 실서버(GET /api/v1/games/{game_id})를 그대로 쓴다(passthrough, REC-DET-FE-003).
  // 실 계약(categories·developer_games, similar/ai/review 없음)은 gameDetail.ts 매핑과 정합됨(REC-DET-FE-002).
  // ⚠️ search/trending/new-releases passthrough보다 뒤에 둔다 — 그 경로들이 ':id'에 먼저 매칭되지 않도록.
  http.get('*/api/v1/games/:id', () => passthrough()),
];
