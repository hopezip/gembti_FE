import { HeroBanner } from '@/features/main/components/HeroBanner';
import { RecommendedGames } from '@/features/main/components/RecommendedGames';

// 메인 페이지 (라우트 '/'·Public). 비로그인 홈은 단일 GET /api/v1/home/guest로 데이터를 받는다.
// 구현 범위: MAIN-FE-001 Hero 배너 + MAIN-FE-003 추천(인기) 게임 그리드.
// 성향 태그 필터(002)는 취소, 신규 게임 목록(004)은 후속.
// <main> landmark는 페이지가 소유한다(GlobalShell은 Outlet 래퍼 div).
export function MainPage() {
  return (
    <main>
      <HeroBanner />
      <RecommendedGames />
    </main>
  );
}
