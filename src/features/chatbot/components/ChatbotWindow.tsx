import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMutation } from '@tanstack/react-query';
import {
  BarChart3,
  ClipboardList,
  ExternalLink,
  Link2,
  LogIn,
  type LucideIcon,
  Send,
  Star,
  X,
} from 'lucide-react';
import { css } from 'styled-system/css';
import mascot from '@/assets/chatbot-mascot.png';
import { sendChatMessage } from '@/features/chatbot/api/chat';

// 챗봇 팝오버 대화 UI (CHATBOT-FE-002).
//   순수 프리젠테이션 + 로컬 대화 상태. 세션ID는 첫 응답값을 보관해 이후 요청에 재전송한다.
//   다른 도메인을 import하지 않는다(chatbot 격리).
//   리치 메시지(progress/cards/price)는 시안 UI를 위한 프리젠테이션 컴포넌트다 — 실 백엔드가
//   구조화 응답을 줄 때 채워진다. 현재 실 대화는 text만 오고, 데모(프리뷰)는 initialMessages로 주입한다.

const BRAND = 'GAMBIT AI';
const BRAND_SUB = '게임 추천 AI 어시스턴트';
const MAX_LEN = 100;

// 사용자가 자주 묻는 가이드성 항목으로 구성(클릭 시 해당 질문을 챗봇에 전송).
//   칩별 아이콘은 시안에 맞춰 색을 다르게 한다(정적 css 클래스 — Panda 추출용).
const SUGGESTIONS: { icon: LucideIcon; label: string; iconClass: string }[] = [
  {
    icon: LogIn,
    label: '로그인 방법',
    iconClass: css({ color: 'fg.default' }),
  },
  {
    icon: Link2,
    label: 'Steam 연동 방법',
    iconClass: css({ color: 'accent.default' }),
  },
  {
    icon: BarChart3,
    label: '성향 분석',
    iconClass: css({ color: 'danger.fg' }),
  },
  {
    icon: ClipboardList,
    label: '설문 방법',
    iconClass: css({ color: 'warning.fg' }),
  },
];

export interface GameCardData {
  badge: string;
  title: string;
  genres: string;
  rating: string;
}
export interface PriceData {
  discount: string;
  original: string;
  sale: string;
}

export type ChatMessage =
  | { id: number; role: 'user' | 'bot'; kind: 'text'; text: string }
  | { id: number; role: 'bot'; kind: 'chips' }
  | { id: number; role: 'bot'; kind: 'progress'; text: string; percent: number }
  | { id: number; role: 'bot'; kind: 'cards'; cards: GameCardData[] }
  | { id: number; role: 'bot'; kind: 'price'; text: string; price: PriceData };

interface Props {
  onClose: () => void;
  /** 유저 아바타 이니셜 표시용(로그인 닉네임). */
  userName: string;
  /** 데모/프리뷰용 초기 대화 주입(미지정 시 인사말 + 추천칩). */
  initialMessages?: ChatMessage[];
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 0,
    role: 'bot',
    kind: 'text',
    text: '안녕하세요! GAMBIT AI예요. 어떤 게임을 찾고 계신가요?',
  },
  { id: 1, role: 'bot', kind: 'chips' },
];

export function ChatbotWindow({ onClose, userName, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? DEFAULT_MESSAGES,
  );
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const nextId = useRef(1000);
  // 현재 스트리밍 중인 봇 메시지 id(첫 delta에서 생성, 완료/실패 시 null로 리셋).
  const streamingId = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const initials = (userName.trim().slice(0, 2) || '나').toUpperCase();

  const mutation = useMutation({
    mutationFn: (message: string) => {
      streamingId.current = null;
      return sendChatMessage({ message, sessionId }, handleDelta);
    },
    onSuccess: (reply) => {
      setSessionId(reply.sessionId);
      // 스트리밍으로 만든 버블이 있으면 최종 확정 텍스트(final.answer)로 교체, 없으면 새 버블.
      if (streamingId.current !== null) {
        setBotText(streamingId.current, reply.message);
      } else {
        appendText('bot', reply.message);
      }
      streamingId.current = null;
    },
    onError: () => {
      const errorText = '전송에 실패했어요. 잠시 후 다시 시도해주세요.';
      if (streamingId.current !== null) {
        setBotText(streamingId.current, errorText);
      } else {
        appendText('bot', errorText);
      }
      streamingId.current = null;
    },
  });

  // delta 도착 — 첫 조각이면 새 봇 버블을 만들고, 이후엔 그 버블에 이어붙인다.
  //   flushSync로 감싸 매 delta를 즉시 커밋한다. 스트림 읽기 루프는 read()가 버퍼된 데이터를
  //   즉시 반환하는 구간에서 setState가 React 18 자동 배칭으로 한 번에 묶여(= 타이핑이 뭉텅이로
  //   보임) 버리므로, 배칭을 깨 도착 즉시 한 글자씩 반영되게 한다.
  function handleDelta(chunk: string) {
    flushSync(() => {
      if (streamingId.current === null) {
        const id = nextId.current++;
        streamingId.current = id;
        setMessages((prev) => [
          ...prev,
          { id, role: 'bot', kind: 'text', text: chunk },
        ]);
      } else {
        const id = streamingId.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id && m.kind === 'text'
              ? { ...m, text: m.text + chunk }
              : m,
          ),
        );
      }
    });
  }

  // 특정 봇 텍스트 메시지의 본문을 통째로 교체(최종 확정·에러 표시용).
  function setBotText(id: number, text: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.kind === 'text' ? { ...m, text } : m)),
    );
  }

  function appendText(role: 'user' | 'bot', text: string) {
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role, kind: 'text', text },
    ]);
  }

  function send(text: string) {
    const t = text.trim();
    if (!t || mutation.isPending) return;
    appendText('user', t);
    setInput('');
    mutation.mutate(t);
  }

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
      aria-label="GAMBIT AI 챗봇 대화창"
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
      {/* 헤더 */}
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
        <Mascot size="md" />
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
          <p className={css({ fontSize: '2xs', color: 'accent.hover' })}>
            {BRAND_SUB}
          </p>
        </div>
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
          // 스크롤바는 숨기되 마우스 휠 스크롤은 유지한다.
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          px: '4',
          py: '4',
          display: 'flex',
          flexDirection: 'column',
          gap: '4',
        })}
      >
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

        {messages.map((m) => (
          <MessageRow
            key={m.id}
            message={m}
            initials={initials}
            onChip={send}
            chipsDisabled={mutation.isPending}
          />
        ))}

        {/* 첫 delta가 오기 전까지만 타이핑 점 표시(이후엔 실시간으로 채워지는 버블이 대신함). */}
        {mutation.isPending && streamingId.current === null && <TypingRow />}
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
              pr: '12',
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

// 로봇 마스코트 아바타(에셋 이미지).
function Mascot({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? '9' : '8';
  return (
    <img
      src={mascot}
      alt=""
      aria-hidden="true"
      className={css({
        flexShrink: 0,
        w: dim,
        h: dim,
        borderRadius: 'lg',
        objectFit: 'cover',
      })}
    />
  );
}

// 메시지 1건 — 종류별 렌더.
function MessageRow({
  message,
  initials,
  onChip,
  chipsDisabled,
}: {
  message: ChatMessage;
  initials: string;
  onChip: (label: string) => void;
  chipsDisabled: boolean;
}) {
  if (message.role === 'user') {
    return (
      <UserRow
        text={message.kind === 'text' ? message.text : ''}
        initials={initials}
      />
    );
  }

  // 봇: 아바타 + 콘텐츠
  let content: React.ReactNode = null;
  if (message.kind === 'text') content = <Bubble text={message.text} />;
  else if (message.kind === 'chips')
    content = <Chips onPick={onChip} disabled={chipsDisabled} />;
  else if (message.kind === 'progress')
    content = <ProgressBubble text={message.text} percent={message.percent} />;
  else if (message.kind === 'cards')
    content = <GameCards cards={message.cards} />;
  else if (message.kind === 'price')
    content = <PriceBubble text={message.text} price={message.price} />;

  return (
    <div
      className={css({ display: 'flex', gap: '2.5', alignItems: 'flex-start' })}
    >
      <Mascot />
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5',
          maxW: '85%',
          minW: 0,
        })}
      >
        <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
          {BRAND}
        </span>
        {content}
      </div>
    </div>
  );
}

// 봇 텍스트 버블 — 응답을 마크다운으로 렌더(굵게/리스트/링크/코드블럭/줄바꿈).
function Bubble({ text }: { text: string }) {
  return (
    <div
      className={css({
        px: '3.5',
        py: '2.5',
        borderRadius: 'xl',
        borderTopLeftRadius: 'sm',
        wordBreak: 'break-word',
        bg: 'bg.surfaceRaised',
        color: 'fg.default',
      })}
    >
      <Markdown text={text} />
    </div>
  );
}

// 링크만 새 탭으로 안전하게 열도록 덮어쓰고, 나머지 스타일은 mdRootCss의 자식 선택자로 처리한다.
const mdComponents: Components = {
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

function Markdown({ text }: { text: string }) {
  return (
    <div className={mdRootCss}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

// 마크다운 산출 HTML을 챗 버블 톤(작은 폰트·다크)에 맞춰 스타일링. 단일 줄바꿈 보존은 p/li의 pre-wrap.
const mdRootCss = css({
  fontSize: 'sm',
  lineHeight: 'snug',
  color: 'fg.default',
  '& p': { whiteSpace: 'pre-wrap' },
  '& p:not(:last-child)': { mb: '2' },
  '& ul, & ol': { pl: '5', my: '1' },
  '& ul': { listStyleType: 'disc' },
  '& ol': { listStyleType: 'decimal' },
  '& li': { whiteSpace: 'pre-wrap', mb: '0.5' },
  '& a': { color: 'accent.fg', textDecoration: 'underline' },
  '& strong': { fontWeight: 'bold' },
  '& em': { fontStyle: 'italic' },
  '& code': {
    fontFamily: 'monospace',
    fontSize: '0.85em',
    bg: 'bg.canvas',
    px: '1',
    py: '0.5',
    borderRadius: 'sm',
  },
  '& pre': {
    my: '2',
    p: '3',
    bg: 'bg.canvas',
    borderRadius: 'md',
    overflowX: 'auto',
  },
  '& pre code': { p: '0', bg: 'transparent', fontSize: 'xs' },
  '& h1, & h2, & h3': { fontWeight: 'bold', my: '1' },
  '& blockquote': {
    borderLeft: '2px solid',
    borderColor: 'border.default',
    pl: '3',
    color: 'fg.muted',
  },
});

function Chips({
  onPick,
  disabled,
}: {
  onPick: (label: string) => void;
  disabled: boolean;
}) {
  return (
    <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
      {SUGGESTIONS.map(({ icon: Icon, label, iconClass }) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(label)}
          disabled={disabled}
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
            _hover: { borderColor: 'accent.default', color: 'fg.default' },
            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
          })}
        >
          <Icon size={13} aria-hidden="true" className={iconClass} />
          {label}
        </button>
      ))}
    </div>
  );
}

function ProgressBubble({ text, percent }: { text: string; percent: number }) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '2',
        px: '3.5',
        py: '3',
        borderRadius: 'xl',
        borderTopLeftRadius: 'sm',
        bg: 'bg.surfaceRaised',
        minW: '60',
      })}
    >
      <span
        className={css({
          fontSize: 'sm',
          lineHeight: 'snug',
          color: 'fg.default',
          whiteSpace: 'pre-wrap',
        })}
      >
        {text}
      </span>
      <div
        className={css({
          h: '1.5',
          borderRadius: 'full',
          bg: 'bg.canvas',
          overflow: 'hidden',
        })}
      >
        <div
          className={css({
            h: 'full',
            borderRadius: 'full',
            bg: 'accent.default',
          })}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={css({
          alignSelf: 'flex-end',
          fontSize: 'xs',
          fontWeight: 'bold',
          color: 'accent.hover',
        })}
      >
        {percent}%
      </span>
    </div>
  );
}

function GameCards({ cards }: { cards: GameCardData[] }) {
  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2',
      })}
    >
      {cards.map((c) => (
        <div
          key={c.title}
          className={css({
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 'lg',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'border.default',
            bg: 'bg.surfaceRaised',
          })}
        >
          {/* 표지(플레이스홀더 — 실제 커버아트는 백엔드 데이터 필요) */}
          <div
            className={css({
              position: 'relative',
              aspectRatio: '16/10',
              bgGradient: 'to-br',
              gradientFrom: 'gray.700',
              gradientTo: 'gray.900',
            })}
          >
            <span
              className={css({
                position: 'absolute',
                top: '1.5',
                left: '1.5',
                px: '1.5',
                py: '0.5',
                borderRadius: 'sm',
                bg: 'accent.default',
                color: 'fg.onAccent',
                fontSize: '2xs',
                fontWeight: 'bold',
              })}
            >
              {c.badge}
            </span>
          </div>
          <div
            className={css({
              p: '2',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5',
            })}
          >
            <span
              className={css({
                fontSize: 'xs',
                fontWeight: 'bold',
                color: 'fg.default',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              })}
            >
              {c.title}
            </span>
            <span className={css({ fontSize: '2xs', color: 'fg.subtle' })}>
              {c.genres}
            </span>
            <span
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1',
                fontSize: '2xs',
                color: 'warning.fg',
                fontWeight: 'semibold',
              })}
            >
              <Star size={11} fill="currentColor" aria-hidden="true" />
              {c.rating}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PriceBubble({ text, price }: { text: string; price: PriceData }) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '2',
        px: '3.5',
        py: '3',
        borderRadius: 'xl',
        borderTopLeftRadius: 'sm',
        bg: 'bg.surfaceRaised',
      })}
    >
      <span className={css({ fontSize: 'sm', color: 'fg.default' })}>
        {text}
      </span>
      <div
        className={css({ display: 'flex', alignItems: 'baseline', gap: '2' })}
      >
        <span
          className={css({
            fontSize: 'sm',
            fontWeight: 'bold',
            color: 'success.fg',
          })}
        >
          {price.discount}
        </span>
        <span
          className={css({
            fontSize: 'xs',
            color: 'fg.subtle',
            textDecoration: 'line-through',
          })}
        >
          {price.original}
        </span>
        <span
          className={css({
            fontSize: 'sm',
            fontWeight: 'bold',
            color: 'fg.default',
          })}
        >
          {price.sale}
        </span>
      </div>
      <button
        type="button"
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5',
          px: '3',
          py: '2',
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'accent.default',
          color: 'accent.fg',
          fontSize: 'xs',
          fontWeight: 'semibold',
          cursor: 'pointer',
          _hover: { bg: 'accent.soft' },
        })}
      >
        Steam 페이지 보기
        <ExternalLink size={13} aria-hidden="true" />
      </button>
    </div>
  );
}

function UserRow({ text, initials }: { text: string; initials: string }) {
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
          px: '3.5',
          py: '2.5',
          borderRadius: 'xl',
          borderTopRightRadius: 'sm',
          fontSize: 'sm',
          lineHeight: 'snug',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxW: '80%',
          bg: 'accent.default',
          color: 'fg.onAccent',
        })}
      >
        {text}
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

function TypingRow() {
  return (
    <div
      className={css({ display: 'flex', gap: '2.5', alignItems: 'flex-start' })}
    >
      <Mascot />
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
