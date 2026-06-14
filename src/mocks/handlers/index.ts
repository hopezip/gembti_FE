import { http, HttpResponse } from 'msw';
import { gameHandlers } from './games';
import { mypageHandlers } from './mypage';
import { recommendationHandlers } from './recommendations';
import { steamHandlers } from './steam';
import { surveyHandlers } from './survey';

// MSW 핸들러 레지스트리.
// ⚠️ LOGIN-FE-006: /api/v1/auth/* 는 실서버(gembti.cloud)로 passthrough 한다(여기 미등록).
//   onUnhandledRequest:'bypass'(enableMocking.ts)라 미등록 auth 요청은 실서버로 직결된다.
//   steam/games/home은 백엔드 엔드포인트가 없어 계속 mock으로 둔다(패턴이 `*/...`라 prefix가 바뀌어도 가로챔).
export const handlers = [
  http.get('/health', () => HttpResponse.json({ ok: true })),
  // recommendationHandlers는 gameHandlers의 */api/v1/games/:id 보다 먼저 등록해야
  // games/popular 가 :id 핸들러에 가로채이지 않는다.
  ...recommendationHandlers,
  ...gameHandlers,
  ...mypageHandlers,
  ...steamHandlers,
  ...surveyHandlers,
];
