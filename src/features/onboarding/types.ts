// 스팀 연동 온보딩 공유 계약 (STEAM-INTER-FE-006 — 백엔드 실계약 정합).
// 데이터레이어(services·훅·mock)와 프리젠테이션(components)·라우트 호스트가 함께 참조하는
//   도메인 타입의 단일 출처.
//
// 백엔드 계약: GET /api/v1/steam/status →
//   steam_sync_status ∈ success | private | failed | empty  (또는 null = 동기화 진행 중)
//   steam_id_64 / steam_avatar_url / last_synced_at (모두 nullable)
//   → found_games·steam_nickname·timeout·in-progress 는 백엔드 계약에 없다.

// 폴링 도메인 상태. 백엔드 enum 4종 + 진행중('syncing', 백엔드 null을 매핑).
//   클라 폴링 타임아웃 초과 시 훅이 'failed'로 합성한다(별도 timeout 상태 없음).
export type SteamSyncStatusValue =
  | 'syncing'
  | 'success'
  | 'private'
  | 'failed'
  | 'empty';

// 폴링 1틱의 도메인 결과 — 컴포넌트/호스트가 보는 형태(camelCase).
//   백엔드가 실제로 주는 Steam 데이터만 담는다(보유 게임 수는 백엔드 미제공이라 없음).
export interface SteamSyncResult {
  status: SteamSyncStatusValue;
  // SteamID64(17자리). 미연동/미지정이면 null.
  steamId: string | null;
  // Steam 프로필 아바타 URL. 없으면 null.
  avatarUrl: string | null;
  // 마지막 동기화 시각(ISO). 없으면 null.
  lastSyncedAt: string | null;
}
// 경과초(elapsedSeconds)는 도메인 결과가 아닌 폴링 진행 파생값이라 SteamSyncResult에 넣지 않는다.
//   훅(useSteamSyncStatus)이 별도로 반환한다. (결과에 섞으면 매 렌더 새 객체가 되어 navigate 반복 유발)

// 연동 유도 화면(화면1·2) variant — 가입 경로에 따른 카피/배지 분기.
//   - 'emailSignup': 이메일 가입 후 선택적 연동 유도(화면1 / Figma 4071:455)
//   - 'steamSignup': 스팀 가입 직후 연동 권유(화면2 / Figma 4074:786)
export type SteamLinkOrigin = 'emailSignup' | 'steamSignup';

// 'syncing'을 제외한 모든 상태는 폴링 종료 상태(폴링 중단 + 결과 화면 이동).
export function isTerminalSyncStatus(status: SteamSyncStatusValue): boolean {
  return status !== 'syncing';
}
