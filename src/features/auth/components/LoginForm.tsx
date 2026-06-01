import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { type LoginInput, loginSchema } from '@/lib/schemas/auth';
import {
  type AuthUser,
  LoginError,
  type LoginErrorKind,
  login,
} from '@/services/auth';

// 폼 레벨 에러(개별 필드 에러와 분리, role=alert)에 표시할 메시지 매핑.
// 401(ERROR-FE-003)과 그 외 일반 오류를 구분한다.
const FORM_ERROR_MESSAGE: Record<LoginErrorKind, string> = {
  'invalid-credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  generic: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

interface LoginFormProps {
  // 로그인 성공 시 호출(authStore 갱신 + redirect 이동은 페이지가 담당).
  onSuccess: (user: AuthUser) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    // 제출 시 검증 + 제출 이후 onChange 재검증(screens/login.md).
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // 폼 레벨 에러 분기(401 vs 일반)를 위해 mutation 에러를 보관한다.
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => onSuccess(data.user),
  });

  // 폼 레벨 에러 메시지(서버 인증 실패/네트워크). 검증 에러는 Field가 담당한다.
  let formErrorMessage: string | null = null;
  if (mutation.isError) {
    const kind =
      mutation.error instanceof LoginError ? mutation.error.kind : 'generic';
    formErrorMessage = FORM_ERROR_MESSAGE[kind];
  }

  const isSubmitting = mutation.isPending;

  // 검증 실패 시 첫 오류 필드로 focus 이동(a11y).
  const onInvalid = () => {
    if (errors.email) setFocus('email');
    else if (errors.password) setFocus('password');
  };

  const onValid = (values: LoginInput) => {
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
        id="login-email"
        required
        error={errors.email?.message}
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          {...register('email')}
        />
      </Field>

      <Field
        label="비밀번호"
        id="login-password"
        required
        error={errors.password?.message}
      >
        <Input
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          {...register('password')}
        />
      </Field>

      {/* 폼 레벨 에러(401/네트워크) — role=alert로 스크린리더 즉시 통지 */}
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

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? '로그인 중…' : '로그인'}
      </Button>
    </form>
  );
}
