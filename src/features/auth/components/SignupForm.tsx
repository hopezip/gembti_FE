import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { useEmailAvailability } from '@/features/auth/hooks/useEmailAvailability';
import { type SignupInput, signupSchema } from '@/lib/schemas/auth';
import {
  requestEmailVerification,
  SignupError,
  type SignupErrorKind,
  signupWithEmail,
} from '@/services/auth';
import { PasswordInput } from './PasswordInput';
import { PasswordRules } from './PasswordRules';
import { TermsAgreement } from './TermsAgreement';

// 폼 레벨 에러(개별 필드와 분리, role=alert) 메시지 매핑.
const FORM_ERROR_MESSAGE: Record<SignupErrorKind, string> = {
  'email-taken': '이미 가입된 이메일입니다. 로그인을 시도해보세요.',
  generic: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

// 이메일 실시간 중복확인(LOGIN-FE-004 d 항목) 상태 표시 문구/색 매핑.
//   error는 "확인 불가"로 degrade하며 표시하지 않는다(가입을 막지 않음, 서버 409가 최종 안전망).
const EMAIL_HINT: Record<
  'checking' | 'available' | 'taken',
  {
    message: string;
    color: string;
  }
> = {
  checking: { message: '확인 중…', color: 'fg.subtle' },
  available: { message: '사용 가능한 이메일이에요', color: 'success.fg' },
  taken: { message: '이미 사용 중인 이메일이에요', color: 'danger.fg' },
};

interface SignupFormProps {
  // STEP1(계정정보) 성공 + 인증 코드 발송 후 호출. 가입 이메일과 발송 유효시간(초)을 넘겨
  //   페이지가 STEP2(이메일 인증)로 전환한다.
  onSuccess?: (email: string, ttlSeconds: number) => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      ageOver14: false,
      termsOfService: false,
      privacy: false,
      marketing: false,
    },
  });

  // 비밀번호 규칙/강도 실시간 표시용.
  const password = watch('password') ?? '';
  // 이메일 실시간 중복확인(STEP1) — 입력값을 debounce 후 형식 통과 시 조회.
  const email = watch('email') ?? '';
  const { status: emailStatus, isTaken: emailTaken } =
    useEmailAvailability(email);

  // 가입(mock) 성공 → 인증 코드 발송 → STEP2 전환. 발송 응답의 ttlSeconds를 onSuccess로 넘긴다.
  const mutation = useMutation({
    mutationFn: async (values: SignupInput) => {
      // passwordConfirm은 클라 검증용이라 서버 전송에서 제외한다.
      await signupWithEmail({
        email: values.email,
        password: values.password,
        ageOver14: values.ageOver14,
        termsOfService: values.termsOfService,
        privacy: values.privacy,
        marketing: values.marketing,
      });
      // STEP2 진입과 동시에 인증 코드를 발송한다(유효시간 확보).
      const { ttlSeconds } = await requestEmailVerification(values.email);
      return { email: values.email, ttlSeconds };
    },
    onSuccess: (data) => onSuccess?.(data.email, data.ttlSeconds),
  });

  let formErrorMessage: string | null = null;
  if (mutation.isError) {
    const kind =
      mutation.error instanceof SignupError ? mutation.error.kind : 'generic';
    formErrorMessage = FORM_ERROR_MESSAGE[kind];
  }

  const isSubmitting = mutation.isPending;

  // 검증 실패 시 첫 오류 필드로 focus 이동(a11y).
  const onInvalid = () => {
    if (errors.email) setFocus('email');
    else if (errors.password) setFocus('password');
    else if (errors.passwordConfirm) setFocus('passwordConfirm');
  };

  const onValid = (values: SignupInput) => {
    // 실시간 중복확인이 'taken'이면 서버 409 전에 제출을 막는다(이중 안전).
    if (emailTaken) {
      setFocus('email');
      return;
    }
    mutation.mutate(values);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className={vstack({ gap: '5', alignItems: 'stretch' })}
    >
      <Field
        label="이메일"
        id="signup-email"
        required
        error={errors.email?.message}
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          disabled={isSubmitting}
          {...register('email')}
        />
      </Field>

      {/* 이메일 실시간 중복확인 상태(확인 중 / 사용 가능 / 이미 사용 중).
          형식 미통과(idle)·확인 불가(error)는 표시하지 않는다. 필드 에러와는 별개 표시다. */}
      {emailStatus !== 'idle' && emailStatus !== 'error' && (
        <p
          role="status"
          className={css({
            textStyle: 'body.sm',
            color: EMAIL_HINT[emailStatus].color,
            mt: '-3',
          })}
        >
          {EMAIL_HINT[emailStatus].message}
        </p>
      )}

      <Field
        label="비밀번호"
        id="signup-password"
        required
        error={errors.password?.message}
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="영문·숫자 포함 10자 이상"
          disabled={isSubmitting}
          {...register('password')}
        />
      </Field>

      {/* 비밀번호 규칙/강도 실시간 표시(검증 출처는 schema) */}
      <PasswordRules value={password} />

      <Field
        label="비밀번호 확인"
        id="signup-password-confirm"
        required
        error={errors.passwordConfirm?.message}
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="비밀번호 재입력"
          disabled={isSubmitting}
          {...register('passwordConfirm')}
        />
      </Field>

      {/* 약관 동의 그룹(필수3 + 선택1) */}
      <TermsAgreement control={control} setValue={setValue} errors={errors} />

      {/* 폼 레벨 에러(409/네트워크) */}
      {formErrorMessage && (
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
          {formErrorMessage}
        </p>
      )}

      {/* STEP1 성공 시 페이지가 STEP2로 전환하므로 별도 mock 성공 안내는 두지 않는다. */}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting || emailTaken}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? '처리 중…' : '인증 코드 받기 →'}
      </Button>
    </form>
  );
}
