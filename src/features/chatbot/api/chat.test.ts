import { beforeEach, describe, expect, it, vi } from 'vitest';

// api.post(...).text()가 SSE 본문을 반환하도록 모킹한다.
const { textMock } = vi.hoisted(() => ({ textMock: vi.fn() }));
vi.mock('@/lib/ky', () => ({
  api: { post: vi.fn(() => ({ text: textMock })) },
}));

import { sendChatMessage } from './chat';

describe('sendChatMessage SSE 파싱 (CHATBOT-FE-002)', () => {
  beforeEach(() => textMock.mockReset());

  it('SSE 스트림에서 final.answer와 session_id를 추출한다', async () => {
    const body = [
      'data: {"type": "delta", "content": "근거 문서에서 확인되지 않아 일반 안내만 제공할 수 있어요."}',
      '',
      'data: {"type": "delta", "content": " 질문을 조금 더 구체적으로 바꾸거나 운영팀에 문의해 주세요."}',
      '',
      'data: {"session_id": "044798eb-1ef9-41fe-80af-a7a7e1ec97e0", "answer": "근거 문서에서 확인되지 않아 일반 안내만 제공할 수 있어요. 질문을 조금 더 구체적으로 바꾸거나 운영팀에 문의해 주세요.", "citations": [], "fallback_used": true, "session_expired": false, "type": "final"}',
      '',
      'data: [DONE]',
      '',
    ].join('\n');
    textMock.mockResolvedValue(body);

    const reply = await sendChatMessage({ message: '안녕' });

    expect(reply.message).toBe(
      '근거 문서에서 확인되지 않아 일반 안내만 제공할 수 있어요. 질문을 조금 더 구체적으로 바꾸거나 운영팀에 문의해 주세요.',
    );
    expect(reply.sessionId).toBe('044798eb-1ef9-41fe-80af-a7a7e1ec97e0');
  });

  it('final이 없으면 delta를 누적하고 기존 세션ID를 유지한다', async () => {
    const body = [
      'data: {"type":"delta","content":"안녕"}',
      'data: {"type":"delta","content":"하세요"}',
      'data: [DONE]',
    ].join('\n');
    textMock.mockResolvedValue(body);

    const reply = await sendChatMessage({ message: 'hi', sessionId: 's1' });

    expect(reply.message).toBe('안녕하세요');
    expect(reply.sessionId).toBe('s1');
  });

  it('답변이 비면 폴백 문구를 반환한다', async () => {
    textMock.mockResolvedValue('data: [DONE]\n');

    const reply = await sendChatMessage({ message: 'hi' });

    expect(reply.message).toContain('답변을 가져오지 못했어요');
    expect(reply.sessionId).toBeNull();
  });
});
