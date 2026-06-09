import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { toaster } from '@/components/ui/Toast';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { Checkbox } from '@/features/auth/components/Checkbox';
import { type SteamSignupInput, steamSignupSchema } from '@/lib/schemas/auth';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { completeSteamSignup, SteamSignupError } from '@/services/auth';

// Steam 신규 유저 추가정보 입력 화면 (/steam/complete-signup, Public). STEAM-INTER-FE-007.
// 콜백(SteamCallbackPage)이 result=signup_required일 때 signup_token을 state로 실어 이 화면으로 보낸다.
//   Steam은 비밀번호가 없어(OpenID) 이메일 + 닉네임 + [필수] 약관 2개만 받는다(gender/birth는 정책 미확정 제외).
// 가입 완료(201) 시 응답의 access_token/user로 세션을 세우고 홈으로 — 콜백 success 흐름과 동일 랜딩.
//   직접 접근(signup_token 없음)은 콜백을 거치지 않은 비정상이라 로그인으로 돌려보낸다.
export function SteamCompleteSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const signupToken =
    (location.state as { signupToken?: string } | null)?.signupToken ?? null;

  // 직접 접근 방어 — 가입 토큰 없이는 가입 불가.
  useEffect(() => {
    if (!signupToken) {
      toaster.create({
        type: 'error',
        title: '잘못된 접근이에요',
        description: 'Steam 로그인을 다시 시도해주세요.',
      });
      navigate('/login', { replace: true });
    }
  }, [signupToken, navigate]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SteamSignupInput>({
    resolver: zodResolver(steamSignupSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      nickname: '',
      termsAgreed: false,
      privacyAgreed: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: SteamSignupInput) =>
      completeSteamSignup({ signupToken: signupToken as string, ...values }),
    onSuccess: (session) => {
      setSession({ user: session.user, accessToken: session.accessToken });
      navigate('/', { replace: true });
    },
    onError: (error) => {
      // 가입 세션 만료(400) — 토스트로 알리고 로그인으로 보낸다(재인증 필요).
      if (
        error instanceof SteamSignupError &&
        error.kind === 'invalid-signup-token'
      ) {
        toaster.create({
          type: 'error',
          title: '가입 세션이 만료됐어요',
          description: error.detail ?? 'Steam 로그인을 다시 시도해주세요.',
        });
        navigate('/login', { replace: true });
      }
    },
  });

  if (!signupToken) return null;

  // 세션 만료(invalid-signup-token)는 토스트+이동으로 처리하므로, 폼에는 그 외 일반 에러만 표시한다.
  const isExpired =
    mutation.error instanceof SteamSignupError &&
    mutation.error.kind === 'invalid-signup-token';
  const genericError =
    mutation.isError && !isExpired
      ? ((mutation.error instanceof SteamSignupError
          ? mutation.error.detail
          : null) ?? '가입에 실패했어요. 잠시 후 다시 시도해주세요.')
      : null;

  return (
    <AuthCard
      tabs={null}
      eyebrow="STEAM 가입"
      heading="가입 완료"
      subtitle="서비스 이용을 위해 이메일과 닉네임을 입력해주세요."
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className={vstack({ gap: '5', alignItems: 'stretch' })}
      >
        <Field
          label="이메일"
          id="steam-signup-email"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={mutation.isPending}
            {...register('email')}
          />
        </Field>

        <Field
          label="닉네임"
          id="steam-signup-nickname"
          required
          error={errors.nickname?.message}
        >
          <Input
            type="text"
            placeholder="2~8자, 한글/영문/숫자"
            disabled={mutation.isPending}
            {...register('nickname')}
          />
        </Field>

        {/* [필수] 약관 동의 2개 — 이용약관 / 개인정보 처리방침 */}
        <div className={vstack({ gap: '2', alignItems: 'stretch' })}>
          <Controller
            control={control}
            name="termsAgreed"
            render={({ field }) => (
              <Checkbox
                checked={field.value === true}
                onCheckedChange={field.onChange}
              >
                <span className={css({ color: 'accent.fg' })}>[필수]</span>
                <span className={css({ ml: '1' })}>이용약관에 동의해요</span>
              </Checkbox>
            )}
          />
          {errors.termsAgreed && (
            <p
              role="alert"
              className={css({
                fontFamily: 'mono',
                fontSize: 'sm',
                color: 'danger.default',
              })}
            >
              {errors.termsAgreed.message}
            </p>
          )}

          <Controller
            control={control}
            name="privacyAgreed"
            render={({ field }) => (
              <Checkbox
                checked={field.value === true}
                onCheckedChange={field.onChange}
              >
                <span className={css({ color: 'accent.fg' })}>[필수]</span>
                <span className={css({ ml: '1' })}>
                  개인정보 처리방침에 동의해요
                </span>
              </Checkbox>
            )}
          />
          {errors.privacyAgreed && (
            <p
              role="alert"
              className={css({
                fontFamily: 'mono',
                fontSize: 'sm',
                color: 'danger.default',
              })}
            >
              {errors.privacyAgreed.message}
            </p>
          )}
        </div>

        {genericError && (
          <p
            role="alert"
            className={css({
              textStyle: 'body.sm',
              color: 'danger.fg',
              bg: 'danger.soft',
              border: '1px solid',
              borderColor: 'danger.default',
              borderRadius: 'lg',
              px: '3',
              py: '2',
            })}
          >
            {genericError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending || undefined}
        >
          {mutation.isPending ? '가입 중…' : '가입 완료하기'}
        </Button>
      </form>
    </AuthCard>
  );
}
