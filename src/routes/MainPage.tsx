import { HeroBanner } from '@/features/main/components/HeroBanner';

// 메인 페이지 (MAIN-FE-001~004, 라우트 '/'·Public).
// 이번 범위는 MAIN-FE-001 비로그인 Hero 배너만. 성향 태그 필터(002)·추천 목록(003)·신규 목록(004)은 후속.
// <main> landmark는 페이지가 소유한다(GlobalShell은 Outlet 래퍼 div).
export function MainPage() {
  return (
    <main>
      <HeroBanner />
    </main>
  );
}
