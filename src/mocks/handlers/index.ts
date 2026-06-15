import { http, HttpResponse } from 'msw';
import { gameHandlers } from './games';
import { mypageHandlers } from './mypage';
import { recommendationHandlers } from './recommendations';
import { steamHandlers } from './steam';

// MSW 핸들러 레지스트리.
// ⚠️ LOGIN-FE-006: /api/v1/auth/* 는 실서버(gembti.cloud)로 passthrough 한다(여기 미등록).
//   onUnhandledRequest:'bypass'(enableMocking.ts)라 미등록 auth 요청은 실서버로 직결된다.
//   survey는 실서버 API를 사용하고, steam/games/home 등은 필요한 동안 mock으로 둔다.
//   mock 핸들러 패턴이 `*/...`라 prefix가 바뀌어도 등록된 도메인은 가로챈다.
export const handlers = [
  http.get('/health', () => HttpResponse.json({ ok: true })),
  // recommendationHandlers는 gameHandlers의 */api/v1/games/:id 보다 먼저 등록해야
  // games/popular 가 :id 핸들러에 가로채이지 않는다.
  ...recommendationHandlers,
  ...gameHandlers,
  ...mypageHandlers,
  ...steamHandlers,
];
