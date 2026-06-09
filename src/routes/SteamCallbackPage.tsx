import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import type { SteamSyncResult } from '@/features/onboarding/types';

// 스팀 OAuth/OpenID 콜백 기술 라우트 (/auth/steam/callback, Technical). STEAM-INTER-FE-001.
// 사용자용 화면이 아니라, 백엔드 인증 리다이렉트가 떨어지는 착지점이다.
//   - ?error 있으면 → 진입 화면(/onboarding/steam)으로 보내되 합성 실패결과(result)를 실어
//                     곧장 result step(공용 에러 화면)으로 안내한다.
//   - 정상 복귀면 → 진입 화면으로 보내 startPolling=true로 곧장 동기화 폴링을 시작시킨다.
// 통합 플로우(단일 페이지)라 결과 전용 라우트는 없다 — 결과는 진입 화면 state로 넘긴다.
// 모두 replace 이동이라 뒤로가기 시 콜백 URL이 히스토리에 남지 않는다.

// 콜백 에러 시 결과 화면에 넘길 합성 실패 결과.
const FAILED_RESULT: SteamSyncResult = {
  status: 'failed',
  steamId: null,
  avatarUrl: null,
  lastSyncedAt: null,
};

export function SteamCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      // 인증 실패 — 진입 화면으로 보내 합성 실패결과를 result step으로 렌더시킨다.
      navigate('/onboarding/steam', {
        state: { result: FAILED_RESULT },
        replace: true,
      });
      return;
    }
    // 정상 콜백 — 진입 화면에서 곧장 폴링을 시작시킨다.
    navigate('/onboarding/steam', {
      state: { startPolling: true },
      replace: true,
    });
  }, [searchParams, navigate]);

  // 리다이렉트 직전 잠깐 보이는 미니 스피너.
  return (
    <main
      className={css({
        minH: '100vh',
        display: 'grid',
        placeItems: 'center',
        bg: 'bg.canvas',
        p: '8',
      })}
    >
      <div className={vstack({ gap: '4', alignItems: 'center' })}>
        <span
          aria-hidden="true"
          className={css({
            w: '10',
            h: '10',
            borderRadius: 'full',
            border: '3px solid',
            borderColor: 'border.default',
            borderTopColor: 'accent.default',
            animation: 'spin',
          })}
        />
        <p className={css({ textStyle: 'body.sm', color: 'fg.muted' })}>
          Steam 인증을 확인하고 있어요…
        </p>
      </div>
    </main>
  );
}
