import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// 앱 런타임 + Storybook(@storybook/react-vite) 공용 Vite 설정.
// Vitest 설정은 vitest.config.ts로 분리돼 있다.
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
  // 백엔드 CORS allow-origin이 http://localhost:3000으로 실측 고정돼 있어(refresh 쿠키),
  // dev/preview 포트를 3000으로 맞춘다(Vite 기본 5173 대신).
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
});
