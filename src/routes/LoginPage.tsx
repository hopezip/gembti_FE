import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthTabs } from '@/features/auth/components/AuthTabs';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SteamButton } from '@/features/auth/components/SteamButton';
import { safeRedirect } from '@/features/auth/lib/safeRedirect';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { AuthUser } from '@/services/auth';

// /login 페이지 엔트리. Figma auth-modal 구성으로 AuthCard 슬롯을 조립한다:
//   세그먼트 탭(로그인 active) → 헤딩/부제 → Steam 자리 버튼 → 구분선 → 이메일 로그인 폼.
// 로그인 성공 시 authStore를 갱신한 뒤 redirect 경로(또는 홈)로 이동한다.
// redirect 출처: querystring(`?redirect=`) 우선, 없으면 ProtectedRoute가 넘긴 location.state.redirect.
// 두 경로 모두 safeRedirect로 정규화해 오픈 리다이렉트를 막는다(앱 내부 상대경로만).
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const handleSuccess = (user: AuthUser) => {
    setAuthenticated(user);

    // querystring redirect 우선, 없으면 가드가 넘긴 state.redirect.
    const stateRedirect =
      (location.state as { redirect?: string } | null)?.redirect ?? null;
    const target = safeRedirect(searchParams.get('redirect') ?? stateRedirect);

    navigate(target, { replace: true });
  };

  return (
    <AuthCard
      tabs={<AuthTabs active="login" />}
      heading="로그인"
      subtitle="취향에 맞는 게임을 추천받으려면 로그인이 필요해요."
    >
      {/* Steam 소셜 로그인 자리(비활성, 후속 LOGIN-FE-002) */}
      <SteamButton />

      {/* 구분선 "— 또는 이메일로 로그인 —" (장식이라 a11y 트리에서 숨김) */}
      <div
        aria-hidden="true"
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '3',
          color: 'fg.subtle',
          textStyle: 'body.sm',
          _before: {
            content: '""',
            flex: '1',
            borderTop: '1px solid',
            borderColor: 'border.default',
          },
          _after: {
            content: '""',
            flex: '1',
            borderTop: '1px solid',
            borderColor: 'border.default',
          },
        })}
      >
        또는 이메일로 로그인
      </div>

      <LoginForm onSuccess={handleSuccess} />
    </AuthCard>
  );
}
