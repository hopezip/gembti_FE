import { fileURLToPath, URL } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // 스토리는 src 하위 *.stories.tsx 만 인식한다 (예제 mdx/js 미사용).
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  // Vite 설정과 동일한 경로 alias(@/, styled-system/)를 공유한다.
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      'styled-system': fileURLToPath(
        new URL('../styled-system', import.meta.url),
      ),
    };
    return viteConfig;
  },
};

export default config;
