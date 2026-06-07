import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSteamSkip } from '@/features/onboarding/api/steamSkip';
import { useSteamSyncStatus } from '@/features/onboarding/api/steamSyncStatus';
import { SteamLinkInvite } from '@/features/onboarding/components/SteamLinkInvite';
import { SteamSyncError } from '@/features/onboarding/components/SteamSyncError';
import { SteamSyncLoading } from '@/features/onboarding/components/SteamSyncLoading';
import { SteamSyncPrivate } from '@/features/onboarding/components/SteamSyncPrivate';
import { SteamSyncSuccess } from '@/features/onboarding/components/SteamSyncSuccess';
import {
  type SteamLinkOrigin,
  type SteamSyncResult,
  isTerminalSyncStatus,
} from '@/features/onboarding/types';

// 스팀 연동 온보딩 단일 플로우 (/onboarding/steam, Auth). STEAM-INTER-FE-001.
//   step='intro'   : 연동 유도(SteamLinkInvite). 회원가입 완료 후 진입(origin별 카피 분기).
//   step='syncing' : 동기화 진행(SteamSyncLoading) + useSteamSyncStatus 폴링.
//   step='result'  : 결과(success→Success / private→Private / failed·timeout→Error).
//
// invite→스피너→결과를 한 화면 안에서 step 전환으로 처리한다(별도 result 라우트로 navigate 안 함).
//   이전 구조(종료상태 시 /onboarding/steam/result로 replace)는 재마운트·캐시·state 유실이 얽혀
//   "result→로딩 되돌이" 버그를 냈다. 단일 페이지 + runId nonce로 그 클래스를 구조적으로 제거한다.
//
// origin 결정 우선순위: useSearchParams ?origin → location.state.origin → 기본 'emailSignup'.
//   가입 완료 진입은 'steamSignup'(환영 배지 + "마지막으로, Steam을 연동할까요?")을 넘긴다.
// location.state.startPolling=true(콜백/재시도)면 초기 step을 'syncing'으로 시작한다.
// location.state.result(콜백 에러 합성 결과)가 있으면 초기 step을 'result'로 시작한다.

// ?origin 쿼리/state 값을 도메인 SteamLinkOrigin으로 정규화(허용값 외엔 기본값).
function normalizeOrigin(value: string | null | undefined): SteamLinkOrigin {
  return value === 'steamSignup' ? 'steamSignup' : 'emailSignup';
}

export function SteamOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const locationState = location.state as {
    origin?: string;
    startPolling?: boolean;
    result?: SteamSyncResult;
  } | null;

  // origin: 쿼리 우선, 없으면 state, 없으면 기본.
  const origin = normalizeOrigin(
    searchParams.get('origin') ?? locationState?.origin,
  );

  // mock 시나리오 분기(?scenario). 실서버에선 무시된다.
  const scenario = searchParams.get('scenario') ?? undefined;

  // 진입 step: 콜백 에러 합성결과(result) > 콜백/재시도(startPolling) > 기본(intro).
  const [step, setStep] = useState<'intro' | 'syncing' | 'result'>(
    locationState?.result
      ? 'result'
      : locationState?.startPolling
        ? 'syncing'
        : 'intro',
  );
  // result step에서 렌더할 종료상태 결과(로컬 보관 — navigate state에 의존하지 않는다).
  const [result, setResult] = useState<SteamSyncResult | null>(
    locationState?.result ?? null,
  );
  // 연동 세션 nonce. 연동/재시도마다 증가시켜 폴링 캐시를 새로 판다(되돌이 방지).
  const [runId, setRunId] = useState(0);

  const skip = useSteamSkip();

  // 폴링은 step==='syncing'일 때만 가동.
  const { data, elapsedSeconds } = useSteamSyncStatus(
    step === 'syncing',
    scenario,
    runId,
  );

  // 폴링이 종료상태에 도달하면 결과를 보관하고 result step으로 전환한다.
  //   navigate 없이 state 전환이라 step이 'result'가 되는 순간 이 효과는 다시 가드에 막힌다(루프 없음).
  useEffect(() => {
    if (step !== 'syncing' || !data) return;
    if (!isTerminalSyncStatus(data.status)) return;
    setResult(data);
    setStep('result');
  }, [step, data]);

  // 폴링 시작 — 새 runId로 캐시를 갈고 syncing 진입.
  //   운영(REQ-003 확정 시): STEAM_AUTH_START_URL로 브라우저를 이동시키는 자리.
  //   콜백(/auth/steam/callback)이 startPolling=true로 복귀해 폴링을 시작한다.
  const startSyncing = () => {
    setResult(null);
    setRunId((n) => n + 1);
    setStep('syncing');
  };

  // 둘러보기/건너뛰기/설문으로 진행 — skip 성공 시 설문 인트로로.
  const goSurvey = () => {
    skip.mutate(undefined, {
      onSuccess: () => navigate('/survey/intro'),
    });
  };

  // 진행 취소 — 유도 화면으로 되돌린다(폴링도 enabled=false로 멈춤).
  const handleCancel = () => {
    setStep('intro');
  };

  if (step === 'syncing') {
    return (
      <SteamSyncLoading
        elapsedSeconds={elapsedSeconds}
        onCancel={handleCancel}
      />
    );
  }

  if (step === 'result' && result) {
    if (result.status === 'success') {
      return (
        <SteamSyncSuccess
          foundGames={result.foundGames ?? 0}
          onStartSurvey={() => navigate('/survey/intro')}
          onGoMain={() => navigate('/')}
        />
      );
    }
    if (result.status === 'private') {
      return (
        <SteamSyncPrivate onRetry={startSyncing} onSkipToSurvey={goSurvey} />
      );
    }
    // 'failed' | 'timeout' — 공용 에러 화면.
    return <SteamSyncError onRetry={startSyncing} onSkipToSurvey={goSurvey} />;
  }

  // step==='intro' (또는 result인데 result가 비어있는 비정상 폴백).
  return (
    <SteamLinkInvite origin={origin} onLink={startSyncing} onSkip={goSurvey} />
  );
}
