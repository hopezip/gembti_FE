// 고객센터 챗봇 API 레이어 (CHATBOT-FE-002).
//   POST /api/v1/support/chat/messages (인증 필요) — ky가 Bearer 부착/401 refresh 전담.
//   ⚠️ 스웨거 응답 200 본문이 `{}`로 미정의라 봇 답변 형태가 불명확하다.
//      message/reply/answer 등 흔한 키를 관대하게 탐색하고, 비면 폴백 문구를 쓴다.
//      백엔드가 응답 스키마를 확정하면 이 파싱을 교체한다.
import { api } from '@/lib/ky';

export interface ChatReply {
  message: string;
  sessionId: string | null;
}

// 응답 후보 형태(미확정). 흔한 키를 모두 optional로 둔다.
interface SupportChatRaw {
  message?: string;
  reply?: string;
  answer?: string;
  content?: string;
  session_id?: string | null;
}

const FALLBACK_REPLY =
  '죄송해요, 지금은 답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.';

export async function sendChatMessage(params: {
  message: string;
  sessionId?: string | null;
}): Promise<ChatReply> {
  const raw = await api
    .post('api/v1/support/chat/messages', {
      json: { message: params.message, session_id: params.sessionId ?? null },
    })
    .json<SupportChatRaw>();

  const text = raw.message ?? raw.reply ?? raw.answer ?? raw.content ?? '';
  return {
    message: text.trim() || FALLBACK_REPLY,
    sessionId: raw.session_id ?? params.sessionId ?? null,
  };
}
