import { PersonalizedRecommendedGames } from '@/features/main/components/PersonalizedRecommendedGames';
import { GuestRecommendations } from '@/features/recommendations/components/GuestRecommendations';
import { RecommendationHero } from '@/features/recommendations/components/RecommendationHero';
import { useAuthStore } from '@/lib/store/useAuthStore';

// REC-FE-002 게임 추천 페이지(라우트 '/recommendations'·Public). 2상태로 분기한다.
//  ① 개인화: 로그인 AND 설문완료 — 개인화 Hero + "당신을 위한 추천"(usePersonalizedHome).
//  ② 게스트: 비로그인 OR 설문미완 — 인기 추천 그리드 + 로그인/설문 유도 CTA(REC-GUEST-FE-001).
// 로그인했어도 설문 미완(hasCompletedSurvey=false)이면 게스트 추천으로 떨어진다(MainPage 패턴과 동일).
// ⚠️ 보안: /recommendations는 Public이라 비인증으로도 진입 가능하다. 개인화 컴포넌트(usePersonalizedHome)를
//   무가드로 렌더하면, 이전 로그인 사용자가 받아둔 ['home','personalized'] 캐시(staleTime 60s, clearAuth는
//   캐시를 비우지 않음)가 로그아웃 후에도 노출되는 개인정보 누출이 생긴다. 따라서 개인화 컴포넌트는
//   status==='authenticated' && hasCompletedSurvey 일 때만 렌더한다. 게스트 추천은 인증 불필요한
//   useGuestHome(['home','guest'])만 구독하므로 누출이 없다.
// <main> landmark는 페이지가 소유한다(GlobalShell은 Outlet 래퍼 div). MainPage.tsx와 동일 패턴.

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
        <GuestRecommendations isAuthenticated={status === 'authenticated'} />
      )}
    </main>
  );
}
