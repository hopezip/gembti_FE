import { beforeEach, describe, expect, it, vi } from 'vitest';

// api.post(...)가 SSE body 스트림을 가진 Response를 반환하도록 모킹한다.
const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));
vi.mock('@/lib/ky', () => ({ api: { post: postMock } }));

import { sendChatMessage } from './chat';

// 문자열 청크 배열을 ReadableStream body로 감싼 Response-like 객체를 만든다.
//   청크 경계를 임의로 줄 수 있어 "줄 중간에서 끊긴" 스트림도 재현한다.
function sseResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  return {
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
  };
}

describe('sendChatMessage SSE 스트리밍 (CHATBOT-FE-004)', () => {
  beforeEach(() => postMock.mockReset());

  it('delta를 도착 순서대로 onDelta로 흘려보내고 final.answer·session_id를 확정한다', async () => {
    postMock.mockResolvedValue(
      sseResponse([
        'data: {"type": "delta", "content": "근거 문서에서 확인되지 않아 일반 안내만 제공할 수 있어요."}\n\n',
        'data: {"type": "delta", "content": " 질문을 조금 더 구체적으로 바꿔 주세요."}\n\n',
        'data: {"session_id": "044798eb-1ef9-41fe-80af-a7a7e1ec97e0", "answer": "근거 문서에서 확인되지 않아 일반 안내만 제공할 수 있어요. 질문을 조금 더 구체적으로 바꿔 주세요.", "type": "final"}\n\n',
        'data: [DONE]\n',
      ]),
    );

    const onDelta = vi.fn();
    const reply = await sendChatMessage({ message: '안녕' }, onDelta);

    expect(onDelta.mock.calls.map((c) => c[0])).toEqual([
      '근거 문서에서 확인되지 않아 일반 안내만 제공할 수 있어요.',
      ' 질문을 조금 더 구체적으로 바꿔 주세요.',
    ]);
    expect(reply.message).toBe(
      '근거 문서에서 확인되지 않아 일반 안내만 제공할 수 있어요. 질문을 조금 더 구체적으로 바꿔 주세요.',
    );
    expect(reply.sessionId).toBe('044798eb-1ef9-41fe-80af-a7a7e1ec97e0');
  });

  it('청크가 줄 중간에서 끊겨도 정확히 파싱한다(버퍼링)', async () => {
    postMock.mockResolvedValue(
      sseResponse([
        'data: {"type":"del',
        'ta","content":"안녕"}\ndata: {"type":"delta","content":"하',
        '세요"}\ndata: [DONE]\n',
      ]),
    );

    const onDelta = vi.fn();
    const reply = await sendChatMessage(
      { message: 'hi', sessionId: 's1' },
      onDelta,
    );

    expect(onDelta.mock.calls.map((c) => c[0])).toEqual(['안녕', '하세요']);
    // final이 없으면 누적 delta를 쓰고 기존 세션ID를 유지한다.
    expect(reply.message).toBe('안녕하세요');
    expect(reply.sessionId).toBe('s1');
  });

  it('답변이 비면 폴백 문구를 반환한다', async () => {
    postMock.mockResolvedValue(sseResponse(['data: [DONE]\n']));

    const reply = await sendChatMessage({ message: 'hi' });

    expect(reply.message).toContain('답변을 가져오지 못했어요');
    expect(reply.sessionId).toBeNull();
  });
});
