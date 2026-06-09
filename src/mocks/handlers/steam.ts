import { http, HttpResponse } from 'msw';
import type { components } from '@/types/api';

// 스팀 연동 MSW 핸들러 — 백엔드 실계약(2026-06-09 재확인)에 맞춰 정합.
//   STEAM-INTER-FE-006: 온보딩을 신계약으로 옮기며 레거시(sync-status/skip·envelope) 블록을 제거했다.
//
// 응답 envelope 없음 — 스키마 본문 직접 반환. SteamSyncStatus enum = success|private|failed|empty.
//
// 실제 엔드포인트:
//   GET  /api/v1/auth/steam           → 302 (OpenID 시작)
//   GET  /api/v1/auth/steam/callback  → 302
//   POST /api/v1/steam/link           → SteamLinkResponse
//   GET  /api/v1/steam/status         → SteamStatusResponse
//
// 시나리오 분기: ?scenario= 쿼리로 응답을 바꾼다(실서버는 무시).
//   status: 기본은 폴링 시뮬(처음 몇 틱 sync_status=null → 종료) + 종료상태(success|private|failed|empty)
//           / unlinked = 미연동(즉시 반환).

type SteamLinkResponse = components['schemas']['SteamLinkResponse'];
type SteamStatusResponse = components['schemas']['SteamStatusResponse'];
type SteamSyncStatus = components['schemas']['SteamSyncStatus'];

const MOCK_STEAM_ID_64 = '76561197960287930';
const MOCK_AVATAR_URL =
  'https://avatars.steamstatic.com/0000000000000000000000000000000000000000_full.jpg';
const MOCK_LAST_SYNCED_AT = '2026-06-09T09:30:00Z';

// 종료상태에 도달하기 전 '동기화 진행 중'(sync_status=null)으로 응답할 틱 수.
const SYNC_IN_PROGRESS_TICKS = 2;

const SYNC_STATUSES: SteamSyncStatus[] = [
  'success',
  'private',
  'failed',
  'empty',
];

function parseSyncStatus(
  raw: string | null,
  fallback: SteamSyncStatus,
): SteamSyncStatus {
  return SYNC_STATUSES.includes(raw as SteamSyncStatus)
    ? (raw as SteamSyncStatus)
    : fallback;
}

// 연동 세션 폴링 카운터(mock 전용). 종료상태 반환 시 0으로 리셋한다.
let statusPollCount = 0;

export const steamHandlers = [
  // OpenID 진입/콜백 — 브라우저 302 redirect. mock에서는 동작 확인용으로만 302를 흉내낸다.
  http.get('*/api/v1/auth/steam', () => {
    return new HttpResponse(null, {
      status: 302,
      headers: {
        Location:
          'https://steamcommunity.com/openid/login?openid.mode=checkid_setup',
      },
    });
  }),
  http.get('*/api/v1/auth/steam/callback', () => {
    return new HttpResponse(null, {
      status: 302,
      headers: { Location: '/onboarding/steam' },
    });
  }),

  // 스팀 계정 연동(B안용). 기본 success, ?scenario로 private/failed/empty 분기.
  http.post('*/api/v1/steam/link', async ({ request }) => {
    const url = new URL(request.url);
    const status = parseSyncStatus(url.searchParams.get('scenario'), 'success');
    const body = (await request.json().catch(() => ({}))) as {
      steam_id?: string;
    };

    const res: SteamLinkResponse = {
      steam_linked: true,
      steam_id_64: body.steam_id ?? MOCK_STEAM_ID_64,
      steam_sync_status: status,
    };
    return HttpResponse.json(res);
  }),

  // 연동 상태 조회 + 폴링 시뮬.
  //   처음 SYNC_IN_PROGRESS_TICKS-1 틱은 sync_status=null(진행중) → 이후 종료상태(scenario, 기본 success).
  //   ?scenario=unlinked는 미연동(즉시 반환, 폴링 카운트 영향 없음).
  http.get('*/api/v1/steam/status', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('scenario');

    // 미연동 상태 — nullable 필드 전부 null.
    if (scenario === 'unlinked') {
      const res: SteamStatusResponse = {
        steam_linked: false,
        steam_id_64: null,
        steam_avatar_url: null,
        steam_sync_status: null,
        last_synced_at: null,
      };
      return HttpResponse.json(res);
    }

    statusPollCount += 1;
    if (statusPollCount < SYNC_IN_PROGRESS_TICKS) {
      // 동기화 진행 중 — sync_status=null.
      const res: SteamStatusResponse = {
        steam_linked: true,
        steam_id_64: MOCK_STEAM_ID_64,
        steam_avatar_url: MOCK_AVATAR_URL,
        steam_sync_status: null,
        last_synced_at: null,
      };
      return HttpResponse.json(res);
    }
    statusPollCount = 0;

    const status = parseSyncStatus(scenario, 'success');
    const res: SteamStatusResponse = {
      steam_linked: true,
      steam_id_64: MOCK_STEAM_ID_64,
      steam_avatar_url: MOCK_AVATAR_URL,
      steam_sync_status: status,
      last_synced_at: MOCK_LAST_SYNCED_AT,
    };
    return HttpResponse.json(res);
  }),
];
