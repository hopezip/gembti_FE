import { NextResponse } from 'next/server';

// LangChain 서버 자리. 1차엔 헬스체크만. 실제 체인 연결은 후속 티켓.
// LangChain은 Node API에 의존하므로 Edge가 아닌 Node 런타임을 명시한다.
export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ status: 'ok', service: 'ai' });
}
