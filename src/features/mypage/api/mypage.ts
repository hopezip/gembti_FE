// 마이페이지 도메인 API 레이어 (TASK-DEVEX-019).
//   라우트/컴포넌트의 인라인 ky 호출을 이곳으로 추출해 api_client.md "컴포넌트 직접 호출 금지"를 지킨다.
//   경로의 단일 진실은 docs/03-api/openapi.draft.json — 전부 `api/v1/` 프리픽스(상대경로, prefixUrl 적용).
//   백엔드 미구현이라 MSW mock(`*/api/v1/mypage/*`)으로 동작한다(auth와 달리 passthrough 아님).
//   응답 타입은 한시적 mock 핸들러 타입을 재사용한다(백엔드 계약 확정 시 자동 생성물로 교체 예정).
import { api } from '@/lib/ky';
import type {
  MockFollowUser,
  MockLibraryItem,
  MockUserProfile,
} from '@/mocks/handlers/mypage';

export interface LibraryQuery {
  genre: string;
  sort: string;
  search: string;
  page: number;
}

export interface LibraryResponse {
  total: number;
  items: MockLibraryItem[];
  hasMore: boolean;
  allGenres: string[];
}

// GET /api/v1/mypage/profile — 내 프로필 조회.
export function getMyProfile(): Promise<MockUserProfile> {
  return api.get('api/v1/mypage/profile').json<MockUserProfile>();
}

// PATCH /api/v1/mypage/profile — 내 프로필 부분 수정.
export function updateMyProfile(
  patch: Partial<MockUserProfile>,
): Promise<MockUserProfile> {
  return api
    .patch('api/v1/mypage/profile', { json: patch })
    .json<MockUserProfile>();
}

// POST /api/v1/mypage/steam/sync — Steam 라이브러리 수동 재동기화.
export function syncSteam(): Promise<MockUserProfile> {
  return api.post('api/v1/mypage/steam/sync').json<MockUserProfile>();
}

// POST /api/v1/mypage/steam/disconnect — Steam 연동 해제.
export function disconnectSteam(): Promise<MockUserProfile> {
  return api.post('api/v1/mypage/steam/disconnect').json<MockUserProfile>();
}

// GET /api/v1/mypage/library — 내 라이브러리(장르/정렬/검색/페이지).
export function getLibrary(query: LibraryQuery): Promise<LibraryResponse> {
  return api
    .get('api/v1/mypage/library', {
      searchParams: {
        genre: query.genre,
        sort: query.sort,
        search: query.search,
        page: query.page,
      },
    })
    .json<LibraryResponse>();
}

// GET /api/v1/mypage/following — 내가 팔로우하는 사용자 목록.
export function getFollowing(): Promise<{ users: MockFollowUser[] }> {
  return api.get('api/v1/mypage/following').json<{ users: MockFollowUser[] }>();
}

// GET /api/v1/mypage/followers — 나를 팔로우하는 사용자 목록.
export function getFollowers(): Promise<{ users: MockFollowUser[] }> {
  return api.get('api/v1/mypage/followers').json<{ users: MockFollowUser[] }>();
}

// POST /api/v1/mypage/follow/{userId} — 팔로우.
export function followUser(userId: string): Promise<unknown> {
  return api.post(`api/v1/mypage/follow/${userId}`).json();
}

// DELETE /api/v1/mypage/follow/{userId} — 언팔로우.
export function unfollowUser(userId: string): Promise<unknown> {
  return api.delete(`api/v1/mypage/follow/${userId}`).json();
}
