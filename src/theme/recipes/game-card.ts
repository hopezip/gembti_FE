// GAMBITI · gameCard recipe (등록 키: 'gameCard' — 키 변경 금지)
// Park UI preset의 'card' slotRecipe와 이름 충돌을 피하려고 'gameCard'로 둔다.
// 파일명은 game-card.ts지만 등록 키는 반드시 'gameCard' 유지(키 바꾸면 산출물이 달라짐).
import { defineRecipe } from '@pandacss/dev';

export const gameCard = defineRecipe({
  className: 'gameCard',
  base: {
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 'xl',
  },
  variants: {
    padding: {
      none: { p: '0' },
      sm: { p: '4' },
      md: { p: '5' }, // ⭐ 기본
      lg: { p: '6' },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        transition: 'border-color {durations.base}, transform {durations.base}',
        _hover: {
          borderColor: 'border.emphasized',
          transform: 'translateY(-2px)',
        },
      },
    },
    tone: {
      default: {},
      accent: {
        bg: 'linear-gradient(135deg, rgba(239,90,44,.06), transparent 70%), {colors.gray.900}',
        borderLeft: '3px solid {colors.orange.500}',
      },
    },
  },
  defaultVariants: { padding: 'md' },
});
