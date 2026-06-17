import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bot, Send, X } from 'lucide-react';
import { css } from 'styled-system/css';
import { sendChatMessage } from '@/features/chatbot/api/chat';

// 챗봇 팝오버 대화 UI (CHATBOT-FE-002).
//   순수 프리젠테이션 + 로컬 대화 상태. 세션ID는 첫 응답값을 보관해 이후 요청에 재전송한다.
//   다른 도메인을 import하지 않는다(chatbot 격리).

const BRAND = 'GamBTI AI';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

function nowTime(): string {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface Props {
  onClose: () => void;
  /** 유저 아바타 이니셜 표시용(로그인 닉네임). */
  userName: string;
}

export function ChatbotWindow({ onClose, userName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 0,
      role: 'bot',
      text: '안녕하세요! GamBTI AI예요. 게임 추천이나 이용 관련 무엇이든 물어보세요.',
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  const initials = (userName.trim().slice(0, 2) || '나').toUpperCase();

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
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role, text, time: nowTime() },
    ]);
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
      aria-label="GamBTI AI 챗봇 대화창"
      className={css({
        position: 'fixed',
        right: '6',
        bottom: '24',
        zIndex: 'modal',
        display: 'flex',
        flexDirection: 'column',
        w: '380px',
        maxW: 'calc(100vw - 32px)',
        h: '600px',
        maxH: 'calc(100vh - 120px)',
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: '2xl',
        boxShadow: 'xl',
        overflow: 'hidden',
      })}
    >
      {/* 헤더 — 중앙 브랜딩 + 우측 닫기 */}
      <header
        className={css({
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2',
          px: '4',
          py: '3.5',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          bg: 'bg.surfaceRaised',
        })}
      >
        <span
          aria-hidden="true"
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '7',
            h: '7',
            borderRadius: 'lg',
            bg: 'accent.default',
            color: 'fg.onAccent',
          })}
        >
          <Bot size={16} />
        </span>
        <span
          className={css({
            fontSize: 'md',
            fontWeight: 'bold',
            letterSpacing: 'wide',
            color: 'fg.default',
          })}
        >
          {BRAND}
        </span>
        <button
          type="button"
          aria-label="챗봇 닫기"
          onClick={onClose}
          className={css({
            position: 'absolute',
            right: '3',
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
          py: '4',
          display: 'flex',
          flexDirection: 'column',
          gap: '4',
        })}
      >
        {/* 날짜 구분선 */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            color: 'fg.subtle',
            fontSize: 'xs',
            _before: {
              content: '""',
              flex: 1,
              h: '1px',
              bg: 'border.default',
            },
            _after: {
              content: '""',
              flex: 1,
              h: '1px',
              bg: 'border.default',
            },
          })}
        >
          오늘
        </div>

        {messages.map((m) =>
          m.role === 'bot' ? (
            <BotRow key={m.id} text={m.text} time={m.time} />
          ) : (
            <UserRow
              key={m.id}
              text={m.text}
              time={m.time}
              initials={initials}
            />
          ),
        )}

        {mutation.isPending && <TypingRow />}
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
          placeholder="메시지를 입력하세요…"
          aria-label="메시지 입력"
          // biome-ignore lint/a11y/noAutofocus: 대화창을 열면 바로 입력 가능해야 한다.
          autoFocus
          className={css({
            flex: 1,
            minW: 0,
            px: '4',
            py: '2.5',
            fontSize: 'sm',
            bg: 'bg.canvas',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 'full',
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
            w: '10',
            h: '10',
            borderRadius: 'full',
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

// 봇 아바타(주황 라운드 사각 + 로고).
function BotAvatar() {
  return (
    <span
      aria-hidden="true"
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        w: '8',
        h: '8',
        borderRadius: 'lg',
        bg: 'accent.default',
        color: 'fg.onAccent',
      })}
    >
      <Bot size={18} />
    </span>
  );
}

// 봇 메시지 행 — 아바타 + 이름 + 버블 + 시간(좌측 정렬).
function BotRow({ text, time }: { text: string; time: string }) {
  return (
    <div
      className={css({ display: 'flex', gap: '2.5', alignItems: 'flex-start' })}
    >
      <BotAvatar />
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1',
          maxW: '80%',
        })}
      >
        <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
          {BRAND}
        </span>
        <div
          className={css({
            px: '3.5',
            py: '2.5',
            borderRadius: 'xl',
            borderTopLeftRadius: 'sm',
            fontSize: 'sm',
            lineHeight: 'snug',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            bg: 'bg.surfaceRaised',
            color: 'fg.default',
          })}
        >
          {text}
        </div>
        <span className={css({ fontSize: '2xs', color: 'fg.subtle' })}>
          {time}
        </span>
      </div>
    </div>
  );
}

// 유저 메시지 행 — 버블 + 시간 + 아바타(우측 정렬).
function UserRow({
  text,
  time,
  initials,
}: {
  text: string;
  time: string;
  initials: string;
}) {
  return (
    <div
      className={css({
        display: 'flex',
        gap: '2.5',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1',
          alignItems: 'flex-end',
          maxW: '80%',
        })}
      >
        <div
          className={css({
            px: '3.5',
            py: '2.5',
            borderRadius: 'xl',
            borderTopRightRadius: 'sm',
            fontSize: 'sm',
            lineHeight: 'snug',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            bg: 'accent.default',
            color: 'fg.onAccent',
          })}
        >
          {text}
        </div>
        <span className={css({ fontSize: '2xs', color: 'fg.subtle' })}>
          {time}
        </span>
      </div>
      <span
        aria-hidden="true"
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          w: '8',
          h: '8',
          borderRadius: 'full',
          bg: 'accent.soft',
          color: 'accent.fg',
          fontSize: '2xs',
          fontWeight: 'bold',
        })}
      >
        {initials}
      </span>
    </div>
  );
}

// 타이핑 인디케이터 — 봇 버블 안 점 3개.
function TypingRow() {
  return (
    <div
      className={css({ display: 'flex', gap: '2.5', alignItems: 'flex-start' })}
    >
      <BotAvatar />
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '1',
          px: '4',
          py: '3',
          borderRadius: 'xl',
          borderTopLeftRadius: 'sm',
          bg: 'bg.surfaceRaised',
        })}
      >
        {['d1', 'd2', 'd3'].map((d) => (
          <span
            key={d}
            className={css({
              w: '1.5',
              h: '1.5',
              borderRadius: 'full',
              bg: 'fg.subtle',
            })}
          />
        ))}
      </div>
    </div>
  );
}
