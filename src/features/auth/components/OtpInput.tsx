import { type ClipboardEvent, type KeyboardEvent, useRef } from 'react';
import { css } from 'styled-system/css';
import { hstack } from 'styled-system/patterns';

// 6칸 OTP 입력 (LOGIN-FE-005 STEP2, Figma auth-modal node 4003:2117).
// 제어 컴포넌트 — 값은 부모(RHF)가 문자열 6자리로 보관하고, 여기선 셀 표시/입력 UX만 담당한다.
//   - 한 칸당 숫자 1자. 입력 시 다음 칸으로 자동 포커스 이동.
//   - Backspace로 빈 칸이면 이전 칸으로 이동.
//   - 붙여넣기 시 숫자만 추출해 앞칸부터 채우고 마지막 채운 칸으로 포커스.
//   - 화살표 좌우 이동.
// 색은 semantic token만 사용(다크·데스크탑 전용).

const LENGTH = 6;

interface OtpInputProps {
  /** 현재 코드 값(0~6자리 숫자 문자열). */
  value: string;
  /** 값 변경 콜백(항상 0~6자리 숫자 문자열). */
  onChange: (value: string) => void;
  /** 입력 비활성. */
  disabled?: boolean;
  /** 오류 시각(테두리 danger). */
  invalid?: boolean;
  /** 첫 칸 input의 id(Field label 연결용). */
  id?: string;
  'aria-describedby'?: string;
}

export function OtpInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
  id,
  'aria-describedby': describedBy,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // 값 문자열을 칸 배열로 분해(부족분은 빈 문자열).
  const cells = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(LENGTH - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  // 특정 칸의 값을 바꾸고 전체 코드 문자열을 재구성한다.
  const setCell = (index: number, digit: string) => {
    const next = cells.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, LENGTH));
  };

  const handleChange = (index: number, raw: string) => {
    // 숫자만 허용. 마지막 입력 1자만 반영(자동완성/한 번에 여러 자 입력 방어).
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 0) {
      setCell(index, '');
      return;
    }
    const digit = digits[digits.length - 1];
    setCell(index, digit);
    if (index < LENGTH - 1) focusCell(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (cells[index] === '' && index > 0) {
        e.preventDefault();
        setCell(index - 1, '');
        focusCell(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    const next = pasted.slice(0, LENGTH);
    onChange(next);
    // 채운 마지막 칸(또는 마지막 칸)으로 포커스 이동.
    focusCell(Math.min(next.length, LENGTH - 1));
  };

  return (
    <div className={hstack({ gap: '2', justifyContent: 'space-between' })}>
      {cells.map((cell, index) => (
        <input
          // OTP 칸은 순서 고정·동일 구조라 index key가 안전하다.
          // biome-ignore lint/suspicious/noArrayIndexKey: 고정 길이 OTP 셀
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          id={index === 0 ? id : undefined}
          aria-label={`인증 코드 ${index + 1}번째 자리`}
          aria-describedby={index === 0 ? describedBy : undefined}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={cell}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={css({
            w: '12',
            h: '12',
            textAlign: 'center',
            fontFamily: 'mono',
            fontSize: 'xl',
            fontWeight: 'semibold',
            fontVariantNumeric: 'tabular-nums',
            color: 'fg.default',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: invalid ? 'danger.default' : 'border.emphasized',
            borderRadius: 'md',
            outline: 'none',
            transition: 'border-color 0.15s',
            _focusVisible: {
              borderColor: 'accent.default',
              outline: '2px solid',
              outlineColor: 'border.accent',
              outlineOffset: '1px',
            },
            _disabled: { opacity: 0.6, cursor: 'not-allowed' },
          })}
        />
      ))}
    </div>
  );
}
