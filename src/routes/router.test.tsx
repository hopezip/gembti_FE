import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  Routes,
  RouterProvider,
} from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicOnlyRoute } from './guards/PublicOnlyRoute';
import { routeObjects } from './index';
import { PlaceholderPage } from './PlaceholderPage';

// 라우트 정의를 메모리 라우터로 렌더한다(브라우저 history 없이 테스트).
// routeObjects에는 LoginPage(react-query 사용)가 포함되므로 QueryClientProvider로 감싼다.
function renderAt(path: string) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

// 각 테스트 후 authStore를 비로그인 stub 기본값으로 복원한다(테스트 간 격리).
afterEach(() => {
  useAuthStore.getState().clearAuth();
  useSurveyProgressStore.getState().resetProgress();
});

describe('라우트 골격', () => {
  it('대표 Public 경로(/search)가 SearchPage를 렌더한다', () => {
    renderAt('/search');
    expect(
      screen.getByRole('searchbox', { name: '게임 검색' }),
    ).toBeInTheDocument();
  });

  it('설문 결과 분석 경로(/survey/loading)가 로딩 화면을 렌더한다', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: 'survey@gambti.com',
        nickname: '설문유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'mock-access',
    });
    renderAt('/survey/loading');
    expect(
      screen.getByRole('heading', { name: '당신의 성향을 분석하고 있어요' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: '설문 결과 분석 중' }),
    ).toBeInTheDocument();
  });

  it('메인 경로(/)가 MainPage Hero 배너(MAIN-FE-001)를 렌더한다', () => {
    // '/'는 PlaceholderPage 대신 MainPage(HeroBanner)를 렌더한다.
    // 배너 텍스트는 추천 데이터 로딩/에러와 무관하게 항상 렌더되므로 <h1>로 검증한다.
    // RESPONSIVE-FE-005: 히어로는 모바일(텍스트형)/데스크탑(풀블리드) 두 변형을 동시에 마크업하고
    // CSS display로만 토글한다(런타임은 한쪽만 노출). jsdom은 CSS를 계산하지 않아 <h1>이 둘 다
    // 잡히므로 getAllByRole로 받아 1개 이상 렌더됨을 검증한다.
    renderAt('/');
    expect(
      screen.getAllByRole('heading', { name: /인생 게임을 찾아보세요/ })[0],
    ).toBeInTheDocument();
  });

  it('로그인+설문완료 시 메인(/)이 개인화 홈을 렌더한다(MAIN-FE-006)', () => {
    // 개인화 분기: status==='authenticated' && hasCompletedSurvey일 때만 개인화 홈.
    // 데이터 로딩과 무관하게 개인화 Hero 카피·추천 섹션 제목은 항상 렌더되므로 그것으로 검증한다.
    useAuthStore.getState().setSession({
      user: {
        id: 2,
        email: 'survey@gambti.com',
        nickname: '설문완료유저',
        hasCompletedSurvey: true,
      },
      accessToken: 'mock-access',
    });
    renderAt('/');
    // 배너는 게스트와 통일된 HeroBanner(MAIN-FE-011). 개인화 여부는 추천 섹션 제목으로 구분한다.
    expect(
      screen.getAllByRole('heading', { name: /인생 게임을 찾아보세요/ })[0],
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '설문 다시하기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /설문 (진행|이어)하기/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '당신을 위한 추천' }),
    ).toBeInTheDocument();
  });

  it('로그인했어도 설문 미완이면 메인(/)이 게스트 홈으로 떨어진다(MAIN-FE-006)', () => {
    // hasCompletedSurvey=false면 로그인 상태라도 개인화가 아닌 게스트 홈을 렌더한다.
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: 'test@gambti.com',
        nickname: '테스트유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'mock-access',
    });
    renderAt('/');
    // 게스트 Hero 카피가 보이고, 개인화 Hero/추천 제목은 없다.
    expect(
      screen.getAllByRole('heading', { name: /인생 게임을 찾아보세요/ })[0],
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '설문 진행하기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '당신을 위한 추천' }),
    ).not.toBeInTheDocument();
  });

  it('설문 미완료 사용자의 메인 화면에 설문 이어하기를 노출하지 않는다', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: 'survey-continue@gambti.com',
        nickname: '설문이어가기유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'mock-access',
    });
    useSurveyProgressStore.getState().saveProgress({ 1: 4, 2: 3 });

    renderAt('/');

    expect(
      screen.queryByRole('link', { name: '설문 이어하기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '설문 진행하기' }),
    ).not.toBeInTheDocument();
  });

  it('설문 완료 후 재진단에서는 개인화 배너에 설문 이어하기를 노출하지 않는다', () => {
    useAuthStore.getState().setSession({
      user: {
        id: 2,
        email: 'survey-retry@gambti.com',
        nickname: '재진단이어가기유저',
        hasCompletedSurvey: true,
      },
      accessToken: 'mock-access',
    });
    useSurveyProgressStore.getState().saveProgress({ 1: 5, 2: 4 });

    renderAt('/');

    expect(
      screen.queryByRole('link', { name: '설문 이어하기' }),
    ).not.toBeInTheDocument();
    // 통일 배너 + 개인화 추천 섹션으로 개인화 홈임을 확인한다(MAIN-FE-011).
    expect(
      screen.getByRole('heading', { name: '당신을 위한 추천' }),
    ).toBeInTheDocument();
  });

  it('게임 상세 경로(/games/:gameId)가 PlaceholderPage 대신 GameDetailPage를 렌더한다(REC-DET-FE-001)', () => {
    // 화면 교체 회귀 방지: /games/:gameId는 더 이상 공통 PlaceholderPage("게임별 상세")가 아니라
    //   실제 GameDetailPage로 마운트되어야 한다.
    // vitest 셋업에는 MSW 서버가 없어 useGameDetail의 fetch가 동기적으로 resolve되지 않는다.
    //   따라서 유효한 id에서는 GameDetailPage가 로딩 상태(스켈레톤)로 렌더된다.
    //   로딩 스켈레톤에는 접근성 이름이 없으므로, "PlaceholderPage가 아님"을 음성 단언으로 검증한다.
    renderAt('/games/1');
    // PlaceholderPage라면 보였을 흔적(헤딩 "게임별 상세" + "Placeholder" 라벨)이 없어야 한다.
    expect(
      screen.queryByRole('heading', { name: '게임별 상세' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Placeholder')).not.toBeInTheDocument();
    // 셸(Header/Footer)은 GameDetailPage에도 동일하게 적용된다(라우트 레벨 GlobalShell).
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('게임 상세에서 잘못된 id(NaN)면 GameDetailPage가 "찾을 수 없음" 안내를 렌더한다', () => {
    // isValidId 가드(Number(gameId) NaN) 경로는 fetch 없이 동기 렌더되므로,
    //   GameDetailPage가 실제로 마운트됐음을 결정적으로 증명한다(PlaceholderPage엔 없는 카피).
    renderAt('/games/not-a-number');
    expect(
      screen.getByRole('heading', { name: '게임을 찾을 수 없어요' }),
    ).toBeInTheDocument();
    // 옛 PlaceholderPage 헤딩은 더 이상 없다.
    expect(
      screen.queryByRole('heading', { name: '게임별 상세' }),
    ).not.toBeInTheDocument();
  });

  it('GlobalShell layout 라우트가 모든 경로에 Header/Footer 셸을 렌더한다', () => {
    // 중첩 구조에서 페이지(Outlet)와 함께 셸 landmark(banner/nav/contentinfo)가 보여야 한다.
    renderAt('/search');
    expect(screen.getByRole('banner')).toBeInTheDocument(); // <header>
    expect(
      screen.getByRole('navigation', { name: '주요 메뉴' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // <footer>
    // 페이지 콘텐츠도 함께 렌더(셸이 페이지를 덮어쓰지 않음).
    expect(
      screen.getByRole('searchbox', { name: '게임 검색' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '설문조사' }),
    ).not.toBeInTheDocument();
  });

  it('비로그인 사용자가 설문 라우트에 접근하면 로그인으로 이동한다', () => {
    renderAt('/survey/intro');

    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: '로그인' }),
    ).toBeInTheDocument();
  });

  it('비로그인 stub에서 셸 인증 액션이 "로그인" 링크를 보여준다', () => {
    // useAuthStore stub은 항상 'anonymous'이므로 Avatar 대신 로그인 링크가 보인다.
    renderAt('/');
    const loginLink = screen.getByRole('link', { name: '로그인' });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('인증 페이지(/login)에도 GlobalShell 셸이 적용된다', () => {
    // 셸이 모든 라우트를 감싸므로 /login(LoginPage)에도 Header/Footer landmark가 보인다.
    // LoginPage AuthCard(=main)의 헤딩은 "로그인"이다(Figma auth-modal 재구성, LOGIN-FE-001b).
    //   Header에도 "로그인" 링크가 있어 main 범위로 한정해 충돌을 피한다.
    renderAt('/login');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    const card = within(screen.getByRole('main'));
    expect(card.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
  });

  it('Auth 가드는 비로그인 stub(status:anonymous)에서 /login으로 리다이렉트한다', () => {
    // useAuthStore stub이 항상 'anonymous'를 반환하므로 ProtectedRoute는
    // 보호 페이지 대신 /login 화면을 렌더해야 한다.
    render(
      <MemoryRouter initialEntries={['/mypage']}>
        <Routes>
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <PlaceholderPage
                  title="마이페이지"
                  route="/mypage"
                  access="Auth"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PlaceholderPage
                title="로그인"
                route="/login"
                access="Public only"
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '마이페이지' }),
    ).not.toBeInTheDocument();
  });

  it('/login은 비로그인 시 LoginPage(이메일 로그인 폼)를 렌더한다', () => {
    renderAt('/login');
    // AuthCard(=main) 헤딩 "로그인" + 이메일/비밀번호 입력 라벨.
    //   Header "로그인" 링크와 충돌하지 않게 main 범위로 한정한다(LOGIN-FE-001b).
    const card = within(screen.getByRole('main'));
    expect(card.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    // 비밀번호 필드는 👁 토글 버튼의 aria-label "비밀번호 표시"와 부분 매칭이 겹치므로
    //   selector로 input 요소만 한정한다(LOGIN-FE-001b PasswordInput 추가 영향).
    expect(
      screen.getByLabelText(/이메일/, { selector: 'input' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/비밀번호/, { selector: 'input' }),
    ).toBeInTheDocument();
  });

  it('/signup은 비로그인 시 SignupPage(회원가입 폼)를 렌더한다', () => {
    renderAt('/signup');
    // AuthCard(=main) 헤딩 "회원가입". Header에는 "회원가입" 링크가 없어 별도 한정 불필요하나
    //   일관성 위해 main 범위로 본다.
    const card = within(screen.getByRole('main'));
    expect(card.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
    // 필수표시 `*`/"비밀번호 확인" 중복으로 label 매칭이 취약해 placeholder로 입력을 한정한다.
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('영문·숫자·특수문자 포함 10자 이상'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 재입력')).toBeInTheDocument();
    // 제출 버튼(STEP1)
    expect(
      screen.getByRole('button', { name: '인증 코드 받기 →' }),
    ).toBeInTheDocument();
  });

  it('/login은 로그인 상태면 PublicOnlyRoute가 홈(/)으로 리다이렉트한다', () => {
    // data router(createMemoryRouter)는 jsdom에서 Navigate 시 fetch/AbortSignal 비호환 이슈가 있어,
    // ProtectedRoute 테스트와 동일하게 MemoryRouter(non-data) + PublicOnlyRoute로 가드만 검증한다.
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: 'test@gambti.com',
        nickname: '테스트유저',
        hasCompletedSurvey: false,
      },
      accessToken: 'mock-access',
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <PlaceholderPage
                  title="로그인"
                  route="/login"
                  access="Public only"
                />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/"
            element={<PlaceholderPage title="메인" route="/" access="Public" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // 로그인 상태이므로 홈(메인)이 렌더되고 로그인 화면은 사라진다.
    expect(screen.getByRole('heading', { name: '메인' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '로그인' }),
    ).not.toBeInTheDocument();
  });
});
