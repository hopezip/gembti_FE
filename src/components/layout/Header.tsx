import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { logout } from '@/services/auth';
import { Logo } from './Logo';
import { Nav } from './Nav';
import { pageContainer, pageGutter } from './PageContainer';

// 비로그인 인증 액션의 "로그인" ghost 텍스트 링크 스타일 (회원가입은 button recipe 사용).
const loginLink = css({
  display: 'inline-flex',
  alignItems: 'center',
  textStyle: 'body.md',
  fontWeight: 'medium',
  color: 'fg.muted',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'color {durations.fast}',
  _hover: { color: 'fg.default' },
});

// 글로벌 셸 헤더 (DESIGN_SYSTEM 4.1).
// 레이아웃: [Logo][Nav] ...(spacer)... [Search 280][인증 액션]
// - g-header 60px · bg.canvas · border-bottom
// - Search: 기존 ui Input(size sm) 재사용 + 인스턴스 override(radii.full · min-width 280 · mono).
//   새 recipe/토큰 추가 없이 styled className merge 로만 형태를 맞춘다.
// - 인증 액션: authenticated → Avatar + 로그아웃, 그 외 → 로그인/회원가입.
//   로그아웃은 logout() 서비스(쿠키 무효화) 후 clearAuth()로 세션을 비우고 홈으로 보낸다.
const logoutButtonReset = css({
  bg: 'transparent',
  border: 'none',
  p: '0',
  cursor: 'pointer',
});

export function Header() {
  const status = useAuthStore((s) => s.status);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');

  // 로그아웃: 서버 쿠키 무효화(실패해도 진행) → 클라 세션 비우기 → 홈으로.
  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate('/');
  };

  return (
    <header
      className={css(pageGutter, {
        h: '60px',
        bg: 'bg.canvas',
        borderBottom: '1px solid',
        borderColor: 'border.default',
      })}
    >
      <div
        className={css(pageContainer, {
          h: 'full',
          display: 'flex',
          alignItems: 'center',
          gap: '7',
        })}
      >
        <Logo />
        <Nav />

        {/* spacer — Logo/Nav 는 좌측, Search/인증 액션은 우측으로 민다. */}
        <div className={css({ flex: '1', minW: '0' })} />

        {/* Search: 기존 Input 재사용 + 인스턴스 형태 override(신규 recipe 없음). placeholder는 Figma 헤더 기준. */}
        <Input
          size="sm"
          type="search"
          aria-label="검색"
          placeholder="🔍 게임, 장르, 태그 검색"
          value={headerSearch}
          onChange={(e) => setHeaderSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && headerSearch.trim()) {
              navigate(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
              setHeaderSearch('');
            }
          }}
          onClick={() => navigate('/search')}
          className={css({
            minW: '280px',
            w: '280px',
            borderRadius: 'full',
            fontFamily: 'mono',
            fontSize: 'md',
            cursor: 'text',
          })}
        />

        {/* 인증 액션: authenticated → Avatar + 로그아웃, 그 외 → 로그인(링크) + 회원가입(filled 버튼). */}
        {status === 'authenticated' ? (
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              flexShrink: 0,
            })}
          >
            <Link
              to="/mypage"
              aria-label="내 프로필"
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 'full',
              })}
            >
              <Avatar size="sm" name="내 계정" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={cx(loginLink, logoutButtonReset)}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              flexShrink: 0,
            })}
          >
            <Link to="/login" className={loginLink}>
              로그인
            </Link>
            {/* 회원가입: Park UI button recipe(primary)로 스타일한 라우터 링크. 신규 토큰 없음. */}
            <Link
              to="/signup"
              className={button({ variant: 'primary', size: 'sm' })}
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
