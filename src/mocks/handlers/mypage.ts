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
  birthdate: '1995.05.14',
  gender: '남성',
  stats: {
    following: 147,
    followers: 38,
    totalPlayHours: 1284,
    reviewCount: 12,
  },
  personality: [
    { label: '탐험', value: 8 },
    { label: '전략', value: 6 },
    { label: '액션', value: 9 },
    { label: '협동', value: 5 },
    { label: '스토리', value: 7 },
    { label: '경쟁', value: 4 },
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

export const mypageHandlers = [
  http.get('/api/mypage/profile', () => {
    return HttpResponse.json(MOCK_PROFILE);
  }),

  http.get('/api/mypage/wishlist', ({ request }) => {
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

  http.get('/api/mypage/library', ({ request }) => {
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') ?? 'all';
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = 12;

    const filtered =
      tab === 'all'
        ? MOCK_LIBRARY
        : MOCK_LIBRARY.filter((g) => g.status === tab);

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return HttpResponse.json({
      total: filtered.length,
      items,
      hasMore: start + pageSize < filtered.length,
    });
  }),

  http.get('/api/mypage/activity', () => {
    return HttpResponse.json({
      reviews: MOCK_REVIEWS,
      chats: MOCK_CHATS,
      notifications: MOCK_NOTIFICATIONS,
    });
  }),
];
