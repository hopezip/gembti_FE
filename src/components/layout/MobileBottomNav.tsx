import { createPortal } from 'react-dom';
import { Flame, Home, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { css, cx } from 'styled-system/css';

const navItemClass = css({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
  w: 'full',
  minW: '0',
  py: '2',
  fontSize: '2xs',
  color: 'fg.muted',
  textDecoration: 'none',
});

const activeClass = css({ color: 'accent.default' });

// base(640px 미만)에서만 표시되는 전역 fixed 하단 내비게이션이다.
export function MobileBottomNav() {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <nav
      aria-label="모바일 주요 메뉴"
      className={css({
        display: { base: 'grid', sm: 'none' },
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        position: 'fixed',
        insetInline: '0',
        bottom: '0',
        w: '100vw',
        maxW: '100vw',
        h: 'calc(64px + env(safe-area-inset-bottom))',
        zIndex: 'modal',
        pb: 'env(safe-area-inset-bottom)',
        boxSizing: 'border-box',
        bg: 'bg.canvas',
        borderTop: '1px solid',
        borderColor: 'border.default',
        boxShadow: 'lg',
      })}
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          cx(navItemClass, isActive ? activeClass : undefined)
        }
      >
        <Home size={21} aria-hidden="true" />홈
      </NavLink>
      <NavLink
        to="/recommendations"
        className={({ isActive }) =>
          cx(navItemClass, isActive ? activeClass : undefined)
        }
      >
        <Flame size={21} aria-hidden="true" />
        추천
      </NavLink>
      <NavLink
        to="/search"
        className={({ isActive }) =>
          cx(navItemClass, isActive ? activeClass : undefined)
        }
      >
        <Search size={21} aria-hidden="true" />
        검색
      </NavLink>
    </nav>,
    document.body,
  );
}
