import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { toaster } from '@/components/ui/Toast';
import { safeRedirect } from '@/features/auth/lib/safeRedirect';
import type { SteamLinkStatus } from '@/features/mypage/components/SteamConnectCard';
import {
  clearSteamAuthIntent,
  readSteamAuthIntent,
} from '@/features/onboarding/lib/steamAuthIntent';
import { linkSteam } from '@/lib/api/steam';
import { refreshAccessToken } from '@/lib/ky';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { getMe, getMeRaw } from '@/services/auth';

// 스팀 OpenID 콜백 기술 라우트 (/steam/callback, Technical). STEAM-INTER-FE-007.
// 사용자용 화면이 아니라, 백엔드 OpenID 인증 리다이렉트가 떨어지는 착지점이다.
// 백엔드는 결과를 `result` 쿼리로 알려준다(토큰은 바디로 주지 않는다):
//   - result=success          → 기존 유저. refresh(쿠키)+me로 세션을 복원하고 홈으로.
//                               마이페이지 연동 intent가 있으면 steam_id로 POST /steam/link 후 /mypage로.
//   - result=signup_required  → 신규 유저. Steam 신규 가입은 미지원이라(LOGIN-FE-014)
//                               "이메일로 가입" 안내 토스트 후 /signup으로 돌린다.
//   - result=failed (그 외)   → 인증 실패. 사유를 토스트로 알리고 로그인으로.
// 마이페이지 연동 intent일 때는 토스트 대신 결과(success/already_linked/failed)를 returnTo로
//   navigate state(steamLinkStatus)로 넘겨, SteamConnectCard가 버튼 옆에 영구 텍스트로 명시한다
//   (STEAM-INTER-FE-009 — 토스트가 금방 사라져 결과를 놓치던 문제).
// 모두 replace 이동이라 뒤로가기 시 콜백 URL이 히스토리에 남지 않는다.
export function SteamCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const result = searchParams.get('result');
    const intent = readSteamAuthIntent();
    const isLinkIntent = intent?.type === 'link';
    const returnTo = safeRedirect(isLinkIntent ? intent.returnTo : null);

    function clearLinkIntent() {
      if (isLinkIntent) clearSteamAuthIntent();
    }

    // 연동 결과를 returnTo로 넘긴다 — SteamConnectCard가 인라인 텍스트로 보여준다.
    function navigateLinkResult(status: SteamLinkStatus) {
      navigate(returnTo, { replace: true, state: { steamLinkStatus: status } });
    }

    // 신규 유저 — Steam 신규 가입은 미지원이다(LOGIN-FE-014). 가입 화면으로 보내지 않고
    //   이메일 회원가입을 안내한 뒤 /signup으로 돌린다(Steam 로그인은 기존 유저 전용).
    if (result === 'signup_required') {
      clearLinkIntent();
      if (isLinkIntent) {
        navigateLinkResult('failed');
        return;
      }
      toaster.create({
        type: 'error',
        title: 'Steam으로는 가입할 수 없어요',
        description: '이메일로 회원가입해주세요.',
      });
      navigate('/signup', { replace: true });
      return;
    }

    // 실패(또는 알 수 없는 결과) — 연동 intent면 인라인 결과로, 아니면 토스트 후 로그인으로.
    if (result !== 'success') {
      const reason = searchParams.get('reason');
      clearLinkIntent();
      if (isLinkIntent) {
        navigateLinkResult(
          reason === 'steam_already_linked' ? 'already_linked' : 'failed',
        );
        return;
      }
      toaster.create({
        type: 'error',
        title: 'Steam 인증에 실패했어요',
        description: reason ? `사유: ${reason}` : '잠시 후 다시 시도해주세요.',
      });
      navigate('/login', { replace: true });
      return;
    }

    // 기존 유저(success) — 토큰이 바디로 안 오므로 쿠키 refresh + me로 세션을 복원한다.
    let cancelled = false;
    (async () => {
      const accessToken = await refreshAccessToken();
      if (cancelled) return;
      if (!accessToken) {
        toaster.create({
          type: 'error',
          title: '로그인 세션 복원에 실패했어요',
          description: '다시 로그인해주세요.',
        });
        clearLinkIntent();
        navigate('/login', {
          replace: true,
          state: isLinkIntent ? { redirect: returnTo } : undefined,
        });
        return;
      }
      try {
        const user = await getMe(accessToken);
        if (cancelled) return;
        setSession({ user, accessToken });

        if (isLinkIntent) {
          const steamId =
            searchParams.get('steam_id') ?? searchParams.get('steam_id_64');

          if (!steamId || !/^\d{17}$/.test(steamId)) {
            clearLinkIntent();
            navigateLinkResult('failed');
            return;
          }

          // POST /steam/link는 OpenID success 단계에서 백엔드가 이미 링크해 409를 던지거나,
          //   200이어도 응답 본문이 비어 .json() 파싱에서 throw할 수 있다. 두 경우 모두 백엔드엔
          //   링크가 남아 라이브러리는 채워지므로, 호출이 실패하면 me로 실제 연동 상태를 한 번
          //   재확인해 이미 연동돼 있으면 성공으로 처리한다(MYPAGE-FE-019).
          let linked = true;
          try {
            await linkSteam({ steam_id: steamId });
          } catch {
            linked = await getMeRaw()
              .then((me) => me.steam_linked)
              .catch(() => false);
          }
          if (cancelled) return;
          clearLinkIntent();

          if (!linked) {
            navigateLinkResult('failed');
            return;
          }

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ['mypage', 'profile'],
            }),
            queryClient.invalidateQueries({
              queryKey: ['mypage', 'library'],
            }),
          ]);
          navigateLinkResult('success');
          return;
        }

        // 설문 미완료 유저는 설문 인트로로 유도하고, 완료 유저만 홈으로 보낸다(SURVEY-FE-006).
        //   홈의 개인화/게스트 분기는 MainPage가 hasCompletedSurvey로 처리한다.
        navigate(user.hasCompletedSurvey ? '/' : '/survey/intro', {
          replace: true,
        });
      } catch {
        if (cancelled) return;
        clearLinkIntent();
        if (isLinkIntent) {
          navigateLinkResult('failed');
          return;
        }
        toaster.create({
          type: 'error',
          title: '사용자 정보를 불러오지 못했어요',
          description: '다시 로그인해주세요.',
        });
        navigate('/login', { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, setSession]);

  // 리다이렉트/세션 복원 동안 잠깐 보이는 미니 스피너.
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
