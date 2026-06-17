import { http, HttpResponse } from 'msw';

// 고객센터 챗봇 mock 핸들러 (CHATBOT-FE-002).
//   실 엔드포인트(POST /api/v1/support/chat/messages)는 존재하나 응답 본문 스키마가 미정의라,
//   로컬 개발/데모용으로 그럴듯한 봇 응답을 돌려준다(백엔드 확정 시 제거하고 실서버 passthrough).
//   응답 형태는 MessageResponse({ message })를 따른다.

const CANNED_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['스팀', 'steam', '연동'],
    reply:
      '스팀 연동은 마이페이지 > Steam 연동에서 진행할 수 있어요. 프로필이 비공개면 라이브러리를 가져오지 못할 수 있어요.',
  },
  {
    keywords: ['추천', '게임'],
    reply:
      'GamBTI는 설문과 스팀 데이터를 바탕으로 게임을 추천해드려요. 홈에서 맞춤 추천을 확인해보세요!',
  },
  {
    keywords: ['탈퇴', '회원탈퇴'],
    reply: '회원 탈퇴는 마이페이지 하단에서 진행하실 수 있어요.',
  },
];

function pickReply(message: string): string {
  const lower = message.toLowerCase();
  const hit = CANNED_REPLIES.find((r) =>
    r.keywords.some((k) => lower.includes(k.toLowerCase())),
  );
  return (
    hit?.reply ??
    '문의해주셔서 감사해요! 더 자세한 도움이 필요하시면 무엇이 궁금한지 조금 더 알려주세요. 😊'
  );
}

export const chatbotHandlers = [
  http.post('*/api/v1/support/chat/messages', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      message?: string;
      session_id?: string | null;
    };
    return HttpResponse.json({
      message: pickReply(body.message ?? ''),
      session_id: body.session_id ?? 'mock-session',
    });
  }),
];
