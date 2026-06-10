import { create } from 'zustand';
import type { SurveyAnswerValue } from '@/features/survey/api/types';

interface SurveyProgressState {
  answers: Record<number, SurveyAnswerValue>;
  skippedQuestionIds: number[];
  saveProgress: (
    answers: Record<number, SurveyAnswerValue>,
    skippedQuestionIds: number[],
  ) => void;
  resetProgress: () => void;
}

export const useSurveyProgressStore = create<SurveyProgressState>((set) => ({
  answers: {},
  skippedQuestionIds: [],
  saveProgress: (answers, skippedQuestionIds) =>
    set({ answers, skippedQuestionIds }),
  resetProgress: () => set({ answers: {}, skippedQuestionIds: [] }),
}));
