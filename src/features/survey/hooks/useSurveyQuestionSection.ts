import { useEffect, useMemo, useRef, useState } from 'react';

const autoAdvanceDelay = 420;

interface UseSurveyQuestionSectionParams {
  totalSteps: number;
}

export function useSurveyQuestionSection({
  totalSteps,
}: UseSurveyQuestionSectionParams) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array.from({ length: totalSteps }, () => null),
  );
  const [skipped, setSkipped] = useState<boolean[]>(
    Array.from({ length: totalSteps }, () => false),
  );
  const advanceTimer = useRef<number | null>(null);

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

  function selectAnswer(value: number) {
    setAnswers((prev) =>
      prev.map((answer, index) => (index === currentIndex ? value : answer)),
    );
    setSkipped((prev) =>
      prev.map((isSkipped, index) =>
        index === currentIndex ? false : isSkipped,
      ),
    );

    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    if (currentIndex < totalSteps - 1) {
      advanceTimer.current = window.setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, totalSteps - 1));
      }, autoAdvanceDelay);
    }
  }

  function skipQuestion() {
    setAnswers((prev) =>
      prev.map((answer, index) => (index === currentIndex ? null : answer)),
    );
    setSkipped((prev) =>
      prev.map((isSkipped, index) =>
        index === currentIndex ? true : isSkipped,
      ),
    );
    goToQuestion(
      currentIndex < totalSteps - 1 ? currentIndex + 1 : currentIndex,
    );
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
