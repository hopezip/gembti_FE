import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  Routes,
  RouterProvider,
} from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicOnlyRoute } from './guards/PublicOnlyRoute';
import { routeObjects } from './index';
import { PlaceholderPage } from './PlaceholderPage';

// 라우트 정의를 메모리 라우터로 렌더한다(브라우저 history 없이 테스트).
// routeObjects에는 LoginPage(react-query 사용)가 포함되므로 QueryClientProvider로 감싼다.
function renderAt(path: string) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

// 각 테스트 후 authStore를 비로그인 stub 기본값으로 복원한다(테스트 간 격리).
afterEach(() => {
  useAuthStore.getState().clearAuth();
});

describe('라우트 골격', () => {
  it('대표 Public 경로(/search)가 PlaceholderPage를 렌더한다', () => {
    renderAt('/search');
    expect(screen.getByRole('heading', { name: '검색' })).toBeInTheDocument();
    expect(screen.getByText('/search')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('메인 경로(/)가 PlaceholderPage를 렌더한다', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: '메인' })).toBeInTheDocument();
  });

  it('Auth 가드는 비로그인 stub(status:anonymous)에서 /login으로 리다이렉트한다', () => {
    // useAuthStore stub이 항상 'anonymous'를 반환하므로 ProtectedRoute는
    // 보호 페이지 대신 /login 화면을 렌더해야 한다.
    render(
      <MemoryRouter initialEntries={['/mypage']}>
        <Routes>
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <PlaceholderPage
                  title="마이페이지"
                  route="/mypage"
                  access="Auth"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PlaceholderPage
                title="로그인"
                route="/login"
                access="Public only"
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '마이페이지' }),
    ).not.toBeInTheDocument();
  });

  it('/login은 비로그인 시 LoginPage(이메일 로그인 폼)를 렌더한다', () => {
    renderAt('/login');
    // AuthCard 제목 + 이메일/비밀번호 입력 라벨
    expect(
      screen.getByRole('heading', { name: '이메일로 로그인' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/)).toBeInTheDocument();
  });

  it('/login은 로그인 상태면 PublicOnlyRoute가 홈(/)으로 리다이렉트한다', () => {
    // data router(createMemoryRouter)는 jsdom에서 Navigate 시 fetch/AbortSignal 비호환 이슈가 있어,
    // ProtectedRoute 테스트와 동일하게 MemoryRouter(non-data) + PublicOnlyRoute로 가드만 검증한다.
    useAuthStore
      .getState()
      .setAuthenticated({ id: 'u_1', nickname: '테스트유저' });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <PlaceholderPage
                  title="로그인"
                  route="/login"
                  access="Public only"
                />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/"
            element={<PlaceholderPage title="메인" route="/" access="Public" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // 로그인 상태이므로 홈(메인)이 렌더되고 로그인 화면은 사라진다.
    expect(screen.getByRole('heading', { name: '메인' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '로그인' }),
    ).not.toBeInTheDocument();
  });
});
