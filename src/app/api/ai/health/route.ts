import { NextResponse } from 'next/server';

// AI BFF 서버 자리. 1차엔 헬스체크만. 실제 파이프라인은 AI-FE-002(explain).
// Vercel AI SDK(Node API 의존)를 쓰므로 Edge가 아닌 Node 런타임을 명시한다.
export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ status: 'ok', service: 'ai' });
}
