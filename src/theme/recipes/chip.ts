// GAMBITI · chip recipe (등록 키: 'chip')
// 선택 가능한 필터/장르/성향 칩(토글). 값 변경은 cross, 출처는 docs/design.
import { defineRecipe } from '@pandacss/dev';

export const chip = defineRecipe({
  className: 'chip',
  description: '선택 가능한 필터/장르/성향 칩(토글).',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1.5',
    border: '1px solid',
    borderColor: 'border.emphasized',
    borderRadius: 'full',
    px: '3.5',
    py: '1.5',
    fontSize: 'sm',
    color: 'fg.muted',
    bg: 'transparent',
    cursor: 'pointer',
    transition: 'all {durations.fast}',
    _hover: { color: 'fg.default', borderColor: 'fg.subtle' },
    '&[data-state=on], &.on': {
      bg: 'accent.soft',
      color: 'accent.fg',
      borderColor: 'accent.default',
      fontWeight: 'semibold',
    },
  },
});
