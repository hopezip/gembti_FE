// MSW worker를 브라우저에서만 1회 시작한다.
// providers가 이 promise를 await해 worker 준비 후 children을 렌더한다.
export async function enableMocking(): Promise<void> {
  // providers.tsx가 'use client'여도 Next SSR/프리렌더에서 모듈이 평가될 수 있다.
  // msw/browser 동적 import는 브라우저에서만 실행되게 막는다.
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') return;

  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
