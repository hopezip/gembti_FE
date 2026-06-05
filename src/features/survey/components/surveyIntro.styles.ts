import { css } from 'styled-system/css';

const accentBorder =
  'color-mix(in srgb, token(colors.accent.default) 28%, transparent)';
const canvasOverlay =
  'color-mix(in srgb, token(colors.bg.canvas) 68%, transparent)';

// TODO(SURVEY-FE-001/002): 인트로/진행 화면이 공유하는 배경 스타일.
// 추후 survey 공통 layout/style 파일로 분리해 intro 전용 styles 파일의 책임을 정리한다.
export const surveyBackgroundPageStyle = css({
  position: 'relative',
  flex: '1',
  overflow: 'hidden',
  bg: 'bg.canvas',
  backgroundImage: 'url("/images/survey_bg.png")',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  _before: {
    content: '""',
    position: 'absolute',
    inset: '0',
    background: `radial-gradient(circle at center, transparent, ${canvasOverlay} 66%)`,
    pointerEvents: 'none',
  },
});

export const surveyIntroStyles = {
  page: surveyBackgroundPageStyle,
  content: css({
    position: 'relative',
    zIndex: 'raised',
    display: 'grid',
    gridTemplateColumns: {
      base: '1fr',
      lg: 'minmax(0, 1fr) minmax(380px, 480px)',
    },
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    gap: { base: '7', md: '8', lg: '2', xl: '6' },
    minH: 'calc(100vh - 140px)',
    py: { base: '8', md: '10', lg: '12' },
  }),
  heroCopy: css({
    position: 'relative',
    zIndex: 'raised',
    display: 'flex',
    flexDirection: 'column',
    alignItems: { base: 'center', lg: 'flex-start' },
    w: 'full',
    maxW: { base: '560px', lg: '540px' },
    mx: { base: 'auto', lg: '0' },
    textAlign: { base: 'center', lg: 'left' },
  }),
  title: css({
    m: '0',
    maxW: '420px',
    color: 'fg.default',
    fontSize: { base: '6xl', md: '7xl', xl: '8xl' },
    fontWeight: 'extrabold',
    letterSpacing: 'tight',
    lineHeight: 'tight',
    textShadow: '0 8px 32px token(colors.bg.canvas)',
  }),
  titleHighlight: css({ color: 'accent.default' }),
  description: css({
    mt: { base: '4', md: '6' },
    color: 'fg.muted',
    fontSize: { base: 'sm', md: 'lg' },
    lineHeight: 'relaxed',
  }),
  quickInfoList: css({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: { base: 'center', lg: 'flex-start' },
    gap: { base: '3', md: '5' },
    mt: { base: '5', md: '6' },
  }),
  quickInfoItem: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1.5',
    color: 'fg.muted',
    fontSize: { base: '2xs', md: 'xs' },
    whiteSpace: 'nowrap',
    opacity: '.72',
  }),
  quickInfoIcon: css({ color: 'accent.default', flexShrink: '0' }),
  buttonGroup: css({
    display: 'flex',
    justifyContent: 'center',
    w: 'min(100%, 500px)',
    gap: '3',
    mt: { base: '4', md: '6' },
    '& > button': { flex: '1' },
    '@media (max-width: 479px)': {
      w: 'min(100%, 360px)',
      flexDirection: 'column',
      '& > button': { flex: 'none', w: 'full' },
    },
  }),
  primaryButton: css({
    boxShadow: 'glow',
    _hover: { transform: 'translateY(-2px)' },
  }),
  traitGrid: css({
    position: 'relative',
    w: 'full',
    maxW: { base: '400px', lg: '420px' },
    mx: { base: 'auto', lg: '0' },
    justifySelf: { base: 'center', lg: 'start' },
    pl: { base: '0', lg: '2', xl: '4' },
    _before: {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: { lg: '0' },
      display: { base: 'none', lg: 'block' },
      w: '1px',
      h: 'min(70vh, 560px)',
      transform: 'translateY(-50%)',
      background: `linear-gradient(transparent, ${accentBorder}, transparent)`,
    },
  }),
  traitHeading: css({
    mb: { base: '6', md: '8' },
    color: 'fg.default',
    fontSize: { base: '3xl', lg: '4xl' },
    fontWeight: 'bold',
    letterSpacing: 'tight',
    lineHeight: 'tight',
    textAlign: 'center',
  }),
  traitList: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: { base: '5', md: '10', lg: '2', xl: '8' },
    rowGap: { base: '5', md: '7', lg: '5', xl: '7' },
    p: '0',
    m: '0',
    listStyle: 'none',
  }),
  traitItem: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1',
    textAlign: 'center',
    '& small': {
      color: 'fg.subtle',
      fontSize: '2xs',
      lineHeight: 'snug',
      whiteSpace: 'nowrap',
    },
  }),
  traitIcon: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: { base: '58px', md: '64px', xl: '72px' },
    h: { base: '58px', md: '64px', xl: '72px' },
    border: '1px solid',
    borderColor: accentBorder,
    borderRadius: 'full',
    bg: 'transparent',
    '& img': {
      w: { base: '26px', md: '30px', xl: '34px' },
      h: { base: '28px', md: '32px', xl: '36px' },
      objectFit: 'contain',
      filter:
        'sepia(1) saturate(7) hue-rotate(330deg) brightness(1.1) drop-shadow(0 0 8px token(colors.accent.default))',
    },
  }),
  traitTitle: css({
    color: 'fg.default',
    fontSize: { base: '2xs', md: 'xs' },
  }),
};
