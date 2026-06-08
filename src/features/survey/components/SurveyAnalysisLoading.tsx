import { css } from 'styled-system/css';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';

const styles = {
  section: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    w: 'full',
    minH: 'calc(100vh - 140px)',
    py: { base: '12', md: '16' },
    textAlign: 'center',
  }),
  inner: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    w: 'full',
    maxW: { base: 'min(100%, 360px)', md: '477px' },
    gap: { base: '7', md: '8' },
  }),
  copyGroup: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: { base: '6', md: '7' },
    w: 'full',
  }),
  spinner: css({
    w: '54px',
    h: '54px',
    borderWidth: '3px',
  }),
  title: css({
    m: '0',
    color: 'fg.default',
    fontSize: { base: '4xl', md: '6xl' },
    fontWeight: 'bold',
    letterSpacing: 'normal',
    lineHeight: 'tight',
    textShadow: '0 8px 32px token(colors.bg.canvas)',
  }),
  titleAccent: css({
    color: 'accent.default',
  }),
  status: css({
    m: '0',
    color: 'fg.subtle',
    fontSize: { base: 'sm', md: 'xl' },
    lineHeight: 'normal',
  }),
  statusNumber: css({
    color: 'accent.default',
  }),
  statusStage: css({
    color: 'accent.default',
    fontWeight: 'bold',
  }),
  progress: css({
    w: 'full',
    maxW: { base: 'min(100%, 340px)', md: '477px' },
  }),
};

interface SurveyAnalysisLoadingProps {
  completedQuestions: number;
  currentStage: string;
  progressValue: number;
  totalQuestions: number;
}

export function SurveyAnalysisLoading({
  completedQuestions,
  currentStage,
  progressValue,
  totalQuestions,
}: SurveyAnalysisLoadingProps) {
  return (
    <section
      aria-describedby="survey-analysis-status"
      aria-labelledby="survey-analysis-title"
      aria-live="polite"
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.copyGroup}>
          <Spinner
            aria-label="설문 결과 분석 중"
            className={styles.spinner}
            color="accent.default"
            size="xl"
          />

          <div className={styles.copyGroup}>
            <h1
              aria-label="당신의 성향을 분석하고 있어요"
              className={styles.title}
              id="survey-analysis-title"
            >
              당신의 성향을 <span className={styles.titleAccent}>분석</span>하고
              있어요
            </h1>

            <p className={styles.status} id="survey-analysis-status">
              <span className={styles.statusNumber}>{completedQuestions}</span>
              {` / ${totalQuestions} 문항 검사 · `}
              <span className={styles.statusStage}>{currentStage}</span>
            </p>
          </div>
        </div>

        <ProgressBar
          className={styles.progress}
          value={progressValue}
          size="md"
        />
      </div>
    </section>
  );
}
