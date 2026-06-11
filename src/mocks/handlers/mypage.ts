import { http, HttpResponse } from 'msw';

// 한시적 수동 작성 핸들러 (MYPAGE-FE-001).
// 백엔드 계약 확정 후 /api-sync 자동 생성 핸들러로 교체 예정.

export interface MockUserProfile {
  id: string;
  nickname: string;
  handle: string;
  avatarUrl: string | null;
  joinedAt: string;
  isPublic: boolean;
  steamConnected: boolean;
  steamId: string | null;
  steamNickname: string | null;
  steamSyncedAt: string | null;
  email: string;
  birthdate: string;
  gender: '남성' | '여성' | '기타' | null;
  bio: string;
  website: string | null;
  favoriteGenres: string[];
  stats: {
    following: number;
    followers: number;
    totalPlayHours: number;
    reviewCount: number;
  };
  personality: {
    label: string;
    value: number; // 0~10
  }[];
}

export interface MockFollowUser {
  id: string;
  nickname: string;
  handle: string;
  avatarColor: string;
  bio: string;
  genres: string[];
  isMutualFollow: boolean;
  isFollowing: boolean;
}

export interface MockWishlistItem {
  id: string;
  title: string;
  genres: string[];
  price: number;
  salePrice: number | null;
  onSale: boolean;
  addedAt: string;
}

export interface MockLibraryItem {
  id: string;
  title: string;
  genres: string[];
  playHours: number;
  myRating: number | null;
  status: 'unplayed' | 'playing' | 'cleared' | 'dropped';
  lastPlayedAt: string | null;
}

export interface MockReviewItem {
  id: string;
  gameTitle: string;
  content: string;
  rating: number;
  likeCount: number;
  createdAt: string;
}

export interface MockChatItem {
  id: string;
  gameTitle: string;
  preview: string;
  participants: number;
  isActive: boolean;
  updatedAt: string;
}

export interface MockNotification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'system';
  message: string;
  isRead: boolean;
  createdAt: string;
}

const MOCK_PROFILE: MockUserProfile = {
  id: 'user-1',
  nickname: '유저닉네임_나',
  handle: 'my_handle',
  avatarUrl: null,
  joinedAt: '2024.11',
  isPublic: true,
  steamConnected: true,
  steamId: 'My_Steam_ID',
  steamNickname: 'My_Steam_ID',
  steamSyncedAt: '2025-05-28T10:30:00Z',
  email: 'my_email@example.com',
  birthdate: '1995-05-14',
  gender: '남성',
  bio: '오픈 월드 RPG 중독자. 퀘스트 100% 클리어가 목표.',
  website: null,
  favoriteGenres: ['RPG', '인디', '오픈 월드'],
  stats: {
    following: 147,
    followers: 38,
    totalPlayHours: 1284,
    reviewCount: 12,
  },
  personality: [
    { label: '탐험', value: 9 },
    { label: '액션', value: 8 },
    { label: '서사', value: 6 },
    { label: '전략', value: 5 },
    { label: '도전', value: 4 },
    { label: '합동', value: 3 },
  ],
};

const MOCK_WISHLIST: MockWishlistItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: `wish-${i + 1}`,
  title: `위시리스트 0${i + 1}`,
  genres: [['RPG', '액션', 'FPS', '전략', '어드벤처', '시뮬레이션'][i % 6]],
  price: [66000, 57000, 55000, 57000, 22000, 65000][i],
  salePrice: i === 1 ? 40000 : null,
  onSale: i === 1,
  addedAt: `2026-0${i + 1}-28`,
}));

const MOCK_LIBRARY: MockLibraryItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `lib-${i + 1}`,
  title: `게임 타이틀 ${String(i + 1).padStart(2, '0')}`,
  genres: [
    [
      'RPG',
      '액션',
      'FPS',
      '전략',
      '어드벤처',
      '시뮬',
      'RPG',
      '액션',
      'FPS',
      '전략',
      '어드벤처',
      '시뮬',
    ][i],
  ],
  playHours: [2.4, 134.7, 18.1, 0, 8.4, 39.5, 47.2, 0, 95.2, 312.4, 31.8, 0][i],
  myRating: [4.5, 5.0, 4.0, null, 3.0, 4.3, 4.2, null, 6.2, 4.8, 4.5, null][i],
  status: (
    [
      'playing',
      'playing',
      'cleared',
      'unplayed',
      'playing',
      'playing',
      'playing',
      'unplayed',
      'playing',
      'playing',
      'playing',
      'dropped',
    ] as const
  )[i],
  lastPlayedAt:
    i === 3 || i === 7 || i === 11 ? null : `2026-0${(i % 5) + 1}-15`,
}));

const MOCK_REVIEWS: MockReviewItem[] = [
  {
    id: 'r1',
    gameTitle: '게임 타이틀 01',
    content: '생각보다 전혀 않다고 전도전, 강추 추천',
    rating: 4.5,
    likeCount: 24,
    createdAt: '2026-05-15',
  },
  {
    id: 'r2',
    gameTitle: '게임 타이틀 02',
    content: '귀뚜라 선과, 후 반 추천 당신도 즐거버인 물락',
    rating: 3.8,
    likeCount: 44,
    createdAt: '2026-05-08',
  },
  {
    id: 'r3',
    gameTitle: '게임 타이틀 03',
    content: '무닌한 색상 주주의 당신도 즐기시는 물락',
    rating: 4.2,
    likeCount: 8,
    createdAt: '2026-05-01',
  },
];

const MOCK_CHATS: MockChatItem[] = [
  {
    id: 'c1',
    gameTitle: '게임 타이틀 01',
    preview: '[게임 타이틀 01] 보스 레이드 같이 가실 분',
    participants: 15,
    isActive: true,
    updatedAt: '2026-05-20',
  },
  {
    id: 'c2',
    gameTitle: '게임 타이틀 01',
    preview: '[게임 타이틀 01] 이번 주 파 추천 단곡 클리어 팀원',
    participants: 8,
    isActive: false,
    updatedAt: '2026-05-15',
  },
];

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    type: 'follow',
    message: '유저닉네임_02 님이 나 라이프에 댓글을 달았어요.',
    isRead: false,
    createdAt: '2026-05-28',
  },
  {
    id: 'n2',
    type: 'like',
    message: '내가 모집한 파티에 1명이 참여 신청했어요.',
    isRead: false,
    createdAt: '2026-05-27',
  },
  {
    id: 'n3',
    type: 'system',
    message: 'Steam 라이브러리/데이터가 자동 동기화(v2)됐습니다.',
    isRead: true,
    createdAt: '2026-05-26',
  },
  {
    id: 'n4',
    type: 'comment',
    message: '취향에 맞는 친구 추천 한도 6시간이 도착했어요.',
    isRead: true,
    createdAt: '2026-05-25',
  },
];

const MOCK_FOLLOWING: MockFollowUser[] = [
  {
    id: 'u2',
    nickname: '스팀헌터',
    handle: 'steamhunter',
    avatarColor: '#4A7C59',
    bio: '게임 세일 정보 수집가. 스팀 위시리스트 분석 전문. 할인 정보는 저한테 물어보세요.',
    genres: ['RPG', '전략', '세일헌터'],
    isMutualFollow: true,
    isFollowing: true,
  },
  {
    id: 'u3',
    nickname: '인디러버',
    handle: 'indie_lover',
    avatarColor: '#7C4A6E',
    bio: '인디 게임 전문 리뷰어. 숨겨진 명작 발굴이 취미. 스팀 리뷰 300개 돌파.',
    genres: ['인디', '퍼즐', '픽셀아트'],
    isMutualFollow: true,
    isFollowing: true,
  },
  {
    id: 'u4',
    nickname: '나이트크롤러',
    handle: 'nightcrawler',
    avatarColor: '#2D4A6E',
    bio: '야간 전용 게이머. 호러와 서바이벌 장르 위주 플레이. 무서울수록 좋음.',
    genres: ['호러', '서바이벌', '어드벤처'],
    isMutualFollow: true,
    isFollowing: true,
  },
  {
    id: 'u5',
    nickname: '프로게이머99',
    handle: 'progamer99',
    avatarColor: '#6E4A2D',
    bio: '전직 프로게이머. 현재 스트리머 활동 중. FPS와 MOBA 전문 해설.',
    genres: ['FPS', 'MOBA', '경쟁'],
    isMutualFollow: false,
    isFollowing: true,
  },
  {
    id: 'u6',
    nickname: 'RPG퀘스트',
    handle: 'rpg_quest',
    avatarColor: '#4A2D6E',
    bio: '오픈월드 RPG 중독자. 퀘스트 100% 완료가 목표. The Witcher 3 올클리어.',
    genres: ['RPG', '오픈월드', '스토리'],
    isMutualFollow: false,
    isFollowing: true,
  },
  {
    id: 'u7',
    nickname: '잼블리',
    handle: 'gambly_',
    avatarColor: '#2D6E4A',
    bio: '가볍게 즐기는 캐주얼 게임 애호가. 힐링 게임 전문. 모바일도 PC도 좋아요.',
    genres: ['캐주얼', '퍼즐', '힐링'],
    isMutualFollow: true,
    isFollowing: true,
  },
];

const MOCK_FOLLOWERS: MockFollowUser[] = [
  ...MOCK_FOLLOWING.filter((u) => u.isMutualFollow),
  {
    id: 'u8',
    nickname: '게임탐험가',
    handle: 'game_explorer',
    avatarColor: '#6E2D4A',
    bio: '새로운 장르 탐험이 즐거움. 알려지지 않은 숨겨진 게임 전문가.',
    genres: ['어드벤처', '인디', '탐험'],
    isMutualFollow: false,
    isFollowing: false,
  },
];

export const mypageHandlers = [
  http.get('*/api/v1/users/check-nickname', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname') ?? '';
    // 현재 사용 중인 닉네임은 중복으로 처리
    const takenNicknames = [MOCK_PROFILE.nickname];
    const available =
      nickname.trim().length >= 2 && !takenNicknames.includes(nickname.trim());
    return HttpResponse.json({ available });
  }),

  http.get('*/api/v1/users/check-email', ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') ?? '';
    // 현재 가입된 이메일은 중복으로 처리 (check-nickname 대칭, LOGIN-FE-012)
    const takenEmails = [MOCK_PROFILE.email];
    const available =
      email.trim().length > 0 && !takenEmails.includes(email.trim());
    return HttpResponse.json({ available });
  }),

  http.get('*/api/v1/mypage/profile', () => {
    return HttpResponse.json(MOCK_PROFILE);
  }),

  http.patch('*/api/v1/mypage/profile', async ({ request }) => {
    const patch = (await request.json()) as Partial<MockUserProfile>;
    Object.assign(MOCK_PROFILE, patch);
    return HttpResponse.json(MOCK_PROFILE);
  }),

  http.post('*/api/v1/mypage/steam/sync', async () => {
    await new Promise((r) => setTimeout(r, 1500));
    MOCK_PROFILE.steamSyncedAt = new Date().toISOString();
    return HttpResponse.json(MOCK_PROFILE);
  }),

  http.post('*/api/v1/mypage/steam/disconnect', () => {
    MOCK_PROFILE.steamConnected = false;
    MOCK_PROFILE.steamId = null;
    MOCK_PROFILE.steamNickname = null;
    MOCK_PROFILE.steamSyncedAt = null;
    return HttpResponse.json(MOCK_PROFILE);
  }),

  http.get('*/api/v1/mypage/wishlist', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = 6;
    const start = (page - 1) * pageSize;
    const items = MOCK_WISHLIST.slice(start, start + pageSize);
    return HttpResponse.json({
      total: MOCK_WISHLIST.length,
      items,
      hasMore: start + pageSize < MOCK_WISHLIST.length,
    });
  }),

  http.get('*/api/v1/mypage/library', ({ request }) => {
    const url = new URL(request.url);
    const genre = url.searchParams.get('genre') ?? '';
    const sort = url.searchParams.get('sort') ?? 'recent';
    const search = url.searchParams.get('search') ?? '';
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = 12;

    const allGenres = [
      ...new Set(MOCK_LIBRARY.flatMap((g) => g.genres)),
    ].sort();

    let filtered = [...MOCK_LIBRARY];

    if (genre) {
      filtered = filtered.filter((g) => g.genres.includes(genre));
    }

    if (search) {
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      if (!a.lastPlayedAt && !b.lastPlayedAt) return 0;
      if (!a.lastPlayedAt) return 1;
      if (!b.lastPlayedAt) return -1;
      const cmp = b.lastPlayedAt.localeCompare(a.lastPlayedAt);
      return sort === 'oldest' ? -cmp : cmp;
    });

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return HttpResponse.json({
      total: filtered.length,
      items,
      hasMore: start + pageSize < filtered.length,
      allGenres,
    });
  }),

  http.get('*/api/v1/mypage/following', () => {
    return HttpResponse.json({ users: MOCK_FOLLOWING });
  }),

  http.get('*/api/v1/mypage/followers', () => {
    return HttpResponse.json({ users: MOCK_FOLLOWERS });
  }),

  http.post('*/api/v1/mypage/follow/:userId', ({ params }) => {
    const user =
      MOCK_FOLLOWING.find((u) => u.id === params.userId) ??
      MOCK_FOLLOWERS.find((u) => u.id === params.userId);
    if (user) user.isFollowing = true;
    return HttpResponse.json({ ok: true });
  }),

  http.delete('*/api/v1/mypage/follow/:userId', ({ params }) => {
    const inFollowing = MOCK_FOLLOWING.find((u) => u.id === params.userId);
    if (inFollowing) inFollowing.isFollowing = false;
    const inFollowers = MOCK_FOLLOWERS.find((u) => u.id === params.userId);
    if (inFollowers) inFollowers.isFollowing = false;
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/api/v1/mypage/activity', () => {
    return HttpResponse.json({
      reviews: MOCK_REVIEWS,
      chats: MOCK_CHATS,
      notifications: MOCK_NOTIFICATIONS,
    });
  }),
];
