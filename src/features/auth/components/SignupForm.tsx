import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { type SignupInput, signupSchema } from '@/lib/schemas/auth';
import {
  type AuthUser,
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

interface SignupFormProps {
  // 회원가입(mock) 성공 시 호출. STEP2(이메일 인증)는 LOGIN-FE-004에서 연결한다.
  onSuccess?: (user: AuthUser) => void;
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

  const mutation = useMutation({
    mutationFn: signupWithEmail,
    onSuccess: (data) => onSuccess?.(data.user),
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
    // passwordConfirm은 클라 검증용이라 서버 전송에서 제외한다.
    mutation.mutate({
      email: values.email,
      password: values.password,
      ageOver14: values.ageOver14,
      termsOfService: values.termsOfService,
      privacy: values.privacy,
      marketing: values.marketing,
    });
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

      {/* mock 성공 안내 — 실제 인증 코드 발송(STEP2)은 LOGIN-FE-004에서 연결 */}
      {mutation.isSuccess && (
        <p
          role="status"
          className={css({
            textStyle: 'body.sm',
            color: 'success.fg',
            bg: 'success.soft',
            border: '1px solid',
            borderColor: 'success.default',
            borderRadius: 'lg',
            px: '3',
            py: '2',
          })}
        >
          가입 정보가 확인됐어요. 다음 단계(이메일 인증)는 준비 중입니다.
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? '처리 중…' : '인증 코드 받기 →'}
      </Button>
    </form>
  );
}
