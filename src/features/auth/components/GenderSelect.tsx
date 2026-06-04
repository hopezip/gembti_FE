import { ark } from '@ark-ui/react/factory';
import { forwardRef } from 'react';
import { styled } from 'styled-system/jsx';
import { input } from 'styled-system/recipes';
import type { Gender } from '@/lib/schemas/auth';

// 성별 선택 (LOGIN-FE-005 STEP2). 네이티브 <select>에 기존 input recipe를 입혀
//   Input과 시각 일관성을 맞춘다(새 recipe/토큰 신설 없음 — cross 회피).
// 옵션: 남성/여성/선택안함. 값은 schemas/auth의 Gender enum과 1:1 대응한다.

// input recipe를 native select에 연결(ark.select가 아닌 ark factory의 select element).
const StyledSelect = styled(ark.select, input);

const OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'unspecified', label: '선택 안 함' },
];

interface GenderSelectProps {
  value: Gender;
  onChange: (value: Gender) => void;
  disabled?: boolean;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export const GenderSelect = forwardRef<HTMLSelectElement, GenderSelectProps>(
  function GenderSelect({ value, onChange, ...rest }, ref) {
    return (
      <StyledSelect
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value as Gender)}
        {...rest}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </StyledSelect>
    );
  },
);
