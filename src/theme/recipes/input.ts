// GAMBITI · input recipe (등록 키: 'input')
// 텍스트 입력 기본 스타일 + size variant. 값 변경은 cross, 출처는 docs/design.
import { defineRecipe } from '@pandacss/dev';

export const input = defineRecipe({
  className: 'input',
  base: {
    w: 'full',
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 'lg',
    color: 'fg.default',
    fontFamily: 'sans',
    transition: 'border-color {durations.fast}, box-shadow {durations.fast}',
    _placeholder: { color: 'fg.placeholder' },
    _focus: {
      outline: 'none',
      borderColor: 'accent.default',
      boxShadow: 'focusRing',
    },
    _disabled: { opacity: 0.5, cursor: 'not-allowed' },
    '&[aria-invalid=true]': {
      borderColor: 'danger.default',
      boxShadow: '0 0 0 3px rgba(255,122,122,.08)',
    },
  },
  variants: {
    size: {
      sm: { h: '9', px: '3', fontSize: 'md' }, // 36
      md: { h: '10', px: '3.5', fontSize: 'lg' }, // 40 — ⭐ 기본
      lg: { h: '12', px: '4', fontSize: 'xl', fontWeight: 'medium' }, // 48
    },
  },
  defaultVariants: { size: 'md' },
});
