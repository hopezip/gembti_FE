// GAMBITI · Primitive 토큰 (원자값)
// 이 값들은 토큰 정의 내부에서만 참조한다. 컴포넌트에서는 semantic token만 사용할 것.
// 값 변경은 cross 흐름이며 출처(SSOT)는 docs/design 이다 — 임의 변경 금지.
import { defineTokens } from '@pandacss/dev';

export const tokens = defineTokens({
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
      value: "'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', sans-serif",
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
      value: '0 10px 30px -8px rgba(239,90,44,.6), 0 4px 12px rgba(0,0,0,.4)',
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
});
