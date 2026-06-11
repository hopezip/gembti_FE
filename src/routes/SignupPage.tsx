import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthTabs } from '@/features/auth/components/AuthTabs';
import { EmailVerificationForm } from '@/features/auth/components/EmailVerificationForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { toaster } from '@/components/ui/Toast';
import type { AuthSession } from '@/services/auth';
import { SendCodeError, sendEmailCode } from '@/services/auth';
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
  // send-code 409(이미 가입된 이메일) — 이메일 입력칸 아래 인라인 표시. mutate 시 리셋, 이메일 변경 시 클리어.
  const [emailDuplicated, setEmailDuplicated] = useState<string | null>(null);
  // STEP2로 넘길 가입 컨텍스트(이메일 + 비밀번호 + 15세 확인). 최종 signup까지 페이지가 보관한다.
  //   ageConfirmed는 signup 시 terms_agreed/privacy_agreed 두 필드에 채워 전송된다(EmailVerificationForm 매핑).
  const [signupContext, setSignupContext] = useState<{
    email: string;
    password: string;
    ageConfirmed: boolean;
  } | null>(null);

  // STEP1 제출 → send-code → STEP2 전환.
  const sendCodeMutation = useMutation({
    mutationFn: ({
      email,
    }: {
      email: string;
      password: string;
      ageConfirmed: boolean;
    }) => sendEmailCode(email),
    onMutate: () => {
      // 재시도 시 이전 409 인라인 에러를 먼저 비운다.
      setEmailDuplicated(null);
    },
    onError: (error) => {
      // 이미 가입된 이메일(409) → 이메일 입력칸 아래 인라인 표시(토스트/이동 없음).
      //   generic 오류는 SignupForm formError(파생)로 표시된다(409와 이중노출 방지).
      if (error instanceof SendCodeError && error.kind === 'email-duplicated') {
        setEmailDuplicated('이미 있는 이메일입니다');
      }
    },
    onSuccess: (_data, variables) => {
      setSignupContext({
        email: variables.email,
        password: variables.password,
        ageConfirmed: variables.ageConfirmed,
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

  // 이메일 중복(409) → 토스트로 알리고 로그인 페이지로 보낸다(이미 가입된 계정 → 로그인 유도).
  const handleEmailDuplicated = (detail: string | null) => {
    toaster.create({
      type: 'error',
      title: '이미 가입된 이메일이에요',
      description: detail ?? '로그인 페이지에서 로그인해주세요.',
    });
    navigate('/login');
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
        // Steam 신규 가입은 미지원 — 회원가입은 이메일 전용이다(LOGIN-FE-014).
        //   Steam 소셜 로그인은 LoginPage에 유지되며, 신규 유저가 Steam 로그인을 시도하면
        //   콜백(SteamCallbackPage)이 "이메일로 가입" 안내로 돌린다.
        <SignupForm
          onSubmitStep1={(values) => sendCodeMutation.mutate(values)}
          isSubmitting={sendCodeMutation.isPending}
          emailError={emailDuplicated}
          onEmailChange={() => {
            // 이메일을 수정하면 409 인라인 에러를 비운다(generic 폼 에러도 함께 리셋).
            if (sendCodeMutation.isError) sendCodeMutation.reset();
            setEmailDuplicated(null);
          }}
          formError={
            sendCodeMutation.isError && !emailDuplicated
              ? '인증 코드 발송에 실패했어요. 잠시 후 다시 시도해주세요.'
              : null
          }
        />
      ) : (
        signupContext && (
          <EmailVerificationForm
            email={signupContext.email}
            password={signupContext.password}
            passwordConfirm={signupContext.password}
            termsAgreed={signupContext.ageConfirmed}
            privacyAgreed={signupContext.ageConfirmed}
            onSignedUp={handleSignedUp}
            onEmailDuplicated={handleEmailDuplicated}
          />
        )
      )}
    </AuthCard>
  );
}
