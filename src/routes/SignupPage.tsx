import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthTabs } from '@/features/auth/components/AuthTabs';
import { EmailVerificationForm } from '@/features/auth/components/EmailVerificationForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { SteamButton } from '@/features/auth/components/SteamButton';

// /signup 페이지 엔트리 — Figma auth-modal(signup) 2단계.
//   STEP1(계정정보, SignupForm) → STEP2(이메일 인증, EmailVerificationForm).
// 라우트(/signup)는 routing.md SSOT라 무변경이며, 단계 전환은 이 페이지의 내부 step 상태(1|2)로만 처리한다.
//   ("회원가입 이메일 인증 단계 = /signup 내부 step", routing.md)
// 새로고침 시 step은 1로 리셋된다(딥링크/복원 미요구).
//
// STEP1 성공 시 가입 이메일과 발송 유효시간(ttlSeconds)을 보관하고 STEP2로 전환한다.
//   (인증 코드 발송은 SignupForm이 트리거하고 ttl을 onSuccess로 넘긴다.)
// STEP2 인증 성공 시 /login으로 이동하며 "가입 완료" 안내를 location.state로 넘긴다.
//   원래 흐름상 다음 단계는 STEAM-INTER-FE-001(/onboarding/steam)이지만, 그 화면은 Auth 가드
//   라우트라 mock 회원가입만으로는 세션이 없어 진입할 수 없다(이번 범위 밖). 그래서 가입 완료 후
//   로그인을 유도하는 게 mock 단계에서 가장 명확하다. (Steam 연동은 로그인 후 STEAM-INTER-FE-001에서)
export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  // STEP2로 넘길 가입 컨텍스트(이메일 + 발송 유효시간).
  const [verifyContext, setVerifyContext] = useState<{
    email: string;
    ttlSeconds: number;
  } | null>(null);

  const handleStep1Success = (email: string, ttlSeconds: number) => {
    setVerifyContext({ email, ttlSeconds });
    setStep(2);
  };

  const handleVerified = () => {
    // 가입 완료 → 로그인 유도. /onboarding/steam은 Auth 라우트라 mock 세션 없이는 진입 불가하므로
    //   /login으로 보내고 안내 문구를 location.state로 전달한다(LoginPage가 표시).
    navigate('/login', {
      replace: true,
      state: {
        notice: '이메일 인증이 완료됐어요. 가입한 계정으로 로그인해주세요.',
      },
    });
  };

  const eyebrow =
    step === 1 ? 'STEP 1 / 2 · 계정 정보' : 'STEP 2 / 2 · 이메일 인증';
  const subtitle =
    step === 1
      ? '이메일과 비밀번호를 입력해주세요. 다음 단계에서 인증 코드를 받게 돼요.'
      : '메일로 받은 6자리 인증 코드를 입력해주세요.';

  return (
    <AuthCard
      tabs={<AuthTabs active="signup" />}
      eyebrow={eyebrow}
      heading="회원가입"
      subtitle={subtitle}
    >
      {step === 1 ? (
        <>
          {/* Steam 소셜 가입 자리(비활성, 후속 LOGIN-FE-002) */}
          <SteamButton label="Steam 계정으로 가입하기" />

          {/* 구분선 "— 또는 이메일로 가입 —" */}
          <AuthDivider>또는 이메일로 가입</AuthDivider>

          <SignupForm onSuccess={handleStep1Success} />
        </>
      ) : (
        verifyContext && (
          <EmailVerificationForm
            email={verifyContext.email}
            initialTtlSeconds={verifyContext.ttlSeconds}
            onVerified={handleVerified}
          />
        )
      )}
    </AuthCard>
  );
}
