import { RecommendationHero } from '@/features/recommendations/components/RecommendationHero';
import { PersonalizedRecommendedGames } from '@/features/main/components/PersonalizedRecommendedGames';

// REC-FE-002 게임 추천 페이지(라우트 '/recommendations'·Public).
// 이번 범위 = 개인화(로그인+설문완료) 상태만. 게스트/설문미완 폴백은 별도 티켓(YAGNI).
// 새 쿼리는 신설하지 않는다 — Hero와 PersonalizedRecommendedGames가 각자 usePersonalizedHome을 구독한다.
// 좌우 거터·maxW는 두 자식이 각자 PageContainer로 소유하므로, 페이지 셸은 <main> landmark로 두 섹션만 쌓는다.
// <main> landmark는 페이지가 소유한다(GlobalShell은 Outlet 래퍼 div). MainPage.tsx와 동일 패턴.
export function RecommendationsPage() {
  return (
    <main>
      <RecommendationHero />
      <PersonalizedRecommendedGames />
    </main>
  );
}
