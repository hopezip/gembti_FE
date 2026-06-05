import { css, cx } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';
import { SurveyQuestionSection } from '@/features/survey/components/SurveyQuestionSection';
import { surveyBackgroundPageStyle } from '@/features/survey/components/surveyIntro.styles';

const styles = {
  page: css({
    minH: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > div': {
      w: 'full',
    },
  }),
  content: css({
    position: 'relative',
    zIndex: 'raised',
    display: 'flex',
    flexDirection: 'column',
    py: { base: '5', md: '6', lg: '8' },
  }),
};

export function SurveyPage() {
  return (
    <main className={cx(surveyBackgroundPageStyle, styles.page)}>
      <PageContainer className={styles.content}>
        <SurveyQuestionSection />
      </PageContainer>
    </main>
  );
}
