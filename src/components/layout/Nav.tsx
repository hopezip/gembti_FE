import { NavLink } from 'react-router-dom';
import { css, cx } from 'styled-system/css';

// 글로벌 셸 1차 내비게이션 (DESIGN_SYSTEM 4.1: gap 22px, active 시 하단 2px accent 바).
// 노출 항목은 routing.md 확정 라우트 맵의 Public 주요 섹션에서 도출한다(셸은 Public 위주 노출).
//  - 메인 '/'           : Public
//  - 검색 '/search'      : Public
//  - 게임 추천 '/recommendations' : Public
//  - 커뮤니티 '/community'        : Public
// 가드/권한 분기는 라우트가 책임지며 Nav는 표시(링크)만 한다.
interface NavItem {
  // 표시 라벨
  label: string;
  // 라우트 경로 (routing.md SSOT)
  to: string;
  // '/' 는 다른 모든 경로의 prefix라 정확 매칭으로 active를 한정한다.
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: '메인', to: '/', end: true },
  { label: '검색', to: '/search' },
  { label: '게임 추천', to: '/recommendations' },
  { label: '커뮤니티', to: '/community' },
];

// 링크 기본 스타일 — active 여부와 무관한 공통 시각.
const linkBase = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  textStyle: 'body.md',
  fontWeight: 'medium',
  color: 'fg.muted',
  textDecoration: 'none',
  py: '2',
  transition: 'color {durations.fast}',
  _hover: { color: 'fg.default' },
  // active 시 하단 2px accent 바 (DESIGN_SYSTEM 4.1).
  _after: {
    content: '""',
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '0',
    height: '2px',
    bg: 'accent.default',
    borderRadius: 'full',
    opacity: 0,
    transition: 'opacity {durations.fast}',
  },
});

// active(현재 경로 일치) 상태 — 텍스트 강조 + 하단 바 노출.
const linkActive = css({
  color: 'fg.default',
  _after: { opacity: 1 },
});

export function Nav() {
  return (
    <nav
      aria-label="주요 메뉴"
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '22px',
        minW: '0',
      })}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cx(linkBase, isActive ? linkActive : undefined)
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
