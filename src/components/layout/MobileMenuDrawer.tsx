import { createPortal } from 'react-dom';
import { Home, LogIn, LogOut, Star, User, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { logout } from '@/services/auth';

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

const itemClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  w: 'full',
  px: '5',
  py: '3.5',
  fontSize: 'md',
  color: 'fg.muted',
  textDecoration: 'none',
  bg: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  _hover: { color: 'fg.default' },
});
const activeClass = css({ color: 'accent.default' });

export function MobileMenuDrawer({ open, onClose }: MobileMenuDrawerProps) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    clearAuth();
    onClose();
    navigate('/');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="메뉴 닫기"
        onClick={onClose}
        className={css({
          position: 'fixed',
          inset: '0',
          zIndex: 'modal',
          bg: 'black',
          opacity: open ? '0.65' : '0',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          border: 'none',
          p: '0',
          cursor: 'default',
        })}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="사이트 메뉴"
        className={css({
          position: 'fixed',
          top: '0',
          right: '0',
          bottom: '0',
          w: '72',
          maxW: '85vw',
          bg: 'bg.canvas',
          borderLeft: '1px solid',
          borderColor: 'border.default',
          zIndex: 'overlay',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'flex-end',
            p: '4',
          })}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="메뉴 닫기"
            className={css({
              bg: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'fg.muted',
            })}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {status === 'authenticated' && (
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              px: '5',
              pb: '4',
              borderBottom: '1px solid',
              borderColor: 'border.default',
            })}
          >
            <ProfileAvatar size="profile" />
            <span
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'fg.default',
              })}
            >
              {user?.nickname}
            </span>
          </div>
        )}

        <nav aria-label="주요 메뉴" className={css({ flex: '1', py: '2' })}>
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              cx(itemClass, isActive ? activeClass : undefined)
            }
          >
            <Home size={18} aria-hidden="true" />홈
          </NavLink>
          <NavLink
            to="/recommendations"
            onClick={onClose}
            className={({ isActive }) =>
              cx(itemClass, isActive ? activeClass : undefined)
            }
          >
            <Star size={18} aria-hidden="true" />
            추천
          </NavLink>
          {status === 'authenticated' && (
            <NavLink
              to="/mypage"
              onClick={onClose}
              className={({ isActive }) =>
                cx(itemClass, isActive ? activeClass : undefined)
              }
            >
              <User size={18} aria-hidden="true" />
              마이페이지
            </NavLink>
          )}
        </nav>

        <div
          className={css({
            borderTop: '1px solid',
            borderColor: 'border.default',
          })}
        >
          {status === 'authenticated' ? (
            <button type="button" onClick={handleLogout} className={itemClass}>
              <LogOut size={18} aria-hidden="true" />
              로그아웃
            </button>
          ) : (
            <Link to="/login" onClick={onClose} className={itemClass}>
              <LogIn size={18} aria-hidden="true" />
              로그인
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
