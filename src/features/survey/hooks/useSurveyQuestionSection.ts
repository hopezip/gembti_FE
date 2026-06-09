import { useEffect, useMemo, useRef, useState } from 'react';
import type { SurveyQuestion } from '@/features/survey/api/surveyQuestions';
import type {
  SurveyAnswerValue,
  SurveySubmitAnswer,
} from '@/features/survey/api/types';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';

const autoAdvanceDelay = 420;

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
  // 이전에 건너뛴 문항 ID 목록을 불러온다.
  const skippedQuestionIds = useSurveyProgressStore(
    (store) => store.skippedQuestionIds,
  );
  const saveProgress = useSurveyProgressStore((store) => store.saveProgress);
  const totalSteps = questions.length;
  // 이어하기 진입 시 첫 번째 미응답(건너뛴) 문항부터 시작한다.
  const initialIndex = Math.max(
    questions.findIndex((question) => skippedQuestionIds.includes(question.id)),
    0,
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  // 저장된 응답값을 기반으로 현재 설문 응답 상태를 초기화한다.
  const [answers, setAnswers] = useState<(SurveyAnswerValue | null)[]>(
    questions.map((question) => savedAnswers[question.id] ?? null),
  );
  // 건너뛴 문항 여부를 로컬 상태로 관리한다.
  const [skipped, setSkipped] = useState<boolean[]>(
    questions.map((question) => skippedQuestionIds.includes(question.id)),
  );
  const advanceTimer = useRef<number | null>(null);

  const scheduleCompletion = (nextAnswers: (SurveyAnswerValue | null)[]) => {
    if (!onComplete) return;

    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(
      () => completeSurvey(nextAnswers),
      autoAdvanceDelay,
    );
  };

  // 현재 응답값과 건너뛴 문항 정보를 스토어에 임시 저장한다.
  const saveSurveyProgress = (
    nextAnswers: (SurveyAnswerValue | null)[],
    nextSkipped: boolean[],
  ) => {
    saveProgress(
      Object.fromEntries(
        nextAnswers.flatMap((answer, index) =>
          answer === null ? [] : [[questions[index].id, answer]],
        ),
      ),
      questions
        .filter((_, index) => nextSkipped[index])
        .map((question) => question.id),
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

  // 응답 또는 건너뛴 문항을 포함한 진행도를 계산한다.
  const completedCount = useMemo(
    () =>
      answers.filter((answer, index) => answer !== null || skipped[index])
        .length,
    [answers, skipped],
  );
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  function goToQuestion(nextIndex: number) {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setCurrentIndex(Math.min(Math.max(nextIndex, 0), totalSteps - 1));
  }

  // 문항 응답 선택 시 응답 저장 후 다음 문항으로 자동 이동한다.
  function selectAnswer(value: SurveyAnswerValue) {
    const nextAnswers = answers.map((answer, index) =>
      index === currentIndex ? value : answer,
    );
    const nextSkipped = skipped.map((isSkipped, index) =>
      index === currentIndex ? false : isSkipped,
    );
    setAnswers(nextAnswers);
    setSkipped(nextSkipped);
    saveSurveyProgress(nextAnswers, nextSkipped);

    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    if (currentIndex < totalSteps - 1) {
      advanceTimer.current = window.setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, totalSteps - 1));
      }, autoAdvanceDelay);
      return;
    }

    scheduleCompletion(nextAnswers);
  }

  // 현재 문항을 건너뛰고 진행 상태를 저장한 뒤 다음 문항으로 이동한다.
  // 마지막 문항인 경우 완료 처리 여부를 판단한다.
  function skipQuestion() {
    const nextAnswers = answers.map((answer, index) =>
      index === currentIndex ? null : answer,
    );
    const nextSkipped = skipped.map((isSkipped, index) =>
      index === currentIndex ? true : isSkipped,
    );
    setAnswers(nextAnswers);
    setSkipped(nextSkipped);
    saveSurveyProgress(nextAnswers, nextSkipped);
    if (currentIndex < totalSteps - 1) {
      goToQuestion(currentIndex + 1);
      return;
    }

    scheduleCompletion(nextAnswers);
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
    skipQuestion,
  };
}
