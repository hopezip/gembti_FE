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

export interface MockLibraryItem {
  id: string;
  title: string;
  genres: string[];
  playHours: number;
  myRating: number | null;
  status: 'unplayed' | 'playing' | 'cleared' | 'dropped';
  lastPlayedAt: string | null;
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

  // 팔로잉/팔로워/팔로우/언팔로우 핸들러 제거됨 (MYPAGE-FE-006): 팔로우 기능 폐기.
];
