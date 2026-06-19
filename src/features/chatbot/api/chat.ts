// 고객센터 챗봇 API 레이어 (CHATBOT-FE-004 SSE 실시간 스트리밍).
//   POST /api/v1/support/chat/messages (인증 필요) — ky가 Bearer 부착/401 refresh 전담.
//   mock 없이 실서버로 직결한다(MSW 미등록 → onUnhandledRequest:'bypass').
//   ⚠️ 응답은 SSE 스트림(text/event-stream)이다:
//        data: {"type":"delta","content":"..."}   (부분 텍스트, 여러 번)
//        data: {"type":"final","answer":"...","session_id":"...", ...}
//        data: [DONE]
//      .text()로 끝까지 모아 한 번에 파싱하지 않는다 — body 스트림을 읽으며 delta가 도착하는 대로
//      onDelta로 흘려보내 UI가 실시간 append 하도록 한다. final.answer가 오면 최종 답변으로 확정한다
//      (없으면 누적 delta).
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

// SSE 한 줄(`data: ...`)을 ChatEvent로 파싱한다([DONE]·비JSON·data 아닌 줄은 null).
function parseSseLine(line: string): ChatEvent | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  const payload = trimmed.slice('data:'.length).trim();
  if (!payload || payload === '[DONE]') return null;
  try {
    return JSON.parse(payload) as ChatEvent;
  } catch {
    // 형식이 안 맞는 라인은 무시한다.
    return null;
  }
}

// 챗봇 메시지 전송. onDelta가 있으면 delta.content를 도착 순서대로 콜백한다(실시간 append용).
//   반환값 message는 최종 확정 답변(final.answer 우선, 없으면 누적 delta)이라 호출부가 버블을 확정한다.
export async function sendChatMessage(
  params: {
    message: string;
    sessionId?: string | null;
  },
  onDelta?: (chunk: string) => void,
): Promise<ChatReply> {
  // .text()/.json()을 호출하지 않으면 ky는 Response를 그대로 준다 → body 스트림을 직접 읽는다.
  //   timeout:false — 스트리밍 응답은 ky 기본 타임아웃(10s)보다 길 수 있다.
  const response = await api.post('api/v1/support/chat/messages', {
    json: { message: params.message, session_id: params.sessionId ?? null },
    timeout: false,
  });

  let finalEvent: ChatEvent | undefined;
  let deltas = '';

  function handleLine(line: string) {
    const event = parseSseLine(line);
    if (!event) return;
    if (event.type === 'final') {
      finalEvent = event;
    } else if (event.type === 'delta') {
      const chunk = event.content ?? '';
      if (chunk) {
        deltas += chunk;
        onDelta?.(chunk);
      }
    }
  }

  const reader = response.body?.getReader();
  if (reader) {
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // 줄 단위로 끊어 처리하고, 마지막 미완성 줄은 버퍼에 남긴다.
      let idx = buffer.indexOf('\n');
      while (idx !== -1) {
        handleLine(buffer.slice(0, idx));
        buffer = buffer.slice(idx + 1);
        idx = buffer.indexOf('\n');
      }
    }
    buffer += decoder.decode();
    if (buffer) handleLine(buffer);
  }

  const text = (finalEvent?.answer ?? deltas).trim();
  return {
    message: text || FALLBACK_REPLY,
    sessionId: finalEvent?.session_id ?? params.sessionId ?? null,
  };
}
