import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from 'styled-system/css';
import { SearchInput } from '@/components/ui/SearchInput';
import { HeaderProfileMenu } from './HeaderProfileMenu';
import { Logo } from './Logo';
import { MobileBottomNav } from './MobileBottomNav';
import { Nav } from './Nav';
import { pageContainer, pageGutter } from './PageContainer';

// 글로벌 셸 헤더. base에서는 최소 상단 헤더와 하단 내비게이션을,
// sm 이상에서는 데스크톱 내비게이션과 검색창을 제공한다.
export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

          <div className={css({ display: { base: 'none', sm: 'block' } })}>
            <Nav />
          </div>

          <div className={css({ flex: '1', minW: '0' })} />

          <SearchInput
            containerClassName={css({
              display: { base: 'none', sm: 'block' },
              w: '280px',
              flexShrink: 0,
            })}
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

          <div className={css({ flexShrink: 0 })}>
            <HeaderProfileMenu />
          </div>
        </div>
      </header>

      <MobileBottomNav />
    </>
  );
}
