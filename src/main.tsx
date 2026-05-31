import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import { App } from './App';
import { queryClient } from './lib/queryClient';

// ReactQueryDevtools는 개발 환경에서만 lazy 로드한다.
// production 빌드에서는 동적 import 자체가 트리쉐이킹되어 번들에 포함되지 않는다.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((d) => ({
        default: d.ReactQueryDevtools,
      })),
    )
  : () => null;

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return;

  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
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
