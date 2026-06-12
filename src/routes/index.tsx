import { createBrowserRouter } from 'react-router-dom';
import { GlobalShell } from '@/components/layout/GlobalShell';
import GameDetailPage from './GameDetailPage';
import { LoginPage } from './LoginPage';
import { MainPage } from './MainPage';
import { MyPage } from './MyPage';
import { NotFoundPage } from './NotFoundPage';
import { ProfileEditPage } from './ProfileEditPage';
import { RecommendationsPage } from './RecommendationsPage';
import { SearchPage } from './SearchPage';
import { SignupPage } from './SignupPage';
import { SteamCallbackPage } from './SteamCallbackPage';
import { SteamOnboardingPage } from './SteamOnboardingPage';
import { SurveyAnalysisLoadingPage } from './SurveyAnalysisLoadingPage';
import { SurveyIntroPage } from './SurveyIntroPage';
import { SurveyPage } from './SurveyPage';
import { SurveyResultPage } from './SurveyResultPage';
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
    path: '/steam/callback',
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
  { title: '설문 결과 분석', path: '/survey/loading', access: 'Auth' },
  { title: '설문 결과', path: '/survey/result', access: 'Auth' },
  { title: '검색', path: '/search', access: 'Public' },
  { title: '게임 추천', path: '/recommendations', access: 'Public' },
  { title: '게임별 상세', path: '/games/:gameId', access: 'Public' },
];

// 추가기능 라우트 4개 (routing.md 추가기능 표)
// 커뮤니티(`/community*` 7개)는 MVP 구현 생략(보류, scaffold 유지)으로 라우트 미노출 — TASK-DEVEX-016.
const extraRoutes: RouteDef[] = [
  { title: '마이페이지', path: '/mypage', access: 'Auth' },
  { title: '프로필 편집', path: '/mypage/edit', access: 'Auth' },
  { title: '타인 프로필', path: '/users/:userId', access: 'Public' },
];

// 권한에 맞는 가드로 페이지를 감싼다.
// Public/Technical은 가드 없음, Auth는 ProtectedRoute, Public only는 PublicOnlyRoute.
// 대부분의 경로는 아직 공통 PlaceholderPage를 공유하지만,
// 구현된 화면은 path별로 실제 페이지를 매핑한다(LOGIN-FE-001: /login → LoginPage).
function pageElement({ title, path, access }: RouteDef) {
  if (path === '/') return <MainPage />;
  if (path === '/login') return <LoginPage />;
  if (path === '/signup') return <SignupPage />;
  if (path === '/search') return <SearchPage />;
  if (path === '/recommendations') return <RecommendationsPage />;
  // 스팀 연동 온보딩 (STEAM-INTER-FE-001) — 단일 플로우(intro/syncing/result) + OAuth 콜백.
  if (path === '/onboarding/steam') return <SteamOnboardingPage />;
  if (path === '/steam/callback') return <SteamCallbackPage />;
  if (path === '/survey/intro') return <SurveyIntroPage />;
  if (path === '/survey') return <SurveyPage />;

  // 게임별 상세 (REC-DET-FE-001) — 라우트 정의/권한(Public)은 변경하지 않고 화면만 교체.
  if (path === '/games/:gameId') return <GameDetailPage />;
  if (path === '/survey/loading') return <SurveyAnalysisLoadingPage />;
  if (path === '/survey/result') return <SurveyResultPage />;
  if (path === '/mypage') return <MyPage />;
  if (path === '/mypage/edit') return <ProfileEditPage />;
  return <PlaceholderPage title={title} route={path} access={access} />;
}

function withGuard(def: RouteDef) {
  const { path, access } = def;
  const page = pageElement(def);

  let element = page;
  if (access === 'Auth') {
    element = <ProtectedRoute>{page}</ProtectedRoute>;
  } else if (access === 'Public only') {
    element = <PublicOnlyRoute>{page}</PublicOnlyRoute>;
  }

  return { path, element };
}

// GlobalShell layout 라우트의 children (가드/권한표 SSOT는 그대로 유지하고 children으로 이동).
// NotFound(*)도 셸 안에 두어 404에서도 Header/Footer가 노출된다.
const shellChildren = [
  ...mvpRoutes.map(withGuard),
  ...extraRoutes.map(withGuard),
  { path: '*', element: <NotFoundPage /> },
];

// 라우트 객체 배열 (테스트의 createMemoryRouter에서 재사용).
// 모든 라우트를 GlobalShell layout 라우트(element=<GlobalShell/>, 내부 <Outlet/>)로 감싼다.
// 인증 페이지(/login·/signup)를 포함한 전 화면에 공통 셸이 적용된다.
export const routeObjects = [
  {
    element: <GlobalShell />,
    children: shellChildren,
  },
];

export const router = createBrowserRouter(routeObjects);
