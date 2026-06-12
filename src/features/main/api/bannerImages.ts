import { useGuestHome } from '@/features/main/api/guestHome';

// 메인 Hero 배경 캐러셀 이미지 (MAIN-FE-009).
//   ⭐ 백엔드 배너 API 미구현 → 임시로 인기(trending) 상위 5개 커버를 재활용한다.
//   배너 API가 확정되면 이 훅 내부만 교체하면 캐러셀 컴포넌트는 무변경이다.
//   게스트/개인화 양쪽 배너가 공유한다(개인화엔 trending 데이터가 없어 임시로 동일 출처 사용).
const BANNER_IMAGE_COUNT = 5;

export function useBannerImages(): string[] {
  const { data } = useGuestHome();
  return (data?.trendingGames ?? [])
    .map((game) => game.thumbnailUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, BANNER_IMAGE_COUNT);
}
