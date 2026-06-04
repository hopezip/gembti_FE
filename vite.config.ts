import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// Storybook(@storybook/react-vite) 빌더 전용. 앱 런타임은 Next로 이전됨.
// Vitest 설정은 vitest.config.ts로 분리했다.
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
});
