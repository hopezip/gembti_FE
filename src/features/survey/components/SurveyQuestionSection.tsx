import { css } from 'styled-system/css';
import { useSurveyQuestionSection } from '@/features/survey/hooks/useSurveyQuestionSection';
import { SurveyAnswerScale } from './SurveyAnswerScale';
import { SurveyQuestionControls } from './SurveyQuestionControls';
import { SurveyStepIndicator } from './SurveyStepIndicator';

interface SurveyQuestion {
  id: string;
  lines: string[];
  accent: string;
}

// TODO(SURVEY-FE-002): API/MSW 연결 시 이 임시 문항 데이터는
// MSW survey handler의 mock response로 이동하고, 화면은 서비스/API 응답을 사용한다.
const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    lines: [
      '새로운 게임을 고를 때 검증된 인기작보다',
      '낯선 경험을 먼저 찾는다',
    ],
    accent: '낯선 경험',
  },
  {
    id: 'q2',
    lines: ['플레이 중에는 빠른 판단과 손맛이 있는', '순간에 가장 몰입한다'],
    accent: '빠른 판단',
  },
  {
    id: 'q3',
    lines: ['스트레스 없이 즐기는데도 적을 휘어잡는', '성장을 선호한다'],
    accent: '성장',
  },
  {
    id: 'q4',
    lines: ['게임의 규칙을 파악하고 최적의', '전략을 찾는 과정이 즐겁다'],
    accent: '전략',
  },
  {
    id: 'q5',
    lines: ['캐릭터와 세계관의 이야기가 오래 기억나는', '게임을 좋아한다'],
    accent: '이야기',
  },
  {
    id: 'q6',
    lines: ['친구와 협력하거나 경쟁하며 생기는', '변수를 즐기는 편이다'],
    accent: '협력하거나 경쟁',
  },
  {
    id: 'q7',
    lines: ['수집, 업적, 장비 강화처럼 완성도를', '채워가는 플레이에 끌린다'],
    accent: '완성도',
  },
];

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

export function SurveyQuestionSection({
  onComplete,
}: SurveyQuestionSectionProps) {
  const totalSteps = surveyQuestions.length;
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
  const currentQuestion = surveyQuestions[currentIndex];

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
          {currentQuestion.lines.map((line) => (
            <span
              className={css({
                display: 'block',
              })}
              key={line}
            >
              {renderQuestion(line, currentQuestion.accent)}
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
