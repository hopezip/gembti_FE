// GAMBITI · Semantic 토큰 (의미 토큰)
// 모든 컴포넌트는 이 의미 토큰만 사용한다. primitive(gray.900 등)는 여기 정의 내부에서만 참조.
// 값 변경은 cross 흐름이며 출처(SSOT)는 docs/design 이다 — 임의 변경 금지.
import { defineSemanticTokens } from '@pandacss/dev';

export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      canvas: { value: '{colors.gray.950}' }, // 페이지 최하층
      subtle: { value: '{colors.gray.925}' }, // 살짝 올라온 영역
      surface: { value: '{colors.gray.900}' }, // 카드/패널 기본
      surfaceRaised: { value: '{colors.gray.850}' }, // 카드 위의 카드
      overlay: { value: 'rgba(0,0,0,.65)' }, // 모달 배경
    },
    fg: {
      default: { value: '{colors.gray.50}' },
      muted: { value: '{colors.gray.200}' },
      subtle: { value: '{colors.gray.400}' },
      placeholder: { value: '{colors.gray.400}' },
      onAccent: { value: '#ffffff' }, // primary 버튼 위 텍스트
      link: { value: '{colors.orange.500}' },
    },
    border: {
      default: { value: '{colors.gray.800}' },
      emphasized: { value: '{colors.gray.700}' },
      accent: { value: '{colors.orange.500}' },
      danger: { value: '{colors.danger.400}' },
    },
    accent: {
      default: { value: '{colors.orange.500}' },
      hover: { value: '{colors.orange.400}' },
      active: { value: '{colors.orange.600}' },
      soft: { value: 'rgba(239,90,44,0.14)' },
      fg: { value: '{colors.orange.500}' }, // soft 배경 위의 텍스트
    },
    success: {
      default: { value: '{colors.success.400}' },
      soft: { value: 'rgba(123,211,137,0.14)' },
      fg: { value: '{colors.success.400}' },
    },
    warning: {
      // = note
      default: { value: '{colors.warning.400}' },
      soft: { value: 'rgba(247,215,116,0.08)' },
      fg: { value: '{colors.warning.400}' },
    },
    danger: {
      default: { value: '{colors.danger.400}' },
      soft: { value: 'rgba(255,122,122,0.08)' },
      fg: { value: '{colors.danger.400}' },
    },
    info: {
      default: { value: '{colors.info.400}' },
      soft: { value: 'rgba(122,167,216,0.08)' },
      fg: { value: '{colors.info.400}' },
    },
  },
});
