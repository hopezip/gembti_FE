import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { PageContainer } from '@/components/layout/PageContainer';
import { RecommendedGames } from '@/features/main/components/RecommendedGames';

// REC-GUEST-FE-001 게스트(비로그인/설문미완) 추천 섹션.
// /recommendations는 Public이라 비인증도 진입한다. 개인화 데이터가 없는 상태에서도
// 인기 기반 추천(useGuestHome.trendingGames)을 RecommendedGames로 그대로 노출하고,
// 상단에 로그인/설문 유도 CTA 배너를 둔다(이전 RecommendationsGate의 분기 문구를 흡수).
// 개인화 컴포넌트(usePersonalizedHome)는 여기서 렌더하지 않으므로 로그아웃 후 캐시 노출 누출이 없다.
// 두 분기: ① 비로그인 → 로그인 유도, ② 로그인했으나 설문 미완 → 설문 유도.
// 색은 semantic token만, 신규 토큰/recipe 없음. 다크·데스크탑 전용.

const styles = {
  // 헤더 — 페이지 주제(인기 추천). 좌우 거터·maxW는 PageContainer 소유.
  header: css({
    pt: '12', // 48px
    pb: '2',
  }),
  title: css({
    textStyle: 'heading.h1', // 30px extrabold
    color: 'fg.default',
  }),
  // CTA 배너 — 헤더 아래. surface 박스에 안내 문구(좌) + 버튼(우).
  banner: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6',
    flexWrap: 'wrap', // 1100px 미만 fallback에서 줄바꿈 허용.
    mt: '5',
    p: '6',
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 'xl',
  }),
  bannerText: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
  }),
  bannerTitle: css({
    fontSize: 'xl', // 16px
    fontWeight: 'bold',
    color: 'fg.default',
  }),
  bannerDesc: css({
    textStyle: 'body.sm',
    color: 'fg.muted',
  }),
};

// 분기별 CTA 문구·이동 경로. 비로그인=로그인 유도 / 로그인+설문미완=설문 유도.
function ctaContent(isAuthenticated: boolean) {
  if (isAuthenticated) {
    return {
      title: '취향 분석을 완료하고 개인화 추천을 받아보세요',
      desc: '설문으로 취향을 분석하면 매칭률 기반 추천을 보여드려요.',
      to: '/survey',
      label: '설문 시작하기',
    };
  }
  return {
    title: '로그인하고 나만의 게임 추천을 받아보세요',
    desc: '로그인 후 취향 분석을 완료하면 매칭률 기반 개인화 추천을 보여드려요.',
    to: '/login',
    label: '로그인하기',
  };
}

export function GuestRecommendations({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const cta = ctaContent(isAuthenticated);

  return (
    <>
      <PageContainer className={styles.header}>
        <h1 className={styles.title}>지금 인기 있는 게임</h1>
        {/* CTA 배너 — landmark로 노출(aria-label). 제목/설명은 문단으로, heading 레벨 점프를 피한다. */}
        <section className={styles.banner} aria-label="맞춤 추천 안내">
          <div className={styles.bannerText}>
            <p className={styles.bannerTitle}>{cta.title}</p>
            <p className={styles.bannerDesc}>{cta.desc}</p>
          </div>
          <Link
            to={cta.to}
            className={button({ variant: 'primary', size: 'md' })}
          >
            {cta.label}
          </Link>
        </section>
      </PageContainer>

      {/* 인기 기반 추천 그리드 — 데이터·로딩·에러·빈·더보기는 RecommendedGames/GameGridSection이 소유. */}
      <RecommendedGames />
    </>
  );
}
