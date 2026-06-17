import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  BarChart3,
  Bot,
  Library,
  type LucideIcon,
  Minus,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { css } from 'styled-system/css';
import { sendChatMessage } from '@/features/chatbot/api/chat';

// 챗봇 팝오버 대화 UI (CHATBOT-FE-002).
//   순수 프리젠테이션 + 로컬 대화 상태. 세션ID는 첫 응답값을 보관해 이후 요청에 재전송한다.
//   다른 도메인을 import하지 않는다(chatbot 격리).

const BRAND = 'GamBTI AI';
const BRAND_SUB = '게임 추천 AI 어시스턴트';
const MAX_LEN = 500;

// 첫 대화에서 보여줄 빠른 추천 칩 — 클릭 시 해당 문구를 그대로 전송한다.
const SUGGESTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: Search, label: '장르 추천' },
  { icon: BarChart3, label: '성향 분석' },
  { icon: Sparkles, label: '탐험' },
  { icon: Library, label: '내 라이브러리' },
];

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
      text: '안녕하세요! GamBTI AI예요. 어떤 게임을 찾고 계신가요?',
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  const initials = (userName.trim().slice(0, 2) || '나').toUpperCase();
  const hasUserMessage = messages.some((m) => m.role === 'user');

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

  // 유저 메시지를 전송한다(폼 제출·추천 칩 공용).
  function send(text: string) {
    const t = text.trim();
    if (!t || mutation.isPending) return;
    appendMessage('user', t);
    setInput('');
    mutation.mutate(t);
  }

  // 새 메시지가 추가되면 목록 맨 아래로 스크롤한다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages 변경을 트리거로 스크롤한다(본문은 ref만 읽음).
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
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
        w: '400px',
        maxW: 'calc(100vw - 32px)',
        h: '620px',
        maxH: 'calc(100vh - 120px)',
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: '2xl',
        boxShadow: 'xl',
        overflow: 'hidden',
      })}
    >
      {/* 헤더 — 아바타 + 브랜드/부제 + 최소화/닫기 */}
      <header
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2.5',
          px: '4',
          py: '3',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          bg: 'bg.surfaceRaised',
        })}
      >
        <BotAvatar size="md" />
        <div className={css({ flex: 1, minW: 0 })}>
          <p
            className={css({
              fontSize: 'sm',
              fontWeight: 'bold',
              color: 'fg.default',
              lineHeight: 'tight',
            })}
          >
            {BRAND}
          </p>
          <p className={css({ fontSize: '2xs', color: 'fg.subtle' })}>
            {BRAND_SUB}
          </p>
        </div>
        <button
          type="button"
          aria-label="챗봇 최소화"
          onClick={onClose}
          className={iconBtnCss}
        >
          <Minus size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="챗봇 닫기"
          onClick={onClose}
          className={iconBtnCss}
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
        {/* 날짜 구분선(알약) */}
        <div className={css({ display: 'flex', justifyContent: 'center' })}>
          <span
            className={css({
              px: '3',
              py: '0.5',
              borderRadius: 'full',
              bg: 'bg.surfaceRaised',
              fontSize: '2xs',
              color: 'fg.subtle',
            })}
          >
            오늘
          </span>
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

        {/* 빠른 추천 칩 — 아직 유저 발화 전일 때만 */}
        {!hasUserMessage && (
          <div
            className={css({
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2',
              pl: '10', // 봇 아바타 폭만큼 들여쓰기
            })}
          >
            {SUGGESTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => send(label)}
                disabled={mutation.isPending}
                className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1.5',
                  px: '3',
                  py: '1.5',
                  borderRadius: 'full',
                  border: '1px solid',
                  borderColor: 'border.default',
                  bg: 'bg.surfaceRaised',
                  fontSize: 'xs',
                  color: 'fg.muted',
                  cursor: 'pointer',
                  _hover: {
                    borderColor: 'accent.default',
                    color: 'fg.default',
                  },
                  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
                })}
              >
                <Icon size={13} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
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
        <div className={css({ position: 'relative', flex: 1, minW: 0 })}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_LEN}
            placeholder="메시지를 입력하세요…"
            aria-label="메시지 입력"
            // biome-ignore lint/a11y/noAutofocus: 대화창을 열면 바로 입력 가능해야 한다.
            autoFocus
            className={css({
              w: 'full',
              pl: '4',
              pr: '12', // 글자수 카운터 자리
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
          <span
            aria-hidden="true"
            className={css({
              position: 'absolute',
              right: '3',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '2xs',
              color: 'fg.subtle',
              pointerEvents: 'none',
            })}
          >
            {input.length}/{MAX_LEN}
          </span>
        </div>
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

const iconBtnCss = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  w: '7',
  h: '7',
  borderRadius: 'md',
  color: 'fg.subtle',
  cursor: 'pointer',
  _hover: { bg: 'bg.canvas', color: 'fg.default' },
});

// 봇 아바타(주황 원형 + 로봇 로고).
function BotAvatar({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? '9' : '8';
  const icon = size === 'md' ? 20 : 18;
  return (
    <span
      aria-hidden="true"
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        w: dim,
        h: dim,
        borderRadius: 'full',
        bg: 'accent.default',
        color: 'fg.onAccent',
      })}
    >
      <Bot size={icon} />
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
