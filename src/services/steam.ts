import { api } from '@/lib/ky';
import type {
  SteamSyncResult,
  SteamSyncStatusValue,
} from '@/features/onboarding/types';
import type { components } from '@/types/api';

// 스팀 연동 도메인 서비스 레이어 (STEAM-INTER-FE-006 — 백엔드 실계약 정합).
//   엔드포인트(GET /api/v1/steam/status)와 SteamStatusResponse → 도메인(SteamSyncResult) 매핑만 담당.
//   토큰 부착/401 refresh는 ky 인스턴스(src/lib/ky.ts)가 전담한다.
//   백엔드 응답에 envelope 없음 — 스키마 본문을 그대로 받는다.
//
// 저수준 thin wrapper(src/lib/api/steam.ts: getSteamStatus/linkSteam)는 단발 호출용으로 보존하되,
//   상태 조회는 폴링 취소(AbortSignal)·mock scenario 분기가 필요해 여기서 ky boundary를 직접 쓴다.

type SteamStatusResponse = components['schemas']['SteamStatusResponse'];

// 종료(terminal) sync_status 집합. 이 외(null/미지정)는 '동기화 진행 중'으로 본다.
const TERMINAL_STATUSES: readonly string[] = [
  'success',
  'private',
  'failed',
  'empty',
];

// 백엔드 steam_sync_status(enum | null) → 도메인 상태.
//   null/미연동/미지정 또는 알 수 없는 값은 진행중('syncing')으로 떨어뜨려 폴링을 지속시킨다.
function mapSyncStatus(
  raw: SteamStatusResponse['steam_sync_status'],
): SteamSyncStatusValue {
  return raw && TERMINAL_STATUSES.includes(raw)
    ? (raw as SteamSyncStatusValue)
    : 'syncing';
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
//   elapsedSeconds는 폴링 훅이 시작시각 기준으로 채운다(서비스는 서버 응답만 매핑).
//   scenario는 mock 전용 분기용 — 실서버에선 무시된다(searchParams로 전달).
export async function getSyncStatus(
  signal?: AbortSignal,
  scenario?: string,
): Promise<SteamSyncResult> {
  const searchParams = scenario ? { scenario } : undefined;
  try {
    const res = await api
      .get('api/v1/steam/status', { signal, searchParams })
      .json<SteamStatusResponse>();
    return {
      status: mapSyncStatus(res.steam_sync_status),
      steamId: res.steam_id_64 ?? null,
      avatarUrl: res.steam_avatar_url ?? null,
      lastSyncedAt: res.last_synced_at ?? null,
    };
  } catch (error) {
    // AbortError(언마운트/리페치 취소)는 그대로 흘려 TanStack Query가 처리하게 둔다.
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new SteamSyncError('generic');
  }
}
