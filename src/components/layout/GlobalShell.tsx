import { Outlet } from 'react-router-dom';
import { css } from 'styled-system/css';
import { Footer } from './Footer';
import { Header } from './Header';
import { ScrollToTopButton } from './ScrollToTopButton';
import { Toaster } from '@/components/ui/Toast';

// 글로벌 셸 (DESIGN_SYSTEM 4.1) — 모든 라우트를 감싸는 공통 레이아웃 라우트의 element.
// 구조: Header(상단 고정 높이) → 콘텐츠 영역(<Outlet/>) → Footer.
//
// landmark 주의: 기존 페이지(PlaceholderPage/NotFoundPage 등)가 각자 <main>을 소유하므로,
// 셸의 콘텐츠 컨테이너는 <main>이 아니라 <div>로 둔다(main landmark 중복 방지).
// 콘텐츠 폭/좌우 거터(PageContainer의 pageContainer·pageGutter 단일 출처)는 각 페이지가
// 자체 풀폭 레이아웃을 가질 수 있으므로 여기서 강제하지 않고, 페이지가 직접 책임진다.
// 셸은 세로 흐름(헤더-본문-푸터)과 최소 높이만 보장한다.
//
// 1100px 미만 1열 fallback: 데스크탑 전용이라 별도 반응형 그리드 없이
// 세로 스택(flex column)이 그대로 1열로 동작한다(신규 반응형 토큰 추가 없음).
export function GlobalShell() {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        minH: '100vh',
        bg: 'bg.canvas',
      })}
    >
      <Header />
      {/* 콘텐츠 영역 — 남은 세로 공간을 채워 Footer를 하단에 고정한다. */}
      <div
        className={css({
          flex: '1',
          minW: '0',
          display: 'flex',
          flexDirection: 'column',
          pb: '0',
        })}
      >
        <Outlet />
      </div>
      <Footer />
      <ScrollToTopButton />
      <Toaster />
    </div>
  );
}
