import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, X } from 'lucide-react';
import { css } from 'styled-system/css';
import { sendChatMessage } from '@/features/chatbot/api/chat';

// 챗봇 팝오버 대화 UI (CHATBOT-FE-002).
//   순수 프리젠테이션 + 로컬 대화 상태. 세션ID는 첫 응답값을 보관해 이후 요청에 재전송한다.
//   다른 도메인을 import하지 않는다(chatbot 격리).

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

const GREETING: ChatMessage = {
  id: 0,
  role: 'bot',
  text: '안녕하세요! GamBTI 고객센터예요. 무엇을 도와드릴까요?',
};

interface Props {
  onClose: () => void;
}

export function ChatbotWindow({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) => sendChatMessage({ message, sessionId }),
    onSuccess: (reply) => {
      setSessionId(reply.sessionId);
      appendMessage('bot', reply.message);
    },
    onError: () => {
      appendMessage('bot', '전송에 실패했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  function appendMessage(role: ChatMessage['role'], text: string) {
    setMessages((prev) => [...prev, { id: nextId.current++, role, text }]);
  }

  // 새 메시지가 추가되면 목록 맨 아래로 스크롤한다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages 변경을 트리거로 스크롤한다(본문은 ref만 읽음).
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || mutation.isPending) return;
    appendMessage('user', text);
    setInput('');
    mutation.mutate(text);
  }

  return (
    <section
      aria-label="고객센터 챗봇 대화창"
      className={css({
        position: 'fixed',
        right: '6',
        bottom: '24',
        zIndex: 'modal',
        display: 'flex',
        flexDirection: 'column',
        w: '360px',
        maxW: 'calc(100vw - 32px)',
        h: '480px',
        maxH: 'calc(100vh - 140px)',
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: '2xl',
        boxShadow: 'xl',
        overflow: 'hidden',
      })}
    >
      {/* 헤더 */}
      <header
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: '4',
          py: '3',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          bg: 'bg.surfaceRaised',
        })}
      >
        <span
          className={css({
            fontSize: 'md',
            fontWeight: 'semibold',
            color: 'fg.default',
          })}
        >
          GamBTI 고객센터
        </span>
        <button
          type="button"
          aria-label="챗봇 닫기"
          onClick={onClose}
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '7',
            h: '7',
            borderRadius: 'md',
            color: 'fg.subtle',
            cursor: 'pointer',
            _hover: { bg: 'bg.canvas', color: 'fg.default' },
          })}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      {/* 메시지 목록 */}
      <div
        ref={listRef}
        className={css({
          flex: 1,
          minH: 0,
          overflowY: 'auto',
          px: '4',
          py: '3',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5',
        })}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={css({
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxW: '80%',
              px: '3',
              py: '2',
              borderRadius: 'lg',
              fontSize: 'sm',
              lineHeight: 'snug',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              bg: m.role === 'user' ? 'accent.default' : 'bg.surfaceRaised',
              color: m.role === 'user' ? 'fg.onAccent' : 'fg.default',
            })}
          >
            {m.text}
          </div>
        ))}
        {mutation.isPending && (
          <span
            className={css({
              alignSelf: 'flex-start',
              fontSize: 'xs',
              color: 'fg.subtle',
              px: '1',
            })}
          >
            답변을 작성 중이에요…
          </span>
        )}
      </div>

      {/* 입력창 */}
      <form
        onSubmit={handleSubmit}
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          px: '3',
          py: '3',
          borderTop: '1px solid',
          borderColor: 'border.default',
        })}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          aria-label="메시지 입력"
          // biome-ignore lint/a11y/noAutofocus: 대화창을 열면 바로 입력 가능해야 한다.
          autoFocus
          className={css({
            flex: 1,
            minW: 0,
            px: '3',
            py: '2',
            fontSize: 'sm',
            bg: 'bg.canvas',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 'md',
            color: 'fg.default',
            outline: 'none',
            _focus: { borderColor: 'accent.default' },
            _placeholder: { color: 'fg.placeholder' },
          })}
        />
        <button
          type="submit"
          aria-label="전송"
          disabled={!input.trim() || mutation.isPending}
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            w: '9',
            h: '9',
            borderRadius: 'md',
            bg: 'accent.default',
            color: 'fg.onAccent',
            cursor: 'pointer',
            _hover: { bg: 'accent.hover' },
            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
          })}
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
