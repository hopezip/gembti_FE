import { ChevronLeft, ChevronRight } from 'lucide-react';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

// 설문 하단 조작 영역: 이전 이동, 완료율, 현재 문항 건너뛰기를 한 줄에 배치한다.
const questionControlsStyle = css({
  display: 'grid',
  gridTemplateColumns: {
    base: 'repeat(2, minmax(0, 1fr))',
    md: '180px minmax(0, 1fr) 180px',
  },
  alignItems: 'center',
  gap: { base: '3', md: '7' },
  w: 'full',
  maxW: '860px',
  mx: 'auto',
  py: { base: '4', md: '5', lg: '30px' },
  mt: { base: '0', md: '1' },
});

interface SurveyQuestionControlsProps {
  isPreviousDisabled: boolean;
  progressLabel: string;
  progressValue: number;
  onPrevious: () => void;
  onSkip: () => void;
}

export function SurveyQuestionControls({
  isPreviousDisabled,
  progressLabel,
  progressValue,
  onPrevious,
  onSkip,
}: SurveyQuestionControlsProps) {
  return (
    <div className={questionControlsStyle}>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className={css({
          w: 'full',
          minW: '0',
          py: { base: '3', md: '3.5' },
          px: { base: '3', md: '6' },
          borderRadius: 'full',
        })}
        disabled={isPreviousDisabled}
        onClick={onPrevious}
      >
        <ChevronLeft size={17} aria-hidden="true" />
        이전 문항
      </Button>

      <ProgressBar
        className={css({
          display: { base: 'none', md: 'grid' },
          gridColumn: { md: '2' },
        })}
        value={progressValue}
        label={progressLabel}
        size="md"
      />

      <Button
        type="button"
        variant="primary"
        size="lg"
        className={css({
          w: 'full',
          minW: '0',
          py: { base: '3', md: '3.5' },
          px: { base: '3', md: '6' },
          borderRadius: 'full',
          gridColumn: { base: '2', md: '3' },
        })}
        onClick={onSkip}
      >
        건너뛰기
        <ChevronRight size={17} aria-hidden="true" />
      </Button>
    </div>
  );
}
