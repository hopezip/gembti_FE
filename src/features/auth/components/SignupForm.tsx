import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { type SignupStep1Input, signupStep1Schema } from '@/lib/schemas/auth';
import { checkEmail as checkEmailApi } from '@/services/users';
import { Checkbox } from './Checkbox';
import { PasswordInput } from './PasswordInput';
import { PasswordRules } from './PasswordRules';

// 회원가입 STEP1 (계정정보) — LOGIN-FE-015.
// 이메일 + 비밀번호 + 비밀번호확인 + [필수] 만 15세 이상 확인.
//   15세 확인은 GEMBTI_API SignupRequest의 terms_agreed/privacy_agreed로 STEP2 signup 시 전송된다
//   (백엔드에 연령 필드가 없어, 페이지가 두 필드를 ageConfirmed 값으로 채운다).
// 이메일 실시간 중복확인은 제거했다(백엔드 check-email 엔드포인트 없음). 중복은 send-code 응답(409)으로
//   이메일 입력칸 아래 인라인 표시(emailError)한다.
// 제출 성공 시 send-code 호출은 페이지(SignupPage)가 담당한다. 이 폼은 검증된 계정정보 + 15세 확인을
//   onSubmitStep1로 넘기기만 한다(비밀번호/15세 확인은 STEP2 최종 signup까지 페이지 state로 보관).

interface SignupFormProps {
  // STEP1 검증 성공 시 호출. 검증된 계정정보(이메일/비밀번호) + 15세 확인을 페이지로 넘긴다.
  //   페이지가 send-code 후 STEP2로 전환한다.
  onSubmitStep1: (values: {
    email: string;
    password: string;
    ageConfirmed: boolean;
  }) => void;
  // send-code 진행 중 여부(페이지가 제어) — 제출 버튼 로딩 표시.
  isSubmitting?: boolean;
  // send-code 실패 등 페이지 레벨 에러 메시지(generic).
  formError?: string | null;
  // 이메일 전용 외부 에러(send-code 409 중복) — 이메일 Field 아래 인라인 표시.
  emailError?: string | null;
  // 이메일 입력 변경 시 호출 — 페이지가 외부 emailError를 클리어한다.
  onEmailChange?: () => void;
}

export function SignupForm({
  onSubmitStep1,
  isSubmitting = false,
  formError = null,
  emailError = null,
  onEmailChange,
}: SignupFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<SignupStep1Input>({
    resolver: zodResolver(signupStep1Schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      ageConfirmed: false,
    },
  });

  const password = watch('password') ?? '';
  const email = watch('email') ?? '';

  // 이메일 중복확인 상태(보조용) — 가입을 막지 않고 안내만 한다. (LOGIN-FE-012, 닉네임 대칭)
  const [emailCheck, setEmailCheck] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  // 이메일 중복 확인 — MSW 핸들러(GET /api/v1/users/check-email) 호출(실서버 엔드포인트 없음).
  async function checkEmail() {
    const value = email.trim();
    if (!value) return;
    setEmailCheck('checking');
    try {
      const res = await checkEmailApi(value);
      setEmailCheck(res.available ? 'available' : 'taken');
    } catch {
      setEmailCheck('idle');
    }
  }

  const onInvalid = () => {
    if (errors.email) setFocus('email');
    else if (errors.password) setFocus('password');
    else if (errors.passwordConfirm) setFocus('passwordConfirm');
  };

  const onValid = (values: SignupStep1Input) => {
    onSubmitStep1({
      email: values.email,
      password: values.password,
      ageConfirmed: values.ageConfirmed,
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className={vstack({ gap: '5', alignItems: 'stretch' })}
    >
      {/* 이메일 — 형식 에러 또는 send-code 409(emailError)를 Field 아래 인라인 표시 */}
      <Field
        label="이메일"
        id="signup-email"
        required
        error={errors.email?.message ?? emailError ?? undefined}
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          disabled={isSubmitting}
          {...register('email', {
            // 이메일을 수정하면 페이지가 외부 중복(409) 에러를 초기화한다.
            onChange: () => onEmailChange?.(),
          })}
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
          placeholder="특수문자 포함 10자 이상"
          disabled={isSubmitting}
          {...register('password')}
        />
      </Field>

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

      {/* [필수] 만 15세 이상 확인 — signup 시 terms_agreed/privacy_agreed로 전송된다 */}
      <div className={vstack({ gap: '2', alignItems: 'stretch' })}>
        <Controller
          control={control}
          name="ageConfirmed"
          render={({ field }) => (
            <Checkbox
              checked={field.value === true}
              onCheckedChange={field.onChange}
            >
              <span className={css({ color: 'accent.fg' })}>[필수]</span>
              <span className={css({ ml: '1' })}>만 15세 이상입니다</span>
            </Checkbox>
          )}
        />
        {errors.ageConfirmed && (
          <p
            role="alert"
            className={css({
              fontFamily: 'mono',
              fontSize: 'sm',
              color: 'danger.default',
            })}
          >
            {errors.ageConfirmed.message}
          </p>
        )}
      </div>

      {/* 페이지 레벨 에러(send-code 실패/네트워크) */}
      {formError && (
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
          {formError}
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
