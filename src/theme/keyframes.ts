// GAMBITI · keyframes (애니메이션 정의)
// themeExtend.keyframes 로 등록되어 Panda가 @keyframes 산출물을 생성한다.
// 값 변경은 cross 흐름(출처 SSOT는 docs/design). 컴포넌트는 css의 animationName 으로 참조.
//
// ⚠️ 좌표/투명도 일부는 컴포넌트가 주입하는 CSS 변수(--ember-*)를 참조한다.
//    랜덤 파라미터(시작 위치·크기·흔들림 진폭 등)는 컴포넌트에서 1회 계산해 변수로 주입한다.
import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
  // 불씨(ember): 하단에서 위로 떠오르며 좌우로 흔들리고 위로 갈수록 작아지며 사라진다.
  // 깜빡임은 filter 대신 opacity 변동으로 표현 → 리페인트 없이 합성 레이어에서만 처리.
  emberFloat: {
    '0%': {
      transform: 'translate(0, 0) scale(var(--ember-sc))',
      opacity: '0',
    },
    '6%': { opacity: 'var(--ember-op)' },
    '20%': { opacity: 'calc(var(--ember-op) * 0.68)' },
    '35%': {
      transform: 'translate(var(--ember-sway-a), -34vh) scale(var(--ember-sc))',
      opacity: 'var(--ember-op)',
    },
    '55%': { opacity: 'calc(var(--ember-op) * 0.62)' },
    '70%': {
      transform:
        'translate(var(--ember-sway-b), -68vh) scale(calc(var(--ember-sc) * 0.6))',
      opacity: 'calc(var(--ember-op) * 0.85)',
    },
    '90%': { opacity: 'calc(var(--ember-op) * 0.5)' },
    '100%': {
      transform:
        'translate(var(--ember-sway-b), -100vh) scale(calc(var(--ember-sc) * 0.25))',
      opacity: '0',
    },
  },

  // 하단 불빛(hearth): 달궈진 빛이 은은하게 밝아졌다 어두워진다 (opacity + transform scaleX 만).
  hearthFlicker: {
    '0%': { opacity: '0.8', transform: 'scaleX(1)' },
    '50%': { opacity: '1', transform: 'scaleX(1.05)' },
    '100%': { opacity: '0.8', transform: 'scaleX(1)' },
  },
});
