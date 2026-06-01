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

  it('GlobalShell layout 라우트가 모든 경로에 Header/Footer 셸을 렌더한다', () => {
    // 중첩 구조에서 페이지(Outlet)와 함께 셸 landmark(banner/nav/contentinfo)가 보여야 한다.
    renderAt('/search');
    expect(screen.getByRole('banner')).toBeInTheDocument(); // <header>
    expect(
      screen.getByRole('navigation', { name: '주요 메뉴' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // <footer>
    // 페이지 콘텐츠도 함께 렌더(셸이 페이지를 덮어쓰지 않음).
    expect(screen.getByRole('heading', { name: '검색' })).toBeInTheDocument();
  });

  it('비로그인 stub에서 셸 인증 액션이 "로그인" 링크를 보여준다', () => {
    // useAuthStore stub은 항상 'anonymous'이므로 Avatar 대신 로그인 링크가 보인다.
    renderAt('/');
    const loginLink = screen.getByRole('link', { name: '로그인' });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('인증 페이지(/login)에도 GlobalShell 셸이 적용된다', () => {
    renderAt('/login');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
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
