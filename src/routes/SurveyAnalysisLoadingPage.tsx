import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';
import { SurveyAnalysisLoading } from '@/features/survey/components/SurveyAnalysisLoading';
import { surveyBackgroundPageStyle } from '@/features/survey/components/surveyIntro.styles';

const totalQuestions = 7;
const redirectDelayMs = 4200;

const analysisStages = [
  '6대 성향 점수 계산 중…',
  '플레이 패턴 매칭 중…',
  '맞춤 게임 추천 결과 생성 중…',
] as const;

const styles = {
  page: css({
    minH: '100%',
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      w: 'full',
    },
  }),
  content: css({
    position: 'relative',
    zIndex: 'raised',
  }),
};

export function SurveyAnalysisLoadingPage() {
  const navigate = useNavigate();
  const [progressValue, setProgressValue] = useState(78);

  useEffect(() => {
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsedRatio = Math.min(
        (Date.now() - startedAt) / redirectDelayMs,
        1,
      );
      setProgressValue(Math.round(78 + elapsedRatio * 22));
    }, 120);

    const redirectTimer = window.setTimeout(() => {
      navigate('/survey/result', { replace: true });
    }, redirectDelayMs);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const currentStage = useMemo(() => {
    if (progressValue >= 94) return analysisStages[2];
    if (progressValue >= 86) return analysisStages[1];
    return analysisStages[0];
  }, [progressValue]);

  return (
    <main className={cx(surveyBackgroundPageStyle, styles.page)}>
      <PageContainer className={styles.content}>
        <SurveyAnalysisLoading
          completedQuestions={totalQuestions}
          currentStage={currentStage}
          progressValue={progressValue}
          totalQuestions={totalQuestions}
        />
      </PageContainer>
    </main>
  );
}
