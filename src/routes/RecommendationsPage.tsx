import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { PageContainer } from '@/components/layout/PageContainer';
import { PersonalizedRecommendedGames } from '@/features/main/components/PersonalizedRecommendedGames';
import { RecommendationHero } from '@/features/recommendations/components/RecommendationHero';
import { useAuthStore } from '@/lib/store/useAuthStore';

// REC-FE-002 게임 추천 페이지(라우트 '/recommendations'·Public).
// 이번 범위 = 개인화(로그인+설문완료) 상태만. 게스트 전용 추천 콘텐츠는 별도 티켓(YAGNI).
// ⚠️ 보안: /recommendations는 Public이라 비인증으로도 진입 가능하다. 개인화 컴포넌트(usePersonalizedHome)를
//   무가드로 렌더하면, 이전 로그인 사용자가 받아둔 ['home','personalized'] 캐시(staleTime 60s, clearAuth는
//   캐시를 비우지 않음)가 로그아웃 후에도 노출되는 개인정보 누출이 생긴다. 따라서 MainPage와 동일하게
//   status==='authenticated' && hasCompletedSurvey 일 때만 개인화 컴포넌트를 렌더한다.
// 새 쿼리는 신설하지 않는다 — Hero와 PersonalizedRecommendedGames가 각자 usePersonalizedHome을 구독한다.
// <main> landmark는 페이지가 소유한다(GlobalShell은 Outlet 래퍼 div). MainPage.tsx와 동일 패턴.

const gateStyles = {
  box: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '4',
    py: '20', // 빈 상태 중앙 안내 — 위아래 넉넉히.
  }),
  title: css({ textStyle: 'heading.h3', color: 'fg.default' }),
  desc: css({ textStyle: 'body.md', color: 'fg.muted', maxW: '480px' }),
};

// 비인증/설문미완 — 개인화 컴포넌트를 렌더하지 않아 캐시 노출을 차단하고, 최소 진입 안내만 둔다.
// 두 분기: ① 비로그인 → 로그인 유도, ② 로그인했으나 설문 미완 → 설문 유도.
function RecommendationsGate({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const to = isAuthenticated ? '/survey' : '/login';
  return (
    <PageContainer>
      <div className={gateStyles.box}>
        <h1 className={gateStyles.title}>
          {isAuthenticated
            ? '취향 분석을 완료하고 개인화 추천을 받아보세요'
            : '로그인하고 나만의 게임 추천을 받아보세요'}
        </h1>
        <p className={gateStyles.desc}>
          {isAuthenticated
            ? '설문으로 취향을 분석하면 매칭률 기반 추천을 보여드려요.'
            : '로그인 후 취향 분석을 완료하면 매칭률 기반 개인화 추천을 보여드려요.'}
        </p>
        <Link to={to} className={button({ variant: 'primary', size: 'md' })}>
          {isAuthenticated ? '설문 시작하기' : '로그인하기'}
        </Link>
      </div>
    </PageContainer>
  );
}

export function RecommendationsPage() {
  const status = useAuthStore((s) => s.status);
  const hasCompletedSurvey = useAuthStore(
    (s) => s.user?.hasCompletedSurvey ?? false,
  );
  const showPersonalized = status === 'authenticated' && hasCompletedSurvey;

  return (
    <main>
      {showPersonalized ? (
        <>
          <RecommendationHero />
          <PersonalizedRecommendedGames />
        </>
      ) : (
        <RecommendationsGate isAuthenticated={status === 'authenticated'} />
      )}
    </main>
  );
}
