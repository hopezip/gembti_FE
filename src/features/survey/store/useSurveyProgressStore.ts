import { create } from 'zustand';
import type { SurveyAnswerValue } from '@/features/survey/api/types';

interface SurveyProgressState {
  answers: Record<number, SurveyAnswerValue>;
  saveProgress: (answers: Record<number, SurveyAnswerValue>) => void;
  resetProgress: () => void;
}

export const useSurveyProgressStore = create<SurveyProgressState>((set) => ({
  answers: {},
  saveProgress: (answers) => set({ answers }),
  resetProgress: () => set({ answers: {} }),
}));
