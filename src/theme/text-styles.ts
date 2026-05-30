// GAMBITI · Text styles (헤딩/본문 프리셋)
// fontSize/lineHeight/fontWeight 조합 프리셋. 값 변경은 cross 흐름, 출처는 docs/design.
// 주의: panda.config.ts에서 이 textStyles는 theme.extend 밖(theme 직속)에 등록한다.
import { defineTextStyles } from '@pandacss/dev';

// 참고: Panda 글로벌 타입의 TextStyleProperty에는 `color`가 빠져 있어
// caption의 `color: 'fg.subtle'`이 타입상 거부된다(codegen은 정상 처리 — 값 1:1 보존).
// 값을 바꾸지 않기 위해 헬퍼 입력 타입으로만 캐스팅해 한계를 우회한다.
type TextStylesInput = Parameters<typeof defineTextStyles>[0];

export const textStyles = defineTextStyles({
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
} as TextStylesInput);
