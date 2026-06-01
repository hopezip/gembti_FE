import { css } from 'styled-system/css';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { safeRedirect } from '@/features/auth/lib/safeRedirect';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { AuthUser } from '@/services/auth';

// /login 페이지 엔트리. AuthCard로 LoginForm을 감싸고,
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
      title="이메일로 로그인"
      footer={
        // 후속 자리표시(이번 구현 대상 아님 — screens/login.md 범위 밖)
        <div
          aria-hidden="true"
          className={css({
            borderTop: '1px solid',
            borderColor: 'border.default',
            pt: '4',
            textStyle: 'body.sm',
            color: 'fg.subtle',
            textAlign: 'center',
          })}
        >
          Steam 로그인 · 자동 로그인 (준비 중)
        </div>
      }
    >
      <LoginForm onSuccess={handleSuccess} />
    </AuthCard>
  );
}
