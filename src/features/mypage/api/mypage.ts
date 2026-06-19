// 마이페이지 도메인 API 레이어 (TASK-DEVEX-019).
//   라우트/컴포넌트의 인라인 ky 호출을 이곳으로 추출해 api_client.md "컴포넌트 직접 호출 금지"를 지킨다.
//   경로의 단일 진실은 docs/03-api/openapi.draft.json — 전부 `api/v1/` 프리픽스(상대경로, prefixUrl 적용).
//   대부분 백엔드 미구현이라 MSW mock(`*/api/v1/mypage/*`)으로 동작한다(auth와 달리 passthrough 아님).
//   ⭐ 예외: getMyProfile은 실서버 GET /api/v1/auth/me로 직결한다(MYPAGE-FE-005). 나머지는 mock 유지.
//   응답 타입은 한시적 mock 핸들러 타입을 재사용한다(백엔드 계약 확정 시 자동 생성물로 교체 예정).
import { api } from '@/lib/ky';
import { getMeRaw } from '@/services/auth';
import type { components } from '@/types/api';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

type ProfileUpdateRequest = components['schemas']['ProfileUpdateRequest'];
type WithdrawRequest = components['schemas']['WithdrawRequest'];
type UserActivityResponse = components['schemas']['UserActivityResponse'];
type Gender = components['schemas']['Gender'];

// 백엔드 Gender enum(male/female/other) ↔ 화면 한글 라벨 매핑.
function genderToKo(g: Gender | null | undefined): MockUserProfile['gender'] {
  return g === 'male'
    ? '남성'
    : g === 'female'
      ? '여성'
      : g === 'other'
        ? '기타'
        : null;
}
function koToGender(g: MockUserProfile['gender']): Gender | null {
  return g === '남성'
    ? 'male'
    : g === '여성'
      ? 'female'
      : g === '기타'
        ? 'other'
        : null;
}

// 백엔드 auth/me가 제공하지 않는 마이페이지 필드의 임시 기본값 (MYPAGE-FE-005).
//   관심장르·총 플레이시간·프로필 상세(handle·가입월·생일·성별 등)는 백엔드 원천이 없어
//   화면 회귀 방지용 그럴듯한 값을 둔다. 백엔드 API 확정 시 이 합성을 제거하고 실값 매핑으로 교체한다.
//   ⭐ 예외1: 게임 보유수(stats.following)는 GET /api/v1/auth/me/activity의 library_game_count 실값으로 덮어쓴다
//      (MYPAGE-FE-011). 총 플레이시간(stats.totalPlayHours) 합성은 화면 통계 제거로 폐기했다(MYPAGE-FE-014, 폴백값 유지).
//   ⭐ 예외2: 6대 성향(personality)은 GET /api/v1/stats/me 실값에서만 온다(MYPAGE-FE-010).
//      stats/me 실패(미진단·백엔드 미구현)면 빈 배열([])을 반환해, 레이더 대신 "미진단 빈 상태"를 노출한다.
//      → 설문 안 한 유저에게 가짜 더미 레이더가 채워져 보이던 버그 방지. PROFILE_FALLBACK엔 personality를 두지 않는다.
//   ⭐ 예외3: 생년월일·성별은 auth/me의 birth_date·gender 실값으로 덮어쓴다(MYPAGE-FE-011, 프로필 수정 실연결).
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
};

// 내 라이브러리 게임 도메인(camelCase). 백엔드 SteamLibraryGameResponse에서 화면이 쓰는 필드만 추린다.
//   status(미플레이/플레이중/클리어/중단)·개인 평점은 백엔드 원천이 없어 제외(MYPAGE-FE-012).
export interface LibraryGame {
  id: number;
  title: string;
  genres: string[];
  thumbnailUrl: string | null;
  playHours: number;
  rating: number | null;
  lastPlayedAt: string | null;
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

// GET /api/v1/auth/me/activity — 보유 게임수·총 플레이시간·최근 게임 (MYPAGE-FE-011).
//   onUnhandledRequest:'bypass'라 mock 없이 실서버로 직결된다(auth/me와 동일).
function getMyActivity(): Promise<UserActivityResponse> {
  return api.get('api/v1/auth/me/activity').json<UserActivityResponse>();
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

// 내 프로필 조회 — 실서버 GET /api/v1/auth/me(UserResponse) + auth/me/activity + stats/me를 MockUserProfile로 합성한다.
//   실값: nickname·email·bio·생일·성별·스팀 연동 필드 + 보유수(activity) + 6대 성향(stats/me).
//   steamNickname은 별도 필드가 없어 SteamID(steam_id_64)로 대체한다.
//   나머지(handle·가입월·관심장르 등)는 PROFILE_FALLBACK(임시 mock)이다.
//   activity·stats/me는 호출 실패가 프로필 전체를 깨지 않도록 각각 catch로 격리한다
//   (실패 시 보유수/플레이시간·성향은 PROFILE_FALLBACK mock 폴백).
export async function getMyProfile(): Promise<MockUserProfile> {
  const [me, activity, stats] = await Promise.all([
    getMeRaw(),
    getMyActivity().catch(() => null),
    getMyStats().catch(() => null),
  ]);
  return {
    id: String(me.id),
    nickname: me.nickname,
    email: me.email,
    bio: me.bio ?? '',
    avatarUrl: me.steam_avatar_url ?? null,
    loginProvider: me.login_provider ?? null,
    steamConnected: me.steam_linked,
    steamId: me.steam_id_64 ?? null,
    steamNickname: me.steam_id_64 ?? null,
    steamSyncedAt: me.last_synced_at ?? null,
    steamSyncStatus: me.steam_sync_status ?? null,
    ...PROFILE_FALLBACK,
    // auth/me 실값으로 생일·성별을 덮어쓴다(PROFILE_FALLBACK 뒤에 두어 우선).
    birthdate: me.birth_date ?? '',
    gender: genderToKo(me.gender),
    stats: {
      ...PROFILE_FALLBACK.stats,
      following: activity?.library_game_count ?? 0,
    },
    personality: stats ? mapPersonality(stats) : [],
  };
}

// PATCH /api/v1/auth/profile — 내 프로필 부분 수정(MYPAGE-FE-011, mock /mypage/profile → 실 API).
//   화면 도메인(MockUserProfile) 패치를 백엔드 ProfileUpdateRequest(snake·gender enum)로 변환한다.
//   응답(UserResponse)은 도메인과 형태가 달라 여기서 매핑하지 않고, 호출부가 프로필을 재조회해 갱신한다.
export async function updateMyProfile(
  patch: Partial<MockUserProfile>,
): Promise<void> {
  // 생년월일은 회원가입 이후 변경 불가라 현재 BasicInfoCard에서는 전송하지 않는다.
  //   API 계약상 birth_date가 남아 있으므로, 다른 호출부가 명시적으로 넘긴 경우에만 매핑한다.
  const body: ProfileUpdateRequest = {};
  if (patch.nickname !== undefined) body.nickname = patch.nickname;
  if (patch.bio !== undefined) body.bio = patch.bio;
  if (patch.birthdate !== undefined) body.birth_date = patch.birthdate || null;
  if (patch.gender !== undefined) body.gender = koToGender(patch.gender);
  await api.patch('api/v1/auth/profile', { json: body });
}

// DELETE /api/v1/auth/withdrawal — 회원탈퇴(MYPAGE-FE-011). password는 이메일 가입자만 필요(없으면 null).
export async function withdrawMe(body: WithdrawRequest): Promise<void> {
  await api.delete('api/v1/auth/withdrawal', { json: body });
}

// 스팀 수동 재동기화 제거됨 (MYPAGE-FE-011): 라이브에서 POST /steam/sync 삭제(404), 자동 동기화로 대체.

// POST /api/v1/steam/sync — 스팀 라이브러리 수동 재동기화(MYPAGE-FE-022).
//   라이브 백엔드 실 계약(SteamSyncResponse). 응답은 쓰지 않고, 호출부가 프로필/라이브러리
//   쿼리를 무효화해 실서버 auth/me 기준으로 재조회한다.
export async function syncSteam(): Promise<void> {
  await api.post('api/v1/steam/sync');
}

// DELETE /api/v1/steam/unlink — 스팀 연동 해제(MYPAGE-FE-021).
//   라이브 백엔드 실 계약(steam/link와 대칭). 응답은 쓰지 않고, 호출부가 프로필/라이브러리
//   쿼리를 무효화해 실서버 auth/me 기준으로 재조회한다(SteamCallbackPage 연동 흐름과 대칭).
export async function unlinkSteam(): Promise<void> {
  await api.delete('api/v1/steam/unlink');
}

// 내 라이브러리 — 전용 엔드포인트가 없어 GET /auth/me의 steam_library.games(보유 게임 전체)를 쓴다(MYPAGE-FE-012).
//   장르 필터/검색/정렬/페이지네이션은 서버가 안 해주므로 호출부(LibrarySection)가 클라이언트에서 처리한다.
export async function getMyLibrary(): Promise<LibraryGame[]> {
  const me = await getMeRaw();
  const games = me.steam_library?.games ?? [];
  return games.map((g) => ({
    id: g.game_id ?? g.steam_app_id,
    title: g.title,
    genres: g.genres ?? [],
    thumbnailUrl: g.image_url ?? null,
    playHours: g.playtime_hours,
    rating: g.rating ?? null,
    lastPlayedAt: g.last_played_at ?? null,
  }));
}

// 팔로잉/팔로워/팔로우/언팔로우 API 제거됨 (MYPAGE-FE-006): 팔로우 기능 미사용으로 폐기.
