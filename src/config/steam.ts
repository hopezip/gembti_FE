// 스팀 연동 온보딩 설정 상수 (STEAM-INTER-FE-001).
// 폴링 주기/타임아웃·인증 시작 URL 같은 "한 곳에서 갈아끼울" 값의 단일 출처.
//
// ⚠️ 미확정 항목(확정 시 이 파일만 교체):
//   - REQ-003: 스팀 OpenID 인증 시작 URL(STEAM_AUTH_START_URL).
//       현재 A안(백엔드 리다이렉트 위임) 가설정 → 빈 문자열 또는 env로 둔다.
//       B안(FE가 직접 OpenID 시작)으로 확정되면 실제 URL을 여기 채운다.
//   - REQ-004: 폴링 타임아웃(STEAM_POLL_TIMEOUT_MS) 잠정 40초.
//       백엔드 평균 동기화 시간 확정 시 이 값을 조정한다.

// 스팀 OpenID 인증 시작 URL (REQ-003 A안 확정 — 백엔드 위임).
//   FE는 이 백엔드 엔드포인트로 브라우저를 이동시키고, 백엔드가 Steam OpenID로 리다이렉트한다.
//   기본값은 API 베이스 + GET /api/v1/auth/steam. env(VITE_STEAM_AUTH_START_URL)가 있으면 우선한다.
export const STEAM_AUTH_START_URL =
  import.meta.env.VITE_STEAM_AUTH_START_URL ??
  `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/auth/steam`;

// Steam 공개 설정(게임 세부정보 공개로 변경) 페이지 URL.
//   게임 세부정보가 비공개라 라이브러리를 못 가져올 때, 유저를 이 페이지로 보내 공개로 바꾸게 한다.
export const STEAM_PRIVACY_SETTINGS_URL =
  'https://steamcommunity.com/my/edit/settings';

// 동기화 상태 폴링 주기(ms). 훅의 refetchInterval 기본값으로 쓴다.
export const STEAM_POLL_INTERVAL_MS = 2000;

// 클라이언트 폴링 타임아웃(ms). 이 시간을 넘기면 훅이 status를 'timeout'으로 강제한다(REQ-004 잠정 40초).
export const STEAM_POLL_TIMEOUT_MS = 40000;
