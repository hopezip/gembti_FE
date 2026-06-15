import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SurveyQuestion } from '@/features/survey/api/surveyQuestions';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';
import { useSurveyQuestionSection } from './useSurveyQuestionSection';

const questions: SurveyQuestion[] = [
  { id: 1, question: '첫 번째 질문' },
  { id: 2, question: '두 번째 질문' },
];

describe('useSurveyQuestionSection', () => {
  beforeEach(() => {
    useSurveyProgressStore.getState().resetProgress();
  });

  it('답변 선택만으로 다음 문항으로 자동 이동하지 않는다', () => {
    const { result } = renderHook(() =>
      useSurveyQuestionSection({ questions }),
    );

    act(() => result.current.selectAnswer(4));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.selectedValue).toBe(4);
  });

  it('미선택 문항은 다음으로 이동하지 않고 선택 후에만 이동한다', () => {
    const { result } = renderHook(() =>
      useSurveyQuestionSection({ questions }),
    );

    act(() => result.current.nextQuestion());
    expect(result.current.currentIndex).toBe(0);

    act(() => result.current.selectAnswer(3));
    act(() => result.current.nextQuestion());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.selectedValue).toBeNull();
  });

  it('마지막 문항 선택 후 버튼을 눌러야 설문을 완료한다', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useSurveyQuestionSection({ questions, onComplete }),
    );

    act(() => result.current.selectAnswer(2));
    act(() => result.current.nextQuestion());
    act(() => result.current.selectAnswer(5));

    expect(onComplete).not.toHaveBeenCalled();

    act(() => result.current.nextQuestion());
    expect(onComplete).toHaveBeenCalledWith(
      [
        { question_id: 1, answer: 2 },
        { question_id: 2, answer: 5 },
      ],
      2,
    );
  });
});
