import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { css } from 'styled-system/css';
import { SearchInput } from '@/components/ui/SearchInput';
import { HeaderProfileMenu } from './HeaderProfileMenu';
import { Logo } from './Logo';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { Nav } from './Nav';
import { pageContainer, pageGutter } from './PageContainer';

// 글로벌 셸 헤더. base에서는 최소 상단 헤더와 하단 내비게이션을,
// sm 이상에서는 데스크톱 내비게이션과 검색창을 제공한다.
export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const submitSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchQuery('');
  };

  return (
    <>
      <header
        className={css(pageGutter, {
          position: 'sticky',
          top: '0',
          zIndex: 'sticky',
          bg: 'bg.canvas',
          borderBottom: '1px solid',
          borderColor: 'border.default',
        })}
      >
        <div
          className={css(pageContainer, {
            h: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '7',
          })}
        >
          <Logo />

          <div
            className={css({
              display: { base: 'none', sm: 'block' },
              flexShrink: 0,
            })}
          >
            <Nav />
          </div>

          <div className={css({ flex: '1', minW: '0' })} />

          <div
            className={css({
              display: { base: 'none', sm: 'block' },
              w: { sm: '180px', md: '280px' },
              flexShrink: 0,
            })}
          >
            <SearchInput
              size="sm"
              aria-label="검색"
              placeholder="게임, 장르, 태그 검색"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitSearch();
              }}
              onClick={() => navigate('/search')}
              className={css({
                borderRadius: 'full',
                fontFamily: 'mono',
                fontSize: 'md',
                cursor: 'text',
              })}
            />
          </div>

          {/* 데스크탑: 프로필 드롭다운 */}
          <div
            className={css({
              display: { base: 'none', sm: 'block' },
              flexShrink: 0,
            })}
          >
            <HeaderProfileMenu />
          </div>

          {/* 모바일: 검색 + 햄버거 (아이콘만, 테두리·배경 없음) */}
          <div
            className={css({
              display: { base: 'flex', sm: 'none' },
              alignItems: 'center',
              gap: '3',
              flexShrink: 0,
            })}
          >
            <button
              type="button"
              onClick={() => navigate('/search')}
              aria-label="검색"
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bg: 'transparent',
                border: 'none',
                p: '0',
                cursor: 'pointer',
                color: 'fg.default',
              })}
            >
              <Search size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={drawerOpen}
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bg: 'transparent',
                border: 'none',
                p: '0',
                cursor: 'pointer',
                color: 'fg.default',
              })}
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
