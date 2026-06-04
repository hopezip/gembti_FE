'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useState } from 'react';
import { queryClient } from '@/lib/queryClient';
import { enableMocking } from '@/mocks/enableMocking';

// Devtools는 개발 환경에서만 lazy 로드(프로덕션 번들 제외).
const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((d) => ({
          default: d.ReactQueryDevtools,
        })),
      )
    : () => null;

// 모듈 레벨 1회 호출 — Strict Mode가 effect를 2회 실행해도 worker.start 이중 호출 방지.
const mockingPromise = enableMocking();

export function Providers({ children }: { children: React.ReactNode }) {
  // worker 준비 전에는 렌더를 보류해 첫 쿼리가 mock을 놓치지 않게 한다.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // mock 초기화가 실패해도 앱은 떠야 한다(빈 화면 방지). 실패 원인은 콘솔에 남기고
    //   mock 없이라도 렌더를 진행한다(실서버 모드/worker.start 실패 모두 동일 처리).
    mockingPromise
      .catch((error) => {
        console.error('[MSW] 초기화 실패 — mock 없이 진행합니다.', error);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  );
}
