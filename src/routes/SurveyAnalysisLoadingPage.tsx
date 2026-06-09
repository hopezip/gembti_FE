import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useSubmitSurvey } from '@/features/survey/api/surveyResult';
import type { SurveyAnalysisNavigationState } from '@/features/survey/api/types';
import { SurveyAnalysisLoading } from '@/features/survey/components/SurveyAnalysisLoading';
import { surveyBackgroundPageStyle } from '@/features/survey/components/surveyIntro.styles';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

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
  const location = useLocation();
  const navigate = useNavigate();
  const submitSurvey = useSubmitSurvey();
  const setSurveyCompleted = useAuthStore((store) => store.setSurveyCompleted);
  const resetSurveyProgress = useSurveyProgressStore(
    (store) => store.resetProgress,
  );
  const hasSubmitted = useRef(false);
  const [analysisStatus, setAnalysisStatus] = useState<
    'pending' | 'success' | 'error'
  >('pending');
  const [progressValue, setProgressValue] = useState(78);
  const state = location.state as SurveyAnalysisNavigationState | null;
  const answers = state?.answers ?? [];
  const totalQuestions = state?.totalQuestions ?? 7;

  const submitAnswers = () => {
    setAnalysisStatus('pending');
    submitSurvey.mutate(
      { answers },
      {
        onSuccess: () => {
          setSurveyCompleted(answers.length === totalQuestions);
          resetSurveyProgress();
          setAnalysisStatus('success');
        },
        onError: () => {
          setSurveyCompleted(false);
          setAnalysisStatus('error');
        },
      },
    );
  };

  useEffect(() => {
    if (!state) {
      setAnalysisStatus('success');
      return;
    }
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    submitSurvey.mutate(
      { answers },
      {
        onSuccess: () => {
          setSurveyCompleted(answers.length === totalQuestions);
          resetSurveyProgress();
          setAnalysisStatus('success');
        },
        onError: () => {
          setSurveyCompleted(false);
          setAnalysisStatus('error');
        },
      },
    );
  }, [
    answers,
    resetSurveyProgress,
    setSurveyCompleted,
    state,
    submitSurvey.mutate,
    totalQuestions,
  ]);

  useEffect(() => {
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsedRatio = Math.min(
        (Date.now() - startedAt) / redirectDelayMs,
        1,
      );
      setProgressValue(Math.round(78 + elapsedRatio * 22));
    }, 120);

    return () => {
      window.clearInterval(progressTimer);
    };
  }, []);

  useEffect(() => {
    if (progressValue < 100 || analysisStatus === 'error') return;
    navigate('/survey/result', { replace: true });
  }, [analysisStatus, navigate, progressValue]);

  const currentStage = useMemo(() => {
    if (progressValue >= 94) return analysisStages[2];
    if (progressValue >= 86) return analysisStages[1];
    return analysisStages[0];
  }, [progressValue]);

  if (analysisStatus === 'error') {
    return (
      <main className={cx(surveyBackgroundPageStyle, styles.page)}>
        <PageContainer className={styles.content}>
          <EmptyState
            action={
              <Button type="button" variant="primary" onClick={submitAnswers}>
                다시 분석하기
              </Button>
            }
            description="선택한 응답은 유지되어 있어요. 다시 시도해 주세요."
            title="설문 결과 분석에 실패했어요"
            type="notification"
          />
        </PageContainer>
      </main>
    );
  }

  return (
    <main className={cx(surveyBackgroundPageStyle, styles.page)}>
      <PageContainer className={styles.content}>
        <SurveyAnalysisLoading
          completedQuestions={answers.length}
          currentStage={currentStage}
          progressValue={progressValue}
          totalQuestions={totalQuestions}
        />
      </PageContainer>
    </main>
  );
}
