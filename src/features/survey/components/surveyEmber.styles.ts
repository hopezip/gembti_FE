import { css } from 'styled-system/css';

// 설문 배경 불씨(ember) 데코 레이어 스타일 (SURVEY-FE-004).
// - 색은 semantic token만 사용. 토큰에 없는 밝은 노랑/흰빛은 color-mix로 accent에서 파생.
// - 랜덤 파라미터(--ember-*)는 컴포넌트가 CSS 변수로 주입한다.
// - 성능: transform + opacity 애니메이션만. filter:brightness / box-shadow glow 미사용.

// 불씨 색 그라데이션 — 중심 흰빛 → 밝은 살구/노랑 → accent.hover(주황) → accent.default → 투명.
const emberGradient = `radial-gradient(circle,
  color-mix(in srgb, token(colors.accent.hover) 15%, white) 0%,
  color-mix(in srgb, token(colors.accent.hover) 55%, white) 28%,
  token(colors.accent.hover) 52%,
  token(colors.accent.default) 68%,
  transparent 80%)`;

// 하단 불빛(hearth) — accent 기반 radial glow.
const hearthGradient = `radial-gradient(70% 100% at 50% 100%,
  color-mix(in srgb, token(colors.accent.hover) 55%, transparent),
  color-mix(in srgb, token(colors.accent.default) 32%, transparent) 40%,
  transparent 72%)`;

export const surveyEmberStyles = {
  // 콘텐츠(zIndex 'raised') 아래, 배경 이미지 위에 깔리는 데코 레이어.
  layer: css({
    position: 'absolute',
    inset: '0',
    zIndex: '0',
    overflow: 'hidden',
    pointerEvents: 'none',
  }),

  hearth: css({
    position: 'absolute',
    left: '-5%',
    right: '-5%',
    bottom: '-8%',
    height: '22%',
    background: hearthGradient,
    filter: 'blur(14px)',
    mixBlendMode: 'screen',
    animationName: 'hearthFlicker',
    // 속도(--ember-speed)는 layer가 주입. 1.2s 기준을 속도로 나눈다.
    animationDuration: 'calc(1.2s / var(--ember-speed))',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  }),

  ember: css({
    position: 'absolute',
    bottom: '-2%',
    width: 'var(--ember-sz)',
    height: 'var(--ember-sz)',
    borderRadius: 'full',
    background: emberGradient,
    willChange: 'transform, opacity',
    opacity: '0',
    animationName: 'emberFloat',
    // 각 불씨 고유 길이(--ember-dur)를 전역 속도(--ember-speed)로 나눈다.
    animationDuration: 'calc(var(--ember-dur) / var(--ember-speed))',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: '0',
    },
  }),
};
