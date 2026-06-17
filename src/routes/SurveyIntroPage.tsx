import { CircleHelp, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { surveyIntroStyles as styles } from '@/features/survey/components/surveyIntro.styles';

const surveyTraits = [
  {
    title: '탐험',
    description: '새로운 세계와 발견',
    icon: '/images/exploration-icon.png',
  },
  {
    title: '액션',
    description: '빠른 전투와 손맛',
    icon: '/images/action-icon.png',
  },
  {
    title: '전략',
    description: '계획과 영리한 선택',
    icon: '/images/strategy-icon.png',
  },
  {
    title: '서사',
    description: '몰입감 있는 이야기',
    icon: '/images/story-icon.png',
  },
  {
    title: '수집',
    description: '완성과 성장의 재미',
    icon: '/images/cooperation-icon.png',
  },
  {
    title: '경쟁',
    description: '승부와 도전의 쾌감',
    icon: '/images/challenge-icon.png',
  },
] as const;

export function SurveyIntroPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <PageContainer className={styles.content}>
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>
            어떤 게임이
            <br />
            당신을 <span className={styles.titleHighlight}>기다리고</span>{' '}
            있을까요?
          </h1>

          <p className={styles.description}>
            몇 가지 질문으로 플레이 성향을 분석하고,
            <br />
            가장 잘 맞는 게임을 추천해 드립니다.
          </p>

          <ul className={styles.quickInfoList} aria-label="설문 안내">
            <li className={styles.quickInfoItem}>
              <CircleHelp className={styles.quickInfoIcon} size={16} />
              <span>12개 질문</span>
            </li>
            <li className={styles.quickInfoItem}>
              <Clock3 className={styles.quickInfoIcon} size={16} />
              <span>약 2분 소요</span>
            </li>
          </ul>

          <div className={styles.buttonGroup}>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className={styles.primaryButton}
              onClick={() => navigate('/survey')}
            >
              설문 시작하기
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/')}
            >
              나중에 할게요
            </Button>
          </div>
        </div>

        <aside className={styles.traitGrid} aria-label="분석하는 게임 성향">
          <h2 className={styles.traitHeading}>6가지 플레이 성향 분석</h2>
          <ul className={styles.traitList}>
            {surveyTraits.map(({ title, description, icon }) => (
              <li className={styles.traitItem} key={title}>
                <span className={styles.traitIcon}>
                  <img src={icon} alt="" width={40} height={44} />
                </span>
                <strong className={styles.traitTitle}>{title}</strong>
                <small>{description}</small>
              </li>
            ))}
          </ul>
        </aside>
      </PageContainer>
    </main>
  );
}
