import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthTabs } from '@/features/auth/components/AuthTabs';
import { EmailVerificationForm } from '@/features/auth/components/EmailVerificationForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { SteamButton } from '@/features/auth/components/SteamButton';
import { sendEmailCode } from '@/services/auth';

// /signup 페이지 엔트리 — Figma auth-modal(signup) 2단계 (LOGIN-FE-005 재구성).
//   STEP1(계정정보, SignupForm) → STEP2(인증 + 프로필, EmailVerificationForm, node 4003:2117).
// 라우트(/signup)는 routing.md SSOT라 무변경이며, 단계 전환은 이 페이지의 내부 step 상태(1|2)로만 처리한다.
// 새로고침 시 step은 1로 리셋된다(딥링크/복원 미요구).
//
// 비밀번호는 STEP1에서 받아 STEP2 최종 signup까지 페이지 state로 보관한다(서버엔 signup 시 한 번만 전송).
// STEP1 제출 시 send-code를 호출해 expires_in을 확보한 뒤 STEP2로 전환한다.
// STEP2 가입 완료(verify-code→signup) 성공 시 /login으로 이동하며 완료 안내를 location.state로 넘긴다.
//   (자동 로그인 세션이 발급되지만, mock 흐름 명확성을 위해 로그인 화면으로 보내 가입 완료를 안내한다.)
export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  // STEP2로 넘길 가입 컨텍스트(이메일 + 비밀번호 + 발송 유효시간).
  const [signupContext, setSignupContext] = useState<{
    email: string;
    password: string;
    expiresInSeconds: number;
  } | null>(null);

  // STEP1 제출 → send-code → STEP2 전환.
  const sendCodeMutation = useMutation({
    mutationFn: ({ email }: { email: string; password: string }) =>
      sendEmailCode(email),
    onSuccess: (data, variables) => {
      setSignupContext({
        email: variables.email,
        password: variables.password,
        expiresInSeconds: data.expiresInSeconds,
      });
      setStep(2);
    },
  });

  const handleSignedUp = () => {
    // 가입 완료 → 로그인 유도. 완료 안내를 location.state로 전달한다(LoginPage가 표시).
    navigate('/login', {
      replace: true,
      state: {
        notice: '회원가입이 완료됐어요. 가입한 계정으로 로그인해주세요.',
      },
    });
  };

  const eyebrow =
    step === 1 ? 'STEP 1 / 2 · 계정 정보' : 'STEP 2 / 2 · 인증 및 프로필';
  const subtitle =
    step === 1
      ? '이메일과 비밀번호를 입력해주세요. 다음 단계에서 인증 코드를 받게 돼요.'
      : '메일로 받은 인증 코드를 입력하고 프로필을 완성해주세요.';

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

          <SignupForm
            onSubmitStep1={(values) => sendCodeMutation.mutate(values)}
            isSubmitting={sendCodeMutation.isPending}
            formError={
              sendCodeMutation.isError
                ? '인증 코드 발송에 실패했어요. 잠시 후 다시 시도해주세요.'
                : null
            }
          />
        </>
      ) : (
        signupContext && (
          <EmailVerificationForm
            email={signupContext.email}
            password={signupContext.password}
            initialExpiresInSeconds={signupContext.expiresInSeconds}
            onSignedUp={handleSignedUp}
          />
        )
      )}
    </AuthCard>
  );
}
