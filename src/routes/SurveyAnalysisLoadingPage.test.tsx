import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';
import { SurveyAnalysisLoadingPage } from './SurveyAnalysisLoadingPage';

let shouldResolveSubmit = true;

vi.mock('@/features/survey/api/surveyResult', () => ({
  useSubmitSurvey: () => ({
    mutate: (_variables: unknown, options?: { onSuccess?: () => void }) =>
      shouldResolveSubmit && options?.onSuccess?.(),
  }),
}));

afterEach(() => {
  useAuthStore.getState().clearAuth();
  useSurveyProgressStore.getState().resetProgress();
  shouldResolveSubmit = true;
  vi.useRealTimers();
});

describe('SurveyAnalysisLoadingPage', () => {
  it('선택한 문항 수를 표시하고 제출 완료 후 결과 페이지로 이동한다', async () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/survey/loading',
            state: {
              answers: [
                { question_id: 1, answer: 5 },
                { question_id: 2, answer: 3 },
                { question_id: 6, answer: 1 },
              ],
              totalQuestions: 7,
            },
          },
        ]}
      >
        <Routes>
          <Route
            path="/survey/loading"
            element={<SurveyAnalysisLoadingPage />}
          />
          <Route path="/survey/result" element={<div>설문 결과 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/문항 검사/)).toHaveTextContent('3 / 7 문항 검사');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4300);
    });

    expect(screen.getByText('설문 결과 화면')).toBeInTheDocument();
  });

  it('전체 문항 제출 성공 시 현재 사용자를 설문 완료 상태로 갱신한다', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: 'survey@gambti.com',
        nickname: '설문유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'mock-access',
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/survey/loading',
            state: {
              answers: Array.from({ length: 7 }, (_, index) => ({
                question_id: index + 1,
                answer: 3,
              })),
              totalQuestions: 7,
            },
          },
        ]}
      >
        <Routes>
          <Route
            path="/survey/loading"
            element={<SurveyAnalysisLoadingPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(useAuthStore.getState().user?.hasCompletedSurvey).toBe(true);
  });

  it('제출 응답이 지연되어도 최대 로딩 시간이 지나면 결과 페이지로 이동한다', async () => {
    vi.useFakeTimers();
    shouldResolveSubmit = false;

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/survey/loading',
            state: {
              answers: [{ question_id: 1, answer: 5 }],
              totalQuestions: 7,
            },
          },
        ]}
      >
        <Routes>
          <Route
            path="/survey/loading"
            element={<SurveyAnalysisLoadingPage />}
          />
          <Route path="/survey/result" element={<div>설문 결과 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4300);
    });

    expect(screen.getByText('설문 결과 화면')).toBeInTheDocument();
  });
});
