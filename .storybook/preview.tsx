import type { Decorator, Preview } from '@storybook/react-vite';
import React from 'react';
// 앱과 동일한 Panda 글로벌 CSS 진입점 (panda codegen 산출물이 주입되는 layer 선언).
import '../src/index.css';

// 다크 모드 전용: Park UI preset의 `.dark` 셀렉터를 스토리 루트에 부여한다.
// (GamBTI 토큰은 다크 단일값이지만, _dark 조건을 쓰는 컴포넌트까지 일관 보장)
const withDarkMode: Decorator = (Story) =>
  React.createElement(
    'div',
    {
      className: 'dark',
      'data-color-mode': 'dark',
      style: { minHeight: '100vh', padding: '24px' },
    },
    React.createElement(Story),
  );

const preview: Preview = {
  decorators: [withDarkMode],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // 다크 배경을 기본값으로 강제 (라이트 프리셋 미노출).
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#0c0c0d' },
      },
    },
    // 데스크탑 전용: 데스크탑 뷰포트를 기본값으로, 모바일 프리셋은 제공하지 않는다.
    viewport: {
      options: {
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        wide: {
          name: 'Wide',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    a11y: {
      // 'todo' — a11y 위반을 테스트 UI에만 표시
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'dark' },
    viewport: { value: 'desktop' },
  },
};

export default preview;
