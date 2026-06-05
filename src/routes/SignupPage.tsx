import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthTabs } from '@/features/auth/components/AuthTabs';
import { EmailVerificationForm } from '@/features/auth/components/EmailVerificationForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { SteamButton } from '@/features/auth/components/SteamButton';
import type { AuthSession } from '@/services/auth';
import { sendEmailCode } from '@/services/auth';
import { useAuthStore } from '@/lib/store/useAuthStore';

// /signup 페이지 엔트리 — Figma auth-modal(signup) 2단계 (LOGIN-FE-005 재구성).
//   STEP1(계정정보, SignupForm) → STEP2(인증 + 프로필, EmailVerificationForm, node 4003:2117).
// 라우트(/signup)는 routing.md SSOT라 무변경이며, 단계 전환은 이 페이지의 내부 step 상태(1|2)로만 처리한다.
// 새로고침 시 step은 1로 리셋된다(딥링크/복원 미요구).
//
// 비밀번호·약관 동의는 STEP1에서 받아 STEP2 최종 signup까지 페이지 state로 보관한다(서버엔 signup 시 한 번만 전송).
// STEP1 제출 시 send-code를 호출한 뒤 STEP2로 전환한다(타이머는 상수 TTL — 응답에 expires_in 없음).
//
// 가입 완료(verify-code→signup) 시 발급된 세션을 setSession으로 세우면 자동 로그인된다.
//   이후 이동은 **PublicOnlyRoute에 맡긴다**(STEAM-INTER-FE-001 진입 배선):
//   /signup은 Public-only 가드라 setSession으로 status가 authenticated가 되는 순간
//   가드가 인증 사용자를 redirect 목적지로 보낸다. setSession의 동기 리렌더가 가드를 먼저 깨우므로
//   imperative navigate는 race에서 지고 홈으로 새버린다 → 그래서 redirect를 STEP2 진입 때 미리 심어둔다.
//   redirect=온보딩(origin='steamSignup', "마지막으로, Steam을 연동할까요?") → /onboarding/steam(Auth) 통과.
const POST_SIGNUP_REDIRECT = '/onboarding/steam?origin=steamSignup';

export function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [step, setStep] = useState<1 | 2>(1);
  // STEP2로 넘길 가입 컨텍스트(이메일 + 비밀번호 + 약관 동의). 최종 signup까지 페이지가 보관한다.
  const [signupContext, setSignupContext] = useState<{
    email: string;
    password: string;
    termsAgreed: boolean;
    privacyAgreed: boolean;
  } | null>(null);

  // STEP1 제출 → send-code → STEP2 전환.
  const sendCodeMutation = useMutation({
    mutationFn: ({
      email,
    }: {
      email: string;
      password: string;
      termsAgreed: boolean;
      privacyAgreed: boolean;
    }) => sendEmailCode(email),
    onSuccess: (_data, variables) => {
      setSignupContext({
        email: variables.email,
        password: variables.password,
        termsAgreed: variables.termsAgreed,
        privacyAgreed: variables.privacyAgreed,
      });
      setStep(2);
      // 가입 완료 시 PublicOnlyRoute가 인증 사용자를 온보딩으로 보내도록 redirect를 미리 심는다.
      //   (setSession의 동기 리렌더가 가드를 먼저 깨우므로, redirect는 그 전에 location에 있어야 한다.)
      navigate('/signup', {
        replace: true,
        state: { redirect: POST_SIGNUP_REDIRECT },
      });
    },
  });

  const handleSignedUp = (result: AuthSession) => {
    // 가입 완료 → 세션만 세우면 PublicOnlyRoute(/signup)가 미리 심어둔 redirect(온보딩)로 보낸다.
    setSession({
      user: result.user,
      accessToken: result.accessToken,
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
            passwordConfirm={signupContext.password}
            termsAgreed={signupContext.termsAgreed}
            privacyAgreed={signupContext.privacyAgreed}
            onSignedUp={handleSignedUp}
          />
        )
      )}
    </AuthCard>
  );
}
