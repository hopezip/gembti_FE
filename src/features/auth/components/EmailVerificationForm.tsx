import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { css } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { useNicknameAvailability } from '@/features/auth/hooks/useNicknameAvailability';
import { useResendCooldown } from '@/features/auth/hooks/useResendCooldown';
import {
  NICKNAME_MAX_LENGTH,
  type SignupStep2Input,
  signupStep2Schema,
} from '@/lib/schemas/auth';
import {
  type AuthTokens,
  type AuthUser,
  SignupError,
  sendEmailCode,
  signup,
  VerifyError,
  type VerifyErrorKind,
  verifyEmailCode,
} from '@/services/auth';
import { CountdownTimer } from './CountdownTimer';
import { GenderSelect } from './GenderSelect';
import { OtpInput } from './OtpInput';

// 회원가입 STEP2 (인증 + 프로필) — LOGIN-FE-005, Figma auth-modal node 4003:2117.
// 구성: 안내배너(✉) → 6칸 OTP + 타이머/재전송 → divider → 닉네임(실시간 확인) → 생년월일/성별 2열 → 가입 완료.
// "가입 완료"는 순차 처리한다: ① verify-code(code)→signup_token, ② signup(signup_token+password+nickname; birth/gender).
//   코드 오류는 OTP 영역 에러로, 닉네임 중복(NICKNAME_DUPLICATED)은 닉네임 필드 에러로 표시한다.

// 코드 검증 실패 메시지 매핑.
const CODE_ERROR_MESSAGE: Record<VerifyErrorKind, string> = {
  'invalid-code': '인증 코드가 올바르지 않습니다. 다시 확인해주세요.',
  expired: '인증 코드가 만료되었습니다. 코드를 재전송해주세요.',
  generic: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

// 닉네임 실시간 확인 상태 표시.
const NICKNAME_HINT: Record<
  'checking' | 'available' | 'taken',
  { message: string; color: string }
> = {
  checking: { message: '확인 중…', color: 'fg.subtle' },
  available: { message: '✓ 사용 가능한 닉네임이에요', color: 'success.fg' },
  taken: { message: '이미 사용 중인 닉네임이에요', color: 'danger.fg' },
};

interface EmailVerificationFormProps {
  /** STEP1에서 전달된 가입 이메일. */
  email: string;
  /** STEP1에서 전달된 비밀번호(최종 signup까지 페이지 state로 보관). */
  password: string;
  /** send-code 응답의 유효시간(초). 카운트다운 초기값. */
  initialExpiresInSeconds: number;
  /** 가입 완료 시 호출(자동 로그인 세션 정보 전달, 이동은 페이지가 담당). */
  onSignedUp: (result: { user: AuthUser; tokens: AuthTokens }) => void;
}

export function EmailVerificationForm({
  email,
  password,
  initialExpiresInSeconds,
  onSignedUp,
}: EmailVerificationFormProps) {
  const {
    handleSubmit,
    control,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<SignupStep2Input>({
    resolver: zodResolver(signupStep2Schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      code: '',
      nickname: '',
      birth: '',
      gender: 'unspecified',
    },
  });

  // 타이머 ttl/재시작 제어 — 재전송 시 ttl 갱신으로 카운트다운 리셋.
  const [expiresIn, setExpiresIn] = useState(initialExpiresInSeconds);
  const [restartKey, setRestartKey] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  // 코드 영역 에러(verify-code 실패) — RHF 필드 에러와 별개로 둔다.
  const [codeError, setCodeError] = useState<string | null>(null);
  const cooldown = useResendCooldown();

  const nickname = watch('nickname') ?? '';
  const { status: nicknameStatus, isTaken: nicknameTaken } =
    useNicknameAvailability(nickname);

  // 가입 완료 — verify-code → signup 순차 처리.
  const submitMutation = useMutation({
    mutationFn: async (values: SignupStep2Input) => {
      // ① 코드 검증 → signup_token
      const { signupToken } = await verifyEmailCode({
        email,
        code: values.code,
      });
      // ② signup_token + 프로필로 가입(자동 로그인 세션 발급)
      return await signup({
        signupToken,
        password,
        nickname: values.nickname,
        birth: values.birth,
        gender: values.gender,
      });
    },
    onSuccess: (result) => onSignedUp(result),
    onError: (error) => {
      // 코드 오류 → OTP 영역 에러.
      if (error instanceof VerifyError) {
        setCodeError(CODE_ERROR_MESSAGE[error.kind]);
        return;
      }
      // 닉네임 중복 → 닉네임 필드 에러.
      if (
        error instanceof SignupError &&
        error.kind === 'nickname-duplicated'
      ) {
        setError('nickname', {
          type: 'server',
          message: '이미 사용 중인 닉네임이에요',
        });
        setFocus('nickname');
        return;
      }
      // 그 외 → 코드 영역에 일반 에러 표시.
      setCodeError(CODE_ERROR_MESSAGE.generic);
    },
  });

  // 재전송 — send-code 재호출. 쿨다운/타이머/만료/코드에러 갱신.
  const resendMutation = useMutation({
    mutationFn: () => sendEmailCode(email),
    onSuccess: (data) => {
      setExpiresIn(data.expiresInSeconds);
      setRestartKey((k) => k + 1);
      setIsExpired(false);
      setCodeError(null);
      cooldown.start();
    },
  });

  const isSubmitting = submitMutation.isPending;
  const isResending = resendMutation.isPending;
  const resendDisabled = cooldown.isCooling || isResending;

  const onInvalid = () => {
    if (errors.code) setFocus('code');
    else if (errors.nickname) setFocus('nickname');
  };

  const onValid = (values: SignupStep2Input) => {
    if (nicknameTaken) {
      setError('nickname', {
        type: 'server',
        message: '이미 사용 중인 닉네임이에요',
      });
      setFocus('nickname');
      return;
    }
    setCodeError(null);
    submitMutation.mutate(values);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className={vstack({ gap: '5', alignItems: 'stretch' })}
    >
      {/* 안내 배너(✉ · info 톤) — 어느 이메일로 보냈는지 + 스팸함 안내 */}
      <div
        className={css({
          display: 'flex',
          gap: '2.5',
          alignItems: 'flex-start',
          color: 'info.fg',
          bg: 'info.soft',
          border: '1px solid',
          borderColor: 'info.default',
          borderRadius: 'lg',
          px: '3',
          py: '2.5',
          textStyle: 'body.sm',
        })}
      >
        <span aria-hidden="true">✉</span>
        <span className={css({ color: 'fg.muted' })}>
          <span
            className={css({ color: 'fg.default', fontWeight: 'semibold' })}
          >
            {email}
          </span>
          {
            ' 으로 6자리 인증 코드를 보냈어요. 메일이 안 보이면 스팸함을 확인해주세요.'
          }
        </span>
      </div>

      {/* 인증 코드 — 6칸 OTP */}
      <Field
        label="인증 코드"
        id="signup-code"
        required
        error={errors.code?.message}
      >
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <OtpInput
              id="signup-code"
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                if (codeError) setCodeError(null);
              }}
              disabled={isSubmitting}
              invalid={Boolean(errors.code) || Boolean(codeError)}
            />
          )}
        />
      </Field>

      {/* 남은 시간 + 재전송 */}
      <div
        className={hstack({
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '3',
          mt: '-2',
        })}
      >
        <span className={css({ textStyle: 'body.sm', color: 'fg.subtle' })}>
          남은 시간 ·{' '}
          <CountdownTimer
            seconds={expiresIn}
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
            ? `코드 재전송 (${cooldown.remaining}s)`
            : isResending
              ? '재전송 중…'
              : '코드 재전송'}
        </Button>
      </div>

      {/* 만료 안내(타이머 0) */}
      {isExpired && !codeError && (
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

      {/* 코드 검증 실패(verify-code 단계 에러) */}
      {codeError && (
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
          {codeError}
        </p>
      )}

      {/* divider */}
      <hr
        className={css({
          border: 'none',
          borderTop: '1px solid',
          borderColor: 'border.default',
        })}
      />

      {/* 닉네임 — 실시간 중복확인 + 글자수 카운터 */}
      <Field
        label={`닉네임 (${NICKNAME_MAX_LENGTH}자 이내)`}
        id="signup-nickname"
        required
        hint={`${nickname.length}/${NICKNAME_MAX_LENGTH}`}
        error={errors.nickname?.message}
      >
        <Controller
          control={control}
          name="nickname"
          render={({ field }) => (
            <Input
              id="signup-nickname"
              type="text"
              autoComplete="nickname"
              placeholder="2~12자, 특수기호 불가"
              maxLength={NICKNAME_MAX_LENGTH}
              aria-invalid={Boolean(errors.nickname) || undefined}
              disabled={isSubmitting}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </Field>

      {/* 닉네임 실시간 확인 상태(필드 에러가 없을 때만 표시) */}
      {!errors.nickname &&
        nicknameStatus !== 'idle' &&
        nicknameStatus !== 'error' && (
          <p
            role="status"
            className={css({
              textStyle: 'body.sm',
              color: NICKNAME_HINT[nicknameStatus].color,
              mt: '-3',
            })}
          >
            {NICKNAME_HINT[nicknameStatus].message}
          </p>
        )}

      {/* 생년월일 + 성별 2열 */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4',
        })}
      >
        <Field
          label="생년월일"
          id="signup-birth"
          required
          error={errors.birth?.message}
        >
          <Controller
            control={control}
            name="birth"
            render={({ field }) => (
              <Input
                id="signup-birth"
                type="date"
                aria-invalid={Boolean(errors.birth) || undefined}
                disabled={isSubmitting}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        </Field>

        <Field
          label="성별"
          id="signup-gender"
          required
          error={errors.gender?.message}
        >
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <GenderSelect
                id="signup-gender"
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </Field>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting || nicknameTaken}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? '가입 처리 중…' : '가입 완료 →'}
      </Button>
    </form>
  );
}
