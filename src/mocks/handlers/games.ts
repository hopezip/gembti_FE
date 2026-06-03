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

export interface GamesSearchResponse {
  total: number;
  games: MockGame[];
  hasMore: boolean;
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

const MOCK_TOTAL = 1247;
const PAGE_SIZE = 12;

export const gameHandlers = [
  http.get('*/api/games/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const page = Number(url.searchParams.get('page') ?? '1');

    const filtered = q
      ? MOCK_GAMES.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.genres.some((genre) => genre.toLowerCase().includes(q)) ||
            g.tags.some((tag) => tag.toLowerCase().includes(q)),
        )
      : MOCK_GAMES;

    const total = q ? filtered.length : MOCK_TOTAL;
    const start = (page - 1) * PAGE_SIZE;
    const games = filtered.slice(start, start + PAGE_SIZE);

    return HttpResponse.json<GamesSearchResponse>({
      total,
      games,
      hasMore: filtered.length > start + PAGE_SIZE,
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
];
