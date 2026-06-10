import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { toaster } from '@/components/ui/Toast';
import { refreshAccessToken } from '@/lib/ky';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { getMe } from '@/services/auth';

// 스팀 OpenID 콜백 기술 라우트 (/steam/callback, Technical). STEAM-INTER-FE-007.
// 사용자용 화면이 아니라, 백엔드 OpenID 인증 리다이렉트가 떨어지는 착지점이다.
// 백엔드는 결과를 `result` 쿼리로 알려준다(토큰은 바디로 주지 않는다):
//   - result=success          → 기존 유저. refresh(쿠키)+me로 세션을 복원하고 홈으로.
//   - result=signup_required  → 신규 유저. Steam 가입은 미지원이라 이메일 회원가입(/signup)으로 안내한다.
//   - result=failed (그 외)   → 인증 실패. 사유를 토스트로 알리고 로그인으로.
// 모두 replace 이동이라 뒤로가기 시 콜백 URL이 히스토리에 남지 않는다.
export function SteamCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const result = searchParams.get('result');

    // 신규 유저 — Steam 가입은 미지원. 이메일 회원가입으로 안내한다(complete-signup 제거됨).
    if (result === 'signup_required') {
      toaster.create({
        type: 'error',
        title: 'Steam으로는 가입할 수 없어요',
        description: '이메일로 회원가입해주세요.',
      });
      navigate('/signup', { replace: true });
      return;
    }

    // 실패(또는 알 수 없는 결과) — 사유를 알리고 로그인으로.
    if (result !== 'success') {
      const reason = searchParams.get('reason');
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
        navigate('/login', { replace: true });
        return;
      }
      try {
        const user = await getMe(accessToken);
        if (cancelled) return;
        setSession({ user, accessToken });
        // 홈으로 — 개인화/게스트 분기는 MainPage가 hasCompletedSurvey로 처리한다(로그인과 동일 랜딩).
        navigate('/', { replace: true });
      } catch {
        if (cancelled) return;
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
