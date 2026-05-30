import { render, screen } from '@testing-library/react';
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  Routes,
  RouterProvider,
} from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { routeObjects } from './index';
import { PlaceholderPage } from './PlaceholderPage';

// 라우트 정의를 메모리 라우터로 렌더한다(브라우저 history 없이 테스트).
function renderAt(path: string) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

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
});
