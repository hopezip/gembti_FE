import { useEffect, useRef, useState } from 'react';
import { ChevronRight, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from 'styled-system/css';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { logout } from '@/services/auth';

const menuItemClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  w: 'full',
  textAlign: 'left',
  px: '4',
  py: '3.5',
  fontSize: 'md',
  color: 'fg.muted',
  bg: 'transparent',
  border: 'none',
  borderBottom: '1px solid',
  borderColor: 'border.default',
  cursor: 'pointer',
  textDecoration: 'none',
  _hover: { bg: 'bg.surfaceRaised', color: 'fg.default' },
  _last: { borderBottom: 'none' },
});

// 헤더의 인증 상태 표시와 프로필 드롭다운 동작을 캡슐화한다.
export function HeaderProfileMenu() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    clearAuth();
    setOpen(false);
    navigate('/');
  };

  if (status !== 'authenticated') {
    return (
      <Link
        to="/login"
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          textStyle: 'body.md',
          fontWeight: 'medium',
          color: 'fg.muted',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          _hover: { color: 'fg.default' },
        })}
      >
        로그인
      </Link>
    );
  }

  return (
    <div ref={menuRef} className={css({ position: 'relative' })}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="프로필 메뉴"
        aria-expanded={open}
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          bg: 'transparent',
          border: 'none',
          p: '0',
        })}
      >
        <ProfileAvatar />
      </button>

      {open && (
        <div
          className={css({
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '0',
            minW: '64',
            overflow: 'visible',
            zIndex: 'dropdown',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 'xl',
            boxShadow: 'lg',
            _before: {
              content: '""',
              position: 'absolute',
              top: '-6px',
              right: '10px',
              w: '12px',
              h: '12px',
              bg: 'bg.surface',
              borderTop: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'border.default',
              transform: 'rotate(45deg)',
            },
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              px: '4',
              py: '4',
              borderBottom: '1px solid',
              borderColor: 'border.default',
            })}
          >
            <span
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '12',
                h: '12',
                borderRadius: 'full',
                border: '1px solid',
                borderColor: 'border.emphasized',
                bg: 'bg.surfaceRaised',
                p: '2',
                flexShrink: 0,
              })}
            >
              <img
                src="/images/profile.png"
                alt=""
                className={css({ w: 'full', h: 'full', objectFit: 'contain' })}
              />
            </span>
            <span className={css({ minW: '0' })}>
              <strong
                className={css({
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'fg.default',
                  fontSize: 'xl',
                })}
              >
                {user?.nickname}
              </strong>
              <span
                className={css({
                  display: 'block',
                  mt: '0.5',
                  color: 'fg.subtle',
                  fontSize: 'sm',
                })}
              >
                회원
              </span>
            </span>
          </div>

          <Link
            to="/mypage"
            onClick={() => setOpen(false)}
            className={menuItemClass}
          >
            <User size={18} aria-hidden="true" />
            <span className={css({ flex: '1' })}>마이페이지</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={menuItemClass}
          >
            <LogOut size={18} aria-hidden="true" />
            <span className={css({ flex: '1' })}>로그아웃</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
