import { css } from 'styled-system/css';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useSurveyQuestions } from '@/features/survey/api/surveyQuestions';
import type { SurveyQuestion } from '@/features/survey/api/surveyQuestions';
import { useSurveyQuestionSection } from '@/features/survey/hooks/useSurveyQuestionSection';
import { SurveyAnswerScale } from './SurveyAnswerScale';
import { SurveyQuestionControls } from './SurveyQuestionControls';
import { SurveyStepIndicator } from './SurveyStepIndicator';

const questionAccentMap: Record<number, string> = {
  1: '낯선 경험',
  2: '빠른 판단',
  3: '성장',
  4: '전략',
  5: '이야기',
  6: '협력하거나 경쟁',
  7: '완성도',
};

function splitQuestionLines(question: string) {
  // 기존 시안처럼 두 줄 리듬을 유지하기 위해 첫 번째 자연스러운 공백 지점에서 나눈다.
  // API가 줄바꿈 없는 문장을 내려주므로, 화면 전용 줄바꿈은 컴포넌트에서만 계산한다.
  const midpoint = Math.ceil(question.length / 2);
  const splitIndex = question.indexOf(' ', midpoint);
  if (splitIndex === -1) return [question];

  return [question.slice(0, splitIndex), question.slice(splitIndex + 1)];
}

function renderQuestion(text: string, accent: string) {
  const accentIndex = text.indexOf(accent);
  if (accentIndex === -1) return text;

  return (
    <>
      {text.slice(0, accentIndex)}
      <span
        className={css({
          color: 'accent.default',
          textShadow: '0 0 22px token(colors.accent.default)',
        })}
      >
        {accent}
      </span>
      {text.slice(accentIndex + accent.length)}
    </>
  );
}

interface SurveyQuestionSectionProps {
  onComplete?: () => void;
}

interface SurveyQuestionContentProps {
  questions: SurveyQuestion[];
  onComplete?: () => void;
}

function SurveyQuestionContent({
  questions,
  onComplete,
}: SurveyQuestionContentProps) {
  const totalSteps = questions.length;
  const {
    answers,
    completedCount,
    currentIndex,
    currentStep,
    goToQuestion,
    progressPercent,
    selectedValue,
    selectAnswer,
    skipQuestion,
  } = useSurveyQuestionSection({ onComplete, totalSteps });
  const currentQuestion = questions[currentIndex];
  const questionLines = splitQuestionLines(currentQuestion.question);
  const accent =
    questionAccentMap[currentQuestion.id] ?? questionLines[0] ?? '';

  return (
    <>
      <SurveyStepIndicator
        answeredSteps={answers.map((answer) => answer !== null)}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* 질문 문장, 응답 선택지, 하단 조작 영역을 한 덩어리로 배치한다. */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          w: 'full',
          maxW: '960px',
          mx: 'auto',
          textAlign: 'center',
        })}
      >
        <h1
          className={css({
            m: '0',
            py: { base: '4', md: '5', lg: '30px' },
            color: 'fg.default',
            fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '6xl' },
            fontWeight: 'extrabold',
            letterSpacing: 'tight',
            lineHeight: 'snug',
            textShadow: '0 8px 32px token(colors.bg.canvas)',
          })}
          id="survey-question"
        >
          {questionLines.map((line) => (
            <span
              className={css({
                display: 'block',
              })}
              key={line}
            >
              {renderQuestion(line, accent)}
            </span>
          ))}
        </h1>

        <SurveyAnswerScale
          selectedValue={selectedValue}
          onSelect={selectAnswer}
        />

        <SurveyQuestionControls
          isPreviousDisabled={currentIndex === 0}
          progressLabel={`${progressPercent}% 완료 · ${completedCount}/${totalSteps}`}
          progressValue={progressPercent}
          onPrevious={() => goToQuestion(currentIndex - 1)}
          onSkip={skipQuestion}
        />
      </div>
    </>
  );
}

export function SurveyQuestionSection({
  onComplete,
}: SurveyQuestionSectionProps) {
  const {
    data: surveyQuestions,
    isError,
    isLoading,
    refetch,
  } = useSurveyQuestions();

  if (isLoading) {
    return (
      <div
        className={css({
          minH: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Spinner className={css({ color: 'accent.default' })} />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        action={
          <Button type="button" variant="primary" onClick={() => refetch()}>
            다시 불러오기
          </Button>
        }
        description="잠시 후 다시 시도해 주세요."
        title="설문 문항을 불러오지 못했어요"
        type="notification"
      />
    );
  }

  if (!surveyQuestions?.length) {
    return (
      <EmptyState
        description="설문 문항이 준비되면 다시 진행할 수 있어요."
        title="표시할 설문 문항이 없어요"
        type="notification"
      />
    );
  }

  return (
    <SurveyQuestionContent
      questions={surveyQuestions}
      onComplete={onComplete}
    />
  );
}
