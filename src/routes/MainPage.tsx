import { HeroBanner } from '@/features/main/components/HeroBanner';
import { NewReleases } from '@/features/main/components/NewReleases';
import { PersonalizedNewReleases } from '@/features/main/components/PersonalizedNewReleases';
import { PersonalizedRecommendedGames } from '@/features/main/components/PersonalizedRecommendedGames';
import { RecommendedGames } from '@/features/main/components/RecommendedGames';
import { useAuthStore } from '@/lib/store/useAuthStore';

// 메인 페이지 (라우트 '/'·Public). 2상태로 분기한다.
//  ① 게스트 홈: 비로그인 OR 설문 미완 — 단일 GET /api/v1/home/guest (MAIN-FE-001/003/004).
//  ② 개인화 홈: 로그인 AND 설문완료 — 단일 GET /api/v1/home/personalized (MAIN-FE-006).
// 로그인했어도 설문 미완(hasCompletedSurvey=false)이면 게스트 홈으로 떨어진다.
// <main> landmark는 페이지가 소유한다(GlobalShell은 Outlet 래퍼 div).

// 게스트 홈(비로그인 또는 설문 미완) — Hero + 추천(인기) + 신규.
function GuestHome() {
  return (
    <>
      <HeroBanner />
      <RecommendedGames />
      <NewReleases />
    </>
  );
}

// 개인화 홈(로그인+설문완료) — Hero 배너는 게스트와 통일하고, 추천/신규 카드만 개인화한다.
function PersonalizedHome() {
  return (
    <>
      <HeroBanner />
      <PersonalizedRecommendedGames />
      <PersonalizedNewReleases />
    </>
  );
}

export function MainPage() {
  const status = useAuthStore((s) => s.status);
  const hasCompletedSurvey = useAuthStore(
    (s) => s.user?.hasCompletedSurvey ?? false,
  );
  const showPersonalized = status === 'authenticated' && hasCompletedSurvey;

  return <main>{showPersonalized ? <PersonalizedHome /> : <GuestHome />}</main>;
}
