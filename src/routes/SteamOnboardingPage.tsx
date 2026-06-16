import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { STEAM_AUTH_START_URL } from '@/config/steam';
import { SteamLinkInvite } from '@/features/onboarding/components/SteamLinkInvite';
import type { SteamLinkOrigin } from '@/features/onboarding/types';

// 스팀 연동 온보딩 (/onboarding/steam, Auth). STEAM-INTER-FE-008.
//   "연동하기" → 백엔드 OpenID(GET /api/v1/auth/steam)로 브라우저를 위임한다.
//   백엔드가 Steam 인증을 처리하고 /steam/callback으로 복귀시키면 SteamCallbackPage가
//   세션을 복원(refresh+me)하고 홈/설문으로 보낸다.
//
// ⚠️ 이전(STEAM-INTER-FE-001) 구조는 mock 시대의 sync-status/skip 폴링이었으나, 라이브 백엔드에서
//   해당 엔드포인트가 제거(404)되어 실 OpenID 위임으로 단순화했다. 폴링/결과 화면(SteamSync*)과
//   useSteamSyncStatus·useSteamSkip 훅은 이 흐름에서 더 이상 쓰지 않는다(추후 정리 대상).
//
// origin 결정: ?origin 쿼리 → location.state.origin → 기본 'emailSignup'.

function normalizeOrigin(value: string | null | undefined): SteamLinkOrigin {
  return value === 'steamSignup' ? 'steamSignup' : 'emailSignup';
}

export function SteamOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const locationState = location.state as { origin?: string } | null;
  const origin = normalizeOrigin(
    searchParams.get('origin') ?? locationState?.origin,
  );

  // 연동하기 — 실서버 OpenID로 위임(전체 페이지 이동). 복귀는 /steam/callback이 받는다.
  const startLink = () => {
    window.location.assign(STEAM_AUTH_START_URL);
  };

  // 건너뛰기 — 설문 인트로로(실서버엔 별도 skip 엔드포인트가 없다).
  const goSurvey = () => {
    navigate('/survey/intro');
  };

  return (
    <SteamLinkInvite origin={origin} onLink={startLink} onSkip={goSurvey} />
  );
}
