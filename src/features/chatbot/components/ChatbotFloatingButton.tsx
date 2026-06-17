import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { css } from 'styled-system/css';
import { ChatbotWindow } from '@/features/chatbot/components/ChatbotWindow';
import { useAuthStore } from '@/lib/store/useAuthStore';

// 고객센터 챗봇 플로팅 진입 버튼 (CHATBOT-FE-001/003).
//   GlobalShell이 전역 1회 렌더. 로그인(authenticated) 유저에게만 노출한다(CHATBOT-FE-003).
//   클릭 시 팝오버 대화창(ChatbotWindow)을 토글한다.
export function ChatbotFloatingButton() {
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated');
  const [open, setOpen] = useState(false);

  // 비로그인 유저에게는 버튼 자체를 노출하지 않는다.
  if (!isAuthenticated) return null;

  return (
    <>
      {open && <ChatbotWindow onClose={() => setOpen(false)} />}
      <button
        type="button"
        aria-label={open ? '챗봇 닫기' : '고객센터 챗봇 열기'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={css({
          position: 'fixed',
          right: '6',
          bottom: '6',
          zIndex: 'modal',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '14',
          h: '14',
          borderRadius: 'full',
          bg: 'accent.default',
          color: 'fg.onAccent',
          boxShadow: 'glow',
          cursor: 'pointer',
          _hover: { bg: 'accent.hover' },
          _focusVisible: {
            outline: '2px solid',
            outlineColor: 'accent.default',
            outlineOffset: '2px',
          },
        })}
      >
        {open ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <MessageCircle size={24} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
