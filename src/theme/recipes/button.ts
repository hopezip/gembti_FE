// GAMBITI · button recipe (등록 키: 'button')
// 1차/2차/3차 행동 + 위험 액션 variant. 값 변경은 cross, 출처는 docs/design.
import { defineRecipe } from '@pandacss/dev';

export const button = defineRecipe({
  className: 'btn',
  description: 'GAMBITI 기본 버튼',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    fontFamily: 'sans',
    fontWeight: 'medium',
    borderRadius: 'md',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all {durations.fast} {easings.standard}',
    whiteSpace: 'nowrap',
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    _focusVisible: {
      outline: 'none',
      boxShadow: 'focusRing',
    },
  },
  variants: {
    variant: {
      // 🔥 1차 행동: 게시/저장/구매 등 단 1개
      primary: {
        bg: 'accent.default',
        borderColor: 'accent.default',
        color: 'fg.onAccent',
        fontWeight: 'semibold',
        _hover: { bg: 'accent.hover', borderColor: 'accent.hover' },
        _active: { bg: 'accent.active', borderColor: 'accent.active' },
        _disabled: {
          bg: 'bg.surfaceRaised',
          borderColor: 'border.default',
          color: 'fg.subtle',
          fontWeight: 'medium',
        },
      },
      // 2차 행동: 취소/뒤로/임시저장
      secondary: {
        bg: 'bg.surface',
        borderColor: 'border.emphasized',
        color: 'fg.default',
        _hover: { borderColor: 'fg.subtle', bg: 'bg.surfaceRaised' },
      },
      // 3차 행동: 텍스트 보조 액션
      ghost: {
        bg: 'transparent',
        borderColor: 'border.emphasized',
        color: 'fg.default',
        _hover: { bg: 'bg.surface' },
      },
      // 위험: 삭제/차단 (확인 모달 안에서 한정 사용)
      danger: {
        bg: 'transparent',
        borderColor: 'danger.default',
        color: 'danger.default',
        _hover: { bg: 'danger.soft' },
      },
      // 위험 확정: 삭제 confirm 모달의 메인 액션
      dangerSolid: {
        bg: 'danger.default',
        borderColor: 'danger.default',
        color: 'fg.onAccent',
        fontWeight: 'semibold',
        _hover: { filter: 'brightness(.95)' },
      },
    },
    size: {
      sm: { px: '3', py: '1.5', fontSize: 'sm', h: '8' }, // 32
      md: { px: '4', py: '2.5', fontSize: 'md', h: '10' }, // 40 — ⭐ 기본
      lg: { px: '6', py: '3.5', fontSize: 'lg', h: '12' }, // 48
    },
  },
  defaultVariants: { variant: 'secondary', size: 'md' },
});
