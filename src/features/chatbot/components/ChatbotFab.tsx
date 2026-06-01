import { css } from 'styled-system/css';

// 챗봇 플로팅 액션 버튼 (Figma chatbot, 우하단 고정).
// bg accent.default · 60px 원형 · orange glow shadow · 💬 아이콘.
// onClick은 상위에서 주입 — 챗봇 패널 열기 연동 시 사용 (CHATBOT 피처 연동 예정).
interface ChatbotFabProps {
  onClick?: () => void;
}

export function ChatbotFab({ onClick }: ChatbotFabProps) {
  return (
    <button
      type="button"
      aria-label="챗봇 열기"
      onClick={onClick}
      className={css({
        position: 'fixed',
        bottom: '8',
        right: '8',
        w: '60px',
        h: '60px',
        flexShrink: 0,
        borderRadius: 'full',
        bg: 'accent.default',
        border: 'none',
        boxShadow: 'glow',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2xl',
        transition: 'transform {durations.fast}, box-shadow {durations.fast}',
        zIndex: 'dropdown',
        _hover: {
          transform: 'scale(1.08)',
        },
        _active: {
          transform: 'scale(0.96)',
        },
      })}
    >
      💬
    </button>
  );
}
