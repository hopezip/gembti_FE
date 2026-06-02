// GAMBITI · toast slot recipe (등록 키: 'toast')
// Park UI Toast anatomy 기반. 색상은 semantic token만 사용한다.
import { toastAnatomy } from '@ark-ui/react/anatomy';
import { defineSlotRecipe } from '@pandacss/dev';

export const toast = defineSlotRecipe({
  className: 'toast',
  slots: toastAnatomy.keys(),
  base: {
    root: {
      alignItems: 'flex-start',
      bg: 'bg.surfaceRaised',
      border: '1px solid',
      borderColor: 'border.emphasized',
      borderRadius: 'lg',
      boxShadow: 'lg',
      color: 'fg.default',
      display: 'grid',
      gap: '3',
      gridTemplateColumns: 'auto minmax(0, 1fr) auto',
      maxW: 'calc(100vw - token(spacing.8))',
      opacity: 'var(--opacity)',
      overflowWrap: 'anywhere',
      p: '4',
      scale: 'var(--scale)',
      transitionDuration: 'slow',
      transitionProperty: 'translate, scale, opacity, height',
      transitionTimingFunction: 'standard',
      translate: 'var(--x) var(--y)',
      w: { base: 'calc(100vw - token(spacing.8))', md: '96' },
      willChange: 'translate, opacity, scale',
      zIndex: 'var(--z-index)',
      '&[data-type=success]': { borderColor: 'success.default' },
      '&[data-type=error]': { borderColor: 'danger.default' },
      '&[data-type=warning]': { borderColor: 'warning.default' },
      '&[data-type=info]': { borderColor: 'info.default' },
      '& [data-part=icon]': {
        flexShrink: 0,
        h: '5',
        mt: '0.5',
        w: '5',
      },
      '& [data-part=content]': {
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
        minW: '0',
      },
      '& [data-part=close-icon]': {
        h: '4',
        w: '4',
      },
      '& [data-type=success]': { color: 'success.default' },
      '& [data-type=error]': { color: 'danger.default' },
      '& [data-type=warning]': { color: 'warning.default' },
      '& [data-type=info]': { color: 'info.default' },
    },
    title: {
      color: 'fg.default',
      fontSize: 'md',
      fontWeight: 'semibold',
      lineHeight: 'tight',
    },
    description: {
      color: 'fg.muted',
      fontSize: 'sm',
      lineHeight: 'normal',
    },
    closeTrigger: {
      color: 'fg.subtle',
      cursor: 'pointer',
      _hover: { color: 'fg.default' },
      _focus: { outline: 'none', boxShadow: 'focusRing' },
    },
  },
});
