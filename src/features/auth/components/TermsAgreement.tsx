import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import type { SignupInput } from '@/lib/schemas/auth';
import { Checkbox } from './Checkbox';

// 약관 동의 그룹 (Figma auth-modal STEP1 약관 영역).
// "전체 동의"는 폼 필드가 아닌 파생 제어 — 하위 4개(필수3 + 선택1)를 일괄 토글한다.
// 필수 항목(만14세/이용약관/개인정보)은 signupSchema에서 boolean+refine(true)로 강제되며,
// 미동의 시 제출이 차단되고 행 아래 에러가 표시된다. semantic token만 사용.

interface TermsAgreementProps {
  control: Control<SignupInput>;
  setValue: UseFormSetValue<SignupInput>;
  errors: FieldErrors<SignupInput>;
}

// 행 구성 — name(필드 키) / 라벨 / 필수 여부.
const REQUIRED_FIELDS = ['ageOver14', 'termsOfService', 'privacy'] as const;

export function TermsAgreement({
  control,
  setValue,
  errors,
}: TermsAgreementProps) {
  // 전체 동의 상태 파생 — 4개 모두 true일 때만 체크.
  const [ageOver14, termsOfService, privacy, marketing] = useWatch({
    control,
    name: ['ageOver14', 'termsOfService', 'privacy', 'marketing'],
  });
  const allChecked = Boolean(
    ageOver14 && termsOfService && privacy && marketing,
  );

  const setAll = (checked: boolean) => {
    setValue('ageOver14', checked, { shouldValidate: true });
    setValue('termsOfService', checked, { shouldValidate: true });
    setValue('privacy', checked, { shouldValidate: true });
    setValue('marketing', checked, { shouldValidate: true });
  };

  return (
    <div
      className={vstack({
        gap: '2',
        alignItems: 'stretch',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'lg',
        p: '3',
      })}
    >
      {/* 전체 동의 — 파생 제어(폼 필드 아님) */}
      <Checkbox checked={allChecked} onCheckedChange={setAll}>
        <span className={css({ fontWeight: 'semibold' })}>[전체 동의]</span>
        <span className={css({ ml: '1' })}>아래 항목 모두 동의합니다.</span>
      </Checkbox>

      <hr
        className={css({
          border: 'none',
          borderTop: '1px solid',
          borderColor: 'border.default',
        })}
      />

      {/* 필수 항목 3 */}
      <Controller
        control={control}
        name="ageOver14"
        render={({ field }) => (
          <Checkbox
            checked={field.value === true}
            onCheckedChange={field.onChange}
          >
            <span className={css({ color: 'accent.fg' })}>[필수]</span>
            <span className={css({ ml: '1' })}>만 14세 이상이에요</span>
          </Checkbox>
        )}
      />
      <Controller
        control={control}
        name="termsOfService"
        render={({ field }) => (
          <Checkbox
            checked={field.value === true}
            onCheckedChange={field.onChange}
          >
            <span className={css({ color: 'accent.fg' })}>[필수]</span>
            <span className={css({ ml: '1', textDecoration: 'underline' })}>
              이용약관에 동의
            </span>
          </Checkbox>
        )}
      />
      <Controller
        control={control}
        name="privacy"
        render={({ field }) => (
          <Checkbox
            checked={field.value === true}
            onCheckedChange={field.onChange}
          >
            <span className={css({ color: 'accent.fg' })}>[필수]</span>
            <span className={css({ ml: '1', textDecoration: 'underline' })}>
              개인정보 수집·이용에 동의
            </span>
          </Checkbox>
        )}
      />

      {/* 선택 항목 */}
      <Controller
        control={control}
        name="marketing"
        render={({ field }) => (
          <Checkbox
            checked={field.value === true}
            onCheckedChange={field.onChange}
            muted
          >
            <span>[선택]</span>
            <span className={css({ ml: '1' })}>이벤트·마케팅 정보 수신</span>
          </Checkbox>
        )}
      />

      {/* 필수 미동의 에러 — 제출 시 첫 미동의 항목 메시지 표시 */}
      {REQUIRED_FIELDS.some((f) => errors[f]) && (
        <p
          role="alert"
          className={css({
            fontFamily: 'mono',
            fontSize: 'sm',
            color: 'danger.default',
          })}
        >
          {REQUIRED_FIELDS.map((f) => errors[f]?.message).find(Boolean)}
        </p>
      )}
    </div>
  );
}
