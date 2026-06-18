// 고객센터 챗봇 API 레이어 (CHATBOT-FE-002).
//   POST /api/v1/support/chat/messages (인증 필요) — ky가 Bearer 부착/401 refresh 전담.
//   mock 없이 실서버로 직결한다(MSW 미등록 → onUnhandledRequest:'bypass').
//   ⚠️ 응답은 SSE 스트림(text/event-stream)이다:
//        data: {"type":"delta","content":"..."}   (부분 텍스트, 여러 줄)
//        data: {"type":"final","answer":"...","session_id":"...", ...}
//        data: [DONE]
//      스트리밍 UI는 아직 없으므로 final.answer를 최종 답변으로 쓴다(없으면 delta 누적).
import { api } from '@/lib/ky';

export interface ChatReply {
  message: string;
  sessionId: string | null;
}

// SSE 이벤트 형태(delta=부분 텍스트, final=최종 답변·세션ID).
interface ChatEvent {
  type?: 'delta' | 'final';
  content?: string;
  answer?: string;
  session_id?: string | null;
}

const FALLBACK_REPLY =
  '죄송해요, 지금은 답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.';

// SSE 본문에서 `data:` 줄을 JSON 이벤트로 파싱한다([DONE]·비JSON 라인은 건너뜀).
function parseSseEvents(body: string): ChatEvent[] {
  const events: ChatEvent[] = [];
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const payload = trimmed.slice('data:'.length).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      events.push(JSON.parse(payload) as ChatEvent);
    } catch {
      // 형식이 안 맞는 라인은 무시한다.
    }
  }
  return events;
}

export async function sendChatMessage(params: {
  message: string;
  sessionId?: string | null;
}): Promise<ChatReply> {
  const body = await api
    .post('api/v1/support/chat/messages', {
      json: { message: params.message, session_id: params.sessionId ?? null },
    })
    .text();

  const events = parseSseEvents(body);
  const final = events.find((e) => e.type === 'final');
  const deltas = events
    .filter((e) => e.type === 'delta')
    .map((e) => e.content ?? '')
    .join('');
  const text = (final?.answer ?? deltas).trim();

  return {
    message: text || FALLBACK_REPLY,
    sessionId: final?.session_id ?? params.sessionId ?? null,
  };
}
