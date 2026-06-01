import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { css } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { useResendCooldown } from '@/features/auth/hooks/useResendCooldown';
import { type VerifyCodeInput, verifyCodeSchema } from '@/lib/schemas/auth';
import {
  requestEmailVerification,
  VerifyError,
  type VerifyErrorKind,
  verifyEmailCode,
} from '@/services/auth';
import { CountdownTimer } from './CountdownTimer';

// STEP2 인증 코드 폼 레벨 에러 메시지 매핑.
const FORM_ERROR_MESSAGE: Record<VerifyErrorKind, string> = {
  'invalid-code': '인증 코드가 올바르지 않습니다. 다시 확인해주세요.',
  expired: '인증 코드가 만료되었습니다. 코드를 재전송해주세요.',
  generic: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

interface EmailVerificationFormProps {
  /** STEP1에서 전달된 가입 이메일. */
  email: string;
  /** 발송 응답의 유효시간(초). 카운트다운 초기값. */
  initialTtlSeconds: number;
  /** 인증 성공 시 호출(이동은 페이지가 담당). */
  onVerified: () => void;
}

export function EmailVerificationForm({
  email,
  initialTtlSeconds,
  onVerified,
}: EmailVerificationFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { code: '' },
  });

  // 타이머 ttl/재시작 제어 — 재전송 시 ttl을 갱신해 카운트다운을 리셋한다.
  const [ttlSeconds, setTtlSeconds] = useState(initialTtlSeconds);
  const [restartKey, setRestartKey] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const cooldown = useResendCooldown();

  const verifyMutation = useMutation({
    mutationFn: verifyEmailCode,
    onSuccess: () => onVerified(),
  });

  // 재전송 — 동일 발송 엔드포인트 재호출. 쿨다운/타이머/만료상태를 갱신한다.
  const resendMutation = useMutation({
    mutationFn: () => requestEmailVerification(email),
    onSuccess: (data) => {
      setTtlSeconds(data.ttlSeconds);
      setRestartKey((k) => k + 1);
      setIsExpired(false);
      cooldown.start();
    },
  });

  // 폼 레벨 에러 분기(코드 불일치/만료/일반) — LoginForm/SignupForm과 동일 패턴.
  let formErrorMessage: string | null = null;
  if (verifyMutation.isError) {
    const kind: VerifyErrorKind =
      verifyMutation.error instanceof VerifyError
        ? verifyMutation.error.kind
        : 'generic';
    formErrorMessage = FORM_ERROR_MESSAGE[kind];
  }

  const isSubmitting = verifyMutation.isPending;
  const isResending = resendMutation.isPending;
  // 쿨다운 중이거나 재전송 요청 진행 중이면 재전송 버튼 비활성.
  const resendDisabled = cooldown.isCooling || isResending;

  const onInvalid = () => {
    if (errors.code) setFocus('code');
  };

  const onValid = (values: VerifyCodeInput) => {
    verifyMutation.mutate({ email, code: values.code });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className={vstack({ gap: '5', alignItems: 'stretch' })}
    >
      {/* 발송 안내 — 어느 이메일로 보냈는지 표시 */}
      <p
        className={css({
          textStyle: 'body.sm',
          color: 'fg.subtle',
        })}
      >
        <span className={css({ color: 'fg.muted', fontWeight: 'semibold' })}>
          {email}
        </span>
        {' 으로 6자리 인증 코드를 보냈어요.'}
      </p>

      <Field
        label="인증 코드"
        id="verify-code"
        required
        hint="6자리 숫자"
        error={errors.code?.message}
      >
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="------"
          disabled={isSubmitting}
          {...register('code')}
        />
      </Field>

      {/* 유효시간 + 재전송 줄 */}
      <div
        className={hstack({
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '3',
        })}
      >
        <span className={css({ textStyle: 'body.sm', color: 'fg.subtle' })}>
          남은 유효시간{' '}
          <CountdownTimer
            seconds={ttlSeconds}
            restartKey={restartKey}
            onExpire={() => setIsExpired(true)}
          />
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={resendDisabled}
          aria-busy={isResending || undefined}
          onClick={() => resendMutation.mutate()}
        >
          {cooldown.isCooling
            ? `재전송 (${cooldown.remaining}s)`
            : isResending
              ? '재전송 중…'
              : '코드 재전송'}
        </Button>
      </div>

      {/* 만료 안내(타이머 0) — 재전송 유도 */}
      {isExpired && !formErrorMessage && (
        <p
          role="alert"
          className={css({
            textStyle: 'body.sm',
            color: 'warning.fg',
            bg: 'warning.soft',
            border: '1px solid',
            borderColor: 'warning.default',
            borderRadius: 'lg',
            px: '3',
            py: '2',
          })}
        >
          인증 코드 유효시간이 만료됐어요. 코드를 재전송해주세요.
        </p>
      )}

      {/* 폼 레벨 에러(코드 불일치/서버 만료/네트워크) */}
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

      {/* 인증 성공 안내 */}
      {verifyMutation.isSuccess && (
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
          이메일 인증이 완료됐어요. 다음 단계로 이동합니다.
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? '확인 중…' : '인증 완료 →'}
      </Button>
    </form>
  );
}
