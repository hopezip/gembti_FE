'use client';

import dynamic from 'next/dynamic';

// createBrowserRouter는 window가 필요하므로 SSR을 끈다.
// ssr:false는 클라이언트 컴포넌트에서만 호출 가능 → 이 파일이 담당.
const App = dynamic(() => import('@/App').then((m) => m.App), {
  ssr: false,
});

export function Client() {
  return <App />;
}
