// 마이페이지 도메인 API 레이어 (TASK-DEVEX-019).
//   라우트/컴포넌트의 인라인 ky 호출을 이곳으로 추출해 api_client.md "컴포넌트 직접 호출 금지"를 지킨다.
//   경로의 단일 진실은 docs/03-api/openapi.draft.json — 전부 `api/v1/` 프리픽스(상대경로, prefixUrl 적용).
//   대부분 백엔드 미구현이라 MSW mock(`*/api/v1/mypage/*`)으로 동작한다(auth와 달리 passthrough 아님).
//   ⭐ 예외: getMyProfile은 실서버 GET /api/v1/auth/me로 직결한다(MYPAGE-FE-005). 나머지는 mock 유지.
//   응답 타입은 한시적 mock 핸들러 타입을 재사용한다(백엔드 계약 확정 시 자동 생성물로 교체 예정).
import { api } from '@/lib/ky';
import { getMeRaw } from '@/services/auth';
import { getSteamStatus } from '@/lib/api/steam';
import type { MockLibraryItem, MockUserProfile } from '@/mocks/handlers/mypage';

// 백엔드 auth/me가 제공하지 않는 마이페이지 필드의 임시 기본값 (MYPAGE-FE-005).
//   관심장르·총 플레이시간·프로필 상세(handle·가입월·생일·성별 등)는 백엔드 원천이 없어
//   화면 회귀 방지용 그럴듯한 값을 둔다. 백엔드 API 확정 시 이 합성을 제거하고 실값 매핑으로 교체한다.
//   ⭐ 예외1: 게임 보유수(stats.following)는 GET /api/v1/steam/status의 library_games_count 실값으로
//      덮어쓴다(MYPAGE-FE-009). 총 플레이시간(totalPlayHours)은 전체 누적 API가 없어 mock 유지.
//   ⭐ 예외2: 6대 성향(personality)은 GET /api/v1/stats/me 실값으로 덮어쓴다(MYPAGE-FE-010).
//      여기 personality는 stats/me 실패 시의 폴백으로만 남는다.
//   ⚠️ mock 핸들러(값) import는 번들 오염이라 금지 → 여기 자체 정의한다(타입만 mock에서 가져온다).
const PROFILE_FALLBACK: Pick<
  MockUserProfile,
  | 'handle'
  | 'joinedAt'
  | 'isPublic'
  | 'birthdate'
  | 'gender'
  | 'website'
  | 'favoriteGenres'
  | 'stats'
  | 'personality'
> = {
  handle: 'my_handle',
  joinedAt: '2024.11',
  isPublic: true,
  birthdate: '1995-05-14',
  gender: '남성',
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

// GET /api/v1/stats/me — 현재 사용자 6대 성향 스탯(설문/Steam 합산, 0~100) (MYPAGE-FE-010).
//   응답 stats는 설문 도메인 SurveyStats와 동일 6축. 백엔드 미러 정리 전이라 국소 타이핑한다.
//   onUnhandledRequest:'bypass'라 mock 없이 실서버로 직결된다(auth/me와 동일).
interface MyStatsResponse {
  stats: Record<string, number>;
  source_type: string;
  steam_linked: boolean;
  last_updated_at: string;
}

function getMyStats(): Promise<MyStatsResponse> {
  return api.get('api/v1/stats/me').json<MyStatsResponse>();
}

// 6축 키 → 한글 라벨·표시 순서. SurveyResultPage의 정식 컨벤션을 그대로 따른다.
const PERSONALITY_AXES: { key: string; label: string }[] = [
  { key: 'exploration', label: '탐험' },
  { key: 'combat', label: '액션' },
  { key: 'growth', label: '성장' },
  { key: 'healing', label: '힐링' },
  { key: 'cooperation', label: '협동' },
  { key: 'strategy', label: '전략' },
];

// stats/me(0~100) → PersonalityRadar value(0~10 스케일, 표시 ×10). 누락 축은 0.
function mapPersonality(res: MyStatsResponse): MockUserProfile['personality'] {
  return PERSONALITY_AXES.map((axis) => ({
    label: axis.label,
    value: (res.stats[axis.key] ?? 0) / 10,
  }));
}

// 내 프로필 조회 — 실서버 GET /api/v1/auth/me(UserResponse) + steam/status + stats/me를 MockUserProfile로 합성한다.
//   실값: nickname·email·bio·스팀 연동 필드 + 게임 보유수(library_games_count) + 6대 성향(stats/me).
//   steamNickname은 별도 필드가 없어 SteamID(steam_id_64)로 대체한다.
//   나머지(총 플레이시간·프로필 상세)는 PROFILE_FALLBACK(임시 mock)이다.
//   steam/status·stats/me는 호출 실패가 프로필 전체를 깨지 않도록 각각 catch로 격리한다
//   (실패 시 보유수 0 / 성향은 PROFILE_FALLBACK mock 폴백).
export async function getMyProfile(): Promise<MockUserProfile> {
  const [me, steam, stats] = await Promise.all([
    getMeRaw(),
    getSteamStatus().catch(() => null),
    getMyStats().catch(() => null),
  ]);
  return {
    id: String(me.id),
    nickname: me.nickname,
    email: me.email,
    bio: me.bio ?? '',
    avatarUrl: me.steam_avatar_url ?? null,
    steamConnected: me.steam_linked,
    steamId: me.steam_id_64 ?? null,
    steamNickname: me.steam_id_64 ?? null,
    steamSyncedAt: me.last_synced_at ?? null,
    ...PROFILE_FALLBACK,
    stats: {
      ...PROFILE_FALLBACK.stats,
      following: steam?.library_games_count ?? 0,
    },
    personality: stats ? mapPersonality(stats) : PROFILE_FALLBACK.personality,
  };
}

// PATCH /api/v1/mypage/profile — 내 프로필 부분 수정.
export function updateMyProfile(
  patch: Partial<MockUserProfile>,
): Promise<MockUserProfile> {
  return api
    .patch('api/v1/mypage/profile', { json: patch })
    .json<MockUserProfile>();
}

// 스팀 수동 재동기화는 실 API(POST /api/v1/steam/sync, lib/api/steam.syncSteamLibrary)로 이전됨 (MYPAGE-FE-008).

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

// 팔로잉/팔로워/팔로우/언팔로우 API 제거됨 (MYPAGE-FE-006): 팔로우 기능 미사용으로 폐기.
