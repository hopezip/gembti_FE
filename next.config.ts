import type { NextConfig } from 'next';

// 서버 모드 유지: output:'export'를 쓰지 않는다(route handler/server action 필요).
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
