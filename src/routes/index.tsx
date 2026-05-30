import { createBrowserRouter } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';
import { PlaceholderPage, type RouteAccess } from './PlaceholderPage';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicOnlyRoute } from './guards/PublicOnlyRoute';

// routing.md 확정 라우트 맵(SSOT)을 그대로 옮긴 정의.
// 실제 화면은 범위 밖이라 모든 경로가 공통 PlaceholderPage 1개를 공유한다(라우트별 빈 파일 금지).
interface RouteDef {
  // 화면명
  title: string;
  // 라우트 경로
  path: string;
  // 접근 권한 (routing.md 권한 유형)
  access: RouteAccess;
}

// MVP 라우트 12개 (routing.md MVP 표)
const mvpRoutes: RouteDef[] = [
  { title: '메인', path: '/', access: 'Public' },
  { title: '로그인', path: '/login', access: 'Public only' },
  { title: '회원가입', path: '/signup', access: 'Public only' },
  {
    title: 'Steam OAuth 콜백',
    path: '/auth/steam/callback',
    access: 'Technical',
  },
  { title: '스팀 연동', path: '/onboarding/steam', access: 'Auth' },
  {
    title: '스팀 연동 결과',
    path: '/onboarding/steam/result',
    access: 'Auth',
  },
  { title: '설문 인트로', path: '/survey/intro', access: 'Auth' },
  { title: '설문 진행', path: '/survey', access: 'Auth' },
  { title: '설문 결과', path: '/survey/result', access: 'Auth' },
  { title: '검색', path: '/search', access: 'Public' },
  { title: '게임 추천', path: '/recommendations', access: 'Public' },
  { title: '게임별 상세', path: '/games/:gameId', access: 'Public' },
];

// 추가기능 라우트 11개 (routing.md 추가기능 표)
const extraRoutes: RouteDef[] = [
  { title: '커뮤니티', path: '/community', access: 'Public' },
  {
    title: '게시글 작성 - 일반',
    path: '/community/posts/new',
    access: 'Auth',
  },
  {
    title: '게시글 상세 - 일반',
    path: '/community/posts/:postId',
    access: 'Public',
  },
  {
    title: '게시글 작성 - 리뷰',
    path: '/community/reviews/new',
    access: 'Auth',
  },
  {
    title: '게시글 상세 - 리뷰',
    path: '/community/reviews/:reviewId',
    access: 'Public',
  },
  {
    title: '게시글 작성 - 파티',
    path: '/community/parties/new',
    access: 'Auth',
  },
  {
    title: '게시글 상세 - 파티',
    path: '/community/parties/:partyId',
    access: 'Public',
  },
  { title: '마이페이지', path: '/mypage', access: 'Auth' },
  { title: '프로필 편집', path: '/mypage/edit', access: 'Auth' },
  { title: '팔로우 리스트', path: '/mypage/follow', access: 'Auth' },
  { title: '타인 프로필', path: '/users/:userId', access: 'Public' },
];

// 권한에 맞는 가드로 PlaceholderPage를 감싼다.
// Public/Technical은 가드 없음, Auth는 ProtectedRoute, Public only는 PublicOnlyRoute.
function withGuard({ title, path, access }: RouteDef) {
  const page = <PlaceholderPage title={title} route={path} access={access} />;

  let element = page;
  if (access === 'Auth') {
    element = <ProtectedRoute>{page}</ProtectedRoute>;
  } else if (access === 'Public only') {
    element = <PublicOnlyRoute>{page}</PublicOnlyRoute>;
  }

  return { path, element };
}

// 라우트 객체 배열 (테스트의 createMemoryRouter에서 재사용)
export const routeObjects = [
  ...mvpRoutes.map(withGuard),
  ...extraRoutes.map(withGuard),
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routeObjects);
