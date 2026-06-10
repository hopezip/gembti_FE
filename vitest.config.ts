/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

// 이 파일은 Vitest 전용(vite.config.ts는 앱 런타임 + Storybook 빌더 담당).
// react 플러그인·alias가 테스트에 그대로 필요하므로 함께 둔다.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'styled-system': fileURLToPath(
        new URL('./styled-system', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
