import { css } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import {
  PASSWORD_MIN_LENGTH,
  hasDigit,
  hasLetter,
  hasSpecial,
} from '@/lib/schemas/auth';

// 비밀번호 강도바 + 규칙 체크리스트 (Figma auth-modal STEP1 pw-strength / pw-rules).
// 순수 파생 표시 컴포넌트다 — 검증의 출처(SSOT)는 signupStep1Schema이며 여기선 같은 헬퍼로 표시만 한다.
// 규칙: 8자 이상 / 영문 포함 / 숫자 포함 = 필수, 특수문자 = 권장(선택, 미충족도 가입 가능).
// semantic token만 사용(충족=success, 미충족=fg.subtle, 강도 채움=accent).

interface PasswordRulesProps {
  /** 현재 비밀번호 입력값(watch) */
  value: string;
}

interface Rule {
  label: string;
  met: boolean;
  /** 권장(선택) 규칙 — 미충족이어도 ○로만 표시 */
  optional?: boolean;
}

// 강도 라벨 — 충족 개수(특수문자 포함 4칸) 기준.
function strengthLabel(metCount: number): string {
  if (metCount <= 1) return '약함';
  if (metCount <= 3) return '보통';
  return '강함';
}

export function PasswordRules({ value }: PasswordRulesProps) {
  const rules: Rule[] = [
    {
      label: `${PASSWORD_MIN_LENGTH}자 이상`,
      met: value.length >= PASSWORD_MIN_LENGTH,
    },
    { label: '영문 포함', met: hasLetter(value) },
    { label: '숫자 포함', met: hasDigit(value) },
    { label: '특수문자 1개 이상', met: hasSpecial(value), optional: true },
  ];

  const metCount = rules.filter((r) => r.met).length;
  const totalSegments = rules.length;

  return (
    <div className={vstack({ gap: '2', alignItems: 'stretch' })}>
      {/* 강도바 — 4칸, 충족 개수만큼 accent로 채운다 */}
      <div className={hstack({ gap: '2', alignItems: 'center' })}>
        <div className={hstack({ gap: '1', flex: '1' })} aria-hidden="true">
          {rules.map((rule, i) => (
            <span
              key={rule.label}
              className={css({
                h: '1',
                flex: '1',
                borderRadius: 'full',
                bg: i < metCount ? 'accent.default' : 'border.default',
              })}
            />
          ))}
        </div>
        <span
          className={css({
            fontFamily: 'mono',
            fontSize: 'xs',
            color: 'fg.subtle',
            flexShrink: 0,
          })}
        >
          강도 · {value.length === 0 ? '—' : strengthLabel(metCount)}
        </span>
      </div>

      {/* 규칙 체크리스트 */}
      <ul className={vstack({ gap: '0.5', alignItems: 'stretch' })}>
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              fontFamily: 'mono',
              fontSize: 'xs',
              color: rule.met ? 'success.fg' : 'fg.subtle',
            })}
          >
            <span aria-hidden="true">{rule.met ? '✓' : '○'}</span>
            {rule.label}
            {rule.optional && !rule.met && (
              <span className={css({ color: 'fg.subtle' })}>(선택)</span>
            )}
          </li>
        ))}
      </ul>

      {/* 스크린리더용 요약(시각 체크리스트는 aria 보조). 강도바는 장식 처리. */}
      <span className={css({ srOnly: true })}>
        비밀번호 조건 {metCount}/{totalSegments} 충족
      </span>
    </div>
  );
}
