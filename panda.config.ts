/**
 * GAMBITI · Panda CSS 설정
 * ----------------------------------------------------------------
 * 다크 모드 전용 · 데스크탑 우선
 * 와이어프레임(pages/*.html, _detail-base.css, _write-base.css)에서
 * 추출한 토큰을 Park UI 컨벤션에 맞춰 정제한 결과입니다.
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
    extend: {
      tokens: {
        /* ─────────────────────────────  COLORS · PRIMITIVE  ───────────────────────────── */
        colors: {
          // 중립 다크 스케일 — 와이어프레임의 #0c0c0d ~ #f2f2f2를 12단계로 정제
          gray: {
            50: { value: '#f2f2f2' }, // 본문 텍스트
            100: { value: '#d8d8da' },
            200: { value: '#b8b8b8' }, // 보조 텍스트
            300: { value: '#9e9ea4' },
            400: { value: '#7a7a82' }, // 약한 텍스트 / 플레이스홀더
            500: { value: '#5c5c64' },
            600: { value: '#45454c' },
            700: { value: '#35353c' }, // 강조 보더
            800: { value: '#2a2a2f' }, // 기본 보더
            850: { value: '#222226' }, // 한 단계 위 surface
            900: { value: '#1a1a1d' }, // 기본 surface
            925: { value: '#141416' }, // subtle bg
            950: { value: '#0c0c0d' }, // 캔버스(최하층)
          },

          // 브랜드 액센트 — #ef5a2c 중심으로 스케일 확장
          orange: {
            50: { value: '#fff2ed' },
            100: { value: '#ffe0d0' },
            200: { value: '#ffbf9c' },
            300: { value: '#ff9a6a' },
            400: { value: '#ff7a4d' }, // hover / glow 보조
            500: { value: '#ef5a2c' }, // ⭐ 메인 액센트
            600: { value: '#d04318' },
            700: { value: '#a8330d' },
            800: { value: '#802608' },
            900: { value: '#5a1a05' },
          },

          // 상태 컬러 — 와이어프레임에서 실제로 사용한 값 기준
          success: {
            400: { value: '#7bd389' }, // 파티/성공
            500: { value: '#5ec072' },
            600: { value: '#4ba85e' },
          },
          warning: {
            400: { value: '#f7d774' }, // 노트/주의/스포일러
            500: { value: '#e8c155' },
            600: { value: '#caa53a' },
          },
          danger: {
            400: { value: '#ff7a7a' }, // 삭제/오류
            500: { value: '#ee5e5e' },
            600: { value: '#d04545' },
          },
          info: {
            400: { value: '#7aa7d8' }, // 공략/안내
            500: { value: '#5e8dc4' },
            600: { value: '#4a73a8' },
          },

          // 외부 브랜드 컬러(필요시)
          steam: { value: '#1b2838' },
          discord: { value: '#5865f2' },
        },

        /* ─────────────────────────────  TYPOGRAPHY  ───────────────────────────── */
        fonts: {
          sans: {
            value:
              "'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', sans-serif",
          },
          mono: { value: "'JetBrains Mono', ui-monospace, monospace" },
          display: { value: "'Archivo Black', sans-serif" }, // 로고 전용
        },
        fontSizes: {
          // 본문 스케일
          '2xs': { value: '10px' },
          xs: { value: '11px' },
          sm: { value: '12px' },
          md: { value: '13px' }, // 기본 UI 텍스트
          lg: { value: '14px' }, // 본문 기본
          xl: { value: '16px' }, // 본문 강조 / large input
          // 헤딩 스케일
          '2xl': { value: '18px' },
          '3xl': { value: '20px' },
          '4xl': { value: '22px' },
          '5xl': { value: '24px' },
          '6xl': { value: '30px' }, // 페이지 타이틀
          '7xl': { value: '36px' },
          '8xl': { value: '48px' },
          display: { value: '54px' }, // 히어로 큰 타이틀
        },
        lineHeights: {
          none: { value: '1' },
          tight: { value: '1.2' },
          snug: { value: '1.35' },
          normal: { value: '1.55' },
          relaxed: { value: '1.7' },
          loose: { value: '1.85' }, // 게시글 본문
        },
        fontWeights: {
          normal: { value: '400' },
          medium: { value: '500' },
          semibold: { value: '600' },
          bold: { value: '700' },
          extrabold: { value: '800' },
        },
        letterSpacings: {
          tighter: { value: '-1.2px' }, // 히어로
          tight: { value: '-0.5px' }, // 헤딩
          normal: { value: '0' },
          wide: { value: '0.4px' },
          wider: { value: '0.6px' }, // 모노 캡션
          widest: { value: '1.2px' }, // 로고
        },

        /* ─────────────────────────────  SPACING (4px 그리드)  ───────────────────────────── */
        spacing: {
          0: { value: '0' },
          px: { value: '1px' },
          0.5: { value: '2px' },
          1: { value: '4px' },
          1.5: { value: '6px' },
          2: { value: '8px' },
          2.5: { value: '10px' },
          3: { value: '12px' },
          3.5: { value: '14px' },
          4: { value: '16px' },
          5: { value: '20px' },
          6: { value: '24px' },
          7: { value: '28px' },
          8: { value: '32px' },
          9: { value: '36px' },
          10: { value: '40px' },
          11: { value: '44px' },
          12: { value: '48px' },
          14: { value: '56px' },
          16: { value: '64px' },
          20: { value: '80px' },
          24: { value: '96px' },
          32: { value: '128px' },
        },

        /* ─────────────────────────────  RADII  ───────────────────────────── */
        radii: {
          none: { value: '0' },
          xs: { value: '3px' }, // 작은 태그 / 키캡
          sm: { value: '4px' }, // 작은 뱃지
          md: { value: '6px' }, // ⭐ 버튼/입력 기본
          lg: { value: '8px' }, // 입력 큰 / 카드 작은
          xl: { value: '10px' }, // 카드 / 패널
          '2xl': { value: '12px' }, // 프레임 / 모달
          '3xl': { value: '14px' }, // 큰 모달
          full: { value: '9999px' }, // 알약 / 원
        },

        /* ─────────────────────────────  SHADOWS  ───────────────────────────── */
        shadows: {
          xs: { value: '0 1px 2px rgba(0,0,0,.4)' },
          sm: { value: '0 2px 8px rgba(0,0,0,.4)' },
          md: { value: '0 8px 24px -6px rgba(0,0,0,.55)' },
          lg: { value: '0 14px 40px -10px rgba(0,0,0,.7)' }, // popover, toast
          xl: { value: '0 30px 80px -10px rgba(0,0,0,.7)' }, // modal
          frame: { value: '0 30px 80px -30px rgba(0,0,0,.6)' }, // 와이어프레임 프레임
          // 액센트 글로우 — chatbot, primary CTA hover
          glow: {
            value:
              '0 10px 30px -8px rgba(239,90,44,.6), 0 4px 12px rgba(0,0,0,.4)',
          },
          // focus ring (semantic으로도 노출됨)
          focusRing: { value: '0 0 0 3px rgba(239,90,44,.32)' },
        },

        /* ─────────────────────────────  MOTION  ───────────────────────────── */
        durations: {
          fast: { value: '120ms' },
          base: { value: '150ms' },
          slow: { value: '200ms' },
          slower: { value: '300ms' },
        },
        easings: {
          standard: { value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
          decel: { value: 'cubic-bezier(0, 0, 0.2, 1)' },
          accel: { value: 'cubic-bezier(0.4, 0, 1, 1)' },
        },

        /* ─────────────────────────────  Z-INDEX  ───────────────────────────── */
        zIndex: {
          base: { value: '0' },
          raised: { value: '5' },
          sticky: { value: '10' },
          header: { value: '60' },
          dropdown: { value: '25' },
          tooltip: { value: '50' },
          modal: { value: '300' },
          toast: { value: '400' },
        },

        /* ─────────────────────────────  SIZES (자주 쓰는 고정값)  ───────────────────────────── */
        sizes: {
          // 컨테이너 최대폭
          containerSm: { value: '720px' },
          containerMd: { value: '980px' },
          containerLg: { value: '1280px' }, // 기본 페이지 max-width
          // 사이드바
          sideNarrow: { value: '260px' }, // 필터/내비
          sideWide: { value: '320px' }, // 가이드/TOC
          sideBuy: { value: '360px' }, // 디테일 페이지 buy card
          // 아바타
          avatarXs: { value: '24px' },
          avatarSm: { value: '28px' },
          avatarMd: { value: '32px' },
          avatarLg: { value: '36px' },
          avatarXl: { value: '48px' },
        },
      },

      /* ─────────────────────────────  SEMANTIC TOKENS  ───────────────────────────── */
      // 모든 컴포넌트는 ‘의미 토큰’만 사용하세요.
      // primitive(gray.900 등)는 토큰 정의 내부에서만 참조합니다.
      semanticTokens: {
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
      },

      /* ─────────────────────────────  RECIPES (컴포넌트 anatomy)  ───────────────────────────── */
      // Park UI 컴포넌트가 이미 같은 anatomy를 제공하지만, 우리 디자인 토큰에 맞게
      // variant/size 옵션을 GAMBITI 와이어프레임 기준으로 ‘하나로 통일’합니다.
      recipes: {
        button: {
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
        },

        input: {
          className: 'input',
          base: {
            w: 'full',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 'lg',
            color: 'fg.default',
            fontFamily: 'sans',
            transition:
              'border-color {durations.fast}, box-shadow {durations.fast}',
            _placeholder: { color: 'fg.placeholder' },
            _focus: {
              outline: 'none',
              borderColor: 'accent.default',
              boxShadow: 'focusRing',
            },
            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
            '&[aria-invalid=true]': {
              borderColor: 'danger.default',
              boxShadow: '0 0 0 3px rgba(255,122,122,.08)',
            },
          },
          variants: {
            size: {
              sm: { h: '9', px: '3', fontSize: 'md' }, // 36
              md: { h: '10', px: '3.5', fontSize: 'lg' }, // 40 — ⭐ 기본
              lg: { h: '12', px: '4', fontSize: 'xl', fontWeight: 'medium' }, // 48
            },
          },
          defaultVariants: { size: 'md' },
        },

        tag: {
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
        },

        chip: {
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
        },

        // Park UI preset이 'card'를 slotRecipe로 제공하므로, 우리 단일 recipe는
        // 이름 충돌을 피해 'gameCard'로 둔다. (slotRecipe vs recipe 동명 충돌 해소)
        gameCard: {
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
                transition:
                  'border-color {durations.base}, transform {durations.base}',
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
        },

        // (다른 컴포넌트 recipes는 DESIGN_SYSTEM.md 참조 후 점진적으로 추가)
      },
    },

    /* ─────────────────────────────  TEXT STYLES (헤딩/본문 프리셋)  ───────────────────────────── */
    textStyles: {
      'display.lg': {
        value: {
          fontSize: 'display',
          lineHeight: 'tight',
          fontWeight: 'extrabold',
          letterSpacing: 'tighter',
        },
      },
      'heading.h1': {
        value: {
          fontSize: '6xl',
          lineHeight: 'tight',
          fontWeight: 'extrabold',
          letterSpacing: 'tight',
        },
      },
      'heading.h2': {
        value: {
          fontSize: '4xl',
          lineHeight: 'snug',
          fontWeight: 'bold',
          letterSpacing: 'tight',
        },
      },
      'heading.h3': {
        value: { fontSize: '3xl', lineHeight: 'snug', fontWeight: 'bold' },
      },
      'heading.h4': {
        value: { fontSize: '2xl', lineHeight: 'snug', fontWeight: 'bold' },
      },
      'body.lg': {
        value: { fontSize: 'xl', lineHeight: 'normal', fontWeight: 'normal' },
      },
      'body.md': {
        value: { fontSize: 'lg', lineHeight: 'normal', fontWeight: 'normal' },
      }, // ⭐ 기본 본문
      'body.sm': {
        value: { fontSize: 'md', lineHeight: 'normal', fontWeight: 'normal' },
      },
      'body.read': {
        value: { fontSize: 'xl', lineHeight: 'loose', fontWeight: 'normal' },
      }, // 게시글 본문
      caption: {
        value: {
          fontFamily: 'mono',
          fontSize: 'xs',
          letterSpacing: 'wider',
          color: 'fg.subtle',
          textTransform: 'uppercase',
        },
      },
      code: { value: { fontFamily: 'mono', fontSize: 'md' } },
    },
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
