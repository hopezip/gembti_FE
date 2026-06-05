import { http, HttpResponse } from 'msw';

// 스팀 연동 MSW 핸들러 (한시적 수동 작성, STEAM-INTER-FE-001).
// 원래 src/mocks/handlers/는 Swagger 기반 자동 생성물 자리이나(api_client.md 동기화 흐름),
// 백엔드 계약 미완 동안 한시적으로 수동 작성한다. /api-sync 후 자동 생성 핸들러로 교체한다.
//
// 계약(REQ 6-2):
//   - GET  /api/v1/steam/sync-status → data.sync_status ∈ IN_PROGRESS|SUCCESS|PRIVATE|FAILED|TIMEOUT
//                                       + found_games / steam_nickname / error_message
//   - POST /api/v1/steam/skip        → data.next_step / message
//   - POST /api/v1/steam/link        → data.steam_linked / steam_id (REQ-005 통일안)

// 폴링 데모: 처음 N번은 IN_PROGRESS, 그 다음부터 종료상태(쿼리 ?scenario로 분기).
const MOCK_IN_PROGRESS_TICKS = 3;
const MOCK_FOUND_GAMES = 147;
const MOCK_STEAM_NICKNAME = 'My_Steam_ID';
const MOCK_NEXT_STEP = 'SURVEY';
const MOCK_SKIP_MESSAGE = '설문으로 진행할게요';

// 비성공 시나리오별 사유 메시지.
const MOCK_ERROR_MESSAGES: Record<string, string> = {
  PRIVATE: '프로필이 비공개로 설정되어 있어 게임 목록을 가져올 수 없어요',
  FAILED: '스팀 동기화 중 오류가 발생했어요',
  TIMEOUT: '스팀 서버 응답이 지연되고 있어요',
};

// 모듈 스코프 폴링 카운터 — sync-status 호출 횟수를 누적해 IN_PROGRESS→종료상태로 전이한다.
let syncPollCount = 0;

// SUCCESS 래퍼.
function ok<T>(data: T, status = 200) {
  return HttpResponse.json({ status: 'SUCCESS', data }, { status });
}

export const steamHandlers = [
  // 동기화 상태 폴링.
  //   처음 MOCK_IN_PROGRESS_TICKS번은 IN_PROGRESS, 이후부터 ?scenario(기본 SUCCESS)에 따른 종료상태.
  http.get('*/api/v1/steam/sync-status', ({ request }) => {
    const url = new URL(request.url);
    const scenario = (
      url.searchParams.get('scenario') ?? 'SUCCESS'
    ).toUpperCase();

    syncPollCount += 1;

    // 아직 진행 중 구간.
    if (syncPollCount < MOCK_IN_PROGRESS_TICKS) {
      return ok({
        sync_status: 'IN_PROGRESS',
        found_games: null,
        steam_nickname: null,
        error_message: null,
      });
    }

    // 종료상태 도달 — 다음 폴링 흐름(재진입)을 위해 카운터 리셋.
    syncPollCount = 0;

    if (scenario === 'SUCCESS') {
      return ok({
        sync_status: 'SUCCESS',
        found_games: MOCK_FOUND_GAMES,
        steam_nickname: MOCK_STEAM_NICKNAME,
        error_message: null,
      });
    }

    // PRIVATE | FAILED | TIMEOUT — 비성공 종료상태.
    const status =
      scenario === 'PRIVATE' || scenario === 'FAILED' || scenario === 'TIMEOUT'
        ? scenario
        : 'FAILED';
    return ok({
      sync_status: status,
      found_games: null,
      steam_nickname: null,
      error_message: MOCK_ERROR_MESSAGES[status] ?? MOCK_ERROR_MESSAGES.FAILED,
    });
  }),

  // 스킵 — 설문으로 진행.
  http.post('*/api/v1/steam/skip', () => {
    return ok({ next_step: MOCK_NEXT_STEP, message: MOCK_SKIP_MESSAGE });
  }),

  // 스팀 계정 연동(REQ-005 통일안 — 서비스 파서와 동일 형태).
  http.post('*/api/v1/steam/link', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      steam_id?: string;
    };
    return ok({
      steam_linked: true,
      steam_id: body.steam_id ?? 'mock-steam-id',
    });
  }),
];
