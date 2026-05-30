// GAMBITI · tag recipe (등록 키: 'tag')
// 읽기 전용 라벨/카테고리 표시. 선택형은 chip 사용. 값 변경은 cross, 출처는 docs/design.
import { defineRecipe } from '@pandacss/dev';

export const tag = defineRecipe({
  className: 'tag',
  description: '라벨/카테고리 표시(읽기 전용). 선택형은 chip 사용.',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1.5',
    fontFamily: 'mono',
    fontSize: '2xs',
    fontWeight: 'medium',
    letterSpacing: 'wider',
    textTransform: 'uppercase',
    border: '1px solid',
    borderRadius: 'full',
    px: '2',
    py: '0.5',
  },
  variants: {
    tone: {
      neutral: { color: 'fg.muted', borderColor: 'border.emphasized' },
      review: { color: 'accent.fg', borderColor: 'accent.default' },
      party: { color: 'success.fg', borderColor: 'success.default' },
      guide: { color: 'info.fg', borderColor: 'info.default' },
      notice: { color: 'warning.fg', borderColor: 'warning.default' },
    },
    filled: {
      true: { bg: 'currentColor', color: 'fg.onAccent' }, // 강조형
    },
  },
  defaultVariants: { tone: 'neutral' },
});
