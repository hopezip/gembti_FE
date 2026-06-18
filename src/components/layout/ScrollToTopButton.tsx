import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { css } from 'styled-system/css';

const SHOW_AFTER_PX = 400;

// 모든 라우트에서 공유하는 전역 탑 버튼. 충분히 스크롤했을 때만 노출한다.
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    // OS에서 모션 감소를 요청한 사용자는 즉시 이동한다.
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      aria-label="페이지 맨 위로 이동"
      onClick={scrollToTop}
      className={css({
        position: 'fixed',
        right: { base: '4', sm: '6' },
        // 우하단 챗봇 플로팅 버튼(bottom:6) 위에 쌓이도록 올린다(CHATBOT-FE-001 겹침 방지).
        bottom: '24',
        zIndex: 'modal',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        w: '11',
        h: '11',
        borderRadius: 'full',
        border: '1px solid',
        borderColor: 'accent.default',
        bg: 'bg.surfaceRaised',
        color: 'accent.default',
        boxShadow: 'lg',
        cursor: 'pointer',
        _hover: { bg: 'bg.surfaceRaised', color: 'accent.default' },
        _active: { bg: 'bg.surfaceRaised', color: 'accent.default' },
        _focusVisible: {
          outline: '2px solid',
          outlineColor: 'accent.default',
          outlineOffset: '2px',
        },
      })}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
