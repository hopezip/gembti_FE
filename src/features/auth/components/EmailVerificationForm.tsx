import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { css } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { EMAIL_CODE_TTL_SECONDS } from '@/config/auth';
import { useResendCooldown } from '@/features/auth/hooks/useResendCooldown';
import {
  NICKNAME_MAX_LENGTH,
  type SignupStep2Input,
  signupStep2Schema,
} from '@/lib/schemas/auth';
import {
  type AuthSession,
  SignupError,
  sendEmailCode,
  signup,
  VerifyError,
  type VerifyErrorKind,
  verifyEmail,
} from '@/services/auth';
import { checkNickname as checkNicknameApi } from '@/services/users';
import { CountdownTimer } from './CountdownTimer';
import { GenderSelect } from './GenderSelect';
import { OtpInput } from './OtpInput';

// 회원가입 STEP2 (인증 + 프로필) — LOGIN-FE-006 실서버(GEMBTI_API) 계약 정합.
// 구성: 안내배너(✉) → 6칸 OTP + 타이머/재전송 → divider → 닉네임 → 생년월일/성별 2열 → 가입 완료.
// "가입 완료"는 순차 처리한다: ① verify(email, code) — 검증만, ② signup(전체 필드 직접 전송).
//   verify를 통과해야 signup이 200(미통과 시 403). 코드 오류는 OTP 영역 에러로,
//   닉네임 중복은 닉네임 필드 에러로 표시한다.
// ⚠️ signup_token 흐름 폐기 · 타이머는 상수 TTL.
// 닉네임 중복확인(LOGIN-FE-010): "중복 확인" 버튼으로 미리 안내(보조용). 실서버 엔드포인트가 없어
//   MSW(GET /api/v1/users/check-nickname) 전용이며 가입을 강제로 막지 않는다. 최종 중복 검증은
//   가입 단계 응답(nickname-duplicated 폴백)이 담당한다.

// 코드 검증 실패 메시지 매핑.
const CODE_ERROR_MESSAGE: Record<VerifyErrorKind, string> = {
  'invalid-code': '인증 코드가 올바르지 않습니다. 다시 확인해주세요.',
  expired: '인증 코드가 만료되었습니다. 코드를 재전송해주세요.',
  generic: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

interface EmailVerificationFormProps {
  /** STEP1에서 전달된 가입 이메일. */
  email: string;
  /** STEP1에서 전달된 비밀번호(최종 signup까지 페이지 state로 보관). */
  password: string;
  /** STEP1 비밀번호 확인(서버 password_confirm으로 전송). */
  passwordConfirm: string;
  /** STEP1 약관 동의(서버 terms_agreed/privacy_agreed로 전송). */
  termsAgreed: boolean;
  privacyAgreed: boolean;
  /** 카운트다운 초기값(초). 미지정 시 상수 TTL. (백엔드 send-code에 expires_in이 없다.) */
  initialExpiresInSeconds?: number;
  /** 가입 완료 시 호출(자동 로그인 세션 정보 전달, 이동은 페이지가 담당). */
  onSignedUp: (result: AuthSession) => void;
  /** 이메일 중복(409) 시 호출 — 토스트/로그인 이동은 페이지가 담당. detail은 서버 원문. */
  onEmailDuplicated?: (detail: string | null) => void;
}

export function EmailVerificationForm({
  email,
  password,
  passwordConfirm,
  termsAgreed,
  privacyAgreed,
  initialExpiresInSeconds = EMAIL_CODE_TTL_SECONDS,
  onSignedUp,
  onEmailDuplicated,
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
      gender: 'other',
    },
  });

  // 타이머 ttl/재시작 제어 — 재전송 시 restartKey 갱신으로 카운트다운 리셋.
  const [restartKey, setRestartKey] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  // 코드 영역 에러(verify 실패) — RHF 필드 에러와 별개로 둔다.
  const [codeError, setCodeError] = useState<string | null>(null);
  // 닉네임 중복확인 상태(보조용) — 가입을 막지 않고 안내만 한다.
  const [nicknameCheck, setNicknameCheck] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const cooldown = useResendCooldown();

  const nickname = watch('nickname') ?? '';

  // 닉네임 중복 확인 — 기존 MSW 핸들러 재사용(실서버 엔드포인트 없음).
  async function checkNickname() {
    const value = nickname.trim();
    if (!value) return;
    setNicknameCheck('checking');
    try {
      const res = await checkNicknameApi(value);
      setNicknameCheck(res.available ? 'available' : 'taken');
    } catch {
      setNicknameCheck('idle');
    }
  }

  // 가입 완료 — verify → signup 순차 처리.
  const submitMutation = useMutation({
    mutationFn: async (values: SignupStep2Input) => {
      // ① 코드 검증(검증만, 토큰 없음).
      await verifyEmail({ email, code: values.code });
      // ② 전체 필드로 가입(자동 로그인 세션 발급).
      return await signup({
        email,
        password,
        passwordConfirm,
        nickname: values.nickname,
        gender: values.gender,
        birthDate: values.birth,
        termsAgreed,
        privacyAgreed,
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
          message: error.detail ?? '이미 사용 중인 닉네임이에요',
        });
        setFocus('nickname');
        return;
      }
      // 이메일 중복(409) → 토스트 + 로그인 이동(페이지 위임).
      if (error instanceof SignupError && error.kind === 'email-duplicated') {
        onEmailDuplicated?.(error.detail);
        return;
      }
      // 그 외 → 코드 영역에 일반(또는 서버 detail) 에러 표시.
      const detail = error instanceof SignupError ? error.detail : null;
      setCodeError(detail ?? CODE_ERROR_MESSAGE.generic);
    },
  });

  // 재전송 — send-code 재호출. 쿨다운/타이머/만료/코드에러 갱신.
  const resendMutation = useMutation({
    mutationFn: () => sendEmailCode(email),
    onSuccess: () => {
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
            seconds={initialExpiresInSeconds}
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

      {/* 코드 검증 실패(verify 단계 에러) */}
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

      {/* 닉네임 — 글자수 카운터 + 중복 확인 버튼(보조용) */}
      <div className={vstack({ gap: '1.5', alignItems: 'stretch' })}>
        <div className={hstack({ gap: '2', alignItems: 'flex-end' })}>
          <div className={css({ flex: 1, minW: 0 })}>
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
                    placeholder="2~8자, 특수기호 불가"
                    maxLength={NICKNAME_MAX_LENGTH}
                    aria-invalid={Boolean(errors.nickname) || undefined}
                    disabled={isSubmitting}
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      // 닉네임을 수정하면 이전 확인 결과를 초기화한다.
                      if (nicknameCheck !== 'idle') setNicknameCheck('idle');
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </Field>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={checkNickname}
            disabled={
              isSubmitting || nicknameCheck === 'checking' || !nickname.trim()
            }
          >
            {nicknameCheck === 'checking' ? '확인 중…' : '중복 확인'}
          </Button>
        </div>
        {nicknameCheck === 'available' && (
          <span className={css({ textStyle: 'body.sm', color: 'success.fg' })}>
            사용 가능한 닉네임이에요
          </span>
        )}
        {nicknameCheck === 'taken' && (
          <span className={css({ textStyle: 'body.sm', color: 'danger.fg' })}>
            이미 사용 중인 닉네임이에요
          </span>
        )}
      </div>

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
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? '가입 처리 중…' : '가입 완료 →'}
      </Button>
    </form>
  );
}
