// MSW worker를 개발 환경에서만 1회 시작한다. main.tsx가 이 promise를 await(또는 catch)한 뒤 앱을 마운트한다.
async function unregisterMockServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const mswRegistrations = registrations.filter((registration) => {
    const worker =
      registration.active ?? registration.installing ?? registration.waiting;

    return worker?.scriptURL.endsWith('/mockServiceWorker.js');
  });

  await Promise.all(
    mswRegistrations.map((registration) => registration.unregister()),
  );
}

export async function enableMocking(): Promise<void> {
  // 배포 번들에서는 배포 환경변수 오설정과 무관하게 MSW를 시작하지 않는다.
  if (!import.meta.env.DEV) {
    await unregisterMockServiceWorker();
    return;
  }

  if (import.meta.env.VITE_USE_MOCK !== 'true') return;

  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
