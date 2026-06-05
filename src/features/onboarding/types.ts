// 스팀 연동 온보딩 공유 계약 (STEAM-INTER-FE-001/002).
// 데이터레이어(services·훅·mock)와 프리젠테이션(components)·라우트 호스트가 함께 참조하는
//   도메인 타입의 단일 출처. 백엔드 sync_status(snake/UPPER) → FE 도메인(kebab) 매핑 기준점이다.
//
// 백엔드 계약(REQ 6-2): GET /api/v1/steam/sync-status →
//   data.sync_status ∈ IN_PROGRESS | SUCCESS | PRIVATE | FAILED | TIMEOUT
//   data.found_games(number) / data.steam_nickname(string) / data.error_message(string|null)

// 폴링 도메인 상태(kebab-case). 백엔드 UPPER_SNAKE를 서비스에서 이 값으로 매핑한다.
export type SteamSyncStatusValue =
  | 'in-progress'
  | 'success'
  | 'private'
  | 'failed'
  | 'timeout';

// 폴링 1틱의 도메인 결과 — 컴포넌트/호스트가 보는 형태(camelCase).
export interface SteamSyncResult {
  status: SteamSyncStatusValue;
  // 성공 시 가져온 보유 게임 수. 비성공이면 null.
  foundGames: number | null;
  // 성공 시 Steam 닉네임. 비성공이면 null.
  steamNickname: string | null;
  // 실패/비공개 사유 메시지(있으면). 없으면 null.
  errorMessage: string | null;
}
// 경과초(elapsedSeconds)는 도메인 결과가 아닌 폴링 진행 파생값이라 SteamSyncResult에 넣지 않는다.
//   훅(useSteamSyncStatus)이 별도로 반환한다. (결과에 섞으면 매 렌더 새 객체가 되어 navigate 반복 유발)

// 연동 유도 화면(화면1·2) variant — 가입 경로에 따른 카피/배지 분기.
//   - 'emailSignup': 이메일 가입 후 선택적 연동 유도(화면1 / Figma 4071:455)
//   - 'steamSignup': 스팀 가입 직후 연동 권유(화면2 / Figma 4074:786)
export type SteamLinkOrigin = 'emailSignup' | 'steamSignup';

// 'in-progress'를 제외한 모든 상태는 폴링 종료 상태(폴링 중단 + 결과 화면 이동).
export function isTerminalSyncStatus(status: SteamSyncStatusValue): boolean {
  return status !== 'in-progress';
}
