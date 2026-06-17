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
  // Steam 동기화 상태(success | private | failed | empty). 비공개 라이브러리 안내 분기에 사용.
  steamSyncStatus: string | null;
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
  steamSyncStatus: 'success',
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

  // GET/PATCH /mypage/profile 핸들러 제거됨: 조회는 auth/me(MYPAGE-FE-005), 수정 저장은
  //   실서버 PATCH /auth/profile로 이전(MYPAGE-FE-011). mypage/profile은 더 이상 쓰지 않는다.

  // /mypage/steam/sync 핸들러 제거됨(MYPAGE-FE-008): 재동기화는 실서버 POST /steam/sync로 이전.
  // /mypage/steam/disconnect 핸들러 제거됨(SURVEY-FE-006): 연동 해제 기능 삭제.
  // /mypage/library 핸들러 제거됨(MYPAGE-FE-012): 라이브러리는 auth/me의 steam_library.games(실서버)로 이전.

  // 팔로잉/팔로워/팔로우/언팔로우 핸들러 제거됨 (MYPAGE-FE-006): 팔로우 기능 폐기.
];
