import { RouterProvider } from 'react-router-dom';
import { useSessionRestore } from '@/features/auth/hooks/useSessionRestore';
import { router } from './routes';

export function App() {
  // 부팅 시 httpOnly 쿠키 refresh로 access 재발급 + /me로 세션 복원(LOGIN-FE-006).
  // 복원이 끝날 때까지 라우터를 보류해 보호 라우트가 깜빡이지 않게 한다.
  const { ready } = useSessionRestore();

  if (!ready) return null;

  return <RouterProvider router={router} />;
}
