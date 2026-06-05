import { css } from 'styled-system/css';

// 상단 진행 상태. 주황 dot은 실제로 응답을 선택한 문항만 표시한다.
const stepIndicatorStyle = css({
  display: 'grid',
  justifyItems: 'center',
  gap: '2',
});

const stepDotsStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3',
  h: '20px',
});

const stepDotStyle = css({
  w: '10px',
  h: '10px',
  borderRadius: 'full',
  bg: 'fg.subtle',
  opacity: '.66',
  '&[data-state="answered"]': {
    bg: 'accent.default',
    opacity: '1',
    boxShadow: '0 0 14px token(colors.accent.default)',
  },
});

const stepCounterStyle = css({
  fontFamily: 'mono',
  color: 'accent.fg',
  fontSize: { base: 'sm', md: 'md' },
  fontWeight: 'bold',
  letterSpacing: 'wide',
  textAlign: 'center',
});

const stepCounterDividerStyle = css({
  color: 'fg.subtle',
  mx: '2',
});

interface SurveyStepIndicatorProps {
  // 각 문항이 실제 응답 선택을 완료했는지 여부. 건너뛴 문항은 false다.
  answeredSteps: boolean[];
  // 현재 사용자가 보고 있는 문항 번호(1부터 시작).
  currentStep: number;
  // 전체 설문 문항 수.
  totalSteps: number;
}

function formatStep(value: number) {
  return String(value).padStart(2, '0');
}

export function SurveyStepIndicator({
  answeredSteps,
  currentStep,
  totalSteps,
}: SurveyStepIndicatorProps) {
  return (
    <div className={stepIndicatorStyle}>
      <div className={stepDotsStyle}>
        {answeredSteps.map((isAnswered, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: 설문 문항 수만큼 고정된 점 UI라 순서가 바뀌지 않는다.
            key={index}
            className={stepDotStyle}
            data-state={isAnswered ? 'answered' : 'idle'}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className={stepCounterStyle} aria-live="polite">
        {formatStep(currentStep)}
        <span className={stepCounterDividerStyle}>/</span>
        {formatStep(totalSteps)}
      </p>
    </div>
  );
}
