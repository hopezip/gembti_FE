import { useGuestHome } from '@/features/main/api/guestHome';

// 메인 Hero 배경 캐러셀 이미지 (MAIN-FE-009).
//   ⭐ 백엔드 배너 API 미구현 → 임시로 인기(trending) 상위 5개 커버를 재활용한다.
//   배너 API가 확정되면 이 훅 내부만 교체하면 캐러셀 컴포넌트는 무변경이다.
//   게스트/개인화 양쪽 배너가 공유한다(개인화엔 trending 데이터가 없어 임시로 동일 출처 사용).
//
//   화질: trending의 thumbnail_url은 스팀 header.jpg(460x215)라 1440px Hero에 깔면 흐릿하다.
//   같은 앱의 library_hero.jpg(1920x620, Hero 비율과 거의 일치)를 cdn.cloudflare.steamstatic.com
//   /steam/apps/{appid}/ 경로로 구성해 우선 쓰고, 혹시 없는 게임은 header(원본)로 폴백한다
//   (폴백은 캐러셀의 <img> onError가 처리). ※ thumbnail_url의 store_item_assets 경로엔 library_hero가
//   없는 앱(예: CS2)이 있어, appid 기반 /steam/apps/ 경로로 재구성한다.
const BANNER_IMAGE_COUNT = 5;
const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

export interface BannerImage {
  /** 우선 표시할 고해상도 이미지(library_hero). */
  src: string;
  /** library_hero가 없을 때(404) 대체할 원본(header). */
  fallback: string;
}

// 스팀 이미지 URL에서 appid 추출 → library_hero 고해상도 URL. appid를 못 찾으면 null.
function libraryHeroUrl(header: string): string | null {
  const appid = header.match(/\/apps\/(\d+)\//)?.[1];
  return appid ? `${STEAM_CDN}/${appid}/library_hero.jpg` : null;
}

export function useBannerImages(): BannerImage[] {
  const { data } = useGuestHome();
  return (data?.trendingGames ?? [])
    .map((game) => game.thumbnailUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, BANNER_IMAGE_COUNT)
    .map((header) => ({
      src: libraryHeroUrl(header) ?? header,
      fallback: header,
    }));
}
