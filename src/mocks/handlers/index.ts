import { http, HttpResponse } from 'msw';
import { authHandlers } from './auth';
import { gameHandlers } from './games';
import { mypageHandlers } from './mypage';

export const handlers = [
  http.get('/health', () => HttpResponse.json({ ok: true })),
  ...authHandlers,
  ...gameHandlers,
  ...mypageHandlers,
];
