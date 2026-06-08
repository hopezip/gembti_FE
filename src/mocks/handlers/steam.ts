import { http, HttpResponse } from 'msw';
import type { components } from '@/types/api';

// 스팀 연동 MSW 핸들러 — 백엔드 실계약(2026-06-08 배포)에 맞춰 재정합.
//
// ⚠️ 구버전(Swagger 미완 시기) 대비 변경점:
//   - 응답 envelope({status,data}) 제거 → 스키마 본문 직접 반환.
//   - 존재하지 않던 POST /api/v1/steam/skip, GET /api/v1/steam/sync-status 제거.
//   - SteamSyncStatus enum을 실계약(success|private|failed|empty)으로 교체(IN_PROGRESS/TIMEOUT 폐기).
//
// 실제 엔드포인트:
//   GET  /api/v1/auth/steam           → 302 (OpenID 시작)
//   GET  /api/v1/auth/steam/callback  → 302
//   POST /api/v1/steam/link           → SteamLinkResponse
//   GET  /api/v1/steam/status         → SteamStatusResponse
//
// 시나리오 분기: ?scenario= 쿼리로 link/status 응답을 바꾼다(기본 success).
//   link:   success(기본) | private | failed | empty
//   status: linked(기본) | unlinked | private | failed | empty

type SteamLinkResponse = components['schemas']['SteamLinkResponse'];
type SteamStatusResponse = components['schemas']['SteamStatusResponse'];
type SteamSyncStatus = components['schemas']['SteamSyncStatus'];

const MOCK_STEAM_ID_64 = '76561197960287930';
const MOCK_AVATAR_URL =
  'https://avatars.steamstatic.com/0000000000000000000000000000000000000000_full.jpg';
const MOCK_LAST_SYNCED_AT = '2026-06-08T09:30:00Z';

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

const steamApiHandlers = [
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

  // 스팀 계정 연동. 기본 success, ?scenario로 private/failed/empty 분기.
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

  // 연동 상태 조회. 기본 linked(success), ?scenario=unlinked로 미연동, 그 외는 동기화 상태 분기.
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

// ── 레거시(온보딩 전환 대기) ────────────────────────────────────────────────
// ⚠️ STEAM-INTER-FE-006에서 온보딩을 신계약(status/link)으로 옮기면 이 블록 전체를 삭제한다.
//   현재 SteamOnboardingPage / useSteamSyncStatus / useSteamSkip 이 구식 sync-status·skip(envelope)에
//   의존하므로, 이번 PR(STEAM-INTER-FE-005)에서 회귀를 막기 위해 한시적으로 병존시킨다.
//   실서버엔 이 두 엔드포인트가 없어 mock 전용이다(온보딩은 실연동 미완 상태).
const LEGACY_IN_PROGRESS_TICKS = 3;
const LEGACY_FOUND_GAMES = 147;
const LEGACY_STEAM_NICKNAME = 'My_Steam_ID';
const LEGACY_NEXT_STEP = 'SURVEY';
const LEGACY_SKIP_MESSAGE = '설문으로 진행할게요';
const LEGACY_ERROR_MESSAGES: Record<string, string> = {
  PRIVATE: '프로필이 비공개로 설정되어 있어 게임 목록을 가져올 수 없어요',
  FAILED: '스팀 동기화 중 오류가 발생했어요',
  TIMEOUT: '스팀 서버 응답이 지연되고 있어요',
};

let legacySyncPollCount = 0;

function legacyOk<T>(data: T) {
  return HttpResponse.json({ status: 'SUCCESS', data });
}

const legacyOnboardingHandlers = [
  http.get('*/api/v1/steam/sync-status', ({ request }) => {
    const url = new URL(request.url);
    const scenario = (
      url.searchParams.get('scenario') ?? 'SUCCESS'
    ).toUpperCase();

    legacySyncPollCount += 1;

    if (legacySyncPollCount < LEGACY_IN_PROGRESS_TICKS) {
      return legacyOk({
        sync_status: 'IN_PROGRESS',
        found_games: null,
        steam_nickname: null,
        error_message: null,
      });
    }

    legacySyncPollCount = 0;

    if (scenario === 'SUCCESS') {
      return legacyOk({
        sync_status: 'SUCCESS',
        found_games: LEGACY_FOUND_GAMES,
        steam_nickname: LEGACY_STEAM_NICKNAME,
        error_message: null,
      });
    }

    const status =
      scenario === 'PRIVATE' || scenario === 'FAILED' || scenario === 'TIMEOUT'
        ? scenario
        : 'FAILED';
    return legacyOk({
      sync_status: status,
      found_games: null,
      steam_nickname: null,
      error_message:
        LEGACY_ERROR_MESSAGES[status] ?? LEGACY_ERROR_MESSAGES.FAILED,
    });
  }),

  http.post('*/api/v1/steam/skip', () => {
    return legacyOk({
      next_step: LEGACY_NEXT_STEP,
      message: LEGACY_SKIP_MESSAGE,
    });
  }),
];

export const steamHandlers = [...steamApiHandlers, ...legacyOnboardingHandlers];
