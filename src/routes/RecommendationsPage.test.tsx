import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { RecommendationsPage } from './RecommendationsPage';

// REC-FE-002 개인화 가드 — 보안 회귀 방지.
// /recommendations는 Public이라 비인증으로도 진입 가능하다. 개인화 컴포넌트를 무가드로 렌더하면
// 이전 로그인 사용자의 ['home','personalized'] 캐시가 로그아웃 후에도 노출된다(개인정보 누출).
// 따라서 authenticated && hasCompletedSurvey 가 아니면 개인화 Hero/그리드를 렌더하지 않아야 한다.

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  useAuthStore.getState().clearAuth();
  queryClient.clear();
});

describe('RecommendationsPage 개인화 가드', () => {
  it('비로그인 상태에서는 개인화 Hero 대신 로그인 안내를 렌더한다', () => {
    // 기본 store = anonymous.
    renderPage();

    expect(
      screen.getByRole('link', { name: '로그인하기' }),
    ).toBeInTheDocument();
    // 개인화 Hero 헤드라인("…골라봤어요")은 렌더되지 않아야 한다(캐시 노출 차단).
    expect(screen.queryByText(/골라봤어요/)).not.toBeInTheDocument();
  });

  it('로그인했으나 설문 미완이면 설문 유도 안내를 렌더한다(개인화 미렌더)', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: 'survey-incomplete@gambti.com',
        nickname: '테스트유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'test-access',
    });

    renderPage();

    expect(
      screen.getByRole('link', { name: '설문 시작하기' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/골라봤어요/)).not.toBeInTheDocument();
  });

  it('로그인 + 설문완료면 개인화 Hero를 렌더한다(가드 통과)', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 2,
        email: 'survey@gambti.com',
        nickname: '설문완료유저',
        hasCompletedSurvey: true,
      },
      accessToken: 'test-access',
    });

    renderPage();

    // 개인화 Hero 헤드라인은 데이터 로딩과 무관하게 항상 렌더된다(닉네임 기반).
    expect(screen.getByText(/골라봤어요/)).toBeInTheDocument();
    // 게이트 CTA는 노출되지 않아야 한다.
    expect(
      screen.queryByRole('link', { name: '로그인하기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '설문 시작하기' }),
    ).not.toBeInTheDocument();
  });
});
