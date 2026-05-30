/**
 * GAMBITI · Panda CSS 설정
 * ----------------------------------------------------------------
 * 다크 모드 전용 · 데스크탑 우선
 * 와이어프레임(pages/*.html, _detail-base.css, _write-base.css)에서
 * 추출한 토큰을 Park UI 컨벤션에 맞춰 정제한 결과입니다.
 *
 * ⚙️ 구조(TASK-DEVEX-002): 토큰/시맨틱/recipe/textStyles 정의는 src/theme/ 로 분해되어 있습니다.
 *    - 디자인 작업/규칙은 src/theme/README.md 를 먼저 보세요.
 *    - 이 파일은 설정 골격(preflight/preset/conditions/globalCss/outdir + theme 조립)만 담습니다.
 *
 * 사용법:
 *   1) `pnpm add -D @pandacss/dev @park-ui/panda-preset` 후
 *   2) 이 파일을 panda.config.ts 로 사용
 *   3) `pnpm panda codegen` 으로 styled-system 생성
 *
 * 토큰 이름 규칙:
 *   - colors.gray.{50..950}    : 중립 다크 스케일(원자값, primitive)
 *   - colors.orange.{50..900}  : 브랜드 액센트(primitive)
 *   - colors.{success|warning|danger|info}.{400..600} : 상태(primitive)
 *   - semanticTokens.colors.bg.{canvas|subtle|surface|surfaceRaised}
 *   - semanticTokens.colors.fg.{default|muted|subtle|onAccent}
 *   - semanticTokens.colors.border.{default|emphasized|accent}
 *   - semanticTokens.colors.accent.{default|hover|soft|fg}
 *   - semanticTokens.colors.{success|warning|danger|info|note}.{default|soft|fg}
 *
 * 도메인 컬러(매핑 가이드):
 *   - 리뷰(review) → accent.default
 *   - 파티(party)  → success.default
 *   - 공략(guide)  → info.default
 *   - 공지(notice) → note.default
 */
import { defineConfig } from '@pandacss/dev';
import { createPreset } from '@park-ui/panda-preset';
import orange from '@park-ui/panda-preset/colors/orange';
import slate from '@park-ui/panda-preset/colors/slate';
import { textStyles, themeExtend } from './src/theme';

export default defineConfig({
  preflight: true,
  jsxFramework: 'react',
  include: ['./src/**/*.{ts,tsx,jsx}'],

  // Park UI 베이스(컴포넌트 anatomy/slotRecipe) 채택.
  // 색·radius는 preset 기본값을 깔고, 아래 theme.extend가 GamBTI 토큰으로 덮어쓴다.
  presets: [
    createPreset({ accentColor: orange, grayColor: slate, radius: 'md' }),
  ],

  // 다크 모드만 사용 — 라이트 모드는 MVP 이후
  conditions: {
    extend: {
      hover: '&:is(:hover, [data-hover])',
      focus: '&:is(:focus-visible, [data-focus-visible])',
      disabled: '&:is(:disabled, [data-disabled])',
      on: '&[data-state=on], &.on',
    },
  },

  theme: {
    // 토큰/시맨틱/recipe 정의 → src/theme/ (tokens.ts, semantic-tokens.ts, recipes/)
    extend: themeExtend,
    // ⚠️ textStyles는 theme.extend 밖(theme 직속)에 둔다 — 분해 전 위치 보존.
    textStyles,
  },

  // 폰트 임포트(전역 @import 또는 next/font와 함께)
  globalCss: {
    'html, body': {
      bg: 'bg.canvas',
      color: 'fg.default',
      fontFamily: 'sans',
      fontSize: 'lg',
      WebkitFontSmoothing: 'antialiased',
    },
    '*, *::before, *::after': { boxSizing: 'border-box' },
    '::selection': { bg: 'accent.soft', color: 'accent.fg' },
  },

  outdir: 'styled-system',
});
