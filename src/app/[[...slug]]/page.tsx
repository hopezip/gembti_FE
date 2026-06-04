import { Client } from './client';

// 모든 경로(/ · /login · /games/:id …)를 이 optional catch-all이 받고,
// 클라이언트의 기존 react-router(createBrowserRouter)가 실제 라우팅을 처리한다.
// 서버 컴포넌트는 얇게 두고 마운트는 client.tsx가 담당.
export default function CatchAllPage() {
  return <Client />;
}
