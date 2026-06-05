import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { STEAM_POLL_INTERVAL_MS, STEAM_POLL_TIMEOUT_MS } from '@/config/steam';
import { getSyncStatus } from '@/services/steam';
import {
  type SteamSyncResult,
  isTerminalSyncStatus,
} from '@/features/onboarding/types';

// 스팀 동기화 상태 폴링 훅 (STEAM-INTER-FE-001).
// 종료상태(success/private/failed/timeout) 도달 시 폴링을 멈추고, 클라 타임아웃(40s) 초과 시
//   서버가 아직 IN_PROGRESS여도 status를 'timeout'으로 강제 반환한다(REQ-004 잠정).
// elapsedSeconds는 훅이 시작시각 기준으로 계산해 결과에 주입한다(서비스는 0으로 둠).

// enabled: 폴링 가동 여부(연동 진행 화면 마운트 시 true).
// scenario: mock 전용 종료상태 분기(SUCCESS|PRIVATE|FAILED|TIMEOUT). 실서버에선 무시된다.
// runId: 연동 세션 nonce. 연동/재시도마다 호스트가 증가시켜 새 queryKey로 만든다.
//   (없으면 직전 종료상태가 캐시에 남아 재시도 시 폴링 없이 곧장 결과로 튀는 "되돌이" 발생)
export function useSteamSyncStatus(
  enabled: boolean,
  scenario?: string,
  runId?: number,
) {
  // 폴링 시작 시각(ms). enabled가 켜진 순간 1회 기록한다.
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (enabled && startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
    // 비활성화되면 다음 활성화 때 다시 측정하도록 초기화한다.
    if (!enabled) {
      startedAtRef.current = null;
    }
  }, [enabled]);

  const query = useQuery<SteamSyncResult>({
    queryKey: ['steam', 'sync-status', scenario, runId],
    queryFn: ({ signal }) => getSyncStatus(signal, scenario),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    // 종료상태면 폴링 중단, 아니면 2초 주기로 재조회.
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && isTerminalSyncStatus(data.status)) return false;
      return STEAM_POLL_INTERVAL_MS;
    },
  });

  // 경과초 계산(시작시각 기준). 시작 전이면 0.
  const elapsedSeconds =
    startedAtRef.current === null
      ? 0
      : Math.floor((Date.now() - startedAtRef.current) / 1000);

  // 클라 타임아웃 초과 + 아직 종료상태가 아니면 'timeout'으로 강제 override.
  const timedOut =
    startedAtRef.current !== null &&
    Date.now() - startedAtRef.current >= STEAM_POLL_TIMEOUT_MS;

  // 도메인 결과 — query.data/timedOut가 바뀔 때만 새 객체로 만든다(참조 안정).
  //   경과초는 결과에 섞지 않고 별도로 반환한다. (섞으면 매 렌더 새 객체 → navigate 반복 유발)
  const data = useMemo<SteamSyncResult | undefined>(() => {
    const base = query.data;
    if (!base) {
      // 첫 응답 전 타임아웃 — 합성 timeout 결과로 화면이 멈추지 않게 한다.
      return timedOut
        ? {
            status: 'timeout',
            foundGames: null,
            steamNickname: null,
            errorMessage: null,
          }
        : undefined;
    }
    // 타임아웃 초과이고 서버가 아직 진행 중이면 timeout으로 덮어쓴다.
    if (timedOut && !isTerminalSyncStatus(base.status)) {
      return { ...base, status: 'timeout' };
    }
    return base;
  }, [query.data, timedOut]);

  return { ...query, data, elapsedSeconds } as typeof query & {
    data: SteamSyncResult | undefined;
    elapsedSeconds: number;
  };
}
