import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import { App } from './App';
import { queryClient } from './lib/queryClient';
import { enableMocking } from './mocks/enableMocking';

// ReactQueryDevtools는 개발 환경에서만 lazy 로드한다.
// production 빌드에서는 동적 import 자체가 트리쉐이킹되어 번들에서 제외된다.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((d) => ({
        default: d.ReactQueryDevtools,
      })),
    )
  : () => null;

// MSW worker를 먼저 준비한다. 초기화가 실패해도(실서버 모드/worker.start 실패)
// 앱은 떠야 하므로 catch로 흡수하고 finally에서 마운트한다(빈 화면 방지).
enableMocking()
  .catch((error) => {
    console.error('[MSW] 초기화 실패 — mock 없이 진행합니다.', error);
  })
  .finally(() => {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element #root not found');
    }

    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        </QueryClientProvider>
      </StrictMode>,
    );
  });
