import { useMemo, useState } from 'react';
import type { SurveyQuestion } from '@/features/survey/api/surveyQuestions';
import type {
  SurveyAnswerValue,
  SurveySubmitAnswer,
} from '@/features/survey/api/types';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';

interface UseSurveyQuestionSectionParams {
  questions: SurveyQuestion[];
  onComplete?: (answers: SurveySubmitAnswer[], totalQuestions: number) => void;
}

export function useSurveyQuestionSection({
  onComplete,
  questions,
}: UseSurveyQuestionSectionParams) {
  // 임시 저장된 설문 응답값을 불러온다.
  const savedAnswers = useSurveyProgressStore((store) => store.answers);
  const saveProgress = useSurveyProgressStore((store) => store.saveProgress);
  const totalSteps = questions.length;
  // 이어하기 진입 시 첫 번째 미응답 문항부터 시작한다.
  const initialIndex = Math.max(
    questions.findIndex((question) => savedAnswers[question.id] === undefined),
    0,
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  // 저장된 응답값을 기반으로 현재 설문 응답 상태를 초기화한다.
  const [answers, setAnswers] = useState<(SurveyAnswerValue | null)[]>(
    questions.map((question) => savedAnswers[question.id] ?? null),
  );
  // 현재 응답값을 스토어에 임시 저장한다.
  const saveSurveyProgress = (nextAnswers: (SurveyAnswerValue | null)[]) => {
    saveProgress(
      Object.fromEntries(
        nextAnswers.flatMap((answer, index) =>
          answer === null ? [] : [[questions[index].id, answer]],
        ),
      ),
    );
  };

  // 응답 완료 시 API 요청 형식에 맞게 데이터를 변환하여 전달한다.
  const completeSurvey = (nextAnswers: (SurveyAnswerValue | null)[]) => {
    onComplete?.(
      nextAnswers.flatMap((answer, index) =>
        answer === null ? [] : [{ question_id: questions[index].id, answer }],
      ),
      totalSteps,
    );
  };

  // 실제로 응답한 문항만 진행도로 계산한다.
  const completedCount = useMemo(
    () => answers.filter((answer) => answer !== null).length,
    [answers],
  );
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  function goToQuestion(nextIndex: number) {
    setCurrentIndex(Math.min(Math.max(nextIndex, 0), totalSteps - 1));
  }

  // 문항 응답 선택 시 현재 문항에 값만 저장한다.
  function selectAnswer(value: SurveyAnswerValue) {
    const nextAnswers = answers.map((answer, index) =>
      index === currentIndex ? value : answer,
    );
    setAnswers(nextAnswers);
    saveSurveyProgress(nextAnswers);
  }

  // 현재 문항을 선택한 경우에만 다음 문항 또는 완료 단계로 이동한다.
  function nextQuestion() {
    if (answers[currentIndex] === null) return;

    if (currentIndex < totalSteps - 1) {
      goToQuestion(currentIndex + 1);
      return;
    }

    completeSurvey(answers);
  }

  return {
    answers,
    completedCount,
    currentIndex,
    currentStep: currentIndex + 1,
    goToQuestion,
    progressPercent,
    selectedValue: answers[currentIndex],
    selectAnswer,
    nextQuestion,
  };
}
