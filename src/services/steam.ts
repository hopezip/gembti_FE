import { api } from '@/lib/ky';
import type {
  SteamSyncResult,
  SteamSyncStatusValue,
} from '@/features/onboarding/types';

// 스팀 연동 도메인 서비스 레이어 (STEAM-INTER-FE-001).
// ⏳ Swagger 미완 상태라 한시적으로 lib/ky로 직접 호출한다(api_client.md).
//   백엔드 계약 확정 후 /api-sync로 생성되는 src/lib/api/steam 조합으로 교체한다.
//
// 인증 방식(LOGIN-FE-005): access_token(메모리) + Bearer 헤더.
//   ky 인스턴스(src/lib/ky.ts)가 Authorization 부착과 401 refresh 재시도를 전담한다.
//   서비스는 엔드포인트(`api/v1/steam/*`)와 응답 래퍼 매핑만 담당한다.

// ── 응답 래퍼 ────────────────────────────────────────────────────────────────
// 백엔드 공통 응답: { status:'SUCCESS'|'FAIL', data, message?, error_code? } (auth.ts와 동일).
interface ApiEnvelope<T> {
  status: 'SUCCESS' | 'FAIL';
  data: T;
  message?: string;
  error_code?: string;
}

// ── 동기화 상태 폴링 ──────────────────────────────────────────────────────────
// 백엔드 sync_status(UPPER_SNAKE) → 도메인(kebab) 매핑맵.
//   계약(REQ 6-2): IN_PROGRESS | SUCCESS | PRIVATE | FAILED | TIMEOUT.
const SYNC_STATUS_MAP: Record<string, SteamSyncStatusValue> = {
  IN_PROGRESS: 'in-progress',
  SUCCESS: 'success',
  PRIVATE: 'private',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
};

// 동기화 상태 응답 data(snake_case).
interface SyncStatusRaw {
  sync_status: string;
  found_games: number | null;
  steam_nickname: string | null;
  error_message: string | null;
}

// 알 수 없는 sync_status 값은 안전하게 'failed'로 떨어뜨린다(폴링 종료 상태).
function mapSyncStatus(raw: string): SteamSyncStatusValue {
  return SYNC_STATUS_MAP[raw] ?? 'failed';
}

// 폴링 결과 에러 유형 — 현재는 네트워크/서버 오류 단일 분류.
export type SteamSyncErrorKind = 'generic';

export class SteamSyncError extends Error {
  readonly kind: SteamSyncErrorKind;

  constructor(kind: SteamSyncErrorKind = 'generic') {
    super(kind);
    this.name = 'SteamSyncError';
    this.kind = kind;
  }
}

// 동기화 상태 1틱 조회.
//   elapsedSeconds는 0으로 두고 폴링 훅이 시작시각 기준으로 채운다(서비스는 서버 응답만 매핑).
//   scenario는 mock 전용 분기용 — 실서버에선 무시된다(searchParams로 전달).
export async function getSyncStatus(
  signal?: AbortSignal,
  scenario?: string,
): Promise<SteamSyncResult> {
  const searchParams = scenario ? { scenario } : undefined;
  try {
    const env = await api
      .get('api/v1/steam/sync-status', { signal, searchParams })
      .json<ApiEnvelope<SyncStatusRaw>>();
    return {
      status: mapSyncStatus(env.data.sync_status),
      foundGames: env.data.found_games,
      steamNickname: env.data.steam_nickname,
      errorMessage: env.data.error_message,
    };
  } catch (error) {
    // AbortError(언마운트/리페치 취소)는 그대로 흘려 TanStack Query가 처리하게 둔다.
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new SteamSyncError('generic');
  }
}

// ── 스킵(설문으로 건너뛰기) ───────────────────────────────────────────────────
export interface SteamSkipResult {
  nextStep: string;
  message: string;
}

interface SkipRaw {
  next_step: string;
  message: string;
}

// 스팀 연동을 건너뛰고 다음 단계로. navigate는 호출부 책임.
export async function skipSteam(): Promise<SteamSkipResult> {
  const env = await api.post('api/v1/steam/skip').json<ApiEnvelope<SkipRaw>>();
  return {
    nextStep: env.data.next_step,
    message: env.data.message,
  };
}

// ── 스팀 계정 연동(REQ-003 A안이라 현재 미사용 스켈레톤) ──────────────────────
// REQ-003가 A안(백엔드 OpenID 위임)으로 가정돼 FE는 이 함수를 호출하지 않는다.
//   B안(FE가 steamId를 직접 전달)로 확정되면 호출부를 배선한다.
//   파서 형태는 mock(POST api/v1/steam/link → { steam_linked, steam_id })과 일치시킨다(REQ-005 통일안).
export interface SteamLinkResult {
  steamLinked: boolean;
  steamId: string;
}

interface LinkRaw {
  steam_linked: boolean;
  steam_id: string;
}

// 스팀 계정 연동(미사용 스켈레톤). REQ-003 확정 전까지 호출부 없음.
export async function steamLink(steamId: string): Promise<SteamLinkResult> {
  const env = await api
    .post('api/v1/steam/link', { json: { steam_id: steamId } })
    .json<ApiEnvelope<LinkRaw>>();
  return {
    steamLinked: env.data.steam_linked,
    steamId: env.data.steam_id,
  };
}
