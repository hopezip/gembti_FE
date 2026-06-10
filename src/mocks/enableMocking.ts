// MSW worker를 1회 시작한다. main.tsx가 이 promise를 await(또는 catch)한 뒤 앱을 마운트한다.
export async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return;

  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
